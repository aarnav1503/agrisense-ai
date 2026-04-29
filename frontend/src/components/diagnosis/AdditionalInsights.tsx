import { Lightbulb, Camera, Sparkles, AlertCircle, Globe, ExternalLink } from "lucide-react";
import type { Diagnosis } from "@/lib/demo-data";

export function AdditionalInsights({ d }: { d: Diagnosis }) {
  const lowConfidence = d.confidence < 0.7;
  return (
    <section className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border/50">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-lime">
          <Lightbulb className="h-4 w-4 text-foreground" />
        </span>
        <h2 className="font-display text-xl font-bold">Additional Insights</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Real-time Web Trends */}
        {d.webInsights && d.webInsights.trends.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-sky/10 to-transparent p-5 border border-sky/30 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-sky" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Real-time Web Trends & Research
              </p>
            </div>
            <ul className="space-y-2">
              {d.webInsights.trends.map((t, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-sky font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              {d.webInsights.sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] flex items-center gap-1 text-sky hover:underline bg-sky/5 px-2 py-1 rounded-md"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {s.title.slice(0, 30)}...
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent p-5 border border-primary/15">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Possibly related diseases
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.related.length > 0 ? d.related.map((r) => (
              <span
                key={r}
                className="inline-flex rounded-full bg-card px-3 py-1.5 text-xs font-medium border border-border shadow-soft"
              >
                {r}
              </span>
            )) : <span className="text-xs text-muted-foreground">No related diseases found.</span>}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-teal/10 to-transparent p-5 border border-teal/30 flex items-start gap-3">
          <Camera className="h-5 w-5 text-teal mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Tip for sharper results</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a clearer close-up of the leaf in natural daylight, focusing on the affected area.
            </p>
          </div>
        </div>

        {lowConfidence ? (
          <div className="rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent p-5 border border-destructive/20 flex items-start gap-3 md:col-span-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Confidence is low</p>
              <p className="text-sm text-muted-foreground mt-1">
                We recommend uploading another image and adding more symptom details before acting on this diagnosis.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-success/10 to-transparent p-5 border border-success/30 flex items-start gap-3 md:col-span-2">
            <Sparkles className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">AI Note</p>
              <p className="text-sm text-muted-foreground mt-1">
                Both image and text branches converge on the same diagnosis — this is a high-trust prediction. Proceed with the recommended treatment plan and re-scan in 7 days.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
