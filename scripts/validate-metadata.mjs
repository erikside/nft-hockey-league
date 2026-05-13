import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const metadataDir = path.join(process.cwd(), "public", "metadata");
const expectedCounts = {
  Epic: 850,
  Mythic: 130,
  Legendary: 20,
};
const bannedTerms = ["NHL", "Canadiens", "Maple Leafs", "Bruins", "Rangers", "Oilers"];
const requiredTraits = ["Rarity", "Team", "Position", "Archetype", "Jersey Number", "Shot", "Speed", "Grit", "Vision"];
const expectedTeamImages = {
  "Glacier Kings": "glacier-kings.png",
  "Aurora Wolves": "aurora-wolves.jpg",
  "Forge Comets": "forge-comets.png",
  "Tidal Blades": "tidal-blades.png",
  "Summit Phantoms": "summit-phantoms.png",
  "Metro Lynx": "metro-lynx.png",
};

const files = (await readdir(metadataDir)).filter((file) => /^\d+\.json$/.test(file));
if (files.length !== 1000) {
  throw new Error(`Expected 1000 token metadata files, found ${files.length}`);
}

const counts = { Epic: 0, Mythic: 0, Legendary: 0 };

for (const file of files) {
  const tokenId = Number.parseInt(file, 10);
  const metadata = JSON.parse(await readFile(path.join(metadataDir, file), "utf8"));
  const text = JSON.stringify(metadata);
  const traitNames = metadata.attributes?.map((item) => item.trait_type) ?? [];
  const rarity = metadata.attributes?.find((item) => item.trait_type === "Rarity")?.value;
  const team = metadata.attributes?.find((item) => item.trait_type === "Team")?.value;

  if (!metadata.name || !metadata.description || !metadata.image || !Array.isArray(metadata.attributes)) {
    throw new Error(`${file} is missing required ERC-721 metadata fields`);
  }
  if (!metadata.name.includes("Jersey") || !metadata.description.toLowerCase().includes("jersey")) {
    throw new Error(`${file} is not described as a jersey NFT`);
  }
  for (const trait of requiredTraits) {
    if (!traitNames.includes(trait)) {
      throw new Error(`${file} is missing required trait: ${trait}`);
    }
  }
  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > 1000) {
    throw new Error(`${file} has an invalid token id`);
  }
  if (!Object.hasOwn(counts, rarity)) {
    throw new Error(`${file} has invalid rarity: ${rarity}`);
  }
  if (!Object.hasOwn(expectedTeamImages, team)) {
    throw new Error(`${file} has invalid team: ${team}`);
  }
  if (!metadata.image.endsWith(expectedTeamImages[team])) {
    throw new Error(`${file} image does not match team ${team}: ${metadata.image}`);
  }
  if (bannedTerms.some((term) => text.toLowerCase().includes(term.toLowerCase()))) {
    throw new Error(`${file} contains a banned real-world hockey term`);
  }

  counts[rarity] += 1;
}

for (const [rarity, amount] of Object.entries(expectedCounts)) {
  if (counts[rarity] !== amount) {
    throw new Error(`Expected ${amount} ${rarity}, found ${counts[rarity]}`);
  }
}

console.log("Metadata validation passed:", counts);
