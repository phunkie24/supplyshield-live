import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Supplier } from "../types/database";
import {
  RiskBadge,
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorAlert,
  SearchInput,
  CriticalityIndicator,
} from "../components/ui";
import { cn, formatCurrency } from "../lib/utils";

const ITEMS_PER_PAGE = 10;

export function SupplierPortfolioPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (err) throw err;
      setSuppliers(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load suppliers";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Compute categories and filter
  const categories = useMemo(
    () => [...new Set(suppliers.map((s) => s.category))].sort(),
    [suppliers],
  );

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (riskFilter !== "all" && s.current_risk_level !== riskFilter) return false;
      return true;
    });
  }, [suppliers, search, categoryFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, riskFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Suppliers</h1>
          <p className="text-xs text-muted-foreground">Supplier portfolio</p>
        </div>
        <LoadingSkeleton variant="table" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Suppliers</h1>
        </div>
        <ErrorAlert message={error} onRetry={fetchSuppliers} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Suppliers</h1>
        <p className="text-xs text-muted-foreground">
          {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search suppliers..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table (desktop) */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No suppliers found"
          description={
            search || categoryFilter !== "all" || riskFilter !== "all"
              ? "Try adjusting your filters"
              : "No suppliers in the portfolio yet"
          }
          action={
            !search && categoryFilter === "all" && riskFilter === "all"
              ? { label: "Refresh", onClick: fetchSuppliers }
              : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Criticality
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Risk Score
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Contract
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/suppliers/${s.id}`)}
                    className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.category}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.country}
                    </td>
                    <td className="px-4 py-3">
                      <CriticalityIndicator value={s.criticality} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {s.current_risk_score !== null
                        ? Math.round(s.current_risk_score)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={s.current_risk_level} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.contract_value
                        ? formatCurrency(s.contract_value, s.currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/suppliers/${s.id}`);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="space-y-3 lg:hidden">
            {paginated.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/suppliers/${s.id}`)}
                className="w-full rounded-xl border border-border bg-muted/20 p-4 text-left transition-all duration-150 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.category} · {s.country}
                    </p>
                  </div>
                  <RiskBadge level={s.current_risk_level} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CriticalityIndicator value={s.criticality} />
                    <span className="text-[11px] text-muted-foreground">
                      Crit {s.criticality}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {s.current_risk_score !== null
                      ? `${Math.round(s.current_risk_score)}`
                      : "—"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      page === i + 1
                        ? "bg-primary text-on-primary"
                        : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}