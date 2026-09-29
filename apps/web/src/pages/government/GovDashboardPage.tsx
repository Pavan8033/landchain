import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import {
  ShieldCheck,
  Inbox,
  GitPullRequest,
  Boxes,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Building2,
  Activity,
  UserCheck,
} from "lucide-react";
import { api } from "../../services/api";
import { LandApplication, TransferRequest, LandRecord } from "../../types";

export const GovDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, isCorrectNetwork, account } = useWallet();

  const [applications, setApplications] = useState<LandApplication[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listApplications(),
      api.listTransfers(),
      api.searchRecords({ limit: 50 }),
    ])
      .then(([appRes, trfRes, recRes]) => {
        setApplications(appRes);
        setTransfers(trfRes);
        setRecords(recRes.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const pendingRegQueue = applications.filter((a) => a.status === "PENDING_REVIEW");
  const pendingTransferQueue = transfers.filter((t) => t.status === "ACCEPTED_BY_BUYER");

  return (
    <div className="space-y-8">
      {/* Gov Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-slate-navy to-midnight text-white rounded-2xl p-6 sm:p-8 border border-gold/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Government Land Records Authority</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Registrar Overview & Scrutiny Workspace
          </h1>
          <p className="text-xs text-ivory-200 mt-1 max-w-xl">
            Authorized portal for regulatory scrutiny of title deeds, boundary verification, and cryptographic smart contract authorization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/government/queue">
            <Button variant="primary" size="md" leftIcon={<Inbox className="w-4 h-4" />}>
              Review Registrations ({pendingRegQueue.length})
            </Button>
          </Link>
          <Link to="/government/transfers">
            <Button variant="outline" size="md" className="border-gold/60 text-gold hover:bg-gold/10" leftIcon={<GitPullRequest className="w-4 h-4" />}>
              Authorize Transfers ({pendingTransferQueue.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Verifier Clearance Callout */}
      <div className="p-4 rounded-xl bg-ivory-100 border border-gold/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <UserCheck className="w-5 h-5 text-gold-dark shrink-0" />
          <div>
            <span className="font-bold text-midnight block">Government Verifier Clearance:</span>
            <span className="text-muted-slate font-mono">
              Registrar Signer: {account || "0x90F79bf6EB2c4f870365E785982E1f101E93b906"}
            </span>
          </div>
        </div>
        <Badge variant={isConnected && isCorrectNetwork ? "success" : "warning"}>
          {isConnected && isCorrectNetwork ? "Hardhat Node Ready" : "MetaMask Local Setup Recommended"}
        </Badge>
      </div>

      {/* Scrutiny KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Pending Registrations
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {pendingRegQueue.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-status-warning flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Awaiting survey scrutiny
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Pending Transfers
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {pendingTransferQueue.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-muted-blue flex items-center justify-center">
              <GitPullRequest className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Buyer consented, awaiting gov
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Verified On-Chain
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {records.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-status-success flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Active immutable parcels
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Blockchain Ledger
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                Local 31337
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Smart contract active
          </p>
        </Card>
      </div>

      {/* Two Columns: Registration Queue Preview & Transfer Approval Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Registration Applications */}
        <Card
          title="Registration Applications Awaiting Review"
          action={
            <Link to="/government/queue" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              Open Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          {pendingRegQueue.length === 0 ? (
            <p className="text-xs text-muted-slate py-4 text-center">No applications currently in queue.</p>
          ) : (
            <div className="divide-y divide-ivory-200 text-xs">
              {pendingRegQueue.slice(0, 3).map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-navy">{a.applicationId}</span>
                    <p className="font-medium text-midnight mt-0.5">
                      {a.surveyNumber} • {a.locality}
                    </p>
                    <p className="text-[11px] text-muted-slate">
                      Applicant: {a.applicantEmail}
                    </p>
                  </div>
                  <Link to={`/government/workspace?appId=${a.applicationId}`}>
                    <Button variant="outline" size="sm">
                      Inspect & Verify
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Transfers Awaiting Authorization */}
        <Card
          title="Ownership Transfers Awaiting Government Authorization"
          action={
            <Link to="/government/transfers" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              Open Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          {pendingTransferQueue.length === 0 ? (
            <p className="text-xs text-muted-slate py-4 text-center">No transfers awaiting authorization.</p>
          ) : (
            <div className="divide-y divide-ivory-200 text-xs">
              {pendingTransferQueue.slice(0, 3).map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-gold-dark">{t.transferId}</span>
                    <p className="font-medium text-midnight mt-0.5">
                      Land Ref: <span className="font-mono">{t.landId}</span>
                    </p>
                    <p className="text-[11px] text-muted-slate">
                      From: {t.sellerEmail} → To: {t.buyerEmail}
                    </p>
                  </div>
                  <Link to="/government/transfers">
                    <Button variant="primary" size="sm">
                      Review & Authorize
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
