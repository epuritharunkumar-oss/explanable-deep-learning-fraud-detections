import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Layers, 
  Activity, 
  AlertTriangle, 
  PieChart, 
  FileText, 
  ArrowRight,
  Database,
  Cpu,
  Smartphone,
  MapPin,
  Clock,
  Lock,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-brand-blue/20 to-brand-cyan/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Academic Project
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Explainable AI-Powered <br />
            <span className="bg-gradient-to-r from-brand-blue via-brand-cyan to-purple-400 bg-clip-text text-transparent">
              Financial Fraud Detection
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Detect suspicious financial transactions using deep learning and multi-modal data while understanding exactly why the AI identified a transaction as fraudulent.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/analyze"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold shadow-xl shadow-brand-blue/25 hover:scale-105 transition-all text-sm"
            >
              Analyze Fraud
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel text-slate-200 font-bold border border-slate-700 hover:bg-navy-800 transition-all text-sm"
            >
              Explore System
            </Link>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-brand-cyan">98%+</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Detection Accuracy</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-brand-emerald">Real-Time</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Fraud Monitoring</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-brand-amber">Multi-Modal</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Data Analysis</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-purple-400">XAI</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Explainable Predictions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-navy-900/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">System Capabilities</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Advanced deep learning combined with SHAP/LIME explainability for comprehensive banking fraud analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Fraud Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze transactions and immediately calculate fraud probability within milliseconds.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Modal Data Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Combine transaction, behavioural, device, geographical, temporal and merchant information.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Deep Learning Prediction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use neural-network based models for complex fraud pattern identification.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-amber/10 text-brand-amber flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable AI (XAI)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use SHAP/LIME explanations to show which features influenced predictions.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-rose/10 text-brand-rose flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fraud Risk Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Categorize transactions into Low, Medium, High and Critical risk bands.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Display fraud trends using dynamic interactive graphs and custom filter views.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fraud Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate real-time alerts and decision support for high-risk suspicious transactions.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Report Generation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate detailed fraud analysis reports with CSV export capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section id="workflow" className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">System Architecture & Workflow</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              From multi-modal data ingestion to deep learning probability scoring and SHAP explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-center">
            {[
              { step: '1', title: 'Data Collection', icon: Database },
              { step: '2', title: 'Multi-Modal Extraction', icon: Layers },
              { step: '3', title: 'Preprocessing', icon: Cpu },
              { step: '4', title: 'Deep Learning Model', icon: BrainCircuit },
              { step: '5', title: 'Probability Calculation', icon: Activity },
              { step: '6', title: 'XAI SHAP Analysis', icon: Sparkles },
              { step: '7', title: 'Fraud Alert & Decision', icon: AlertTriangle },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={st.step} className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-between space-y-2">
                  <div className="w-7 h-7 rounded-full bg-brand-blue/20 text-brand-cyan font-bold text-xs flex items-center justify-center">
                    {st.step}
                  </div>
                  <Icon className="w-5 h-5 text-slate-200" />
                  <p className="text-[11px] font-semibold text-slate-300 leading-tight">{st.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div>
            <div className="font-bold text-white text-base">FraudShield AI</div>
            <p className="mt-1">Explainable Deep Learning Financial Fraud Prediction System</p>
          </div>
          <div className="flex gap-6 font-medium">
            <Link to="/about" className="hover:text-white transition-colors">About Project</Link>
            <Link to="/analyze" className="hover:text-white transition-colors">Analyze Fraud</Link>
            <Link to="/model-info" className="hover:text-white transition-colors">Model Details</Link>
          </div>
          <div className="text-right text-[11px]">
            Academic Project — Explainable Deep Learning for Financial Fraud Prediction Using Multi-Modal Data.
          </div>
        </div>
      </footer>
    </div>
  );
}
