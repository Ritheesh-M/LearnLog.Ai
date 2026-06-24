import { KnowledgeGap } from "../types";
import { AlertCircle, HelpCircle, Compass } from "lucide-react";
import { motion } from "motion/react";

interface KnowledgeGapsProps {
  gaps: KnowledgeGap[];
}

export default function KnowledgeGaps({ gaps }: KnowledgeGapsProps) {
  if (gaps.length === 0) {
    return (
      <div className="hud-glass border-dashed border-aurora-green/35 rounded-2xl p-6 text-center text-star-white/70 bg-space-void/40">
        <div className="w-10 h-10 rounded-full bg-aurora-green/10 flex items-center justify-center mx-auto mb-3 border border-aurora-green/30">
          <Compass className="w-5 h-5 text-aurora-green" />
        </div>
        <h4 className="font-display font-medium text-white mb-1">ALL SECTORS RESOLVED</h4>
        <p className="text-xs text-star-white/50 max-w-sm mx-auto">
          Gemini has scanned your learning logs and found no critical knowledge gaps. Your constellation map is structurally aligned!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-supernova-pink" />
        <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
          Uncharted Sectors (Gaps)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((gap, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-supernova-pink/25 hover:border-supernova-pink/55 rounded-2xl p-5 bg-space-void/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] bg-supernova-pink/15 text-supernova-pink px-2.5 py-0.5 rounded-full border border-supernova-pink/20 tracking-wider uppercase font-semibold">
                  Gap Detected
                </span>
                <HelpCircle className="w-4 h-4 text-supernova-pink/50" />
              </div>

              {/* Topic Name */}
              <h4 className="font-display font-bold text-base text-white mb-1">
                {gap.topic}
              </h4>

              {/* Reason */}
              <p className="text-xs text-star-white/60 leading-relaxed font-sans mb-4">
                {gap.reason}
              </p>
            </div>

            {/* Suggested action plan */}
            <div className="bg-space-void/60 border border-white/5 rounded-xl p-3.5 mt-auto">
              <div className="font-mono text-[9px] text-nebula-cyan uppercase tracking-wider font-semibold mb-1">
                AI Suggestion Plan:
              </div>
              <p className="text-xs text-star-white/80 font-sans italic leading-relaxed">
                "{gap.suggestion}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
