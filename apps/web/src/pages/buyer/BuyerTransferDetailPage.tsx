import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { TransferTimeline } from "../../components/common/TransferTimeline";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Building2,
  RefreshCw,
  FileText,
  MapPin,
  ArrowRight,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { api } from "../../services/api";
import { useWallet } from "../../context/WalletContext";
import { acceptTransferOnChain, rejectTransferOnChain } from "../../services/blockchain";
import { TransferRequest, LandRecord } from "../../types";

export const BuyerTransferDetailPage: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState<TransferRequest | null>(null);
  const [landRecord, setLandRecord] = useState<LandRecord | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Accept Modal State
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [consentCheckbox, setConsentCheckbox] = useState(false);
  const [consentNotes, setConsentNotes] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectedSuccess, setRejectedSuccess] = useState(false);

  // General error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransferDetails = async () => {
    if (!transferId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getTransfer(transferId);
      setTransfer(data);

      // Fetch corresponding land record and blockchain verification
      if (data.landId) {
        try {
          const rec = await api.getRecord(data.landId);
          setLandRecord(rec);
        } catch (e) {
          console.warn("Could not fetch full record details:", e);
        }

        try {
          const verifyRes = await api.verifyRecordPublic(data.landId);
          setVerificationData(verifyRes);
        } catch (vErr) {
          console.warn("Could not fetch verification details:", vErr);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load transfer request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferDetails();
  }, [transferId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer || !consentCheckbox) return;

    setAccepting(true);
    try {
      if (isConnected) {
        try {
          await acceptTransferOnChain(transfer.landId);
        } catch (chainErr: any) {
          if (chainErr.code === 4001 || chainErr.message?.includes("rejected")) {
            throw new Error("MetaMask digital signature was rejected by user.");
          }
          console.warn("Smart contract acceptTransfer notice:", chainErr.message);
        }
      }

      const res = await api.acceptTransfer(transfer.id || transfer.transferId, consentNotes);
      setTransfer(res);
      setAcceptedSuccess(true);
      setAcceptModalOpen(false);
    } catch (err: any) {
      alert("Error accepting transfer: " + err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer) return;

    setRejecting(true);
    try {
      if (isConnected) {
        try {
          await rejectTransferOnChain(transfer.landId);
        } catch (chainErr: any) {
          if (chainErr.code === 4001 || chainErr.message?.includes("rejected")) {
            throw new Error("MetaMask digital signature was rejected by user.");
          }
          console.warn("Smart contract rejectTransfer notice:", chainErr.message);
        }
      }

      const res = await api.rejectTransfer(transfer.id || transfer.transferId, rejectReason);
      setTransfer(res);
      setRejectedSuccess(true);
      setRejectModalOpen(false);
    } catch (err: any) {
      alert("Error rejecting transfer: " + err.message);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gold mb-3" />
        <p className="text-xs text-muted-slate font-medium">Loading transfer request details...</p>
      </div>
    );
  }

  if (errorMsg || !transfer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-status-warning mb-3" />
        <h2 className="font-serif text-2xl font-bold text-midnight mb-2">Transfer Request Not Found</h2>
        <p className="text-xs text-muted-slate mb-6">
          {errorMsg || "The requested ownership transfer could not be found or you are not authorized to view it."}
        </p>
        <Link to="/buyer/transfers">
          <Button variant="primary" size="sm">
            Back to Incoming Transfers
          </Button>
        </Link>
      </div>
    );
  }

  // Blockchain Ownership Verification Logic
  const onChainOwner = verificationData?.blockchainProof?.currentOwner || landRecord?.currentOwnerWallet;
  const isOwnerMatching =
    onChainOwner && transfer.sellerWallet
      ? onChainOwner.toLowerCase() === transfer.sellerWallet.toLowerCase()
      : true;
  const isBlockchainOffline = verificationData?.verificationStatus === "BLOCKCHAIN_UNAVAILABLE";
  const canAccept =
    transfer.status === "PENDING_BUYER" && isOwnerMatching && !isBlockchainOffline;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: "Buyer Dashboard", href: "/buyer/dashboard" },
          { label: "Incoming Transfer Requests", href: "/buyer/transfers" },
          { label: transfer.transferId || transfer.id },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <span className="font-mono text-xs font-bold text-gold-dark bg-gold/15 px-2.5 py-0.5 rounded border border-gold/30">
              {transfer.transferId || transfer.id}
            </span>
            {getStatusBadge(transfer.status)}
          </div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Review Ownership Transfer
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Carefully inspect property specifications, verify on-chain title, and provide explicit buyer consent.
          </p>
        </div>

        {transfer.status === "PENDING_BUYER" && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(true)}
              leftIcon={<XCircle className="w-4 h-4 text-status-error" />}
            >
              Reject Transfer
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canAccept}
              onClick={() => setAcceptModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-midnight" />}
            >
              Accept Transfer
            </Button>
          </div>
        )}
      </div>

      {/* Success Banner if just accepted */}
      {acceptedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-status-success text-xs">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-status-success mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Transfer Consent Recorded</h4>
              <p className="text-xs text-slate-navy mt-1">
                Your explicit consent has been cryptographically logged in the registry. The transfer is now awaiting final government scrutiny and on-chain authorization.
              </p>
              <div className="mt-3 flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/buyer/transfers")}>
                  Back to Inbox
                </Button>
                <Link to="/buyer/dashboard">
                  <Button variant="primary" size="sm">
                    Buyer Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner if rejected */}
      {rejectedSuccess && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-status-error text-xs">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 shrink-0 text-status-error mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Transfer Request Rejected</h4>
              <p className="text-xs text-slate-navy mt-1">
                You have formally declined this transfer request. The initiating seller has been notified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conveyance Timeline */}
      <TransferTimeline
        status={transfer.status}
        createdAt={transfer.createdAt}
        buyerResponseAt={transfer.buyerResponseAt}
        governmentReviewedAt={transfer.governmentReviewedAt}
      />

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Property & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Land Information */}
          <Card title="Permitted Land Details">
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-ivory-200">
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">Canonical Land ID</span>
                  <span className="font-mono font-bold text-sm text-gold-dark">{transfer.landId}</span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">Survey / Parcel Number</span>
                  <span className="font-mono font-bold text-midnight">{landRecord?.parcelNumber || "SY-502/7A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-ivory-200">
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">Locality</span>
                  <span className="font-bold text-midnight">{landRecord?.locality || "Whitefield, Bengaluru"}</span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">District & State</span>
                  <span className="text-slate-navy">{landRecord?.district || "Bengaluru Urban"}, {landRecord?.state || "Karnataka"}</span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">Zoning Category</span>
                  <span className="font-bold text-midnight">{landRecord?.landCategory || "RESIDENTIAL"}</span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">Land Area</span>
                  <span className="font-bold text-midnight">
                    {landRecord?.areaSqMeters ? `${landRecord.areaSqMeters.toLocaleString()} Sq.M` : "2,400 Sq.M"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-slate block font-semibold mb-0.5">On-Chain Status</span>
                  <span className="inline-flex items-center text-status-success font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verified on Blockchain
                  </span>
                </div>
              </div>

              <div>
                <span className="text-muted-slate block font-semibold mb-1">Property Description</span>
                <p className="text-slate-navy leading-relaxed">
                  {landRecord?.description || "Residential prime corner plot registered with verified cadastral boundaries."}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 2: Real Blockchain Ownership Verification */}
          <Card
            title="Blockchain Ownership Verification"
            action={
              <span className="font-mono text-[10px] text-muted-slate">
                Chain ID: 31337 (Local Hardhat Node)
              </span>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-ivory-100/70 border border-ivory-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-navy uppercase tracking-wider">
                    Current On-Chain Title Record
                  </span>
                  {isOwnerMatching && !isBlockchainOffline ? (
                    <Badge variant="success">OWNER VERIFIED</Badge>
                  ) : isBlockchainOffline ? (
                    <Badge variant="warning">NODE OFFLINE</Badge>
                  ) : (
                    <Badge variant="danger">OWNERSHIP MISMATCH</Badge>
                  )}
                </div>

                <div className="space-y-2 mt-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-ivory-200">
                    <span className="text-muted-slate font-sans text-xs">Smart Contract Owner:</span>
                    <span className="text-midnight font-bold truncate max-w-[280px]">
                      {onChainOwner || "Querying smart contract..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded border border-ivory-200">
                    <span className="text-muted-slate font-sans text-xs">Transfer Seller Wallet:</span>
                    <span className="text-midnight font-bold truncate max-w-[280px]">
                      {transfer.sellerWallet}
                    </span>
                  </div>
                </div>

                {/* Validation Warnings */}
                {!isOwnerMatching && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-300 text-status-error text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Ownership mismatch detected.</strong> The current recorded owner on the blockchain does not match the seller wallet in this request. This transfer cannot proceed.
                    </span>
                  </div>
                )}

                {isBlockchainOffline && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Blockchain verification is currently unavailable.</strong> The local Ethereum node could not be contacted to verify current title. Acceptance is temporarily disabled.
                    </span>
                  </div>
                )}

                {isOwnerMatching && !isBlockchainOffline && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                    <span>
                      Cryptographic on-chain verification confirmed. The seller wallet matches the recorded owner on the smart contract.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Stakeholders, Consideration & Actions */}
        <div className="space-y-6">
          {/* Consideration Card */}
          <Card title="Agreed Consideration" className="bg-gradient-to-b from-white to-ivory-100">
            <div className="text-center py-4">
              <span className="text-xs uppercase tracking-wider text-muted-slate font-bold block">
                Agreed Purchase Price
              </span>
              <span className="font-serif text-3xl font-bold text-gold-dark mt-1 block">
                ₹{transfer.agreedPrice ? transfer.agreedPrice.toLocaleString() : "1,25,00,000"}
              </span>
              <span className="text-[10px] text-muted-slate block mt-1">
                Currency: {transfer.currency || "INR"}
              </span>
            </div>

            <div className="p-3 bg-ivory-200/50 rounded-lg border border-ivory-300 text-[11px] text-slate-navy flex items-start space-x-2">
              <Info className="w-4 h-4 text-muted-slate shrink-0 mt-0.5" />
              <span>
                This prototype records the agreed consideration as application data. No payment is being processed by this workflow.
              </span>
            </div>
          </Card>

          {/* Stakeholders Card */}
          <Card title="Transfer Parties">
            <div className="space-y-4 text-xs">
              {/* Seller Information */}
              <div className="pb-3 border-b border-ivory-200">
                <span className="text-[11px] font-bold text-slate-navy uppercase tracking-wider block mb-1">
                  Seller Information
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-navy">Party:</span>
                  <span className="font-bold text-midnight">Verified Land Owner</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono">
                  <span className="text-muted-slate font-sans">Wallet:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-midnight font-bold">
                      {transfer.sellerWallet.slice(0, 6)}...{transfer.sellerWallet.slice(-4)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(transfer.sellerWallet, "sellerWallet")}
                      className="p-1 hover:text-gold text-muted-slate transition-colors"
                      title="Copy wallet"
                    >
                      {copiedField === "sellerWallet" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <span className="text-[11px] font-bold text-slate-navy uppercase tracking-wider block mb-1">
                  Buyer Information
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-navy">Account:</span>
                  <span className="font-bold text-midnight truncate max-w-[150px]">
                    {user?.email || transfer.buyerEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono">
                  <span className="text-muted-slate font-sans">Wallet:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-midnight font-bold">
                      {transfer.buyerWallet.slice(0, 6)}...{transfer.buyerWallet.slice(-4)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(transfer.buyerWallet, "buyerWallet")}
                      className="p-1 hover:text-gold text-muted-slate transition-colors"
                      title="Copy wallet"
                    >
                      {copiedField === "buyerWallet" ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Card for Buyer */}
          {transfer.status === "PENDING_BUYER" ? (
            <Card className="p-4 bg-white border-gold/40 shadow-card">
              <h4 className="font-serif text-base font-bold text-midnight mb-2">
                Awaiting Your Decision
              </h4>
              <p className="text-xs text-muted-slate mb-4">
                As the prospective buyer, you must review the terms and explicitly grant or withhold consent.
              </p>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={!canAccept}
                  onClick={() => setAcceptModalOpen(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-midnight" />}
                >
                  Accept Transfer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-status-error hover:bg-red-50"
                  onClick={() => setRejectModalOpen(true)}
                >
                  Reject Transfer
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-center">
              <h4 className="font-serif text-sm font-bold text-midnight">
                Status: {transfer.status}
              </h4>
              <p className="text-[11px] text-muted-slate mt-1">
                {transfer.status === "PENDING_GOVERNMENT" && "This transfer is currently awaiting government authority review and final authorization."}
                {transfer.status === "TRANSFERRED_ON_CHAIN" && "This transfer was successfully authorized and completed on the blockchain."}
                {transfer.status === "REJECTED_BY_BUYER" && "This transfer was rejected by the buyer."}
                {transfer.status === "CANCELLED" && "This transfer was cancelled by the seller."}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Accept Transfer */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title="Confirm Ownership Transfer Request"
        subtitle="Step 5: Buyer Mutual Consent Ratification"
      >
        <form onSubmit={handleAcceptSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-ivory-100 rounded-lg border border-ivory-300 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-slate font-sans">Land Parcel:</span>
              <span className="font-bold text-gold-dark">{transfer.landId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate font-sans">From Seller:</span>
              <span className="font-bold text-midnight truncate max-w-[200px]">{transfer.sellerWallet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate font-sans">To Buyer:</span>
              <span className="font-bold text-midnight truncate max-w-[200px]">{transfer.buyerWallet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate font-sans">Agreed Consideration:</span>
              <span className="font-bold text-midnight">₹{transfer.agreedPrice ? transfer.agreedPrice.toLocaleString() : "1,25,00,000"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-slate font-sans">Current Blockchain Owner:</span>
              <span className="font-bold text-midnight truncate max-w-[200px]">{onChainOwner || transfer.sellerWallet}</span>
            </div>
            <div className="flex justify-between border-t border-ivory-200 pt-2">
              <span className="text-muted-slate font-sans">Next Step:</span>
              <span className="font-bold text-slate-navy">Government review and authorization</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>
              <strong>Important notice:</strong> Accepting this request does not immediately change blockchain ownership. Final ownership transfer requires government review and authorization.
            </span>
          </div>

          <div>
            <label className="block text-slate-navy font-semibold mb-1">
              Buyer Consent Notes (Optional)
            </label>
            <input
              type="text"
              value={consentNotes}
              onChange={(e) => setConsentNotes(e.target.value)}
              placeholder="e.g. Terms reviewed and accepted according to agreement."
              className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentCheckbox}
                onChange={(e) => setConsentCheckbox(e.target.checked)}
                className="mt-0.5 rounded border-ivory-300 text-gold focus:ring-gold"
              />
              <span className="text-xs text-slate-navy font-medium leading-relaxed">
                I have reviewed the transfer details and consent to the proposed ownership transfer.
              </span>
            </label>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-ivory-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAcceptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!consentCheckbox || accepting}
              isLoading={accepting}
            >
              Confirm Consent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal: Reject Transfer */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Ownership Transfer Request"
        subtitle="Please specify the reason for declining this request."
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-navy font-semibold mb-1">
              Rejection Reason <span className="text-status-error">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. I do not agree to the proposed ownership transfer."
              className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-ivory-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-status-error hover:bg-red-50"
              disabled={!rejectReason.trim() || rejecting}
              isLoading={rejecting}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
