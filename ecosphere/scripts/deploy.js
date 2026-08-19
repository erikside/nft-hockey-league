const { ethers } = require("hardhat");

/**
 * Déploiement EcoSphere (ECKO) — Token + Vesting
 *
 * Le Safe multisig (2-sur-N) devient :
 *   - Treasury : destinataire des 100M ECKO mintés au déploiement
 *   - Admin    : détenteur de DEFAULT_ADMIN_ROLE, PAUSER_ROLE, MINTER_ROLE
 *                sur EcoSphereToken, et DEFAULT_ADMIN_ROLE sur EcoSphereVesting
 *
 * Le déployeur (clé EOA locale, PRIVATE_KEY du .env) perd tous ses rôles
 * admin à la fin du script. Toute action sensible post-déploiement
 * (pause, setRewardRate, createTeamSchedule, revoke...) devra donc être
 * exécutée via l'interface Safe (app.safe.global), avec 2 signatures.
 *
 * Usage :
 *   npx hardhat run scripts/deploy.js --network mumbai
 *   npx hardhat run scripts/deploy.js --network polygon
 */
async function main() {
  const safeAddress = process.env.SAFE_ADDRESS;
  if (!safeAddress || !ethers.isAddress(safeAddress)) {
    throw new Error(
      "SAFE_ADDRESS manquant ou invalide dans .env — renseigne l'adresse de ton Safe multisig."
    );
  }

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=".repeat(60));
  console.log("Déploiement EcoSphere (ECKO)");
  console.log("=".repeat(60));
  console.log("Réseau         :", network.name, `(chainId ${network.chainId})`);
  console.log("Déployeur      :", deployer.address);
  console.log("Safe (admin)   :", safeAddress);
  console.log("=".repeat(60));

  // --- 1. Déploiement du token, treasury = Safe ---
  console.log("\n[1/5] Déploiement EcoSphereToken...");
  const Token = await ethers.getContractFactory("EcoSphereToken");
  const token = await Token.deploy(safeAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("      EcoSphereToken déployé :", tokenAddress);

  // --- 2. Déploiement du contrat de vesting ---
  console.log("\n[2/5] Déploiement EcoSphereVesting...");
  const Vesting = await ethers.getContractFactory("EcoSphereVesting");
  const vesting = await Vesting.deploy(tokenAddress);
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("      EcoSphereVesting déployé :", vestingAddress);

  // --- 3. Transfert des rôles admin du Token vers le Safe ---
  console.log("\n[3/5] Transfert des rôles EcoSphereToken vers le Safe...");
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  const PAUSER_ROLE = await token.PAUSER_ROLE();
  const MINTER_ROLE = await token.MINTER_ROLE();

  await (await token.grantRole(PAUSER_ROLE, safeAddress)).wait();
  await (await token.grantRole(MINTER_ROLE, safeAddress)).wait();
  await (await token.grantRole(DEFAULT_ADMIN_ROLE, safeAddress)).wait();
  console.log("      Rôles PAUSER/MINTER/ADMIN accordés au Safe.");

  // --- 4. Transfert du rôle admin du Vesting vers le Safe ---
  console.log("\n[4/5] Transfert du rôle EcoSphereVesting vers le Safe...");
  const VESTING_ADMIN_ROLE = await vesting.DEFAULT_ADMIN_ROLE();
  await (await vesting.grantRole(VESTING_ADMIN_ROLE, safeAddress)).wait();
  console.log("      Rôle ADMIN accordé au Safe.");

  // --- 5. Le déployeur renonce à tous ses rôles ---
  console.log("\n[5/5] Le déployeur renonce à ses rôles...");
  await (await token.renounceRole(PAUSER_ROLE, deployer.address)).wait();
  await (await token.renounceRole(MINTER_ROLE, deployer.address)).wait();
  await (await token.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
  await (await vesting.renounceRole(VESTING_ADMIN_ROLE, deployer.address)).wait();
  console.log("      Déployeur : plus aucun rôle admin.");

  // --- Vérifications finales ---
  console.log("\n" + "=".repeat(60));
  console.log("Vérification finale");
  console.log("=".repeat(60));
  console.log(
    "Safe a bien DEFAULT_ADMIN_ROLE (token)   :",
    await token.hasRole(DEFAULT_ADMIN_ROLE, safeAddress)
  );
  console.log(
    "Déployeur a perdu DEFAULT_ADMIN_ROLE     :",
    !(await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address))
  );
  console.log(
    "Treasury (Safe) balance                  :",
    ethers.formatEther(await token.balanceOf(safeAddress)),
    "ECKO"
  );

  console.log("\n" + "=".repeat(60));
  console.log("Adresses à sauvegarder :");
  console.log("  EcoSphereToken   :", tokenAddress);
  console.log("  EcoSphereVesting :", vestingAddress);
  console.log("=".repeat(60));
  console.log(
    "\n⚠️  Étape suivante : vérifier les contrats sur Polygonscan"
  );
  console.log(
    `   npx hardhat verify --network ${network.name} ${tokenAddress} ${safeAddress}`
  );
  console.log(
    `   npx hardhat verify --network ${network.name} ${vestingAddress} ${tokenAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
