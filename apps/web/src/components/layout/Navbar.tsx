import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { UserRole } from "../../types";
import {
  ShieldCheck,
  Wallet,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "../common/Button";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout, switchDemoRole } = useAuth();
  const { account, isConnected, isCorrectNetwork, connect, switchToLocalNetwork } = useWallet();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    seller: { label: "Land Seller", color: "bg-amber-100 text-amber-800 border-amber-300" },
    buyer: { label: "Land Buyer", color: "bg-blue-100 text-blue-800 border-blue-300" },
    government: { label: "Government Verifier", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    agent: { label: "Realty Agent", color: "bg-purple-100 text-purple-800 border-purple-300" },
    public: { label: "Public Citizen", color: "bg-gray-100 text-gray-800 border-gray-300" },
  };

  const getDashboardPath = (targetRole: UserRole) => {
    switch (targetRole) {
      case "seller":
        return "/seller/dashboard";
      case "buyer":
        return "/buyer/dashboard";
      case "government":
        return "/government/dashboard";
      case "agent":
        return "/agent/dashboard";
      default:
        return "/search";
    }
  };

  const handleRoleSelect = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setRoleMenuOpen(false);
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    navigate(getDashboardPath(newRole));
  };

  return (
    <header className="sticky top-0 z-40 bg-midnight/95 backdrop-blur-md border-b border-gold/25 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark p-0.5 shadow-gold">
              <div className="w-full h-full bg-midnight rounded-[7px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-white flex items-center">
                LAND<span className="text-gold">CHAIN</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-gold/80 -mt-1 font-mono">
                Ethereum Land Registry
              </span>
            </div>
          </Link>

          {/* Public Nav Links */}
          <nav className="hidden md:flex items-center space-x-5 text-xs uppercase tracking-wider font-semibold">
            <Link to="/search" className="text-slate-200 hover:text-gold transition-colors flex items-center">
              <Search className="w-3.5 h-3.5 mr-1" />
              Search Registry
            </Link>
            <Link to="/how-it-works" className="text-slate-200 hover:text-gold transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="text-slate-200 hover:text-gold transition-colors">
              About
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardPath(role)}
                className="text-gold hover:text-gold-light transition-colors flex items-center"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" />
                My Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: Role Switcher, Wallet, Notifications, User */}
        <div className="flex items-center space-x-3">
          {/* Academic Demo Role Switcher Badge */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleLabels[role].color} transition-all duration-150 hover:brightness-105 shadow-sm`}
              title="Academic Demo Mode: Switch evaluation perspective"
            >
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">Demo:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{roleLabels[role].label}</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-midnight shadow-2xl border border-gold/30 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-2 border-b border-ivory-200 bg-ivory-50/60 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-midnight">
                      Academic Demo Mode
                    </span>
                    <span className="text-[9px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded font-mono font-bold">
                      Simulated
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-slate mt-0.5 leading-tight">
                    Simulates verified credentials for role-based evaluation. Clears private session cache.
                  </p>
                </div>
                <div className="py-1">
                  {(["seller", "buyer", "government", "agent", "public"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-ivory-100 transition-colors ${
                        role === r ? "font-bold text-gold-dark bg-gold/10" : "text-midnight"
                      }`}
                    >
                      <span>{roleLabels[r].label}</span>
                      {role === r && <ShieldCheck className="w-4 h-4 text-gold-dark" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MetaMask Wallet Connection Button */}
          {isConnected ? (
            <div className="flex items-center space-x-1.5">
              {!isCorrectNetwork ? (
                <button
                  onClick={switchToLocalNetwork}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-md text-xs font-semibold hover:bg-amber-500/30 flex items-center"
                >
                  Switch to Hardhat
                </button>
              ) : (
                <div className="hidden sm:flex items-center bg-slate-navy/80 border border-gold/30 rounded-md px-2.5 py-1 text-xs font-mono text-gold">
                  <Wallet className="w-3.5 h-3.5 mr-1.5 text-gold" />
                  <span>
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connect}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gold/20 text-gold-light border border-gold/40 rounded-md text-xs font-semibold hover:bg-gold/30 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 mr-1" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Notifications Bell */}
          <Link
            to="/notifications"
            className="p-1.5 text-ivory-300 hover:text-gold transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
          </Link>

          {/* User Menu / Auth Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-navy transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold text-xs font-bold">
                  {user?.displayName?.[0] || "U"}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-midnight shadow-2xl border border-gold/30 py-2 z-50">
                  <div className="px-4 py-2 border-b border-ivory-200">
                    <p className="text-xs font-bold truncate">{user?.displayName}</p>
                    <p className="text-[11px] text-muted-slate truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-xs text-midnight hover:bg-ivory-100 flex items-center"
                  >
                    <User className="w-3.5 h-3.5 mr-2 text-muted-slate" />
                    Account Settings
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-xs text-midnight hover:bg-ivory-100 flex items-center"
                  >
                    <Wallet className="w-3.5 h-3.5 mr-2 text-muted-slate" />
                    Wallet Status
                  </Link>
                  <div className="border-t border-ivory-200 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-status-error hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-gold hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
