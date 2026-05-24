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
    chooseWallet: "Choisir un wallet",
    refreshWallets: "Rafraichir",
    noWallet:
      "Aucun wallet detecte dans ce navigateur. Ouvre l'app dans un wallet mobile ou installe/active ton extension.",
    openMetaMask: "Ouvrir dans un wallet",
    mobileWalletHint:
      "Sur mobile, utilise un lien wallet ci-dessus. Sur ordinateur, active l'extension puis rafraichis la liste.",
    connected: "Wallet connecte",
    readingChain: "Lecture",
    chainReadUnavailable:
      "Lecture on-chain indisponible pour le moment. La page ne montre pas de phase live tant que Polygon ne repond pas.",
    heroTitle: "Hockey NFT League",
    heroText:
      "Un pilote Web3 de hockey avec 1000 jerseys ERC-721, des equipes originales, des stats de joueur et une base concue pour evoluer vers un projet plus officiel si les droits necessaires sont obtenus.",
    pilotText:
      "Phase pilote independante: aucune affiliation actuelle avec la LNH/NHL, ses equipes ou ses joueurs. L'objectif long terme est de preparer un dossier plus large avec droits, promotions et partenaires officiels.",
    primaryCta: "Preparer le mint",
    secondaryCta: "Voir les jerseys",
    mintTitle: "Centre de mint",
    supply: "Supply",
    minted: "mintes",
    remaining: "restants",
    walletLimit: "Limite: 3 NFT par wallet",
    ownerReserve: "Reserve createur: 50 NFT",
    walletMinted: "Mintes par ce wallet",
    walletLimitReached: "Limite atteinte",
    whitelist: "Whitelist",
    publicMint: "Public",
    quantity: "Quantite",
    mintNow: "Minter",
    switchNetwork: "Changer reseau",
    demoMode: "Contrat non configure: l'app affiche les donnees de lancement.",
    leagueTitle: "Six clubs originaux, un vrai terrain pilote",
    leagueText:
      "Chaque equipe, ville, joueur et jersey est invente. Cette premiere collection sert de preuve de concept avant toute approche de droits officiels, promotions de marque ou extension vers une ligue sous licence.",
    collectionTitle: "Jerseys NFT avec stats joueur",
    featuredTitle: "Vitrine des jerseys",
    roadmapTitle: "Roadmap: pilote, mint, puis ambition officielle",
    socialTitle: "Kit social pret pour X et Facebook",
    socialText:
      "Les publications completes sont dans docs/social-posts.md, avec versions FR/EN et un ton sans promesse financiere.",
    faqTitle: "Questions frequentes",
    footer:
      "HockeyNFTLeague est un univers fictif et independant. Aucun logo, joueur, club, championnat ou uniforme reel n'est utilise.",
  },
  en: {
    nav: ["Mint", "League", "Collection", "Roadmap", "FAQ"],
    connect: "Connect",
    chooseWallet: "Choose a wallet",
    refreshWallets: "Refresh",
    noWallet:
      "No wallet detected in this browser. Open the app in a mobile wallet or install/enable your extension.",
    openMetaMask: "Open in wallet",
    mobileWalletHint:
      "On mobile, use one of the wallet links above. On desktop, enable the extension and refresh the list.",
    connected: "Wallet connected",
    readingChain: "Reading",
    chainReadUnavailable:
      "On-chain read is temporarily unavailable. The page will not show a live phase until Polygon responds.",
    heroTitle: "Hockey NFT League",
    heroText:
      "A Web3 hockey pilot with 1000 ERC-721 jerseys, original teams, player stats, and a foundation designed to evolve into a more official project if the required rights are secured.",
    pilotText:
      "Independent pilot phase: no current affiliation with the NHL, its teams, or its players. The long-term goal is to prepare a larger rights, promotion, and official partner path.",
    primaryCta: "Prepare mint",
    secondaryCta: "View jerseys",
    mintTitle: "Mint center",
    supply: "Supply",
    minted: "minted",
    remaining: "remaining",
    walletLimit: "Limit: 3 NFTs per wallet",
    ownerReserve: "Creator reserve: 50 NFTs",
    walletMinted: "Minted by this wallet",
    walletLimitReached: "Limit reached",
    whitelist: "Whitelist",
    publicMint: "Public",
    quantity: "Quantity",
    mintNow: "Mint",
    switchNetwork: "Switch network",
    demoMode: "Contract not configured: the app is showing launch data.",
    leagueTitle: "Six original clubs, one real pilot field",
    leagueText:
      "Every team, city, player, and jersey is invented. This first collection acts as a proof of concept before any official rights, brand promotion, or licensed-league expansion.",
    collectionTitle: "NFT jerseys with player stats",
    featuredTitle: "Jersey showcase",
    roadmapTitle: "Roadmap: pilot, mint, then official ambition",
    socialTitle: "Social kit ready for X and Facebook",
    socialText:
      "The complete posts live in docs/social-posts.md, with FR/EN versions and no financial-promise language.",
    faqTitle: "FAQ",
    footer:
      "HockeyNFTLeague is an independent fictional universe. No real logo, player, club, championship, or uniform is used.",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export const teams: Team[] = [
  {
    id: "glacier-kings",
    city: "North Harbor",
    name: "Glacier Kings",
    arena: "Crown Ice Forum",
    colors: ["#bff7ff", "#16233f", "#f34f4f"],
    image: "/nft-assets/jerseys/glacier-kings.png",
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
    image: "/nft-assets/jerseys/aurora-wolves.jpg",
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
    image: "/nft-assets/jerseys/forge-comets.png",
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
    image: "/nft-assets/jerseys/tidal-blades.png",
    motto: {
      fr: "Chaque vague amene une mise en echec.",
      en: "Every wave brings another hit.",
    },
  },
  {
    id: "summit-phantoms",
    city: "Mont Argent",
    name: "Summit Phantoms",
    arena: "Peak House",
    colors: ["#d7d8ff", "#242149", "#ff4b8f"],
    image: "/nft-assets/jerseys/summit-phantoms.png",
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
    image: "/nft-assets/jerseys/metro-lynx.png",
    motto: {
      fr: "Lecture rapide, attaque precise.",
      en: "Fast reads, precise attack.",
    },
  },
];

export const featuredJerseys: PlayerJersey[] = [
  {
    token: 1,
    name: "Noah Sable",
    teamId: "glacier-kings",
    position: "LW",
    rarity: "Legendary",
    shot: 94,
    speed: 96,
    grit: 88,
    vision: 99,
  },
  {
    token: 2,
    name: "Theo Rune",
    teamId: "aurora-wolves",
    position: "RW",
    rarity: "Legendary",
    shot: 96,
    speed: 98,
    grit: 91,
    vision: 93,
  },
  {
    token: 7,
    name: "Niko Vey",
    teamId: "forge-comets",
    position: "D",
    rarity: "Mythic",
    shot: 90,
    speed: 86,
    grit: 97,
    vision: 84,
  },
  {
    token: 18,
    name: "Mika Frost",
    teamId: "tidal-blades",
    position: "C",
    rarity: "Mythic",
    shot: 88,
    speed: 97,
    grit: 80,
    vision: 92,
  },
  {
    token: 44,
    name: "Axel Marrow",
    teamId: "summit-phantoms",
    position: "G",
    rarity: "Epic",
    shot: 42,
    speed: 84,
    grit: 94,
    vision: 96,
  },
  {
    token: 71,
    name: "Kai North",
    teamId: "metro-lynx",
    position: "C",
    rarity: "Epic",
    shot: 86,
    speed: 93,
    grit: 79,
    vision: 91,
  },
];

export const roadmap: RoadmapPhase[] = [
  {
    phase: "01",
    title: { fr: "Pilote independant", en: "Independent pilot" },
    status: { fr: "En production", en: "In production" },
    items: {
      fr: ["Univers fictif", "Jerseys originaux", "Aucune marque reelle"],
      en: ["Fictional universe", "Original jerseys", "No real-world brands"],
    },
  },
  {
    phase: "02",
    title: { fr: "Contrat et securite", en: "Contract and security" },
    status: { fr: "Safe 2 signatures", en: "2-signature Safe" },
    items: {
      fr: ["ERC-721 sur Polygon", "Royalties vers Safe", "Base URI Cloudflare"],
      en: ["ERC-721 on Polygon", "Royalties to Safe", "Cloudflare base URI"],
    },
  },
  {
    phase: "03",
    title: { fr: "Mint et communaute", en: "Mint and community" },
    status: { fr: "Lancement", en: "Launch" },
    items: {
      fr: ["Whitelist", "Mint public", "Reveal des jerseys"],
      en: ["Whitelist", "Public mint", "Jersey reveal"],
    },
  },
  {
    phase: "04",
    title: { fr: "Promotions pilote", en: "Pilot promotions" },
    status: { fr: "Apres mint", en: "Post-mint" },
    items: {
      fr: ["Concours communautaires", "Drops sociaux", "Votes detenteurs"],
      en: ["Community contests", "Social drops", "Holder votes"],
    },
  },
  {
    phase: "05",
    title: { fr: "Evolution droits officiels", en: "Official rights path" },
    status: { fr: "Vision long terme", en: "Long-term vision" },
    items: {
      fr: ["Dossier droits LNH/NHL", "Partenariats autorises", "Promotions sous licence"],
      en: ["NHL rights dossier", "Authorized partners", "Licensed promotions"],
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
      fr: "Non. C'est un pilote independant avec equipes, villes, joueurs et jerseys fictifs.",
      en: "No. It is an independent pilot with fictional teams, cities, players, and jerseys.",
    },
  },
  {
    question: {
      fr: "Est-ce affilie a la LNH/NHL?",
      en: "Is this affiliated with the NHL?",
    },
    answer: {
      fr: "Non. L'ambition long terme est de preparer une evolution avec droits officiels, mais aucune affiliation n'est active actuellement.",
      en: "No. The long-term ambition is to prepare an official-rights evolution, but there is no active affiliation today.",
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
];

export const socialSnippets = {
  fr: [
    "1000 jerseys. 3 raretes. Une ligue de hockey entierement originale.",
    "Un pilote Web3 hockey aujourd'hui, une ambition officielle demain si les droits suivent.",
  ],
  en: [
    "1000 jerseys. 3 rarities. One fully original hockey league.",
    "A Web3 hockey pilot today, an official-rights ambition tomorrow if the rights path opens.",
  ],
};

export function teamById(id: string): Team {
  const team = teams.find((item) => item.id === id);
  if (!team) {
    return teams[0];
  }
  return team;
}
