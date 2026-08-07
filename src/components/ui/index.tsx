import { cn, getRiskBg, getRiskColor } from "../../lib/utils";

interface RiskBadgeProps {
  level: string;
  size?: "sm" | "md";
  className?: string;
}

export function RiskBadge({ level, size = "sm", className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium capitalize",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        getRiskBg(level),
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          getRiskColor(level).replace("text-", "bg-"),
        )}
      />
      {level}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    rejected: "bg-red-400/10 text-red-400 border-red-400/20",
    completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    failed: "bg-red-400/10 text-red-400 border-red-400/20",
    in_progress: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    queued: "bg-gray-400/10 text-gray-400 border-gray-400/20",
    assigned: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
    modified: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    overdue: "bg-red-400/10 text-red-400 border-red-400/20",
    active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    inactive: "bg-gray-400/10 text-gray-400 border-gray-400/20",
    suspended: "bg-red-400/10 text-red-400 border-red-400/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        variants[status] || "bg-gray-400/10 text-gray-400 border-gray-400/20",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

interface CriticalityIndicatorProps {
  value: number;
  max?: number;
}

export function CriticalityIndicator({
  value,
  max = 5,
}: CriticalityIndicatorProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-3 rounded-sm ${
            i < value ? "bg-orange-400" : "bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  accentColor?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = "bg-primary",
}: KPICardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted/50 p-5 transition-all duration-200 hover:border-border/80 hover:bg-muted/70">
      <div className={`absolute left-0 top-0 h-full w-0.5 ${accentColor}`} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "chart";
  count?: number;
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
}: LoadingSkeletonProps) {
  if (variant === "chart") {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
        <div className="h-48 animate-pulse rounded-lg bg-gray-800/50" />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded bg-gray-800/50" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded bg-gray-800/30"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-border bg-muted/50 p-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="mb-3 h-3 w-24 rounded bg-gray-700" />
          <div className="mb-2 h-7 w-16 rounded bg-gray-700" />
          <div className="h-3 w-32 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-xl bg-muted/50 p-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-on-primary transition-all duration-150 hover:bg-primary/90 active:scale-[0.97]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-red-400">⚠</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-300">Something went wrong</p>
          <p className="mt-1 text-xs text-red-400/80">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium text-red-300 underline underline-offset-2 transition-colors hover:text-red-200"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "default",
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/50 active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-on-primary transition-all duration-150 active:scale-[0.97] ${
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}