import React from "react";
import { Link } from "react-router-dom";
import { ShieldX, Home } from "lucide-react";
import { Button } from "../../components/common/Button";

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 text-status-error flex items-center justify-center mx-auto mb-4">
        <ShieldX className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-midnight mb-2">Access Restricted</h1>
      <p className="text-xs text-muted-slate mb-6 leading-relaxed">
        You do not possess the required cryptographic role or administrative clearance to access this resource.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Public Home
        </Button>
      </Link>
    </div>
  );
};
