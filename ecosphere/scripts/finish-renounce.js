const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * Reprend le déploiement EcoSphere là où il s'est arrêté : fait renoncer le
 * déployeur à ses rôles restants sur Token/Vesting. Idempotent — vérifie
 * l'état actuel avant chaque action, donc sans risque de le relancer
 * plusieurs fois ou après une interruption partielle.
 *
 * Variables requises dans .env :
 *   TOKEN_ADDRESS, VESTING_ADDRESS (ou passe-les en argument ci-dessous)
 *   PRIVATE_KEY (celle du déployeur)
 *
 * Usage :
 *   npx hardhat run scripts/finish-renounce.js --network amoy --config hardhat.config.cjs
 */
async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x118783bb34D3269F28Cf6320aE95fD4e2a9186C6";
  const VESTING_ADDRESS = process.env.VESTING_ADDRESS || "0x4d315e5999acb07923AD90bf6a386301F718a791";
  const SAFE_ADDRESS = process.env.SAFE_ADDRESS;

  if (!SAFE_ADDRESS) {
    throw new Error("SAFE_ADDRESS manquant dans .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Déployeur :", deployer.address);
  console.log("Safe      :", SAFE_ADDRESS);

  const token = await ethers.getContractAt("EcoSphereToken", TOKEN_ADDRESS);
  const vesting = await ethers.getContractAt("EcoSphereVesting", VESTING_ADDRESS);

  const PAUSER_ROLE = await token.PAUSER_ROLE();
  const MINTER_ROLE = await token.MINTER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  const VESTING_ADMIN_ROLE = await vesting.DEFAULT_ADMIN_ROLE();

  // --- Étape manquante éventuelle : accorder le rôle Vesting au Safe ---
  const safeHasVestingRole = await vesting.hasRole(VESTING_ADMIN_ROLE, SAFE_ADDRESS);
  if (!safeHasVestingRole) {
    console.log("… Octroi du rôle Vesting/DEFAULT_ADMIN_ROLE au Safe (étape manquante)...");
    const tx = await vesting.grantRole(VESTING_ADMIN_ROLE, SAFE_ADDRESS);
    await tx.wait();
    console.log("✓ Safe a maintenant le rôle admin sur Vesting.");
  } else {
    console.log("✓ Safe a déjà le rôle admin sur Vesting.");
  }

  async function renounceIfNeeded(contract, role, roleName, label) {
    const has = await contract.hasRole(role, deployer.address);
    if (!has) {
      console.log(`✓ ${label} : déjà renoncé, rien à faire.`);
      return;
    }
    console.log(`… ${label} : renonciation en cours...`);
    const tx = await contract.renounceRole(role, deployer.address);
    await tx.wait();
    console.log(`✓ ${label} : fait.`);
  }

  await renounceIfNeeded(token, PAUSER_ROLE, "PAUSER_ROLE", "Token / PAUSER_ROLE");
  await renounceIfNeeded(token, MINTER_ROLE, "MINTER_ROLE", "Token / MINTER_ROLE");
  await renounceIfNeeded(token, DEFAULT_ADMIN_ROLE, "DEFAULT_ADMIN_ROLE", "Token / DEFAULT_ADMIN_ROLE");
  await renounceIfNeeded(vesting, VESTING_ADMIN_ROLE, "DEFAULT_ADMIN_ROLE", "Vesting / DEFAULT_ADMIN_ROLE");

  console.log("\n=== Vérification finale ===");
  console.log(
    "Déployeur a encore un rôle sur Token   :",
    (await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)) ||
      (await token.hasRole(PAUSER_ROLE, deployer.address)) ||
      (await token.hasRole(MINTER_ROLE, deployer.address))
  );
  console.log(
    "Déployeur a encore un rôle sur Vesting :",
    await vesting.hasRole(VESTING_ADMIN_ROLE, deployer.address)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
