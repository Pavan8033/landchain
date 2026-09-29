import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { getStatusBadge } from "../../components/common/Badge";
import { Building2, Search, ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const AgentDiscoveryPage: React.FC = () => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .searchRecords({ q: query, category: category || undefined, limit: 30 })
      .then((res) => setRecords(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    api
      .searchRecords({ q: query, category: category || undefined, limit: 30 })
      .then((res) => setRecords(res.data))
      .catch((e) => console.error(e));
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Agent Dashboard", href: "/agent/dashboard" },
          { label: "Registry Listings" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Public Land Registry Catalog
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Search and inspect permitted public records to assist clients with prospective acquisitions.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-soft">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-slate" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Locality, District, or Land ID..."
              className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:ring-1 focus:ring-gold bg-white"
            >
              <option value="">All Categories</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-xs text-muted-slate mt-0.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gold" />
                {r.district}, {r.state}
              </p>

              <div className="mt-3 py-2 border-y border-ivory-200 text-xs">
                <div>Parcel: {r.parcelNumber}</div>
                <div>Area: {r.areaSqMeters.toLocaleString()} Sq.M</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ivory-200 flex flex-col gap-2">
              <Link to={`/verify/${r.landId}`}>
                <Button variant="primary" size="sm" className="w-full text-xs" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-midnight" />}>
                  Verify Property
                </Button>
              </Link>
              <Link to={`/records/${r.landId}`}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Inspect Public Record
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
