import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { DiagnosisWorkspace } from "@/components/diagnosis/DiagnosisWorkspace";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DiagnosisWorkspace />
        <section id="about" className="py-20 sm:py-28 bg-gradient-hero/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              About
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold">
              On a mission to make every farm{" "}
              <span className="text-gradient-fresh">disease-resilient</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              AgriSense AI fuses computer vision, natural language understanding, and a curated agronomy
              knowledge base into one effortless tool. Built with farmers, agronomists, and researchers,
              we make expert-level crop diagnosis accessible from any phone, in any field.
            </p>
            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {[
                { v: "94%", l: "Hybrid accuracy" },
                { v: "32+", l: "Diseases covered" },
                { v: "<2s", l: "Avg diagnosis time" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-card p-6 shadow-card border border-border/50">
                  <p className="font-display text-3xl font-bold text-gradient-fresh">{s.v}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
