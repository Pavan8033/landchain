import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const testSeller = signers[1] || deployer;
  const testBuyer = signers[2] || deployer;
  const governmentVerifier = signers[3] || deployer;
  const testAgent = signers[4] || deployer;

  const network = await ethers.provider.getNetwork();

  console.log("=========================================");
  console.log("Deploying LandRegistry Smart Contract");
  console.log("=========================================");
  console.log("Network Name / ChainId:", network.name, `(${network.chainId})`);
  console.log("Deployer Address:", deployer.address);
  console.log("Gov Verifier Address:", governmentVerifier.address);
  console.log("Test Seller Address:", testSeller.address);
  console.log("Test Buyer Address:", testBuyer.address);

  const LandRegistryFactory = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistryFactory.deploy(governmentVerifier.address);

  await landRegistry.waitForDeployment();
  const contractAddress = await landRegistry.getAddress();

  console.log("LandRegistry deployed to:", contractAddress);

  // If local network with multiple signers, seed initial sample parcels
  if (Number(network.chainId) === 31337 || Number(network.chainId) === 1337) {
    console.log("Seeding sample academic land records onto blockchain...");
    const verifierContract = landRegistry.connect(governmentVerifier);

    const sampleLands = [
      {
        id: "LAND-KA-BLR-001",
        parcel: "SY-104/2B",
        owner: testSeller.address,
        locality: "Indiranagar, Bengaluru, Karnataka",
        area: 2400,
        docHash: "0x4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      },
      {
        id: "LAND-MH-PUN-002",
        parcel: "CTS-892/A",
        owner: testSeller.address,
        locality: "Kothrud, Pune, Maharashtra",
        area: 3200,
        docHash: "0x89d2a67e123fcb9a071239aa8e37bcdeff12048593a105c9382b7194628aa410",
      },
      {
        id: "LAND-TN-CHN-003",
        parcel: "PLOT-45/SEC-3",
        owner: testBuyer.address,
        locality: "Adyar, Chennai, Tamil Nadu",
        area: 1800,
        docHash: "0x34a1b0c9f87d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a",
      },
      {
        id: "LAND-KA-BLR-804",
        parcel: "SY-502/7A",
        owner: testSeller.address,
        locality: "Whitefield, Bengaluru, Karnataka",
        area: 2400,
        docHash: "0xa8f7c9e1029348fbca73891048293740192837465019283746501928374650123",
      },
    ];

    for (const land of sampleLands) {
      const tx = await verifierContract.registerLand(
        land.id,
        land.parcel,
        land.owner,
        land.locality,
        land.area,
        land.docHash
      );
      await tx.wait();
      console.log(`Registered on-chain: ${land.id} (Owner: ${land.owner})`);
    }
  }

  // Export contract deployment address and ABI to web and api directories
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    address: contractAddress,
    deployer: deployer.address,
    governmentVerifier: governmentVerifier.address,
    testSeller: testSeller.address,
    testBuyer: testBuyer.address,
    testAgent: testAgent ? testAgent.address : undefined,
    deployedAt: new Date().toISOString(),
  };

  const artifactPath = path.join(__dirname, "../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    abi = artifact.abi;
  }

  const exportPayload = {
    ...deploymentInfo,
    abi,
  };

  // Save in blockchain directory
  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(exportPayload, null, 2)
  );

  // Ensure directories in apps/web and apps/api exist and copy
  const webContractDir = path.join(__dirname, "../../apps/web/src/contracts");
  const apiContractDir = path.join(__dirname, "../../apps/api/src/contracts");

  if (!fs.existsSync(webContractDir)) {
    fs.mkdirSync(webContractDir, { recursive: true });
  }
  if (!fs.existsSync(apiContractDir)) {
    fs.mkdirSync(apiContractDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(webContractDir, "LandRegistry.json"),
    JSON.stringify(exportPayload, null, 2)
  );
  fs.writeFileSync(
    path.join(apiContractDir, "LandRegistry.json"),
    JSON.stringify(exportPayload, null, 2)
  );

  console.log("Deployment info exported to apps/web and apps/api!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
