import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date | null): string {
  if (!date) return "N/A";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "low":
      return "text-emerald-400";
    case "moderate":
      return "text-amber-400";
    case "high":
      return "text-orange-400";
    case "critical":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getRiskBg(level: string): string {
  switch (level) {
    case "low":
      return "bg-emerald-400/10 border-emerald-400/20";
    case "moderate":
      return "bg-amber-400/10 border-amber-400/20";
    case "high":
      return "bg-orange-400/10 border-orange-400/20";
    case "critical":
      return "bg-red-400/10 border-red-400/20";
    default:
      return "bg-gray-400/10 border-gray-400/20";
  }
}

export function getRiskLevel(score: number): string {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-red-400 border-red-400/30 bg-red-400/10";
    case "high":
      return "text-orange-400 border-orange-400/30 bg-orange-400/10";
    case "medium":
      return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "low":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    default:
      return "text-gray-400 border-gray-400/30 bg-gray-400/10";
  }
}