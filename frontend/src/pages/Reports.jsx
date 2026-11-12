import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { reportApi } from '../services/api';
import { FileText, Download, Printer, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await reportApi.getReports({ type: reportType });
        setData(res.data);
      } catch (err) {
        console.error("Report fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportType]);

  const handleExportCsv = () => {
    window.location.href = reportApi.getExportUrl();
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-7 h-7 text-brand-blue" />
                Executive Fraud Intelligence Reports
              </h1>
              <p className="text-xs text-slate-400">
                Automated statistical summaries, top risk indicators & actionable financial recommendations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-emerald text-navy-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </button>
            </div>
          </div>

          {/* Report Type Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-panel border border-slate-800 text-xs font-bold">
            {[
              { id: 'daily', label: 'Daily Fraud Report' },
              { id: 'weekly', label: 'Weekly Summary' },
              { id: 'monthly', label: 'Monthly Executive Report' },
              { id: 'investigation', label: 'Transaction Investigation' },
              { id: 'customer_risk', label: 'Customer Risk Profile' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  reportType === tab.id
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Report Document Box */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-white">{data?.report_type ?? 'DAILY FRAUD ANALYSIS REPORT'}</h2>
                <p className="text-xs text-slate-400 mt-1">Generated at: {data?.generated_at ?? 'Loading...'} | System Version: v2.4-DeepXAI</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-cyan border border-brand-cyan/30 text-xs font-mono font-bold">
                CONFIDENTIAL — BANKING AUDIT
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Total Transactions</div>
                <div className="text-2xl font-black text-white mt-1">{data?.metrics?.total_transactions ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Fraudulent Txns</div>
                <div className="text-2xl font-black text-brand-rose mt-1">{data?.metrics?.fraud_transactions ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Legitimate Txns</div>
                <div className="text-2xl font-black text-brand-emerald mt-1">{data?.metrics?.legitimate_transactions ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Fraud Ratio</div>
                <div className="text-2xl font-black text-brand-amber mt-1">{data?.metrics?.fraud_percentage ?? '0.0%'}</div>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Total Fraud Amount</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{data?.metrics?.fraud_amount_detected ?? '₹0.00'}</div>
              </div>
            </div>

            {/* No Data Message */}
            {data?.metrics?.total_transactions === 0 && (
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center text-sm text-slate-400">
                No transactions found for this period.
              </div>
            )}

            {/* Top Fraud Factors */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Most Dominant Fraud Factors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {(data?.top_fraud_factors || []).map((tf, i) => (
                  <div key={i} className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">{tf.factor}</span>
                    <span className="font-bold text-brand-rose">{tf.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/30 space-y-3">
              <h3 className="text-sm font-bold text-brand-cyan flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Analyst Executive Recommendations
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                {(data?.recommendations || []).map((rec, i) => (
                  <li key={i} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
