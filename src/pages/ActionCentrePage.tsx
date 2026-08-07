import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { supabase } from "../lib/supabase";
import type { Recommendation } from "../types/database";
import {
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorAlert,
  ConfirmDialog,
} from "../components/ui";
import { cn, formatRelativeDate } from "../lib/utils";

export function ActionCentrePage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");
  const [approveDialog, setApproveDialog] = useState<Recommendation | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Recommendation | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setRecommendations(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load recommendations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = recommendations.filter((r) => {
    if (tab === "all") return true;
    return r.status === tab;
  });

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;

  const handleApprove = async (rec: Recommendation) => {
    const { error: err } = await supabase
      .from("recommendations")
      .update({ status: "approved", approved_at: new Date().toISOString() } as never)
      .eq("id", rec.id);

    if (!err) {
      await supabase.from("audit_logs").insert({
        entity_type: "recommendation",
        entity_id: rec.id,
        action: "approved",
        new_value: { status: "approved", title: rec.title },
      } as never);
      fetchData();
    }
  };

  const handleReject = async (rec: Recommendation) => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) return;
    const { error: err } = await supabase
      .from("recommendations")
      .update({ status: "rejected" } as never)
      .eq("id", rec.id);

    if (!err) {
      await supabase.from("audit_logs").insert({
        entity_type: "recommendation",
        entity_id: rec.id,
        action: "rejected",
        new_value: { status: "rejected", reason: rejectReason.trim() },
      } as never);
      setRejectReason("");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Action & Approval Centre</h1>
        <p className="text-xs text-muted-foreground">
          Review and act on AI-generated recommendations
        </p>
      </div>

      <div className="rounded-xl border border-border bg-amber-400/5 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/80">
            AI-generated recommendations require human review before action can be taken.
            All decisions are recorded in the audit log.
          </p>
        </div>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex border-b border-border">
          {["pending", "approved", "rejected", "all"].map((t) => (
            <Tabs.Trigger
              key={t}
              value={t}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "pending" && (
                <>
                  Pending
                  {pendingCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400/20 px-1 text-[10px] font-medium text-amber-400">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
              {t === "approved" && (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Approved
                </>
              )}
              {t === "rejected" && (
                <>
                  <XCircle className="h-3 w-3" />
                  Rejected
                </>
              )}
              {t === "all" && "All"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="mt-4 space-y-3">
          {loading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : error ? (
            <ErrorAlert message={error} onRetry={fetchData} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="h-6 w-6" />}
              title={
                tab === "pending"
                  ? "No pending recommendations"
                  : tab === "approved"
                    ? "No approved recommendations"
                    : tab === "rejected"
                      ? "No rejected recommendations"
                      : "No recommendations found"
              }
              description={
                tab === "pending"
                  ? "Run an investigation to generate recommendations"
                  : "No recommendations in this category"
              }
              action={
                tab === "pending"
                  ? { label: "Go to Dashboard", onClick: () => navigate("/dashboard") }
                  : undefined
              }
            />
          ) : (
            filtered.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {rec.title}
                      </h4>
                      <StatusBadge status={rec.priority} />
                    </div>
                    {rec.description && (
                      <p className="text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Created {formatRelativeDate(rec.created_at)}
                      {rec.approved_at && ` · Approved ${formatRelativeDate(rec.approved_at)}`}
                    </p>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>

                {rec.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setApproveDialog(rec)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400 transition-all duration-150 hover:bg-emerald-500/20 active:scale-[0.97]"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setRejectDialog(rec);
                        setRejectReason("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-all duration-150 hover:bg-red-500/20 active:scale-[0.97]"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                    <button
                      onClick={() => navigate(`/investigations/${rec.investigation_id}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-150 hover:bg-muted/70 active:scale-[0.97]"
                    >
                      <FileText className="h-3 w-3" />
                      View Investigation
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Tabs.Root>

      <ConfirmDialog
        open={approveDialog !== null}
        onClose={() => setApproveDialog(null)}
        onConfirm={() => {
          if (approveDialog) handleApprove(approveDialog);
          setApproveDialog(null);
        }}
        title="Approve Recommendation"
        message={`Approve "${approveDialog?.title}"? This action is recorded in the audit log.`}
        confirmLabel="Approve"
      />

      <ConfirmDialog
        open={rejectDialog !== null}
        onClose={() => setRejectDialog(null)}
        onConfirm={() => {
          if (rejectDialog) handleReject(rejectDialog);
          setRejectDialog(null);
        }}
        title="Reject Recommendation"
        message="Please provide a reason for rejection:"
        confirmLabel="Reject"
        variant="destructive"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Explain why this recommendation is rejected (min 10 characters)..."
          rows={3}
          className="mt-3 w-full rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
          <p className="mt-1 text-[10px] text-red-400">
            Please enter at least 10 characters
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}