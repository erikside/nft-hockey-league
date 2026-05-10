import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  Contract,
  ContractFactory,
  Interface,
  JsonRpcProvider,
  Wallet,
  ZeroAddress,
  formatEther,
  formatUnits,
  parseUnits,
} from "ethers";
import "dotenv/config";

const chainId = 137n;
const defaultNewOwner = "0x392DC017bf81b7c351042225aa0d22C1f69EAC4E";
const defaultTargets = [
  "0x28c9Ad86A58936ee1e34ed08BF21A86c52747920",
  "0x05f8529F06FdC5c97Decb4975F3F18B82fF63447",
];

const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com";
const newOwner = process.env.RESCUE_NEW_OWNER_ADDRESS || process.argv[2] || defaultNewOwner;
const targets = (process.env.RESCUE_TARGETS || defaultTargets.join(","))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const oldKey = requireEnv("POLYGON_PRIVATE_KEY");
const sponsorKey = process.env.RESCUE_SPONSOR_PRIVATE_KEY;
const confirm = process.env.RESCUE_CONFIRM === "TRANSFER_OWNERSHIP";
const provider = new JsonRpcProvider(rpcUrl);
const oldWallet = new Wallet(oldKey, provider);
const oldOwner = process.env.RESCUE_OLD_OWNER_ADDRESS || oldWallet.address;

console.log("EIP-7702 ownership rescue");
console.log(`Old owner: ${oldWallet.address}`);
console.log(`New owner: ${newOwner}`);
console.log(`Targets: ${targets.join(", ")}`);

if (oldWallet.address.toLowerCase() !== oldOwner.toLowerCase()) {
  throw new Error(`POLYGON_PRIVATE_KEY is ${oldWallet.address}, expected ${oldOwner}`);
}

const network = await provider.getNetwork();
if (network.chainId !== chainId) {
  throw new Error(`Wrong network ${network.chainId}; expected Polygon chain ${chainId}`);
}

await printCurrentState();

if (!sponsorKey) {
  console.log("");
  console.log("Dry run only: set RESCUE_SPONSOR_PRIVATE_KEY to a funded temporary wallet to execute.");
  process.exit(0);
}

if (!confirm) {
  console.log("");
  console.log('Dry run only: set RESCUE_CONFIRM="TRANSFER_OWNERSHIP" to execute.');
  process.exit(0);
}

const sponsor = new Wallet(sponsorKey, provider);
const sponsorBalance = await provider.getBalance(sponsor.address);
const feeOverrides = await getFeeOverrides();
console.log(`Sponsor: ${sponsor.address}`);
console.log(`Sponsor balance: ${formatEther(sponsorBalance)} POL`);

if (sponsorBalance === 0n) {
  throw new Error("Sponsor wallet has 0 POL. Fund only the sponsor wallet, not the compromised owner.");
}

const delegate = await getOrDeployDelegate(sponsor);
await rescueOwnership(sponsor, delegate);
await clearDelegation(sponsor);
await printCurrentState();

async function getOrDeployDelegate(sponsor) {
  if (process.env.RESCUE_DELEGATE_ADDRESS) {
    console.log(`Using existing rescue delegate: ${process.env.RESCUE_DELEGATE_ADDRESS}`);
    return process.env.RESCUE_DELEGATE_ADDRESS;
  }

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "EIP7702OwnershipRescue.sol",
    "EIP7702OwnershipRescue.json",
  );
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, sponsor);
  const contract = await factory.deploy(sponsor.address, newOwner, feeOverrides);
  console.log(`Deploying rescue delegate: ${contract.target}`);
  await contract.waitForDeployment();
  console.log(`Rescue delegate deployed: ${contract.target}`);
  return contract.target;
}

async function rescueOwnership(sponsor, delegateAddress) {
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "EIP7702OwnershipRescue.sol",
    "EIP7702OwnershipRescue.json",
  );
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  const rescueInterface = new Interface(artifact.abi);
  const data = rescueInterface.encodeFunctionData("rescueOwnership", [targets]);
  const nonce = await provider.getTransactionCount(oldWallet.address, "latest");
  const auth = await oldWallet.authorize({
    address: delegateAddress,
    chainId,
    nonce,
  });

  console.log(`Authorizing rescue delegate with old owner nonce ${nonce}.`);
  const tx = await sponsor.sendTransaction({
    type: 4,
    to: oldWallet.address,
    data,
    authorizationList: [auth],
    gasLimit: 600000,
    ...feeOverrides,
  });

  console.log(`Rescue transaction sent: ${tx.hash}`);
  const receipt = await tx.wait(1);
  console.log(`Rescue transaction status: ${receipt.status}`);
  if (receipt.status !== 1) {
    throw new Error("Rescue transaction failed.");
  }
}

async function clearDelegation(sponsor) {
  const nonce = await provider.getTransactionCount(oldWallet.address, "latest");
  const auth = await oldWallet.authorize({
    address: ZeroAddress,
    chainId,
    nonce,
  });

  console.log(`Clearing EIP-7702 delegation with old owner nonce ${nonce}.`);
  const tx = await sponsor.sendTransaction({
    type: 4,
    to: oldWallet.address,
    data: "0x",
    authorizationList: [auth],
    gasLimit: 120000,
    ...feeOverrides,
  });

  console.log(`Clear delegation transaction sent: ${tx.hash}`);
  const receipt = await tx.wait(1);
  console.log(`Clear delegation status: ${receipt.status}`);
}

async function printCurrentState() {
  const ownableAbi = ["function owner() view returns (address)"];
  const code = await provider.getCode(oldWallet.address);
  console.log(`Old owner code: ${code}`);

  for (const target of targets) {
    const contract = new Contract(target, ownableAbi, provider);
    const owner = await contract.owner();
    console.log(`${target} owner: ${owner}`);
  }
}

async function getFeeOverrides() {
  const maxFeeGwei = process.env.RESCUE_MAX_FEE_GWEI || "500";
  const maxPriorityGwei = process.env.RESCUE_MAX_PRIORITY_FEE_GWEI || "120";
  const maxFeePerGas = parseUnits(maxFeeGwei, "gwei");
  const maxPriorityFeePerGas = parseUnits(maxPriorityGwei, "gwei");
  const feeData = await provider.getFeeData();

  console.log(
    `Network fee suggestion: maxFee=${feeData.maxFeePerGas ? formatUnits(feeData.maxFeePerGas, "gwei") : "n/a"} gwei, ` +
      `priority=${feeData.maxPriorityFeePerGas ? formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "n/a"} gwei`,
  );
  console.log(`Rescue fee caps: maxFee=${maxFeeGwei} gwei, priority=${maxPriorityGwei} gwei`);

  if (feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > maxPriorityFeePerGas) {
    throw new Error("Current priority fee is above RESCUE_MAX_PRIORITY_FEE_GWEI. Raise the cap or wait.");
  }

  if (feeData.maxFeePerGas && feeData.maxFeePerGas > maxFeePerGas) {
    throw new Error("Current max fee is above RESCUE_MAX_FEE_GWEI. Raise the cap or wait.");
  }

  return { maxFeePerGas, maxPriorityFeePerGas };
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
