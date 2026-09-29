import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  isMetaMaskAvailable,
  requestAccountConnection,
  checkAndSwitchNetwork,
  HARDHAT_CHAIN_ID,
} from "../services/blockchain";

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToLocalNetwork: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = account !== null;
  const isCorrectNetwork = chainId === HARDHAT_CHAIN_ID;

  const updateBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(address);
        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      }
    } catch (e) {
      setBalance("0.0000");
    }
  };

  const connect = async () => {
    setError(null);
    if (!isMetaMaskAvailable()) {
      setError("MetaMask extension not found. Please install MetaMask to interact with the local blockchain.");
      return;
    }

    try {
      setIsConnecting(true);
      const acc = await requestAccountConnection();
      setAccount(acc);

      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      await updateBalance(acc);
      localStorage.setItem("landchain_connected_wallet", acc);
    } catch (err: any) {
      setError(err.message || "Failed connecting to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    localStorage.removeItem("landchain_connected_wallet");
  };

  const switchToLocalNetwork = async () => {
    try {
      await checkAndSwitchNetwork();
      if (window.ethereum) {
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(parseInt(chainIdHex, 16));
      }
    } catch (err: any) {
      setError("Failed switching to Hardhat network: " + err.message);
    }
  };

  useEffect(() => {
    if (isMetaMaskAvailable()) {
      // Auto-reconnect if previously authorized
      const savedWallet = localStorage.getItem("landchain_connected_wallet");
      if (savedWallet) {
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              updateBalance(accounts[0]);
              window.ethereum
                .request({ method: "eth_chainId" })
                .then((cid: string) => setChainId(parseInt(cid, 16)));
            }
          })
          .catch(() => {});
      }

      // Event listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = (newChainIdHex: string) => {
        setChainId(parseInt(newChainIdHex, 16));
        if (account) updateBalance(account);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [account]);

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        balance,
        connect,
        disconnect,
        switchToLocalNetwork,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
