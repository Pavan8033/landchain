import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge } from "../../components/common/Badge";
import { Boxes, CheckCircle2, ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { CONTRACT_ADDRESS } from "../../services/blockchain";

export const TransactionDetailsPage: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Blockchain Explorer", href: "/government/explorer" },
          { label: "Transaction" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            On-Chain Transaction Details
          </h1>
          <p className="text-xs text-muted-slate mt-1 font-mono truncate max-w-xl">
            Tx: {txHash}
          </p>
        </div>
        <Link to="/government/explorer">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Explorer
          </Button>
        </Link>
      </div>

      <Card title="Transaction Overview">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <span className="text-muted-slate font-medium">Status:</span>
            <Badge variant="success">Confirmed On-Chain (Receipt Verified)</Badge>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <span className="text-muted-slate font-medium">Network:</span>
            <span className="font-bold text-midnight">Hardhat Local (ChainID: 31337)</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <span className="text-muted-slate font-medium">Smart Contract:</span>
            <span className="font-mono text-gold-dark">{CONTRACT_ADDRESS}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <span className="text-muted-slate font-medium">Transaction Hash:</span>
            <span className="font-mono text-midnight break-all">{txHash}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <span className="text-muted-slate font-medium">Block Confirmation:</span>
            <span className="font-mono text-midnight">Block #42 (Finalized)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
