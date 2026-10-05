import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Lock,
  FileCheck2,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
  Globe2,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { getStatusBadge } from "../../components/common/Badge";
import { api } from "../../services/api";
import { LandRecord } from "../../types";
import { SystemArchitectureDiagram } from "../../components/architecture/SystemArchitectureDiagram";

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentRecords, setRecentRecords] = useState<LandRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .searchRecords({ limit: 3 })
      .then((res) => setRecentRecords(res.data))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-midnight text-white pt-20 pb-24 border-b border-gold/20">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-gold/15 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-navy/90 border border-gold/30 text-gold text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Demonstration Prototype • Ethereum Smart Contracts</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Secure Land Records. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
              Transparent Ownership.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-200 font-medium max-w-2xl mx-auto font-sans leading-relaxed">
            A decentralized, tamper-resistant land registry platform built on Ethereum smart contracts. Featuring multi-party verification, cryptographic deed hashing, and sovereign title provenance.
          </p>

          {/* Integrated Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl">
              <div className="absolute left-4 text-gold">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Land ID (e.g., LAND-KA-BLR-001) or Locality..."
                className="w-full bg-white text-slate-900 pl-12 pr-32 py-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold shadow-lg"
              />
              <div className="absolute right-2">
                <Button type="submit" variant="primary" size="md">
                  Verify Record
                </Button>
              </div>
            </form>
            <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-slate-200 font-medium">
              <span>Popular searches:</span>
              <button
                onClick={() => setSearchQuery("LAND-KA-BLR-001")}
                className="text-amber-300 hover:underline font-mono font-bold"
              >
                LAND-KA-BLR-001
              </button>
              <button
                onClick={() => setSearchQuery("Indiranagar")}
                className="text-amber-300 hover:underline font-bold"
              >
                Indiranagar
              </button>
              <button
                onClick={() => setSearchQuery("Pune")}
                className="text-amber-300 hover:underline font-bold"
              >
                Pune
              </button>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="border-gold/50 text-gold hover:bg-gold/10">
                Explore How It Works
              </Button>
            </Link>
            <Link to="/seller/register-land">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Register Land Parcel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
            Cryptographic Integrity
          </span>
          <h2 className="font-serif text-3xl font-bold text-midnight mt-1">
            Why Blockchain for Land Registration?
          </h2>
          <p className="text-sm text-muted-slate mt-2 leading-relaxed">
            Traditional land title systems suffer from duplicate registrations, record alterations, and prolonged disputes. LandChain introduces three cryptographic guardrails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-left hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-midnight mb-2">
              Immutable Smart Contracts
            </h3>
            <p className="text-xs text-muted-slate leading-relaxed">
              Land ownership records are permanently etched onto the Ethereum blockchain. Neither party can unilaterally alter boundary coordinates, survey numbers, or ownership history.
            </p>
          </Card>

          <Card className="text-left hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-status-success flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-midnight mb-2">
              Multi-Party Consent Protocol
            </h3>
            <p className="text-xs text-muted-slate leading-relaxed">
              Ownership transfers require three-party cryptographic authorization: the recorded Seller initiates, the prospective Buyer explicitly accepts, and the authorized Government Verifier approves.
            </p>
          </Card>

          <Card className="text-left hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-midnight mb-2">
              SHA-256 Deed Hashing
            </h3>
            <p className="text-xs text-muted-slate leading-relaxed">
              Supporting deeds and survey maps generate tamper-evident SHA-256 hashes stored on-chain. Any alteration to the original document invalidates the mathematical hash immediately.
            </p>
          </Card>
        </div>
      </section>

      {/* System Architecture & Technical Diagram (Matching Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SystemArchitectureDiagram />
      </section>

      {/* Featured Verified Land Records Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-ivory-300">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
              Public Ledger
            </span>
            <h2 className="font-serif text-2xl font-bold text-midnight mt-0.5">
              Recently Verified Academic Land Records
            </h2>
          </div>
          <Link to="/search" className="mt-3 sm:mt-0 text-xs font-bold text-gold-dark hover:underline flex items-center">
            View All Public Records <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentRecords.map((r) => (
            <Card key={r.landId} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                    {r.landId}
                  </span>
                  {getStatusBadge(r.verificationState)}
                </div>
                <h4 className="font-serif text-base font-bold text-midnight line-clamp-1">
                  {r.locality}
                </h4>
                <p className="text-xs text-muted-slate mt-1">
                  Parcel: <span className="font-medium text-midnight">{r.parcelNumber}</span> • {r.areaSqMeters.toLocaleString()} Sq.M
                </p>
                <p className="text-xs text-muted-slate/80 mt-2 line-clamp-2">
                  {r.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ivory-200">
                <div className="text-[11px] text-muted-slate truncate mb-3">
                  Owner: <span className="font-mono text-midnight">{r.currentOwnerWallet.slice(0, 8)}...{r.currentOwnerWallet.slice(-6)}</span>
                </div>
                <Link to={`/records/${r.landId}`} className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inspect Ledger Record
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Role Navigation Card Grid */}
      <section className="bg-ivory-100/70 py-16 border-y border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl font-bold text-midnight">
              Explore Role-Specific Portals
            </h2>
            <p className="text-xs text-muted-slate mt-2">
              Experience the platform from each distinct stakeholder perspective using our instant role preview.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/seller/dashboard" className="group">
              <div className="p-6 bg-white rounded-xl border border-gold/25 shadow-soft hover:shadow-gold transition-all duration-200 group-hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
                  01
                </div>
                <h3 className="font-serif text-lg font-bold text-midnight group-hover:text-gold transition-colors">
                  Land Seller
                </h3>
                <p className="text-xs text-muted-slate mt-2 leading-relaxed">
                  Register parcels, upload supporting ownership deeds, track government reviews, and initiate transfers.
                </p>
              </div>
            </Link>

            <Link to="/buyer/dashboard" className="group">
              <div className="p-6 bg-white rounded-xl border border-gold/25 shadow-soft hover:shadow-gold transition-all duration-200 group-hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
                  02
                </div>
                <h3 className="font-serif text-lg font-bold text-midnight group-hover:text-gold transition-colors">
                  Land Buyer
                </h3>
                <p className="text-xs text-muted-slate mt-2 leading-relaxed">
                  Discover public parcels, review incoming transfer offers, and explicitly accept or reject transactions.
                </p>
              </div>
            </Link>

            <Link to="/government/dashboard" className="group">
              <div className="p-6 bg-white rounded-xl border border-gold/25 shadow-soft hover:shadow-gold transition-all duration-200 group-hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                  03
                </div>
                <h3 className="font-serif text-lg font-bold text-midnight group-hover:text-gold transition-colors">
                  Government Verifier
                </h3>
                <p className="text-xs text-muted-slate mt-2 leading-relaxed">
                  Review applicant deeds, verify hashes, approve submissions, and execute authorized on-chain transactions.
                </p>
              </div>
            </Link>

            <Link to="/agent/dashboard" className="group">
              <div className="p-6 bg-white rounded-xl border border-gold/25 shadow-soft hover:shadow-gold transition-all duration-200 group-hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4">
                  04
                </div>
                <h3 className="font-serif text-lg font-bold text-midnight group-hover:text-gold transition-colors">
                  Realty Agent
                </h3>
                <p className="text-xs text-muted-slate mt-2 leading-relaxed">
                  Browse registry records, track client transactions, and manage demonstration client inquiries.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
