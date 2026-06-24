import { Brain, Cpu, Orbit } from "lucide-react";
import { motion } from "motion/react";

interface AIThinkingProps {
  statusText?: string;
}

export default function AIThinking({ statusText = "Gemini is analyzing cognitive logs..." }: AIThinkingProps) {
  const cosmicTexts = [
    statusText,
    "Scanning semantic database pathways...",
    "Aligning celestial star coordinates...",
    "Synthesizing summary structures...",
    "Calibrating cosmic mood metrics...",
    "Fusing knowledge vector fields...",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center my-6">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Core Pulsing Ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-nebula-purple/20 border border-nebula-purple/30 blur-md"
        />

        {/* Orbit Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 border border-dashed border-nebula-blue/30 rounded-full"
        />

        {/* Orbit Node 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-nebula-cyan shadow-[0_0_10px_#06b6d4]" />
        </motion.div>

        {/* Orbit Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute w-20 h-20 border border-dotted border-supernova-pink/40 rounded-full"
        />

        {/* Orbit Node 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute w-20 h-20"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-supernova-pink shadow-[0_0_8px_#ec4899]" />
        </motion.div>

        {/* Core Intelligence Nucleus */}
        <motion.div
          animate={{ y: [-4, 4, -4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-14 h-14 rounded-2xl bg-space-deep border border-nebula-purple flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]"
        >
          <Brain className="w-7 h-7 text-nebula-cyan animate-pulse" />
        </motion.div>
      </div>

      {/* Loading Pulsing Message */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 flex flex-col items-center gap-1.5"
      >
        <div className="font-display font-medium text-sm tracking-wider text-white">
          COGNITIVE LINK ESTABLISHED
        </div>
        <div className="font-mono text-xs text-nebula-blue tracking-wide px-4 max-w-sm">
          {statusText}
        </div>
      </motion.div>
    </div>
  );
}
