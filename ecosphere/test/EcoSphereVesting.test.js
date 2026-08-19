const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EcoSphereVesting", function () {
  let token, vesting, owner, treasury, teamMember, advisor;
  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, treasury, teamMember, advisor] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("EcoSphereToken");
    token = await Token.deploy(treasury.address);
    await token.waitForDeployment();

    const Vesting = await ethers.getContractFactory("EcoSphereVesting");
    vesting = await Vesting.deploy(await token.getAddress());
    await vesting.waitForDeployment();

    // Seul "owner" détient le rôle DEFAULT_ADMIN_ROLE sur le contrat de vesting
    // (c'est lui qui l'a déployé). Le treasury lui transfère donc l'allocation
    // Team & Advisors (20M ECKO) avant approbation.
    await token.connect(treasury).transfer(owner.address, ethers.parseEther("20000000"));
    await token.connect(owner).approve(await vesting.getAddress(), ethers.parseEther("20000000"));
  });

  describe("Schedule Team (cliff 6 mois, vesting 24 mois)", function () {
    beforeEach(async function () {
      await vesting.connect(owner).createTeamSchedule(
        teamMember.address,
        ethers.parseEther("1000000")
      );
    });

    it("ne libère rien avant la fin du cliff (6 mois)", async function () {
      await time.increase(150 * DAY); // < 180 jours
      expect(await vesting.releasableAmount(teamMember.address)).to.equal(0);
    });

    it("libère une portion proportionnelle après le cliff", async function () {
      await time.increase(180 * DAY + 1); // juste après le cliff
      const releasable = await vesting.releasableAmount(teamMember.address);
      // ~ (180/730) * 1,000,000 ≈ 246,575 ECKO
      expect(releasable).to.be.closeTo(
        ethers.parseEther("246575"),
        ethers.parseEther("500")
      );
    });

    it("libère 100% après 24 mois complets", async function () {
      await time.increase(730 * DAY + 1);
      const releasable = await vesting.releasableAmount(teamMember.address);
      expect(releasable).to.equal(ethers.parseEther("1000000"));
    });

    it("permet au bénéficiaire de release ses tokens vested", async function () {
      await time.increase(730 * DAY + 1);
      await vesting.connect(teamMember).release();
      expect(await token.balanceOf(teamMember.address)).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Schedule Advisor (pas de cliff, vesting 12 mois)", function () {
    it("libère immédiatement une portion (pas de cliff)", async function () {
      await vesting.connect(owner).createAdvisorSchedule(
        advisor.address,
        ethers.parseEther("500000")
      );
      await time.increase(30 * DAY);
      const releasable = await vesting.releasableAmount(advisor.address);
      expect(releasable).to.be.gt(0);
    });
  });

  describe("Révocation", function () {
    it("permet de révoquer et retourne les tokens non-vested à l'admin", async function () {
      await vesting.connect(owner).createTeamSchedule(
        teamMember.address,
        ethers.parseEther("1000000")
      );
      await time.increase(365 * DAY); // 1 an sur 2

      const ownerBalanceBefore = await token.balanceOf(owner.address);
      await vesting.connect(owner).revoke(teamMember.address);
      const ownerBalanceAfter = await token.balanceOf(owner.address);

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });
  });
});
