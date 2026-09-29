import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import {
  FileUp,
  UserCheck,
  Blocks,
  ArrowRightLeft,
  CheckCircle2,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { SystemArchitectureDiagram } from "../../components/architecture/SystemArchitectureDiagram";

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Seller Submits Land Application",
      actor: "Land Seller",
      icon: FileUp,
      desc: "The property seller fills out survey/parcel coordinates, boundary measurements, and uploads deed documents. The browser generates a client-side SHA-256 integrity hash of every supporting file before submission.",
    },
    {
      num: "02",
      title: "Government Verifier Scrutiny",
      actor: "Government Authority",
      icon: UserCheck,
      desc: "Authorized government registrars inspect boundary survey compliance, tax receipts, and verify document hashes against municipal records. The registrar can approve, request amendments, or reject with stated grounds.",
    },
    {
      num: "03",
      title: "Authorized On-Chain Minting",
      actor: "Government Registrar + Ethereum Ledger",
      icon: Blocks,
      desc: "Upon approval, the authorized government verifier signs an Ethereum transaction (`registerLand`). The smart contract records the canonical Land ID, parcel number, owner wallet, and deed hash permanently on-chain.",
    },
    {
      num: "04",
      title: "Seller Initiates Ownership Transfer",
      actor: "Current Owner (Seller)",
      icon: ArrowRightLeft,
      desc: "When a sale is agreed, the seller initiates a transfer request targeting the verified buyer's Ethereum wallet address. The smart contract validates that only the recorded current owner can initiate transfers.",
    },
    {
      num: "05",
      title: "Buyer Explicit Cryptographic Consent",
      actor: "Prospective Buyer",
      icon: CheckCircle2,
      desc: "To prevent involuntary or fraudulent transfers, the designated buyer must inspect the property terms and explicitly execute `acceptTransfer` on-chain or via cryptographic signature.",
    },
    {
      num: "06",
      title: "Government Final Authorization & Certificate",
      actor: "Government Authority",
      icon: FileCheck,
      desc: "The registrar reviews the mutual buyer-seller consent and submits `authorizeTransfer`. The contract changes recorded owner to the buyer, increments transfer count, and issues an updated digital certificate.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumbs items={[{ label: "How It Works" }]} />

      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Verification Pipeline
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-midnight mt-1">
          How LandChain Works
        </h1>
        <p className="text-xs sm:text-sm text-muted-slate mt-2 leading-relaxed">
          The end-to-end lifecycle from initial parcel application to immutable blockchain registration and multi-party ownership transfer.
        </p>
      </div>

      {/* Complete Interactive System Architecture & Blockchain Infrastructure Diagram */}
      <SystemArchitectureDiagram />

      {/* Step by Step Timeline */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white rounded-xl border border-gold/25 p-6 shadow-soft flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex items-center space-x-4 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-bold text-lg font-serif">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-ivory-100 flex items-center justify-center text-midnight">
                  <Icon className="w-5 h-5 text-gold-dark" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ivory-200 text-slate-navy">
                    {step.actor}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-midnight mt-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-slate mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link to="/seller/register-land">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Try The Registration Wizard
          </Button>
        </Link>
      </div>
    </div>
  );
};
