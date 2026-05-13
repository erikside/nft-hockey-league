/// <reference types="vite/client" />

type EthereumRequest = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

interface EthereumProvider {
  isCoinbaseWallet?: boolean;
  isMetaMask?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  providers?: EthereumProvider[];
  request(args: EthereumRequest): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

type Eip6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo;
  provider: EthereumProvider;
};

type Eip6963AnnounceProviderEvent = CustomEvent<Eip6963ProviderDetail>;

interface WindowEventMap {
  "eip6963:announceProvider": Eip6963AnnounceProviderEvent;
}

interface Window {
  ethereum?: EthereumProvider;
}
