import { MessageCircle, Send } from "lucide-react";
import { copy, faqs, socialSnippets } from "../data/content";
import type { Locale } from "../types";

type SocialAndFaqProps = {
  locale: Locale;
};

export function SocialAndFaq({ locale }: SocialAndFaqProps) {
  const t = copy[locale];

  return (
    <section className="content-section social-faq" id="faq">
      <div className="social-panel">
        <div className="section-copy compact">
          <h2>{t.socialTitle}</h2>
          <p>{t.socialText}</p>
        </div>
        <div className="post-preview">
          {socialSnippets[locale].map((post) => (
            <article key={post}>
              <Send size={18} />
              <p>{post}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="faq-panel">
        <div className="section-copy compact">
          <h2>{t.faqTitle}</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article key={faq.question.en}>
              <MessageCircle size={18} />
              <div>
                <h3>{faq.question[locale]}</h3>
                <p>{faq.answer[locale]}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
