import React from "react";
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Send, Trash2, Cpu, MessageSquare, RefreshCw, Sparkles, User, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history || []);
      }
    } catch (err) {
      console.error("Central AI communications drift:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMessage: ChatMessage = {
          role: "model",
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, modelMessage]);
      }
    } catch (err) {
      console.error("Communications blackout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to scrub all intelligence communications with the Central AI?")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error("Scrub protocol error:", err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 h-[80vh] flex flex-col justify-between animate-fade-in relative">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-nebula-purple/15 border border-nebula-purple/30 flex items-center justify-center text-nebula-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[9px] text-nebula-cyan uppercase font-bold tracking-widest block leading-none mb-1">
              Deep Space Link
            </span>
            <h1 className="font-display font-bold text-lg text-white leading-none uppercase">
              Central AI Terminal
            </h1>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-300 text-xs font-mono uppercase cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? "Scrubbing..." : "Purge Channel"}</span>
          </button>
        )}
      </div>

      {/* Communications feed */}
      <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-star-white/30 space-y-4 max-w-sm mx-auto">
            <MessageSquare className="w-12 h-12 text-white/10 animate-float" />
            <div>
              <h3 className="font-display font-medium text-white/70 mb-1.5 uppercase">
                COMMUNICATIONS FEED STANDBY
              </h3>
              <p className="text-xs text-star-white/40 leading-relaxed font-sans">
                Initiate a query to our central Gemini-Flash module. Ask about your logged knowledge, find summaries, compare past learning stars, or request study tips!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-nebula-purple/20 border border-nebula-purple/40 flex items-center justify-center shrink-0 text-nebula-cyan select-none self-end">
                      <Cpu className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`p-4 rounded-2xl max-w-[80%] text-sm font-sans shadow-lg border ${
                      isUser
                        ? "bg-nebula-purple/20 border-nebula-purple/45 text-white rounded-br-none"
                        : "bg-space-void/90 border-white/5 text-star-white/95 rounded-bl-none leading-relaxed"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    <div className="mt-1.5 text-[8px] font-mono text-star-white/30 text-right uppercase">
                      {isUser ? "Transmitted" : "Broadcast received"}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-star-white select-none self-end">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Inline Loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3.5 justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-nebula-purple/20 border border-nebula-purple/40 flex items-center justify-center shrink-0 text-nebula-cyan">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-space-void/90 border border-white/5 text-star-white/60 text-xs font-mono tracking-wide rounded-bl-none flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nebula-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-nebula-cyan"></span>
                  </span>
                  <span>CENTRAL AI MODULATING BROADCAST PATHWAYS...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Message input bar */}
      <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full pt-4 border-t border-white/10">
        <div className="hud-glass rounded-2xl p-2 border border-white/10 bg-space-void/80 flex items-center gap-2">
          <div className="p-2.5 text-star-white/40">
            <Terminal className="w-4 h-4 text-nebula-cyan" />
          </div>

          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder={
              loading
                ? "Frequency locked..."
                : "Ask anything... e.g. 'Compare my computer science notes' or 'Recommend study tips'"
            }
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-white/20 px-2 font-sans"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className={`p-3 rounded-xl transition-all duration-300 ${
              loading || !inputText.trim()
                ? "bg-white/5 text-star-white/20 cursor-not-allowed"
                : "bg-nebula-purple hover:bg-nebula-cyan hover:text-space-void text-white shadow-[0_0_10px_rgba(124,58,237,0.3)] cursor-pointer"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
