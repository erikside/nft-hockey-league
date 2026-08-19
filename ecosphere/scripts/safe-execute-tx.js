const Safe = require("@safe-global/protocol-kit").default;
require("dotenv").config();

/**
 * Exécute une transaction via le Safe 2-sur-N directement on-chain, sans
 * passer par app.safe.global (utile tant qu'Amoy n'est pas listé dans
 * l'interface web de Safe).
 *
 * Fonctionnement : le premier signataire (PRIVATE_KEY_SIGNER_1) crée et
 * signe la transaction, le second (PRIVATE_KEY_SIGNER_2) la signe à son
 * tour puis l'exécute — reproduisant exactement le flux "2 signatures
 * requises" qu'offrirait l'interface, mais en ligne de commande.
 *
 * Variables requises dans .env :
 *   AMOY_RPC_URL
 *   SAFE_ADDRESS            — adresse du Safe déployé (0x61364c04...E0e8)
 *   PRIVATE_KEY_SIGNER_1    — clé du 1er signataire
 *   PRIVATE_KEY_SIGNER_2    — clé du 2e signataire
 *
 * Configuration de la transaction à exécuter : voir la section
 * "TRANSACTION À EXÉCUTER" ci-dessous — à adapter selon le besoin
 * (exemple fourni : appel à setRewardRate sur EcoSphereToken).
 *
 * Usage :
 *   node scripts/safe-execute-tx.js
 */
async function main() {
  const rpcUrl = process.env.AMOY_RPC_URL;
  const safeAddress = process.env.SAFE_ADDRESS;
  const signer1Key = process.env.PRIVATE_KEY_SIGNER_1;
  const signer2Key = process.env.PRIVATE_KEY_SIGNER_2;

  if (!rpcUrl || !safeAddress || !signer1Key || !signer2Key) {
    throw new Error(
      "Variables manquantes dans .env : AMOY_RPC_URL, SAFE_ADDRESS, PRIVATE_KEY_SIGNER_1, PRIVATE_KEY_SIGNER_2"
    );
  }

  // ─────────────────────────────────────────────────────────────
  // TRANSACTION À EXÉCUTER — adapte cette section selon le besoin.
  // Exemple ici : appel à setRewardRate(1000) sur EcoSphereToken (10% APY).
  // ─────────────────────────────────────────────────────────────
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x80d5645b2F6E7cf24e16f287d12Cfd2C031Bf019";
  const { ethers } = require("ethers"); // package ethers direct — pas de require("hardhat")
                                          // pour éviter toute collision avec la config
                                          // Hardhat 3/TypeScript du projet HockeyNFTLeague
                                          // à la racine du repo.
  const tokenInterface = new ethers.Interface([
    "function setRewardRate(uint256 newRateBps)",
  ]);
  const callData = tokenInterface.encodeFunctionData("setRewardRate", [1000]);

  const safeTransactionData = {
    to: TOKEN_ADDRESS,
    value: "0",
    data: callData,
  };
  // ─────────────────────────────────────────────────────────────

  console.log("=".repeat(60));
  console.log("Exécution d'une transaction Safe 2-sur-2 (on-chain, sans UI)");
  console.log("=".repeat(60));
  console.log("Safe   :", safeAddress);
  console.log("Cible  :", safeTransactionData.to);
  console.log("Data   :", safeTransactionData.data);
  console.log("=".repeat(60));

  // --- Signataire 1 : crée et signe la transaction ---
  console.log("\n[1/3] Signataire 1 : création + 1ère signature...");
  const safe1 = await Safe.init({
    provider: rpcUrl,
    signer: signer1Key,
    safeAddress,
  });

  let safeTransaction = await safe1.createTransaction({
    transactions: [safeTransactionData],
  });
  safeTransaction = await safe1.signTransaction(safeTransaction);
  console.log("      Signé par le signataire 1.");

  // --- Signataire 2 : signe à son tour ---
  console.log("\n[2/3] Signataire 2 : 2ème signature...");
  const safe2 = await Safe.init({
    provider: rpcUrl,
    signer: signer2Key,
    safeAddress,
  });
  safeTransaction = await safe2.signTransaction(safeTransaction);
  console.log("      Signé par le signataire 2. Seuil 2/2 atteint.");

  // --- Exécution ---
  console.log("\n[3/3] Exécution on-chain...");
  const result = await safe2.executeTransaction(safeTransaction);
  console.log("      Transaction envoyée :", result.hash);
  console.log(`\nVérifie sur : https://amoy.polygonscan.com/tx/${result.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
