import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "../../components/common/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-ivory-200 text-muted-slate flex items-center justify-center mx-auto mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-midnight mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-muted-slate mb-6 leading-relaxed">
        The requested URL does not correspond to an active route on the LandChain platform.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Public Home
        </Button>
      </Link>
    </div>
  );
};
