import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { UserRole } from "../../types";
import { User, Mail, Lock, ShieldAlert } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("seller");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, role, displayName);
      if (role === "seller") navigate("/seller/dashboard");
      else if (role === "buyer") navigate("/buyer/dashboard");
      else navigate("/agent/dashboard");
    } catch (err: any) {
      alert("Registration error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-midnight">Create an Account</h1>
        <p className="text-xs text-muted-slate mt-1">
          Join LandChain as a verified participant in decentralized land management.
        </p>
      </div>

      <Card>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-navy mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-navy mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-navy mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          {/* Role Selection (Restricted to non-privileged roles) */}
          <div>
            <label className="block text-xs font-semibold text-slate-navy mb-1">
              Select Your Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
            >
              <option value="seller">Land Seller (Property Owner)</option>
              <option value="buyer">Land Buyer (Investor / Citizen)</option>
              <option value="agent">Real Estate Agent</option>
            </select>
          </div>

          {/* Security notice regarding government role */}
          <div className="p-3 rounded-lg bg-ivory-100 border border-ivory-200 text-[11px] text-muted-slate flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
            <span>
              <strong>Government Registrars:</strong> Privileged government reviewer roles are restricted and can only be provisioned by a trusted administrator using server custom claims.
            </span>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
            Create Account
          </Button>

          <div className="text-center pt-2 text-xs text-muted-slate">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-dark font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
