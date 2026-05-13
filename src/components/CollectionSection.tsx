import { copy, featuredJerseys, raritySupply, teamById } from "../data/content";
import type { Locale, Rarity } from "../types";

const rarityOrder: Rarity[] = ["Epic", "Mythic", "Legendary"];

type CollectionSectionProps = {
  locale: Locale;
};

export function CollectionSection({ locale }: CollectionSectionProps) {
  const t = copy[locale];

  return (
    <section className="content-section collection-section" id="collection">
      <div className="section-copy">
        <h2>{t.collectionTitle}</h2>
        <p>850 Epic / 130 Mythic / 20 Legendary</p>
      </div>

      <div className="rarity-strip">
        {rarityOrder.map((rarity) => (
          <div className={`rarity-card rarity-${rarity.toLowerCase()}`} key={rarity}>
            <span>{rarity}</span>
            <strong>{raritySupply[rarity]}</strong>
            <small>NFT</small>
          </div>
        ))}
      </div>

      <div className="section-copy compact">
        <h2>{t.featuredTitle}</h2>
      </div>

      <div className="jersey-grid">
        {featuredJerseys.map((jersey) => {
          const team = teamById(jersey.teamId);

          return (
            <article className={`nft-jersey nft-${jersey.rarity.toLowerCase()}`} key={jersey.token}>
              <div className="jersey-topline">
                <span>#{String(jersey.token).padStart(4, "0")}</span>
                <strong>{jersey.rarity}</strong>
              </div>
              <div className="jersey-art">
                <img src={team.image} alt={`${team.name} jersey`} />
                <span className="jersey-number">#{String(jersey.token).padStart(4, "0")}</span>
                <span className="jersey-position">{jersey.position}</span>
              </div>
              <h3>{jersey.name}</h3>
              <p>{team.name}</p>
              <dl className="stat-grid">
                <div>
                  <dt>SHOT</dt>
                  <dd>{jersey.shot}</dd>
                </div>
                <div>
                  <dt>SPD</dt>
                  <dd>{jersey.speed}</dd>
                </div>
                <div>
                  <dt>GRT</dt>
                  <dd>{jersey.grit}</dd>
                </div>
                <div>
                  <dt>VIS</dt>
                  <dd>{jersey.vision}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
