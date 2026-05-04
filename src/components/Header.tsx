import { Globe2, Wallet } from "lucide-react";
import { copy } from "../data/content";
import { shortAddress } from "../lib/web3";
import type { Locale } from "../types";

type HeaderProps = {
  locale: Locale;
  account: string;
  onConnect: () => void;
  onToggleLocale: () => void;
};

export function Header({ locale, account, onConnect, onToggleLocale }: HeaderProps) {
  const t = copy[locale];

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
        <button className="wallet-button" type="button" onClick={onConnect}>
          <Wallet size={18} />
          <span>{account ? shortAddress(account) : t.connect}</span>
        </button>
      </div>
    </header>
  );
}
