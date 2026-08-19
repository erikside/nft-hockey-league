# EcoSphere RPC Proxy — Cloudflare Worker

Proxy JSON-RPC qui cache la clé API de ton provider RPC (Alchemy, Infura,
QuickNode...) côté serveur. Le frontend (React + wagmi + ethers) appelle ce
Worker au lieu du provider directement.

## Ce que ce Worker protège / ne protège pas

- ✅ **Protège** : la clé API de ton provider RPC (elle reste en secret
  Cloudflare, jamais exposée dans le bundle JS du navigateur).
- ❌ **Ne protège pas** : les clés privées wallet des utilisateurs — elles
  ne doivent JAMAIS transiter par un serveur. Le staking/mint est signé
  localement dans le wallet (MetaMask), et seule la transaction déjà
  signée traverse ce proxy (`eth_sendRawTransaction`), ce qui est normal
  et sans risque.
- ❌ **Ne remplace pas** : la clé privée du déployeur des contrats
  (`PRIVATE_KEY` dans `.env`), qui reste un secret CI/local séparé,
  utilisée uniquement pour les scripts de déploiement Hardhat — jamais
  dans ce Worker.

## Installation

```bash
cd cloudflare-worker
npm install
npm install -g wrangler   # si pas déjà installé
wrangler login
```

## Configuration des secrets (jamais dans wrangler.toml)

```bash
wrangler secret put RPC_URL_AMOY
# coller ex: https://polygon-amoy.g.alchemy.com/v2/TA_CLE_API

wrangler secret put RPC_URL_POLYGON
# coller ex: https://polygon-mainnet.g.alchemy.com/v2/TA_CLE_API
```

## Rate limiting (optionnel mais recommandé)

```bash
wrangler kv:namespace create RATE_LIMIT_KV
```

Copier l'`id` retourné dans `wrangler.toml` (section `[[kv_namespaces]]`,
actuellement commentée).

## Déploiement

```bash
wrangler deploy
```

Le Worker sera accessible sur une URL du type :
`https://ecosphere-rpc-proxy.<ton-compte>.workers.dev`

## Utilisation côté frontend

Remplacer l'URL du provider RPC par l'URL du Worker, avec le suffixe réseau :

```js
// wagmi / viem config
const polygonRpc = "https://ecosphere-rpc-proxy.<ton-compte>.workers.dev/polygon";
const amoyRpc = "https://ecosphere-rpc-proxy.<ton-compte>.workers.dev/amoy";
```

## Tests

```bash
npm test
```

7 tests couvrent : CORS, filtrage des méthodes JSON-RPC autorisées,
routing multi-réseau, non-exposition de la clé secrète, gestion des
requêtes batch et des payloads invalides.

## Méthodes JSON-RPC autorisées

Liste blanche définie dans `src/index.js` (`ALLOWED_METHODS`). Toute
méthode hors de cette liste (ex: `debug_*`, `admin_*`) est bloquée avec
un statut 403 — à ajuster si ton frontend a besoin d'appels supplémentaires.
