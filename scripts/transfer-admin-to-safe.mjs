import { ethers } from "ethers";
import "dotenv/config";

const DEFAULT_SAFE_ADDRESS = "0x49E2e4C3257ac88d867DdFD875FD2B0CD4067F3E";
const DEFAULT_TARGETS = [
  "0x28c9Ad86A58936ee1e34ed08BF21A86c52747920",
  "0x05f8529F06FdC5c97Decb4975F3F18B82fF63447",
];
const ERC2981_INTERFACE_ID = "0x2a55205a";

const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com";
const privateKey = requireEnv("POLYGON_PRIVATE_KEY");
const safeAddress = process.env.SAFE_OWNER_ADDRESS || DEFAULT_SAFE_ADDRESS;
const targets = (process.env.SAFE_TRANSFER_TARGETS || DEFAULT_TARGETS.join(","))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const royaltyFeeNumerator = BigInt(process.env.SAFE_ROYALTY_FEE_NUMERATOR || "500");
const maxFeePerGas = ethers.parseUnits(process.env.SAFE_MAX_FEE_GWEI || "500", "gwei");
const maxPriorityFeePerGas = ethers.parseUnits(process.env.SAFE_MAX_PRIORITY_FEE_GWEI || "60", "gwei");

assertAddress(safeAddress, "SAFE_OWNER_ADDRESS");
for (const target of targets) {
  assertAddress(target, "SAFE_TRANSFER_TARGETS");
}

if (royaltyFeeNumerator < 0n || royaltyFeeNumerator > 10000n) {
  throw new Error("SAFE_ROYALTY_FEE_NUMERATOR must be between 0 and 10000.");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);
const safe = new ethers.Contract(
  safeAddress,
  [
    "function getOwners() view returns (address[])",
    "function getThreshold() view returns (uint256)",
  ],
  provider,
);

const [safeOwners, safeThreshold] = await Promise.all([safe.getOwners(), safe.getThreshold()]);

if (Number(safeThreshold) < 2 || safeOwners.length < 2) {
  throw new Error(`Safe ${safeAddress} is not configured as a multi-sig with at least 2 signers.`);
}

console.log(`Signer: ${signer.address}`);
console.log(`Safe owner target: ${safeAddress}`);
console.log(`Safe threshold: ${safeThreshold.toString()} / ${safeOwners.length}`);

for (const target of targets) {
  const contract = new ethers.Contract(
    target,
    [
      "function owner() view returns (address)",
      "function transferOwnership(address newOwner) external",
      "function supportsInterface(bytes4 interfaceId) view returns (bool)",
      "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
      "function setDefaultRoyalty(address receiver, uint96 feeNumerator) external",
    ],
    signer,
  );

  const owner = await contract.owner();
  console.log(`\nContract: ${target}`);
  console.log(`Current owner: ${owner}`);

  if (owner.toLowerCase() === safeAddress.toLowerCase()) {
    console.log("Ownership already belongs to the Safe. Skipping transfer.");
    continue;
  }

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not the owner of ${target}. Current owner is ${owner}.`);
  }

  let supportsRoyalty = false;
  try {
    supportsRoyalty = await contract.supportsInterface(ERC2981_INTERFACE_ID);
  } catch {
    supportsRoyalty = false;
  }

  if (supportsRoyalty) {
    const salePrice = ethers.parseEther("1");
    const [receiver, amount] = await contract.royaltyInfo(1, salePrice);
    const fee = (amount * 10000n) / salePrice;
    console.log(`Current royalty receiver: ${receiver}`);
    console.log(`Current royalty fee: ${fee} / 10000`);

    if (receiver.toLowerCase() !== safeAddress.toLowerCase() || fee !== royaltyFeeNumerator) {
      const royaltyTx = await contract.setDefaultRoyalty(safeAddress, royaltyFeeNumerator, {
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      console.log(`Royalty transaction sent: ${royaltyTx.hash}`);
      const royaltyReceipt = await royaltyTx.wait();
      console.log(`Royalty updated in block ${royaltyReceipt.blockNumber}`);
    } else {
      console.log("Royalty receiver already belongs to the Safe.");
    }
  }

  const transferTx = await contract.transferOwnership(safeAddress, {
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  console.log(`Ownership transfer sent: ${transferTx.hash}`);
  const transferReceipt = await transferTx.wait();
  console.log(`Ownership transferred in block ${transferReceipt.blockNumber}`);

  const nextOwner = await contract.owner();
  console.log(`Verified owner: ${nextOwner}`);
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
