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

/**
 * Cleanly format and parse Web3 / MetaMask / RPC error messages
 */
export function formatBlockchainError(err: any): string {
  if (!err) return "Unknown blockchain error.";
  const msg = err.message || String(err);

  if (err.code === 4001 || msg.includes("rejected") || msg.includes("denied")) {
    return "MetaMask transaction signature was cancelled by user.";
  }
  if (msg.includes("-32002") || msg.includes("RPC endpoint returned too many errors") || msg.includes("rate limit")) {
    return "RPC Endpoint Busy / Rate Limited (-32002). The connected RPC endpoint is unavailable or throttled.";
  }
  if (msg.includes("could not coalesce error") || msg.includes("eth_blockNumber")) {
    return "Local blockchain node at http://127.0.0.1:8545 is not running or RPC connection timed out.";
  }
  if (msg.includes("fetch failed") || msg.includes("NetworkError") || msg.includes("connection refused")) {
    return "Cannot connect to local Ethereum node (127.0.0.1:8545). Please verify Hardhat node is running.";
  }
  if (msg.includes("execution reverted")) {
    return `Smart contract reverted: ${msg.split("reverted:")[1] || "Condition failed"}`;
  }
  return msg.length > 120 ? `${msg.substring(0, 120)}...` : msg;
}

/**
 * Generate cryptographic simulated on-chain receipt for resilient demonstration
 */
export async function generateSimulatedOnChainReceipt(
  identifier: string,
  prefix: string = "REG"
): Promise<{ txHash: string; blockNumber: number }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${prefix}-${identifier}-${Date.now()}-${Math.random()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const txHash = `0x${hexHash}`;
  const blockNumber = Math.floor(18000000 + (Date.now() % 1000000));
  return { txHash, blockNumber };
}

// Contract Operations
export async function registerLandOnChain(
  params: {
    landId: string;
    parcelNumber: string;
    ownerWallet: string;
    locality: string;
    areaSqMeters: number;
    docHash: string;
  },
  forceSimulate: boolean = false
): Promise<{ txHash: string; blockNumber: number; isSimulated?: boolean }> {
  if (forceSimulate) {
    const sim = await generateSimulatedOnChainReceipt(params.landId, "LAND_REG");
    return { ...sim, isSimulated: true };
  }

  try {
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
      isSimulated: false,
    };
  } catch (err: any) {
    // If it's a user rejection, throw immediately
    if (err.code === 4001 || err.message?.includes("rejected")) {
      throw err;
    }
    // Re-throw with enriched information for the caller
    throw err;
  }
}

export async function initiateTransferOnChain(
  params: {
    landId: string;
    buyerWallet: string;
  },
  forceSimulate: boolean = false
): Promise<{ txHash: string; blockNumber: number; isSimulated?: boolean }> {
  if (forceSimulate) {
    const sim = await generateSimulatedOnChainReceipt(params.landId, "TX_INIT");
    return { ...sim, isSimulated: true };
  }

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

export async function acceptTransferOnChain(
  landId: string,
  forceSimulate: boolean = false
): Promise<{ txHash: string; blockNumber: number; isSimulated?: boolean }> {
  if (forceSimulate) {
    const sim = await generateSimulatedOnChainReceipt(landId, "TX_ACCEPT");
    return { ...sim, isSimulated: true };
  }

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

export async function rejectTransferOnChain(
  landId: string,
  forceSimulate: boolean = false
): Promise<{ txHash: string; blockNumber: number; isSimulated?: boolean }> {
  if (forceSimulate) {
    const sim = await generateSimulatedOnChainReceipt(landId, "TX_REJECT");
    return { ...sim, isSimulated: true };
  }

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

export async function authorizeTransferOnChain(
  landId: string,
  forceSimulate: boolean = false
): Promise<{ txHash: string; blockNumber: number; isSimulated?: boolean }> {
  if (forceSimulate) {
    const sim = await generateSimulatedOnChainReceipt(landId, "TX_AUTH");
    return { ...sim, isSimulated: true };
  }

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
