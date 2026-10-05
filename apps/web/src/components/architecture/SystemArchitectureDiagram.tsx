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
      title: "Land Seller Lists / Registers Land",
      desc: "Owner authenticates, connects wallet, and uploads title deeds with SHA-256 hash & IPFS decentralized storage CID.",
    },
    {
      step: 2,
      title: "Land Buyer Selects Land / Initiates Purchase",
      desc: "Prospective buyer explores public registry, selects verified parcel, and initiates purchase/acquisition transfer request.",
    },
    {
      step: 3,
      title: "Government Authority Verifies Documents & Identity",
      desc: "Registrar conducts 5-point scrutiny: Document Scrutiny, Identity Check, Legal Compliance, Multi-party Consent, and Digital Signatures.",
    },
    {
      step: 4,
      title: "Smart Contract Validates Ownership & Transaction",
      desc: "Solidity smart contract verifies current owner authority, transfer permissions, and enforces cryptographic state transitions.",
    },
    {
      step: 5,
      title: "Verified Transfer Record Stored on Blockchain",
      desc: "Ownership transfer transaction is permanently mined into an immutable block; emits OwnershipTransferred event.",
    },
    {
      step: 6,
      title: "Buyer Becomes New Owner in LandChain Record",
      desc: "Database projection and on-chain registry state update seamlessly, recognizing buyer as the certified legal owner.",
    },
    {
      step: 7,
      title: "Digital Land Certificate Issued & Ledger Updated",
      desc: "Cryptographic vector PDF certificate generated with gold seal, QR verification code, on-chain TX hash, and IPFS CID.",
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-gold/40 shadow-2xl space-y-8 overflow-hidden relative">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/50 text-gold-light text-xs font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture & Decentralized Infrastructure</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
          LandChain Full-Stack System Diagram
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Comprehensive multi-tier architecture mapping 5 key stakeholders, Application Layer (Sale / Purchase / Inheritance), Ethereum blockchain, IPFS decentralized storage, and government verification.
        </p>
      </div>

      {/* Layer 1: Users / Stakeholders */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold-light">
          <Users className="w-4 h-4" />
          <span>1. Users / Stakeholders Layer (5 Core Actors)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stakeholders.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 hover:border-gold/60 rounded-xl p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 shadow-md"
              >
                <div className={`w-9 h-9 rounded-lg mx-auto flex items-center justify-center mb-2.5 font-bold ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif font-bold text-sm text-white">{s.role}</div>
                <div className="text-[11px] font-bold text-gold-light mb-1.5">{s.subtitle}</div>
                <div className="text-[11px] text-slate-200 leading-relaxed">{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 2: User Interface & Verification Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: User Interface Layer */}
        <div className="lg:col-span-4 bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Cpu className="w-4 h-4" />
            <span>User Interface Layer</span>
          </div>
          <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-700 space-y-2">
            <div className="font-bold text-xs text-white">Web / Mobile Responsive Application</div>
            <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
              <li>User Registration & Login (5-Role RBAC)</li>
              <li>Land Search & Public Record Viewing</li>
              <li>Document Upload & Web Crypto SHA-256</li>
              <li>Land Transfer Management (Sale / Purchase / Inheritance)</li>
              <li>Live Application Status Tracking</li>
            </ul>
          </div>
        </div>

        {/* Middle: Smart Contract Application Layer */}
        <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Application Layer (Solidity 0.8.24)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60">
              <div className="font-bold text-emerald-300">Ownership Verification</div>
              <div className="text-[11px] text-slate-200 mt-0.5 font-medium">Document & identity on-chain checks</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60">
              <div className="font-bold text-emerald-300">Land Transfer Mgmt</div>
              <div className="text-[10px] font-bold text-amber-300">Sale / Purchase / Inheritance</div>
              <div className="text-[10px] text-slate-200 mt-0.5">Multi-party consent & verification</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60">
              <div className="font-bold text-emerald-300">Record Update</div>
              <div className="text-[11px] text-slate-200 mt-0.5 font-medium">Validated by authorized registrars</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60">
              <div className="font-bold text-emerald-300">Government Verification</div>
              <div className="text-[11px] text-slate-200 mt-0.5 font-medium">5-point cryptographic scrutiny</div>
            </div>
          </div>
        </div>

        {/* Right: Government & Verification Layer */}
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-300">
            <Building2 className="w-4 h-4" />
            <span>Government & Verification</span>
          </div>
          <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-700 text-xs space-y-1.5">
            <div className="font-bold text-sky-300">Land Registry Authority</div>
            <div className="text-[11px] text-slate-200 space-y-1">
              <div className="text-emerald-300">✓ Document Verification (Deed Scrutiny)</div>
              <div className="text-emerald-300">✓ Identity Verification (Applicant Proofs)</div>
              <div className="text-emerald-300">✓ Legal Compliance Check (Non-Encumbrance)</div>
              <div className="text-emerald-300">✓ Digital Signature Validation (MetaMask)</div>
              <div className="text-emerald-300">✓ Regulatory Oversight & Audit Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 3: Blockchain Network (Decentralized Ledger) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold-light">
            <Blocks className="w-4 h-4" />
            <span>Blockchain Network (Ethereum-Compatible Decentralized Ledger)</span>
          </div>
          <span className="text-xs text-slate-300 font-medium">
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
                  ? "bg-slate-800 border-gold shadow-lg shadow-gold/20"
                  : "bg-slate-800/80 border-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-gold-light">{b.title}</span>
                <span className="text-[10px] text-slate-300 font-mono">#{b.nonce}</span>
              </div>
              <div className="font-bold text-xs text-white truncate">{b.subtitle}</div>
              <div className="text-[11px] text-slate-300 truncate mt-0.5">{b.tx}</div>
              <div className="mt-2.5 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-300 truncate">
                Hash: {b.hash.slice(0, 10)}...
              </div>
            </div>
          ))}
        </div>

        {/* Selected Block Cryptographic Details Drawer */}
        {selectedBlock && (
          <div className="p-4 bg-slate-950 rounded-xl border border-gold/50 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-gold-light font-bold">
              <span>LEDGER BLOCK #{selectedBlock} CRYPTOGRAPHIC DETAILS:</span>
              <span className="text-xs text-emerald-400 font-bold">STATUS: CONFIRMED ON LEDGER</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              <div>Block Hash: <span className="text-white font-mono">{blocks[selectedBlock - 1].hash}</span></div>
              <div>Parent Hash: <span className="text-slate-300 font-mono">{blocks[selectedBlock - 1].prevHash}</span></div>
              <div>Executed Call: <span className="text-amber-300 font-mono">{blocks[selectedBlock - 1].tx}</span></div>
              <div>Gas Used: <span className="text-emerald-400 font-mono">{blocks[selectedBlock - 1].gasUsed}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Layer 4: Data Storage Layer (Including IPFS) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-300">
          <Database className="w-4 h-4" />
          <span>Data Storage Layer (Off-Chain & Decentralized IPFS Storage)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storageCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl p-3.5 flex items-start space-x-3 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-gold-light">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-xs text-slate-200 mt-0.5">{item.desc}</div>
                  <div className="text-[11px] text-amber-300 font-mono mt-1 font-semibold">{item.tech}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 5: The 7-Step Working Process (From Problem Statement Diagram) */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-slate-700">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>End-to-End Buyer Purchase & Transfer Workflow (7 Operational Steps)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {workingProcess.map((step) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
                activeStep === step.step
                  ? "bg-gold text-slate-950 border-gold font-bold shadow-lg"
                  : "bg-slate-800 text-white border-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                Step 0{step.step}
              </div>
              <div className="text-xs font-serif font-bold mt-1 line-clamp-2">
                {step.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Working Process Step Detail */}
        <div className="p-4 bg-slate-800 rounded-xl border border-gold/40 flex items-center space-x-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold-light border border-gold/30 flex items-center justify-center font-serif font-bold text-lg shrink-0">
            0{activeStep}
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-sm text-white">
              {workingProcess[activeStep - 1].title}
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
              {workingProcess[activeStep - 1].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
