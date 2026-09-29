import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Building2, Download, ExternalLink, History } from "lucide-react";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const BuyerOwnershipHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In demo mode, fetch records where buyer holds acquired parcel
    api
      .searchRecords({ limit: 50 })
      .then((res) => {
        // filter or show acquired sample records
        const acquired = res.data.filter((r) => r.transferCount > 0 || r.landId.includes("CHN"));
        setRecords(acquired.length > 0 ? acquired : res.data.slice(0, 1));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Buyer Dashboard", href: "/buyer/dashboard" },
          { label: "Acquired Properties & Title History" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Acquired Land Properties & Provenance
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Review properties acquired through completed on-chain ownership transfers, and download updated digital record certificates.
        </p>
      </div>

      <Card noPadding>
        {records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<History className="w-6 h-6" />}
              title="No Acquired Properties Yet"
              description="When a seller initiates a transfer and the government verifier executes it on-chain, your verified acquisitions appear here."
              actionText="Discover Land"
              onAction={() => (window.location.href = "/buyer/discovery")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Land ID</th>
                  <th className="py-3 px-4">Parcel / Survey</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Transfers Recorded</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {records.map((r) => (
                  <tr key={r.landId} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-gold-dark">{r.landId}</td>
                    <td className="py-3 px-4 font-mono">{r.parcelNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-midnight">{r.locality}</span>
                      <span className="text-[11px] text-muted-slate block">{r.district}, {r.state}</span>
                    </td>
                    <td className="py-3 px-4">{r.areaSqMeters.toLocaleString()} Sq.M</td>
                    <td className="py-3 px-4 font-semibold text-midnight">{r.transferCount} Completed</td>
                    <td className="py-3 px-4">{getStatusBadge(r.verificationState)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link to={`/records/${r.landId}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Inspect
                        </Button>
                      </Link>
                      <a
                        href={api.getCertificateDownloadUrl(r.landId)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs" leftIcon={<Download className="w-3 h-3" />}>
                          PDF
                        </Button>
                      </a>
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
