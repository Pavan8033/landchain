import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { KeyRound, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { api } from "../../services/api";
import { UserRole } from "../../types";

export const RoleAdminPage: React.FC = () => {
  const [targetUid, setTargetUid] = useState("");
  const [targetRole, setTargetRole] = useState<UserRole>("government");
  const [adminSecret, setAdminSecret] = useState("landchain-academic-secret-key-2026");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const res = await api.setRole(targetUid, targetRole, adminSecret);
      setSuccessMsg(res.message || `Role '${targetRole}' granted to UID: ${targetUid}`);
      setTargetUid("");
    } catch (err: any) {
      alert("Role provisioning failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Government Dashboard", href: "/government/dashboard" },
          { label: "Role Administration" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Role & Clearance Administration
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Cryptographically privileged roles (e.g. Government Registrar) require server custom claims verification.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Security Principle:</strong> In accordance with security specifications, privileged administrative and government verifier rights can never be self-assigned during registration. They must be validated server-side using the secure authorization master key.
        </div>
      </div>

      <Card title="Grant Privileged Clearance">
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-status-success text-xs flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleGrantRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-navy mb-1">
              Target User UID *
            </label>
            <input
              type="text"
              required
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="e.g. gov-789 or firebase user UID"
              className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-navy mb-1">
              Select Clearance Role *
            </label>
            <select
              value={targetRole}
              onChange={(e: any) => setTargetRole(e.target.value)}
              className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
            >
              <option value="government">Government Authority (Full Scrutiny & Minting)</option>
              <option value="agent">Realty Agent</option>
              <option value="seller">Land Seller</option>
              <option value="buyer">Land Buyer</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-navy mb-1">
              Administrative Master Setup Secret Key *
            </label>
            <input
              type="password"
              required
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold font-mono"
            />
            <p className="text-[11px] text-muted-slate mt-1">
              Verified server-side against <code className="font-mono">ADMIN_SETUP_SECRET</code> in the backend environment.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Provision Role with Custom Claims
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
