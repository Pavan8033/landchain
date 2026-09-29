import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Layers } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-midnight text-ivory-200 border-t border-gold/20 pt-10 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Academic Disclaimer Callout */}
        <div className="mb-8 p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold uppercase tracking-wider block text-amber-300 mb-0.5">
              Academic Demonstration Prototype Disclaimer:
            </span>
            LandChain is an educational capstone project developed to demonstrate how blockchain technology, smart contracts, and cryptographic verification can support transparent, tamper-resistant land record administration. This application uses fictional demonstration data and does not establish legal ownership, replace official statutory land title deeds, or integrate with live government revenue registries.
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-navy/60 text-xs">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-gold p-1 flex items-center justify-center text-midnight font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-serif text-base font-bold text-white tracking-tight">
                LAND<span className="text-gold">CHAIN</span>
              </span>
            </div>
            <p className="text-muted-slate text-xs leading-relaxed">
              Transparent, multi-party verified land registration and immutable ownership provenance on the Ethereum blockchain.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white mb-3">Registry Navigation</h4>
            <ul className="space-y-2 text-muted-slate">
              <li>
                <Link to="/search" className="hover:text-gold transition-colors">
                  Public Record Search
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-gold transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  Architecture & Scope
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white mb-3">Demonstration Roles</h4>
            <ul className="space-y-2 text-muted-slate">
              <li>
                <Link to="/seller/dashboard" className="hover:text-gold transition-colors">
                  Land Seller Portal
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-gold transition-colors">
                  Land Buyer Portal
                </Link>
              </li>
              <li>
                <Link to="/government/dashboard" className="hover:text-gold transition-colors">
                  Government Authority Portal
                </Link>
              </li>
              <li>
                <Link to="/agent/dashboard" className="hover:text-gold transition-colors">
                  Realty Agent Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white mb-3">Technology Stack</h4>
            <p className="text-muted-slate text-xs leading-relaxed">
              Solidity 0.8.24, Hardhat, ethers.js v6, React 18, Vite, TypeScript, Tailwind CSS, Express, and Firebase Admin.
            </p>
            <div className="mt-3 inline-block px-2.5 py-1 bg-slate-navy/80 rounded border border-gold/30 text-[10px] text-gold font-mono">
              Network: Localhost (31337)
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-slate">
          <p>© {new Date().getFullYear()} LandChain Engineering. Educational demonstration prototype.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-gold/80">
            Secure Land Records. Transparent Ownership.
          </p>
        </div>
      </div>
    </footer>
  );
};
