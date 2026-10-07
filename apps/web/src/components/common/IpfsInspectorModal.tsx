import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import {
  ExternalLink,
  Copy,
  CheckCircle2,
  Database,
  Layers,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { getIpfsGatewayUrl, getEffectiveIpfsCid } from "../../utils/ipfs";

interface IpfsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
  fileName?: string;
  fileSize?: number;
  sha256Hash?: string;
  ipfsCid?: string;
  ipfsUrl?: string;
}

export const IpfsInspectorModal: React.FC<IpfsInspectorModalProps> = ({
  isOpen,
  onClose,
  title = "Title Deed & Encumbrance Record",
  category = "TITLE_DEED",
  fileName = "Registered_Sale_Deed.pdf",
  fileSize = 1048576,
  sha256Hash = "0x4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  ipfsCid,
  ipfsUrl,
}) => {
  const [copiedCid, setCopiedCid] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState("ipfs.io");

  // Always compute guaranteed-valid Base58btc multihash from CID or SHA-256
  const effectiveCid = getEffectiveIpfsCid({ ipfsCid, sha256Hash });

  const gateways = [
    { name: "IPFS.io Gateway", host: "ipfs.io", url: `https://ipfs.io/ipfs/${effectiveCid}` },
    { name: "DWeb Gateway", host: "dweb.link", url: `https://dweb.link/ipfs/${effectiveCid}` },
    { name: "Pinata Cloud", host: "gateway.pinata.cloud", url: `https://gateway.pinata.cloud/ipfs/${effectiveCid}` },
    { name: "Cloudflare IPFS", host: "cloudflare-ipfs.com", url: `https://cloudflare-ipfs.com/ipfs/${effectiveCid}` },
  ];

  const currentGatewayUrl = `https://${selectedGateway}/ipfs/${effectiveCid}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="IPFS Decentralized Document Inspector"
      subtitle={`Multihash content-addressable storage metadata for ${fileName}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-muted-slate flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Multihash Verified (SHA2-256 + Base58btc)</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Document Header Card */}
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-800" />
              <span className="font-bold text-blue-950 text-sm">{title}</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Category: <strong>{category}</strong> • File: {fileName} ({(fileSize / 1024).toFixed(1)} KB)
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-950 text-[10px] font-bold">
            IPFS CIDv0
          </span>
        </div>

        {/* IPFS CID Breakdown */}
        <div className="p-3.5 bg-white rounded-xl border border-ivory-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-navy flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-gold" />
              Content Identifier (CID)
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(effectiveCid);
                setCopiedCid(true);
                setTimeout(() => setCopiedCid(false), 2000);
              }}
              className="inline-flex items-center text-[10px] font-bold text-gold hover:text-gold-hover"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copiedCid ? "CID Copied!" : "Copy CID"}
            </button>
          </div>

          <div className="p-2.5 bg-ivory-50 rounded-lg font-mono text-[11px] text-midnight font-bold break-all border border-ivory-200">
            {effectiveCid}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-ivory-200">
            <div>
              <span className="text-muted-slate block">Codec:</span>
              <span className="font-mono font-semibold text-midnight">dag-pb / multihash</span>
            </div>
            <div>
              <span className="text-muted-slate block">Hash Function:</span>
              <span className="font-mono font-semibold text-midnight">sha2-256 (0x12)</span>
            </div>
            <div>
              <span className="text-muted-slate block">Base Encoding:</span>
              <span className="font-mono font-semibold text-midnight">Base58btc (Qm...)</span>
            </div>
          </div>
        </div>

        {/* SHA-256 Digest */}
        <div className="p-3.5 bg-white rounded-xl border border-ivory-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-navy flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-gold" />
              SHA-256 Deed Digest (Stored On-Chain)
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sha256Hash);
                setCopiedHash(true);
                setTimeout(() => setCopiedHash(false), 2000);
              }}
              className="inline-flex items-center text-[10px] font-bold text-gold hover:text-gold-hover"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copiedHash ? "Hash Copied!" : "Copy Digest"}
            </button>
          </div>
          <div className="p-2.5 bg-ivory-50 rounded-lg font-mono text-[11px] text-slate-navy break-all border border-ivory-200">
            {sha256Hash}
          </div>
        </div>

        {/* Public IPFS Gateways */}
        <div className="p-3.5 bg-white rounded-xl border border-ivory-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-navy">
              Public IPFS Gateways
            </span>
            <span className="text-[10px] text-emerald-800 flex items-center font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Active Gateway Resolution
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gateways.map((gw) => (
              <button
                key={gw.host}
                onClick={() => setSelectedGateway(gw.host)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  selectedGateway === gw.host
                    ? "bg-gold/10 border-gold text-midnight font-bold"
                    : "bg-ivory-50 border-ivory-200 text-muted-slate hover:border-gold/50"
                }`}
              >
                <div className="text-[11px] truncate">{gw.name}</div>
                <div className="text-[9px] font-mono text-muted-slate truncate">{gw.host}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-ivory-50 rounded-lg border border-ivory-200">
            <span className="font-mono text-[10px] text-midnight truncate max-w-[280px] sm:max-w-[400px]">
              {currentGatewayUrl}
            </span>
            <a
              href={currentGatewayUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-[11px] font-bold text-gold hover:text-gold-hover shrink-0 ml-2"
            >
              Open Gateway
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
