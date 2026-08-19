const Safe = require("@safe-global/protocol-kit").default;
require("dotenv").config();

/**
 * Déploie un Safe multisig sur le réseau courant (ex: Amoy), avec les mêmes
 * signataires et seuil qu'un Safe existant sur un autre réseau.
 *
 * Grâce au déploiement déterministe (CREATE2) de Safe, si le même factory,
 * les mêmes signataires (même ordre) et le même saltNonce sont utilisés,
 * l'adresse obtenue est identique sur toutes les chaînes EVM où le factory
 * Safe est déployé — ce qui est le cas sur la quasi-totalité des réseaux,
 * y compris généralement les nouveaux testnets comme Amoy.
 *
 * Variables requises dans .env :
 *   PRIVATE_KEY       — clé du wallet qui paie le gas de déploiement
 *   AMOY_RPC_URL       — RPC du réseau cible
 *   SAFE_OWNERS        — adresses des signataires, séparées par des virgules,
 *                        DANS LE MÊME ORDRE que sur le Safe existant
 *   SAFE_THRESHOLD      — seuil de signatures (ex: 2)
 *   SAFE_ADDRESS         — (optionnel) adresse attendue, pour vérification
 *
 * Usage :
 *   node scripts/deploy-safe.js
 */
async function main() {
  const rpcUrl = process.env.AMOY_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const owners = (process.env.SAFE_OWNERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const threshold = parseInt(process.env.SAFE_THRESHOLD || "2", 10);
  const expectedAddress = process.env.SAFE_ADDRESS;

  if (!rpcUrl || !privateKey) {
    throw new Error("AMOY_RPC_URL ou PRIVATE_KEY manquant dans .env");
  }
  if (owners.length < 2) {
    throw new Error(
      "SAFE_OWNERS manquant ou invalide dans .env — attend une liste séparée par des virgules, DANS LE MÊME ORDRE que le Safe existant."
    );
  }

  console.log("=".repeat(60));
  console.log("Déploiement du Safe multisig sur Amoy");
  console.log("=".repeat(60));
  console.log("Signataires :", owners);
  console.log("Seuil       :", threshold, "sur", owners.length);
  if (expectedAddress) console.log("Adresse attendue :", expectedAddress);
  console.log("=".repeat(60));

  const protocolKit = await Safe.init({
    provider: rpcUrl,
    signer: privateKey,
    predictedSafe: {
      safeAccountConfig: {
        owners,
        threshold,
      },
      // saltNonce par défaut ("0") — c'est ce qui doit matcher le Safe
      // existant pour obtenir la même adresse. Si le Safe d'origine a été
      // créé avec un saltNonce différent, il faudra le préciser ici.
    },
  });

  const predictedAddress = await protocolKit.getAddress();
  console.log("\nAdresse prédite pour ce nouveau Safe :", predictedAddress);

  if (expectedAddress && predictedAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.log("\n⚠️  ATTENTION : cette adresse NE correspond PAS à SAFE_ADDRESS.");
    console.log(
      "   Le saltNonce ou l'ordre des signataires diffère probablement de ton Safe existant."
    );
    console.log("   Le script s'arrête sans déployer — vérifie ces paramètres avant de continuer.");
    process.exit(1);
  }

  if (expectedAddress) {
    console.log("✅ L'adresse correspond exactement à ton Safe existant !");
  }

  console.log("\nDéploiement en cours...");
  const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();

  const client = await protocolKit.getSafeProvider().getExternalSigner();
  const txHash = await client.sendTransaction({
    to: deploymentTransaction.to,
    value: BigInt(deploymentTransaction.value),
    data: deploymentTransaction.data,
  });

  console.log("Transaction envoyée :", txHash);
  console.log("\nAttends la confirmation, puis vérifie sur Polygonscan Amoy :");
  console.log(`https://amoy.polygonscan.com/address/${predictedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
