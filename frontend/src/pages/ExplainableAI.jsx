import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ExplanationChart from '../components/ExplanationChart';
import ModalityBreakdown from '../components/ModalityBreakdown';
import { transactionApi, genaiApi } from '../services/api';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  ShieldAlert, 
  ShieldCheck,
  Info,
  FileText
} from 'lucide-react';

export default function ExplainableAI() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'TXN1002';
  const [searchId, setSearchId] = useState(initialId);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [genAiAnalysis, setGenAiAnalysis] = useState(null);
  const [genAiLoading, setGenAiLoading] = useState(false);

  const fetchXaiData = async (txnId) => {
    setLoading(true);
    setError(null);
    setGenAiAnalysis(null);
    try {
      const res = await transactionApi.getTransactionById(txnId);
      setData(res.data);
    } catch (err) {
      console.error("XAI fetch error:", err);
      setError(`Transaction record "${txnId}" not found in database. Please enter a valid Transaction ID from the Transactions Log.`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGenAiAudit = async () => {
    if (!data) return;
    setGenAiLoading(true);
    try {
      const res = await genaiApi.explainTransaction({
        transaction: data,
        ml_result: {
          prediction: data.prediction,
          risk_score: data.risk_score,
          risk_level: data.risk_level
        }
      });
      setGenAiAnalysis(res.data.analysis);
    } catch (err) {
      console.error("GenAI Audit error:", err);
    } finally {
      setGenAiLoading(false);
    }
  };

  useEffect(() => {
    fetchXaiData(initialId);
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId) fetchXaiData(searchId);
  };

  const xai = data?.explainability || {};
  const topFraud = xai.factors?.filter(f => f.direction === 'fraud') || [];
  const topLegit = xai.factors?.filter(f => f.direction === 'legitimate') || [];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header & Transaction Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <BrainCircuit className="w-7 h-7 text-brand-cyan" />
                Explainable Artificial Intelligence (XAI) Engine
              </h1>
              <p className="text-xs text-slate-400">
                SHAP feature contribution values, kernel surrogate models & dynamic decision rationale
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Transaction ID (e.g. TXN1002)"
                  className="bg-navy-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-blue"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Inspect
              </button>
            </form>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-brand-rose/40 bg-brand-rose/10 text-brand-rose text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transaction Metadata Header */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${data?.prediction === 'Fraudulent' ? 'bg-brand-rose/10 text-brand-rose' : 'bg-brand-emerald/10 text-brand-emerald'}`}>
                {data?.prediction === 'Fraudulent' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">Active Record ID</div>
                <div className="text-xl font-bold text-white font-mono">{data?.transaction_id || 'TXN1002'}</div>
              </div>
            </div>

            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-slate-400 block">Prediction:</span>
                <span className={`font-bold ${data?.prediction === 'Fraudulent' ? 'text-brand-rose' : 'text-brand-emerald'}`}>{data?.prediction}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Risk Score:</span>
                <span className="font-extrabold text-white">{data?.risk_score}/100</span>
              </div>
              <div>
                <span className="text-slate-400 block">Amount:</span>
                <span className="font-bold text-brand-cyan">₹{data?.amount ? Number(data.amount).toLocaleString('en-IN') : '95,000'}</span>
              </div>
            </div>
          </div>

          {/* Section: Why Did the AI Flag This Transaction? */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Why Did the AI Flag This Transaction?</h2>
              <p className="text-xs text-slate-400">SHAP (SHapley Additive exPlanations) attribution vector breakdown</p>
            </div>

            <ExplanationChart factors={xai.factors} />
          </div>

          {/* Side-by-Side: Top Fraud Factors vs Top Legitimate Factors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Fraud Factors */}
            <div className="glass-panel p-5 rounded-2xl border border-brand-rose/30 bg-brand-rose/5 space-y-3">
              <h3 className="text-sm font-bold text-brand-rose flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Top Fraud Factors (Positive Push)
              </h3>
              <div className="space-y-2 text-xs">
                {topFraud.length > 0 ? (
                  topFraud.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">{f.feature}</span>
                        <span className="text-[11px] text-slate-400">{f.description}</span>
                      </div>
                      <span className="font-bold text-brand-rose text-sm">+{Math.round(f.impact * 100)}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs py-2">No significant positive fraud factors detected.</div>
                )}
              </div>
            </div>

            {/* Top Legitimate Factors */}
            <div className="glass-panel p-5 rounded-2xl border border-brand-emerald/30 bg-brand-emerald/5 space-y-3">
              <h3 className="text-sm font-bold text-brand-emerald flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" /> Top Legitimate Factors (Negative Mitigators)
              </h3>
              <div className="space-y-2 text-xs">
                {topLegit.length > 0 ? (
                  topLegit.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">{f.feature}</span>
                        <span className="text-[11px] text-slate-400">{f.description}</span>
                      </div>
                      <span className="font-bold text-brand-emerald text-sm">-{Math.round(Math.abs(f.impact) * 100)}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs py-2">No significant legitimate mitigating factors detected.</div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Natural Language Explanation */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <h2 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Decision Engine Rationale
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{xai.narrative_explanation || "No explanation summary generated."}"
            </p>
          </div>

          {/* GenAI Forensic Audit Card */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-cyan/30 bg-navy-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">GenAI Deep Forensic Investigation</h3>
                  <p className="text-[11px] text-slate-400">LLM-powered threat pattern identification, evidence chain & mitigation checklist</p>
                </div>
              </div>

              <button
                onClick={handleGenerateGenAiAudit}
                disabled={genAiLoading || !data}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-purple-600 text-white font-bold text-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${genAiLoading ? 'animate-spin' : ''}`} />
                <span>{genAiLoading ? 'Synthesizing Forensic Audit...' : 'Generate GenAI Audit'}</span>
              </button>
            </div>

            {genAiAnalysis ? (
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                {genAiAnalysis}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Click <span className="text-brand-cyan font-bold">"Generate GenAI Audit"</span> to formulate an executive forensic investigation report for this transaction.
              </div>
            )}
          </div>

          {/* Section: Multi-Modal Fraud Analysis */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">Multi-Modal Fraud Analysis Decomposition</h2>
            <ModalityBreakdown modalityData={xai.modality_breakdown} />
          </div>
        </main>
      </div>
    </div>
  );
}
