# 4EVERLAND Migration Guide

This project can now move away from Netlify and run on 4EVERLAND Hosting, with NFT metadata stored in a 4EVERLAND Bucket.

## Current 4EVERLAND Deployment

- Project ID: `69fe8f57a3d3e30007afd003`
- Custom domain: `https://nft-league.com` (added in 4EVERLAND, waiting for DNS validation)
- WWW domain: `https://www.nft-league.com` (added in 4EVERLAND, waiting for DNS validation)
- 4EVERLAND fallback domain: `https://hockey-nft-league-r252.4everland.app`
- Latest IPFS CID: `QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt`
- Contract V2 base URI: `ipfs://QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/metadata/`
- Base URI update transaction: `0xd82151929a487cbb877ce6798e2bbbb73b7aa1ded452bbf5a941cf048fc2f2d6`

Gateway check:

```text
https://ipfs.io/ipfs/QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/metadata/1.json
```

Temporary frontend gateway:

```text
https://ipfs.io/ipfs/QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/
```

## Required Secrets

Add these values to your local `.env`. Do not commit them.

```bash
FOUR_EVERLAND_HOSTING_TOKEN=""
FOUR_EVERLAND_PROJECT_ID="69fe8f57a3d3e30007afd003"
FOUR_EVERLAND_PROJECT_NAME="hockey-nft-league"
FOUR_EVERLAND_PLATFORM="IPFS"
FOUR_EVERLAND_SITE_URL="https://nft-league.com"

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

The domains `nft-league.com` and `www.nft-league.com` have already been added to the 4EVERLAND project. Current 4EVERLAND status is `valid=false` until the DNS records are changed. These records follow the 4EVERLAND DNS setup guide: https://docs.4everland.org/hositng/guides/domain-management/dns-setup-guide

DNS records to set at the domain DNS provider:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `@` | `69fe8f57a3d3e30007afd003.cname.ddnsweb3.com` | `1h` |
| CNAME | `www` | `69fe8f57a3d3e30007afd003.cname.ddnsweb3.com` | `1h` |
| TXT | `@` | `dns.verify=69fe8f57a3d3e30007afd003` | `1h` |

Remove or replace these old records before validation:

- `nft-league.com` A record pointing to `81.169.145.105`
- `www.nft-league.com` CNAME pointing to `nft-league.com`

If the DNS provider does not allow a CNAME on `@`, use `www.nft-league.com` as the primary site and configure the root domain to forward to `https://www.nft-league.com`, or move DNS to a provider that supports CNAME flattening.

Current DNS uses `rzone.de` nameservers. This is commonly STRATO DNS; STRATO documents CNAME support for subdomains, so the practical setup there is:

- Keep `nft-league.com` as a redirect only.
- Point `www.nft-league.com` with a CNAME to `69fe8f57a3d3e30007afd003.cname.ddnsweb3.com`.
- Add the TXT verification record on `nft-league.com`.
- Use `https://www.nft-league.com` as the production URL, or move DNS to Cloudflare and use CNAME flattening for `nft-league.com`.

The same operation can be repeated manually in 4EVERLAND Hosting or with:

```bash
npx -y @4everland/hosting-cli login
npx -y @4everland/hosting-cli domain -a
npx -y @4everland/hosting-cli domain -c
```

After DNS propagates, set:

```bash
VITE_SITE_URL="https://nft-league.com"
FOUR_EVERLAND_SITE_URL="https://nft-league.com"
```
