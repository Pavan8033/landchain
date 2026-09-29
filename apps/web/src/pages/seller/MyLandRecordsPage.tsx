import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { Badge, getStatusBadge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Download, ArrowRightLeft, ExternalLink, PlusCircle, Building2 } from "lucide-react";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const MyLandRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .searchRecords({ limit: 50 })
      .then((res) => setRecords(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Seller Dashboard", href: "/seller/dashboard" },
          { label: "My Land Records" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight">
            My Registered Land Records
          </h1>
          <p className="text-xs text-muted-slate mt-1">
            Parcels registered on the blockchain under your ownership wallet address.
          </p>
        </div>

        <Link to="/seller/register-land">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Register New Parcel
          </Button>
        </Link>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No Registered Parcels Yet"
          description="Submit a land registration application to have your parcel verified and minted onto the blockchain."
          actionText="Start Registration Wizard"
          onAction={() => (window.location.href = "/seller/register-land")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((r) => (
            <Card key={r.landId} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                    {r.landId}
                  </span>
                  {getStatusBadge(r.verificationState)}
                </div>

                <h3 className="font-serif text-lg font-bold text-midnight line-clamp-1">
                  {r.locality}
                </h3>
                <p className="text-xs text-muted-slate">
                  {r.district}, {r.state}
                </p>

                <div className="mt-4 py-2 border-y border-ivory-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-slate uppercase block">Parcel No</span>
                    <span className="font-mono font-medium text-midnight">{r.parcelNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-slate uppercase block">Area</span>
                    <span className="font-medium text-midnight">{r.areaSqMeters.toLocaleString()} Sq.M</span>
                  </div>
                </div>

                <p className="text-xs text-muted-slate mt-3 line-clamp-2">{r.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-ivory-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <Link to={`/records/${r.landId}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      Inspect
                    </Button>
                  </Link>

                  <a
                    href={api.getCertificateDownloadUrl(r.landId)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Download className="w-3 h-3" />}>
                      PDF Cert
                    </Button>
                  </a>
                </div>

                <Link to={`/seller/create-transfer?landId=${r.landId}`} className="block">
                  <Button variant="primary" size="sm" className="w-full text-xs" leftIcon={<ArrowRightLeft className="w-3 h-3" />}>
                    Initiate Transfer
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
