import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const root = process.cwd();
const outDir = path.join(root, "public", "metadata");
const supply = 1000;
const siteUrl = stripTrailingSlash(process.env.VITE_SITE_URL ?? process.env.FOUR_EVERLAND_SITE_URL ?? "https://REPLACE_WITH_SITE_URL");
const imageBaseUri = withTrailingSlash(process.env.NFT_IMAGE_BASE_URI ?? process.env.FOUR_EVERLAND_IMAGE_BASE_URI ?? "ipfs://REPLACE_WITH_IMAGE_CID/");
const distribution = [
  ["Legendary", 20],
  ["Mythic", 130],
  ["Epic", 850],
];
const teams = ["Glacier Kings", "Aurora Wolves", "Forge Comets", "Tidal Blades", "Summit Phantoms", "Metro Lynx"];
const positions = ["C", "LW", "RW", "D", "G"];
const archetypes = ["Sniper", "Playmaker", "Enforcer", "Two-Way", "Net Guardian", "Breakout Ace"];
const firstNames = ["Mika", "Noah", "Theo", "Axel", "Luca", "Eli", "Soren", "Niko", "Kai", "Owen"];
const lastNames = ["Frost", "Vey", "Marrow", "Sable", "Vale", "Cross", "Rune", "Hale", "North", "Ives"];

function rarityFor(index) {
  let cursor = 0;
  for (const [rarity, amount] of distribution) {
    cursor += amount;
    if (index <= cursor) {
      return rarity;
    }
  }
  return "Epic";
}

function stat(base, index, offset) {
  return Math.min(99, base + ((index * offset) % 18));
}

function stripTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function withTrailingSlash(value) {
  return `${stripTrailingSlash(value)}/`;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const manifest = {
  name: "HockeyNFTLeague",
  description: "1000 fictional hockey NFT jerseys for the HockeyNFTLeague universe.",
  supply,
  distribution: Object.fromEntries(distribution),
  generatedAt: new Date().toISOString(),
  tokenIds: [],
};

for (let tokenId = 1; tokenId <= supply; tokenId++) {
  const rarity = rarityFor(tokenId);
  const team = teams[tokenId % teams.length];
  const position = positions[tokenId % positions.length];
  const archetype = archetypes[tokenId % archetypes.length];
  const name = `${firstNames[tokenId % firstNames.length]} ${lastNames[(tokenId * 3) % lastNames.length]}`;
  const rarityBoost = rarity === "Legendary" ? 14 : rarity === "Mythic" ? 8 : 2;

  const metadata = {
    name: `HockeyNFTLeague Jersey #${String(tokenId).padStart(4, "0")} - ${name}`,
    description:
      "A fictional HockeyNFTLeague player jersey with player details and stats. This project does not use real teams, real players, real uniforms, or real league brands.",
    image: `${imageBaseUri}${tokenId}.png`,
    external_url: siteUrl,
    attributes: [
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Team", value: team },
      { trait_type: "Position", value: position },
      { trait_type: "Archetype", value: archetype },
      { trait_type: "Jersey Number", value: String(tokenId).padStart(2, "0").slice(-2) },
      { trait_type: "Shot", value: stat(72 + rarityBoost, tokenId, 5) },
      { trait_type: "Speed", value: stat(70 + rarityBoost, tokenId, 7) },
      { trait_type: "Grit", value: stat(73 + rarityBoost, tokenId, 11) },
      { trait_type: "Vision", value: stat(71 + rarityBoost, tokenId, 13) },
    ],
  };

  manifest.tokenIds.push(tokenId);
  await writeFile(path.join(outDir, `${tokenId}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
}

await writeFile(path.join(outDir, "_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${supply} metadata files in ${outDir}`);
