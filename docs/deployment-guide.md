# Deployment Guide

## 1. Environment

Create `.env` from `.env.example`.

Required for testnet deployment:

```bash
POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
POLYGON_AMOY_PRIVATE_KEY="..."
```

Required for frontend contract connection:

```bash
VITE_CHAIN_ID=80002
VITE_CHAIN_NAME="Polygon Amoy"
VITE_CONTRACT_ADDRESS="0x..."
```

Never commit a real private key.

## 2. Metadata And Whitelist

```bash
npm run generate:metadata
npm run validate:metadata
npm run generate:whitelist
```

Use `public/allowlist/root.json` as the merkle root input for the contract deployment parameters. The metadata produced by this project describes jersey NFTs with player details and stats.

## 3. Smart Contract

```bash
npm run compile
npm run test:contracts
npm run deploy:amoy
```

The default Ignition module uses:

- base URI: `ipfs://REPLACE_WITH_METADATA_CID/`
- mint price: `0.025 MATIC`
- owner: deployer account

For production, create a real parameters file from `ignition/parameters.sample.json`.

## 4. Frontend

After contract deployment:

```bash
npm run build
```

The Netlify settings are:

- Build command: `npm run build`
- Publish directory: `dist`

## 5. Netlify

Preview:

```bash
npx netlify deploy
```

Production:

```bash
npx netlify deploy --prod
```

If the CLI is not authenticated, run:

```bash
npx netlify login
```
