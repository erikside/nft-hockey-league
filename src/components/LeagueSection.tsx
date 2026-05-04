import { Shield } from "lucide-react";
import { copy, teams } from "../data/content";
import type { Locale } from "../types";

type LeagueSectionProps = {
  locale: Locale;
};

export function LeagueSection({ locale }: LeagueSectionProps) {
  const t = copy[locale];

  return (
    <section className="content-section" id={locale === "fr" ? "ligue" : "league"}>
      <div className="section-copy">
        <h2>{t.leagueTitle}</h2>
        <p>{t.leagueText}</p>
      </div>
      <div className="team-grid">
        {teams.map((team) => (
          <article className="team-card" key={team.id}>
            <div className="team-colors" aria-hidden="true">
              {team.colors.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </div>
            <Shield size={24} />
            <h3>{team.name}</h3>
            <p>{team.city}</p>
            <small>{team.motto[locale]}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
