import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardList,
  ArrowRightLeft,
  Clock,
  Search,
  ArrowDownLeft,
  History,
  Inbox,
  CheckSquare,
  GitPullRequest,
  Boxes,
  ShieldAlert,
  KeyRound,
  Building2,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItemsByRole: Record<string, { label: string; to: string; icon: any }[]> = {
    seller: [
      { label: "Dashboard", to: "/seller/dashboard", icon: LayoutDashboard },
      { label: "Register Land", to: "/seller/register-land", icon: PlusCircle },
      { label: "My Land Records", to: "/seller/records", icon: FileText },
      { label: "Submitted Applications", to: "/seller/applications", icon: ClipboardList },
      { label: "Initiate Transfer", to: "/seller/transfers/create", icon: ArrowRightLeft },
      { label: "Track Transfers", to: "/seller/transfers", icon: Clock },
    ],
    buyer: [
      { label: "Dashboard", to: "/buyer/dashboard", icon: LayoutDashboard },
      { label: "Land Discovery", to: "/buyer/discovery", icon: Search },
      { label: "Incoming Transfer Offers", to: "/buyer/transfers", icon: ArrowDownLeft },
      { label: "Acquired Properties", to: "/buyer/history", icon: History },
    ],
    government: [
      { label: "Overview Dashboard", to: "/government/dashboard", icon: LayoutDashboard },
      { label: "Pending Registration Queue", to: "/government/queue", icon: Inbox },
      { label: "Verification Workspace", to: "/government/workspace", icon: CheckSquare },
      { label: "Transfer Approvals", to: "/government/transfers", icon: GitPullRequest },
      { label: "Blockchain Explorer", to: "/government/explorer", icon: Boxes },
      { label: "Immutable Audit Log", to: "/government/audit", icon: ShieldAlert },
      { label: "Role Administration", to: "/government/roles", icon: KeyRound },
    ],
    agent: [
      { label: "Agent Dashboard", to: "/agent/dashboard", icon: LayoutDashboard },
      { label: "Browse Registry", to: "/agent/listings", icon: Building2 },
      { label: "Client Enquiries", to: "/agent/enquiries", icon: MessageSquare },
      { label: "Transaction Tracker", to: "/agent/transactions", icon: Activity },
    ],
  };

  const navItems = navItemsByRole[role] || [];

  return (
    <aside
      className={`bg-midnight text-white border-r border-slate-navy/60 transition-all duration-300 flex flex-col justify-between shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Sidebar Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-navy/40">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-xs uppercase tracking-wider font-bold text-slate-200">
                {role} Portal
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-300 hover:text-gold hover:bg-slate-navy/50 transition-colors mx-auto"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-gold text-slate-950 font-bold shadow-gold"
                      : "text-slate-200 hover:text-white hover:bg-slate-navy/60"
                  } ${collapsed ? "justify-center px-0" : ""}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-navy/40 text-[10px] text-slate-300">
          <p className="font-bold text-slate-200">Hardhat Local (31337)</p>
          <p className="truncate mt-0.5 font-mono text-[9px] text-gold font-medium">
            0x5FbDB2315678afecb367f032d93F642f64180aa3
          </p>
        </div>
      )}
    </aside>
  );
};
