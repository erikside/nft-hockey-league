import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const metadataDir = path.join(process.cwd(), "public", "metadata");
const siteUrl = process.argv[2] ?? process.env.VITE_SITE_URL;
const imageBaseUri = process.argv[3] ?? process.env.NFT_IMAGE_BASE_URI;

if (!siteUrl && !imageBaseUri) {
  throw new Error("Set VITE_SITE_URL or NFT_IMAGE_BASE_URI.");
}

const files = (await readdir(metadataDir)).filter((file) => /^\d+\.json$/.test(file));
let updated = 0;

for (const file of files) {
  const tokenId = Number.parseInt(file, 10);
  const filePath = path.join(metadataDir, file);
  const metadata = JSON.parse(await readFile(filePath, "utf8"));

  if (siteUrl) {
    metadata.external_url = stripTrailingSlash(siteUrl);
  }

  if (imageBaseUri) {
    const team = metadata.attributes?.find((item) => item.trait_type === "Team")?.value;
    metadata.image = `${withTrailingSlash(imageBaseUri)}${imageFileForTeam(team, tokenId)}`;
  }

  await writeFile(filePath, `${JSON.stringify(metadata, null, 2)}\n`);
  updated += 1;
}

console.log(`Updated ${updated} metadata files in ${metadataDir}`);

function stripTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

function withTrailingSlash(value) {
  return `${stripTrailingSlash(value)}/`;
}

function imageFileForTeam(team, tokenId) {
  const files = {
    "Glacier Kings": "glacier-kings.png",
    "Aurora Wolves": "aurora-wolves.jpg",
    "Forge Comets": "forge-comets.png",
    "Tidal Blades": "tidal-blades.png",
    "Summit Phantoms": "summit-phantoms.png",
    "Metro Lynx": "metro-lynx.png",
  };

  return files[team] ?? `${tokenId}.png`;
}
