import { motion } from "framer-motion";
import { Eye, Camera, FileText, Layers, CheckCircle2, BookOpen } from "lucide-react";
import type { Diagnosis, Prediction } from "@/lib/demo-data";

function PredList({ items, gradient }: { items: Prediction[]; gradient: string }) {
  return (
    <div className="space-y-2.5">
      {items.map((p, i) => (
        <div key={p.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className={i === 0 ? "font-semibold" : "text-muted-foreground"}>{p.label}</span>
            <span className="font-mono">{(p.score * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${p.score * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className={`h-full ${i === 0 ? gradient : "bg-muted-foreground/30"} rounded-full`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ icon: Icon, title, gradient, children }: { icon: typeof Eye; title: string; gradient: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-5 border border-border/50 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${gradient}`}>
          <Icon className="h-4 w-4 text-primary-foreground" />
        </span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ExplainableAI({ d }: { d: Diagnosis }) {
  return (
    <section className="rounded-3xl bg-gradient-hero/40 p-6 sm:p-8 border border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Eye className="h-4 w-4 text-primary-foreground" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">Explainable AI</h2>
          <p className="text-xs text-muted-foreground">Transparent breakdown of every reasoning step</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {d.imagePredictions.length > 0 && (
          <Card icon={Camera} title="Image Model" gradient="bg-gradient-primary">
            <PredList items={d.imagePredictions} gradient="bg-gradient-primary" />
          </Card>
        )}
        {d.textPredictions.length > 0 && (
          <Card icon={FileText} title="Text Model" gradient="bg-gradient-teal">
            <PredList items={d.textPredictions} gradient="bg-gradient-teal" />
          </Card>
        )}
        <Card icon={Layers} title="Hybrid Fusion" gradient="bg-gradient-sky">
          <PredList items={d.hybridPredictions} gradient="bg-gradient-sky" />
        </Card>
        <Card icon={CheckCircle2} title="Final Diagnosis" gradient="bg-gradient-lime">
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">Decision</p>
            <p className="font-display text-lg font-bold mt-1">{d.disease}</p>
            <p className="mt-2 inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
              {Math.round(d.confidence * 100)}% confidence
            </p>
          </div>
        </Card>
        <Card icon={BookOpen} title="Knowledge Linked" gradient="bg-gradient-warm">
          <p className="text-xs text-muted-foreground">Sources retrieved</p>
          <p className="font-display text-2xl font-bold mt-1">{d.evidence.length}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {d.evidence.flatMap((e) => e.tags).slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] rounded-full bg-muted px-2 py-0.5 font-medium">
                {t}
              </span>
            ))}
          </div>
        </Card>
        {d.imagePredictions.length > 0 && d.textPredictions.length > 0 && (
          <Card icon={Layers} title="Fusion Weights" gradient="bg-gradient-primary">
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Image</span><span className="font-mono">{Math.round(d.fusionWeights.image * 100)}%</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${d.fusionWeights.image * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Text</span><span className="font-mono">{Math.round(d.fusionWeights.text * 100)}%</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-teal rounded-full" style={{ width: `${d.fusionWeights.text * 100}%` }} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
