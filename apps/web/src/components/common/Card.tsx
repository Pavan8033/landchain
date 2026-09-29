import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gold/20 shadow-soft transition-all duration-200 hover:border-gold/40 ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-ivory-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="font-serif text-lg font-bold text-midnight tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-slate mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
};
