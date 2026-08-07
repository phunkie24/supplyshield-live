import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Search, BarChart3, CheckCircle, Users, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export function LandingPage() {
  const navigate = useNavigate();
  const { signInAnonymously } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemo = async () => {
    setIsLoading(true);
    const error = await signInAnonymously();
    if (error) {
      console.error("Demo sign-in failed:", error);
      setIsLoading(false);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-on-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">SupplyShield Live</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/50 active:scale-[0.97]"
            >
              Sign In
            </button>
            <button
              onClick={handleDemo}
              disabled={isLoading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-all duration-150 hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60"
            >
              {isLoading ? "Entering..." : "Explore Demo"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.35_0.07_256)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              AI-Powered{" "}
              <span className="text-primary">Supply Chain Risk</span>{" "}
              Intelligence
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Detect, analyse, and act on supplier risks before they impact your
              business. SupplyShield Live transforms web intelligence into
              evidence-backed, actionable recommendations.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={handleDemo}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-all duration-150 hover:bg-primary/90 active:scale-[0.97]"
              >
                {isLoading ? "Entering Demo..." : "Explore Demo"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/50 active:scale-[0.97]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            How SupplyShield Live Works
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative rounded-xl border border-border bg-muted/20 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {step.icon}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Built for Enterprise Risk Management
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/20 p-5 transition-all duration-200 hover:border-border/80"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {b.icon}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted-foreground">
          SupplyShield Live — Hackathon MVP. All sample data is fictional.
        </div>
      </footer>
    </div>
  );
}

const steps = [
  {
    icon: <Search className="h-5 w-5 text-primary" />,
    title: "Collect Evidence",
    description:
      "Automatically gather web signals about your suppliers — from delivery delays and compliance issues to cybersecurity incidents and leadership changes.",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    title: "Analyse Risk",
    description:
      "AI-powered analysis classifies evidence, assigns severity and confidence scores, and calculates a transparent, weighted risk score across seven categories.",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    title: "Take Action",
    description:
      "Review evidence-backed recommendations, approve or reject with a clear audit trail. Every decision is logged for compliance and accountability.",
  },
];

const benefits = [
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Real-Time Monitoring",
    description:
      "Continuous supplier risk surveillance with live web intelligence collection and instant alerting on critical changes.",
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Transparent Scoring",
    description:
      "Every risk score shows its full calculation — category weights, evidence contributions, and business context adjustments — so you always know why.",
  },
  {
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Human-in-the-Loop",
    description:
      "AI generates recommendations, but humans make decisions. Full audit trail of every approval, rejection, and modification.",
  },
  {
    icon: <Search className="h-4 w-4" />,
    title: "Evidence-Backed Analysis",
    description:
      "Every risk signal is traced to a source. No black-box decisions — see the exact evidence behind every score and recommendation.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "Supplier Portfolio View",
    description:
      "Complete visibility into your supplier ecosystem with drill-down from portfolio-level risk distribution to individual supplier investigations.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Zero Setup Demo",
    description:
      "Explore the full workflow in seconds with pre-seeded demo data. No account required — just click and start investigating.",
  },
];