# 4EVERLAND Migration Guide

This project can now move away from Netlify and run on 4EVERLAND Hosting, with NFT metadata stored in a 4EVERLAND Bucket.

## Current 4EVERLAND Deployment

- Project ID: `69fe8f57a3d3e30007afd003`
- Primary domain: `https://hockey-nft-league-r252.4everland.app`
- Latest IPFS CID: `QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt`
- Contract V2 base URI: `ipfs://QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/metadata/`
- Base URI update transaction: `0xd82151929a487cbb877ce6798e2bbbb73b7aa1ded452bbf5a941cf048fc2f2d6`

Gateway check:

```text
https://ipfs.io/ipfs/QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/metadata/1.json
```

## Required Secrets

Add these values to your local `.env`. Do not commit them.

```bash
FOUR_EVERLAND_HOSTING_TOKEN=""
FOUR_EVERLAND_PROJECT_ID=""
FOUR_EVERLAND_PROJECT_NAME="hockey-nft-league"
FOUR_EVERLAND_PLATFORM="IPFS"
FOUR_EVERLAND_SITE_URL="https://your-domain.example"

FOUR_EVERLAND_BUCKET_ENDPOINT="https://endpoint.4everland.co"
FOUR_EVERLAND_BUCKET_REGION="us-east-1"
FOUR_EVERLAND_BUCKET_NAME=""
FOUR_EVERLAND_BUCKET_ACCESS_KEY_ID=""
FOUR_EVERLAND_BUCKET_SECRET_ACCESS_KEY=""
FOUR_EVERLAND_BUCKET_PUBLIC_URL="https://your-bucket-or-gateway-domain.example"
FOUR_EVERLAND_BUCKET_PREFIX="metadata"
FOUR_EVERLAND_METADATA_BASE_URI="https://your-bucket-or-gateway-domain.example/metadata/"
```

Use the Hosting Auth Token from the 4EVERLAND Hosting dashboard. Use Bucket Access Keys from the Bucket access key screen.

## Frontend Hosting

Build and deploy the React/Vite site:

```bash
npm run deploy:4everland
```

If `FOUR_EVERLAND_PROJECT_ID` is empty, the script creates a CLI project and prints the new project id. Add that id to `.env` before the next deploy so future deploys update the same project.

4EVERLAND also supports Git deployment. If using the dashboard with GitHub, configure:

- Repository: `erikside/nft-hockey-league`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: all public `VITE_` values needed by the frontend

## Metadata Bucket

Before closing the old host, make sure `1.json` through `1000.json` are available at the new metadata URL.

```bash
npm run metadata:set-links
npm run validate:metadata
npm run upload:4everland:metadata
```

Expected result:

```text
https://your-bucket-or-gateway-domain.example/metadata/1.json
```

Open that URL in a browser and confirm the JSON loads.

## Contract Base URI

The current V2 contract base URI still points to the old site until it is updated on-chain. After the new metadata URL works, update it:

```bash
npm run set:base-uri -- "https://your-bucket-or-gateway-domain.example/metadata/"
```

This sends a Polygon transaction from the owner wallet in `.env`. Keep Netlify online until the new `tokenURI` base has been confirmed.

## Domain

Bind the custom domain in 4EVERLAND Hosting or with:

```bash
npx -y @4everland/hosting-cli login
npx -y @4everland/hosting-cli domain -a
npx -y @4everland/hosting-cli domain -c
```

After DNS propagates, set:

```bash
VITE_SITE_URL="https://your-domain.example"
FOUR_EVERLAND_SITE_URL="https://your-domain.example"
```
