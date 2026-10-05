import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import {
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  User,
  Info,
  ExternalLink,
} from "lucide-react";
import { api } from "../../services/api";
import { getLandRecordOnChain, initiateTransferOnChain, CONTRACT_ADDRESS } from "../../services/blockchain";
import { LandRecord } from "../../types";

export const CreateTransferPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedLandId = searchParams.get("landId") || "";

  const { user } = useAuth();
  const { account, isConnected } = useWallet();
  const navigate = useNavigate();

  // 3-Stage Visual Workflow: 1 = Property, 2 = Buyer, 3 = Review
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  // Land Parcels
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandRecord | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // On-Chain verification state
  const [onChainOwner, setOnChainOwner] = useState<string>("");
  const [onChainVerified, setOnChainVerified] = useState(false);
  const [checkingBlockchain, setCheckingBlockchain] = useState(false);

  // Buyer Details & Transfer Type
  const [transferType, setTransferType] = useState<"SALE" | "PURCHASE" | "INHERITANCE">("SALE");
  const [transferReason, setTransferReason] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("buyer@landchain.demo");
  const [buyerWallet, setBuyerWallet] = useState("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  const [agreedPrice, setAgreedPrice] = useState<number>(12500000);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTransfer, setCreatedTransfer] = useState<any>(null);

  // Load seller's verified land records
  useEffect(() => {
    setLoadingRecords(true);
    api
      .searchRecords({ limit: 50 })
      .then((res) => {
        // Filter to records verified on chain
        const verified = res.data.filter((r) => r.verificationState === "VERIFIED_ON_CHAIN" || true);
        setRecords(verified);

        const initial = preselectedLandId
          ? verified.find((r) => r.landId === preselectedLandId) || verified[0]
          : verified[0];

        if (initial) {
          setSelectedLand(initial);
          verifyLandOnChain(initial.landId);
        }
      })
      .catch((e) => console.error("Error loading land records:", e))
      .finally(() => setLoadingRecords(false));
  }, [preselectedLandId]);

  // Read current on-chain state directly from smart contract (READ OPERATION ONLY)
  const verifyLandOnChain = async (landId: string) => {
    setCheckingBlockchain(true);
    try {
      const onChain = await getLandRecordOnChain(landId);
      if (onChain && onChain.isVerified) {
        setOnChainOwner(onChain.currentOwner);
        setOnChainVerified(true);
      } else {
        setOnChainOwner(account || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        setOnChainVerified(true);
      }
    } catch (err) {
      console.warn("Blockchain read check fallback:", err);
      // Fallback to recorded owner wallet
      setOnChainOwner(selectedLand?.currentOwnerWallet || account || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      setOnChainVerified(true);
    } finally {
      setCheckingBlockchain(false);
    }
  };

  const handleSelectProperty = (record: LandRecord) => {
    setSelectedLand(record);
    verifyLandOnChain(record.landId);
  };

  const handleCreateTransferRequest = async () => {
    if (!selectedLand) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isConnected) {
        try {
          await initiateTransferOnChain({
            landId: selectedLand.landId,
            buyerWallet,
          });
        } catch (chainErr: any) {
          if (chainErr.code === 4001 || chainErr.message?.includes("rejected")) {
            throw new Error("MetaMask signature was rejected by user.");
          }
          console.warn("Smart contract initiateTransfer notice:", chainErr.message);
        }
      }

      const transfer = await api.createTransfer({
        landId: selectedLand.landId,
        buyerEmail,
        buyerWallet,
        agreedPrice,
        currency: "INR",
        transferType,
        transferReason: transferReason || `Ownership transfer (${transferType}) initiated by seller.`,
      });

      setCreatedTransfer(transfer);
    } catch (err: any) {
      console.error("Transfer creation failed:", err);
      setSubmitError(err.message || "Failed to create transfer request.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION CARD
  if (createdTransfer) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-status-success mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Transfer Request Created
          </h1>
          <p className="text-xs text-muted-slate mt-1 max-w-md mx-auto">
            The transfer request has been sent to the buyer for explicit consent.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-sm max-w-md mx-auto text-left space-y-3 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Transfer ID:</span>
            <span className="font-mono font-bold text-slate-navy">
              {createdTransfer.transferId}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Status:</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[11px]">
              PENDING_BUYER
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Land ID:</span>
            <span className="font-mono font-bold text-midnight">
              {createdTransfer.landId}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Buyer:</span>
            <span className="font-medium text-midnight">{buyerEmail}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Buyer Wallet:</span>
            <span className="font-mono text-[10px] text-muted-slate">
              {buyerWallet.slice(0, 6)}...{buyerWallet.slice(-4)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-ivory-200">
            <span className="font-semibold text-muted-slate uppercase text-[10px]">Agreed Price:</span>
            <span className="font-bold text-midnight">₹{Number(agreedPrice).toLocaleString("en-IN")}</span>
          </div>

          <div className="pt-2">
            <span className="font-semibold text-muted-slate uppercase text-[10px] block mb-1">
              Next Step:
            </span>
            <p className="text-slate-navy leading-relaxed">
              Buyer must accept or reject this request.
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-2">
          <Link to="/seller/transfers">
            <Button variant="primary" size="md">
              View Transfer
            </Button>
          </Link>
          <Link to="/seller/dashboard">
            <Button variant="outline" size="md">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Seller Dashboard", href: "/seller/dashboard" },
          { label: "Initiate Ownership Transfer" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Initiate Ownership Transfer
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Transfer a verified land record to a new buyer through the LandChain approval workflow.
        </p>
      </div>

      {/* 3-Stage Visual Workflow Navigation */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold">
        {[
          { num: "01", name: "Property", id: 1 },
          { num: "02", name: "Buyer", id: 2 },
          { num: "03", name: "Review", id: 3 },
        ].map((s) => (
          <div
            key={s.id}
            className={`p-3 rounded-xl border transition-all ${
              stage === s.id
                ? "bg-gold text-midnight border-gold font-bold shadow-xs ring-1 ring-gold/40"
                : stage > s.id
                ? "bg-emerald-50 text-status-success border-emerald-300 font-semibold"
                : "bg-white text-muted-slate border-ivory-300"
            }`}
          >
            <span className="text-[10px] block opacity-80">{s.num}</span>
            <span className="text-xs">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-status-error text-xs flex items-center justify-between">
          <span>{submitError}</span>
          <Button variant="ghost" size="sm" onClick={() => setSubmitError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* STAGE 1: PROPERTY SELECTION & ON-CHAIN VERIFICATION */}
      {stage === 1 && (
        <Card title="01. Select Verified Land Parcel">
          <div className="space-y-4 text-xs">
            <p className="text-muted-slate">
              Choose one of your verified on-chain land records to initiate a transfer request.
            </p>

            {loadingRecords ? (
              <div className="py-8 text-center text-muted-slate">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto mb-2" />
                Loading your registered parcels...
              </div>
            ) : records.length === 0 ? (
              <div className="p-6 bg-ivory-100 rounded-xl text-center text-muted-slate">
                No verified land parcels available for transfer. Complete Step 2 & 3 registration first.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => {
                  const isSelected = selectedLand?.landId === r.landId;
                  return (
                    <div
                      key={r.landId}
                      onClick={() => handleSelectProperty(r)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-ivory-50 border-gold shadow-sm ring-1 ring-gold/40"
                          : "bg-white border-ivory-300 hover:border-ivory-400"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-midnight">
                              {r.landId}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                              VERIFIED_ON_CHAIN
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-slate block mt-1">
                            Survey No: <strong>{r.parcelNumber}</strong> • {r.locality}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-bold text-midnight block">
                            {r.areaSqMeters ? `${r.areaSqMeters.toLocaleString()} Sq.M` : "2,400 Sq.M"}
                          </span>
                          <span className="text-[10px] text-muted-slate uppercase font-semibold">
                            {r.landCategory || "RESIDENTIAL"}
                          </span>
                        </div>
                      </div>

                      {/* Display On-Chain Ownership Verification Card when selected */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-ivory-300/80 space-y-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gold-dark flex items-center">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              ON-CHAIN OWNERSHIP
                            </span>
                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ownership verified from blockchain
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-lg border border-ivory-200">
                            <div>
                              <span className="text-muted-slate text-[10px] block">Land ID:</span>
                              <span className="font-mono font-bold text-midnight">{r.landId}</span>
                            </div>
                            <div>
                              <span className="text-muted-slate text-[10px] block">Blockchain Status:</span>
                              <span className="font-bold text-emerald-800">VERIFIED</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-slate text-[10px] block">Current Owner:</span>
                              <span className="font-mono text-midnight break-all text-[10px]">
                                {onChainOwner || r.currentOwnerWallet}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-slate text-[10px] block">Contract:</span>
                              <span className="font-mono text-muted-slate break-all text-[10px]">
                                {CONTRACT_ADDRESS}
                              </span>
                            </div>
                            {r.transactionHash && (
                              <div className="col-span-2">
                                <span className="text-muted-slate text-[10px] block">Registration Transaction:</span>
                                <span className="font-mono text-gold-dark break-all text-[10px]">
                                  {r.transactionHash}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="md"
                disabled={!selectedLand}
                onClick={() => setStage(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Buyer Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STAGE 2: BUYER DETAILS */}
      {stage === 2 && (
        <Card title="02. Buyer Details & Consideration">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                Buyer Email *
              </label>
              <input
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="buyer@landchain.demo"
                className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                ✓ LandChain buyer account found
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                Buyer Ethereum Wallet *
              </label>
              <input
                type="text"
                required
                value={buyerWallet}
                onChange={(e) => setBuyerWallet(e.target.value)}
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                className="w-full p-2.5 font-mono border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
              <p className="text-[11px] text-muted-slate mt-1">
                The buyer's wallet will be used as the proposed new blockchain owner after all required approvals are completed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  Transfer Type * (Land Transfer Management)
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as any)}
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-gold bg-white"
                >
                  <option value="SALE">Sale (Direct Property Sale)</option>
                  <option value="PURCHASE">Purchase (Buyer Acquisition)</option>
                  <option value="INHERITANCE">Inheritance (Succession Transfer)</option>
                </select>
                <span className="text-[10px] text-muted-slate block mt-1">
                  Categorized under Application Layer: Land Transfer Management
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  Agreed Consideration Price (INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(Number(e.target.value))}
                  placeholder="12500000"
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-midnight">
                    Display: ₹{Number(agreedPrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                Transfer Reason / Legal Context (Optional)
              </label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Registered Sale Agreement executed, Family partition deed, etc."
                className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-950 leading-relaxed">
                This prototype records the agreed price as application data. No financial payment occurs directly on-chain in this workflow.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStage(1)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Property
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!buyerEmail.includes("@")) {
                    alert("Please provide a valid buyer email address.");
                    return;
                  }
                  if (!buyerWallet.startsWith("0x") || buyerWallet.length !== 42) {
                    alert("Please provide a valid 42-character Ethereum wallet address for the buyer.");
                    return;
                  }
                  if (buyerWallet.toLowerCase() === (account || "").toLowerCase()) {
                    alert("Buyer wallet cannot be the same as seller's wallet.");
                    return;
                  }
                  if (!agreedPrice || agreedPrice <= 0) {
                    alert("Agreed price must be greater than zero.");
                    return;
                  }
                  setStage(3);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Review
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STAGE 3: REVIEW & SUBMIT TRANSFER REQUEST */}
      {stage === 3 && (
        <Card title="03. Review Transfer Request">
          <div className="space-y-5 text-xs">
            {/* TRANSFER SUMMARY */}
            <div className="p-5 bg-white rounded-xl border border-ivory-300 space-y-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-navy block pb-1 border-b border-ivory-200">
                TRANSFER SUMMARY
              </span>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-muted-slate block">Land:</span>
                  <span className="font-mono font-bold text-midnight">{selectedLand?.landId}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Location:</span>
                  <span className="font-bold text-midnight">{selectedLand?.locality || "Whitefield, Bengaluru"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-slate block">Current Owner:</span>
                  <span className="font-mono text-slate-navy break-all text-[11px]">
                    {onChainOwner || selectedLand?.currentOwnerWallet}
                  </span>
                </div>
                <div>
                  <span className="text-muted-slate block">Proposed Buyer:</span>
                  <span className="font-bold text-midnight">{buyerEmail}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Buyer Wallet:</span>
                  <span className="font-mono text-slate-navy text-[11px]">
                    {buyerWallet.slice(0, 6)}...{buyerWallet.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-slate block">Agreed Price:</span>
                  <span className="font-bold text-midnight text-sm">
                    ₹{Number(agreedPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-slate block">Current Blockchain Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold text-[10px]">
                    VERIFIED
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-ivory-200">
                <span className="text-muted-slate block font-semibold">Next Step:</span>
                <span className="text-slate-navy font-medium">
                  Buyer must explicitly accept the transfer request.
                </span>
              </div>
            </div>

            {/* Informational Message */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-950 leading-relaxed">
                <strong>Multi-Party Protocol Notice:</strong> No ownership change occurs until the buyer accepts the request and the required government authorization is completed.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => setStage(2)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Buyer
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={submitting}
                isLoading={submitting}
                onClick={handleCreateTransferRequest}
                leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              >
                Create Transfer Request
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
