import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-navy mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-slate">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-md border ${
              error
                ? "border-status-error focus:border-status-error focus:ring-status-error"
                : "border-ivory-300 focus:border-gold focus:ring-gold"
            } bg-white py-2 ${leftIcon ? "pl-10" : "pl-3"} ${
              rightIcon ? "pr-10" : "pr-3"
            } text-sm text-midnight placeholder:text-muted-slate/60 focus:outline-none focus:ring-1 transition-colors duration-150 disabled:bg-ivory-100 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-slate">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-status-error font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-muted-slate">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
