# Launch Checklist

## Phase 1 - Foundation

- Confirm final project name and domain.
- Confirm no real hockey IP is used in copy, art, metadata, or social posts.
- Generate metadata with `npm run generate:metadata`.
- Generate whitelist files with `npm run generate:whitelist`.
- Run `npm run validate:metadata`.
- Run `npm run test:contracts`.
- Run `npm run build`.

## Phase 2 - Testnet

- Add `POLYGON_AMOY_PRIVATE_KEY` and `POLYGON_AMOY_RPC_URL` to `.env`.
- Deploy with `npm run deploy:amoy`.
- Copy the contract address into `VITE_CONTRACT_ADDRESS`.
- Rebuild the frontend.
- Test wallet connect, wrong network, whitelist mint, public mint, sold-out-style errors, and disabled states.
- Upload jersey images and metadata to IPFS and update `baseUri` before a final deployment.

## Phase 3 - 4EVERLAND Preview

- Add `FOUR_EVERLAND_HOSTING_TOKEN` and `FOUR_EVERLAND_PROJECT_ID` to `.env`.
- Add the 4EVERLAND bucket keys and public metadata domain to `.env`.
- Run `npm run deploy:4everland`.
- Run `npm run upload:4everland:metadata`.
- Test the preview URL on desktop and mobile.
- Confirm `/metadata/1.json` loads from the new domain.

## Phase 4 - Production

- Freeze contract parameters: price, reserve, merkle root, base URI.
- Run one final local test suite.
- Deploy frontend with `npm run deploy:4everland`.
- Update the V2 contract base URI with `npm run set:base-uri -- "https://your-domain.example/metadata/"`.
- Publish social posts from `docs/social-posts.md`.
- Monitor wallet support messages and contract activity.

## Phase 5 - Post-Launch

- Publish jersey reveal status and metadata integrity notes.
- Run community polls for Season 1 features.
- Prepare holder-only community drops without making financial promises.
