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

The 4EVERLAND/Git hosting settings are:

- Build command: `npm run build`
- Publish directory: `dist`

## 5. 4EVERLAND

Deploy through the API script:

```bash
npm run deploy:4everland
```

Upload metadata to the 4EVERLAND bucket:

```bash
npm run metadata:set-links
npm run validate:metadata
npm run upload:4everland:metadata
```

After the custom domain validates, the production frontend URL is:

```text
https://nft-league.com
```

After the final metadata URL works, update the V2 contract base URI:

```bash
npm run set:base-uri -- "ipfs://REPLACE_WITH_FINAL_METADATA_CID/metadata/"
```

See `docs/4everland-migration.md` for required `.env` variables, Hosting token, bucket keys, and domain steps.
