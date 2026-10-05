import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import {
  Building2,
  MessageSquare,
  Activity,
  ArrowRight,
  Search,
  ExternalLink,
} from "lucide-react";
import { api } from "../../services/api";
import { LandRecord, AgentEnquiry } from "../../types";

export const AgentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [enquiries, setEnquiries] = useState<AgentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.searchRecords({ limit: 10 }), api.getAgentEnquiries()])
      .then(([recRes, enqRes]) => {
        setRecords(recRes.data);
        setEnquiries(enqRes);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight to-slate-navy text-white rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-wider block mb-1">
            Realty Agent Workspace
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {user?.displayName}
          </h1>
          <p className="text-xs text-slate-200 font-medium mt-1 max-w-xl">
            Browse verified public parcels for client matching, coordinate demonstration conveyances, and manage prospective buyer enquiries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/agent/listings">
            <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
              Browse Registry
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
                Verified Public Listings
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
            Available on decentralized registry
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Active Client Inquiries
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                {enquiries.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Prospective buyers awaiting response
          </p>
        </Card>

        <Card className="hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-slate uppercase tracking-wider block">
                Tracked Conveyances
              </span>
              <span className="text-2xl font-bold text-midnight mt-1 block">
                Active
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-muted-blue flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-muted-slate mt-3 border-t border-ivory-200 pt-2">
            Monitoring transaction progress
          </p>
        </Card>
      </div>

      {/* Two Columns: Recent Client Enquiries & Featured Parcels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enquiries */}
        <Card
          title="Recent Demonstration Client Enquiries"
          action={
            <Link to="/agent/enquiries" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          {enquiries.length === 0 ? (
            <p className="text-xs text-muted-slate py-4 text-center">No enquiries received yet.</p>
          ) : (
            <div className="divide-y divide-ivory-200 text-xs">
              {enquiries.slice(0, 3).map((e) => (
                <div key={e.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-midnight">{e.clientName}</span>
                    <span className="font-mono text-gold-dark font-semibold">{e.landId}</span>
                  </div>
                  <p className="text-muted-slate italic">"{e.message}"</p>
                  <p className="text-[11px] text-muted-slate">
                    Contact: {e.clientEmail} • {e.clientPhone || "No phone"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Available Properties */}
        <Card
          title="Permitted Public Records"
          action={
            <Link to="/agent/listings" className="text-xs text-gold-dark font-bold hover:underline flex items-center">
              Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        >
          <div className="divide-y divide-ivory-200 text-xs">
            {records.slice(0, 3).map((r) => (
              <div key={r.landId} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-gold-dark">{r.landId}</span>
                  <p className="font-medium text-midnight mt-0.5">{r.locality}</p>
                  <p className="text-[11px] text-muted-slate">
                    {r.parcelNumber} • {r.areaSqMeters.toLocaleString()} Sq.M
                  </p>
                </div>
                <Link to={`/records/${r.landId}`}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Inspect
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
