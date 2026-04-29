import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { DiagnosisInput } from "./DiagnosisInput";
import { DiagnosisResults } from "./DiagnosisResults";
import { KnowledgeSection } from "./KnowledgeSection";
import { AdditionalInsights } from "./AdditionalInsights";
import { ExplainableAI } from "./ExplainableAI";
import { KnowledgeSources } from "./KnowledgeSources";
import { HistorySection } from "./HistorySection";
import { demoDiagnoses, demoList, type Diagnosis } from "@/lib/demo-data";
import { toast } from "sonner";

const demoButtons = [
  { id: "corn-rust", label: "Corn Rust" },
  { id: "tomato-curl", label: "Tomato Curl Virus" },
  { id: "potato-blight", label: "Potato Late Blight" },
];

export function DiagnosisWorkspace() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);

  const pickDemo = (id: string) => {
    const d = demoDiagnoses[id];
    if (!d) return;
    setImagePreview(d.image);
    setSymptoms(d.symptomsInput);
    setResult(null);
  };

  const analyze = async () => {
    console.log("Analyze button clicked", { symptoms, imagePresent: !!imagePreview });
    if (!symptoms && !imagePreview) {
      toast.error("Please provide symptoms or an image");
      return;
    }

    setLoading(true);
    const uniqueId = () => Math.random().toString(36).substring(2, 9);
    
    try {
      const formData = new FormData();
      if (symptoms) formData.append("symptoms", symptoms);
      
      if (imagePreview && imagePreview.startsWith("data:image")) {
        try {
          const res = await fetch(imagePreview);
          const blob = await res.blob();
          formData.append("file", blob, "image.png");
        } catch (e) {
          console.error("Image processing error", e);
        }
      }

      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      console.log("Connecting to API at:", API_BASE);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); 

      try {
        const response = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Backend unavailable");

        const data = await response.json();
        console.log("API Success", data);
        
        const diagnosis: Diagnosis = {
          id: uniqueId(),
          image: imagePreview || "",
          crop: data.prediction.crop,
          disease: data.prediction.disease,
          confidence: data.prediction.confidence,
          confidenceLevel: data.prediction.confidence > 0.8 ? "High" : data.prediction.confidence > 0.5 ? "Moderate" : "Low",
          imagePredictions: (data.image_top_3 || []).map((t: any) => ({ label: `${t.crop} — ${t.disease}`, score: t.confidence })),
          textPredictions: (data.text_top_3 || []).map((t: any) => ({ label: `${t.crop} — ${t.disease}`, score: t.confidence })),
          hybridPredictions: data.top_3.map((t: any) => ({ label: `${t.crop} — ${t.disease}`, score: t.confidence })),
          branchAgreement: data.fusion.has_image && data.fusion.has_text ? "agree" : "partial",
          imageBranch: data.fusion.has_image ? `${data.image_top_3[0].crop} — ${data.image_top_3[0].disease}` : "Not analyzed",
          textBranch: data.fusion.has_text ? `${data.text_top_3[0].crop} — ${data.text_top_3[0].disease}` : "Not analyzed",
          detectedCropFromText: data.prediction.crop,
          keywordCount: 0,
          fusionWeights: { image: data.fusion.image_weight, text: data.fusion.text_weight },
          knowledge: {
            symptoms: data.knowledge?.Symptoms || [],
            cause: data.knowledge?.Cause || "No cause information available.",
            treatment: data.knowledge?.Treatment || [],
            prevention: data.knowledge?.Prevention || [],
            severity: data.knowledge?.Severity || "Moderate",
            consultExpertWhen: data.knowledge?.["Consult expert when"] || "If symptoms persist.",
          },
          related: [],
          evidence: (data.knowledge?.Evidence || []).map((e: any) => ({
            source: e.source,
            tags: [],
            snippet: e.snippet
          })),
          webInsights: data.web_insights,
          date: new Date().toISOString().split("T")[0],
          symptomsInput: symptoms,
        };

        setResult(diagnosis);
        toast.success("AI Analysis complete!");
      } catch (apiError) {
        console.warn("Backend API failed or timed out. Falling back to demo data.", apiError);
        
        const t = symptoms.toLowerCase();
        let pick: Diagnosis = demoDiagnoses["corn-rust"];
        if (t.includes("tomato") || t.includes("curl")) pick = demoDiagnoses["tomato-curl"];
        else if (t.includes("potato") || t.includes("blight")) pick = demoDiagnoses["potato-blight"];
        
        const fallbackResult = { 
          ...pick, 
          id: uniqueId(), 
          date: new Date().toISOString().split("T")[0], 
          symptomsInput: symptoms 
        };
        
        setResult(fallbackResult);
        toast.info("Showing simulated result (Backend is starting up...)");
      }
    } catch (error: any) {
      console.error("General analysis error", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setSymptoms("");
    setResult(null);
  };

  const openHistory = (id: string) => {
    const d = demoDiagnoses[id];
    setImagePreview(d.image);
    setSymptoms(d.symptomsInput);
    setResult(d);
    document.getElementById("diagnosis")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="diagnosis" className="relative py-20 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-hero opacity-50 -z-10" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            Diagnosis Workspace
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
            Diagnose your crop in{" "}
            <span className="text-gradient-fresh">seconds</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Upload, type, or both — our hybrid AI handles every combination automatically.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted-foreground self-center mr-1">Try a demo:</span>
            {demoButtons.map((b) => (
              <button
                key={b.id}
                onClick={() => pickDemo(b.id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/60 px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:shadow-soft transition-smooth"
              >
                <Sparkles className="h-3 w-3 text-primary" /> {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <DiagnosisInput
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              onAnalyze={analyze}
              onReset={reset}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <DiagnosisResults d={result} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl bg-gradient-hero/40 border-2 border-dashed border-border h-full min-h-[500px] grid place-items-center p-8 text-center"
                >
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                      <Sparkles className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold">Your diagnosis appears here</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                      Upload an image, describe symptoms, or try a demo — then hit Analyze.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Result-dependent sections */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 space-y-8"
            >
              <KnowledgeSection d={result} />
              <AdditionalInsights d={result} />
              <ExplainableAI d={result} />
              <KnowledgeSources d={result} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <HistorySection items={demoList} onOpen={openHistory} />
        </div>
      </div>
    </section>
  );
}
