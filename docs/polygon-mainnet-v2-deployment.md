# Polygon Mainnet V2 Deployment

Date: 2026-05-03

## Network

- Network: Polygon mainnet
- Chain ID: 137
- Explorer: https://polygonscan.com

## V2 Contract

- Contract: HockeyNFTLeagueV2
- Address: `0x28c9Ad86A58936ee1e34ed08BF21A86c52747920`
- Deploy tx: `0xeb35d68cb0c0745f141332de8aed16d6f5db8c04d8b6440a6540b252af00896f`
- Whitelist activation tx: `0x1326020d3a606cf626489f96dc01217c48905a97efb4a24578df79fc73168794`
- Current owner: `0x392DC017bf81b7c351042225aa0d22C1f69EAC4E`
- Mint price: `0.025 POL`
- Max supply: `1000`
- Paid supply: `950`
- Owner reserve: `50`
- Merkle root: `0x1a50efcc4e239b73c05cfc032dd29ffa539ee504a9bda85151aad025f7ad4dd5`
- Current Merkle root update tx: `0xa963fc6b89026a15f6493b0b8c48e4e50b48104dac7ffd08a52cd886af485cf4`
- Base URI: `https://nft-hockey-league.netlify.app/metadata/`
- Current Base URI: `ipfs://QmY6p2a9DDanoipUBFSuTc6HbCGDWLAdyzcU3KET4AkqXt/metadata/`
- Current Base URI update tx: `0xd82151929a487cbb877ce6798e2bbbb73b7aa1ded452bbf5a941cf048fc2f2d6`

## Royalties

- Standard: ERC-2981
- Interface ID: `0x2a55205a`
- Receiver: `0x392DC017bf81b7c351042225aa0d22C1f69EAC4E`
- Fee: `500` basis points (`5%`)
- `royaltyInfo(1, 1 POL)` returns `0.05 POL`
- Royalty receiver update tx: `0x4a7e8f73263196a9c78dad1522da3aac86739dfe8dbe8fe0dab6674d6e451938`

## V1 Status

- V1 address: `0x05f8529F06FdC5c97Decb4975F3F18B82fF63447`
- V1 close phases tx: `0x4e2ae0d7d9093969934b52b4081968ef98b2ef855eb122f773878ea3bdbf9208`
- V1 whitelist mint: inactive
- V1 public mint: inactive
- V1 total minted: `1`

## Frontend

- Production URL: https://nft-hockey-league.netlify.app
- Netlify deploy ID: `69f7f5474985f7c7c174d7f8`
- Active contract: V2

## Current V2 Sale State

- Whitelist mint: active
- Public mint: inactive
- Total minted: `0`
- Whitelisted wallet: `0x392DC017bf81b7c351042225aa0d22C1f69EAC4E`

## Next Actions

1. Mint one V2 production whitelist jersey.
2. Confirm token ownership and metadata.
3. Confirm marketplace collection royalty display where supported.
4. Add more whitelist wallets if needed.
5. Open public mint only after V2 whitelist validation.
