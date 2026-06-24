import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, Tag, Compass, FileText, Send, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIPreview {
  category: string;
  tags: string[];
  mood: string;
  summary: string;
  quality: number;
}

export default function EntryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  
  const [preview, setPreview] = useState<AIPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced live preview sync
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (title.trim().length < 4 || content.trim().length < 15) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/entries/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreview(data);
        }
      } catch (err) {
        console.error("Live preview calibration drift:", err);
      } finally {
        setPreviewLoading(false);
      }
    }, 1200); // 1.2s debounce delay

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, content]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please specify both a star breakthrough title and explain your learning log in detail.");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to register log in Ground Control.");
      }

      // Smooth transition to Galaxy Constellation view!
      navigate("/galaxy");
    } catch (err: any) {
      setError(err.message || "An orbital collision occurred. Please try launching again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
          Ground Control Star Creator
        </span>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">
          ✨ Ignite a <span className="text-nebula-purple">New Learning Star</span>
        </h1>
        <p className="text-star-white/70 text-sm max-w-2xl mt-1 font-sans">
          Write down what you have learned today. Our server-side Gemini 3.5 AI engine will parse your writing to compute its coordinates, extract concepts, evaluate quality, and anchor it in your galaxy constellation.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/35 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mission Interrupted:</span> {error}
          </div>
        </div>
      )}

      {/* Grid: Editor Left, AI Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input Form */}
        <form onSubmit={handleLaunch} className="lg:col-span-7 space-y-6">
          <div className="hud-glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-5 bg-space-void/60 backdrop-blur-md relative">
            {/* Input title */}
            <div className="space-y-2">
              <label className="font-display font-semibold text-xs tracking-wider uppercase text-star-white/70 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-nebula-cyan" />
                <span>Star Breakthrough Title</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Understanding React useEffect dependency arrays"
                className="w-full bg-space-void/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-nebula-purple focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all font-sans"
              />
            </div>

            {/* Content editor */}
            <div className="space-y-2">
              <label className="font-display font-semibold text-xs tracking-wider uppercase text-star-white/70 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-nebula-blue" />
                <span> Breakthrough Deep Logs (Explain the concepts)</span>
              </label>
              <textarea
                required
                rows={11}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you learn? Explain the logic, facts, code examples, or rules. The more detailed you write, the higher score and precision Gemini will award your star coordinates!"
                className="w-full bg-space-void/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-nebula-purple focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all leading-relaxed font-sans"
              />
            </div>

            {/* Submit Launcher Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitLoading || title.trim().length === 0 || content.trim().length === 0}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 ${
                  submitLoading || title.trim().length === 0 || content.trim().length === 0
                    ? "bg-white/5 border border-white/10 text-star-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-nebula-purple to-nebula-blue hover:from-nebula-blue hover:to-nebula-cyan text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-101 cursor-pointer"
                }`}
              >
                {submitLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-nebula-cyan" />
                    <span>Analyzing & Grounding Star Constellation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-nebula-cyan" />
                    <span>Launch Star Into Galaxy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: Debounced Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-glass rounded-3xl p-6 border border-nebula-purple/35 bg-space-void/90 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Grid details overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff01_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

            <div>
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nebula-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-nebula-cyan"></span>
                  </span>
                  <span className="font-mono text-[10px] text-nebula-cyan tracking-widest uppercase font-semibold">
                    Telemetry AI Preview
                  </span>
                </div>
                {previewLoading && (
                  <div className="flex items-center gap-1.5 text-star-white/40 font-mono text-[10px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-nebula-cyan" />
                    <span>Recalibrating...</span>
                  </div>
                )}
              </div>

              {/* Display Logic */}
              {preview ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Category & Mood */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[9px] text-star-white/40 uppercase mb-1">
                        AI Categorization:
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-nebula-purple/20 text-white border border-nebula-purple/40 shadow-inner">
                        {preview.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-[9px] text-star-white/40 uppercase mb-1">
                        Mood Signature:
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xl select-none">{preview.mood}</span>
                        <span className="font-mono text-[9px] text-star-white/60">Detected</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <div className="font-mono text-[9px] text-star-white/40 uppercase">
                      Automated Summary:
                    </div>
                    <p className="text-sm text-star-white/90 leading-relaxed font-sans bg-white/5 p-3.5 rounded-xl border border-white/5 italic">
                      "{preview.summary}"
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <div className="font-mono text-[9px] text-star-white/40 uppercase">
                      Concept Keywords:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-star-white/80 font-mono"
                        >
                          <Tag className="w-3 h-3 text-nebula-cyan" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quality rating */}
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-star-white/40 uppercase block mb-1">
                        Calculated Depth Rating:
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${
                              idx < preview.quality ? "fill-star-gold text-star-gold" : "text-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {preview.coords && (
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-star-white/40 uppercase block mb-1">
                          Galaxy Coordinates:
                        </span>
                        <span className="font-mono text-xs text-nebula-cyan font-semibold">
                          X: {Math.round(preview.coords.x)} • Y: {Math.round(preview.coords.y)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-star-white/40 space-y-4">
                  {previewLoading ? (
                    <div className="space-y-3">
                      <div className="w-8 h-8 rounded-full border-4 border-t-nebula-purple border-white/10 animate-spin mx-auto" />
                      <p className="font-mono text-xs text-nebula-purple animate-pulse">
                        Synchronizing with central quantum AI...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-10 h-10 text-white/15 animate-pulse" />
                      <div>
                        <h4 className="font-display font-medium text-white/70 mb-1">
                          Awaiting Star Ignition...
                        </h4>
                        <p className="text-xs text-star-white/40 max-w-xs leading-relaxed font-sans">
                          Type a title and at least 15 characters of breakthroughs in the left editor console. Gemini will automatically ignite this live preview window with deep cognitive analytics.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Commander Advice */}
            <div className="border-t border-white/10 pt-4 text-[10px] font-mono text-star-white/40 leading-relaxed bg-space-void/40 p-3 rounded-xl border border-white/5 mt-6">
              <span className="text-nebula-cyan font-bold block uppercase mb-1">
                AI Flight Instructions:
              </span>
              Write with rich conceptual vocabulary (e.g. including code examples, rules, logic, comparisons) to achieve higher star quality ratings and accurate celestial positioning!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
