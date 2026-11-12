import React, { useState, useRef, useEffect } from 'react';
import { genaiApi } from '../services/api';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  ChevronDown, 
  HelpCircle, 
  ShieldAlert, 
  FileText,
  RotateCcw
} from 'lucide-react';

export default function GenAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hello! I am **FraudShield GenAI Copilot**, your real-time financial crimes investigation assistant. Ask me about flagged transactions, fraud patterns, AML regulatory guidelines, or model metrics.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const quickPrompts = [
    "What triggers a mandatory regulatory SAR filing?",
    "Explain SIM-Swap Account Takeover pattern",
    "How does the Random Forest model score risk?",
    "What immediate steps to take on a 90+ critical score?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await genaiApi.chatCopilot({
        query: query,
        context: {},
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.text }))
      });

      const aiMsg = {
        role: 'assistant',
        text: res.data.reply || "I have analyzed your query. The model and database are monitoring all active risk streams.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Copilot error:", err);
      const errorMsg = {
        role: 'assistant',
        text: "Apologies, I encountered an issue contacting the intelligence service. Please ensure the backend is running.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-container flex flex-col items-start pointer-events-none">
      {/* Slide-Up Chat Window opens directly above the bottom-left button */}
      {isOpen && (
        <div className="pointer-events-auto w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] h-[540px] max-h-[calc(100vh-120px)] mb-3 rounded-2xl glass-panel border border-slate-700/80 bg-navy-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-[1050]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-navy-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">FraudShield Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold">GenAI</span>
                </div>
                <p className="text-[11px] text-slate-400">Financial Crimes Forensic Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Reset Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Window"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/20 text-brand-cyan border border-brand-blue/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-none'
                      : 'bg-navy-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </div>
                  <div className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'} text-right`}>
                    {msg.time}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-brand-blue/20 text-brand-cyan flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-navy-900 border border-slate-800 text-slate-300 italic flex items-center gap-1.5">
                  <span>Synthesizing forensic intelligence...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-navy-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-navy-950 border border-slate-700/70 text-[10px] text-slate-300 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-navy-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask GenAI Copilot about fraud risks, SARs..."
                className="flex-1 bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white disabled:opacity-40 hover:opacity-90 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button at Bottom-Left */}
      <button
        type="button"
        id="copilot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-cyan text-white font-bold text-[11px] sm:text-xs shadow-2xl shadow-brand-blue/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 z-[1000]"
        aria-label="GenAI Fraud Copilot"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <span>GenAI Fraud Copilot</span>
        {isOpen && <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 ml-0.5" />}
      </button>
    </div>
  );
}
