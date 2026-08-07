import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Filter, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Investigation } from "../types/database";
import {
  RiskBadge,
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorAlert,
  SearchInput,
} from "../components/ui";
import { cn, formatRelativeDate } from "../lib/utils";

const ITEMS_PER_PAGE = 10;

export function HistoryPage() {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("investigations")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setInvestigations(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load history";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return investigations.filter((inv) => {
      if (search && !inv.id.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (modeFilter !== "all" && inv.mode !== modeFilter) return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      return true;
    });
  }, [investigations, search, modeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, modeFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Investigation History</h1>
        </div>
        <LoadingSkeleton variant="table" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Investigation History</h1>
        </div>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Investigation History</h1>
        <p className="text-xs text-muted-foreground">
          {filtered.length} investigation{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by ID..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="demo">Demo</option>
            <option value="live">Live</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="No investigations found"
          description={
            search || modeFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No investigations have been run yet"
          }
          action={
            !search && modeFilter === "all" && statusFilter === "all"
              ? { label: "Run an Investigation", onClick: () => navigate("/suppliers") }
              : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/investigations/${inv.id}`)}
                    className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {inv.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeDate(inv.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 capitalize">
                        {inv.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {inv.overall_score !== null ? Math.round(inv.overall_score) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={inv.risk_level || "low"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {paginated.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate(`/investigations/${inv.id}`)}
                className="w-full rounded-xl border border-border bg-muted/20 p-4 text-left transition-all duration-150 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inv.id.slice(0, 8)}...
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRelativeDate(inv.created_at)}
                    </p>
                  </div>
                  <RiskBadge level={inv.risk_level || "low"} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 capitalize">
                      {inv.mode}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {inv.overall_score !== null ? Math.round(inv.overall_score) : "—"}
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