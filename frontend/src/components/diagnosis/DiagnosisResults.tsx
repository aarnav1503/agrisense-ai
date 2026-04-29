import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Info,
  Sparkles,
} from "lucide-react";
import type { Diagnosis } from "@/lib/demo-data";

const confColor: Record<string, string> = {
  High: "bg-gradient-primary text-primary-foreground",
  Moderate: "bg-gradient-warm text-warning-foreground",
  Low: "bg-destructive text-destructive-foreground",
};

function ProgressBar({ value, gradient = "bg-gradient-primary", delay = 0 }: { value: number; gradient?: string; delay?: number }) {
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`h-full ${gradient} rounded-full`}
      />
    </div>
  );
}

export function DiagnosisResults({ d }: { d: Diagnosis }) {
  const agreement = d.branchAgreement;
  const agreeMeta = {
    agree: { label: "Models Agree", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
    partial: { label: "Partial Agreement", color: "text-warning-foreground", bg: "bg-warning/15", icon: AlertTriangle },
    conflict: { label: "Models Disagree", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
  }[agreement];
  const AgreeIcon = agreeMeta.icon;

  return (
    <div className="space-y-5">
      {/* Final Diagnosis - hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-hero p-px shadow-elegant"
      >
        <div className="rounded-[calc(1.5rem-1px)] bg-card/90 backdrop-blur p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Final Diagnosis
              </span>
              <p className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">Likely Crop</p>
              <p className="font-display text-xl font-bold">{d.crop}</p>
              <p className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">Likely Disease</p>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-gradient-fresh">
                {d.disease}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</p>
              <p className="font-display text-4xl font-bold">{Math.round(d.confidence * 100)}%</p>
              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${confColor[d.confidenceLevel]}`}
              >
                <CheckCircle2 className="h-3 w-3" /> {d.confidenceLevel}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar value={d.confidence} delay={0.2} />
          </div>
        </div>
        <div className="absolute -z-10 -top-12 -right-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -z-10 -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal/30 blur-3xl" />
      </motion.div>

      {/* Top hybrid predictions */}
      <div className="rounded-3xl bg-card p-6 shadow-card border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold">Top Hybrid Predictions</h3>
        </div>
        <div className="space-y-4">
          {d.hybridPredictions.map((p, i) => (
            <div key={p.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className={i === 0 ? "font-semibold" : "text-muted-foreground"}>{p.label}</span>
                <span className="font-mono text-xs font-semibold">{(p.score * 100).toFixed(1)}%</span>
              </div>
              <ProgressBar
                value={p.score}
                gradient={i === 0 ? "bg-gradient-primary" : i === 1 ? "bg-gradient-teal" : "bg-gradient-sky"}
                delay={0.1 * i}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Branch disagreement - only show if both image and text were used */}
      {d.imagePredictions.length > 0 && d.textPredictions.length > 0 && (
        <div className="rounded-3xl bg-card p-6 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-teal" />
              <h3 className="font-display font-bold">Branch Disagreement</h3>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${agreeMeta.bg} ${agreeMeta.color}`}>
              <AgreeIcon className="h-3 w-3" /> {agreeMeta.label}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Image suggests</p>
              <p className="mt-1 font-semibold">{d.imageBranch}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-teal/10 to-transparent border border-teal/30 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Text suggests</p>
              <p className="mt-1 font-semibold">{d.textBranch}</p>
            </div>
          </div>
        </div>
      )}

      {/* Decision info */}
      <div className="rounded-3xl bg-card p-6 shadow-card border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-sky" />
          <h3 className="font-display font-bold">Decision Info</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {d.textPredictions.length > 0 && <Stat label="Crop from text" value={d.detectedCropFromText} />}
          {d.textPredictions.length > 0 && <Stat label="Keywords" value={d.keywordCount.toString()} />}
          {d.imagePredictions.length > 0 && <Stat label="Image weight" value={`${Math.round(d.fusionWeights.image * 100)}%`} accent />}
          {d.textPredictions.length > 0 && <Stat label="Text weight" value={`${Math.round(d.fusionWeights.text * 100)}%`} accent="teal" />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean | "teal" }) {
  const bg = accent === "teal" ? "bg-gradient-teal" : accent ? "bg-gradient-primary" : "bg-muted";
  const text = accent ? "text-primary-foreground" : "text-foreground";
  return (
    <div className={`rounded-2xl ${bg} p-3.5`}>
      <p className={`text-[10px] uppercase tracking-wider ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className={`mt-1 font-display text-lg font-bold ${text}`}>{value}</p>
    </div>
  );
}
