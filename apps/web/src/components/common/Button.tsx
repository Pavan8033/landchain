import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-gold text-midnight hover:bg-gold-hover hover:shadow-gold focus:ring-gold font-semibold shadow-sm",
    secondary:
      "bg-midnight text-white hover:bg-slate-navy focus:ring-midnight border border-slate-navy/40",
    outline:
      "bg-transparent border border-gold text-midnight hover:bg-gold/10 focus:ring-gold font-medium",
    danger:
      "bg-status-error text-white hover:bg-red-700 focus:ring-status-error shadow-sm",
    ghost:
      "bg-transparent text-slate-navy hover:bg-ivory-200 focus:ring-gold",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        leftIcon && <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
