import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import {
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { api } from "../../services/api";
import { acceptTransferOnChain, rejectTransferOnChain } from "../../services/blockchain";
import { TransferRequest } from "../../types";

export const IncomingTransfersPage: React.FC = () => {
  const { user } = useAuth();
  const { account, isConnected } = useWallet();

  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Transfer Modal
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT">("ACCEPT");
  const [consentNotes, setConsentNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchTransfers = () => {
    setLoading(true);
    api
      .listTransfers()
      .then((data) => setTransfers(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleConsentSubmit = async () => {
    if (!selectedTransfer) return;
    setProcessing(true);
    try {
      // 1. Submit consent to backend API
      const updated = await api.buyerConsent(selectedTransfer.id, actionType, consentNotes);

      // 2. If MetaMask is connected and action is ACCEPT, trigger smart contract acceptTransfer
      if (isConnected) {
        try {
          if (actionType === "ACCEPT") {
            await acceptTransferOnChain(selectedTransfer.landId);
          } else {
            await rejectTransferOnChain(selectedTransfer.landId);
          }
        } catch (chainErr: any) {
          console.warn("Smart contract acceptTransfer notice:", chainErr.message);
        }
      }

      alert(
        `Transfer offer ${actionType === "ACCEPT" ? "accepted" : "rejected"}! It is now forwarded to the Government Authority for final review and on-chain authorization.`
      );
      setSelectedTransfer(null);
      fetchTransfers();
    } catch (err: any) {
      alert("Failed submitting decision: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Buyer Dashboard", href: "/buyer/dashboard" },
          { label: "Incoming Transfer Requests" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Incoming Transfer Requests
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Review and respond to land ownership requests addressed to you.
        </p>
      </div>

      <Card noPadding>
        {transfers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<ArrowDownLeft className="w-6 h-6" />}
              title="No Transfer Requests Found"
              description="When a verified land seller nominates your account for an ownership transfer, the request appears here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transfer ID</th>
                  <th className="py-3 px-4">Land ID</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Agreed Price</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-navy">
                      {t.transferId || t.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-gold-dark font-semibold">
                      <Link to={`/records/${t.landId}`} className="hover:underline">
                        {t.landId}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-midnight">Verified Owner</div>
                      <div className="font-mono text-[11px] text-muted-slate truncate max-w-[140px]">
                        {t.sellerWallet ? `${t.sellerWallet.slice(0, 6)}...${t.sellerWallet.slice(-4)}` : t.sellerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-midnight">
                      {t.agreedPrice ? `₹${t.agreedPrice.toLocaleString()}` : "₹1,25,00,000"}
                    </td>
                    <td className="py-3 px-4 text-muted-slate">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/buyer/transfers/${t.transferId || t.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-midnight" />}
                        >
                          Review Transfer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Decision Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTransfer(null)}
          title={actionType === "ACCEPT" ? "Confirm Acceptance of Land Transfer" : "Reject Land Transfer Offer"}
          subtitle={`Land Reference: ${selectedTransfer.landId} • Transfer Ref: ${selectedTransfer.transferId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ivory-50 rounded-lg border border-ivory-200 space-y-1.5">
              <div>
                <span className="text-muted-slate">Current Recorded Seller:</span>{" "}
                <span className="font-medium text-midnight">{selectedTransfer.sellerEmail}</span>
              </div>
              <div>
                <span className="text-muted-slate">Nominated Buyer Wallet:</span>{" "}
                <span className="font-mono text-midnight break-all">{selectedTransfer.buyerWallet}</span>
              </div>
              <div>
                <span className="text-muted-slate">Agreed Price:</span>{" "}
                <span className="font-bold text-midnight">
                  {selectedTransfer.agreedPrice ? `₹${selectedTransfer.agreedPrice.toLocaleString()}` : "N/A"}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                Decision Notes / Consent Acknowledgement:
              </label>
              <textarea
                rows={3}
                value={consentNotes}
                onChange={(e) => setConsentNotes(e.target.value)}
                placeholder="I confirm review of the parcel surveys, boundaries, and financial terms..."
                className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Multi-Party Protocol Notice:</strong> Granting your acceptance advances the status to{" "}
              <strong>ACCEPTED_BY_BUYER</strong>. The authorized Government Verifier will review and execute the final on-chain transfer to your wallet.
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTransfer(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "ACCEPT" ? "primary" : "danger"}
                size="md"
                isLoading={processing}
                onClick={handleConsentSubmit}
              >
                {actionType === "ACCEPT" ? "Confirm & Accept Transfer" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
