export type Locale = "fr" | "en";

export type Rarity = "Epic" | "Mythic" | "Legendary";

export type Team = {
  id: string;
  city: string;
  name: string;
  arena: string;
  colors: string[];
  image: string;
  motto: Record<Locale, string>;
};

export type PlayerJersey = {
  token: number;
  name: string;
  teamId: string;
  position: string;
  rarity: Rarity;
  shot: number;
  speed: number;
  grit: number;
  vision: number;
};

export type RoadmapPhase = {
  phase: string;
  title: Record<Locale, string>;
  status: Record<Locale, string>;
  items: Record<Locale, string[]>;
};

export type FaqItem = {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
};

export type ContractState = {
  maxSupply: number;
  minted: number;
  remaining: number;
  mintPrice: bigint;
  whitelistActive: boolean;
  publicActive: boolean;
  mintedByWallet: number;
};

export type MintPhase = "whitelist" | "public";

export type WalletOption = {
  id: string;
  name: string;
  icon?: string;
  rdns?: string;
  provider: EthereumProvider;
};
