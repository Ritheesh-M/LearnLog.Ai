import { Recommendation } from "../types";
import { Sparkles, Trophy, Star } from "lucide-react";
import { motion } from "motion/react";

interface LearnNextProps {
  recommendations: Recommendation[];
}

export default function LearnNext({ recommendations }: LearnNextProps) {
  if (recommendations.length === 0) {
    return (
      <div className="hud-glass rounded-2xl p-6 text-center text-star-white/70 bg-space-void/40 border border-white/5">
        <Sparkles className="w-6 h-6 text-star-gold mx-auto mb-2 animate-spin-slow" />
        <h4 className="font-display font-medium text-white mb-1">AWAITING SYSTEM DATA</h4>
        <p className="text-xs text-star-white/50 max-w-xs mx-auto">
          Start logging details in the Star Creator. Gemini will formulate your personalized learning path recommendation index!
        </p>
      </div>
    );
  }

  const getDifficultyClass = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes("begin")) return "bg-aurora-green/15 text-aurora-green border-aurora-green/20";
    if (d.includes("intermed")) return "bg-star-gold/15 text-star-gold border-star-gold/20";
    return "bg-supernova-pink/15 text-supernova-pink border-supernova-pink/20";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-star-gold" />
        <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
          AI Trajectory Recommendations
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="hud-glass rounded-2xl p-5 hover:hud-glass-glowing transition-all duration-300 border border-nebula-blue/20 hover:border-nebula-blue/50 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider font-semibold ${getDifficultyClass(
                    rec.difficulty
                  )}`}
                >
                  {rec.difficulty}
                </span>
                <Trophy className="w-3.5 h-3.5 text-star-gold/60" />
              </div>

              {/* Title */}
              <h4 className="font-display font-bold text-base text-white mb-2 group-hover:text-nebula-cyan transition-colors">
                {rec.topic}
              </h4>

              {/* Why recommended */}
              <p className="text-star-white/70 text-xs leading-relaxed font-sans mb-4">
                {rec.why}
              </p>
            </div>

            {/* Launch study action */}
            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-mono text-star-white/40">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-star-gold fill-star-gold" />
                <span>Orbit Alignment</span>
              </span>
              <span className="text-nebula-cyan uppercase font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
                Lock course
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
