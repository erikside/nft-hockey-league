import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();
const PRICE = ethers.parseEther("0.025");
const BASE_URI = "ipfs://metadata/";
const ROYALTY_BPS = 500n;
const ERC2981_INTERFACE_ID = "0x2a55205a";

async function deployLeagueV2() {
  const [owner, allowlisted, publicBuyer, outsider, treasury, royaltyReceiver] = await ethers.getSigners();
  const tree = StandardMerkleTree.of([[allowlisted.address]], ["address"]);
  const proof = tree.getProof(0);
  const league = await ethers.deployContract("HockeyNFTLeagueV2", [
    BASE_URI,
    tree.root,
    PRICE,
    owner.address,
    royaltyReceiver.address,
    ROYALTY_BPS,
  ]);

  return { allowlisted, league, outsider, owner, proof, publicBuyer, royaltyReceiver, treasury };
}

describe("HockeyNFTLeagueV2", function () {
  it("keeps the fixed collection rules and exposes ERC-2981 royalties", async function () {
    const { league, royaltyReceiver } = await deployLeagueV2();

    expect(await league.name()).to.equal("HockeyNFTLeagueV2");
    expect(await league.symbol()).to.equal("HNLV2");
    expect(await league.MAX_SUPPLY()).to.equal(1000n);
    expect(await league.OWNER_RESERVE()).to.equal(50n);
    expect(await league.PUBLIC_SUPPLY()).to.equal(950n);
    expect(await league.MAX_PER_WALLET()).to.equal(3n);
    expect(await league.mintPrice()).to.equal(PRICE);
    expect(await league.supportsInterface(ERC2981_INTERFACE_ID)).to.equal(true);

    const [receiver, amount] = await league.royaltyInfo(1, ethers.parseEther("1"));
    expect(receiver).to.equal(royaltyReceiver.address);
    expect(amount).to.equal(ethers.parseEther("0.05"));
  });

  it("lets the owner update and delete the default royalty", async function () {
    const { league, outsider, treasury } = await deployLeagueV2();

    await expect(league.connect(outsider).setDefaultRoyalty(treasury.address, 750))
      .to.be.revertedWithCustomError(league, "OwnableUnauthorizedAccount");

    await expect(league.setDefaultRoyalty(treasury.address, 750))
      .to.emit(league, "DefaultRoyaltyUpdated")
      .withArgs(treasury.address, 750);

    let [receiver, amount] = await league.royaltyInfo(1, ethers.parseEther("2"));
    expect(receiver).to.equal(treasury.address);
    expect(amount).to.equal(ethers.parseEther("0.15"));

    await expect(league.deleteDefaultRoyalty()).to.emit(league, "DefaultRoyaltyDeleted");
    [receiver, amount] = await league.royaltyInfo(1, ethers.parseEther("2"));
    expect(receiver).to.equal(ethers.ZeroAddress);
    expect(amount).to.equal(0n);
  });

  it("mints with a valid whitelist proof", async function () {
    const { allowlisted, league, proof } = await deployLeagueV2();

    await league.setMintPhases(true, false);
    await expect(league.connect(allowlisted).whitelistMint(2, proof, { value: PRICE * 2n }))
      .to.emit(league, "Transfer")
      .withArgs(ethers.ZeroAddress, allowlisted.address, 1n);

    expect(await league.totalSupply()).to.equal(2n);
    expect(await league.mintedPerWallet(allowlisted.address)).to.equal(2n);
    expect(await league.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
  });

  it("rejects non-whitelisted wallets during whitelist mint", async function () {
    const { league, outsider, proof } = await deployLeagueV2();

    await league.setMintPhases(true, false);
    await expect(league.connect(outsider).whitelistMint(1, proof, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "NotWhitelisted");
  });

  it("enforces public phase, exact payment, and wallet limit", async function () {
    const { league, publicBuyer } = await deployLeagueV2();

    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "MintClosed");

    await league.setMintPhases(false, true);
    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE - 1n }))
      .to.be.revertedWithCustomError(league, "IncorrectPayment");

    await league.connect(publicBuyer).publicMint(3, { value: PRICE * 3n });
    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "WalletLimitExceeded");
  });

  it("protects the creator reserve and can withdraw funds", async function () {
    const { league, owner, publicBuyer, treasury } = await deployLeagueV2();

    await league.ownerMint(owner.address, 50);
    expect(await league.totalSupply()).to.equal(50n);
    expect(await league.reservedMinted()).to.equal(50n);
    await expect(league.ownerMint(owner.address, 1)).to.be.revertedWithCustomError(league, "ReserveExceeded");

    await league.setMintPhases(false, true);
    await league.connect(publicBuyer).publicMint(1, { value: PRICE });

    await expect(league.withdraw(treasury.address)).to.changeEtherBalances(
      ethers,
      [league, treasury],
      [-PRICE, PRICE],
    );
  });
});
