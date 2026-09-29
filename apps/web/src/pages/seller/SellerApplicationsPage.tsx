import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { PlusCircle, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { api } from "../../services/api";
import { LandApplication } from "../../types";

export const SellerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<LandApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listApplications()
      .then((data) => setApplications(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Seller Dashboard", href: "/seller/dashboard" },
          { label: "Submitted Applications" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Submitted Land Applications
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Track the government review pipeline, document scrutiny, and blockchain verification status.
          </p>
        </div>

        <Link to="/seller/register-land">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      <Card noPadding>
        {applications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No Applications Submitted"
              description="Use the multi-step registration wizard to submit a property for verification."
              actionText="Register Land Parcel"
              onAction={() => (window.location.href = "/seller/register-land")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Parcel / Survey</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Area (Sq.M)</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-navy">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{app.surveyNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-midnight">{app.locality}</span>
                      <span className="text-[11px] text-muted-slate block">{app.district}, {app.state}</span>
                    </td>
                    <td className="py-3 px-4">{app.areaSqMeters.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-slate">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-4 text-muted-slate max-w-xs truncate">
                      {app.reviewNotes || "Pending initial government review"}
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
