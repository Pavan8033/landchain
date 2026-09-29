import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldX, Home, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    switch (user?.role) {
      case "seller":
        return "/seller/dashboard";
      case "buyer":
        return "/buyer/dashboard";
      case "government":
        return "/government/dashboard";
      case "agent":
        return "/agent/dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 text-status-error flex items-center justify-center mx-auto mb-4">
        <ShieldX className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-midnight mb-2">Access Restricted</h1>
      <p className="text-xs text-muted-slate mb-4 leading-relaxed">
        {user ? (
          <>
            You are currently signed in as <strong className="text-midnight uppercase">{user.role}</strong> ({user.email}).
            This page requires a different role (such as <strong>Government Registrar</strong> or <strong>Seller</strong>).
          </>
        ) : (
          <>You must sign in with an authorized account to access this section.</>
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        {user && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
            onClick={() => navigate(getDashboardPath())}
          >
            Go to My {user.role.toUpperCase()} Dashboard
          </Button>
        )}
        <Button
          variant="secondary"
          size="md"
          leftIcon={<LogIn className="w-4 h-4" />}
          onClick={() => navigate("/login")}
        >
          Switch Role / Sign In
        </Button>
      </div>
    </div>
  );
};
