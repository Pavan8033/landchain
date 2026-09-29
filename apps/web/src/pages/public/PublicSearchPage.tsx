import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, LayoutGrid, List, MapPin, Building, ArrowRight } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { getStatusBadge } from "../../components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { api } from "../../services/api";
import { LandRecord } from "../../types";

export const PublicSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchRecords({
        q: query,
        category: category || undefined,
        limit: 20,
      });
      setRecords(res.data);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to connect to the LandChain registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    fetchRecords();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Public Land Search" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-midnight">
          Public Land Record Registry
        </h1>
        <p className="text-xs text-muted-slate mt-1">
          Search and verify immutable on-chain land registration records and ownership provenance.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-soft mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-slate" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Land ID, Parcel Number, Locality, or District..."
              className="w-full pl-9 pr-4 py-2 border border-ivory-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="w-full md:w-52">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 border border-ivory-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gold bg-white"
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

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-ivory-200">
        <div className="text-xs text-muted-slate font-medium">
          Showing <span className="font-bold text-midnight">{records.length}</span> of{" "}
          <span className="font-bold text-midnight">{totalCount}</span> verified record(s)
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border border-ivory-300 rounded-md p-0.5 bg-white">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded text-xs ${
              viewMode === "grid" ? "bg-gold text-midnight" : "text-muted-slate hover:text-midnight"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded text-xs ${
              viewMode === "table" ? "bg-gold text-midnight" : "text-muted-slate hover:text-midnight"
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {error ? (
        <div className="p-8 bg-red-50/60 border border-status-error/30 rounded-xl text-center space-y-3 max-w-lg mx-auto">
          <p className="text-xs text-status-error font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchRecords}>
            Retry Search
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-ivory-300 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No Matching Land Records Found"
          description="Try broadening your search query or removing category filters."
          actionText="Clear All Filters"
          onAction={() => {
            setQuery("");
            setCategory("");
            fetchRecords();
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {records.map((r) => (
            <Card key={r.landId} className="flex flex-col justify-between hover:shadow-card transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                    {r.landId}
                  </span>
                  {getStatusBadge(r.verificationState)}
                </div>

                <h3 className="font-serif text-lg font-bold text-midnight">{r.locality}</h3>
                <p className="text-xs text-muted-slate mt-0.5">
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
                  <div>
                    <span className="text-[10px] text-muted-slate uppercase block">Zoning</span>
                    <span className="font-medium text-midnight">{r.landCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-slate uppercase block">Transfers</span>
                    <span className="font-medium text-midnight">{r.transferCount} Completed</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-mono text-muted-slate truncate">
                  Owner: {r.currentOwnerWallet.slice(0, 10)}...{r.currentOwnerWallet.slice(-8)}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-ivory-200">
                <Link to={`/records/${r.landId}`} className="w-full block">
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Verified Record
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-soft overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/70 border-b border-ivory-200 text-slate-navy font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Land ID</th>
                <th className="py-3 px-4">Parcel / Survey</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Area (Sq.M)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Owner Wallet</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {records.map((r) => (
                <tr key={r.landId} className="hover:bg-ivory-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gold-dark">{r.landId}</td>
                  <td className="py-3 px-4 font-mono">{r.parcelNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-midnight">{r.locality}</div>
                    <div className="text-[11px] text-muted-slate">{r.district}, {r.state}</div>
                  </td>
                  <td className="py-3 px-4">{r.areaSqMeters.toLocaleString()}</td>
                  <td className="py-3 px-4">{r.landCategory}</td>
                  <td className="py-3 px-4 font-mono text-muted-slate">
                    {r.currentOwnerWallet.slice(0, 6)}...{r.currentOwnerWallet.slice(-4)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(r.verificationState)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/records/${r.landId}`}>
                      <Button variant="ghost" size="sm" className="text-gold font-bold">
                        Inspect
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
