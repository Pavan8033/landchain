import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge } from "../../components/common/Badge";
import { User, Mail, Wallet, Shield, Phone, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const { account, connect, isConnected } = useWallet();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        displayName,
        phoneNumber,
        walletAddress: account || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert("Failed updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ label: "Account Profile & Settings" }]} />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">Profile & Account Settings</h1>
        <p className="text-xs text-muted-slate mt-1">
          Manage your identity credentials, role permissions, and linked Ethereum wallet address.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="text-center p-6">
          <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold mx-auto flex items-center justify-center text-gold text-2xl font-bold font-serif mb-4">
            {user?.displayName?.[0] || "U"}
          </div>
          <h2 className="font-serif text-xl font-bold text-midnight">{user?.displayName}</h2>
          <p className="text-xs text-muted-slate truncate mt-0.5">{user?.email}</p>

          <div className="mt-4 pt-4 border-t border-ivory-200">
            <span className="text-[10px] text-muted-slate uppercase block mb-1 font-bold">
              Assigned Role
            </span>
            <Badge variant="gold">{role}</Badge>
          </div>
        </Card>

        {/* Profile Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Personal Information">
            {savedSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-status-success text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                Profile changes saved successfully.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-navy mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-navy mb-1">
                  Email Address (Immutable)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs bg-ivory-100 text-muted-slate cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-navy mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" isLoading={saving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Linked Wallet Address */}
          <Card title="Linked Ethereum Wallet">
            <p className="text-xs text-muted-slate mb-4 leading-relaxed">
              Your Ethereum wallet signs registration transactions, transfer requests, and consent approvals on the local Hardhat ledger.
            </p>

            <div className="p-3 bg-ivory-50 rounded-lg border border-ivory-200 font-mono text-xs flex items-center justify-between">
              <span className="truncate mr-2">
                {account || user?.walletAddress || "No wallet currently connected"}
              </span>
              {isConnected ? (
                <span className="text-status-success font-semibold flex items-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={connect}>
                  Connect MetaMask
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
