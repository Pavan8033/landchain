import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import {
  Search,
  ArrowDownLeft,
  Building2,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../services/api";
import { TransferRequest, LandRecord } from "../../types";

export const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listTransfers(), api.searchRecords({ limit: 6 })])
      .then(([trfRes, recRes]) => {
        setTransfers(trfRes);
        setRecords(recRes.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const pendingOffers = transfers.filter((t) => t.status === "PENDING_BUYER");
  const acquiredParcels = transfers.filter((t) => t.status === "TRANSFERRED_ON_CHAIN");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-midnight to-slate-navy text-white rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-wider block mb-1">
            Buyer Portal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {user?.displayName}
          </h1>
          <p className="text-xs text-ivory-200 mt-1 max-w-xl">
            Explore verified land records, inspect unbroken on-chain title chains, and respond to incoming ownership transfer offers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/buyer/discovery">
            <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
              Discover Parcels
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
                Pending Transfer Offers
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {pendingOffers.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-status-warning flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Awaiting your explicit consent
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Acquired Properties
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {acquiredParcels.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-status-success flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Confirmed on-chain ownership
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Verified Registry
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {records.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Available for public discovery
          </p>
        </Card>
      </div>

      {/* Urgent Action Card if pending offers exist */}
      {pendingOffers.length > 0 && (
        <div className="p-6 rounded-xl bg-amber-50/80 border border-amber-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ArrowDownLeft className="w-6 h-6 text-status-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg font-bold text-midnight">
                Action Required: Incoming Transfer Offer Awaiting Your Review
              </h3>
              <p className="text-xs text-muted-slate mt-1">
                You have {pendingOffers.length} pending transfer offer(s). The seller cannot complete conveyancing until you explicitly accept or reject.
              </p>
            </div>
          </div>

          <Link to="/buyer/transfers">
            <Button variant="primary" size="md">
              Review Transfer Offers
            </Button>
          </Link>
        </div>
      )}

      {/* Featured Registry Parcels */}
      <Card
        title="Verified Registry Listings"
        subtitle="Cryptographically verified land records currently recorded on-chain"
        action={
          <Link to="/buyer/discovery" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
            Explore All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.slice(0, 3).map((r) => (
            <div key={r.landId} className="p-4 bg-ivory-50/60 rounded-xl border border-ivory-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-gold-dark">{r.landId}</span>
                {getStatusBadge(r.verificationState)}
              </div>
              <h4 className="font-serif text-base font-bold text-midnight truncate">{r.locality}</h4>
              <p className="text-xs text-muted-slate">
                Parcel {r.parcelNumber} • {r.areaSqMeters.toLocaleString()} Sq.M
              </p>
              <div className="pt-2">
                <Link to={`/records/${r.landId}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inspect Ledger
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
