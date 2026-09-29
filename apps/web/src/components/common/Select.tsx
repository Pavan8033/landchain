import React, { forwardRef } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-navy mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-md border ${
            error
              ? "border-status-error focus:border-status-error focus:ring-status-error"
              : "border-ivory-300 focus:border-gold focus:ring-gold"
          } bg-white py-2 px-3 text-sm text-midnight focus:outline-none focus:ring-1 transition-colors duration-150 disabled:bg-ivory-100 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-status-error font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-muted-slate">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
