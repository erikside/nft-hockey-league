import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseUnits, type Eip1193Provider } from "ethers";
import { hockeyNftLeagueAbi } from "../contracts/hockeyNftLeagueAbi";
import type { ContractState, MintPhase } from "../types";

const polygonChainId = 137;

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";
export const targetChainId = Number(import.meta.env.VITE_CHAIN_ID ?? polygonChainId);
export const targetChainName = import.meta.env.VITE_CHAIN_NAME ?? "Polygon";
export const blockExplorerUrl = import.meta.env.VITE_BLOCK_EXPLORER_URL ?? "https://polygonscan.com";
export const fallbackRpcUrl =
  import.meta.env.VITE_RPC_URL ?? "https://polygon-bor-rpc.publicnode.com";

export const demoContractState: ContractState = {
  maxSupply: 1000,
  minted: 318,
  remaining: 682,
  mintPrice: 25_000_000_000_000_000n,
  whitelistActive: true,
  publicActive: false,
  mintedByWallet: 0,
};

export function hasConfiguredContract(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(contractAddress);
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatMintPrice(value: bigint): string {
  return `${formatEther(value)} POL`;
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const isTouchTablet = navigator.maxTouchPoints > 1 && /Macintosh/i.test(userAgent);
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || isTouchTablet;
}

export function getMetaMaskMobileDeepLink(): string {
  if (typeof window === "undefined") {
    return "https://metamask.app.link/dapp/hockey-nft-league.pages.dev";
  }

  const dappPath = `${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `https://metamask.app.link/dapp/${dappPath}`;
}

export function openMetaMaskMobile(): void {
  window.location.href = getMetaMaskMobileDeepLink();
}

function getInjectedEthereum(): EthereumProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found.");
  }

  return window.ethereum;
}

export async function getBrowserProvider(): Promise<BrowserProvider> {
  return new BrowserProvider(getInjectedEthereum() as Eip1193Provider);
}

export function getReadProvider(): JsonRpcProvider {
  return new JsonRpcProvider(fallbackRpcUrl);
}

export function getContract(
  providerOrSigner: BrowserProvider | JsonRpcProvider | Awaited<ReturnType<BrowserProvider["getSigner"]>>,
) {
  if (!hasConfiguredContract()) {
    throw new Error("Contract address is not configured.");
  }

  return new Contract(contractAddress, hockeyNftLeagueAbi, providerOrSigner);
}

export async function getAmoyMintGasOverrides(provider: BrowserProvider) {
  const feeData = await provider.getFeeData();
  const minimumPriorityFee = parseUnits("25", "gwei");
  const priorityFee =
    feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minimumPriorityFee
      ? feeData.maxPriorityFeePerGas
      : minimumPriorityFee;
  const baseFee =
    feeData.maxFeePerGas && feeData.maxPriorityFeePerGas && feeData.maxFeePerGas > feeData.maxPriorityFeePerGas
      ? feeData.maxFeePerGas - feeData.maxPriorityFeePerGas
      : 0n;

  return {
    maxFeePerGas: baseFee * 2n + priorityFee,
    maxPriorityFeePerGas: priorityFee,
  };
}

export async function getCurrentChainId(): Promise<number | null> {
  if (!hasInjectedWallet()) {
    return null;
  }

  const value = await getInjectedEthereum().request({ method: "eth_chainId" });
  if (typeof value !== "string") {
    return null;
  }

  return Number.parseInt(value, 16);
}

export async function switchToTargetNetwork(): Promise<void> {
  const ethereum = getInjectedEthereum();
  const chainIdHex = `0x${targetChainId.toString(16)}`;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code !== 4902) {
      throw error;
    }

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: targetChainName,
          nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
          rpcUrls: [fallbackRpcUrl],
          blockExplorerUrls: [blockExplorerUrl],
        },
      ],
    });
  }
}

export async function loadWhitelistProof(account: string): Promise<string[] | null> {
  const response = await fetch("/allowlist/proofs.json");
  if (!response.ok) {
    return null;
  }

  const proofs = (await response.json()) as Record<string, string[]>;
  const normalizedAccount = account.toLowerCase();
  return Object.prototype.hasOwnProperty.call(proofs, normalizedAccount) ? proofs[normalizedAccount] : null;
}

export function phaseLabel(phase: MintPhase): string {
  return phase === "whitelist" ? "Whitelist" : "Public";
}
