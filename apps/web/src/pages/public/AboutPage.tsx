import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { ShieldCheck, BookOpen, Layers, Lock, Cpu, Globe2, AlertTriangle } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumbs items={[{ label: "About LandChain" }]} />

      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Academic Prototype
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-midnight mt-1">
          About LandChain
        </h1>
        <p className="text-sm text-muted-slate mt-2 leading-relaxed">
          An architectural blueprint and full-stack implementation demonstrating how blockchain technology can resolve systemic title insecurity in land administration.
        </p>
      </div>

      {/* Academic Disclaimer Banner */}
      <div className="p-5 rounded-xl border border-amber-400 bg-amber-50 text-amber-900 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-bold mb-1">Academic & Educational Scope:</strong>
          This system is an academic research prototype designed for demonstration and architectural evaluation. It does not replace official state land revenue departments, issue legally binding statutory title deeds, or establish legal ownership under statutory property laws. All sample records and parties are fictional demonstration assets.
        </div>
      </div>

      {/* Problem Statement & Blockchain Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="The Legacy Land Title Problem">
          <ul className="space-y-3 text-xs text-muted-slate leading-relaxed">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error shrink-0 mt-1.5 mr-2" />
              <span><strong>Duplicate Title Deeds:</strong> Fraudulent sellers frequently execute multiple deeds on the exact same property survey number across separate registries.</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error shrink-0 mt-1.5 mr-2" />
              <span><strong>Record Alteration & Tampering:</strong> Centralized databases and paper registries remain susceptible to unauthorized internal database updates or record losses.</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error shrink-0 mt-1.5 mr-2" />
              <span><strong>Opaque Provenance:</strong> Buyers struggle to verify unbroken chains of custody stretching back through prior conveyancing transactions.</span>
            </li>
          </ul>
        </Card>

        <Card title="The LandChain Architecture">
          <ul className="space-y-3 text-xs text-muted-slate leading-relaxed">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0 mt-1.5 mr-2" />
              <span><strong>Ethereum Smart Contract:</strong> Enforces boundary uniqueness, valid owner authorization, and single-transfer lifecycle execution.</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0 mt-1.5 mr-2" />
              <span><strong>Multi-Party Cryptographic Consent:</strong> Transfer requires seller initiation, buyer explicit acceptance, and authorized government approval.</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0 mt-1.5 mr-2" />
              <span><strong>Cryptographic Document Hashing:</strong> 256-bit SHA-256 hashes of deed documents guarantee mathematical tamper evidence.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card title="Technical Specifications & Stack">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-midnight mb-2 flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-gold" />
              Smart Contracts
            </h4>
            <p className="text-muted-slate leading-relaxed">
              Solidity 0.8.24 compiled via Hardhat with optimizer enabled. Deployed to local Ethereum development node (ChainID: 31337). Unit-tested with Chai & ethers.js v6.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-midnight mb-2 flex items-center">
              <Layers className="w-4 h-4 mr-1 text-gold" />
              Backend Services
            </h4>
            <p className="text-muted-slate leading-relaxed">
              Node.js + Express with TypeScript, Zod schema validation, PDFKit vector certificate generation, rate limiting, and Firebase Admin SDK with custom claims.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-midnight mb-2 flex items-center">
              <Globe2 className="w-4 h-4 mr-1 text-gold" />
              Frontend Experience
            </h4>
            <p className="text-muted-slate leading-relaxed">
              React 18 with TypeScript, Vite bundler, Tailwind CSS design system, Lucide icons, MetaMask browser wallet integration, and Recharts analytics.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
