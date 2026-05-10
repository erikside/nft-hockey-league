import type { FaqItem, Locale, PlayerJersey, RoadmapPhase, Team } from "../types";

export const raritySupply = {
  Epic: 850,
  Mythic: 130,
  Legendary: 20,
} as const;

export const copy = {
  fr: {
    nav: ["Mint", "Ligue", "Collection", "Roadmap", "FAQ"],
    connect: "Connecter",
    openMetaMask: "Ouvrir MetaMask",
    mobileWalletHint: "Sur mobile, ouvre le site dans le navigateur MetaMask pour connecter ton wallet.",
    connected: "Wallet connecté",
    heroTitle: "Hockey NFT League",
    heroText:
      "Une ligue NFT de hockey fictive avec 1000 jerseys ERC-721, des rivalités originales et un mint pensé pour une communauté de collectionneurs.",
    primaryCta: "Préparer le mint",
    secondaryCta: "Voir les jerseys",
    mintTitle: "Centre de mint",
    supply: "Supply",
    minted: "mintés",
    remaining: "restants",
    walletLimit: "Limite: 3 NFT par wallet",
    ownerReserve: "Réserve créateur: 50 NFT",
    whitelist: "Whitelist",
    publicMint: "Public",
    quantity: "Quantité",
    mintNow: "Minter",
    switchNetwork: "Changer réseau",
    demoMode: "Contrat non configuré: l'app affiche les données de lancement.",
    leagueTitle: "Une ligue originale, sans marques réelles",
    leagueText:
      "Chaque équipe, ville, joueur et jersey est inventé pour garder une identité propre et éviter les risques de droits liés aux ligues existantes.",
    collectionTitle: "Raretés des jerseys",
    featuredTitle: "Jerseys vedettes",
    roadmapTitle: "Roadmap de lancement",
    socialTitle: "Kit social prêt pour X et Facebook",
    socialText:
      "Les publications complètes sont dans docs/social-posts.md, avec versions FR/EN et ton sans promesse financière.",
    faqTitle: "Questions fréquentes",
    footer:
      "HockeyNFTLeague est un univers fictif. Aucun logo, joueur, club, championnat ou uniforme réel n'est utilisé.",
  },
  en: {
    nav: ["Mint", "League", "Collection", "Roadmap", "FAQ"],
    connect: "Connect",
    openMetaMask: "Open MetaMask",
    mobileWalletHint: "On mobile, open the site in the MetaMask browser to connect your wallet.",
    connected: "Wallet connected",
    heroTitle: "Hockey NFT League",
    heroText:
      "A fictional hockey NFT league with 1000 ERC-721 jerseys, original rivalries, and a mint flow built for collectors.",
    primaryCta: "Prepare mint",
    secondaryCta: "View jerseys",
    mintTitle: "Mint center",
    supply: "Supply",
    minted: "minted",
    remaining: "remaining",
    walletLimit: "Limit: 3 NFTs per wallet",
    ownerReserve: "Creator reserve: 50 NFTs",
    whitelist: "Whitelist",
    publicMint: "Public",
    quantity: "Quantity",
    mintNow: "Mint",
    switchNetwork: "Switch network",
    demoMode: "Contract not configured: the app is showing launch data.",
    leagueTitle: "An original league with no real-world brands",
    leagueText:
      "Every team, city, player, and jersey is invented so the project has its own identity and avoids existing league rights risk.",
    collectionTitle: "Jersey rarities",
    featuredTitle: "Featured jerseys",
    roadmapTitle: "Launch roadmap",
    socialTitle: "Social kit ready for X and Facebook",
    socialText:
      "The complete posts live in docs/social-posts.md, with FR/EN versions and no financial-promise language.",
    faqTitle: "FAQ",
    footer:
      "HockeyNFTLeague is a fictional universe. No real logo, player, club, championship, or uniform is used.",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export const teams: Team[] = [
  {
    id: "glacier-kings",
    city: "North Harbor",
    name: "Glacier Kings",
    arena: "Crown Ice Forum",
    colors: ["#bff7ff", "#16233f", "#f34f4f"],
    motto: {
      fr: "Pression froide, finition royale.",
      en: "Cold pressure, royal finish.",
    },
  },
  {
    id: "aurora-wolves",
    city: "Val-des-Lunes",
    name: "Aurora Wolves",
    arena: "Polar Ring",
    colors: ["#73ffd0", "#311b5f", "#f5f2d6"],
    motto: {
      fr: "Vitesse au nord, morsure en zone neutre.",
      en: "Northern speed, bite through the neutral zone.",
    },
  },
  {
    id: "forge-comets",
    city: "Ironbay",
    name: "Forge Comets",
    arena: "Anvil Arena",
    colors: ["#ff8a3d", "#101010", "#e9e4da"],
    motto: {
      fr: "Des tirs lourds, des retours rapides.",
      en: "Heavy shots, fast rebounds.",
    },
  },
  {
    id: "tidal-blades",
    city: "Rive-Nord",
    name: "Tidal Blades",
    arena: "Harborline Center",
    colors: ["#47b7ff", "#0d3b48", "#ffd166"],
    motto: {
      fr: "Chaque vague amène une mise en échec.",
      en: "Every wave brings another hit.",
    },
  },
  {
    id: "summit-phantoms",
    city: "Mont Argent",
    name: "Summit Phantoms",
    arena: "Peak House",
    colors: ["#d7d8ff", "#242149", "#ff4b8f"],
    motto: {
      fr: "Ils disparaissent, puis ils marquent.",
      en: "They disappear, then they score.",
    },
  },
  {
    id: "metro-lynx",
    city: "Nova City",
    name: "Metro Lynx",
    arena: "Neon Yard",
    colors: ["#f7ff59", "#172026", "#00c2ff"],
    motto: {
      fr: "Lecture rapide, attaque précise.",
      en: "Fast reads, precise attack.",
    },
  },
];

export const featuredJerseys: PlayerJersey[] = [
  {
    token: 7,
    name: "Mika Frost",
    teamId: "glacier-kings",
    position: "C",
    rarity: "Legendary",
    shot: 96,
    speed: 91,
    grit: 88,
    vision: 98,
  },
  {
    token: 18,
    name: "Noah Vey",
    teamId: "aurora-wolves",
    position: "RW",
    rarity: "Mythic",
    shot: 90,
    speed: 97,
    grit: 76,
    vision: 89,
  },
  {
    token: 44,
    name: "Axel Marrow",
    teamId: "forge-comets",
    position: "D",
    rarity: "Epic",
    shot: 83,
    speed: 78,
    grit: 95,
    vision: 82,
  },
  {
    token: 71,
    name: "Theo Sable",
    teamId: "summit-phantoms",
    position: "G",
    rarity: "Legendary",
    shot: 40,
    speed: 86,
    grit: 93,
    vision: 96,
  },
];

export const roadmap: RoadmapPhase[] = [
  {
    phase: "01",
    title: { fr: "Fondation", en: "Foundation" },
    status: { fr: "En construction", en: "In build" },
    items: {
      fr: ["Identité fictive", "Smart contract ERC-721", "Metadata 1000 jerseys"],
      en: ["Fictional identity", "ERC-721 smart contract", "1000 jersey metadata"],
    },
  },
  {
    phase: "02",
    title: { fr: "Testnet", en: "Testnet" },
    status: { fr: "Avant lancement", en: "Pre-launch" },
    items: {
      fr: ["Déploiement Polygon Amoy", "Tests mint", "Validation whitelist"],
      en: ["Polygon Amoy deploy", "Mint tests", "Whitelist validation"],
    },
  },
  {
    phase: "03",
    title: { fr: "Mint public", en: "Public mint" },
    status: { fr: "Lancement", en: "Launch" },
    items: {
      fr: ["Whitelist", "Mint public", "Reveal des jerseys"],
      en: ["Whitelist", "Public mint", "Jersey reveal"],
    },
  },
  {
    phase: "04",
    title: { fr: "Saison 1", en: "Season 1" },
    status: { fr: "Après mint", en: "Post-mint" },
    items: {
      fr: ["Classements communautaires", "Drops sociaux", "Votes détenteurs"],
      en: ["Community standings", "Social drops", "Holder votes"],
    },
  },
];

export const faqs: FaqItem[] = [
  {
    question: {
      fr: "Est-ce une vraie ligue de hockey?",
      en: "Is this a real hockey league?",
    },
    answer: {
      fr: "Non. C'est un univers original avec équipes, villes, joueurs et jerseys fictifs.",
      en: "No. It is an original universe with fictional teams, cities, players, and jerseys.",
    },
  },
  {
    question: {
      fr: "Pourquoi Polygon?",
      en: "Why Polygon?",
    },
    answer: {
      fr: "Polygon garde des frais bas pour une collection de 1000 NFT et reste compatible EVM.",
      en: "Polygon keeps fees low for a 1000 NFT collection while staying EVM compatible.",
    },
  },
  {
    question: {
      fr: "Quand le contrat sera-t-il actif?",
      en: "When will the contract be live?",
    },
    answer: {
      fr: "Le contrat doit d'abord passer les tests locaux et testnet avant toute adresse mainnet.",
      en: "The contract should pass local and testnet checks before any mainnet address is published.",
    },
  },
];

export const socialSnippets = {
  fr: [
    "1000 jerseys. 3 raretés. Une ligue de hockey entièrement originale.",
    "La whitelist ouvre la patinoire avant le mint public.",
  ],
  en: [
    "1000 jerseys. 3 rarities. One fully original hockey league.",
    "The whitelist takes the ice before public mint.",
  ],
};

export function teamById(id: string): Team {
  const team = teams.find((item) => item.id === id);
  if (!team) {
    return teams[0];
  }
  return team;
}
