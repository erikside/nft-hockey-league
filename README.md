# HockeyNFTLeague NFT

Professional Web3 project for a fictional ice hockey NFT jersey league:

- React + Vite + TypeScript frontend
- ERC-721 smart contract with whitelist mint and public mint
- 1000 unique jersey metadata files
- Epic, Mythic, and Legendary rarity model
- Polygon Amoy testnet deployment path
- Netlify-ready frontend
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

Copy the deployed address into `VITE_CONTRACT_ADDRESS`, rebuild, then deploy the frontend to Netlify.

## Netlify

Build command: `npm run build`

Publish directory: `dist`

The included `netlify.toml` sets those values and includes SPA redirects.

## Important Safety Notes

HockeyNFTLeague is a fictional universe. Do not add real league names, real team logos, real player names, or real jersey designs without official written rights.

NFT messaging must not promise financial returns, profit, price floors, or investment performance.
