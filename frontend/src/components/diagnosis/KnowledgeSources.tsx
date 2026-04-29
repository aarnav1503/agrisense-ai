import { FileText, Quote } from "lucide-react";
import type { Diagnosis } from "@/lib/demo-data";

export function KnowledgeSources({ d }: { d: Diagnosis }) {
  return (
    <section className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border/50">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-teal">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Knowledge Sources</h2>
          <p className="text-xs text-muted-foreground">Evidence retrieved from our agronomy database</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {d.evidence.map((e) => (
          <div
            key={e.source}
            className="rounded-2xl bg-gradient-to-br from-secondary/40 to-card p-5 border border-border/50 hover:border-primary/30 transition-smooth hover:shadow-elegant"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs font-semibold text-foreground/80">{e.source}</p>
              <span className="text-[10px] rounded-full bg-success/10 text-success px-2 py-0.5 font-bold">
                Retrieved
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {e.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold"
                >
                  #{t}
                </span>
              ))}
            </div>
            <div className="relative pl-4 border-l-2 border-primary/30">
              <Quote className="absolute -top-1 -left-2 h-3 w-3 text-primary bg-card" />
              <p className="text-sm text-muted-foreground italic leading-relaxed">{e.snippet}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
