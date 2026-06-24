import { useState, useEffect } from "react";
import { Entry } from "../types";
import ConstellationMap from "../components/ConstellationMap";
import AIThinking from "../components/AIThinking";
import {
  Compass,
  Calendar,
  Star,
  Tag,
  Trash2,
  X,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GalaxyPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStar, setSelectedStar] = useState<Entry | null>(null);
  const [relatedStars, setRelatedStars] = useState<Entry[]>([]);
  const [drawerLoading, setDrawerLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Orbit retrieval collision:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStar = async (star: Entry) => {
    setSelectedStar(star);
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/entries/${star.id}`);
      if (res.ok) {
        const data = await res.json();
        setRelatedStars(data.related || []);
      }
    } catch (err) {
      console.error("Failed to fetch related star telemetry:", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDeleteStar = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedStar(null);
        setRelatedStars([]);
        fetchEntries();
      }
    } catch (err) {
      console.error("Failed to dissolve star:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AIThinking statusText="Scanning deep-space quadrant constellations..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6 animate-fade-in relative">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
            Astronomical Knowledge Vault
          </span>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            🌌 Your Semantic <span className="text-nebula-purple">Knowledge Galaxy</span>
          </h1>
          <p className="text-star-white/70 text-sm max-w-2xl mt-1 font-sans">
            Similar learning topics are mapped closer together. Click on any star to load its database logs and explore related nodes in your knowledge network.
          </p>
        </div>
      </div>

      {/* Main Grid: Star Map and Detailed Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAP PANEL: Left Column */}
        <div className="lg:col-span-8 space-y-4">
          <ConstellationMap entries={entries} onSelectStar={handleSelectStar} />

          {/* Color-coded Legend */}
          <div className="hud-glass rounded-2xl p-4 border border-white/5 bg-space-void/60 flex flex-wrap gap-4 items-center justify-between text-xs font-mono text-star-white/60">
            <div className="font-bold uppercase tracking-wider text-star-white/40">Galaxy Clusters:</div>
            <div className="flex flex-wrap gap-3.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nebula-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span>Tech & Engineering</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nebula-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <span>Science & Medicine</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-supernova-pink shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                <span>Language & Writing</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-star-gold shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span>Business & Finance</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nebula-purple shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                <span>Philosophical Arts</span>
              </span>
            </div>
          </div>
        </div>

        {/* DETAILS DRAWER: Right Column */}
        <div className="lg:col-span-4 h-full">
          <AnimatePresence mode="wait">
            {selectedStar ? (
              <motion.div
                key={selectedStar.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hud-glass rounded-3xl p-6 border border-nebula-purple/30 bg-space-void/90 flex flex-col justify-between h-full min-h-[50vh] max-h-[65vh] overflow-y-auto shadow-2xl relative"
              >
                {/* Drawer Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl select-none leading-none animate-bounce">
                        {selectedStar.mood}
                      </span>
                      <span className="font-mono text-[10px] bg-nebula-purple/20 text-white border border-nebula-purple/40 px-2.5 py-0.5 rounded-full tracking-wider uppercase font-semibold">
                        {selectedStar.category}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedStar(null)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-star-white hover:text-white border border-white/5 cursor-pointer"
                      title="Close Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-white mb-2 leading-snug">
                    {selectedStar.title}
                  </h3>

                  {/* Subtitle meta */}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-star-white/40 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-nebula-blue" />
                      <span>{new Date(selectedStar.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedStar.coords && (
                      <div className="flex items-center gap-1 text-nebula-cyan">
                        <Compass className="w-3.5 h-3.5" />
                        <span>
                          [{Math.round(selectedStar.coords.x)}, {Math.round(selectedStar.coords.y)}]
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Smart Summary */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 mb-4 italic text-xs leading-relaxed text-star-white/80">
                    "{selectedStar.summary}"
                  </div>

                  {/* Full Written Content Log */}
                  <div className="space-y-2 mb-6">
                    <div className="font-mono text-[9px] text-star-white/40 uppercase tracking-wider">
                      Core Content Log:
                    </div>
                    <p className="text-xs text-star-white/95 leading-relaxed font-sans max-h-36 overflow-y-auto whitespace-pre-wrap pr-1 bg-space-void/50 p-3 rounded-xl border border-white/5 border-dashed">
                      {selectedStar.content}
                    </p>
                  </div>

                  {/* Overlapping tag chips */}
                  {selectedStar.tags && selectedStar.tags.length > 0 && (
                    <div className="mb-6 space-y-1.5">
                      <div className="font-mono text-[9px] text-star-white/40 uppercase">
                        Mapped Tags:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStar.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] text-star-white/60"
                          >
                            <Tag className="w-2.5 h-2.5 text-nebula-cyan" />
                            <span>#{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality stars */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mb-6">
                    <span className="font-mono text-[9px] text-star-white/40 uppercase">Depth rating:</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < selectedStar.quality ? "fill-star-gold text-star-gold" : "text-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Related Stars section */}
                <div className="space-y-4">
                  <div className="border-t border-white/10 pt-4">
                    <div className="font-mono text-[10px] text-nebula-cyan uppercase tracking-wider mb-2 font-bold">
                      Semantic Connection Beacons
                    </div>

                    {drawerLoading ? (
                      <div className="py-4 text-center font-mono text-[10px] text-star-white/40 animate-pulse">
                        Searching parallel star alignments...
                      </div>
                    ) : relatedStars.length > 0 ? (
                      <div className="space-y-2">
                        {relatedStars.map((rel) => (
                          <button
                            key={rel.id}
                            onClick={() => handleSelectStar(rel)}
                            className="w-full text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-nebula-purple/40 hover:bg-white/10 flex items-center justify-between text-xs text-star-white transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="select-none text-sm">{rel.mood}</span>
                              <span className="font-semibold truncate">{rel.title}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-star-white/40" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="font-sans text-[11px] text-star-white/40 italic py-2">
                        No adjacent semantic neighbors mapped yet. Build more stars to find connection paths.
                      </div>
                    )}
                  </div>

                  {/* Dissolve star action */}
                  <div className="border-t border-white/10 pt-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to dissolve this star? This action cannot be undone.")) {
                          handleDeleteStar(selectedStar.id);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/35 text-red-300 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Dissolve Star</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="hud-glass rounded-3xl p-6 border border-white/5 bg-space-void/40 h-full min-h-[50vh] flex flex-col items-center justify-center text-center text-star-white/30 space-y-3">
                <BookOpen className="w-10 h-10 text-white/10 animate-float" />
                <div>
                  <h4 className="font-display font-medium text-white/60 mb-1">
                    EXAMINE COGNITIVE CORES
                  </h4>
                  <p className="text-xs text-star-white/40 max-w-[240px] leading-relaxed font-sans mx-auto">
                    Click on any glowing point on your constellation chart to download its ship log files and trace its semantic networks.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
