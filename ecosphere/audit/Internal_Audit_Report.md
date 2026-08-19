# Audit interne — EcoSphereToken & EcoSphereVesting
### Draft v0.1 — Revue manuelle (pré-audit externe CertiK/Quantstamp)

⚠️ **Note méthodologique** : Slither n'a pas pu être exécuté automatiquement
dans cet environnement (accès réseau restreint au binaire solc officiel).
Cette revue couvre manuellement les mêmes catégories de vulnérabilités.
Le workflow `.github/workflows/ci.yml` exécutera Slither automatiquement
à chaque push sur GitHub (environnement avec accès réseau complet).
**Cette revue manuelle ne remplace pas l'audit externe prévu semaine 7-8.**

Statut des tests : **18/18 tests unitaires passent** (voir `test/`).

---

## 1. Reentrancy

- `stake()` / `unstake()` (EcoSphereToken) : suivent le pattern
  checks-effects-interactions — l'état (`stakes`, `totalStaked`) est mis à
  jour **avant** les transferts de tokens. ✅ Pas de vecteur identifié.
- `release()` (EcoSphereVesting) : `s.released` est incrémenté avant
  `safeTransfer`. ✅
- Risque théorique : `_mint` dans `unstake()` est un appel interne
  OpenZeppelin, pas un call externe — pas de surface de reentrancy externe.

## 2. Contrôle d'accès

- `pause()`/`unpause()` : restreints à `PAUSER_ROLE`. ✅
- `setRewardRate()` : restreint à `DEFAULT_ADMIN_ROLE`, plafonné à 20% APY
  en dur dans le code (`require(newRateBps <= 2000)`). ✅
- `createTeamSchedule`/`createAdvisorSchedule`/`revoke()` (Vesting) :
  restreints à `DEFAULT_ADMIN_ROLE`. ✅
- **Point d'attention** : `DEFAULT_ADMIN_ROLE` est une clé unique (EOA du
  déployeur) au MVP. **Recommandation avant mainnet** : migrer vers un
  multisig Gnosis Safe (déjà prévu roadmap semaine 12) pour éviter un
  point de défaillance unique.

## 3. Arithmétique

- Solidity ≥0.8 : overflow/underflow protégés nativement (revert
  automatique). ✅
- `pendingReward()` : division par `BPS_DENOMINATOR * SECONDS_PER_YEAR`,
  pas de risque de division par zéro (constantes fixes). ✅
- **Point d'attention mineur** : précision de calcul en division entière
  (arrondi vers le bas) — acceptable pour un système de récompenses, sans
  impact de sécurité, seulement une perte de poussière négligeable pour
  l'utilisateur.

## 4. Logique métier / DoS

- `unstake()` valide `amount <= info.amount` avant exécution. ✅
- Aucune boucle non bornée sur des tableaux dynamiques dans les deux
  contrats → pas de risque de DoS par gas limit. ✅
- `revoke()` (Vesting) : calcule le montant vested avant de marquer
  `revoked = true`, évitant une double-dépense de l'allocation. ✅

## 5. Tokens (ERC-20) & standards

- Utilise `SafeERC20` pour tous les transferts externes dans
  `EcoSphereVesting`. ✅
- `EcoSphereToken` hérite directement d'OpenZeppelin `ERC20` (v5.6.1,
  version auditée et largement utilisée en production). ✅

## 6. Points ouverts à trancher avant audit externe

| # | Sujet | Recommandation |
|---|---|---|
| 1 | Rôle admin unique (EOA) | Migrer vers Gnosis Safe avant mainnet |
| 2 | `unstake()` mint des récompenses à la volée | Vérifier l'impact inflationniste cumulé sur la supply totale (100M) — envisager un cap de récompenses ou une réserve dédiée plutôt qu'un mint illimité |
| 3 | Pas de mécanisme de burn implémenté | La tokenomics prévoit 5% "Reserve/Burn" — fonction `burn()` à ajouter si des burn events sont prévus |
| 4 | Absence de timelock sur `setRewardRate` | Un changement de taux est instantané ; envisager un délai (ex. 48h) pour la transparence envers les stakers |

---

*Ce document est un pré-audit interne. L'audit externe (CertiK ou
Quantstamp, semaine 7-8 de la roadmap) reste indispensable avant tout
déploiement mainnet.*
