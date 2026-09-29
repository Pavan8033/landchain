import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { ShieldAlert, Search, Clock, FileText } from "lucide-react";
import { api } from "../../services/api";
import { AuditLog } from "../../types";

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    api
      .getAuditLogs(100)
      .then((data) => setLogs(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(
    (l) => !filterAction || l.action.toLowerCase().includes(filterAction.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Government Dashboard", href: "/government/dashboard" },
          { label: "Immutable Audit Trail" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Immutable Audit Trail & Regulatory Logs
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Tamper-evident record of all privileged actions, status transitions, and on-chain transactions.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-3 rounded-xl border border-ivory-300 shadow-soft max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="Filter by action name or target ID..."
            className="w-full pl-9 pr-3 py-1.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <Card noPadding>
        {filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<ShieldAlert className="w-6 h-6" />}
              title="No Audit Records Found"
              description="Audit entries are logged automatically whenever sensitive operations occur."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Type & ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-navy font-medium">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-midnight">{log.action}</td>
                    <td className="py-3 px-4 text-muted-slate">{log.actorEmail}</td>
                    <td className="py-3 px-4">
                      <Badge variant="gold" size="sm">
                        {log.actorRole}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-midnight">{log.targetType}</span> •{" "}
                      <span className="font-mono text-gold-dark">{log.targetId}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-slate flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-muted-slate" />
                      {new Date(log.timestamp).toLocaleString()}
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
