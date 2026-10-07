import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Inbox, CheckSquare, Eye, ArrowRight, ShieldCheck, Blocks, Clock } from "lucide-react";
import { api } from "../../services/api";
import { LandApplication } from "../../types";

export const PendingApplicationsQueuePage: React.FC = () => {
  const [applications, setApplications] = useState<LandApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING_REVIEW" | "APPROVED_PENDING_BLOCKCHAIN">("ALL");

  useEffect(() => {
    api
      .listApplications()
      .then((data) => setApplications(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const pendingReviewCount = applications.filter((a) => a.status === "PENDING_REVIEW").length;
  const approvedPendingBcCount = applications.filter((a) => a.status === "APPROVED_PENDING_BLOCKCHAIN").length;

  const filteredApps = applications.filter((app) => {
    if (filter === "ALL") return true;
    return app.status === filter;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Government Authority", href: "/government/dashboard" },
          { label: "Pending Registration Queue" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Government Verification Queue
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Official scrutiny queue for submitted land registration applications awaiting municipal boundary verification and blockchain registration.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Registrar Console</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "ALL"
              ? "bg-midnight text-white shadow-xs"
              : "bg-white text-muted-slate hover:text-midnight border border-ivory-300"
          }`}
        >
          All Applications ({applications.length})
        </button>
        <button
          onClick={() => setFilter("PENDING_REVIEW")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "PENDING_REVIEW"
              ? "bg-midnight text-white shadow-xs"
              : "bg-white text-muted-slate hover:text-midnight border border-ivory-300"
          }`}
        >
          Pending Review ({pendingReviewCount})
        </button>
        <button
          onClick={() => setFilter("APPROVED_PENDING_BLOCKCHAIN")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
            filter === "APPROVED_PENDING_BLOCKCHAIN"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300"
          }`}
        >
          <Blocks className="w-3 h-3 mr-1" />
          <span>Approved — Pending Blockchain ({approvedPendingBcCount})</span>
        </button>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-slate">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-3" />
            Loading pending government applications queue...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Inbox className="w-8 h-8 text-gold" />}
              title="No Applications Found"
              description="There are currently no land registration applications in this filter view."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/80 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Survey Number</th>
                  <th className="py-3.5 px-4">Locality</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Area</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {filteredApps.map((app) => (
                  <tr key={app.id || app.applicationId} className="hover:bg-ivory-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-midnight">
                      {app.applicationId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-midnight">{app.applicantEmail || "Land Seller"}</div>
                      <div className="font-mono text-[10px] text-muted-slate truncate max-w-[120px]">
                        {app.applicantWallet}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-navy">
                      {app.surveyNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-midnight">{app.locality}</span>
                      <span className="text-[10px] text-muted-slate block">
                        {app.district}, {app.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-navy">
                      {app.landCategory}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {app.areaSqMeters ? `${app.areaSqMeters.toLocaleString()} Sq.M` : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-slate text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/government/applications/${app.applicationId}`}>
                        {app.status === "APPROVED_PENDING_BLOCKCHAIN" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Blocks className="w-3.5 h-3.5" />}
                          >
                            Finalize Blockchain
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                          >
                            Review Application
                          </Button>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
