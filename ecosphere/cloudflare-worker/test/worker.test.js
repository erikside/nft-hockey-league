import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../src/index.js";

function makeEnv(overrides = {}) {
  return {
    RPC_URL_POLYGON: "https://fake-provider.example/polygon/SECRET_KEY",
    RPC_URL_AMOY: "https://fake-provider.example/amoy/SECRET_KEY",
    ALLOWED_ORIGINS: "https://ecosphere.io,http://localhost:3000",
    ...overrides,
  };
}

describe("EcoSphere RPC Proxy Worker", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "0x1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("répond aux requêtes OPTIONS (CORS preflight)", async () => {
    const req = new Request("https://proxy.example/polygon", {
      method: "OPTIONS",
      headers: { Origin: "https://ecosphere.io" },
    });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://ecosphere.io");
  });

  it("refuse les méthodes HTTP autres que POST/OPTIONS", async () => {
    const req = new Request("https://proxy.example/polygon", { method: "GET" });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(405);
  });

  it("relaie une méthode JSON-RPC autorisée (eth_call)", async () => {
    const req = new Request("https://proxy.example/polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://ecosphere.io" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [] }),
    });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Vérifie que l'URL upstream (avec la clé secrète) n'est jamais renvoyée au client
    const body = await res.text();
    expect(body).not.toContain("SECRET_KEY");
  });

  it("bloque une méthode JSON-RPC non autorisée (ex: debug_traceTransaction)", async () => {
    const req = new Request("https://proxy.example/polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "debug_traceTransaction", params: [] }),
    });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("bloque un batch si une seule méthode du lot est interdite", async () => {
    const req = new Request("https://proxy.example/polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { jsonrpc: "2.0", id: 1, method: "eth_chainId" },
        { jsonrpc: "2.0", id: 2, method: "personal_sign" }, // interdit
      ]),
    });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(403);
  });

  it("route /amoy vers RPC_URL_AMOY et /polygon vers RPC_URL_POLYGON", async () => {
    const req = new Request("https://proxy.example/amoy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId" }),
    });
    await worker.fetch(req, makeEnv());
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain("amoy");
  });

  it("retourne 400 sur un JSON invalide", async () => {
    const req = new Request("https://proxy.example/polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(400);
  });
});
