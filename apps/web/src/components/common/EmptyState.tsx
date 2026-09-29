import React from "react";
import { FolderSearch } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-ivory-300 bg-white/60">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>
      <h3 className="font-serif text-lg font-bold text-midnight mb-1">{title}</h3>
      <p className="text-xs text-muted-slate max-w-sm mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
