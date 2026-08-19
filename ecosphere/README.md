# EcoSphere (ECKO)

Token utilitaire ERC-20 sur Polygon PoS, dédié au financement de projets verts
et à la rémunération de créateurs de contenu eco-art (NFT, reforestation).

## Contenu du repo

- `contracts/EcoSphereToken.sol` — Token ERC-20 principal (staking, pause, access control)
- `contracts/EcoSphereVesting.sol` — Vesting Team (24 mois, cliff 6 mois) & Advisors (12 mois)

## Tokenomics (100,000,000 ECKO)

| Allocation | % | Vesting |
|---|---|---|
| Community & Rewards | 50% | Aucun lock-up (staking uniquement) |
| Team & Advisors | 20% | 24 mois linéaire, cliff 6 mois (team) / 12 mois (advisors) |
| Treasury | 15% | Flexible |
| Strategic Partnerships | 10% | — |
| Reserve / Burn | 5% | — |

## Stack technique

- Solidity ^0.8.24 + OpenZeppelin Contracts
- Hardhat (tests & déploiement)
- Réseau cible : Polygon PoS (testnet Mumbai puis Mainnet)

## Statut

⚠️ MVP — non audité. Ne pas déployer en mainnet avant audit externe
(CertiK / Quantstamp — voir roadmap semaine 7-8).

## Licence

MIT
