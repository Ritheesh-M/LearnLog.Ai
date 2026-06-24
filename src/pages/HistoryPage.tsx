import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Entry } from "../types";
import EntryCard from "../components/EntryCard";
import AIThinking from "../components/AIThinking";
import {
  Compass,
  Search,
  Filter,
  Layers,
  Smile,
  Star,
  RefreshCw,
  Sparkles,
  Database,
  ExternalLink,
  ChevronRight,
  X,
  Tag,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchRunning, setSearchRunning] = useState<boolean>(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMood, setSelectedMood] = useState<string>("All");
  const [selectedQuality, setSelectedQuality] = useState<string>("All");

  // Single Entry Detailed Modal state (if linked with ?id=)
  const [detailedEntry, setDetailedEntry] = useState<Entry | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<Entry[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (initialId && entries.length > 0) {
      const match = entries.find((e) => e.id === initialId);
      if (match) {
        handleOpenDetailModal(match);
      }
    }
  }, [initialId, entries]);

  const fetchEntries = async (query = "") => {
    if (query) {
      setSearchRunning(true);
    } else {
      setLoading(true);
    }

    try {
      const url = query ? `/api/entries?q=${encodeURIComponent(query)}` : "/api/entries";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
      setSearchRunning(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries(searchQuery);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    fetchEntries();
  };

  const handleOpenDetailModal = async (entry: Entry) => {
    setDetailedEntry(entry);
    setModalLoading(true);
    setSearchParams({ id: entry.id });
    try {
      const res = await fetch(`/api/entries/${entry.id}`);
      if (res.ok) {
        const data = await res.json();
        setRelatedStars(data.related || []);
      }
    } catch (err) {
      console.error("Failed loading detailed star connections:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const setRelatedStars = (stars: Entry[]) => {
    setRelatedEntries(stars);
  };

  const handleCloseDetailModal = () => {
    setDetailedEntry(null);
    setRelatedEntries([]);
    setSearchParams({});
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        handleCloseDetailModal();
        fetchEntries(searchQuery);
      }
    } catch (err) {
      console.error("Failed dissolving star:", err);
    }
  };

  // Compute unique filter options from current database entries
  const categories = ["All", ...Array.from(new Set(entries.map((e) => e.category)))];
  const moods = ["All", ...Array.from(new Set(entries.map((e) => e.mood)))];

  // Filter Logic client side (in addition to semantic search)
  const filteredEntries = entries.filter((entry) => {
    const categoryMatch = selectedCategory === "All" || entry.category === selectedCategory;
    const moodMatch = selectedMood === "All" || entry.mood === selectedMood;
    const qualityMatch = selectedQuality === "All" || entry.quality === Number(selectedQuality);
    return categoryMatch && moodMatch && qualityMatch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 animate-fade-in relative">
      {/* Page Header */}
      <div>
        <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
          Ship Log Archive
        </span>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">
          📡 Chrono-Logs <span className="text-nebula-purple">& Ship Records</span>
        </h1>
        <p className="text-star-white/70 text-sm max-w-2xl mt-1 font-sans">
          Scan your entire learning archives semantically or apply exact sensory filters. Open individual logs to analyze the cognitive cores and relative connection nodes.
        </p>
      </div>

      {/* Wormhole Semantic Search Portal */}
      <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
        <div className="hud-glass rounded-3xl p-4 border border-nebula-cyan/30 flex flex-col md:flex-row items-center gap-3 bg-space-void/60 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative group focus-within:border-nebula-cyan/60 transition-all">
          <div className="flex items-center gap-3 w-full pl-2">
            <Search className="w-5 h-5 text-nebula-cyan group-focus-within:animate-pulse" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query semantically e.g., 'web security features' or 'how photosynthesis works'..."
              className="w-full bg-transparent border-none text-white placeholder-white/30 text-sm focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="p-1 rounded-lg hover:bg-white/5 text-star-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searchRunning}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-nebula-cyan hover:bg-white text-space-void text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            {searchRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            <span>{searchRunning ? "Scanning..." : "Scan Subspace"}</span>
          </button>
        </div>
        <div className="text-center mt-2 font-mono text-[9px] text-star-white/40 uppercase tracking-widest">
          Powered by Gemini 3.5 AI Semantic Search Core
        </div>
      </form>

      {/* Sensory Filter Console */}
      <div className="hud-glass rounded-2xl p-4 border border-white/5 bg-space-void/40 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2 text-star-white/50 text-xs font-mono uppercase">
          <Filter className="w-3.5 h-3.5 text-nebula-purple" />
          <span>Sensory Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto text-xs font-mono">
          {/* Category Filter */}
          <div className="flex items-center gap-2 border border-white/5 rounded-xl px-3 py-1.5 bg-space-void/80">
            <Layers className="w-3.5 h-3.5 text-nebula-blue" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-star-white/90 focus:outline-none cursor-pointer max-w-[120px]"
            >
              <option value="All" className="bg-space-void text-white">All Spheres</option>
              {categories.filter(c => c !== "All").map((c, idx) => (
                <option key={idx} value={c} className="bg-space-void text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mood Filter */}
          <div className="flex items-center gap-2 border border-white/5 rounded-xl px-3 py-1.5 bg-space-void/80">
            <Smile className="w-3.5 h-3.5 text-supernova-pink" />
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="bg-transparent border-none text-star-white/90 focus:outline-none cursor-pointer max-w-[120px]"
            >
              <option value="All" className="bg-space-void text-white">All Moods</option>
              {moods.filter(m => m !== "All").map((m, idx) => (
                <option key={idx} value={m} className="bg-space-void text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Depth Rating Filter */}
          <div className="flex items-center gap-2 border border-white/5 rounded-xl px-3 py-1.5 bg-space-void/80">
            <Star className="w-3.5 h-3.5 text-star-gold" />
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-transparent border-none text-star-white/90 focus:outline-none cursor-pointer max-w-[120px]"
            >
              <option value="All" className="bg-space-void text-white">All Ratings</option>
              {[1, 2, 3, 4, 5].map((stars) => (
                <option key={stars} value={stars} className="bg-space-void text-white">
                  {stars} Star{stars > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Entry cards display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AIThinking statusText="Scanning subspace database registries..." />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <div key={entry.id} onClick={() => handleOpenDetailModal(entry)} className="cursor-pointer">
              <EntryCard entry={entry} onDelete={handleDeleteEntry} />
            </div>
          ))}
        </div>
      ) : (
        <div className="hud-glass border-dashed border-white/10 rounded-2xl p-16 text-center text-star-white/40 max-w-lg mx-auto bg-space-void/20">
          <Sparkles className="w-10 h-10 text-white/15 mx-auto mb-3 animate-pulse" />
          <h4 className="font-display font-medium text-white mb-1.5 uppercase">No coordinates resolved</h4>
          <p className="text-xs text-star-white/55 font-sans leading-relaxed">
            Your telemetry scan returned zero aligned star systems. Reset your search query or sensory filters to recalibrate the archive coordinates.
          </p>
        </div>
      )}

      {/* DETAILED LOG OVERLAY MODAL */}
      <AnimatePresence>
        {detailedEntry && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetailModal}
              className="fixed inset-0 bg-space-void/90 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="hud-glass-glowing rounded-3xl p-6 md:p-8 border border-nebula-purple/40 bg-space-void/95 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10"
            >
              {/* Corner radar sweep decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-nebula-purple/5 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleCloseDetailModal}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-star-white/60 hover:text-white transition-all border border-white/5 cursor-pointer"
                title="De-orbit log"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                {/* Header: Category & Mood */}
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none leading-none animate-float">
                    {detailedEntry.mood}
                  </span>
                  <span className="font-mono text-xs bg-nebula-purple/20 border border-nebula-purple/40 text-white px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                    {detailedEntry.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display font-extrabold text-xl md:text-2xl text-white leading-tight">
                  {detailedEntry.title}
                </h2>

                {/* Subtitle meta */}
                <div className="flex items-center gap-4 text-xs font-mono text-star-white/40 pb-4 border-b border-white/10">
                  <span>LOG INDEX: <span className="text-white font-medium">#{detailedEntry.id}</span></span>
                  <span>FILED: <span className="text-white font-medium">{new Date(detailedEntry.createdAt).toLocaleDateString()}</span></span>
                  {detailedEntry.coords && (
                    <span className="text-nebula-cyan">
                      COORD: [{Math.round(detailedEntry.coords.x)}, {Math.round(detailedEntry.coords.y)}]
                    </span>
                  )}
                </div>

                {/* AI Summary */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-xs italic leading-relaxed text-star-white/80">
                  <span className="font-mono font-bold uppercase block text-[9px] text-nebula-cyan not-italic mb-1 tracking-wider">
                    AI Summary Capsule:
                  </span>
                  "{detailedEntry.summary}"
                </div>

                {/* Content log body */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-star-white/40 uppercase tracking-wider block">
                    Written breakthrough logs:
                  </span>
                  <p className="text-sm text-star-white/95 leading-relaxed font-sans whitespace-pre-wrap bg-space-void/60 border border-white/5 p-4 rounded-xl border-dashed">
                    {detailedEntry.content}
                  </p>
                </div>

                {/* Tag chips */}
                {detailedEntry.tags && detailedEntry.tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-star-white/40 uppercase block">
                      Concept Indexing tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailedEntry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-star-white/70"
                        >
                          <Tag className="w-3 h-3 text-nebula-cyan" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Depth rating indicators */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-[10px] text-star-white/40 uppercase font-semibold">
                    Calculated Star Depth:
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < detailedEntry.quality ? "fill-star-gold text-star-gold" : "text-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Related stars section */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="font-mono text-[10px] text-nebula-cyan uppercase tracking-wider font-bold">
                    Connected Coordinate Paths
                  </div>
                  {modalLoading ? (
                    <div className="py-2 text-center text-xs text-star-white/40 font-mono animate-pulse">
                      Aligning connected star system beacons...
                    </div>
                  ) : relatedEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {relatedEntries.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => handleOpenDetailModal(rel)}
                          className="text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-nebula-purple/40 hover:bg-white/10 flex items-center justify-between text-xs text-star-white transition-all duration-200 cursor-pointer truncate"
                        >
                          <span className="truncate pr-2 font-semibold">
                            {rel.mood} {rel.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-star-white/40 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-star-white/40 font-sans italic">
                      No adjacent semantic paths charted. Log more stars to establish connections.
                    </p>
                  )}
                </div>

                {/* Action Row */}
                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs font-mono">
                  <button
                    onClick={() => handleDeleteEntry(detailedEntry.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/35 text-red-300 transition-all cursor-pointer font-semibold uppercase tracking-wider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dissolve Star</span>
                  </button>
                  <span className="text-star-white/30 uppercase">Secure Telemetry File</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
