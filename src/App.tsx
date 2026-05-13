import { ArrowDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { CollectionSection } from "./components/CollectionSection";
import { Header } from "./components/Header";
import { LeagueSection } from "./components/LeagueSection";
import { MintPanel } from "./components/MintPanel";
import { RoadmapSection } from "./components/RoadmapSection";
import { SocialAndFaq } from "./components/SocialAndFaq";
import { copy, teams } from "./data/content";
import { useMintContract } from "./hooks/useMintContract";
import type { Locale } from "./types";

function App() {
  const [locale, setLocale] = useState<Locale>("fr");
  const mintContract = useMintContract();
  const t = copy[locale];

  return (
    <div className="app-shell" id="top">
      <Header
        locale={locale}
        account={mintContract.account}
        onConnect={mintContract.connectWallet}
        onRefreshWallets={mintContract.refreshWalletOptions}
        onToggleLocale={() => setLocale((value) => (value === "fr" ? "en" : "fr"))}
        selectedWalletName={mintContract.selectedWalletName}
        walletOptions={mintContract.walletOptions}
      />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <p className="pilot-note">{t.pilotText}</p>
            <div className="hero-actions">
              <a className="primary-link" href="#mint">
                {t.primaryCta}
                <ArrowDown size={18} />
              </a>
              <a className="secondary-link" href="#collection">
                {t.secondaryCta}
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Hockey NFT jersey collection preview">
            <div className="hero-showcase">
              {teams.slice(0, 3).map((team) => (
                <figure className="hero-jersey-card" key={team.id}>
                  <img src={team.image} alt={`${team.name} jersey`} />
                  <figcaption>
                    <strong>{team.name}</strong>
                    <span>{team.city}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <MintPanel locale={locale} mintContract={mintContract} />
        </section>

        <LeagueSection locale={locale} />
        <CollectionSection locale={locale} />
        <RoadmapSection locale={locale} />
        <SocialAndFaq locale={locale} />
      </main>

      <footer>
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}

export default App;
