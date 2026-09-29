import React from "react";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge } from "../../components/common/Badge";
import { Wallet, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, HelpCircle } from "lucide-react";
import { HARDHAT_CHAIN_ID, CONTRACT_ADDRESS } from "../../services/blockchain";

export const WalletPage: React.FC = () => {
  const {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    balance,
    connect,
    disconnect,
    switchToLocalNetwork,
    error,
  } = useWallet();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ label: "MetaMask Wallet & Network Diagnostics" }]} />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">Wallet & Ledger Network</h1>
        <p className="text-xs text-muted-slate mt-1">
          Verify your Ethereum wallet connection and local Hardhat network parameters.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-status-error/40 text-status-error text-xs flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Status Card */}
        <Card title="MetaMask Connection Status">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <span className="text-muted-slate font-medium">Connection State:</span>
              {isConnected ? (
                <span className="inline-flex items-center text-status-success font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
                </span>
              ) : (
                <span className="text-muted-slate">Disconnected</span>
              )}
            </div>

            <div>
              <span className="text-muted-slate block font-medium mb-1">Active Wallet Address:</span>
              <div className="p-2.5 bg-ivory-50 rounded-lg font-mono text-midnight truncate border border-ivory-200">
                {account || "No wallet connected"}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-slate font-medium">Account Balance:</span>
              <span className="font-mono font-bold text-midnight">
                {balance !== null ? `${balance} ETH` : "—"}
              </span>
            </div>

            <div className="pt-4 border-t border-ivory-200 flex space-x-3">
              {isConnected ? (
                <Button variant="danger" size="sm" onClick={disconnect}>
                  Disconnect Wallet
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={connect} leftIcon={<Wallet className="w-3.5 h-3.5" />}>
                  Connect MetaMask
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Network Diagnostics Card */}
        <Card title="Ledger Network Diagnostics">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <span className="text-muted-slate font-medium">Current Chain ID:</span>
              <span className="font-mono font-bold text-midnight">
                {chainId !== null ? chainId : "Unknown"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <span className="text-muted-slate font-medium">Expected Chain ID:</span>
              <span className="font-mono font-bold text-gold-dark">{HARDHAT_CHAIN_ID} (Hardhat)</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <span className="text-muted-slate font-medium">Network Validation:</span>
              {isCorrectNetwork ? (
                <Badge variant="success">Hardhat Localhost (31337)</Badge>
              ) : (
                <Badge variant="warning">Network Mismatch</Badge>
              )}
            </div>

            <div>
              <span className="text-muted-slate block font-medium mb-1">Contract Deployment:</span>
              <div className="p-2 bg-ivory-50 rounded font-mono text-[11px] text-midnight truncate border border-ivory-200">
                {CONTRACT_ADDRESS}
              </div>
            </div>

            {!isCorrectNetwork && isConnected && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={switchToLocalNetwork}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Switch to Local Hardhat Network (31337)
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Local Development Guide Card */}
      <Card title="Connecting MetaMask to Local Hardhat Node">
        <div className="space-y-3 text-xs text-muted-slate leading-relaxed">
          <p>
            For demonstration testing on your local computer:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-2">
            <li>Ensure the Hardhat node is running in your terminal via: <code className="bg-ivory-200 px-1 py-0.5 rounded font-mono text-midnight">npm run node --workspace=blockchain</code></li>
            <li>In MetaMask, add a custom RPC network with RPC URL: <code className="bg-ivory-200 px-1 py-0.5 rounded font-mono text-midnight">http://127.0.0.1:8545</code> and Chain ID: <code className="bg-ivory-200 px-1 py-0.5 rounded font-mono text-midnight">31337</code>.</li>
            <li>Import one of Hardhat's default test account private keys into MetaMask for signing test transactions with 10,000 test ETH.</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};
