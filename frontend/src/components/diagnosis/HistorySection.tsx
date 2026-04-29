import { Clock, ArrowUpRight } from "lucide-react";
import type { Diagnosis } from "@/lib/demo-data";

export function HistorySection({ items, onOpen }: { items: Diagnosis[]; onOpen: (id: string) => void }) {
  return (
    <section className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-sky">
            <Clock className="h-4 w-4 text-primary-foreground" />
          </span>
          <h2 className="font-display text-xl font-bold">Diagnosis History</h2>
        </div>
        <span className="text-xs text-muted-foreground">{items.length} previous scans</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <button
            key={d.id}
            onClick={() => onOpen(d.id)}
            className="group text-left rounded-2xl bg-card overflow-hidden border border-border/50 hover:border-primary/40 transition-smooth hover:shadow-elegant hover:-translate-y-0.5"
          >
            <div className="relative h-32 overflow-hidden">
              <img src={d.image} alt={d.disease} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
              <div className="absolute top-2 right-2 rounded-full bg-card/95 backdrop-blur px-2 py-0.5 text-[10px] font-bold">
                {Math.round(d.confidence * 100)}%
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{d.crop}</p>
              <p className="font-display font-bold text-sm mt-0.5">{d.disease}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{d.date}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-smooth">
                  Reopen <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
