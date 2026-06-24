import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Stats, Briefing, Recommendation, KnowledgeGap, Entry } from "../types";
import MissionBriefing from "../components/MissionBriefing";
import KnowledgeGaps from "../components/KnowledgeGaps";
import LearnNext from "../components/LearnNext";
import EntryCard from "../components/EntryCard";
import AIThinking from "../components/AIThinking";
import {
  Sparkles,
  Trophy,
  History,
  Compass,
  Zap,
  TrendingUp,
  FileCode,
  Orbit,
} from "lucide-react";
import { motion } from "motion/react";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingBriefing, setSyncingBriefing] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Run parallel fetch operations to keep loading extremely fast
      const [statsRes, briefingRes, gapsRecsRes, entriesRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/insights/briefing"),
        fetch("/api/insights/gaps-and-recommend"),
        fetch("/api/entries"),
      ]);

      const statsData = await statsRes.json();
      const briefingData = await briefingRes.json();
      const gapsRecsData = await gapsRecsRes.json();
      const entriesData = await entriesRes.json();

      setStats(statsData);
      setBriefing(briefingData);
      setGaps(gapsRecsData.gaps || []);
      setRecs(gapsRecsData.recommendations || []);
      setRecentEntries(entriesData.slice(0, 3)); // show top 3 recent
    } catch (err) {
      console.error("Error loading cockpit dashboards:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncBriefing = async () => {
    setSyncingBriefing(true);
    try {
      const res = await fetch("/api/insights/briefing");
      const data = await res.json();
      setBriefing(data);
    } catch (err) {
      console.error("Briefing synchronization drift:", err);
    } finally {
      setSyncingBriefing(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Reload dashboard
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to dissolve star:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AIThinking statusText="Calibrating spaceship telemetry indexes..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 animate-fade-in">
      {/* HUD Welcomer Banner */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
            Active Exploration Sector
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
            🛸 Welcome to your <span className="text-nebula-purple">Mission Control</span>
          </h1>
          <p className="text-star-white/70 text-sm max-w-2xl mt-1.5 leading-relaxed font-sans">
            Every learning breakthrough is registered as a celestial beacon. Gemini AI analyzes your log entries, connects concepts, and maps your semantic star galaxy.
          </p>
        </div>

        <Link
          to="/create"
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-nebula-purple to-nebula-blue hover:from-nebula-blue hover:to-nebula-cyan text-white text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer select-none hover:scale-102 shrink-0"
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>Launch Star Creator</span>
        </Link>
      </section>

      {/* Metrics Row */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Entries */}
          <div className="hud-glass rounded-2xl p-4 md:p-5 border border-white/5 relative group hover:border-nebula-cyan/35 transition-all">
            <div className="flex items-center justify-between mb-3 text-star-white/40">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Stellar Beacons</span>
              <Orbit className="w-4.5 h-4.5 text-nebula-cyan" />
            </div>
            <div className="font-display font-extrabold text-2xl md:text-3xl text-white">
              {stats.totalEntries}
            </div>
            <p className="text-[10px] text-star-white/50 mt-1 font-sans">Total mapping star files registered</p>
          </div>

          {/* Current Streak */}
          <div className="hud-glass rounded-2xl p-4 md:p-5 border border-white/5 relative group hover:border-comet-orange/35 transition-all">
            <div className="flex items-center justify-between mb-3 text-star-white/40">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Combustion streak</span>
              <Zap className="w-4.5 h-4.5 text-comet-orange animate-pulse" />
            </div>
            <div className="font-display font-extrabold text-2xl md:text-3xl text-white">
              {stats.currentStreak} <span className="text-xs font-mono font-medium text-comet-orange uppercase">Days</span>
            </div>
            <p className="text-[10px] text-star-white/50 mt-1 font-sans">Consecutive day log velocity</p>
          </div>

          {/* Badges Unlocked */}
          <div className="hud-glass rounded-2xl p-4 md:p-5 border border-white/5 relative group hover:border-star-gold/35 transition-all">
            <div className="flex items-center justify-between mb-3 text-star-white/40">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Supernova Badges</span>
              <Trophy className="w-4.5 h-4.5 text-star-gold" />
            </div>
            <div className="font-display font-extrabold text-2xl md:text-3xl text-white">
              {stats.badgesUnlocked} <span className="text-sm font-mono font-medium text-star-gold">/ {stats.totalBadges}</span>
            </div>
            <p className="text-[10px] text-star-white/50 mt-1 font-sans">Astronomy badges achieved</p>
          </div>

          {/* Semantic Searches */}
          <div className="hud-glass rounded-2xl p-4 md:p-5 border border-white/5 relative group hover:border-nebula-purple/35 transition-all">
            <div className="flex items-center justify-between mb-3 text-star-white/40">
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Subspace Scanner</span>
              <Compass className="w-4.5 h-4.5 text-nebula-purple" />
            </div>
            <div className="font-display font-extrabold text-2xl md:text-3xl text-white">
              {stats.searchCount}
            </div>
            <p className="text-[10px] text-star-white/50 mt-1 font-sans">Semantic search operations completed</p>
          </div>
        </section>
      )}

      {/* Main Row: Intel briefing */}
      {briefing && (
        <section>
          <MissionBriefing briefing={briefing} onRefresh={syncBriefing} loading={syncingBriefing} />
        </section>
      )}

      {/* Trajectories: Recommendations and Gaps */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LearnNext recommendations={recs} />
        </div>
        <div className="space-y-6">
          <KnowledgeGaps gaps={gaps} />
        </div>
      </section>

      {/* Recent Entries Breakouts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-nebula-cyan" />
            <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              Recent Star Breakthroughs
            </h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono text-nebula-cyan hover:text-white uppercase font-bold tracking-wider hover:underline flex items-center gap-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Examine Full Logs</span>
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
                onClick={(id) => {
                  window.location.href = `/history?id=${id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="hud-glass border-dashed border-white/10 rounded-2xl p-10 text-center text-star-white/50 max-w-lg mx-auto bg-space-void/20">
            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3 animate-pulse" />
            <h4 className="font-display font-medium text-white mb-1.5">KNOWLEDGE GALAXIES EMPTY</h4>
            <p className="text-xs text-star-white/40 leading-relaxed font-sans mb-5">
              Welcome aboard, Cadet! Your star maps are offline because you haven't recorded your first learning breakthroughs. Set course for the Star Creator to establish your first coordinate.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nebula-purple text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:scale-102 cursor-pointer"
            >
              Log First Entry
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
