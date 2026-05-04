import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContractState, MintPhase } from "../types";
import {
  demoContractState,
  getAmoyMintGasOverrides,
  getBrowserProvider,
  getContract,
  getCurrentChainId,
  getReadProvider,
  hasConfiguredContract,
  loadWhitelistProof,
  switchToTargetNetwork,
  targetChainId,
} from "../lib/web3";

type MintStatus = "idle" | "loading" | "success" | "error";

export function useMintContract() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [contractState, setContractState] = useState<ContractState>(demoContractState);
  const [status, setStatus] = useState<MintStatus>("idle");
  const [message, setMessage] = useState("");

  const isConfigured = hasConfiguredContract();
  const wrongNetwork = chainId !== null && chainId !== targetChainId;

  const refreshContractState = useCallback(
    async (walletAddress = account) => {
      if (!isConfigured) {
        setContractState(demoContractState);
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
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to read contract state.");
      }
    },
    [account, isConfigured],
  );

  const connectWallet = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    try {
      const provider = await getBrowserProvider();
      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      const selectedAccount = accounts[0] ?? "";
      const currentChainId = await getCurrentChainId();

      setAccount(selectedAccount);
      setChainId(currentChainId);
      await refreshContractState(selectedAccount);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }, [refreshContractState]);

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
    getCurrentChainId().then(setChainId).catch(() => setChainId(null));
  }, []);

  useEffect(() => {
    void refreshContractState();
  }, [refreshContractState]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      connectWallet,
      contractState,
      isConfigured,
      message,
      mint,
      refreshContractState,
      status,
      switchNetwork,
      wrongNetwork,
    }),
    [
      account,
      chainId,
      connectWallet,
      contractState,
      isConfigured,
      message,
      mint,
      refreshContractState,
      status,
      switchNetwork,
      wrongNetwork,
    ],
  );

  return value;
}
