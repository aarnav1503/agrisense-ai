import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, RefreshCw, Image as ImageIcon, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  imagePreview: string | null;
  setImagePreview: (s: string | null) => void;
  symptoms: string;
  setSymptoms: (s: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  loading: boolean;
}

export function DiagnosisInput({
  imagePreview,
  setImagePreview,
  symptoms,
  setSymptoms,
  onAnalyze,
  onReset,
  loading,
}: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [setImagePreview],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  return (
    <div className="space-y-5">
      {/* Upload card */}
      <div className="rounded-3xl bg-card p-6 shadow-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Crop Image
            </h3>
            <p className="text-xs text-muted-foreground">Drop a clear close-up leaf photo</p>
          </div>
          {imagePreview && (
            <span className="text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
              Loaded
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!imagePreview ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed transition-smooth p-10 text-center ${
                drag
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="mt-4 font-semibold text-sm">Drop image here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img
                src={imagePreview}
                alt="Uploaded crop"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => inputRef.current?.click()}
                  className="bg-card/95"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Replace
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => setImagePreview(null)}
                  className="bg-card/95"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Symptoms card */}
      <div className="rounded-3xl bg-card p-6 shadow-card border border-border/50">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal" />
          Describe Symptoms
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Optional — but improves accuracy</p>
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. corn leaves have orange rust spots and powdery patches"
          className="mt-4 min-h-[120px] rounded-2xl border-border bg-muted/30 resize-none focus-visible:ring-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{symptoms.length} characters</span>
          <span>{symptoms.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          onClick={onAnalyze}
          disabled={loading || (!imagePreview && !symptoms.trim())}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Analyze
            </>
          )}
        </Button>
        <Button variant="outline" size="lg" onClick={onReset} disabled={loading}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
