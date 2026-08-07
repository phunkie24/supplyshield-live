import { useState } from "react";
import { Shield, Database, Cpu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function SettingsPage() {
  const { isDemo } = useAuth();
  const [defaultMode, setDefaultMode] = useState("demo");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Configure your SupplyShield Live experience
        </p>
      </div>

      {/* Mode */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Default Mode</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose whether investigations run in Demo (seeded data) or Live mode
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDefaultMode("demo")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                defaultMode === "demo"
                  ? "bg-primary text-on-primary"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setDefaultMode("live")}
              disabled
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                defaultMode === "live"
                  ? "bg-primary text-on-primary"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              } disabled:opacity-50`}
            >
              Live
            </button>
          </div>
        </div>
      </div>

      {/* Risk Thresholds */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Risk Thresholds</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              High risk threshold (default: 50)
            </label>
            <input
              type="range"
              min={25}
              max={75}
              defaultValue={50}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Critical risk threshold (default: 75)
            </label>
            <input
              type="range"
              min={50}
              max={95}
              defaultValue={75}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Model */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">AI Model</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Default: Qwen/Qwen2.5-7B-Instruct
        </p>
        <p className="text-xs text-muted-foreground">
          Model selection and custom configuration coming soon.
        </p>
      </div>

      {/* Integration Status */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Integration Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-foreground">Supabase</span>
            </div>
            <span className="text-[11px] text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-foreground">Bright Data</span>
            </div>
            <span className="text-[11px] text-amber-400">Not Configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-foreground">Featherless AI</span>
            </div>
            <span className="text-[11px] text-amber-400">Not Configured</span>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-[11px] text-muted-foreground">
            API keys are stored securely in Supabase Secret Manager. Configure them
            in your Supabase dashboard to enable Live Mode.
          </p>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-xl border border-border bg-amber-400/5 p-4">
          <p className="text-xs text-amber-300/80">
            You are in Demo Mode. Some settings require a registered account.
            <button className="ml-1 font-medium text-amber-300 underline hover:text-amber-200">
              Create an account
            </button>
            to unlock full configuration.
          </p>
        </div>
      )}
    </div>
  );
}