import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import RiskGauge from '../components/RiskGauge';
import ExplanationChart from '../components/ExplanationChart';
import ModalityBreakdown from '../components/ModalityBreakdown';
import { genaiApi } from '../services/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  BrainCircuit, 
  ArrowLeft, 
  CheckCircle2, 
  AlertOctagon, 
  Cpu, 
  Sparkles,
  ExternalLink,
  FileText,
  Copy,
  Download,
  X,
  Bot
} from 'lucide-react';

export default function PredictionResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const inputData = location.state?.inputData || {};
  const result = location.state?.result || {
    transaction_id: 'TXN1002',
    customer_id: 'CUST4102',
    amount: 95000.0,
    prediction: 'Fraudulent',
    fraud_probability: 0.947,
    fraud_percentage: '94.7%',
    risk_score: 94,
    risk_level: 'Critical',
    recommendation: 'BLOCK TRANSACTION',
    confidence_score: '96.8%',
    model_version: 'RandomForest-Trained-v1.0',
    explainability: {
      narrative_explanation: 'This transaction was classified as 94% risk (CRITICAL) primarily because of multiple anomalous indicators: Unusually high transaction amount (₹95,000.00). Transaction recorded 850 km away from customer\'s usual location. Transaction attempted from a previously unseen device.',
      factors: [
        { feature: 'Transaction Amount', impact: 0.32, direction: 'fraud', description: 'Unusually high transaction amount (₹95,000.00)' },
        { feature: 'New Device Used', impact: 0.21, direction: 'fraud', description: 'Transaction attempted from a previously unseen device' },
        { feature: 'Location Distance', impact: 0.18, direction: 'fraud', description: 'Transaction recorded 850 km away from customer\'s usual location' },
        { feature: 'Transaction Velocity (1h)', impact: 0.14, direction: 'fraud', description: 'High burst velocity: 8 transactions in the last hour' },
        { feature: 'Failed Login Attempts', impact: 0.09, direction: 'fraud', description: '4 failed login attempt(s) prior to transaction' },
        { feature: 'Account Maturity', impact: -0.04, direction: 'legitimate', description: 'Recent account creation (less than 6 months old)' }
      ],
      modality_breakdown: {
        transaction_risk: 22,
        behaviour_risk: 18,
        device_risk: 23,
        location_risk: 20,
        temporal_security_risk: 17,
        overall_fraud_risk: 94
      }
    }
  };

  const isFraud = result.prediction === 'Fraudulent';

  // GenAI Modal States
  const [modalType, setModalType] = useState(null); // 'forensic' | 'sar' | null
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenForensicAudit = async () => {
    setModalType('forensic');
    setModalTitle('GenAI Forensic Investigation Audit');
    setModalLoading(true);
    setCopied(false);
    try {
      const res = await genaiApi.explainTransaction({
        transaction: { ...inputData, transaction_id: result.transaction_id, amount: result.amount },
        ml_result: result
      });
      setModalContent(res.data.analysis);
    } catch (err) {
      console.error("Forensic analysis error:", err);
      setModalContent("Failed to generate GenAI forensic audit. Please verify the backend is running.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenSarReport = async () => {
    setModalType('sar');
    setModalTitle('Suspicious Activity Report — Demonstration');
    setModalLoading(true);
    setCopied(false);
    try {
      const res = await genaiApi.generateSar({
        transaction: { ...inputData, transaction_id: result.transaction_id, amount: result.amount },
        ml_result: result
      });
      setModalContent(res.data.sar_document);
    } catch (err) {
      console.error("SAR generation error:", err);
      setModalContent("Failed to formulate SAR report. Please verify the backend is running.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(modalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = modalType === 'sar' ? `SAR_${result.transaction_id}.txt` : `Forensic_Audit_${result.transaction_id}.md`;
    const blob = new Blob([modalContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  let actionBadgeBg = 'bg-brand-rose/20 text-brand-rose border-brand-rose/40';
  if (result.risk_level === 'High') actionBadgeBg = 'bg-brand-orange/20 text-brand-orange border-brand-orange/40';
  else if (result.risk_level === 'Medium') actionBadgeBg = 'bg-brand-amber/20 text-brand-amber border-brand-amber/40';
  else if (result.risk_level === 'Low') actionBadgeBg = 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40';

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/analyze')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Analyze Form
              </button>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Fraud Detection Result — <span className="font-mono text-brand-cyan">{result.transaction_id}</span>
              </h1>
            </div>

            {/* GenAI Actions & Deep Dive */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenForensicAudit}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>GenAI Forensic Audit</span>
              </button>

              <button
                onClick={handleOpenSarReport}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-teal-600 text-white font-bold text-xs shadow-lg shadow-brand-blue/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Demonstration Report</span>
              </button>

              <Link
                to={`/explainable-ai?id=${result.transaction_id}`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-slate-700 text-slate-200 hover:text-white font-bold text-xs hover:bg-navy-800 transition-all"
              >
                <BrainCircuit className="w-4 h-4 text-brand-cyan" />
                <span>SHAP Details</span>
              </Link>
            </div>
          </div>

          {/* Main Prediction Banner Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left: Prediction Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3.5 rounded-2xl border ${isFraud ? 'bg-brand-rose/10 border-brand-rose/30 text-brand-rose' : 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald'}`}>
                  {isFraud ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Prediction Verdict</div>
                  <div className={`text-3xl font-black tracking-tight ${isFraud ? 'text-brand-rose' : 'text-brand-emerald'}`}>
                    {result.prediction.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-xs font-semibold text-slate-300">Recommended Action</div>
                <div className={`px-4 py-2 rounded-xl border font-bold text-xs tracking-wide uppercase inline-block ${actionBadgeBg}`}>
                  {result.recommendation}
                </div>
              </div>
            </div>

            {/* Middle: Gauge */}
            <div className="border-y lg:border-y-0 lg:border-x border-slate-800/80 py-4 lg:py-0">
              <RiskGauge
                score={result.risk_score}
                probability={result.fraud_percentage}
                riskLevel={result.risk_level}
              />
            </div>

            {/* Right: Metadata Stats */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono font-bold text-white">{result.transaction_id}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Amount</span>
                <span className="font-bold text-brand-cyan">₹{result.amount ? Number(result.amount).toLocaleString('en-IN') : '0.00'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Model Confidence</span>
                <span className="font-bold text-white">{result.confidence_score}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Trained Engine</span>
                <span className="font-mono text-slate-300 text-[11px]">{result.model_version || 'RandomForest-Trained-v1.0'}</span>
              </div>
            </div>
          </div>

          {/* Natural Language Explanation Box */}
          {result.explainability?.narrative_explanation && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 space-y-2">
              <div className="flex items-center gap-2 text-brand-cyan font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" /> Decision Engine Narrative
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{result.explainability.narrative_explanation}"
              </p>
            </div>
          )}

          {/* Multi-Modal Fraud Analysis Cards */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-white">Multi-Modal Risk Modality Decomposition</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Shows how different transaction information categories influence the overall risk assessment.
              </p>
            </div>
            <ModalityBreakdown modalityData={result.explainability?.modality_breakdown} />
          </div>

          {/* SHAP Feature Contribution Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center justify-between">
                <span>Feature Contribution Analysis</span>
                <span className="text-xs font-normal text-slate-400">Tree Split Impurity Attribution Values</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Positive values indicate factors that increase risk, while negative values indicate factors that reduce risk.
              </p>
            </div>
            <ExplanationChart factors={result.explainability?.factors} />
          </div>
        </main>
      </div>

      {/* GenAI Modal Window */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl glass-panel bg-navy-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-navy-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{modalTitle}</h3>
                  <p className="text-[11px] text-slate-400">Generated for `{result.transaction_id}`</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-navy-950/40">
              {modalLoading ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <Sparkles className="w-8 h-8 mx-auto text-brand-cyan animate-spin" />
                  <p>Synthesizing GenAI Forensic Document...</p>
                </div>
              ) : (
                modalContent
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
