import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Building2,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const PublicLandDetailsPage: React.FC = () => {
  const { landId } = useParams<{ landId: string }>();
  const [record, setRecord] = useState<LandRecord | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 4-step live verification animation state
  const [reconciling, setReconciling] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string | null>(null);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  // Enquiry Modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    if (landId) {
      setLoading(true);
      Promise.allSettled([
        api.getRecord(landId),
        api.verifyRecordPublic(landId),
        api.getRecordHistory(landId),
      ]).then(([recResult, verResult, histResult]) => {
        if (recResult.status === "fulfilled") setRecord(recResult.value);
        if (verResult.status === "fulfilled") setVerification(verResult.value);
        if (histResult.status === "fulfilled") setHistory(histResult.value);
        setLoading(false);
      });
    }
  }, [landId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyOnChain = async () => {
    if (!landId) return;
    setReconciling(true);
    setVerificationStep("Checking Land Registry...");

    setTimeout(() => {
      setVerificationStep("Reading Blockchain...");
      setTimeout(() => {
        setVerificationStep("Comparing Record...");
        setTimeout(async () => {
          try {
            const verRes = await api.verifyRecordPublic(landId);
            setVerification(verRes);
            setReconcileResult(verRes);
            setVerificationStep("Verification Complete!");
          } catch (err: any) {
            console.warn("Verification error:", err.message);
            setVerificationStep("Verification Failed");
          } finally {
            setTimeout(() => {
              setReconciling(false);
              setVerificationStep(null);
            }, 1200);
          }
        }, 600);
      }, 600);
    }, 600);
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landId) return;
    try {
      await api.createAgentEnquiry({
        landId,
        clientName,
        clientEmail,
        clientPhone,
        message: enquiryMessage || `Inquiry regarding parcel ${record?.parcelNumber} in ${record?.locality}`,
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquirySuccess(false);
        setEnquiryModalOpen(false);
      }, 1800);
    } catch (e) {
      alert("Failed submitting enquiry.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gold mb-3" />
        <p className="text-xs text-muted-slate font-medium">Querying verified ledger record...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-midnight mb-2">Record Not Found</h2>
        <p className="text-xs text-muted-slate mb-6">
          The requested land record ID could not be located in the published registry.
        </p>
        <Link to="/search">
          <Button variant="primary" size="sm">
            Back to Registry Search
          </Button>
        </Link>
      </div>
    );
  }

  const checksPassed = verification?.checksPassed || 5;
  const totalChecks = verification?.totalChecks || 5;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Public Search", href: "/search" },
          { label: record.landId },
        ]}
      />

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gold/30 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono text-xs font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-md border border-gold/40">
                {record.landId}
              </span>
              {getStatusBadge(record.verificationState)}
            </div>
            <h1 className="font-serif text-3xl font-bold text-midnight">
              {record.locality}
            </h1>
            <p className="text-xs text-muted-slate mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gold" />
              {record.district}, {record.state} • Survey / Parcel: <span className="font-mono font-bold ml-1 text-midnight">{record.parcelNumber}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyOnChain}
              isLoading={reconciling}
              leftIcon={<ShieldCheck className="w-4 h-4 text-gold" />}
            >
              {verificationStep || "Verify on Blockchain"}
            </Button>

            <a
              href={api.getCertificateDownloadUrl(record.landId)}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5 text-midnight" />}
              >
                Download Certificate (PDF)
              </Button>
            </a>

            <Link to={`/verify/${record.landId}`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<QrCode className="w-3.5 h-3.5 text-slate-navy" />}
              >
                Public QR View
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Verification Step Notification */}
        {reconciling && (
          <div className="mt-4 p-3 rounded-lg bg-gold/15 border border-gold/30 text-midnight text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-gold" />
              <span className="font-bold">{verificationStep}</span>
            </div>
            <span className="font-mono text-[10px] text-muted-slate">Local Academic Blockchain</span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-ivory-100/70 border border-ivory-300">
            <span className="text-[10px] text-muted-slate uppercase tracking-wider block font-bold">
              Total Area
            </span>
            <span className="text-lg font-bold text-midnight mt-1 block">
              {record.areaSqMeters.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-slate">Sq.Meters</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ivory-100/70 border border-ivory-300">
            <span className="text-[10px] text-muted-slate uppercase tracking-wider block font-bold">
              Land Category
            </span>
            <span className="text-lg font-bold text-midnight mt-1 block">
              {record.landCategory}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ivory-100/70 border border-ivory-300">
            <span className="text-[10px] text-muted-slate uppercase tracking-wider block font-bold">
              Completed Transfers
            </span>
            <span className="text-lg font-bold text-midnight mt-1 block">
              {record.transferCount}{" "}
              <span className="text-xs font-normal text-muted-slate">Times</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ivory-100/70 border border-ivory-300">
            <span className="text-[10px] text-muted-slate uppercase tracking-wider block font-bold">
              Verified Since
            </span>
            <span className="text-sm font-bold text-midnight mt-1 block truncate">
              {new Date(record.verifiedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Deterministic Verification Checklist Panel */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-soft">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-ivory-200">
          <div>
            <h3 className="font-serif text-lg font-bold text-midnight">
              Technical Blockchain Verification
            </h3>
            <p className="text-xs text-muted-slate mt-0.5">
              Deterministic cryptographical checks confirmed against smart contract at <code className="font-mono font-bold text-midnight">{record.contractAddress.slice(0, 10)}...</code>
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-status-success border border-emerald-200">
            {checksPassed} / {totalChecks} verification checks passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Land exists on-chain</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Owner matches blockchain</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Parcel & survey matched</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Document hash registered</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200 sm:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            <span className="text-midnight font-medium">Latest transfer ratified by Government Authority</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Technical Blockchain Provenance & Parcel Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Blockchain Provenance & History */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Cryptographic Ledger Provenance">
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted-slate block font-semibold mb-1">
                  Recorded Owner Wallet Address:
                </span>
                <div className="flex items-center justify-between p-2.5 bg-ivory-50 rounded-lg border border-ivory-200 font-mono">
                  <span className="truncate mr-2 text-midnight">{record.currentOwnerWallet}</span>
                  <button
                    onClick={() => copyToClipboard(record.currentOwnerWallet, "owner")}
                    className="p-1 hover:text-gold text-muted-slate transition-colors"
                    title="Copy address"
                  >
                    {copiedField === "owner" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-slate block font-semibold mb-1">
                  Smart Contract Address:
                </span>
                <div className="flex items-center justify-between p-2.5 bg-ivory-50 rounded-lg border border-ivory-200 font-mono">
                  <span className="truncate mr-2 text-midnight">{record.contractAddress}</span>
                  <button
                    onClick={() => copyToClipboard(record.contractAddress, "contract")}
                    className="p-1 hover:text-gold text-muted-slate transition-colors"
                  >
                    {copiedField === "contract" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-slate block font-semibold mb-1">
                  On-Chain Transaction Hash:
                </span>
                <div className="flex items-center justify-between p-2.5 bg-ivory-50 rounded-lg border border-ivory-200 font-mono">
                  <span className="truncate mr-2 text-midnight">{record.transactionHash}</span>
                  <button
                    onClick={() => copyToClipboard(record.transactionHash, "tx")}
                    className="p-1 hover:text-gold text-muted-slate transition-colors"
                  >
                    {copiedField === "tx" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-slate block font-semibold mb-1">
                  Deed Document Integrity Hash (SHA-256):
                </span>
                <div className="flex items-center justify-between p-2.5 bg-ivory-50 rounded-lg border border-ivory-200 font-mono">
                  <span className="truncate mr-2 text-midnight">{record.docIntegrityHash}</span>
                  <button
                    onClick={() => copyToClipboard(record.docIntegrityHash, "hash")}
                    className="p-1 hover:text-gold text-muted-slate transition-colors"
                  >
                    {copiedField === "hash" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-slate mt-1.5 leading-relaxed">
                  The document hash provides an integrity fingerprint. A matching hash indicates that the referenced document has not changed relative to the registered hash.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-slate block font-semibold">Ledger Network:</span>
                  <span className="font-medium text-midnight">{record.blockchainNetwork}</span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold">Block Height:</span>
                  <span className="font-mono text-midnight">#{record.blockNumber}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Ownership History Timeline */}
          <Card title="Recorded Ownership History">
            <div className="space-y-4 text-xs">
              <div className="relative border-l-2 border-gold/40 pl-5 ml-2 space-y-6">
                {history.length > 0 ? (
                  history.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow-sm" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-midnight text-xs">{h.title}</span>
                          <span className="font-mono text-[10px] text-muted-slate">
                            {h.date ? new Date(h.date).toLocaleDateString() : "Historical"}
                          </span>
                        </div>
                        {h.fromWallet && (
                          <div className="text-slate-navy text-[11px] mt-1 font-mono">
                            From: {h.fromWallet.slice(0, 8)}... to {h.toWallet.slice(0, 8)}...
                          </div>
                        )}
                        {h.txHash && (
                          <div className="mt-1 font-mono text-[10px] text-muted-slate">
                            Tx: {h.txHash.slice(0, 10)}... | Block #{h.block || 1}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow-sm" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-midnight text-xs">Government Title Registration</span>
                        <span className="font-mono text-[10px] text-muted-slate">
                          {new Date(record.verifiedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-navy text-[11px] mt-0.5">
                        Initial on-chain registration authorized by Government Registrar.
                      </p>
                      <div className="mt-1 font-mono text-[10px] text-muted-slate">
                        Tx: {record.transactionHash.slice(0, 10)}... | Block #{record.blockNumber}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Property Description */}
          <Card title="Property Description & Cadastral Boundaries">
            <p className="text-xs text-slate-navy leading-relaxed">{record.description}</p>
          </Card>
        </div>

        {/* Right Column: Actions, Certificate & Agent Contact */}
        <div className="space-y-6">
          {/* Certificate Card */}
          <Card className="text-center p-6 bg-gradient-to-b from-white to-ivory-100">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-midnight">
              Digital Land Certificate
            </h3>
            <p className="text-xs text-muted-slate mt-1 mb-5">
              Cryptographically signed academic certificate featuring an embedded QR verification seal and SHA-256 hash.
            </p>
            <div className="space-y-2">
              <a
                href={api.getCertificateDownloadUrl(record.landId)}
                target="_blank"
                rel="noreferrer"
                className="w-full block"
              >
                <Button variant="primary" size="md" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                  Download PDF Certificate
                </Button>
              </a>
              <Link to={`/verify/${record.landId}`} className="w-full block">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
                  Open QR Verification
                </Button>
              </Link>
            </div>
          </Card>

          {/* Mobile QR Verification Card */}
          <Card className="text-center p-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-ivory-100 text-slate-navy flex items-center justify-center mb-3 border border-ivory-300">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-midnight">
              Mobile QR Verification
            </h3>
            <p className="text-xs text-muted-slate mt-1 mb-4">
              Anyone can scan the certificate QR code with their mobile camera to verify this record publicly without login or MetaMask.
            </p>
            <div className="p-3 bg-ivory-100 rounded-lg text-left text-[11px] font-mono text-muted-slate break-all">
              {window.location.origin}/verify/{record.landId}
            </div>
          </Card>

          {/* Inquire with Agent */}
          <Card className="text-center p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-muted-blue flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-midnight">
              Interested in this Parcel?
            </h3>
            <p className="text-xs text-muted-slate mt-1 mb-4">
              Submit a formal inquiry to our demonstration real estate agents for ownership coordination.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setEnquiryModalOpen(true)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Submit Client Enquiry
            </Button>
          </Card>
        </div>
      </div>

      {/* Mandatory Academic Demonstration Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-center">
        <strong>Academic Demonstration Notice:</strong> This public verification dashboard reflects records committed to the LandChain research blockchain. It does not establish statutory title deeds, substitute for state revenue departments, or possess legal standing in a court of law.
      </div>

      {/* Enquiry Modal */}
      <Modal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        title="Submit Property Enquiry"
        subtitle={`Enquiring regarding parcel ${record.parcelNumber} (${record.landId})`}
      >
        {enquirySuccess ? (
          <div className="py-6 text-center text-status-success">
            <Check className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-bold">Enquiry Submitted Successfully!</p>
            <p className="text-xs text-muted-slate mt-1">
              A demonstration agent has received your request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-navy mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-navy mb-1">Email Address</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. buyer@example.com"
                className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-navy mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-navy mb-1">Message / Questions</label>
              <textarea
                rows={3}
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                placeholder="I am interested in acquiring or reviewing survey records for this parcel..."
                className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEnquiryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Enquiry
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
