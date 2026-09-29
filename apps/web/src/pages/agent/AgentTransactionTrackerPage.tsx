import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { getStatusBadge } from "../../components/common/Badge";
import { Activity, Clock } from "lucide-react";
import { api } from "../../services/api";
import { TransferRequest } from "../../types";

export const AgentTransactionTrackerPage: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listTransfers()
      .then((data) => setTransfers(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Agent Dashboard", href: "/agent/dashboard" },
          { label: "Transaction Tracker" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Conveyancing Transaction Tracker
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Monitor the lifecycle of active land transfers through buyer acceptance and final government on-chain minting.
        </p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transfer Ref</th>
                <th className="py-3 px-4">Land ID</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-ivory-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-navy">{t.transferId}</td>
                  <td className="py-3 px-4 font-mono text-gold-dark font-semibold">
                    <Link to={`/records/${t.landId}`} className="hover:underline">
                      {t.landId}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{t.sellerEmail}</td>
                  <td className="py-3 px-4">{t.buyerEmail}</td>
                  <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td className="py-3 px-4 text-muted-slate font-medium">
                    {t.status === "PENDING_BUYER"
                      ? "Awaiting Buyer Consent"
                      : t.status === "ACCEPTED_BY_BUYER"
                      ? "Awaiting Gov Verification"
                      : t.status === "TRANSFERRED_ON_CHAIN"
                      ? "Completed On-Chain"
                      : t.status}
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
