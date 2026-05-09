# Cloudflare Pages Deployment

Cloudflare Pages can host the frontend without a custom domain. The project receives a `pages.dev` URL first, and `nft-league.com` can be connected later when nameservers are settled.

## Current Setup

- Project name: `hockey-nft-league`
- Production URL: `https://hockey-nft-league.pages.dev`
- Latest deployment URL: `https://ff08ebb0.hockey-nft-league.pages.dev`
- Build command: `npm run build`
- Build output: `dist`
- Config file: `wrangler.toml`
- SPA fallback: `public/_redirects`

## Local Deploy

```bash
npm run deploy:cloudflare
```

Wrangler uses the logged-in Cloudflare account. If it asks for authentication:

```bash
npx wrangler login
```

## Public Environment

The frontend uses these public Vite variables:

```bash
VITE_CHAIN_ID=137
VITE_CHAIN_NAME="Polygon"
VITE_RPC_URL="https://polygon-bor-rpc.publicnode.com"
VITE_BLOCK_EXPLORER_URL="https://polygonscan.com"
VITE_CONTRACT_ADDRESS="0x28c9Ad86A58936ee1e34ed08BF21A86c52747920"
```

These are public app settings, not secrets.
