import React from "react";
import { useState, useEffect } from "react";
import { QuizQuestion, Stats } from "../types";
import QuizCard from "../components/QuizCard";
import AIThinking from "../components/AIThinking";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Trophy,
  Play,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function QuizPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizState, setQuizState] = useState<"lobby" | "active" | "completed">("lobby");
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answersLog, setAnswersLog] = useState<boolean[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed loading quiz prerequisite stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await fetch("/api/quizzes/generate");
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data.quiz || []);
        setQuizState("active");
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswersLog([]);
      }
    } catch (err) {
      console.error("Quiz generator telemetry collision:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSelected = (isCorrect: boolean) => {
    setAnswersLog((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((idx) => idx + 1);
    } else {
      setQuizState("completed");
    }
  };

  const handleRestartLobby = () => {
    setQuizQuestions([]);
    setQuizState("lobby");
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswersLog([]);
  };

  const getRankTitle = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio === 1) return { title: "👑 Quantum Grandmaster", color: "text-star-gold", msg: "Flawless cognitive calibration! Your recall aligns perfectly with critical systems." };
    if (ratio >= 0.75) return { title: "🚀 Stellar Navigator", color: "text-nebula-cyan", msg: "Excellent trajectory! Most coordinates are fully aligned and secure." };
    if (ratio >= 0.5) return { title: "🛸 Sector Cadet", color: "text-nebula-blue", msg: "Decent thrust, but some sensory files require closer recalibration." };
    return { title: "👾 Nebula Drifter", color: "text-supernova-pink", msg: "Severe spatial drift detected. Re-examine ship logs to tighten retention grids." };
  };

  if (loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AIThinking statusText="Gathering ship-log prerequisite telemetry..." />
      </div>
    );
  }

  // Minimum Star Threshold Check
  const hasEnoughStars = stats && stats.totalEntries >= 3;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 animate-fade-in relative">
      {/* Page Header */}
      <div>
        <span className="font-mono text-xs text-nebula-cyan uppercase tracking-widest block mb-1">
          Memory Retention Grid
        </span>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">
          🧩 Cognitive <span className="text-nebula-purple">Retention Quizzes</span>
        </h1>
        <p className="text-star-white/70 text-sm max-w-2xl mt-1 font-sans">
          Test your long-term memory. Our Gemini AI model harvests terms, logic blocks, and facts from your registered learning logs to draft customized multiple-choice tests.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* LOBBY VIEW */}
        {quizState === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto"
          >
            {loadingQuiz ? (
              <div className="hud-glass rounded-3xl p-10 border border-nebula-purple/35 text-center">
                <AIThinking statusText="Gemini is drafting custom evaluation vectors from your files..." />
              </div>
            ) : !hasEnoughStars ? (
              <div className="hud-glass rounded-3xl p-8 border border-white/5 bg-space-void/60 text-center space-y-5">
                <HelpCircle className="w-12 h-12 text-star-white/20 mx-auto animate-float" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2 uppercase">
                    Retention Systems Offline
                  </h3>
                  <p className="text-xs text-star-white/60 leading-relaxed font-sans max-w-sm mx-auto">
                    To maintain reliable, structured question generation, the Gemini core requires at least <span className="text-nebula-cyan font-bold font-mono">3 learning stars</span> registered in your cockpit database. You currently have <span className="text-supernova-pink font-bold font-mono">{stats?.totalEntries || 0}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-xs font-bold uppercase tracking-wider hover:scale-102 transition-all cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Learning Stars</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hud-glass rounded-3xl p-6 md:p-8 border border-nebula-purple/30 bg-space-void/80 space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(124,58,237,0.1)]">
                {/* Decoration */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-nebula-purple/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-nebula-purple/15 border border-nebula-purple/30 flex items-center justify-center text-nebula-cyan shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-nebula-cyan uppercase font-bold tracking-widest block leading-none mb-1">
                      Mission Simulator Room
                    </span>
                    <h3 className="font-display font-bold text-lg text-white leading-none uppercase">
                      Cognitive Evaluation Lobby
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs text-star-white/70 leading-relaxed bg-space-void/60 p-4 rounded-xl border border-white/5">
                  <p>
                    <strong>Simulator parameters:</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Dynamic Generation: Multiple-choice questions sourced directly from your notes.</li>
                    <li>Structure: 5 standalone evaluative inquiries.</li>
                    <li>Instant Feedback: Explanations provided immediately after submitting selections.</li>
                  </ul>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartQuiz}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-blue hover:from-nebula-blue hover:to-nebula-cyan text-white text-sm font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:scale-101 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-nebula-cyan fill-nebula-cyan" />
                  <span>Initiate Evaluation</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {quizState === "active" && quizQuestions.length > 0 && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <QuizCard
              question={quizQuestions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={quizQuestions.length}
              onAnswerSelected={handleAnswerSelected}
              onNextQuestion={handleNextQuestion}
            />
          </motion.div>
        )}

        {/* COMPLETED REPORT CARD */}
        {quizState === "completed" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto"
          >
            <div className="hud-glass-glowing rounded-3xl p-6 md:p-8 border border-nebula-purple/40 bg-space-void/90 text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              <div className="w-14 h-14 rounded-full bg-nebula-purple/15 border border-nebula-purple/30 flex items-center justify-center mx-auto text-star-gold">
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <span className="font-mono text-[9px] text-nebula-cyan uppercase tracking-widest block font-bold mb-1">
                  Evaluation Finished
                </span>
                <h3 className="font-display font-extrabold text-2xl text-white">
                  MISSION COMPLETE
                </h3>
              </div>

              {/* Score HUD display */}
              <div className="bg-space-void/90 border border-white/5 rounded-2xl p-5 max-w-xs mx-auto relative">
                <div className="font-mono text-[10px] text-star-white/40 uppercase mb-2">Score registered</div>
                <div className="font-display font-extrabold text-4xl text-white">
                  {score} <span className="text-star-white/30 text-lg">/ {quizQuestions.length}</span>
                </div>
                <div className="text-[10px] font-mono text-star-white/50 mt-1">
                  ({Math.round((score / quizQuestions.length) * 100)}% Cognitive Alignment)
                </div>
              </div>

              {/* Space Cadet Rank Evaluation */}
              <div className="space-y-1">
                <div className={`font-display font-bold text-sm ${getRankTitle(score, quizQuestions.length).color}`}>
                  {getRankTitle(score, quizQuestions.length).title}
                </div>
                <p className="text-xs text-star-white/60 leading-relaxed font-sans max-w-xs mx-auto italic">
                  "{getRankTitle(score, quizQuestions.length).msg}"
                </p>
              </div>

              {/* Actions row */}
              <div className="border-t border-white/10 pt-5 flex items-center gap-3">
                <button
                  onClick={handleStartQuiz}
                  className="w-1/2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-nebula-purple hover:bg-nebula-purple/80 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-nebula-cyan" />
                  <span>Restart Grid</span>
                </button>

                <button
                  onClick={handleRestartLobby}
                  className="w-1/2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-star-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-nebula-cyan" />
                  <span>Exit Simulator</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
