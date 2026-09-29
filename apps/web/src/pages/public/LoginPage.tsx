import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, DEMO_PROFILES } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { UserRole } from "../../types";
import { Lock, Mail, Sparkles, Shield, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/seller/dashboard");
    } catch (e: any) {
      alert("Login error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    switch (role) {
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "buyer":
        navigate("/buyer/dashboard");
        break;
      case "government":
        navigate("/government/dashboard");
        break;
      case "agent":
        navigate("/agent/dashboard");
        break;
      default:
        navigate("/search");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-midnight">Sign In to LandChain</h1>
        <p className="text-xs text-muted-slate mt-1">
          Access your land registry dashboard or choose a demonstration role below.
        </p>
      </div>

      {/* 1-Click Quick Demo Switcher Card */}
      <div className="bg-gradient-to-br from-midnight to-slate-navy text-white rounded-xl p-5 border border-gold/40 shadow-lg mb-8">
        <div className="flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Instant Evaluator Demo Login</span>
        </div>
        <p className="text-[11px] text-ivory-200/80 mb-4 leading-relaxed">
          Click any role below to instantly load a simulated demo session with preloaded test data:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickDemoLogin("seller")}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-gold hover:text-midnight transition-all text-left border border-white/10 flex flex-col font-semibold"
          >
            <span>Land Seller</span>
            <span className="text-[10px] opacity-70 font-normal">Rajesh Kumar</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin("buyer")}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-gold hover:text-midnight transition-all text-left border border-white/10 flex flex-col font-semibold"
          >
            <span>Land Buyer</span>
            <span className="text-[10px] opacity-70 font-normal">Ananya Sharma</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin("government")}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-gold hover:text-midnight transition-all text-left border border-white/10 flex flex-col font-semibold"
          >
            <span>Gov Registrar</span>
            <span className="text-[10px] opacity-70 font-normal">Dr. K. S. Rao</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin("agent")}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-gold hover:text-midnight transition-all text-left border border-white/10 flex flex-col font-semibold"
          >
            <span>Realty Agent</span>
            <span className="text-[10px] opacity-70 font-normal">Vikram Malhotra</span>
          </button>
        </div>
      </div>

      {/* Traditional Sign-In Form */}
      <Card title="Standard Authentication">
        <form onSubmit={handleStandardLogin} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-navy">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-gold-dark hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-slate" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
            Sign In
          </Button>

          <div className="text-center pt-2 text-xs text-muted-slate">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold-dark font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
