import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";
const DEFAULT_PRICE = 25_000_000_000_000_000n;

export default buildModule("HockeyNFTLeagueModule", (m) => {
  const owner = m.getAccount(0);
  const baseUri = m.getParameter("baseUri", "ipfs://REPLACE_WITH_METADATA_CID/");
  const merkleRoot = m.getParameter("merkleRoot", ZERO_ROOT);
  const mintPrice = m.getParameter("mintPrice", DEFAULT_PRICE);

  const hockeyNFTLeague = m.contract("HockeyNFTLeague", [baseUri, merkleRoot, mintPrice, owner]);

  return { hockeyNFTLeague };
});
