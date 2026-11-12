import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Shield, CheckCircle2, AlertTriangle, Layers, BrainCircuit, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-cyan text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Final Year Academic Project Documentation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explainable Deep Learning for Financial Fraud Prediction Using Multi-Modal Data
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              B.Tech Computer Science & Engineering Final-Year / Mini-Project Demonstration
            </p>
          </div>

          {/* Problem Statement Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-amber" /> Problem Statement
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional fraud detection systems often depend on predefined static rules or machine-learning models that analyze limited transaction information. These legacy systems struggle to identify complex and evolving fraud patterns and provide predictions without explaining the underlying reasons behind their decisions.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              This project proposes an <strong>Explainable Deep Learning based Financial Fraud Prediction System</strong> using multi-modal data. By integrating transaction values, customer behavior, device characteristics, geographical coordinates, temporal frequency, and security indicators, the system identifies complex fraud patterns while leveraging SHAP and LIME to generate human-understandable explanations for analysts.
            </p>
          </div>

          {/* Objectives Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-emerald" /> Core Project Objectives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                "Develop an intelligent financial fraud detection platform.",
                "Use multi-modal data for comprehensive fraud analysis.",
                "Apply deep learning for detecting complex fraud patterns.",
                "Calculate fraud probability and risk scores.",
                "Provide real-time transaction evaluation.",
                "Implement explainable AI (SHAP & LIME) techniques.",
                "Identify major factors influencing fraud predictions.",
                "Provide fraud monitoring executive dashboards.",
                "Generate automated fraud alerts & decision support.",
                "Export detailed investigation reports for financial analysts.",
                "Improve transparency and trust in AI-based banking security."
              ].map((obj, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                  <span className="text-slate-200 font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Support Matrix */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white">Fraud Risk Decision Matrix</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-center">
              <div className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 space-y-1">
                <div className="font-extrabold text-brand-emerald">LOW RISK (0-30)</div>
                <div className="font-bold text-white">ALLOW TRANSACTION</div>
                <p className="text-[10px] text-slate-400">Normal spending parameters within registered location.</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-amber/10 border border-brand-amber/30 space-y-1">
                <div className="font-extrabold text-brand-amber">MEDIUM RISK (31-60)</div>
                <div className="font-bold text-white">ADDITIONAL VERIFICATION</div>
                <p className="text-[10px] text-slate-400">Require 2FA or SMS OTP re-authentication.</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/30 space-y-1">
                <div className="font-extrabold text-brand-orange">HIGH RISK (61-80)</div>
                <div className="font-bold text-white">MANUAL REVIEW REQUIRED</div>
                <p className="text-[10px] text-slate-400">Flag for fraud analyst manual clearance.</p>
              </div>

              <div className="p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/30 space-y-1">
                <div className="font-extrabold text-brand-rose">CRITICAL RISK (81-100)</div>
                <div className="font-bold text-white">BLOCK TRANSACTION</div>
                <p className="text-[10px] text-slate-400">Auto-block payment & generate security alert.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
