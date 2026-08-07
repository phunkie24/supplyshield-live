import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Supplier, Investigation } from "../types/database";
import {
  RiskBadge,
  StatusBadge,
  CriticalityIndicator,
  LoadingSkeleton,
  ErrorAlert,
} from "../components/ui";
import { formatCurrency, formatDate, formatRelativeDate } from "../lib/utils";

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [sRes, iRes] = await Promise.all([
        supabase.from("suppliers").select("*").eq("id", id).single(),
        supabase
          .from("investigations")
          .select("*")
          .eq("supplier_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (sRes.error) throw sRes.error;
      setSupplier(sRes.data);
      setInvestigations(iRes.data || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load supplier";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRunInvestigation = async () => {
    if (!id || !supplier) return;
    setRunning(true);
    try {
      const { data, error: err } = await supabase
        .from("investigations")
        .insert({
          supplier_id: id,
          mode: "demo",
          status: "completed",
          current_stage: "completed",
          overall_score: supplier.current_risk_score || Math.round(Math.random() * 50 + 25),
          risk_level: supplier.current_risk_level || "moderate",
          executive_summary: `Investigation completed for ${supplier.name}. Analysis based on seeded demonstration data.`,
          model_name: "Seeded Data (Demo Mode)",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        } as never)
        .select()
        .single();

      if (err) throw err;
      if ((data as unknown as { id: string } | null)?.id) {
        navigate(`/investigations/${(data as unknown as { id: string }).id}`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to start investigation";
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={2} />
        <LoadingSkeleton variant="table" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div>
        <ErrorAlert
          message={error || "Supplier not found"}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/suppliers")}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Suppliers
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{supplier.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {supplier.category}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {supplier.country}
              </span>
              <span className="text-muted-foreground">·</span>
              <StatusBadge status={supplier.status} />
              {supplier.is_demo && (
                <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                  Demo
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold text-foreground">
                {supplier.current_risk_score !== null
                  ? Math.round(supplier.current_risk_score)
                  : "—"}
              </p>
            </div>
            <RiskBadge level={supplier.current_risk_level} size="md" />
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Contract
          </p>
          <p className="text-sm font-semibold text-foreground">
            {supplier.contract_value
              ? formatCurrency(supplier.contract_value, supplier.currency)
              : "N/A"}
          </p>
          {supplier.renewal_date && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Renews {formatDate(supplier.renewal_date)}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Criticality
          </p>
          <CriticalityIndicator value={supplier.criticality} />
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Performance
          </p>
          <div className="flex gap-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Delivery</p>
              <p className="text-sm font-semibold text-foreground">
                {supplier.delivery_score ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Quality</p>
              <p className="text-sm font-semibold text-foreground">
                {supplier.quality_score ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Run Investigation */}
      <div className="flex justify-center">
        <button
          onClick={handleRunInvestigation}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-all duration-150 hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {running ? "Starting..." : "Run Investigation"}
        </button>
      </div>

      {/* Previous Investigations */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Previous Investigations
        </h3>
        {investigations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No previous investigations
          </p>
        ) : (
          <div className="space-y-2">
            {investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate(`/investigations/${inv.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatRelativeDate(inv.created_at)}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {inv.mode} mode · {inv.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.overall_score !== null && (
                    <span className="text-sm font-medium text-foreground">
                      {Math.round(inv.overall_score)}
                    </span>
                  )}
                  <RiskBadge level={inv.risk_level || "low"} />
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}