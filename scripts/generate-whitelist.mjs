import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "scripts", "whitelist.sample.json");
const outDir = path.join(root, "public", "allowlist");
const addresses = JSON.parse(await readFile(source, "utf8"));

const values = addresses.map((address) => [address]);
const tree = StandardMerkleTree.of(values, ["address"]);
const proofs = {};

for (const [index, value] of tree.entries()) {
  proofs[value[0].toLowerCase()] = tree.getProof(index);
}

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "tree.json"), JSON.stringify(tree.dump(), null, 2));
await writeFile(path.join(outDir, "proofs.json"), `${JSON.stringify(proofs, null, 2)}\n`);
await writeFile(
  path.join(outDir, "root.json"),
  `${JSON.stringify({ merkleRoot: tree.root, count: addresses.length }, null, 2)}\n`,
);

console.log(`Generated whitelist root ${tree.root}`);
