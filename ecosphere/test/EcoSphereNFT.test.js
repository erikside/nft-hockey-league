const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoSphereNFT", function () {
  let nft, owner, treasury, creator, buyer;
  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, treasury, creator, buyer] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("EcoSphereNFT");
    nft = await NFT.deploy(treasury.address);
    await nft.waitForDeployment();
  });

  describe("Deploiement", function () {
    it("attribue le nom et le symbole corrects", async function () {
      expect(await nft.name()).to.equal("EcoSphere Eco-Art");
      expect(await nft.symbol()).to.equal("ECOART");
    });

    it("fixe le treasury de reforestation immuable", async function () {
      expect(await nft.reforestationTreasury()).to.equal(treasury.address);
    });

    it("fixe la repartition par defaut a 70/30", async function () {
      expect(await nft.creatorShareBps()).to.equal(7000);
    });
  });

  describe("Mint", function () {
    it("mint un NFT et l'attribue au createur", async function () {
      await nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE });
      expect(await nft.ownerOf(0)).to.equal(creator.address);
      expect(await nft.totalMinted()).to.equal(1);
    });

    it("stocke le bon tokenURI", async function () {
      await nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE });
      expect(await nft.tokenURI(0)).to.equal("ipfs://metadata1");
    });

    it("refuse un prix incorrect", async function () {
      await expect(
        nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("prix incorrect");
    });

    it("refuse un metadataURI vide", async function () {
      await expect(
        nft.connect(creator).mintEcoArt("", { value: MINT_PRICE })
      ).to.be.revertedWith("metadataURI vide");
    });

    it("repartit correctement les fonds (70% createur / 30% treasury)", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);

      const tx = await nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);

      // creator paie MINT_PRICE + gas, mais recoit 70% de MINT_PRICE en retour
      const expectedCreatorDelta = -MINT_PRICE + (MINT_PRICE * 7000n / 10000n) - gasCost;
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(expectedCreatorDelta);

      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(MINT_PRICE * 3000n / 10000n);
    });

    it("emet l'evenement EcoArtMinted", async function () {
      await expect(nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE }))
        .to.emit(nft, "EcoArtMinted")
        .withArgs(0, creator.address, "ipfs://metadata1", MINT_PRICE * 7000n / 10000n, MINT_PRICE * 3000n / 10000n);
    });

    it("incremente le tokenId a chaque mint", async function () {
      await nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE });
      await nft.connect(buyer).mintEcoArt("ipfs://metadata2", { value: MINT_PRICE });
      expect(await nft.ownerOf(0)).to.equal(creator.address);
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });
  });

  describe("Pause", function () {
    it("bloque le mint quand le contrat est en pause", async function () {
      await nft.pause();
      await expect(
        nft.connect(creator).mintEcoArt("ipfs://metadata1", { value: MINT_PRICE })
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");
    });

    it("refuse la pause a une adresse sans le role PAUSER", async function () {
      await expect(nft.connect(creator).pause()).to.be.reverted;
    });
  });

  describe("Gouvernance de la repartition", function () {
    it("permet a l'admin d'ajuster la part createur", async function () {
      await nft.setCreatorShare(8000);
      expect(await nft.creatorShareBps()).to.equal(8000);
    });

    it("refuse une part hors limites (50-90%)", async function () {
      await expect(nft.setCreatorShare(4000)).to.be.revertedWith("part hors limites (50-90%)");
      await expect(nft.setCreatorShare(9500)).to.be.revertedWith("part hors limites (50-90%)");
    });

    it("refuse l'ajustement a une adresse non-admin", async function () {
      await expect(nft.connect(creator).setCreatorShare(8000)).to.be.reverted;
    });
  });
});
