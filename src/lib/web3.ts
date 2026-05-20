import {
  BrowserProvider,
  Contract,
  FallbackProvider,
  JsonRpcProvider,
  formatEther,
  parseUnits,
  type ContractRunner,
  type Eip1193Provider,
} from "ethers";
import { hockeyNftLeagueAbi } from "../contracts/hockeyNftLeagueAbi";
import type { ContractState, MintPhase, WalletFallbackLink, WalletOption } from "../types";

const polygonChainId = 137;

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";
export const targetChainId = Number(import.meta.env.VITE_CHAIN_ID ?? polygonChainId);
export const targetChainName = import.meta.env.VITE_CHAIN_NAME ?? "Polygon";
export const blockExplorerUrl = import.meta.env.VITE_BLOCK_EXPLORER_URL ?? "https://polygonscan.com";
export const fallbackRpcUrl = import.meta.env.VITE_RPC_URL ?? "https://polygon.drpc.org";

const defaultReadRpcUrls = ["https://polygon.drpc.org"];

const configuredReadRpcUrls = String(import.meta.env.VITE_RPC_URLS ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const readRpcUrls = Array.from(new Set([...configuredReadRpcUrls, fallbackRpcUrl, ...defaultReadRpcUrls]));

let selectedWalletProvider: EthereumProvider | null = null;

export const demoContractState: ContractState = {
  maxSupply: 1000,
  minted: 318,
  remaining: 682,
  mintPrice: 25_000_000_000_000_000n,
  whitelistActive: true,
  publicActive: false,
  mintedByWallet: 0,
};

export const pendingContractState: ContractState = {
  maxSupply: 1000,
  minted: 0,
  remaining: 1000,
  mintPrice: 25_000_000_000_000_000n,
  whitelistActive: false,
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

export function setSelectedWalletProvider(provider: EthereumProvider): void {
  selectedWalletProvider = provider;
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

function getCurrentDappUrl(): string {
  if (typeof window === "undefined") {
    return "https://hockey-nft-league.pages.dev/";
  }

  return window.location.href;
}

function getCoinbaseWalletDeepLink(): string {
  return `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(getCurrentDappUrl())}`;
}

function getTrustWalletDeepLink(): string {
  return `https://link.trustwallet.com/open_url?url=${encodeURIComponent(getCurrentDappUrl())}`;
}

export function getWalletFallbackLinks(): WalletFallbackLink[] {
  if (isMobileDevice()) {
    return [
      { id: "metamask-mobile", name: "MetaMask", href: getMetaMaskMobileDeepLink() },
      { id: "coinbase-mobile", name: "Coinbase Wallet", href: getCoinbaseWalletDeepLink() },
      { id: "trust-mobile", name: "Trust Wallet", href: getTrustWalletDeepLink() },
    ];
  }

  return [
    { id: "metamask-install", name: "Installer MetaMask", href: "https://metamask.io/download/" },
    { id: "coinbase-install", name: "Installer Coinbase Wallet", href: "https://www.coinbase.com/wallet/downloads" },
    { id: "rabby-install", name: "Installer Rabby", href: "https://rabby.io/" },
  ];
}

function getInjectedEthereum(provider?: EthereumProvider): EthereumProvider {
  if (provider) {
    return provider;
  }

  if (selectedWalletProvider) {
    return selectedWalletProvider;
  }

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found.");
  }

  return window.ethereum;
}

export async function getBrowserProvider(provider?: EthereumProvider): Promise<BrowserProvider> {
  return new BrowserProvider(getInjectedEthereum(provider) as Eip1193Provider);
}

export async function discoverWalletOptions(): Promise<WalletOption[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const options = new Map<EthereumProvider, WalletOption>();
  const addOption = (provider: EthereumProvider, option: Omit<WalletOption, "provider">) => {
    if (!options.has(provider)) {
      options.set(provider, { ...option, provider });
    }
  };

  const onAnnouncement = (event: Eip6963AnnounceProviderEvent) => {
    const { info, provider } = event.detail;
    addOption(provider, {
      id: info.uuid || info.rdns || info.name,
      name: info.name || "Wallet",
      icon: info.icon,
      rdns: info.rdns,
    });
  };

  window.addEventListener("eip6963:announceProvider", onAnnouncement);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => window.setTimeout(resolve, 220));
  window.removeEventListener("eip6963:announceProvider", onAnnouncement);

  const legacy = window.ethereum;
  if (legacy?.providers?.length) {
    for (const provider of legacy.providers) {
      addOption(provider, {
        id: legacyWalletId(provider),
        name: legacyWalletName(provider),
      });
    }
  } else if (legacy) {
    addOption(legacy, {
      id: legacyWalletId(legacy),
      name: legacyWalletName(legacy),
    });
  }

  return Array.from(options.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function legacyWalletId(provider: EthereumProvider): string {
  if (provider.isCoinbaseWallet) {
    return "coinbase";
  }
  if (provider.isRabby) {
    return "rabby";
  }
  if (provider.isTrust) {
    return "trust";
  }
  if (provider.isMetaMask) {
    return "metamask";
  }
  return "browser-wallet";
}

function legacyWalletName(provider: EthereumProvider): string {
  if (provider.isCoinbaseWallet) {
    return "Coinbase Wallet";
  }
  if (provider.isRabby) {
    return "Rabby";
  }
  if (provider.isTrust) {
    return "Trust Wallet";
  }
  if (provider.isMetaMask) {
    return "MetaMask";
  }
  return "Browser Wallet";
}

export function getReadProvider(): JsonRpcProvider | FallbackProvider {
  const providers = readRpcUrls.map((url, index) => ({
    provider: new JsonRpcProvider(url, targetChainId, { staticNetwork: true }),
    priority: index + 1,
    weight: 1,
    stallTimeout: 1_500,
  }));

  if (providers.length === 1) {
    return providers[0].provider;
  }

  return new FallbackProvider(providers, targetChainId, { quorum: 1 });
}

export function getContract(providerOrSigner: ContractRunner) {
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

export async function getCurrentChainId(provider?: EthereumProvider): Promise<number | null> {
  if (!provider && !hasInjectedWallet() && !selectedWalletProvider) {
    return null;
  }

  const value = await getInjectedEthereum(provider).request({ method: "eth_chainId" });
  if (typeof value !== "string") {
    return null;
  }

  return Number.parseInt(value, 16);
}

export async function switchToTargetNetwork(provider?: EthereumProvider): Promise<void> {
  const ethereum = getInjectedEthereum(provider);
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
