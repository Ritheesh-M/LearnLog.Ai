import { Badge } from "../types";
import { Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface BadgeCardProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const getTierClass = (tier: string) => {
    if (tier.includes("Bronze")) return "text-amber-600 border-amber-600/30 bg-amber-950/10";
    if (tier.includes("Silver")) return "text-slate-300 border-slate-300/30 bg-slate-300/5";
    return "text-star-gold border-star-gold/30 bg-star-gold/10";
  };

  const getMedallionGlow = (tier: string) => {
    if (tier.includes("Bronze")) return "shadow-[0_0_15px_rgba(217,119,6,0.1)] hover:border-amber-500/50";
    if (tier.includes("Silver")) return "shadow-[0_0_15px_rgba(203,213,225,0.1)] hover:border-slate-300/50";
    return "shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:border-star-gold/60";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`hud-glass rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-full ${
        badge.unlocked
          ? `${getMedallionGlow(badge.tier)} border-nebula-purple/30 bg-space-void/80`
          : "border-white/5 bg-space-void/20 grayscale opacity-40 hover:grayscale-0 hover:opacity-75"
      }`}
    >
      {/* Absolute particle layer */}
      {badge.unlocked && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-aurora-green/75 animate-ping" />
      )}

      <div>
        {/* Header: Emoji & Lock/Unlock Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl select-none leading-none animate-float filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            {badge.icon}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getTierClass(
                badge.tier
              )}`}
            >
              {badge.tier}
            </span>
            {badge.unlocked ? (
              <CheckCircle2 className="w-4 h-4 text-aurora-green" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-star-white/40" />
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-display font-semibold text-sm text-white mb-1.5 group-hover:text-nebula-cyan transition-colors">
          {badge.name}
        </h4>

        {/* Description */}
        <p className="text-star-white/60 text-xs leading-relaxed font-sans">
          {badge.description}
        </p>
      </div>

      {/* Unlocked stamp */}
      {badge.unlocked ? (
        <div className="border-t border-white/5 mt-4 pt-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] text-aurora-green tracking-wider uppercase font-semibold">
            Status: Active
          </span>
          <span className="font-mono text-[8px] text-star-white/30 uppercase">Supernova Registered</span>
        </div>
      ) : (
        <div className="border-t border-white/5 mt-4 pt-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] text-star-white/30 tracking-wider uppercase">
            Status: Locked
          </span>
          <span className="font-mono text-[8px] text-star-white/20 uppercase">Pending Breakthrough</span>
        </div>
      )}
    </motion.div>
  );
}
