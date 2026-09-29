import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { getStatusBadge } from "../../components/common/Badge";
import { Search, Filter, Building2, MapPin, ArrowRight } from "lucide-react";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const BuyerDiscoveryPage: React.FC = () => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.searchRecords({ q: query, category: category || undefined, limit: 30 });
      setRecords(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Buyer Dashboard", href: "/buyer/dashboard" },
          { label: "Land Discovery" },
        ]}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Discover Verified Land Parcels
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Explore tamper-resistant, government-verified properties backed by Ethereum smart contracts.
        </p>
      </div>

      {/* Filter Bar */}
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
            Search Registry
          </Button>
        </form>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((r) => (
          <Card key={r.landId} className="flex flex-col justify-between hover:shadow-card transition-shadow">
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

              <div className="mt-4 py-2 border-y border-ivory-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block font-semibold">Survey No</span>
                  <span className="font-mono font-medium text-midnight">{r.parcelNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block font-semibold">Area</span>
                  <span className="font-medium text-midnight">{r.areaSqMeters.toLocaleString()} Sq.M</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block font-semibold">Zoning</span>
                  <span className="font-medium text-midnight">{r.landCategory}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block font-semibold">Transfers</span>
                  <span className="font-medium text-midnight">{r.transferCount} Completed</span>
                </div>
              </div>

              <p className="text-xs text-muted-slate mt-3 line-clamp-2">{r.description}</p>
            </div>

            <div className="mt-6 pt-3 border-t border-ivory-200">
              <Link to={`/records/${r.landId}`} className="block">
                <Button variant="outline" size="sm" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Inspect Title & Provenance
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
