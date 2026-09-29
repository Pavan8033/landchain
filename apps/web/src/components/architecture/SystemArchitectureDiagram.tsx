import React, { useState } from "react";
import {
  Users,
  User,
  Building2,
  Briefcase,
  Globe,
  Layers,
  FileText,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  Blocks,
  FileCheck2,
  MapPin,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Cloud,
  Lock,
} from "lucide-react";

export const SystemArchitectureDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedBlock, setSelectedBlock] = useState<number>(1);

  const stakeholders = [
    {
      role: "Land Seller",
      subtitle: "(Owner)",
      icon: User,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Registers land, uploads deed proofs, initiates transfer requests.",
    },
    {
      role: "Land Buyer",
      subtitle: "(New Owner)",
      icon: User,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Discovers parcels, grants explicit acceptance/rejection on transfers.",
    },
    {
      role: "Government Authority",
      subtitle: "(Registrar & Verifier)",
      icon: Building2,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: "Performs 5-point scrutiny check, authorizes on-chain minting & transfers.",
    },
    {
      role: "Real Estate Agents",
      subtitle: "(Facilitators)",
      icon: Briefcase,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Assists clients, searches verified records, tracks transactions.",
    },
    {
      role: "General Public",
      subtitle: "(Public Access)",
      icon: Globe,
      color: "bg-slate-100 text-slate-700 border-slate-300",
      description: "Searches verified parcels, audits ledger, verifies PDF certificates.",
    },
  ];

  const blocks = [
    {
      num: 1,
      title: "Block 1",
      subtitle: "Registration Record",
      tx: "registerLand(LAND-KA-BLR-001)",
      hash: "0x89e2cf4b9101c4e9301daec70f80bc2467d023a1",
      prevHash: "0x0000000000000000000000000000000000000000",
      gasUsed: "142,350",
      nonce: 4129,
    },
    {
      num: 2,
      title: "Block 2",
      subtitle: "Ownership Transfer",
      tx: "initiateTransfer -> acceptTransfer",
      hash: "0x4b7112ea0f1807e69ac870c945b13881df3910c2",
      prevHash: "0x89e2cf4b9101c4e9301daec70f80bc2467d023a1",
      gasUsed: "88,410",
      nonce: 4130,
    },
    {
      num: 3,
      title: "Block 3",
      subtitle: "Updated Record",
      tx: "authorizeTransfer(LAND-KA-BLR-001)",
      hash: "0x981bfca023901a8819ef39b418cd9911e32091ac",
      prevHash: "0x4b7112ea0f1807e69ac870c945b13881df3910c2",
      gasUsed: "112,800",
      nonce: 4131,
    },
    {
      num: 4,
      title: "Block 4",
      subtitle: "Verification Record",
      tx: "registerLand(LAND-MH-PUN-002)",
      hash: "0x33cf81b10a9918237001ca2091bf209a1cba2910",
      prevHash: "0x981bfca023901a8819ef39b418cd9911e32091ac",
      gasUsed: "139,920",
      nonce: 4132,
    },
    {
      num: 5,
      title: "Block N",
      subtitle: "Current Record",
      tx: "Consensus State Synced",
      hash: "0xfa109823ac91209bca7109283019beac381901ab",
      prevHash: "0x33cf81b10a9918237001ca2091bf209a1cba2910",
      gasUsed: "42,100",
      nonce: 4133,
    },
  ];

  const storageCategories = [
    {
      name: "Land Records",
      desc: "Title Deeds, Encumbrance, Ownership History",
      icon: FileText,
      tech: "MySQL / MongoDB / In-Memory",
    },
    {
      name: "User Details",
      desc: "Owners, Buyers, Registrars (RBAC)",
      icon: Users,
      tech: "Firebase Auth / DB Profiles",
    },
    {
      name: "Land Survey",
      desc: "Maps, Cadastral Geo-Coordinates, Boundary Plan",
      icon: MapPin,
      tech: "Spatial GIS / Vector GeoJSON",
    },
    {
      name: "Legal Documents",
      desc: "Sale Agreements, Municipal Khata, Tax Receipts",
      icon: FileCheck2,
      tech: "SHA-256 Validated Documents",
    },
    {
      name: "Supporting Evidence",
      desc: "Identity Proofs, Geo-Tagged Parcel Photos",
      icon: ShieldCheck,
      tech: "Private Storage & Expirable URLs",
    },
    {
      name: "Cloud Storage / IPFS",
      desc: "Decentralized Content-Addressable Storage (CIDs)",
      icon: Cloud,
      tech: "IPFS Gateway & Pinata (Qm...)",
    },
  ];

  const workingProcess = [
    {
      step: 1,
      title: "User Registers & Logs In",
      desc: "Stakeholder authenticates and connects their MetaMask wallet (ethers.js v6).",
    },
    {
      step: 2,
      title: "Land Documents Uploaded",
      desc: "Seller uploads deed, survey map, and ID. Browser calculates SHA-256 hash & decentralized IPFS CID.",
    },
    {
      step: 3,
      title: "Government Verifies Documents",
      desc: "Registrar conducts 5-point scrutiny: Document, Identity, Legal compliance, and Signatures.",
    },
    {
      step: 4,
      title: "Smart Contract Validates Ownership",
      desc: "Solidity contract enforces state transitions, multi-party consent, and prevents double registration.",
    },
    {
      step: 5,
      title: "Verified Record Stored in Blockchain",
      desc: "Transaction mined into an immutable block; receipt emits LandRegistered / OwnershipTransferred event.",
    },
    {
      step: 6,
      title: "Digital Land Certificate Issued",
      desc: "Cryptographic vector PDF generated with gold seal, on-chain TX hash, IPFS CID, and public QR code.",
    },
    {
      step: 7,
      title: "Record Becomes Immutable & Accessible",
      desc: "Parcel is globally searchable by ID or locality. History is permanent and tamper-resistant.",
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-2xl space-y-8 overflow-hidden relative">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture & Decentralized Infrastructure</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
          LandChain Full-Stack System Diagram
        </h2>
        <p className="text-xs sm:text-sm text-ivory-200/80 leading-relaxed">
          Comprehensive multi-tier architecture mapping users, smart contracts, Ethereum blocks, IPFS decentralized storage, and government verification.
        </p>
      </div>

      {/* Layer 1: Users / Stakeholders */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
          <Users className="w-4 h-4" />
          <span>1. Users / Stakeholders Layer</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stakeholders.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 hover:border-gold/50 rounded-xl p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`w-9 h-9 rounded-lg mx-auto flex items-center justify-center mb-2.5 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif font-bold text-sm text-white">{s.role}</div>
                <div className="text-[10px] font-semibold text-gold mb-1.5">{s.subtitle}</div>
                <div className="text-[11px] text-ivory-300/80 leading-relaxed">{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 2: User Interface & Verification Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: User Interface Layer */}
        <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Cpu className="w-4 h-4" />
            <span>User Interface Layer</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 space-y-2">
            <div className="font-bold text-xs text-white">Web / Mobile Responsive Application</div>
            <ul className="text-[11px] text-ivory-300/90 space-y-1.5 list-disc list-inside">
              <li>User Registration & Login (RBAC)</li>
              <li>Land Search & Public Record Viewing</li>
              <li>Document Upload & Web Crypto SHA-256</li>
              <li>Multi-Party Transfer Requests</li>
              <li>Live Application Status Tracking</li>
            </ul>
          </div>
        </div>

        {/* Middle: Smart Contract Application Layer */}
        <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Application Layer (Solidity 0.8.24)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <div className="font-bold text-emerald-300">Ownership Verification</div>
              <div className="text-[10px] text-ivory-300/80 mt-0.5">Document & identity on-chain checks</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <div className="font-bold text-emerald-300">Land Transfer Mgmt</div>
              <div className="text-[10px] text-ivory-300/80 mt-0.5">Seller-Buyer-Gov multi-party consent</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <div className="font-bold text-emerald-300">Record Update</div>
              <div className="text-[10px] text-ivory-300/80 mt-0.5">Validated by authorized authorities</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <div className="font-bold text-emerald-300">Land Access Query</div>
              <div className="text-[10px] text-ivory-300/80 mt-0.5">Permanent public ledger search</div>
            </div>
          </div>
        </div>

        {/* Right: Government & Verification Layer */}
        <div className="lg:col-span-3 bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Building2 className="w-4 h-4" />
            <span>Government & Verification</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-[11px] space-y-1.5">
            <div className="font-bold text-blue-300">Land Registry Authority</div>
            <div className="text-[10px] text-ivory-300/90 space-y-1">
              <div>✓ Document Verification (Deed Scrutiny)</div>
              <div>✓ Identity Verification (Applicant Proofs)</div>
              <div>✓ Legal Compliance Check (Non-Encumbrance)</div>
              <div>✓ Digital Signature Validation (MetaMask)</div>
              <div>✓ Regulatory Oversight & Audit Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 3: Blockchain Network (Decentralized Ledger) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
            <Blocks className="w-4 h-4" />
            <span>Blockchain Network (Ethereum-Compatible Decentralized Ledger)</span>
          </div>
          <span className="text-[11px] text-ivory-400">
            Click any block to inspect cryptographic payload
          </span>
        </div>

        {/* Blocks Linked Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {blocks.map((b) => (
            <div
              key={b.num}
              onClick={() => setSelectedBlock(b.num)}
              className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 ${
                selectedBlock === b.num
                  ? "bg-slate-800 border-gold shadow-lg shadow-gold/10"
                  : "bg-slate-800/60 border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-gold">{b.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">#{b.nonce}</span>
              </div>
              <div className="font-semibold text-xs text-white truncate">{b.subtitle}</div>
              <div className="text-[10px] text-ivory-400/80 truncate mt-0.5">{b.tx}</div>
              <div className="mt-2.5 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-400 truncate">
                Hash: {b.hash.slice(0, 10)}...
              </div>
            </div>
          ))}
        </div>

        {/* Selected Block Cryptographic Details Drawer */}
        {selectedBlock && (
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-gold/40 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-gold font-bold">
              <span>LEDGER BLOCK #{selectedBlock} CRYPTOGRAPHIC DETAILS:</span>
              <span className="text-[10px] text-emerald-400">STATUS: CONFIRMED ON LEDGER</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>Block Hash: <span className="text-white">{blocks[selectedBlock - 1].hash}</span></div>
              <div>Parent Hash: <span className="text-slate-400">{blocks[selectedBlock - 1].prevHash}</span></div>
              <div>Executed Call: <span className="text-gold-light">{blocks[selectedBlock - 1].tx}</span></div>
              <div>Gas Used: <span className="text-emerald-400">{blocks[selectedBlock - 1].gasUsed}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Layer 4: Data Storage Layer (Including IPFS) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <Database className="w-4 h-4" />
          <span>Data Storage Layer (Off-Chain & Decentralized IPFS Storage)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storageCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/70 border border-slate-700 hover:border-slate-500 rounded-xl p-3 flex items-start space-x-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0 text-gold">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-[11px] text-ivory-300/80">{item.desc}</div>
                  <div className="text-[10px] text-gold/90 font-mono mt-1">{item.tech}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 5: The 7-Step Working Process (From Diagram) */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-slate-700/80">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>End-to-End Working Process (7 Operational Steps)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {workingProcess.map((step) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
                activeStep === step.step
                  ? "bg-gold text-midnight border-gold font-bold shadow-md"
                  : "bg-slate-800/80 text-white border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                Step 0{step.step}
              </div>
              <div className="text-xs font-serif font-bold mt-1 line-clamp-2">
                {step.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Working Process Step Detail */}
        <div className="p-4 bg-slate-800/90 rounded-xl border border-gold/30 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-serif font-bold text-lg shrink-0">
            0{activeStep}
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-sm text-white">
              {workingProcess[activeStep - 1].title}
            </h4>
            <p className="text-xs text-ivory-200/90 mt-0.5 leading-relaxed">
              {workingProcess[activeStep - 1].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
