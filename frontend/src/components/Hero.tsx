import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain, Database, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-crops.jpg";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-hero">
      {/* Animated blobs background disabled for performance */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-70" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-foreground/80 shadow-soft"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Hybrid AI · Image + Text fusion
            </motion.div>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              AI Crop Disease{" "}
              <span className="text-gradient-rainbow">Detection</span>{" "}
              &amp; Advisory System
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Upload crop images, describe symptoms, and get hybrid AI-based
              diagnosis with retrieval-augmented treatment guidance.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <a href="#diagnosis">
                  Try Diagnosis <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Explore Features</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {[
                { icon: Brain, label: "Image + Text Hybrid AI", color: "bg-gradient-primary" },
                { icon: Database, label: "Knowledge Retrieval", color: "bg-gradient-teal" },
                { icon: Stethoscope, label: "Treatment Guidance", color: "bg-gradient-pink" },
              ].map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -3, scale: 1.04 }}
                  className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-3 py-1.5 shadow-soft border border-border/50 cursor-default"
                >
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${b.color} shadow-soft`}>
                    <b.icon className="h-3.5 w-3.5 text-primary-foreground" />
                  </span>
                  <span className="text-xs font-medium">{b.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ rotateY: -6, rotateX: 4, y: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
              className="relative rounded-[2rem] overflow-hidden shadow-elegant border border-white/60"
            >
              <img
                src={heroImg}
                alt="Healthy crop leaves"
                width={1280}
                height={1024}
                className="w-full h-[420px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/30" />

              {/* Floating diagnosis card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-6 left-6 rounded-2xl bg-card/95 backdrop-blur-md p-4 shadow-elegant border border-white/60 max-w-[240px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-semibold text-success">Diagnosis Complete</span>
                </div>
                <p className="text-sm font-bold">Corn — Common Rust</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.2, delay: 0.8 }}
                      className="h-full bg-gradient-rainbow"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-6 right-6 rounded-2xl bg-card/95 backdrop-blur-md p-4 shadow-elegant border border-white/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-pink shadow-glow-pink">
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hybrid AI</p>
                    <p className="text-sm font-bold">3 models fused</p>
                  </div>
                </div>
              </motion.div>

              {/* Sparkle accent */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-8 grid h-12 w-12 place-items-center rounded-full bg-gradient-warm shadow-glow"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
