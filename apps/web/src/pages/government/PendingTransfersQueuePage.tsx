import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { GitPullRequest, CheckCircle2, ShieldCheck, Blocks, ArrowRightLeft } from "lucide-react";
import { api } from "../../services/api";
import { authorizeTransferOnChain, getLandRecordOnChain, checkAndSwitchNetwork } from "../../services/blockchain";
import { TransferRequest } from "../../types";

export const PendingTransfersQueuePage: React.FC = () => {
  const { isConnected, connect, isCorrectNetwork, switchToLocalNetwork } = useWallet();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Transfer for Authorization
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [govNotes, setGovNotes] = useState("Deed and stamp duty verified. Approved for on-chain transfer.");
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

  const handleAuthorizeTransfer = async () => {
    if (!selectedTransfer) return;
    setProcessing(true);
    try {
      if (!isConnected) {
        await connect();
      }

      const networkOk = await checkAndSwitchNetwork();
      if (!networkOk) {
        throw new Error("Please switch to the LandChain Local Network (Chain ID: 31337) in MetaMask.");
      }

      // 1. Submit government review decision to backend
      await api.governmentReviewTransfer(selectedTransfer.id, "APPROVE", govNotes);

      // 2. Real MetaMask digital signature and smart contract transaction execution
      const receipt = await authorizeTransferOnChain(selectedTransfer.landId);

      // 3. Post-transaction verification: read smart contract state directly
      try {
        const onChain = await getLandRecordOnChain(selectedTransfer.landId);
        console.log("Confirmed on-chain conveyance state:", onChain);
      } catch (readErr: any) {
        console.warn("Smart contract read warning:", readErr.message);
      }

      // 4. Update database projection with verified transaction hash and block number
      await api.completeTransferOnChain(selectedTransfer.id, receipt.txHash, receipt.blockNumber);

      alert(`Ownership transfer for land ${selectedTransfer.landId} successfully confirmed on-chain!\nTx Hash: ${receipt.txHash}\nBlock: #${receipt.blockNumber}`);
      setSelectedTransfer(null);
      fetchTransfers();
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected")) {
        alert("Transaction cancelled: MetaMask digital signature was rejected by user.");
      } else {
        alert("Transfer authorization failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Government Dashboard", href: "/government/dashboard" },
          { label: "Transfer Authorization Queue" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Ownership Transfer Authorization Queue
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Stage 4 & 5 of the protocol: review mutual seller-buyer consent and execute the final on-chain conveyance transaction.
        </p>
      </div>

      <Card noPadding>
        {transfers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<GitPullRequest className="w-6 h-6" />}
              title="No Transfers Pending Authorization"
              description="Transfers will appear here once the prospective buyer has executed explicit consent."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transfer Ref</th>
                  <th className="py-3 px-4">Land ID</th>
                  <th className="py-3 px-4">Seller (Current)</th>
                  <th className="py-3 px-4">Buyer (Consented)</th>
                  <th className="py-3 px-4">Consideration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-navy">
                      {t.transferId}
                    </td>
                    <td className="py-3 px-4 font-mono text-gold-dark font-semibold">
                      <Link to={`/records/${t.landId}`} className="hover:underline">
                        {t.landId}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-midnight">{t.sellerEmail}</div>
                      <div className="font-mono text-[10px] text-muted-slate truncate max-w-[120px]">
                        {t.sellerWallet}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-midnight">{t.buyerEmail}</div>
                      <div className="font-mono text-[10px] text-muted-slate truncate max-w-[120px]">
                        {t.buyerWallet}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-midnight">
                      {t.agreedPrice ? `₹${t.agreedPrice.toLocaleString()}` : "N/A"}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {t.status === "ACCEPTED_BY_BUYER" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedTransfer(t)}
                          leftIcon={<Blocks className="w-3.5 h-3.5 text-midnight" />}
                        >
                          Authorize On-Chain
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-slate font-medium">
                          {t.status === "TRANSFERRED_ON_CHAIN" ? "Finalized" : "Awaiting Buyer"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Authorization Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTransfer(null)}
          title="Authorize On-Chain Land Conveyance"
          subtitle={`Land Reference: ${selectedTransfer.landId} • Transfer Ref: ${selectedTransfer.transferId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-slate">Current Recorded Seller:</span>
                <span className="font-medium text-midnight">{selectedTransfer.sellerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-slate">New Designated Buyer:</span>
                <span className="font-medium text-midnight">{selectedTransfer.buyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-slate">Buyer Ethereum Wallet:</span>
                <span className="font-mono text-[11px] text-midnight truncate max-w-[240px]">
                  {selectedTransfer.buyerWallet}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-slate">Buyer Consent Notes:</span>
                <span className="text-slate-navy italic">
                  "{selectedTransfer.buyerNotes || "Explicit consent granted"}"
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-navy mb-1">
                Government Registrar Approval Notes:
              </label>
              <textarea
                rows={3}
                value={govNotes}
                onChange={(e) => setGovNotes(e.target.value)}
                className="w-full p-2.5 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-muted-blue leading-relaxed">
              <strong>Execution Notice:</strong> Submitting authorization will trigger the smart contract function <code>authorizeTransfer</code>. The immutable on-chain record will reassign ownership to the buyer's wallet, increment the transfer counter, and issue an updated certificate.
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTransfer(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={processing}
                onClick={handleAuthorizeTransfer}
                leftIcon={<Blocks className="w-4 h-4 text-midnight" />}
              >
                Sign & Finalize Transfer On-Chain
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
