import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge } from "../../components/common/Badge";
import { Boxes, ExternalLink, RefreshCw, Cpu, Activity, Clock } from "lucide-react";
import { CONTRACT_ADDRESS, HARDHAT_CHAIN_ID } from "../../services/blockchain";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const BlockchainExplorerPage: React.FC = () => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .searchRecords({ limit: 50 })
      .then((res) => setRecords(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Government Dashboard", href: "/government/dashboard" },
          { label: "Blockchain Transaction Explorer" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Ledger & Block Explorer
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Real-time inspection of confirmed transactions, block heights, and smart contract state.
          </p>
        </div>
      </div>

      {/* Network & Contract Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <span className="text-[10px] text-muted-slate uppercase font-bold tracking-wider block">
            Smart Contract
          </span>
          <span className="font-mono text-xs font-bold text-gold-dark mt-1 block truncate">
            {CONTRACT_ADDRESS}
          </span>
          <span className="text-[11px] text-muted-slate mt-2 block">Solidity 0.8.24 Verified</span>
        </Card>

        <Card>
          <span className="text-[10px] text-muted-slate uppercase font-bold tracking-wider block">
            Chain Environment
          </span>
          <span className="text-base font-bold text-midnight mt-1 block">
            Hardhat Localhost (ChainID: {HARDHAT_CHAIN_ID})
          </span>
          <span className="text-[11px] text-muted-slate mt-2 block">RPC: http://127.0.0.1:8545</span>
        </Card>

        <Card>
          <span className="text-[10px] text-muted-slate uppercase font-bold tracking-wider block">
            Confirmed Ledger Entries
          </span>
          <span className="text-2xl font-bold text-midnight mt-1 block">
            {records.length} Parcels
          </span>
          <span className="text-[11px] text-status-success font-semibold mt-2 block">
            State: Fully Reconciled
          </span>
        </Card>
      </div>

      {/* Ledger Transactions Table */}
      <Card title="Confirmed On-Chain Transactions">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction Hash</th>
                <th className="py-3 px-4">Associated Land ID</th>
                <th className="py-3 px-4">Block Height</th>
                <th className="py-3 px-4">Document SHA-256 Hash</th>
                <th className="py-3 px-4">Owner Address</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {records.map((r) => (
                <tr key={r.landId} className="hover:bg-ivory-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-navy truncate max-w-[140px]">
                    <Link to={`/transactions/${r.transactionHash}`} className="hover:text-gold-dark hover:underline">
                      {r.transactionHash.slice(0, 10)}...{r.transactionHash.slice(-8)}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-gold-dark font-bold">
                    <Link to={`/records/${r.landId}`} className="hover:underline">
                      {r.landId}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-midnight">#{r.blockNumber}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-slate truncate max-w-[140px]">
                    {r.docIntegrityHash.slice(0, 10)}...
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-slate truncate max-w-[120px]">
                    {r.currentOwnerWallet.slice(0, 6)}...{r.currentOwnerWallet.slice(-4)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/records/${r.landId}`}>
                      <Button variant="ghost" size="sm" className="text-gold font-bold">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
