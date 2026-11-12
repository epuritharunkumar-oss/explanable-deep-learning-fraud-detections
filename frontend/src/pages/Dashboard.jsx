import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import { analyticsApi } from '../services/api';
import { 
  Receipt, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real transaction metrics from database
  const totalTxns = stats?.total_transactions ?? 0;
  const fraudTxns = stats?.fraudulent_transactions ?? 0;
  const legitTxns = stats?.legitimate_transactions ?? 0;
  const fraudRate = stats?.fraud_rate ?? '0.0%';
  const highRisk = stats?.high_risk_transactions ?? 0;
  const fraudAmount = stats?.formatted_fraud_amount ?? '₹0.00';

  // Real Fraud by Transaction Type from SQLite transactions
  const typeData = stats?.fraud_by_type?.length > 0 
    ? stats.fraud_by_type 
    : [
        { type: 'UPI', count: 0 },
        { type: 'Credit Card', count: 0 },
        { type: 'Bank Transfer', count: 0 },
        { type: 'ATM Cash', count: 0 },
        { type: 'POS Payment', count: 0 },
      ];

  // Real Risk Level Distribution from SQLite transactions
  const dist = stats?.risk_distribution || {};
  const riskLevelData = [
    { name: 'Low Risk', value: dist['Low'] || dist['Low Risk'] || 0, color: '#10B981' },
    { name: 'Medium Risk', value: dist['Medium'] || dist['Medium Risk'] || 0, color: '#F59E0B' },
    { name: 'High Risk', value: dist['High'] || dist['High Risk'] || 0, color: '#F97316' },
    { name: 'Critical Risk', value: dist['Critical'] || dist['Critical Risk'] || 0, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Financial Fraud Monitoring Dashboard
              </h1>
              <p className="text-xs text-slate-400">
                Real-time multi-modal transaction stream & deep learning explainability metrics
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:bg-navy-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Transactions"
              value={totalTxns.toLocaleString()}
              subtext="Processed"
              icon={Receipt}
              color="blue"
            />
            <StatCard
              title="Fraudulent Txns"
              value={fraudTxns.toLocaleString()}
              subtext="Flagged by ML"
              icon={ShieldAlert}
              color="rose"
            />
            <StatCard
              title="Legitimate Txns"
              value={legitTxns.toLocaleString()}
              subtext="Verified"
              icon={ShieldCheck}
              color="emerald"
            />
            <StatCard
              title="Fraud Rate"
              value={fraudRate}
              subtext="Of total volume"
              icon={TrendingUp}
              color="amber"
            />
            <StatCard
              title="High Risk Txns"
              value={highRisk.toLocaleString()}
              subtext="Require Review"
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Fraud Amount"
              value={fraudAmount}
              subtext="Prevented Loss"
              icon={IndianRupee}
              color="purple"
            />
          </div>

          {/* Visual Analytics Grid - Rearranged & Resized Cleanly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fraud by Transaction Type */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Fraud by Transaction Type</h2>
                <span className="text-[11px] text-slate-400">Payment Modality Breakdown</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172A54" />
                    <XAxis dataKey="type" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A1329', borderColor: '#172A54', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Fraud Instances" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-white">Risk Level Distribution</h2>
                <span className="text-[11px] text-slate-400">Calibrated Risk Tiers</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskLevelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskLevelData.map((entry, index) => (
                        <Cell key={`risk-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0A1329', borderColor: '#172A54', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Real Metric Legend Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                {riskLevelData.map((r) => (
                  <div key={r.name} className="px-2.5 py-1.5 rounded-xl bg-navy-900/90 border border-slate-800">
                    <div className="font-bold text-white text-xs">{r.value.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></span>
                      <span>{r.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions Table Section */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Recent Transactions Stream</h2>
                <p className="text-xs text-slate-400">Live multi-modal transaction stream evaluated by SHAP Explainable AI</p>
              </div>
            </div>
            <TransactionTable transactions={stats?.recent_transactions} />
          </div>
        </main>
      </div>
    </div>
  );
}
