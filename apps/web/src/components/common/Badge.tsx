import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gold"
    | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold tracking-wider",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantStyles = {
    success: "bg-emerald-50 text-status-success border border-emerald-200/80",
    warning: "bg-amber-50 text-status-warning border border-amber-200/80",
    danger: "bg-red-50 text-status-error border border-red-200/80",
    info: "bg-blue-50 text-muted-blue border border-blue-200/80",
    gold: "bg-gold/15 text-gold-dark border border-gold/40",
    neutral: "bg-ivory-200 text-slate-navy border border-ivory-300",
  };

  return (
    <span
      className={`inline-flex items-center uppercase rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};

export function getStatusBadge(status: string) {
  switch (status) {
    case "VERIFIED_ON_CHAIN":
    case "TRANSFERRED_ON_CHAIN":
    case "COMPLETED":
      return <Badge variant="success">{status.replace(/_/g, " ")}</Badge>;
    case "PENDING_REVIEW":
    case "PENDING_BUYER":
    case "PENDING_GOVERNMENT":
    case "UNDER_REVIEW":
    case "APPROVED_PENDING_BLOCKCHAIN":
      return <Badge variant="warning">{status.replace(/_/g, " ")}</Badge>;
    case "REJECTED":
    case "REJECTED_BY_BUYER":
    case "REJECTED_BY_GOVERNMENT":
    case "CANCELLED":
      return <Badge variant="danger">{status.replace(/_/g, " ")}</Badge>;
    case "PUBLISHED":
      return <Badge variant="gold">PUBLISHED</Badge>;
    default:
      return <Badge variant="neutral">{status.replace(/_/g, " ")}</Badge>;
  }
}
