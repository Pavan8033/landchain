import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { EmptyState } from "../../components/common/EmptyState";
import { MessageSquare, Mail, Phone, ExternalLink } from "lucide-react";
import { api } from "../../services/api";
import { AgentEnquiry } from "../../types";

export const ClientEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AgentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAgentEnquiries()
      .then((data) => setEnquiries(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Agent Dashboard", href: "/agent/dashboard" },
          { label: "Client Inquiries" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Client Property Inquiries
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Review buyer and investor inquiries submitted through verified public property records.
        </p>
      </div>

      <Card noPadding>
        {enquiries.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<MessageSquare className="w-6 h-6" />}
              title="No Inquiries Yet"
              description="Prospective buyers inspecting public records can submit inquiries directly to you."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Inquiry Ref</th>
                  <th className="py-3 px-4">Land ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Inquiry Message</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-navy">
                      {e.enquiryId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gold-dark">
                      <Link to={`/records/${e.landId}`} className="hover:underline">
                        {e.landId}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-semibold text-midnight">{e.clientName}</td>
                    <td className="py-3 px-4">
                      <div>{e.clientEmail}</div>
                      <div className="text-[11px] text-muted-slate">{e.clientPhone || "—"}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-slate max-w-xs truncate italic">
                      "{e.message}"
                    </td>
                    <td className="py-3 px-4 text-muted-slate">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a href={`mailto:${e.clientEmail}?subject=Regarding Land Parcel ${e.landId}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Reply Email
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
