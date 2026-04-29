import { motion } from "framer-motion";
import { Camera, FileText, Layers, BookOpen, Pill, Eye } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Image-based Diagnosis",
    desc: "Deep vision model identifies disease patterns from a single leaf image.",
    gradient: "bg-gradient-primary",
  },
  {
    icon: FileText,
    title: "Symptom-based Analysis",
    desc: "NLP understands free-text symptoms and matches them to known diseases.",
    gradient: "bg-gradient-teal",
  },
  {
    icon: Layers,
    title: "Hybrid AI Fusion",
    desc: "Combines image and text predictions with weighted confidence fusion.",
    gradient: "bg-gradient-sky",
  },
  {
    icon: BookOpen,
    title: "Retrieved Knowledge",
    desc: "Retrieval-augmented agronomy database surfaces evidence-backed insights.",
    gradient: "bg-gradient-lime",
  },
  {
    icon: Pill,
    title: "Treatment Suggestions",
    desc: "Actionable, crop-specific treatment and prevention plans.",
    gradient: "bg-gradient-warm",
  },
  {
    icon: Eye,
    title: "Explainable Results",
    desc: "Transparent breakdown of every model's contribution to the decision.",
    gradient: "bg-gradient-primary",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built for{" "}
            <span className="text-gradient-fresh">smarter farming</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete AI pipeline — from photo to prescription — designed for clarity, accuracy, and trust.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-3xl bg-card p-6 shadow-card border border-border/50 hover:border-primary/30 transition-smooth hover:-translate-y-1"
            >
              <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl ${f.gradient} shadow-soft transition-bounce group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-hero opacity-0 group-hover:opacity-100 transition-smooth" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
