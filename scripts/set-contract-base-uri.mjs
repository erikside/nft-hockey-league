import { ethers } from "ethers";
import "dotenv/config";

const rpcUrl = requireEnv("POLYGON_RPC_URL");
const privateKey = requireEnv("POLYGON_PRIVATE_KEY");
const contractAddress = process.env.VITE_CONTRACT_ADDRESS ?? "0x28c9Ad86A58936ee1e34ed08BF21A86c52747920";
const nextBaseUri = withTrailingSlash(process.argv[2] ?? process.env.NEW_BASE_URI);

if (!nextBaseUri || (!nextBaseUri.startsWith("https://") && !nextBaseUri.startsWith("ipfs://"))) {
  throw new Error("Set NEW_BASE_URI to an https:// or ipfs:// URI.");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
  contractAddress,
  ["function setBaseURI(string calldata newBaseURI) external"],
  wallet,
);

console.log(`Updating base URI on ${contractAddress}`);
console.log(`New base URI: ${nextBaseUri}`);

const tx = await contract.setBaseURI(nextBaseUri);
console.log(`Transaction sent: ${tx.hash}`);

const receipt = await tx.wait();
console.log(`Base URI updated in block ${receipt.blockNumber}`);

function withTrailingSlash(value) {
  if (!value) {
    return "";
  }

  return `${String(value).replace(/\/+$/, "")}/`;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
