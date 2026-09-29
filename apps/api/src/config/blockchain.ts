import { ethers } from "ethers";
import * as path from "path";
import * as fs from "fs";

const RPC_URL =
  process.env.RPC_URL ||
  process.env.BLOCKCHAIN_RPC_URL ||
  "https://ethereum-sepolia-rpc.publicnode.com";

let CONTRACT_ABI: any[] = [];

export function resolveContractConfig(): { address: string; abi: any[] } {
  let address =
    process.env.LAND_REGISTRY_CONTRACT_ADDRESS ||
    "0x6c50d40D48bA45f9D3061910f2d7c23EBC15f63d";
  let abi = CONTRACT_ABI;
  try {
    const deploymentPath = path.resolve(__dirname, "../contracts/LandRegistry.json");
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
      if (deployment.address) address = deployment.address;
      if (deployment.abi && deployment.abi.length > 0) {
        abi = deployment.abi;
        CONTRACT_ABI = abi;
      }
    }
  } catch {
    // Artifact reading fallback
  }
  return { address, abi };
}

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getLandRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  const { address, abi } = resolveContractConfig();
  return new ethers.Contract(address, abi, provider);
}

export async function checkBlockchainConnectivity(): Promise<{ connected: boolean; blockNumber?: number; error?: string }> {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    return { connected: true, blockNumber };
  } catch (error: any) {
    return { connected: false, error: error.message || "Failed to connect to Ethereum node" };
  }
}

export async function getLandOnChain(landId: string) {
  try {
    const contract = getLandRegistryContract();
    const result = await contract.getLand(landId);
    const rawOwner = result.currentOwner || result[2] || "";
    let normalizedOwner = rawOwner;
    try {
      if (rawOwner && ethers.isAddress(rawOwner)) {
        normalizedOwner = ethers.getAddress(rawOwner);
      }
    } catch {
      // fallback to raw
    }

    return {
      landId: result.id || result[0] || landId,
      parcelNumber: result.parcelNumber || result[1] || "",
      currentOwner: normalizedOwner,
      isVerified: Boolean(result.isVerified !== undefined ? result.isVerified : result[3]),
      registeredAt: Number(result.registeredAt !== undefined ? result.registeredAt : result[4] || 0),
      locality: result.locality || result[5] || "",
      areaSqMeters: Number(result.areaSqMeters !== undefined ? result.areaSqMeters : result[6] || 0),
      docHash: result.docHash || result[7] || "",
      transferCount: Number(result.transferCount !== undefined ? result.transferCount : result[8] || 0),
    };
  } catch (error: any) {
    throw new Error(`Failed to query on-chain record for ${landId}: ${error.message}`);
  }
}
