import { ChevronDown, ExternalLink, Globe2, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";
import { copy } from "../data/content";
import { shortAddress } from "../lib/web3";
import type { Locale, WalletFallbackLink, WalletOption } from "../types";

type HeaderProps = {
  locale: Locale;
  account: string;
  onConnect: (walletId?: string) => void;
  onRefreshWallets: () => void;
  onToggleLocale: () => void;
  selectedWalletName: string;
  walletFallbackLinks: WalletFallbackLink[];
  walletOptions: WalletOption[];
};

export function Header({
  locale,
  account,
  onConnect,
  onRefreshWallets,
  onToggleLocale,
  selectedWalletName,
  walletFallbackLinks,
  walletOptions,
}: HeaderProps) {
  const t = copy[locale];
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const handleWalletButton = () => {
    if (account) {
      onConnect();
      return;
    }

    setWalletMenuOpen((value) => !value);
    onRefreshWallets();
  };

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="HockeyNFTLeague home">
        <span className="brand-mark">HNL</span>
        <span>HockeyNFTLeague</span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {t.nav.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>
            {item}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onToggleLocale} aria-label="Toggle language">
          <Globe2 size={18} />
          <span>{locale.toUpperCase()}</span>
        </button>
        <div className="wallet-connect">
          <button className="wallet-button" type="button" onClick={handleWalletButton}>
            <Wallet size={18} />
            <span>{account ? `${selectedWalletName || t.connected} ${shortAddress(account)}` : t.connect}</span>
            {!account && <ChevronDown size={16} />}
          </button>

          {walletMenuOpen && !account && (
            <div className="wallet-menu">
              <div className="wallet-menu-heading">
                <strong>{t.chooseWallet}</strong>
                <button type="button" onClick={onRefreshWallets}>
                  <RefreshCw size={14} />
                  {t.refreshWallets}
                </button>
              </div>

              {walletOptions.length > 0 ? (
                walletOptions.map((wallet) => (
                  <button
                    className="wallet-option"
                    key={wallet.id}
                    type="button"
                    onClick={() => {
                      setWalletMenuOpen(false);
                      onConnect(wallet.id);
                    }}
                  >
                    {wallet.icon ? <img src={wallet.icon} alt="" /> : <Wallet size={18} />}
                    <span>{wallet.name}</span>
                  </button>
                ))
              ) : (
                <div className="wallet-fallback-list">
                  <p>{t.noWallet}</p>
                  {walletFallbackLinks.map((link) => (
                    <a className="wallet-fallback-link" href={link.href} key={link.id} target="_blank" rel="noreferrer">
                      <ExternalLink size={15} />
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
