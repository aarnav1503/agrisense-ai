import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Microscope, Pill, Shield, AlertTriangle, UserCheck } from "lucide-react";
import type { Diagnosis } from "@/lib/demo-data";

const tabs = [
  { key: "symptoms", label: "Symptoms", icon: Activity, gradient: "bg-gradient-primary" },
  { key: "cause", label: "Cause", icon: Microscope, gradient: "bg-gradient-teal" },
  { key: "treatment", label: "Treatment", icon: Pill, gradient: "bg-gradient-warm" },
  { key: "prevention", label: "Prevention", icon: Shield, gradient: "bg-gradient-lime" },
  { key: "severity", label: "Severity", icon: AlertTriangle, gradient: "bg-gradient-sky" },
  { key: "expert", label: "Consult Expert", icon: UserCheck, gradient: "bg-gradient-primary" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function KnowledgeSection({ d }: { d: Diagnosis }) {
  const [active, setActive] = useState<TabKey>("symptoms");

  return (
    <section className="rounded-3xl bg-card shadow-card border border-border/50 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-border/40 bg-gradient-hero/30">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
          Retrieved Knowledge
        </span>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
          Everything you need to know about{" "}
          <span className="text-gradient-fresh">{d.disease}</span>
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => {
            const isActive = active === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                  isActive
                    ? `${t.gradient} text-primary-foreground shadow-soft`
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="min-h-[180px]"
          >
            {active === "symptoms" && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {d.knowledge.symptoms.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent p-4 border border-primary/15"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            )}
            {active === "cause" && (
              <p className="text-base leading-relaxed text-foreground rounded-2xl bg-muted/40 p-5 border border-border/40">
                {d.knowledge.cause}
              </p>
            )}
            {active === "treatment" && (
              <ol className="space-y-3">
                {d.knowledge.treatment.map((t, i) => (
                  <li
                    key={t}
                    className="flex gap-4 rounded-2xl bg-card p-4 border border-warning/30 shadow-soft"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-warm text-warning-foreground font-bold text-sm shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-1">{t}</span>
                  </li>
                ))}
              </ol>
            )}
            {active === "prevention" && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {d.knowledge.prevention.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-lime/15 to-transparent p-4 border border-lime/30"
                  >
                    <Shield className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            )}
            {active === "severity" && (
              <div className="rounded-2xl bg-gradient-to-br from-sky/15 to-transparent p-6 border border-sky/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Severity Level</p>
                <p className="mt-2 font-display text-3xl font-bold text-gradient-fresh">
                  {d.knowledge.severity}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Severity reflects the disease's potential to reduce yield and spread under typical conditions.
                </p>
              </div>
            )}
            {active === "expert" && (
              <div className="rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent p-5 border border-destructive/20 flex gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10 shrink-0">
                  <UserCheck className="h-5 w-5 text-destructive" />
                </span>
                <p className="text-sm leading-relaxed pt-1.5">{d.knowledge.consultExpertWhen}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
