const { ethers } = require("hardhat");

/**
 * Déploiement EcoSphereNFT — NFT eco-art avec répartition automatique
 * créateur/reforestation.
 *
 * Le Safe multisig devient :
 *   - Treasury de reforestation (reçoit 30% de chaque mint, immuable)
 *   - Admin (DEFAULT_ADMIN_ROLE, PAUSER_ROLE)
 *
 * Usage :
 *   npx hardhat run scripts/deploy-nft.js --network amoy --config hardhat.config.cjs
 */
async function main() {
  const safeAddress = process.env.SAFE_ADDRESS;
  if (!safeAddress || !ethers.isAddress(safeAddress)) {
    throw new Error("SAFE_ADDRESS manquant ou invalide dans .env");
  }

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=".repeat(60));
  console.log("Déploiement EcoSphereNFT");
  console.log("=".repeat(60));
  console.log("Réseau              :", network.name, `(chainId ${network.chainId})`);
  console.log("Déployeur           :", deployer.address);
  console.log("Safe (admin+treasury):", safeAddress);
  console.log("=".repeat(60));

  console.log("\n[1/3] Déploiement EcoSphereNFT...");
  const NFT = await ethers.getContractFactory("EcoSphereNFT");
  const nft = await NFT.deploy(safeAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("      EcoSphereNFT déployé :", nftAddress);

  console.log("\n[2/3] Transfert des rôles vers le Safe...");
  const DEFAULT_ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
  const PAUSER_ROLE = await nft.PAUSER_ROLE();

  await (await nft.grantRole(PAUSER_ROLE, safeAddress)).wait();
  await (await nft.grantRole(DEFAULT_ADMIN_ROLE, safeAddress)).wait();
  console.log("      Rôles PAUSER/ADMIN accordés au Safe.");

  console.log("\n[3/3] Le déployeur renonce à ses rôles...");
  await (await nft.renounceRole(PAUSER_ROLE, deployer.address)).wait();
  await (await nft.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
  console.log("      Déployeur : plus aucun rôle admin.");

  console.log("\n" + "=".repeat(60));
  console.log("Vérification finale");
  console.log("=".repeat(60));
  console.log(
    "Safe a bien DEFAULT_ADMIN_ROLE :",
    await nft.hasRole(DEFAULT_ADMIN_ROLE, safeAddress)
  );
  console.log(
    "Déployeur a perdu DEFAULT_ADMIN_ROLE :",
    !(await nft.hasRole(DEFAULT_ADMIN_ROLE, deployer.address))
  );
  console.log("Prix de mint :", ethers.formatEther(await nft.MINT_PRICE()), "MATIC");
  console.log("Part créateur :", (await nft.creatorShareBps()).toString(), "bps");

  console.log("\n" + "=".repeat(60));
  console.log("Adresse à sauvegarder :");
  console.log("  EcoSphereNFT :", nftAddress);
  console.log("=".repeat(60));
  console.log(
    `\n   npx hardhat verify --network ${network.name} --config hardhat.config.cjs ${nftAddress} ${safeAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
