/**
 * EcoSphere RPC Proxy — Cloudflare Worker
 *
 * Cache la clé API du provider RPC (Alchemy/Infura/QuickNode) côté serveur.
 * Le frontend appelle ce Worker au lieu d'appeler directement le provider,
 * donc la clé API n'apparaît jamais dans le bundle JS / devtools du navigateur.
 *
 * ⚠️ Ce proxy protège la clé du PROVIDER RPC, pas les clés privées wallet.
 * Les transactions signées par l'utilisateur (staking, mint...) sont signées
 * localement dans son wallet (MetaMask/wagmi) et transitent en clair via ce
 * proxy comme elles le feraient via n'importe quel RPC public — c'est normal
 * et sans risque, une tx signée ne révèle jamais la clé privée.
 *
 * Secrets à définir via `wrangler secret put` (jamais dans wrangler.toml) :
 *   - RPC_URL_AMOY
 *   - RPC_URL_POLYGON
 *
 * Variables (wrangler.toml, non secrètes) :
 *   - ALLOWED_ORIGINS (CSV des domaines autorisés en CORS)
 */

// Méthodes JSON-RPC autorisées à traverser le proxy.
// Bloque volontairement les méthodes d'administration / debug du provider.
const ALLOWED_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_getTransactionCount",
  "eth_getTransactionReceipt",
  "eth_getTransactionByHash",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_sendRawTransaction", // tx déjà signée côté client — safe à relayer
  "eth_getLogs",
  "eth_getCode",
  "net_version",
]);

// Limite simple de débit par IP (protection anti-abus du proxy, pas anti-DDoS avancé).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

function corsHeaders(origin, allowedOrigins) {
  const isAllowed = allowedOrigins.includes("*") || allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

async function checkRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV) return true; // KV optionnel — voir README du worker

  const key = `rl:${ip}`;
  const record = await env.RATE_LIMIT_KV.get(key, "json");
  const now = Date.now();

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ windowStart: now, count: 1 }), {
      expirationTtl: 120,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await env.RATE_LIMIT_KV.put(
    key,
    JSON.stringify({ windowStart: record.windowStart, count: record.count + 1 }),
    { expirationTtl: 120 }
  );
  return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
    const headers = corsHeaders(origin, allowedOrigins);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const allowed = await checkRateLimit(env, ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const network = url.pathname.replace("/", "") || "polygon"; // /amoy ou /polygon

    const upstreamUrl = network === "amoy" ? env.RPC_URL_AMOY : env.RPC_URL_POLYGON;
    if (!upstreamUrl) {
      return new Response(JSON.stringify({ error: "Unknown network: " + network }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Supporte les requêtes batch (array) et simples (object)
    const requests = Array.isArray(body) ? body : [body];
    for (const req of requests) {
      if (!req.method || !ALLOWED_METHODS.has(req.method)) {
        return new Response(
          JSON.stringify({ error: `Method not allowed: ${req.method || "undefined"}` }),
          { status: 403, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseBody = await upstreamResponse.text();

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  },
};
