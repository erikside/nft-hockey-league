import { readFile } from "node:fs/promises";
import { ethers } from "ethers";
import "dotenv/config";

const DEFAULT_CONTRACT_ADDRESS = "0x28c9Ad86A58936ee1e34ed08BF21A86c52747920";
const DEFAULT_ROOT_PATH = new URL("../public/allowlist/root.json", import.meta.url);

const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com";
const privateKey = requireEnv("POLYGON_PRIVATE_KEY");
const contractAddress = process.env.WHITELIST_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS;
const merkleRoot = await resolveMerkleRoot();
const maxFeePerGas = ethers.parseUnits(process.env.WHITELIST_MAX_FEE_GWEI || "500", "gwei");
const maxPriorityFeePerGas = ethers.parseUnits(process.env.WHITELIST_MAX_PRIORITY_FEE_GWEI || "60", "gwei");

assertAddress(contractAddress, "WHITELIST_CONTRACT_ADDRESS");
assertBytes32(merkleRoot, "WHITELIST_MERKLE_ROOT");

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
  contractAddress,
  [
    "function owner() view returns (address)",
    "function merkleRoot() view returns (bytes32)",
    "function setMerkleRoot(bytes32 newMerkleRoot) external",
  ],
  wallet,
);

const owner = await contract.owner();

if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
  throw new Error(`POLYGON_PRIVATE_KEY signs as ${wallet.address}, but contract owner is ${owner}.`);
}

const currentRoot = await contract.merkleRoot();

console.log(`Contract: ${contractAddress}`);
console.log(`Owner signer: ${wallet.address}`);
console.log(`Current Merkle root: ${currentRoot}`);
console.log(`Next Merkle root: ${merkleRoot}`);

if (currentRoot.toLowerCase() === merkleRoot.toLowerCase()) {
  console.log("Whitelist root is already up to date. No transaction sent.");
  process.exit(0);
}

const tx = await contract.setMerkleRoot(merkleRoot, {
  maxFeePerGas,
  maxPriorityFeePerGas,
});

console.log(`Transaction sent: ${tx.hash}`);

const receipt = await tx.wait();
console.log(`Whitelist root updated in block ${receipt.blockNumber}`);

const updatedRoot = await contract.merkleRoot();
console.log(`Updated Merkle root: ${updatedRoot}`);

async function resolveMerkleRoot() {
  if (process.env.WHITELIST_MERKLE_ROOT) {
    return process.env.WHITELIST_MERKLE_ROOT.trim();
  }

  const raw = await readFile(DEFAULT_ROOT_PATH, "utf8");
  const data = JSON.parse(raw);
  return data.merkleRoot;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertAddress(value, label) {
  if (!ethers.isAddress(value)) {
    throw new Error(`${label} must be a valid EVM address.`);
  }
}

function assertBytes32(value, label) {
  if (!ethers.isHexString(value, 32)) {
    throw new Error(`${label} must be a 32-byte hex string.`);
  }
}
