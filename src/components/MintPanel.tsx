import { Minus, Plus, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { copy } from "../data/content";
import { formatMintPrice, phaseLabel, targetChainName } from "../lib/web3";
import type { Locale, MintPhase } from "../types";
import { useMintContract } from "../hooks/useMintContract";

type MintPanelProps = {
  locale: Locale;
  mintContract: ReturnType<typeof useMintContract>;
};

export function MintPanel({ locale, mintContract }: MintPanelProps) {
  const t = copy[locale];
  const [phase, setPhase] = useState<MintPhase>("whitelist");
  const [quantity, setQuantity] = useState(1);
  const { account, contractState, isConfigured, message, mobileWalletFallback, status, wrongNetwork } = mintContract;
  const active = phase === "whitelist" ? contractState.whitelistActive : contractState.publicActive;
  const disabled = status === "loading" || !account || wrongNetwork || !active || contractState.remaining === 0;

  useEffect(() => {
    if (contractState.publicActive && !contractState.whitelistActive) {
      setPhase("public");
    }
  }, [contractState.publicActive, contractState.whitelistActive]);

  return (
    <section className="mint-panel" id="mint" aria-labelledby="mint-title">
      <div className="panel-header">
        <div>
          <h2 id="mint-title">{t.mintTitle}</h2>
          <p>{formatMintPrice(contractState.mintPrice)} / NFT</p>
        </div>
        <span className={`status-dot ${active ? "is-live" : ""}`}>{active ? "Live" : "Standby"}</span>
      </div>

      <div className="supply-meter">
        <div className="supply-row">
          <span>{t.supply}</span>
          <strong>
            {contractState.minted}/{contractState.maxSupply}
          </strong>
        </div>
        <div className="meter-track" aria-hidden="true">
          <span style={{ width: `${(contractState.minted / contractState.maxSupply) * 100}%` }} />
        </div>
        <div className="supply-row muted">
          <span>
            {contractState.minted} {t.minted}
          </span>
          <span>
            {contractState.remaining} {t.remaining}
          </span>
        </div>
      </div>

      <div className="phase-toggle" role="tablist" aria-label="Mint phase">
        <button
          className={phase === "whitelist" ? "is-selected" : ""}
          type="button"
          onClick={() => setPhase("whitelist")}
        >
          <ShieldCheck size={17} />
          {t.whitelist}
        </button>
        <button className={phase === "public" ? "is-selected" : ""} type="button" onClick={() => setPhase("public")}>
          <Zap size={17} />
          {t.publicMint}
        </button>
      </div>

      <div className="quantity-row">
        <span>{t.quantity}</span>
        <div className="stepper" aria-label="Mint quantity">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease">
            <Minus size={16} />
          </button>
          <strong>{quantity}</strong>
          <button type="button" onClick={() => setQuantity((value) => Math.min(3, value + 1))} aria-label="Increase">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mint-facts">
        <span>{t.walletLimit}</span>
        <span>{t.ownerReserve}</span>
        <span>{phaseLabel(phase)} phase</span>
      </div>

      {wrongNetwork ? (
        <button className="primary-action" type="button" onClick={mintContract.switchNetwork}>
          {t.switchNetwork}: {targetChainName}
        </button>
      ) : account ? (
        <button
          className="primary-action"
          type="button"
          disabled={disabled}
          onClick={() => mintContract.mint(phase, quantity)}
        >
          {status === "loading" ? "..." : `${t.mintNow} ${quantity}`}
        </button>
      ) : (
        <button className="primary-action" type="button" onClick={() => mintContract.connectWallet()}>
          {mobileWalletFallback ? t.openMetaMask : t.connect}
        </button>
      )}

      {!isConfigured && <p className="notice">{t.demoMode}</p>}
      {mobileWalletFallback && !account && <p className="notice">{t.mobileWalletHint}</p>}
      {message && <p className={`notice ${status === "error" ? "is-error" : "is-success"}`}>{message}</p>}
    </section>
  );
}
