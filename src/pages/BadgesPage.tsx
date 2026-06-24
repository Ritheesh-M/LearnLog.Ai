import React from "react";
import { useState, useEffect } from "react";
import { Badge, Stats } from "../types";
import BadgeCard from "../components/BadgeCard";
import AIThinking from "../components/AIThinking";
import { Award, Shield, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBadgesAndStats();
  }, []);

  const fetchBadgesAndStats = async () => {
    setLoading(true);
    try {
      const [badgesRes, statsRes] = await Promise.all([
        fetch("/api/badges"),
        fetch("/api/stats"),
      ]);
      const badgesData = await badgesRes.json();
      const statsData = await statsRes.json();

      setBadges(badgesData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed loading achievement metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AIThinking statusText="Scanning subspace military achievement registers..." />
      </div>
    );
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 animate-fade-in relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
            Stellar Achievements
          </span>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            🏆 Supernova <span className="text-nebula-purple">Hall of Achievements</span>
          </h1>
          <p className="text-star-white/70 text-sm max-w-2xl mt-1 font-sans">
            Earn legendary achievements by establishing solid learning streaks, diving deep into concepts, exploring multiple knowledge spheres, and indexing stars.
          </p>
        </div>

        {stats && (
          <div className="hud-glass rounded-2xl px-5 py-3 border border-white/5 flex items-center gap-4 bg-space-void/80 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-comet-orange animate-pulse" />
              <div>
                <span className="text-[9px] text-star-white/40 uppercase block leading-none mb-0.5">Current Streak</span>
                <span className="text-white font-bold text-sm leading-none">{stats.currentStreak} DAYS</span>
              </div>
            </div>
            <div className="border-l border-white/10 h-8" />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-star-gold" />
              <div>
                <span className="text-[9px] text-star-white/40 uppercase block leading-none mb-0.5">Unlocked Beacons</span>
                <span className="text-white font-bold text-sm leading-none">{unlockedCount} / {badges.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress HUD Tracker */}
      <div className="hud-glass rounded-3xl p-6 border border-nebula-purple/30 bg-space-void/80 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-star-white/70">
          <span className="flex items-center gap-1.5 text-nebula-cyan uppercase font-bold">
            <Shield className="w-4 h-4" />
            <span>Galaxy Fleet Commission</span>
          </span>
          <span>{unlockedCount} OF {badges.length} CONSTELLATIONS ALIGNED ({progressPercent}%)</span>
        </div>

        {/* Outer bar */}
        <div className="w-full h-3 rounded-full bg-space-void border border-white/10 relative overflow-hidden">
          {/* Glowing slide bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(45deg, #7c3aed, #06b6d4)",
              boxShadow: "0 0 10px rgba(124,58,237,0.7)",
            }}
            className="h-full rounded-full"
          />
        </div>

        <p className="text-center font-sans text-xs text-star-white/50">
          {unlockedCount === badges.length
            ? "👑 Phenomenal! All constellations mapped. You are a legendary sovereign of the knowledge universe!"
            : unlockedCount >= 6
            ? "🚀 Fleet Admiral status within reach! Continue charting logs to align remaining coordinates."
            : "🔭 Welcome Cadet. Maintain a daily study pace to spark your first sub-system ignition thrusters."}
        </p>
      </div>

      {/* Badges Hexagonal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div key={badge.id}>
            <BadgeCard badge={badge} />
          </div>
        ))}
      </div>
    </div>
  );
}
