import React from "react";
import { Entry } from "../types";
import { Star, Tag, Calendar, MapPin, Trash2, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface EntryCardProps {
  key?: string;
  entry: Entry;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function EntryCard({ entry, onDelete, onClick }: EntryCardProps) {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Decide color scheme based on category
  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("tech") || c.includes("code") || c.includes("comput")) {
      return "bg-nebula-blue/20 text-nebula-blue border-nebula-blue/40 shadow-blue-500/10";
    }
    if (c.includes("sci") || c.includes("phys") || c.includes("astro")) {
      return "bg-nebula-cyan/20 text-nebula-cyan border-nebula-cyan/40 shadow-cyan-500/10";
    }
    if (c.includes("lang") || c.includes("write") || c.includes("english")) {
      return "bg-supernova-pink/20 text-supernova-pink border-supernova-pink/40 shadow-pink-500/10";
    }
    if (c.includes("phil") || c.includes("psych") || c.includes("mind")) {
      return "bg-nebula-purple/20 text-nebula-purple border-nebula-purple/40 shadow-purple-500/10";
    }
    if (c.includes("busi") || c.includes("fin") || c.includes("econ")) {
      return "bg-star-gold/20 text-star-gold border-star-gold/40 shadow-gold-500/10";
    }
    if (c.includes("art") || c.includes("design") || c.includes("cook")) {
      return "bg-comet-orange/20 text-comet-orange border-comet-orange/40 shadow-orange-500/10";
    }
    return "bg-white/10 text-star-white/95 border-white/20 shadow-white/5";
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className="hud-glass rounded-2xl p-5 hover:hud-glass-glowing transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full border border-nebula-purple/20 hover:border-nebula-purple/50"
    >
      {/* Decorative Corner Glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-nebula-purple/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

      <div>
        {/* Card Header: Category + Mood */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border uppercase tracking-wider ${getCategoryColor(
              entry.category
            )}`}
          >
            {entry.category}
          </span>
          <div className="flex items-center gap-1.5 bg-space-void/60 border border-white/5 rounded-lg px-2 py-0.5" title={`Mood: ${entry.mood}`}>
            <span className="text-sm select-none">{entry.mood}</span>
            <span className="font-mono text-[10px] text-star-white/40 uppercase">Mood</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-lg text-white mb-2 leading-tight group-hover:text-nebula-cyan transition-colors duration-300 line-clamp-2">
          {entry.title}
        </h3>

        {/* AI Summary */}
        <p className="text-star-white/70 text-xs leading-relaxed mb-4 line-clamp-3">
          {entry.summary}
        </p>
      </div>

      <div>
        {/* Tag chips */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] text-star-white/60 hover:text-white transition-colors"
              >
                <Tag className="w-2.5 h-2.5 text-nebula-purple/75" />
                <span>#{tag}</span>
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-[9px] text-star-white/40 font-mono px-1 py-0.5">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Row: Date, Quality, Coords */}
        <div className="border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-star-white/50 font-mono">
          <div className="flex items-center gap-1" title="Log Timestamp">
            <Calendar className="w-3.5 h-3.5 text-nebula-blue/70" />
            <span>{formattedDate}</span>
          </div>

          {/* Quality Stars */}
          <div className="flex items-center gap-0.5" title={`Quality Score: ${entry.quality}/5`}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`w-3 h-3 ${
                  idx < entry.quality ? "fill-star-gold text-star-gold" : "text-white/10"
                }`}
              />
            ))}
          </div>

          {/* Map coordinates */}
          {entry.coords && (
            <div className="flex items-center gap-1 text-nebula-cyan" title="Constellation Coordinates">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                [{Math.round(entry.coords.x)}, {Math.round(entry.coords.y)}]
              </span>
            </div>
          )}
        </div>

        {/* Action Button Overlays */}
        <div className="flex items-center justify-end gap-2 mt-4 border-t border-white/5 pt-3">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to dissolve this star into the cosmic void?")) {
                  onDelete(entry.id);
                }
              }}
              className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
              title="Dissolve Star"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onClick && (
            <button
              onClick={() => onClick(entry.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nebula-purple/20 hover:bg-nebula-purple/40 border border-nebula-purple/30 hover:border-nebula-purple/50 text-white transition-all duration-200"
            >
              <span className="text-[10px] font-semibold tracking-wider uppercase">Examine Log</span>
              <ArrowUpRight className="w-3 h-3 text-nebula-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
