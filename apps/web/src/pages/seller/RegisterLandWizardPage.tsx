import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import {
  FileText,
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Info,
  Wallet,
} from "lucide-react";
import { api } from "../../services/api";
import { generateIpfsCid, getIpfsGatewayUrl } from "../../utils/ipfs";
import { IpfsInspectorModal } from "../../components/common/IpfsInspectorModal";

export const RegisterLandWizardPage: React.FC = () => {
  const { user } = useAuth();
  const { account, isConnected, connect } = useWallet();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // STEP 1 Form State: Land Details
  const [surveyNumber, setSurveyNumber] = useState("SY-502/7A");
  const [locality, setLocality] = useState("Whitefield, Bengaluru");
  const [area, setArea] = useState<number | "">(2400);
  const [unit, setUnit] = useState<"Sq.M" | "Sq.Ft" | "Acres" | "Hectares">("Sq.M");
  const [category, setCategory] = useState<"RESIDENTIAL" | "COMMERCIAL" | "AGRICULTURAL" | "INDUSTRIAL" | "MIXED_USE">("RESIDENTIAL");
  const [description, setDescription] = useState(
    "Plot with clear title, bounded on North by 40ft road, municipal water connection approval."
  );

  // STEP 3: Document Upload State
  const [docCategory, setDocCategory] = useState("Title Deed (Ownership History & Khata)");
  const [docTitle, setDocTitle] = useState("Registered Sale Deed & BBMP Khata");
  const [docFileName, setDocFileName] = useState("Registered_Sale_Deed_BBMP_Khata.pdf");
  const [fileSize, setFileSize] = useState(1485760); // ~1.4 MB
  const [docHash, setDocHash] = useState("daeb84506e7d5c9f5727fee7ba8d1c5cefe1d5bffc09b1cdd73e810a8cd271eb");
  const [docIpfsCid, setDocIpfsCid] = useState("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // STEP 4: Declaration Checkbox
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // IPFS Modal
  const [ipfsModalOpen, setIpfsModalOpen] = useState(false);

  // Calculate actual SHA-256 hash from file buffer
  const handleFileSelection = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15 MB limit. Please select a smaller file.");
      return;
    }
    setSelectedFile(file);
    setDocFileName(file.name);
    setFileSize(file.size);
    setIsUploading(true);
    setUploadProgress(20);

    try {
      const buffer = await file.arrayBuffer();
      setUploadProgress(50);

      // Real SHA-256 calculation via Web Crypto API
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setDocHash(hashHex);
      setUploadProgress(80);

      // Compute deterministic IPFS CID
      const cid = await generateIpfsCid(buffer);
      setDocIpfsCid(cid);
      setUploadProgress(100);
    } catch (err) {
      console.error("Cryptographic hash calculation error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(docHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDocFileName("");
    setFileSize(0);
    setDocHash("");
    setDocIpfsCid("");
    setUploadProgress(0);
  };

  // Submission handler with duplicate submission prevention
  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission
    if (!declarationAccepted) {
      alert("Please accept the declaration before submitting your application.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // Compute area in Sq. Meters for standardized backend handling
    let areaSqMeters = Number(area) || 0;
    if (unit === "Sq.Ft") areaSqMeters = Math.round(areaSqMeters * 0.092903);
    else if (unit === "Acres") areaSqMeters = Math.round(areaSqMeters * 4046.86);
    else if (unit === "Hectares") areaSqMeters = Math.round(areaSqMeters * 10000);

    const effectiveWallet =
      account || user?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    try {
      const payload = {
        surveyNumber,
        state: "Karnataka",
        district: "Bengaluru Urban",
        locality,
        address: locality,
        areaSqMeters,
        measurementUnit: unit,
        landCategory: category,
        description,
        applicantWallet: effectiveWallet,
        documents: [
          {
            documentId: `DOC-${Date.now()}`,
            title: docTitle,
            category: "TITLE_DEED",
            fileName: docFileName || "Registered_Sale_Deed_BBMP_Khata.pdf",
            storagePath: `documents/${user?.uid || "demo-seller"}/${docFileName}`,
            storageStatus: "STORED",
            fileSize: fileSize || 1024,
            mimeType: selectedFile?.type || "application/pdf",
            sha256Hash: docHash.startsWith("0x") ? docHash : `0x${docHash}`,
            ipfsCid: docIpfsCid,
            ipfsUrl: getIpfsGatewayUrl(docIpfsCid),
          },
        ],
      };

      const result = await api.submitApplication(payload);
      setSubmitResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(
        err.message || "Your application could not be submitted because the server is unavailable. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submitResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-status-success mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Application Successfully Submitted
          </h1>
          <p className="text-sm text-muted-slate mt-2 max-w-md mx-auto">
            Your land registration application has been submitted for government verification.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-ivory-300 shadow-sm max-w-md mx-auto text-left space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-ivory-200">
            <span className="text-xs font-semibold text-muted-slate uppercase">Application ID:</span>
            <span className="font-mono font-bold text-sm text-midnight">
              {submitResult.applicationId}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-ivory-200">
            <span className="text-xs font-semibold text-muted-slate uppercase">Initial Status:</span>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              PENDING_REVIEW
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-ivory-200">
            <span className="text-xs font-semibold text-muted-slate uppercase">Document Proof:</span>
            <span className="font-semibold text-emerald-800 flex items-center text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Document integrity hash recorded
            </span>
          </div>
          <div className="pt-2">
            <span className="text-xs font-semibold text-muted-slate block mb-1">Next Step:</span>
            <p className="text-xs text-slate-navy leading-relaxed">
              An authorized verifier will review your submitted information and documents.
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <Link to="/seller/applications">
            <Button variant="primary" size="md">
              View Application
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
          { label: "Land Seller", href: "/seller/dashboard" },
          { label: "Register Land" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Register Your Land
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Submit your land details for official verification and blockchain registration.
        </p>
      </div>

      {/* 4-Step Indicator Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { s: 1, name: "Land Details" },
          { s: 2, name: "Applicant Identity" },
          { s: 3, name: "Document Upload" },
          { s: 4, name: "Review & Submit" },
        ].map((item) => (
          <div
            key={item.s}
            className={`py-2 px-1 rounded-lg border transition-all ${
              step === item.s
                ? "bg-gold text-midnight border-gold font-bold shadow-xs ring-1 ring-gold/40"
                : step > item.s
                ? "bg-emerald-50 text-status-success border-emerald-300 font-medium"
                : "bg-white text-muted-slate border-ivory-300"
            }`}
          >
            Step {item.s} of 4: {item.name}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-status-error text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSubmitError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* STEP 1: LAND DETAILS */}
      {step === 1 && (
        <Card title="Step 1 of 4: Land Details">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  1. Survey Number *
                </label>
                <input
                  type="text"
                  required
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  placeholder="e.g. SY-502/7A"
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  2. Locality *
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Whitefield, Bengaluru"
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  3. Area *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 2400"
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  4. Measurement Unit *
                </label>
                <select
                  value={unit}
                  onChange={(e: any) => setUnit(e.target.value)}
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
                >
                  <option value="Sq.M">Sq.M</option>
                  <option value="Sq.Ft">Sq.Ft</option>
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  5. Land Category *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
                >
                  <option value="RESIDENTIAL">RESIDENTIAL</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="AGRICULTURAL">AGRICULTURAL</option>
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                  <option value="MIXED_USE">MIXED_USE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                6. Optional Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any landmark notes, demarcations, or legal annotations..."
                className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!surveyNumber.trim()) {
                    alert("Survey number is required.");
                    return;
                  }
                  if (!locality.trim()) {
                    alert("Locality is required.");
                    return;
                  }
                  if (!area || Number(area) <= 0) {
                    alert("Area is required and must be greater than zero.");
                    return;
                  }
                  setStep(2);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Applicant Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: APPLICANT IDENTITY */}
      {step === 2 && (
        <Card title="Step 2 of 4: Applicant Identity">
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-navy mb-1">Seller Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.displayName || "Rajesh Kumar (Land Seller)"}
                  className="w-full p-2.5 bg-ivory-100 border border-ivory-300 rounded-md text-slate-navy font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">Seller Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "seller@landchain.demo"}
                  className="w-full p-2.5 bg-ivory-100 border border-ivory-300 rounded-md text-slate-navy font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">Seller UID</label>
              <input
                type="text"
                disabled
                value={user?.uid || "UID-SELLER-DEMO-001"}
                className="w-full p-2.5 bg-ivory-100 border border-ivory-300 rounded-md font-mono text-[11px] text-muted-slate cursor-not-allowed"
              />
            </div>

            {/* Wallet Section */}
            <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-3">
              <span className="font-bold text-midnight block">Connected Wallet & Association</span>
              
              {isConnected && account ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-mono font-bold text-xs text-emerald-950">
                        {account.slice(0, 5)}...{account.slice(-3)}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">Wallet connected</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-muted-slate hidden sm:inline">
                    {account}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <span className="text-amber-900 font-semibold block">Connect your wallet to continue.</span>
                    <span className="text-[11px] text-amber-700">MetaMask or Ethereum web3 provider required</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={connect}
                    leftIcon={<Wallet className="w-3.5 h-3.5" />}
                  >
                    Connect MetaMask
                  </Button>
                </div>
              )}

              {/* Informational Panel */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Your wallet is used to associate the blockchain record with the submitting account. It does not by itself prove legal ownership.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Document Upload
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: DOCUMENT UPLOAD */}
      {step === 3 && (
        <Card title="Step 3 of 4: Supporting Documents">
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="font-bold text-midnight text-sm">Supporting Documents</h3>
              <p className="text-muted-slate mt-0.5">
                Upload the documents required for verification. Files remain private and are accessible only to authorized reviewers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  Document Category *
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
                >
                  <option value="Title Deed (Ownership History & Khata)">
                    Title Deed (Ownership History & Khata)
                  </option>
                  <option value="Sale Deed">Sale Deed</option>
                  <option value="Encumbrance Certificate">Encumbrance Certificate</option>
                  <option value="Tax Receipt">Tax Receipt</option>
                  <option value="Identity Proof">Identity Proof</option>
                  <option value="Other Supporting Document">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-navy mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed & BBMP Khata"
                  className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            {/* Drag & Drop Upload Workspace */}
            <div className="p-6 border-2 border-dashed border-gold/50 rounded-xl bg-ivory-50/50 text-center space-y-3">
              <Upload className="w-9 h-9 text-gold mx-auto" />
              <div>
                <div className="font-bold text-midnight text-sm">
                  Drag and drop supporting deeds, or browse files
                </div>
                <p className="text-[11px] text-muted-slate mt-0.5">
                  Allowed types: PDF, PNG, JPG, JPEG (Max size: 15 MB)
                </p>
              </div>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
                className="block mx-auto text-xs text-muted-slate file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-midnight hover:file:bg-gold-hover cursor-pointer"
              />

              {docFileName && (
                <div className="pt-2 text-left bg-white p-3 rounded-lg border border-ivory-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-midnight block">{docFileName}</span>
                    <div className="text-[10px] text-muted-slate flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span>File Size: {(fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-semibold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                        Document integrity hash recorded
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-status-error hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              {/* Progress indicator */}
              {isUploading && (
                <div className="w-full bg-ivory-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gold h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* SHA-256 Integrity Hash & Decentralized IPFS Storage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SHA-256 Card */}
              <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-navy">
                    SHA-256 Integrity Hash
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    title="This hash can be used to detect whether the file contents change."
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-gold hover:text-gold-hover"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? "Copied!" : "Copy Hash"}</span>
                  </button>
                </div>
                <div className="p-2 bg-ivory-100 rounded font-mono text-[11px] text-gold-dark break-all leading-relaxed">
                  {docHash || "Select a file to compute SHA-256 hash"}
                </div>
                <p className="text-[10px] text-muted-slate">
                  Calculated directly from actual file bytes via Web Crypto API.
                </p>
              </div>

              {/* IPFS Card */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-900">
                    Decentralized Storage
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-200/60 text-blue-800 text-[9px] font-bold">
                    Demo IPFS Record
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800 font-semibold block">IPFS CID:</span>
                  <div className="p-2 bg-white rounded font-mono text-[11px] text-blue-950 break-all border border-blue-200">
                    {docIpfsCid || "Qm..."}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIpfsModalOpen(true)}
                    className="inline-flex items-center text-[11px] font-bold text-blue-700 hover:text-blue-900"
                  >
                    Inspect IPFS CID
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                  <span className="text-[10px] text-blue-600">Base58btc Multihash</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!docHash) {
                    alert("Please select or upload a document to proceed.");
                    return;
                  }
                  setStep(4);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Review & Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <Card title="Step 4 of 4: Review Your Application">
          <div className="space-y-6 text-xs">
            {/* Section 1: Land Details */}
            <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <span className="font-bold text-midnight uppercase tracking-wider text-[11px]">
                  Land Details
                </span>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-gold">
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-muted-slate block">Survey Number:</span>
                  <span className="font-bold text-midnight font-mono">{surveyNumber}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Locality:</span>
                  <span className="font-bold text-midnight">{locality}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Area & Unit:</span>
                  <span className="font-bold text-midnight">{area} {unit}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Category:</span>
                  <span className="font-bold text-midnight">{category}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Applicant */}
            <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <span className="font-bold text-midnight uppercase tracking-wider text-[11px]">
                  Applicant
                </span>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-gold">
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-muted-slate block">Name:</span>
                  <span className="font-bold text-midnight">{user?.displayName || "Rajesh Kumar"}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">Email:</span>
                  <span className="font-bold text-midnight">{user?.email || "seller@landchain.demo"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-slate block">Wallet Address:</span>
                  <span className="font-mono text-midnight break-all text-[11px]">
                    {account || user?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Document */}
            <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <span className="font-bold text-midnight uppercase tracking-wider text-[11px]">
                  Document
                </span>
                <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-gold">
                  Edit
                </Button>
              </div>
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-slate block">Category:</span>
                    <span className="font-bold text-midnight">{docCategory}</span>
                  </div>
                  <div>
                    <span className="text-muted-slate block">Title:</span>
                    <span className="font-bold text-midnight">{docTitle}</span>
                  </div>
                  <div>
                    <span className="text-muted-slate block">File Name:</span>
                    <span className="text-midnight">{docFileName}</span>
                  </div>
                  <div>
                    <span className="text-muted-slate block">Upload Status:</span>
                    <span className="text-emerald-700 font-bold">Uploaded & Hashed</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-ivory-200">
                  <span className="text-[10px] text-muted-slate uppercase font-bold block">SHA-256 Hash:</span>
                  <span className="font-mono text-[11px] text-gold-dark break-all">{docHash}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase font-bold block">IPFS CID:</span>
                  <span className="font-mono text-[11px] text-blue-900 break-all">{docIpfsCid}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Declaration Checkbox */}
            <div className="p-4 bg-amber-50/70 border border-amber-300/80 rounded-xl flex items-start space-x-3">
              <input
                type="checkbox"
                id="declaration"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer"
              />
              <label htmlFor="declaration" className="text-xs text-amber-950 leading-relaxed cursor-pointer">
                <strong>Declaration:</strong> I confirm that the information and documents submitted are accurate to the best of my knowledge and understand that this application will be reviewed by an authorized verifier.
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Document
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={submitting || !declarationAccepted}
                isLoading={submitting}
                onClick={handleSubmit}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {submitting ? "Submitting application..." : "Submit Land Application"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* IPFS Inspector Modal */}
      <IpfsInspectorModal
        isOpen={ipfsModalOpen}
        onClose={() => setIpfsModalOpen(false)}
        title={docTitle}
        category={docCategory}
        fileName={docFileName}
        fileSize={fileSize}
        sha256Hash={docHash ? (docHash.startsWith("0x") ? docHash : `0x${docHash}`) : undefined}
        ipfsCid={docIpfsCid}
        ipfsUrl={getIpfsGatewayUrl(docIpfsCid)}
      />
    </div>
  );
};
