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
    success: "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
    warning: "bg-amber-100 text-amber-900 border border-amber-300 font-bold dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
    danger: "bg-rose-100 text-rose-900 border border-rose-300 font-bold dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700",
    info: "bg-sky-100 text-sky-900 border border-sky-300 font-bold dark:bg-sky-950 dark:text-sky-200 dark:border-sky-700",
    gold: "bg-amber-100 text-amber-950 border border-amber-400 font-bold dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600",
    neutral: "bg-slate-200 text-slate-900 border border-slate-300 font-bold dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center uppercase rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-90" />
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
