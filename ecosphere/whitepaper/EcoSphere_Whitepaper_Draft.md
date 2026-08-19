# EcoSphere (ECKO) — White Paper
### Draft v0.1 — [Date à compléter]

---

## 1. Résumé exécutif

EcoSphere est un token utilitaire ERC-20 déployé sur Polygon PoS, conçu pour
connecter deux communautés aujourd'hui mal desservies par les infrastructures
Web3 existantes : les créateurs de contenu eco-art et les porteurs de projets
de financement vert (reforestation, crédits carbone). ECKO donne accès au
staking, à la gouvernance communautaire et à des services exclusifs de
l'écosystème, sans promesse de rendement ni droit à dividende.

## 2. Problème

- Les créateurs de contenu environnemental manquent de mécanismes de
  monétisation directs et transparents.
- Les campagnes de financement vert (reforestation, crédits carbone)
  souffrent d'un déficit de traçabilité et de confiance auprès des donateurs.
- Les plateformes existantes de NFT/DeFi sont rarement conçues pour
  des cas d'usage à impact ESG, ce qui limite l'accès aux grants et
  incubateurs spécialisés.

## 3. Solution

EcoSphere propose une infrastructure unifiée où :

1. **Créateurs** mintent des NFT eco-art dont une partie des revenus
   alimente directement des campagnes de reforestation vérifiées.
2. **Détenteurs de ECKO** peuvent staker leurs tokens pour percevoir des
   récompenses et voter sur les décisions de gouvernance (allocation du
   Treasury, choix des campagnes soutenues).
3. **Accès à des services exclusifs** : cours en ligne sur la finance
   climatique, crédits carbone tokenisés, accès prioritaire aux
   campagnes de financement.

## 4. Architecture technique

- **Réseau** : Polygon PoS (L2 Ethereum) — frais < 0,001 $, compatibilité EVM.
- **Token** : ERC-20 standard (OpenZeppelin), fonctions Pausable et
  AccessControl pour la gouvernance opérationnelle.
- **Staking** : contrat natif intégré au token principal, taux de
  récompense ajustable par gouvernance (plafonné à 20% APY).
- **Vesting** : contrat dédié pour l'équipe (24 mois, cliff 6 mois) et
  les advisors (12 mois, sans cliff).
- **Sécurité** : audit interne (Slither, MythX) suivi d'un audit externe
  (CertiK ou Quantstamp) avant déploiement mainnet.

## 5. Tokenomics

**Supply totale fixe : 100,000,000 ECKO**

| Allocation | % | Montant | Vesting |
|---|---|---|---|
| Community & Rewards | 50% | 50,000,000 ECKO | Aucun (staking uniquement) |
| Team & Advisors | 20% | 20,000,000 ECKO | 24 mois linéaire, cliff 6 mois |
| Treasury | 15% | 15,000,000 ECKO | Flexible, gouvernance DAO |
| Strategic Partnerships | 10% | 10,000,000 ECKO | Selon accords |
| Reserve / Burn | 5% | 5,000,000 ECKO | Contrôle inflation |

*Aucun droit à dividende n'est associé au token ECKO. Il s'agit d'un
token utilitaire au sens strict, destiné à réduire le risque de
requalification en security.*

## 6. Gouvernance

- **DAO Treasury** géré via Gnosis Safe (multisig).
- **Votes** via Snapshot.org, pondérés par le montant staké.
- Décisions couvertes : allocation du Treasury, choix des campagnes
  de reforestation soutenues, ajustement du taux de récompense staking.

## 7. Roadmap (synthèse 12 semaines)

| Phase | Période | Jalon |
|---|---|---|
| Validation marché | S1-2 | Étude concurrentielle, sondage communauté |
| Documentation | S3-4 | White-paper, tokenomics finalisés |
| MVP technique | S5-6 | Smart contract + déploiement testnet |
| Audit externe | S7-8 | Rapport CertiK/Quantstamp |
| Grants & incubateurs | S9 | Soumission Polygon Grants, Binance Labs |
| Seed round | S10-11 | Levée angels/VC |
| Mainnet & DAO | S12 | Lancement public, gouvernance active |

## 8. Risques

- **Risque réglementaire** : classification du token soumise à validation
  juridique préalable (semaine 3 de la roadmap).
- **Risque d'exécution** : calendrier de 12 semaines ambitieux, notamment
  pour l'audit externe et le seed round, dont les délais réels dépassent
  souvent les estimations initiales.
- **Risque de marché** : dépendance à l'appétit des investisseurs crypto
  pour les projets ESG, qui fluctue avec le cycle de marché.
- **Risque technique** : bugs potentiels dans les contrats de staking/
  vesting, atténués par l'audit externe et un bug bounty post-mainnet
  (Immunefi).

---

*Ce document est un draft de travail et sera complété avec les données
issues de l'étude de marché (S1-2) avant publication finale.*
