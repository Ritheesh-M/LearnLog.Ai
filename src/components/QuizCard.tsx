import { QuizQuestion } from "../types";
import { useState } from "react";
import { Check, X, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizCardProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswerSelected: (isCorrect: boolean) => void;
  onNextQuestion: () => void;
}

export default function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswerSelected,
  onNextQuestion,
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === question.answer;
    onAnswerSelected(isCorrect);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    onNextQuestion();
  };

  return (
    <div className="hud-glass rounded-2xl border border-nebula-purple/30 p-6 md:p-8 flex flex-col justify-between h-full bg-space-void/80 max-w-2xl mx-auto shadow-[0_0_30px_rgba(124,58,237,0.15)] relative overflow-hidden">
      {/* Quiz Header Info */}
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 font-mono text-xs text-star-white/50">
        <div className="flex items-center gap-1.5 text-nebula-cyan">
          <HelpCircle className="w-4 h-4" />
          <span>QUIZ TERMINAL</span>
        </div>
        <div>
          QUESTION <span className="text-white font-bold">{questionIndex + 1}</span> OF <span className="text-white font-bold">{totalQuestions}</span>
        </div>
      </div>

      {/* The Question */}
      <div className="mb-6">
        <h3 className="font-display font-medium text-lg md:text-xl text-white leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrectAnswer = option === question.answer;
          const isWrongSelection = isSelected && !isCorrectAnswer;

          let optionStyle = "border-white/10 hover:border-nebula-purple/50 bg-white/5 text-star-white hover:bg-white/10";
          if (isSelected && !isSubmitted) {
            optionStyle = "border-nebula-cyan bg-nebula-cyan/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]";
          } else if (isSubmitted) {
            if (isCorrectAnswer) {
              optionStyle = "border-aurora-green bg-aurora-green/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            } else if (isWrongSelection) {
              optionStyle = "border-red-500 bg-red-500/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]";
            } else {
              optionStyle = "border-white/5 bg-white/20 opacity-30 text-star-white/50 pointer-events-none";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-xl border text-sm font-sans flex items-center justify-between transition-all duration-200 cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs opacity-55">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span>{option}</span>
              </div>
              
              {/* Correct/Incorrect icon markers */}
              {isSubmitted && isCorrectAnswer && (
                <div className="w-5 h-5 rounded-full bg-aurora-green/20 flex items-center justify-center border border-aurora-green">
                  <Check className="w-3 h-3 text-aurora-green" />
                </div>
              )}
              {isSubmitted && isWrongSelection && (
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500">
                  <X className="w-3 h-3 text-red-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation and Original Log Reference */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-space-void/90 rounded-xl p-4 border border-white/5"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider mb-1.5 text-nebula-cyan">
              Intelligence Brief:
            </div>
            <p className="text-xs text-star-white/80 leading-relaxed font-sans mb-3">
              {question.explanation}
            </p>
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-mono text-star-white/40">
              <span>Source Log: <span className="text-white font-medium">{question.sourceTitle}</span></span>
              {question.sourceId && (
                <a
                  href={`/history?id=${question.sourceId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-nebula-purple hover:text-white transition-colors uppercase font-bold"
                >
                  <span>Examine Source</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission / Next Controls */}
      <div className="flex justify-end border-t border-white/10 pt-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 ${
              selectedOption
                ? "bg-nebula-purple hover:bg-nebula-purple/80 text-white cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:scale-102"
                : "bg-white/5 border border-white/10 text-star-white/30 cursor-not-allowed"
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nebula-cyan text-space-void hover:bg-white transition-all duration-200 font-semibold text-xs tracking-wider uppercase cursor-pointer hover:scale-102 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <span>{questionIndex + 1 === totalQuestions ? "Finish Mission" : "Next Star System"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
