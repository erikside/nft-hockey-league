# HockeyNFTLeague NFT

Professional Web3 project for a fictional ice hockey NFT jersey league:

- React + Vite + TypeScript frontend
- ERC-721 smart contract with whitelist mint and public mint
- 1000 unique jersey metadata files
- Epic, Mythic, and Legendary rarity model
- Polygon Amoy testnet deployment path
- Cloudflare Pages deployment without a custom domain
- Bilingual FR/EN content and social launch kit

## Quick Start

```bash
npm install
npm run generate:metadata
npm run generate:whitelist
npm run build
npm run test:contracts
```

## Local Frontend

```bash
npm run dev
```

The app runs in demo mode until `VITE_CONTRACT_ADDRESS` is set in `.env`.

## Smart Contract

```bash
npm run compile
npm run test:contracts
```

Deploy to Polygon Amoy after setting `.env`:

```bash
npm run deploy:amoy
```

Copy the deployed address into `VITE_CONTRACT_ADDRESS`, rebuild, then deploy the frontend to Cloudflare Pages.

## Cloudflare Pages

The frontend can also be deployed without a custom domain:

```bash
npm run deploy:cloudflare
```

Current Cloudflare Pages URL:

```text
https://hockey-nft-league.pages.dev
```

See `docs/cloudflare-pages.md` for the Pages settings and public environment variables.

## Contract Metadata Base URI

The V2 contract owner is the Safe. To update NFT metadata, create a Safe transaction calling `setBaseURI` on the V2 contract:

```text
https://hockey-nft-league.pages.dev/metadata/
```

## Important Safety Notes

HockeyNFTLeague is a fictional universe. Do not add real league names, real team logos, real player names, or real jersey designs without official written rights.

NFT messaging must not promise financial returns, profit, price floors, or investment performance.
