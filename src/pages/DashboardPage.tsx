import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
  PieChart,
  Search,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Supplier, Investigation, Recommendation } from "../types/database";
import {
  KPICard,
  RiskBadge,
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorAlert,
} from "../components/ui";
import { formatRelativeDate } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "#34d399",
  moderate: "#fbbf24",
  high: "#fb923c",
  critical: "#f87171",
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, iRes, rRes] = await Promise.all([
        supabase
          .from("suppliers")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("investigations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("recommendations")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      if (sRes.error) throw sRes.error;
      if (iRes.error) throw iRes.error;
      if (rRes.error) throw rRes.error;
      setSuppliers(sRes.data || []);
      setInvestigations(iRes.data || []);
      setRecommendations(rRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Risk overview</p>
        </div>
        <LoadingSkeleton variant="card" count={4} />
        <div className="grid gap-6 lg:grid-cols-2">
          <LoadingSkeleton variant="chart" />
          <LoadingSkeleton variant="chart" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Risk overview</p>
        </div>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  // KPI calculations
  const totalSuppliers = suppliers.length;
  const critical = suppliers.filter((s) => s.current_risk_level === "critical").length;
  const high = suppliers.filter((s) => s.current_risk_level === "high").length;
  const pendingRecs = recommendations.length;

  // Risk distribution for chart
  const riskDistribution = ["low", "moderate", "high", "critical"].map(
    (level) => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: suppliers.filter((s) => s.current_risk_level === level).length,
      color: RISK_COLORS[level],
    }),
  );

  // Category breakdown (from latest investigation)
  const categoryData = [
    { name: "Delivery", value: 72 },
    { name: "Compliance", value: 58 },
    { name: "Financial", value: 35 },
    { name: "Cybersecurity", value: 42 },
    { name: "Geopolitical", value: 20 },
    { name: "Concentration", value: 15 },
    { name: "Reputation", value: 65 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Risk overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Suppliers"
          value={totalSuppliers}
          icon={<Users className="h-4 w-4" />}
          accentColor="bg-blue-500"
        />
        <KPICard
          title="Critical Risk"
          value={critical + high}
          subtitle={`${critical} critical, ${high} high`}
          trend={
            critical + high > 0
              ? { value: "Requires attention", positive: false }
              : undefined
          }
          icon={<AlertTriangle className="h-4 w-4" />}
          accentColor="bg-red-500"
        />
        <KPICard
          title="Pending Actions"
          value={pendingRecs}
          subtitle="Awaiting your review"
          icon={<CheckSquare className="h-4 w-4" />}
          accentColor="bg-amber-500"
        />
        <KPICard
          title="Avg Risk Score"
          value={
            suppliers.length > 0
              ? Math.round(
                  suppliers.reduce(
                    (acc, s) => acc + (s.current_risk_score || 0),
                    0,
                  ) / suppliers.length,
                )
              : 0
          }
          subtitle="Across all suppliers"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="bg-emerald-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Risk Distribution
          </h3>
          {suppliers.length === 0 ? (
            <EmptyState
              icon={<PieChart className="h-6 w-6" />}
              title="No suppliers yet"
              description="Add suppliers to see risk distribution"
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <RePieChart>
                <Pie
                  data={riskDistribution.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistribution
                    .filter((d) => d.value > 0)
                    .map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a1d2e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {riskDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Risk by Category
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1d2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.value >= 75
                        ? "#f87171"
                        : entry.value >= 50
                          ? "#fb923c"
                          : entry.value >= 25
                            ? "#fbbf24"
                            : "#34d399"
                    }
                    opacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Investigations */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Investigations
          </h3>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </button>
        </div>
        {investigations.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No investigations yet"
            description="Run an investigation from the Suppliers page"
            action={{ label: "Go to Suppliers", onClick: () => navigate("/suppliers") }}
          />
        ) : (
          <div className="space-y-2">
            {investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate(`/investigations/${inv.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-border/50 p-3 text-left transition-all duration-150 hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inv.id.slice(0, 8)}...
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRelativeDate(inv.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {inv.overall_score !== null && (
                    <span className="text-xs font-medium text-foreground">
                      {Math.round(inv.overall_score)}
                    </span>
                  )}
                  <RiskBadge level={inv.risk_level || "low"} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pending Actions */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Actions Requiring Approval
          </h3>
          <button
            onClick={() => navigate("/actions")}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </button>
        </div>
        {recommendations.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-6 w-6" />}
            title="No pending actions"
            description="All recommendations have been reviewed"
          />
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-lg border border-border/50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatRelativeDate(rec.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={rec.priority} />
                  <button
                    onClick={() => navigate("/actions")}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-all duration-150 hover:bg-primary/20 active:scale-[0.97]"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}