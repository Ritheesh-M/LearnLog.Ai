import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Orbit,
  FileCode,
  Award,
  BookOpen,
  MessageSquare,
  Compass,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Stats } from "../types";

export default function Navbar() {
  const location = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "Mission Control", icon: LayoutDashboard },
    { path: "/create", label: "Star Creator", icon: Sparkles },
    { path: "/galaxy", label: "Knowledge Galaxy", icon: Orbit },
    { path: "/history", label: "Ship Log", icon: FileCode },
    { path: "/badges", label: "Supernova Hall", icon: Award },
    { path: "/quiz", label: "Retention Quiz", icon: BookOpen },
    { path: "/chat", label: "Central AI", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
      <div className="mx-auto max-w-7xl">
        <div className="hud-glass rounded-2xl flex items-center justify-between p-4 border border-nebula-purple/30 bg-space-void/60 backdrop-blur-md">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Compass className="w-8 h-8 text-nebula-cyan group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-nebula-cyan/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold tracking-wider text-lg text-white bg-clip-text">
                LEARNLOG <span className="text-nebula-purple">AI</span>
              </span>
              <span className="font-mono text-[9px] text-nebula-cyan uppercase tracking-widest leading-none">
                Constellation Deck
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? "bg-nebula-purple/25 text-white border border-nebula-purple/50 shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                      : "text-star-white/75 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-nebula-cyan" : "text-star-white/60"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status / Streaks HUD */}
          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-4 bg-space-void/80 border border-white/5 rounded-xl px-3 py-1.5 font-mono text-xs">
                {/* Streak */}
                <div className="flex items-center gap-1.5">
                  <span className="text-comet-orange animate-pulse">🔥</span>
                  <span className="text-star-white/90 font-medium">
                    {stats.currentStreak} <span className="text-star-white/50 text-[10px]">DAYS</span>
                  </span>
                </div>
                {/* Stars Count */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="text-star-gold">✨</span>
                  <span className="text-star-white/90 font-medium">
                    {stats.totalEntries} <span className="text-star-white/50 text-[10px]">STARS</span>
                  </span>
                </div>
              </div>
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-aurora-green shadow-[0_0_8px_#10b981] animate-pulse" title="Systems Nominal" />
          </div>
        </div>

        {/* Mobile Nav Drawer overlay (Horizontal scroll for small screens) */}
        <div className="flex lg:hidden overflow-x-auto gap-2 py-2 px-1 scrollbar-none mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-nebula-purple/30 text-white border-nebula-purple/50 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                    : "bg-space-void/60 text-star-white/70 border-white/5 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
