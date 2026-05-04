import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();
const PRICE = ethers.parseEther("0.025");
const BASE_URI = "ipfs://metadata/";

async function deployLeague() {
  const [owner, allowlisted, publicBuyer, outsider, treasury] = await ethers.getSigners();
  const tree = StandardMerkleTree.of([[allowlisted.address]], ["address"]);
  const proof = tree.getProof(0);
  const league = await ethers.deployContract("HockeyNFTLeague", [BASE_URI, tree.root, PRICE, owner.address]);

  return { allowlisted, league, outsider, owner, proof, publicBuyer, treasury };
}

describe("HockeyNFTLeague", function () {
  it("sets the fixed collection rules", async function () {
    const { league } = await deployLeague();

    expect(await league.MAX_SUPPLY()).to.equal(1000n);
    expect(await league.OWNER_RESERVE()).to.equal(50n);
    expect(await league.PUBLIC_SUPPLY()).to.equal(950n);
    expect(await league.MAX_PER_WALLET()).to.equal(3n);
    expect(await league.mintPrice()).to.equal(PRICE);
  });

  it("mints with a valid whitelist proof", async function () {
    const { allowlisted, league, proof } = await deployLeague();

    await league.setMintPhases(true, false);
    await expect(league.connect(allowlisted).whitelistMint(2, proof, { value: PRICE * 2n }))
      .to.emit(league, "Transfer")
      .withArgs(ethers.ZeroAddress, allowlisted.address, 1n);

    expect(await league.totalSupply()).to.equal(2n);
    expect(await league.mintedPerWallet(allowlisted.address)).to.equal(2n);
    expect(await league.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
  });

  it("rejects non-whitelisted wallets during whitelist mint", async function () {
    const { league, outsider, proof } = await deployLeague();

    await league.setMintPhases(true, false);
    await expect(league.connect(outsider).whitelistMint(1, proof, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "NotWhitelisted");
  });

  it("enforces public phase, exact payment, and wallet limit", async function () {
    const { league, publicBuyer } = await deployLeague();

    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "MintClosed");

    await league.setMintPhases(false, true);
    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE - 1n }))
      .to.be.revertedWithCustomError(league, "IncorrectPayment");

    await league.connect(publicBuyer).publicMint(3, { value: PRICE * 3n });
    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "WalletLimitExceeded");
  });

  it("protects the creator reserve and max supply", async function () {
    const { league, owner } = await deployLeague();

    await league.ownerMint(owner.address, 50);
    expect(await league.totalSupply()).to.equal(50n);
    expect(await league.reservedMinted()).to.equal(50n);

    await expect(league.ownerMint(owner.address, 1)).to.be.revertedWithCustomError(league, "ReserveExceeded");
  });

  it("can pause minting and withdraw funds", async function () {
    const { league, publicBuyer, treasury } = await deployLeague();

    await league.setMintPhases(false, true);
    await league.pause();
    await expect(league.connect(publicBuyer).publicMint(1, { value: PRICE }))
      .to.be.revertedWithCustomError(league, "EnforcedPause");

    await league.unpause();
    await league.connect(publicBuyer).publicMint(1, { value: PRICE });

    await expect(league.withdraw(treasury.address)).to.changeEtherBalances(
      ethers,
      [league, treasury],
      [-PRICE, PRICE],
    );
  });
});
