import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContractState, MintPhase } from "../types";
import {
  demoContractState,
  discoverWalletOptions,
  getAmoyMintGasOverrides,
  getBrowserProvider,
  getContract,
  getCurrentChainId,
  getReadProvider,
  getWalletFallbackLinks,
  hasInjectedWallet,
  hasConfiguredContract,
  isMobileDevice,
  loadWhitelistProof,
  pendingContractState,
  setSelectedWalletProvider,
  switchToTargetNetwork,
  targetChainId,
  walletMintLimit,
} from "../lib/web3";
import type { WalletFallbackLink, WalletOption } from "../types";

type MintStatus = "idle" | "loading" | "success" | "error";

export function useMintContract() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [contractState, setContractState] = useState<ContractState>(
    hasConfiguredContract() ? pendingContractState : demoContractState,
  );
  const [contractStateLoaded, setContractStateLoaded] = useState(!hasConfiguredContract());
  const [status, setStatus] = useState<MintStatus>("idle");
  const [message, setMessage] = useState("");
  const [mobileWalletFallback, setMobileWalletFallback] = useState(false);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [walletFallbackLinks, setWalletFallbackLinks] = useState<WalletFallbackLink[]>([]);
  const [selectedWalletName, setSelectedWalletName] = useState("");

  const isConfigured = hasConfiguredContract();
  const wrongNetwork = chainId !== null && chainId !== targetChainId;

  const refreshContractState = useCallback(
    async (walletAddress = account) => {
      if (!isConfigured) {
        setContractState(demoContractState);
        setContractStateLoaded(true);
        return;
      }

      try {
        const provider = getReadProvider();
        const contract = getContract(provider);
        const [maxSupply, minted, mintPrice, whitelistActive, publicActive] = await Promise.all([
          contract.MAX_SUPPLY(),
          contract.totalSupply(),
          contract.mintPrice(),
          contract.whitelistMintActive(),
          contract.publicMintActive(),
        ]);

        const mintedByWallet = walletAddress ? await contract.mintedPerWallet(walletAddress) : 0n;
        const max = Number(maxSupply);
        const mintedCount = Number(minted);

        setContractState({
          maxSupply: max,
          minted: mintedCount,
          remaining: Math.max(max - mintedCount, 0),
          mintPrice: BigInt(mintPrice),
          whitelistActive: Boolean(whitelistActive),
          publicActive: Boolean(publicActive),
          mintedByWallet: Number(mintedByWallet),
        });
        setContractStateLoaded(true);
      } catch (error) {
        setContractStateLoaded(false);
        setMessage(error instanceof Error ? error.message : "Unable to read contract state.");
      }
    },
    [account, isConfigured],
  );

  const refreshWalletOptions = useCallback(async () => {
    const options = await discoverWalletOptions();
    setWalletOptions(options);
    setWalletFallbackLinks(getWalletFallbackLinks());
    setMobileWalletFallback(isMobileDevice() && options.length === 0);
    return options;
  }, []);

  const connectWallet = useCallback(async (walletId?: string) => {
    setStatus("loading");
    setMessage("");

    try {
      const options = walletOptions.length > 0 ? walletOptions : await refreshWalletOptions();
      const wallet = walletId ? options.find((item) => item.id === walletId) : options[0];

      if (!wallet) {
        setMobileWalletFallback(isMobileDevice());
        throw new Error("No injected wallet found. Open the site inside MetaMask, Coinbase Wallet, or Trust Wallet.");
      }

      setSelectedWalletProvider(wallet.provider);
      setMobileWalletFallback(false);
      const provider = await getBrowserProvider(wallet.provider);
      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      const selectedAccount = accounts[0] ?? "";
      const currentChainId = await getCurrentChainId(wallet.provider);

      setAccount(selectedAccount);
      setChainId(currentChainId);
      setSelectedWalletName(wallet.name);
      await refreshContractState(selectedAccount);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }, [refreshContractState, refreshWalletOptions, walletOptions]);

  const mint = useCallback(
    async (phase: MintPhase, quantity: number) => {
      setStatus("loading");
      setMessage("");

      try {
        if (!account) {
          throw new Error("Connect a wallet before minting.");
        }
        if (!isConfigured) {
          throw new Error("Set VITE_CONTRACT_ADDRESS after deploying the smart contract.");
        }
        if (wrongNetwork) {
          await switchToTargetNetwork();
          setChainId(await getCurrentChainId());
        }

        const provider = await getBrowserProvider();
        const signer = await provider.getSigner();
        const contract = getContract(signer);
        const value = contractState.mintPrice * BigInt(quantity);
        const gasOverrides = await getAmoyMintGasOverrides(provider);

        if (contractState.mintedByWallet + quantity > walletMintLimit) {
          throw new Error("Wallet mint limit reached.");
        }

        if (phase === "whitelist") {
          const proof = await loadWhitelistProof(account);
          if (proof === null) {
            throw new Error("This wallet is not in the local whitelist proof file.");
          }
          const tx = await contract.whitelistMint(quantity, proof, { value, ...gasOverrides });
          await tx.wait();
        } else {
          const tx = await contract.publicMint(quantity, { value, ...gasOverrides });
          await tx.wait();
        }

        await refreshContractState(account);
        setStatus("success");
        setMessage("Mint transaction confirmed.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Mint failed.");
      }
    },
    [account, contractState.mintPrice, isConfigured, refreshContractState, wrongNetwork],
  );

  const switchNetwork = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      await switchToTargetNetwork();
      setChainId(await getCurrentChainId());
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Network switch failed.");
    }
  }, []);

  useEffect(() => {
    void refreshWalletOptions();
    setWalletFallbackLinks(getWalletFallbackLinks());
    setMobileWalletFallback(isMobileDevice() && !hasInjectedWallet());
    getCurrentChainId().then(setChainId).catch(() => setChainId(null));
  }, [refreshWalletOptions]);

  useEffect(() => {
    void refreshContractState();
  }, [refreshContractState]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      connectWallet,
      contractState,
      contractStateLoaded,
      isConfigured,
      message,
      mint,
      mobileWalletFallback,
      refreshContractState,
      refreshWalletOptions,
      selectedWalletName,
      status,
      switchNetwork,
      walletFallbackLinks,
      walletOptions,
      wrongNetwork,
    }),
    [
      account,
      chainId,
      connectWallet,
      contractState,
      contractStateLoaded,
      isConfigured,
      message,
      mint,
      mobileWalletFallback,
      refreshContractState,
      refreshWalletOptions,
      selectedWalletName,
      status,
      switchNetwork,
      walletFallbackLinks,
      walletOptions,
      wrongNetwork,
    ],
  );

  return value;
}
