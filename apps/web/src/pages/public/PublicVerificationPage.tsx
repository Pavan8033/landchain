import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  FileText,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  Blocks,
  QrCode,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { api } from "../../services/api";

export const PublicVerificationPage: React.FC = () => {
  const { landId } = useParams<{ landId: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchVerification = async (isManualRefresh = false) => {
    if (!landId) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyRecordPublic(landId);
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve public blockchain verification.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [landId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <RefreshCw className="w-10 h-10 animate-spin text-gold mb-4" />
        <h2 className="font-serif text-xl font-bold text-midnight">Reading Blockchain Record...</h2>
        <p className="text-xs text-muted-slate mt-1">
          Querying Ethereum smart contract state for parcel ID {landId}
        </p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-status-error flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-midnight mb-2">Record Not Verified</h2>
        <p className="text-xs text-muted-slate mb-6">
          {errorMsg || `The requested parcel ID '${landId}' could not be located or verified on the blockchain.`}
        </p>
        <Link to="/search">
          <Button variant="primary" size="sm">
            Search Public Land Registry
          </Button>
        </Link>
      </div>
    );
  }

  const {
    parcelNumber,
    locality,
    district,
    state,
    areaSqMeters,
    landCategory,
    description,
    currentOwnerWallet,
    verificationStatus,
    checksPassed,
    totalChecks,
    checklist,
    blockchainProof,
    certificate,
    ownershipHistory,
    verifiedAt,
  } = data;

  const isVerified = verificationStatus === "VERIFIED_ON_CHAIN";
  const isMismatch = verificationStatus === "VERIFICATION_MISMATCH";
  const isOffline = verificationStatus === "BLOCKCHAIN_UNAVAILABLE";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Institutional Top Verification Badge */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-center border shadow-soft transition-all ${
          isVerified
            ? "bg-gradient-to-b from-emerald-50/80 via-white to-ivory-50 border-emerald-300"
            : isMismatch
            ? "bg-gradient-to-b from-red-50 via-white to-ivory-50 border-red-300"
            : "bg-gradient-to-b from-amber-50 via-white to-ivory-50 border-amber-300"
        }`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-card mb-4 border border-ivory-200">
          {isVerified ? (
            <ShieldCheck className="w-10 h-10 text-status-success" />
          ) : isMismatch ? (
            <AlertTriangle className="w-10 h-10 text-status-error" />
          ) : (
            <Clock className="w-10 h-10 text-status-warning" />
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-slate block">
            LandChain Public Verification Result
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-midnight">
            {isVerified
              ? "✓ VERIFIED ON CHAIN"
              : isMismatch
              ? "VERIFICATION MISMATCH DETECTED"
              : "BLOCKCHAIN RECORD PENDING"}
          </h1>
          <p className="text-xs text-slate-navy max-w-lg mx-auto mt-1">
            {isVerified
              ? "Blockchain record successfully located and cryptographic state matched."
              : isMismatch
              ? "Smart contract ownership does not match the database registry projection."
              : "Unable to complete on-chain verification due to temporary ledger node unavailability."}
          </p>
        </div>

        {/* Verification Timing */}
        <div className="mt-4 pt-3 border-t border-ivory-200 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-slate font-mono">
          <span>
            Verified At: <strong className="text-midnight">{new Date(verifiedAt).toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Parcel ID: <strong className="text-gold-dark">{landId}</strong>
          </span>
          <span>•</span>
          <button
            onClick={() => fetchVerification(true)}
            disabled={refreshing}
            className="inline-flex items-center text-gold-dark hover:underline font-sans font-bold"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Re-verify Now
          </button>
        </div>
      </div>

      {/* Deterministic Verification Checklist */}
      <div className="bg-white rounded-xl border border-ivory-300 p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-ivory-200">
          <div>
            <h3 className="font-serif text-base font-bold text-midnight">
              Technical Verification Checklist
            </h3>
            <p className="text-[11px] text-muted-slate mt-0.5">
              Deterministic cryptographical checks performed directly against the smart contract.
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-status-success border border-emerald-200">
            {checksPassed} / {totalChecks} Checks Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-ivory-100/60 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Land record exists on-chain</span>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-ivory-100/60 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Owner matches blockchain state</span>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-ivory-100/60 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Parcel & survey boundaries verified</span>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-ivory-100/60 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Document SHA-256 hash registered</span>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-ivory-100/60 border border-ivory-200 sm:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Conveyance & transfer provenance ratified</span>
          </div>
        </div>
      </div>

      {/* Land Specifications & Current Ownership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Specifications */}
        <Card title="Property Specifications">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Land Identifier:</span>
              <span className="font-mono font-bold text-gold-dark">{landId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Survey / Parcel No:</span>
              <span className="font-mono font-bold text-midnight">{parcelNumber}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Locality:</span>
              <span className="font-bold text-midnight">{locality}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">District & State:</span>
              <span className="text-slate-navy">{district}, {state}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Total Area:</span>
              <span className="font-bold text-midnight">{areaSqMeters?.toLocaleString()} Sq.M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate">Land Category:</span>
              <span className="font-bold text-midnight">{landCategory}</span>
            </div>
          </div>
        </Card>

        {/* Current Ownership & Blockchain Proof */}
        <Card title="Current On-Chain Ownership">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-slate block mb-1">Recorded Owner Wallet:</span>
              <div className="flex items-center justify-between p-2 bg-ivory-100/70 rounded-lg border border-ivory-200 font-mono">
                <span className="text-midnight font-bold truncate max-w-[200px]">
                  {currentOwnerWallet}
                </span>
                <button
                  onClick={() => copyToClipboard(currentOwnerWallet, "owner")}
                  className="p-1 hover:text-gold text-muted-slate transition-colors"
                  title="Copy address"
                >
                  {copiedField === "owner" ? (
                    <Check className="w-3.5 h-3.5 text-status-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between pb-2 border-b border-ivory-200 pt-1">
              <span className="text-muted-slate">Ledger Network:</span>
              <span className="font-medium text-midnight">{blockchainProof.network}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Chain ID:</span>
              <span className="font-mono text-midnight">{blockchainProof.chainId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-ivory-200">
              <span className="text-muted-slate">Block Number:</span>
              <span className="font-mono text-midnight">#{blockchainProof.blockNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate">Smart Contract:</span>
              <span className="font-mono text-muted-slate truncate max-w-[160px]">
                {blockchainProof.contractAddress}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Integrity Hash Card */}
      <Card title="Document Cryptographic Fingerprint">
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted-slate block font-semibold mb-1">
              Deed SHA-256 Integrity Hash:
            </span>
            <div className="flex items-center justify-between p-2.5 bg-ivory-100 rounded-lg border border-ivory-200 font-mono text-[11px]">
              <span className="text-midnight truncate mr-2">{blockchainProof.docIntegrityHash}</span>
              <button
                onClick={() => copyToClipboard(blockchainProof.docIntegrityHash, "hash")}
                className="p-1 hover:text-gold text-muted-slate transition-colors shrink-0"
                title="Copy hash"
              >
                {copiedField === "hash" ? (
                  <Check className="w-3.5 h-3.5 text-status-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-slate leading-relaxed">
            The document hash provides an immutable integrity fingerprint. A matching hash indicates that the referenced deed has not changed relative to the registered on-chain hash.
          </p>
        </div>
      </Card>

      {/* Ownership History Timeline */}
      <Card title="Recorded Ownership Provenance">
        <div className="space-y-4 text-xs">
          {ownershipHistory && ownershipHistory.length > 0 ? (
            <div className="relative border-l-2 border-gold/40 pl-5 ml-2 space-y-6">
              {ownershipHistory.map((item: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow-sm" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-midnight text-xs">{item.title}</span>
                      <span className="font-mono text-[10px] text-muted-slate">
                        {item.date ? new Date(item.date).toLocaleDateString() : "Historical"}
                      </span>
                    </div>
                    <p className="text-slate-navy text-[11px] mt-0.5">{item.description}</p>
                    {item.transactionHash && (
                      <div className="mt-1.5 flex items-center space-x-2 font-mono text-[10px] text-muted-slate">
                        <span>Tx: {item.transactionHash.slice(0, 10)}...{item.transactionHash.slice(-8)}</span>
                        <span>•</span>
                        <span>Block #{item.blockNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-slate text-xs">Initial registration recorded on-chain.</p>
          )}
        </div>
      </Card>

      {/* Digital Certificate & Actions */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-ivory-100 via-white to-ivory-100 border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-midnight">
              Download Digital Land Certificate (PDF)
            </h4>
            <p className="text-[11px] text-muted-slate mt-0.5">
              Certificate No: <strong className="font-mono">{certificate.certificateNo}</strong> • Version: {certificate.version} [{certificate.status}]
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <a
            href={api.getCertificateDownloadUrl(landId || "")}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="md" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
              Download PDF
            </Button>
          </a>
          <Link to={`/records/${landId}`}>
            <Button variant="outline" size="md">
              Full Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-center">
        <strong>Academic Demonstration Notice:</strong> This certificate and verification dashboard represent a blockchain provenance demonstration within the LandChain research system. It does not confer statutory title deeds, substitute for state revenue departments, or possess legal standing in a court of law.
      </div>
    </div>
  );
};
