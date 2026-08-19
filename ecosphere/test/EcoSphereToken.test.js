const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EcoSphereToken (ECKO)", function () {
  let token, owner, treasury, alice, bob;
  const TOTAL_SUPPLY = ethers.parseEther("100000000");

  beforeEach(async function () {
    [owner, treasury, alice, bob] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("EcoSphereToken");
    token = await Token.deploy(treasury.address);
    await token.waitForDeployment();
  });

  describe("Déploiement", function () {
    it("mint la supply totale (100M ECKO) vers le treasury", async function () {
      expect(await token.balanceOf(treasury.address)).to.equal(TOTAL_SUPPLY);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("attribue le nom et le ticker corrects", async function () {
      expect(await token.name()).to.equal("EcoSphere");
      expect(await token.symbol()).to.equal("ECKO");
    });

    it("attribue les rôles DEFAULT_ADMIN, PAUSER et MINTER au déployeur", async function () {
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      expect(await token.hasRole(adminRole, owner.address)).to.be.true;
      expect(await token.hasRole(await token.PAUSER_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.be.true;
    });
  });

  describe("Pause", function () {
    it("bloque les transferts quand le contrat est en pause", async function () {
      await token.connect(treasury).transfer(alice.address, ethers.parseEther("1000"));
      await token.pause();

      await expect(
        token.connect(alice).transfer(bob.address, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("refuse la pause à une adresse sans le rôle PAUSER", async function () {
      await expect(token.connect(alice).pause()).to.be.reverted;
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await token.connect(treasury).transfer(alice.address, ethers.parseEther("10000"));
    });

    it("permet de stake des tokens", async function () {
      await token.connect(alice).stake(ethers.parseEther("1000"));
      const info = await token.stakes(alice.address);
      expect(info.amount).to.equal(ethers.parseEther("1000"));
      expect(await token.totalStaked()).to.equal(ethers.parseEther("1000"));
    });

    it("accumule des récompenses proportionnelles au temps écoulé (5% APY)", async function () {
      await token.connect(alice).stake(ethers.parseEther("1000"));

      // avance le temps d'un an complet
      await time.increase(365 * 24 * 60 * 60);

      const pending = await token.pendingReward(alice.address);
      // 5% de 1000 = 50 ECKO (tolérance pour arrondis de bloc)
      expect(pending).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("0.1"));
    });

    it("permet de unstake et distribue la récompense", async function () {
      await token.connect(alice).stake(ethers.parseEther("1000"));
      await time.increase(365 * 24 * 60 * 60);

      const balanceBefore = await token.balanceOf(alice.address);
      await token.connect(alice).unstake(ethers.parseEther("1000"));
      const balanceAfter = await token.balanceOf(alice.address);

      // récupère le capital + récompense (~50 ECKO)
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethers.parseEther("1050"),
        ethers.parseEther("0.1")
      );
    });

    it("refuse un unstake supérieur au montant staké", async function () {
      await token.connect(alice).stake(ethers.parseEther("100"));
      await expect(
        token.connect(alice).unstake(ethers.parseEther("200"))
      ).to.be.revertedWith("invalid amount");
    });
  });

  describe("Gouvernance du taux de récompense", function () {
    it("permet à l'admin d'ajuster le taux (plafonné à 20%)", async function () {
      await token.setRewardRate(1000); // 10%
      expect(await token.rewardRateBps()).to.equal(1000);
    });

    it("refuse un taux supérieur à 20% APY", async function () {
      await expect(token.setRewardRate(2500)).to.be.revertedWith("rate too high");
    });

    it("refuse l'ajustement du taux à une adresse non-admin", async function () {
      await expect(token.connect(alice).setRewardRate(1000)).to.be.reverted;
    });
  });
});
