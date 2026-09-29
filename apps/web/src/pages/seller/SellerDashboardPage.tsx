import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import {
  FileText,
  Clock,
  ArrowRightLeft,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { api } from "../../services/api";
import { LandRecord, LandApplication, TransferRequest } from "../../types";

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [applications, setApplications] = useState<LandApplication[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.searchRecords({ limit: 10 }),
      api.listApplications(),
      api.listTransfers(),
    ])
      .then(([recRes, appRes, trfRes]) => {
        setRecords(recRes.data);
        setApplications(appRes);
        setTransfers(trfRes);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const pendingAppsCount = applications.filter((a) => a.status === "PENDING_REVIEW").length;
  const activeTransfersCount = transfers.filter(
    (t) => t.status === "PENDING_BUYER" || t.status === "ACCEPTED_BY_BUYER"
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-midnight to-slate-navy text-white rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-wider block mb-1">
            Seller Overview Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {user?.displayName}
          </h1>
          <p className="text-xs text-ivory-200 mt-1 max-w-xl">
            Manage your registered parcels, submit new registration applications with document hashes, and track ownership conveyances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/seller/register-land">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Register New Land
            </Button>
          </Link>
          <Link to="/seller/create-transfer">
            <Button variant="outline" size="md" className="border-gold/50 text-gold hover:bg-gold/10" leftIcon={<ArrowRightLeft className="w-4 h-4" />}>
              Initiate Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Owned Verified Parcels
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {records.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Confirmed on Ethereum ledger
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Applications In Review
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {pendingAppsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-status-warning flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Awaiting government scrutiny
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Active Transfer Requests
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {activeTransfersCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-muted-blue flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Multi-party consent in progress
          </p>
        </Card>
      </div>

      {/* Two Column Section: Owned Parcels & Submitted Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Owned Parcels Table */}
        <Card
          title="My Registered Land Parcels"
          action={
            <Link to="/seller/records" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          {records.length === 0 ? (
            <p className="text-xs text-muted-slate py-4 text-center">No parcels registered yet.</p>
          ) : (
            <div className="divide-y divide-ivory-200 text-xs">
              {records.slice(0, 3).map((r) => (
                <div key={r.landId} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-gold-dark">{r.landId}</span>
                    <p className="text-midnight font-medium mt-0.5">{r.locality}</p>
                    <p className="text-[11px] text-muted-slate">
                      Parcel {r.parcelNumber} • {r.areaSqMeters.toLocaleString()} Sq.M
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(r.verificationState)}
                    <Link to={`/records/${r.landId}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Applications Tracking Table */}
        <Card
          title="Recent Registration Applications"
          action={
            <Link to="/seller/applications" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          {applications.length === 0 ? (
            <p className="text-xs text-muted-slate py-4 text-center">No applications submitted yet.</p>
          ) : (
            <div className="divide-y divide-ivory-200 text-xs">
              {applications.slice(0, 3).map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-navy">{a.applicationId}</span>
                    <p className="text-midnight font-medium mt-0.5">
                      {a.surveyNumber} • {a.locality}
                    </p>
                    <p className="text-[11px] text-muted-slate">
                      Submitted: {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(a.status)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
