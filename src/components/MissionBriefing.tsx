import { Briefing } from "../types";
import { ShieldCheck, Flag, AlertTriangle, User, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface MissionBriefingProps {
  briefing: Briefing;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function MissionBriefing({ briefing, onRefresh, loading = false }: MissionBriefingProps) {
  return (
    <div className="hud-glass rounded-3xl p-6 md:p-8 border border-nebula-purple/35 bg-space-void/90 relative overflow-hidden shadow-[0_12px_40px_rgba(124,58,237,0.1)]">
      {/* Absolute grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative radar sweep overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-nebula-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-nebula-purple/15 flex items-center justify-center border border-nebula-purple/30 text-nebula-cyan animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-nebula-cyan tracking-widest uppercase font-bold leading-none block mb-1">
                Subspace Intelligence Feed
              </span>
              <h2 className="font-display font-bold text-lg md:text-xl text-white tracking-tight leading-none uppercase">
                {briefing.title}
              </h2>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-star-white hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-nebula-cyan ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Aligning Antennas..." : "Sync Intelligence"}</span>
            </button>
          )}
        </div>

        {/* Status Report Section */}
        <div className="mb-6">
          <div className="font-mono text-[10px] text-star-white/40 uppercase tracking-wider mb-2 font-bold">
            Sector Flight Assessment
          </div>
          <p className="text-sm text-star-white/90 leading-relaxed font-sans bg-white/5 p-4 rounded-2xl border border-white/5">
            {briefing.statusReport}
          </p>
        </div>

        {/* Grid: Breakthroughs & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Breakthroughs */}
          <div className="border border-white/5 rounded-2xl p-5 bg-space-void/40">
            <div className="flex items-center gap-2 text-aurora-green mb-3 font-mono text-[10px] uppercase font-bold tracking-wider">
              <Flag className="w-4 h-4" />
              <span>Recent Star Breakthroughs</span>
            </div>
            {briefing.breakthroughs && briefing.breakthroughs.length > 0 ? (
              <ul className="space-y-2.5">
                {briefing.breakthroughs.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-star-white/80 font-sans">
                    <span className="text-star-gold text-sm select-none leading-none">✦</span>
                    <span className="leading-normal">{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-star-white/40 italic font-sans">No breakthroughs recorded this cycle.</p>
            )}
          </div>

          {/* Uncharted Sectors Gaps */}
          <div className="border border-white/5 rounded-2xl p-5 bg-space-void/40">
            <div className="flex items-center gap-2 text-supernova-pink mb-3 font-mono text-[10px] uppercase font-bold tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Uncharted Sectors</span>
            </div>
            <p className="text-xs text-star-white/80 leading-relaxed font-sans">
              {briefing.gapsInChart}
            </p>
          </div>
        </div>

        {/* Flight Commander Notes */}
        <div className="border-t border-white/10 pt-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-nebula-blue/25 border border-nebula-blue flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-nebula-cyan" />
          </div>
          <div className="bg-nebula-blue/5 border border-nebula-blue/15 rounded-2xl p-4 w-full">
            <div className="font-mono text-[9px] text-nebula-cyan uppercase tracking-wider font-bold mb-1">
              Flight Commander Diagnostics:
            </div>
            <p className="text-xs text-star-white/90 font-sans italic leading-relaxed">
              "{briefing.commanderNotes}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
