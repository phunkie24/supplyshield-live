import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Investigation, Evidence, RiskScore, Recommendation, AuditLog } from "../types/database";
import {
  RiskBadge,
  StatusBadge,
  LoadingSkeleton,
  ErrorAlert,
  EmptyState,
  ConfirmDialog,
} from "../components/ui";
import { cn, formatDate, formatRelativeDate } from "../lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const STAGES = [
  { key: "queued", label: "Queued" },
  { key: "collecting_signals", label: "Collecting Signals" },
  { key: "resolving_entity", label: "Resolving Entity" },
  { key: "verifying_evidence", label: "Verifying Evidence" },
  { key: "classifying_risks", label: "Classifying Risks" },
  { key: "calculating_score", label: "Calculating Score" },
  { key: "analysing_business_impact", label: "Analysing Impact" },
  { key: "generating_recommendations", label: "Generating Recommendations" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

const CATEGORY_WEIGHTS: Record<string, number> = {
  delivery: 0.25,
  compliance: 0.20,
  financial: 0.15,
  cybersecurity: 0.15,
  geopolitical: 0.10,
  concentration: 0.10,
  reputation: 0.05,
};

export function InvestigationWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveDialog, setApproveDialog] = useState<Recommendation | null>(null);
  const [rejectDialog, setRejectDialog] = useState<Recommendation | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [iRes, eRes, rRes, recRes, aRes] = await Promise.all([
        supabase.from("investigations").select("*").eq("id", id).single(),
        supabase.from("evidence").select("*").eq("investigation_id", id),
        supabase.from("risk_scores").select("*").eq("investigation_id", id),
        supabase.from("recommendations").select("*").eq("investigation_id", id),
        supabase
          .from("audit_logs")
          .select("*")
          .eq("entity_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (iRes.error) throw iRes.error;
      setInvestigation(iRes.data);
      setEvidence(eRes.data || []);
      setRiskScores(rRes.data || []);
      setRecommendations(recRes.data || []);
      setAuditLogs(aRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load investigation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="chart" />
        <LoadingSkeleton variant="table" count={3} />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <ErrorAlert
        message={error || "Investigation not found"}
        onRetry={fetchData}
      />
    );
  }

  const currentStageIndex = STAGES.findIndex(
    (s) => s.key === investigation.current_stage,
  );
  const isCompleted = investigation.status === "completed";
  const isFailed = investigation.status === "failed";

  // Radar data from risk_scores or generate from evidence
  const radarData = riskScores.length > 0
    ? riskScores.map((rs) => ({
        category: rs.category.charAt(0).toUpperCase() + rs.category.slice(1),
        score: Math.round(rs.raw_score || 0),
        fullMark: 100,
      }))
    : Object.entries(CATEGORY_WEIGHTS).map(([cat]) => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        score: 0,
        fullMark: 100,
      }));

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Investigation
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={investigation.status} />
              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 capitalize">
                {investigation.mode} mode
              </span>
              {investigation.model_name && (
                <span className="text-[11px] text-muted-foreground">
                  {investigation.model_name}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            {investigation.overall_score !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {Math.round(investigation.overall_score)}
                </span>
                <RiskBadge level={investigation.risk_level || "low"} size="md" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pending</p>
            )}
          </div>
        </div>

        {/* Stage Progress */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto">
          {STAGES.slice(0, 9).map((stage, i) => {
            const isActive = i <= currentStageIndex && !isFailed;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage.key} className="flex items-center gap-1">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium whitespace-nowrap transition-colors",
                    isCurrent
                      ? "bg-primary/20 text-primary"
                      : isActive
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-gray-800/50 text-muted-foreground",
                  )}
                >
                  {isActive && i < currentStageIndex ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : isCurrent && !isCompleted ? (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                  ) : null}
                  {stage.label}
                </div>
                {i < 8 && (
                  <div
                    className={cn(
                      "h-px w-4",
                      i < currentStageIndex ? "bg-emerald-400/40" : "bg-gray-700",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence + Risk Scores row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evidence */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Evidence ({evidence.length})
          </h3>
          {evidence.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No evidence collected"
              description="Evidence will appear once the investigation processes data"
            />
          ) : (
            <div className="space-y-3">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ev.source_title}
                      </p>
                      {ev.publisher && (
                        <p className="text-[11px] text-muted-foreground">
                          {ev.publisher}
                          {ev.published_at && ` · ${formatDate(ev.published_at)}`}
                        </p>
                      )}
                      {ev.extracted_claim && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {ev.extracted_claim}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <RiskBadge level={
                        ev.severity && ev.severity >= 0.7
                          ? "critical"
                          : ev.severity && ev.severity >= 0.4
                            ? "high"
                            : "moderate"
                      } />
                      {ev.is_demo && (
                        <span className="text-[10px] text-amber-400">
                          Demo Evidence
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                      {ev.category}
                    </span>
                    {ev.confidence !== null && (
                      <span className="rounded bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                        Confidence: {Math.round(ev.confidence * 100)}%
                      </span>
                    )}
                    {ev.severity !== null && (
                      <span className="rounded bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                        Severity: {Math.round(ev.severity * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Scores */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Risk Scores
            </h3>
            {radarData.every((d) => d.score === 0) ? (
              <EmptyState
                icon={<AlertTriangle className="h-6 w-6" />}
                title="No scores yet"
                description="Scores are calculated during analysis"
              />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 9 }}
                  />
                  <Radar
                    name="Risk Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Score breakdown */}
          {riskScores.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Score Breakdown
              </h3>
              <div className="space-y-2">
                {riskScores.map((rs) => (
                  <div key={rs.id} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {rs.category}
                      <span className="ml-1 text-[10px] opacity-60">
                        ({(CATEGORY_WEIGHTS[rs.category] * 100).toFixed(0)}%)
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, rs.raw_score || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-6 text-right">
                        {Math.round(rs.raw_score || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {investigation.executive_summary && (
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Executive Summary
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {investigation.executive_summary}
          </p>
          {investigation.model_name && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Analysis by {investigation.model_name}
            </p>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Recommendations
        </h3>
        {recommendations.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No recommendations yet"
            description="Recommendations will appear after analysis is complete"
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {rec.title}
                      </h4>
                      <StatusBadge status={rec.priority === "critical" ? "overdue" : rec.priority === "high" ? "in_progress" : "pending"} />
                    </div>
                    {rec.description && (
                      <p className="text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    )}
                    {rec.rationale && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <span className="font-medium">Rationale:</span> {rec.rationale}
                      </p>
                    )}
                    {rec.expected_impact && (
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Expected impact:</span>{" "}
                        {rec.expected_impact}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={rec.status} />
                  </div>
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Timeline */}
      {auditLogs.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Audit Timeline
          </h3>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 w-px bg-border" />
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-xs font-medium text-foreground capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatRelativeDate(log.created_at)}
                  </p>
                  {log.new_value && (
                    <pre className="mt-1 text-[10px] text-muted-foreground">
                      {JSON.stringify(log.new_value, null, 1)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={approveDialog !== null}
        onClose={() => setApproveDialog(null)}
        onConfirm={() => {
          if (approveDialog) handleApprove(approveDialog);
          setApproveDialog(null);
        }}
        title="Approve Recommendation"
        message={`Are you sure you want to approve "${approveDialog?.title}"? This action will be recorded in the audit log.`}
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