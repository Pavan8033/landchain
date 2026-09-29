import * as fs from "fs";
import * as path from "path";

async function main() {
  const artifactPath = path.join(__dirname, "../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found! Run 'hardhat compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const webContractDir = path.join(__dirname, "../../apps/web/src/contracts");
  const apiContractDir = path.join(__dirname, "../../apps/api/src/contracts");

  if (!fs.existsSync(webContractDir)) {
    fs.mkdirSync(webContractDir, { recursive: true });
  }
  if (!fs.existsSync(apiContractDir)) {
    fs.mkdirSync(apiContractDir, { recursive: true });
  }

  const exportData = {
    contractName: artifact.contractName,
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(webContractDir, "LandRegistryAbi.json"),
    JSON.stringify(exportData, null, 2)
  );
  fs.writeFileSync(
    path.join(apiContractDir, "LandRegistryAbi.json"),
    JSON.stringify(exportData, null, 2)
  );

  console.log("ABI exported successfully to web and api packages.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
