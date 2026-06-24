import React from "react";
import { Entry } from "../types";
import { useEffect, useRef, useState } from "react";
import { Orbit, Compass, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConstellationMapProps {
  entries: Entry[];
  onSelectStar?: (entry: Entry) => void;
}

export default function ConstellationMap({ entries, onSelectStar }: ConstellationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredStar, setHoveredStar] = useState<Entry | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Draw constellation connection lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleDraw = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

      ctx.clearRect(0, 0, width, height);

      // Group entries by category
      const categories: Record<string, Entry[]> = {};
      for (const entry of entries) {
        if (!categories[entry.category]) {
          categories[entry.category] = [];
        }
        categories[entry.category].push(entry);
      }

      // Draw lines for each category
      for (const catName in categories) {
        const stars = categories[catName];
        if (stars.length < 2) continue;

        // Sort stars to create a chain line instead of crossing paths
        const sortedStars = [...stars].sort((a, b) => a.coords.x - b.coords.x);

        ctx.beginPath();
        for (let i = 0; i < sortedStars.length; i++) {
          const star = sortedStars[i];

          // Map -100 to 100 coordinates to actual canvas pixels
          const cx = width / 2 + (star.coords.x / 100) * (width * 0.4) * zoom + offset.x;
          const cy = height / 2 + (star.coords.y / 100) * (height * 0.4) * zoom + offset.y;

          if (i === 0) {
            ctx.moveTo(cx, cy);
          } else {
            ctx.lineTo(cx, cy);
          }
        }

        // Setup glowing color based on category
        let color = "rgba(124, 58, 237, 0.25)"; // purple
        const catLower = catName.toLowerCase();
        if (catLower.includes("tech") || catLower.includes("code")) {
          color = "rgba(59, 130, 246, 0.25)"; // blue
        } else if (catLower.includes("sci") || catLower.includes("phys") || catLower.includes("astro")) {
          color = "rgba(6, 182, 212, 0.25)"; // cyan
        } else if (catLower.includes("lang") || catLower.includes("write")) {
          color = "rgba(236, 72, 153, 0.25)"; // pink
        } else if (catLower.includes("busi") || catLower.includes("fin")) {
          color = "rgba(251, 191, 36, 0.25)"; // gold
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]); // Dashed astronomical connections
        ctx.stroke();

        // Draw outer glowing beam
        ctx.strokeStyle = color.replace("0.25", "0.08");
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
      }
    };

    handleDraw();
    window.addEventListener("resize", handleDraw);

    return () => {
      window.removeEventListener("resize", handleDraw);
    };
  }, [entries, zoom, offset]);

  // Drag and pan support
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetMap = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[55vh] rounded-3xl border border-nebula-purple/20 bg-space-void/50 overflow-hidden hud-glass shadow-inner group select-none">
      {/* Background Star Grid / Calibration Markers */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
      
      {/* Central Horizon Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border border-dashed border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-dotted border-white/5 rounded-full pointer-events-none" />

      {/* Axis markers */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-star-white/30 tracking-widest pointer-events-none flex flex-col items-center">
        <span>W</span>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-star-white/30 tracking-widest pointer-events-none flex flex-col items-center">
        <span>E</span>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-star-white/30 tracking-widest pointer-events-none flex flex-col items-center">
        <span>N</span>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-star-white/30 tracking-widest pointer-events-none flex flex-col items-center">
        <span>S</span>
      </div>

      {/* Canvas Line Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Interactive Dragging Board */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute inset-0 w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
      >
        {entries.map((star) => {
          // Calculate positions
          const parentWidth = containerRef.current?.clientWidth || 800;
          const parentHeight = containerRef.current?.clientHeight || 500;

          const cx = parentWidth / 2 + (star.coords.x / 100) * (parentWidth * 0.4) * zoom + offset.x;
          const cy = parentHeight / 2 + (star.coords.y / 100) * (parentHeight * 0.4) * zoom + offset.y;

          // Out of bounds check
          if (cx < -20 || cx > parentWidth + 20 || cy < -20 || cy > parentHeight + 20) {
            return null; // hide if offscreen
          }

          const isHovered = hoveredStar?.id === star.id;

          // Assign glow shadow based on category
          let glowColor = "rgba(124,58,237,0.7)";
          let categoryColor = "bg-nebula-purple";
          const cat = star.category.toLowerCase();
          if (cat.includes("tech") || cat.includes("code")) {
            glowColor = "rgba(59,130,246,0.7)";
            categoryColor = "bg-nebula-blue";
          } else if (cat.includes("sci") || cat.includes("phys") || cat.includes("astro")) {
            glowColor = "rgba(6,182,212,0.7)";
            categoryColor = "bg-nebula-cyan";
          } else if (cat.includes("lang") || cat.includes("write")) {
            glowColor = "rgba(236,72,153,0.7)";
            categoryColor = "bg-supernova-pink";
          } else if (cat.includes("busi") || cat.includes("fin")) {
            glowColor = "rgba(251,191,36,0.7)";
            categoryColor = "bg-star-gold";
          }

          return (
            <div
              key={star.id}
              style={{
                position: "absolute",
                left: cx - 6,
                top: cy - 6,
                transform: `scale(${isHovered ? 1.4 : 1})`,
                transition: "transform 0.15s ease-out",
                zIndex: isHovered ? 50 : 10,
              }}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectStar) onSelectStar(star);
              }}
              className="cursor-pointer group/star flex items-center justify-center"
            >
              {/* Outer pulsing ring */}
              <div
                style={{ boxShadow: `0 0 16px 2px ${glowColor}` }}
                className={`absolute w-3 h-3 rounded-full ${categoryColor} group-hover/star:animate-ping opacity-45`}
              />

              {/* Core Star Point */}
              <div className="relative w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#fff]" />

              {/* Tag / Category Badge on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-space-void/95 border border-white/10 px-3 py-1.5 rounded-xl pointer-events-none shadow-xl flex flex-col items-center gap-0.5 whitespace-nowrap min-w-44 z-50 backdrop-blur-md"
                  >
                    <span className="font-display font-bold text-[11px] text-white">
                      {star.title}
                    </span>
                    <span className="font-mono text-[8px] text-nebula-cyan tracking-wider uppercase">
                      {star.category} • Mood: {star.mood}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Controller Buttons Overlay */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-1.5 rounded-lg bg-space-void/80 hover:bg-space-void/100 border border-white/10 text-star-white hover:text-white transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 rounded-lg bg-space-void/80 hover:bg-space-void/100 border border-white/10 text-star-white hover:text-white transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetMap}
          className="p-1.5 rounded-lg bg-space-void/80 hover:bg-space-void/100 border border-white/10 text-star-white hover:text-white transition-all font-mono text-[10px] tracking-wide uppercase px-2.5 cursor-pointer"
          title="Recenter Map"
        >
          Recenter
        </button>
      </div>

      {/* Meta coordinates legend */}
      <div className="absolute top-4 right-4 z-30 font-mono text-[9px] text-star-white/40 uppercase pointer-events-none flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <Orbit className="w-3 h-3 text-nebula-cyan" />
          <span>Semantic Positioning Active</span>
        </div>
        <div>
          Visible Stars: <span className="text-white">{entries.length}</span>
        </div>
      </div>
    </div>
  );
}
