import React from "react";
import { Check, Clock, AlertTriangle, ShieldCheck, Blocks, CheckCircle2, X } from "lucide-react";
import { TransferStatus } from "../../types";

interface TransferTimelineProps {
  status: TransferStatus;
  createdAt?: string;
  buyerResponseAt?: string;
  governmentReviewedAt?: string;
  className?: string;
}

export const TransferTimeline: React.FC<TransferTimelineProps> = ({
  status,
  createdAt,
  buyerResponseAt,
  governmentReviewedAt,
  className = "",
}) => {
  const isRejected = status === "REJECTED_BY_BUYER" || (status as string) === "REJECTED" || status === "REJECTED_BY_GOVERNMENT";
  const isCancelled = status === "CANCELLED";

  // Timeline steps
  const steps = [
    {
      id: "created",
      title: "TRANSFER CREATED",
      subtitle: createdAt ? new Date(createdAt).toLocaleDateString() : "Initiated by Seller",
      status: "completed",
    },
    {
      id: "buyer_consent",
      title: "BUYER CONSENT",
      subtitle:
        status === "PENDING_BUYER"
          ? "CURRENT STEP"
          : isRejected
          ? "REJECTED"
          : buyerResponseAt
          ? new Date(buyerResponseAt).toLocaleDateString()
          : "Consent Granted",
      status:
        status === "PENDING_BUYER"
          ? "active"
          : isRejected
          ? "rejected"
          : "completed",
    },
    {
      id: "gov_review",
      title: "GOVERNMENT REVIEW",
      subtitle:
        status === "PENDING_GOVERNMENT" || status === "ACCEPTED_BY_BUYER"
          ? "ACTIVE / AWAITING"
          : isRejected || isCancelled
          ? "NOT REQUIRED"
          : status === "APPROVED_PENDING_BLOCKCHAIN" || status === "TRANSFERRED_ON_CHAIN"
          ? "APPROVED"
          : "Pending",
      status:
        status === "PENDING_GOVERNMENT" || status === "ACCEPTED_BY_BUYER"
          ? "active"
          : status === "APPROVED_PENDING_BLOCKCHAIN" || status === "TRANSFERRED_ON_CHAIN"
          ? "completed"
          : isRejected || isCancelled
          ? "skipped"
          : "pending",
    },
    {
      id: "blockchain",
      title: "BLOCKCHAIN TRANSFER",
      subtitle:
        status === "TRANSFERRED_ON_CHAIN"
          ? "CONFIRMED ON-CHAIN"
          : isRejected || isCancelled
          ? "NOT EXECUTED"
          : "Pending Gov Authorization",
      status:
        status === "TRANSFERRED_ON_CHAIN"
          ? "completed"
          : isRejected || isCancelled
          ? "skipped"
          : "pending",
    },
    {
      id: "completed",
      title: "COMPLETED",
      subtitle:
        status === "TRANSFERRED_ON_CHAIN"
          ? "TITLE UPDATED"
          : isRejected || isCancelled
          ? "CLOSED"
          : "Pending",
      status:
        status === "TRANSFERRED_ON_CHAIN"
          ? "completed"
          : isRejected || isCancelled
          ? "skipped"
          : "pending",
    },
  ];

  return (
    <div className={`bg-white rounded-xl border border-ivory-300 p-6 shadow-soft ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-navy mb-5 flex items-center justify-between">
        <span>Conveyance Protocol Progress</span>
        <span className="font-mono text-[10px] text-muted-slate lowercase">
          protocol-id: multi-party-consent
        </span>
      </h3>

      <div className="relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-5 left-6 right-6 h-0.5 bg-ivory-300 -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            let icon = <Clock className="w-4 h-4 text-muted-slate" />;
            let circleBg = "bg-ivory-100 border-ivory-300 text-muted-slate";
            let textColor = "text-muted-slate";

            if (step.status === "completed") {
              icon = <Check className="w-4 h-4 text-white" />;
              circleBg = "bg-status-success border-status-success text-white";
              textColor = "text-midnight";
            } else if (step.status === "active") {
              icon = <Clock className="w-4 h-4 text-gold-dark animate-pulse" />;
              circleBg = "bg-gold/20 border-gold text-gold-dark ring-4 ring-gold/10";
              textColor = "text-midnight font-bold";
            } else if (step.status === "rejected") {
              icon = <X className="w-4 h-4 text-white" />;
              circleBg = "bg-status-error border-status-error text-white";
              textColor = "text-status-error";
            } else if (step.status === "skipped") {
              icon = <span className="text-xs text-muted-slate">-</span>;
              circleBg = "bg-ivory-200 border-ivory-300 text-muted-slate";
              textColor = "text-muted-slate opacity-60";
            }

            return (
              <div key={step.id} className="relative z-10 flex md:flex-col items-center md:items-center space-x-3 md:space-x-0 text-left md:text-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 mb-2 transition-all ${circleBg}`}
                >
                  {icon}
                </div>
                <div>
                  <div className={`text-[11px] font-bold tracking-tight ${textColor}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-muted-slate mt-0.5 font-medium">
                    {step.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
