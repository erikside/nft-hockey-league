import { ethers } from "ethers";
import "dotenv/config";

const DEFAULT_CONTRACT_ADDRESS = "0x28c9Ad86A58936ee1e34ed08BF21A86c52747920";
const DEFAULT_ROYALTY_RECEIVER = "0x392DC017bf81b7c351042225aa0d22C1f69EAC4E";
const ERC2981_INTERFACE_ID = "0x2a55205a";

const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com";
const privateKey = requireEnv("POLYGON_PRIVATE_KEY");
const contractAddress = process.env.ROYALTY_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS;
const receiver = process.env.ROYALTY_RECEIVER || process.env.RESCUE_NEW_OWNER_ADDRESS || DEFAULT_ROYALTY_RECEIVER;
const feeNumerator = BigInt(process.env.ROYALTY_FEE_NUMERATOR || "500");
const maxFeePerGas = ethers.parseUnits(process.env.ROYALTY_MAX_FEE_GWEI || "500", "gwei");
const maxPriorityFeePerGas = ethers.parseUnits(process.env.ROYALTY_MAX_PRIORITY_FEE_GWEI || "60", "gwei");

assertAddress(contractAddress, "ROYALTY_CONTRACT_ADDRESS");
assertAddress(receiver, "ROYALTY_RECEIVER");

if (feeNumerator < 0n || feeNumerator > 10000n) {
  throw new Error("ROYALTY_FEE_NUMERATOR must be between 0 and 10000.");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
  contractAddress,
  [
    "function owner() view returns (address)",
    "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
    "function setDefaultRoyalty(address receiver, uint96 feeNumerator) external",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  ],
  wallet,
);

const [owner, supportsRoyalty] = await Promise.all([
  contract.owner(),
  contract.supportsInterface(ERC2981_INTERFACE_ID),
]);

if (!supportsRoyalty) {
  throw new Error(`Contract ${contractAddress} does not support ERC-2981 royalties.`);
}

if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
  throw new Error(`POLYGON_PRIVATE_KEY signs as ${wallet.address}, but contract owner is ${owner}.`);
}

const salePrice = ethers.parseEther("1");
const [currentReceiver, currentAmount] = await contract.royaltyInfo(1, salePrice);
const currentFeeNumerator = (currentAmount * 10000n) / salePrice;

console.log(`Contract: ${contractAddress}`);
console.log(`Owner signer: ${wallet.address}`);
console.log(`Current royalty receiver: ${currentReceiver}`);
console.log(`Current royalty fee: ${currentFeeNumerator} / 10000`);
console.log(`Next royalty receiver: ${receiver}`);
console.log(`Next royalty fee: ${feeNumerator} / 10000`);

if (currentReceiver.toLowerCase() === receiver.toLowerCase() && currentFeeNumerator === feeNumerator) {
  console.log("Royalty configuration is already up to date. No transaction sent.");
  process.exit(0);
}

const tx = await contract.setDefaultRoyalty(receiver, feeNumerator, {
  maxFeePerGas,
  maxPriorityFeePerGas,
});

console.log(`Transaction sent: ${tx.hash}`);

const receipt = await tx.wait();
console.log(`Royalty updated in block ${receipt.blockNumber}`);

const [updatedReceiver, updatedAmount] = await contract.royaltyInfo(1, salePrice);
const updatedFeeNumerator = (updatedAmount * 10000n) / salePrice;

console.log(`Updated royalty receiver: ${updatedReceiver}`);
console.log(`Updated royalty fee: ${updatedFeeNumerator} / 10000`);

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
