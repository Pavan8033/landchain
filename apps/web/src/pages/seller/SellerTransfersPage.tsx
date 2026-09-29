import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { ArrowRightLeft, Clock, CheckCircle2, XCircle, Info, Ban } from "lucide-react";
import { api } from "../../services/api";
import { TransferRequest } from "../../types";

export const SellerTransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const handleCancelTransfer = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this pending transfer request?")) {
      return;
    }
    setCancellingId(id);
    try {
      await api.cancelTransfer(id);
      alert("Transfer request successfully cancelled.");
      fetchTransfers();
    } catch (err: any) {
      alert("Failed to cancel transfer: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Seller Dashboard", href: "/seller/dashboard" },
          { label: "Transfer Requests" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            Ownership Transfer History
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Track ownership transfers initiated for your verified parcels across the multi-party consent protocol.
          </p>
        </div>

        <Link to="/seller/transfers/create">
          <Button variant="primary" size="sm" leftIcon={<ArrowRightLeft className="w-4 h-4" />}>
            New Transfer Request
          </Button>
        </Link>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-slate">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-3" />
            Loading transfer requests...
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<ArrowRightLeft className="w-8 h-8 text-gold" />}
              title="No Transfer Requests Found"
              description="You have not initiated any ownership transfer requests yet."
              actionText="Initiate Transfer"
              onAction={() => (window.location.href = "/seller/transfers/create")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/80 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Transfer ID</th>
                  <th className="py-3.5 px-4">Land ID</th>
                  <th className="py-3.5 px-4">Buyer</th>
                  <th className="py-3.5 px-4">Buyer Wallet</th>
                  <th className="py-3.5 px-4">Agreed Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Updated Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {transfers.map((t) => (
                  <tr key={t.id || t.transferId} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-midnight">
                      {t.transferId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gold-dark font-semibold">
                      <Link to={`/records/${t.landId}`} className="hover:underline">
                        {t.landId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-midnight">{t.buyerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-muted-slate truncate max-w-[120px]">
                      {t.buyerWallet ? `${t.buyerWallet.slice(0, 6)}...${t.buyerWallet.slice(-4)}` : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-midnight">
                      {t.agreedPrice ? `₹${Number(t.agreedPrice).toLocaleString("en-IN")}` : "N/A"}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>
                    <td className="py-3.5 px-4 text-muted-slate text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-muted-slate text-[11px]">
                      {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTransfer(t)}
                        className="text-xs"
                      >
                        Details
                      </Button>
                      {t.status === "PENDING_BUYER" && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={cancellingId === t.id}
                          isLoading={cancellingId === t.id}
                          onClick={() => handleCancelTransfer(t.id)}
                          leftIcon={<Ban className="w-3 h-3" />}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transfer Detail Modal with Timeline */}
      {selectedTransfer && (
        <Modal
          isOpen={Boolean(selectedTransfer)}
          onClose={() => setSelectedTransfer(null)}
          title="Transfer Request Timeline"
          subtitle={`Reference: ${selectedTransfer.transferId}`}
        >
          <div className="space-y-5 text-xs">
            {/* Timeline */}
            <div className="space-y-3 p-4 bg-ivory-50 rounded-xl border border-ivory-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-midnight block">TRANSFER CREATED</span>
                  <span className="text-[10px] text-muted-slate">
                    Initiated by seller on {new Date(selectedTransfer.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    selectedTransfer.status === "PENDING_BUYER"
                      ? "bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-200"
                      : selectedTransfer.status === "CANCELLED"
                      ? "bg-red-100 text-red-900"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {selectedTransfer.status === "PENDING_BUYER" ? "●" : selectedTransfer.status === "CANCELLED" ? "✕" : "✓"}
                </div>
                <div>
                  <span className="font-bold text-midnight block">WAITING FOR BUYER</span>
                  <span className="text-[10px] text-muted-slate">
                    {selectedTransfer.status === "PENDING_BUYER"
                      ? "Active: Awaiting explicit buyer acceptance"
                      : selectedTransfer.status === "CANCELLED"
                      ? "Cancelled by seller"
                      : "Completed"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-ivory-200 text-muted-slate flex items-center justify-center font-bold text-xs">
                  ○
                </div>
                <div>
                  <span className="font-bold text-slate-navy block">GOVERNMENT REVIEW</span>
                  <span className="text-[10px] text-muted-slate">Pending buyer acceptance</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-ivory-200 text-muted-slate flex items-center justify-center font-bold text-xs">
                  ○
                </div>
                <div>
                  <span className="font-bold text-slate-navy block">BLOCKCHAIN TRANSFER</span>
                  <span className="text-[10px] text-muted-slate">Pending government approval (Step 6)</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-ivory-200 text-muted-slate flex items-center justify-center font-bold text-xs">
                  ○
                </div>
                <div>
                  <span className="font-bold text-slate-navy block">COMPLETED</span>
                  <span className="text-[10px] text-muted-slate">Final on-chain settlement</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 text-[11px]">
              <strong>Notice:</strong> At Step 4, no ownership transfer has occurred on the blockchain. The recorded on-chain owner remains the seller.
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
