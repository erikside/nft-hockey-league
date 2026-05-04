import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";
const DEFAULT_PRICE = 25_000_000_000_000_000n;
const DEFAULT_ROYALTY_BPS = 500;

export default buildModule("HockeyNFTLeagueV2Module", (m) => {
  const owner = m.getAccount(0);
  const baseUri = m.getParameter("baseUri", "ipfs://REPLACE_WITH_METADATA_CID/");
  const merkleRoot = m.getParameter("merkleRoot", ZERO_ROOT);
  const mintPrice = m.getParameter("mintPrice", DEFAULT_PRICE);
  const royaltyReceiver = m.getParameter("royaltyReceiver");
  const royaltyFeeNumerator = m.getParameter("royaltyFeeNumerator", DEFAULT_ROYALTY_BPS);

  const hockeyNFTLeagueV2 = m.contract("HockeyNFTLeagueV2", [
    baseUri,
    merkleRoot,
    mintPrice,
    owner,
    royaltyReceiver,
    royaltyFeeNumerator,
  ]);

  return { hockeyNFTLeagueV2 };
});
