import { CheckCircle2 } from "lucide-react";
import { copy, roadmap } from "../data/content";
import type { Locale } from "../types";

type RoadmapSectionProps = {
  locale: Locale;
};

export function RoadmapSection({ locale }: RoadmapSectionProps) {
  const t = copy[locale];

  return (
    <section className="content-section roadmap-section" id="roadmap">
      <div className="section-copy">
        <h2>{t.roadmapTitle}</h2>
      </div>
      <div className="timeline">
        {roadmap.map((phase) => (
          <article className="timeline-item" key={phase.phase}>
            <span className="phase-number">{phase.phase}</span>
            <div>
              <h3>{phase.title[locale]}</h3>
              <p>{phase.status[locale]}</p>
              <ul>
                {phase.items[locale].map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
