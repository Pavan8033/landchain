import { ethers } from "ethers";
import LandRegistryAbi from "../contracts/LandRegistryAbi.json";
import LandRegistryDeployment from "../contracts/LandRegistry.json";

// Default local Hardhat network configuration
export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_ID_HEX = "0x7a69";

export const LOCAL_NETWORK_PARAMS = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: "Hardhat Localhost 8545",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://127.0.0.1:8545"],
};

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_LAND_REGISTRY_CONTRACT_ADDRESS ||
  (LandRegistryDeployment as any)?.address ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function isMetaMaskAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function getWeb3Provider(): Promise<ethers.BrowserProvider> {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask is not detected. Please install the MetaMask browser extension.");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function requestAccountConnection(): Promise<string> {
  const provider = await getWeb3Provider();
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts selected in wallet.");
  }
  return accounts[0];
}

export async function checkAndSwitchNetwork(): Promise<boolean> {
  if (!isMetaMaskAvailable()) return false;
  try {
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(currentChainId, 16) === HARDHAT_CHAIN_ID) {
      return true;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Network not added yet; add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [LOCAL_NETWORK_PARAMS],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error: any) {
    console.warn("Network switch warning:", error.message);
    return false;
  }
}

export async function getLandRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider): Promise<ethers.Contract> {
  let target = signerOrProvider;
  if (!target) {
    const provider = await getWeb3Provider();
    target = await provider.getSigner();
  }
  return new ethers.Contract(CONTRACT_ADDRESS, LandRegistryAbi.abi, target);
}

// Contract Operations
export async function registerLandOnChain(params: {
  landId: string;
  parcelNumber: string;
  ownerWallet: string;
  locality: string;
  areaSqMeters: number;
  docHash: string;
}): Promise<{ txHash: string; blockNumber: number }> {
  await checkAndSwitchNetwork();
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  const contract = await getLandRegistryContract(signer);

  const tx = await contract.registerLand(
    params.landId,
    params.parcelNumber,
    params.ownerWallet,
    params.locality,
    BigInt(params.areaSqMeters),
    params.docHash
  );

  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function initiateTransferOnChain(params: {
  landId: string;
  buyerWallet: string;
}): Promise<{ txHash: string; blockNumber: number }> {
  await checkAndSwitchNetwork();
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  const contract = await getLandRegistryContract(signer);

  const tx = await contract.initiateTransfer(params.landId, params.buyerWallet);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function acceptTransferOnChain(landId: string): Promise<{ txHash: string; blockNumber: number }> {
  await checkAndSwitchNetwork();
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  const contract = await getLandRegistryContract(signer);

  const tx = await contract.acceptTransfer(landId);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function rejectTransferOnChain(landId: string): Promise<{ txHash: string; blockNumber: number }> {
  await checkAndSwitchNetwork();
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  const contract = await getLandRegistryContract(signer);

  const tx = await contract.rejectTransfer(landId);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function authorizeTransferOnChain(landId: string): Promise<{ txHash: string; blockNumber: number }> {
  await checkAndSwitchNetwork();
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  const contract = await getLandRegistryContract(signer);

  const tx = await contract.authorizeTransfer(landId);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function getLandRecordOnChain(landId: string) {
  let provider: ethers.Provider;
  try {
    if (isMetaMaskAvailable()) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
    }
  } catch {
    provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, LandRegistryAbi.abi, provider);
  const res = await contract.getLand(landId);
  return {
    landId: res[0],
    parcelNumber: res[1],
    currentOwner: res[2],
    isVerified: res[3],
    registeredAt: Number(res[4]),
    locality: res[5],
    areaSqMeters: Number(res[6]),
    docHash: res[7],
    transferCount: Number(res[8]),
  };
}
