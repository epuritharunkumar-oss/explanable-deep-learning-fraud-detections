import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { analyticsApi } from '../services/api';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, ShieldX, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FraudAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ critical: 0, high: 0, medium: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getAlerts();
      setAlerts(res.data.alerts || []);
      setSummary(res.data.summary || { critical: 0, high: 0, medium: 0, resolved: 0 });
    } catch (err) {
      console.error("Alerts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await analyticsApi.updateAlertStatus(alertId, newStatus);
      fetchAlerts();
    } catch (err) {
      console.error("Update alert status error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Fraud Alerts Management
            </h1>
            <p className="text-xs text-slate-400">
              Automated high-risk transaction alerts & analyst investigation workflow
            </p>
          </div>

          {/* Alert Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Critical Risk Alerts"
              value={summary.critical.toString()}
              subtext="Require Immediate Block"
              icon={ShieldAlert}
              color="rose"
            />
            <StatCard
              title="High Risk Alerts"
              value={summary.high.toString()}
              subtext="Manual Review Required"
              icon={AlertTriangle}
              color="orange"
            />
            <StatCard
              title="Medium Risk Alerts"
              value={summary.medium.toString()}
              subtext="Verification Pending"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Resolved Alerts"
              value={summary.resolved.toString()}
              subtext="Closed Investigations"
              icon={CheckCircle}
              color="emerald"
            />
          </div>

          {/* Alert Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              Active Security Alerts Log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Alert ID</th>
                    <th className="px-4 py-3">Txn ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">AI Trigger Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {alerts.map((alt) => {
                    const isCritical = alt.risk_score >= 80;
                    return (
                      <tr key={alt.id} className={`hover:bg-navy-800/40 transition-colors ${isCritical ? 'bg-brand-rose/5' : ''}`}>
                        <td className="px-4 py-3.5 font-bold font-mono text-brand-cyan">ALT-{alt.id}</td>
                        <td className="px-4 py-3.5 font-bold text-white font-mono">{alt.transaction_id}</td>
                        <td className="px-4 py-3.5 text-slate-300">{alt.customer_id || 'CUST4102'}</td>
                        <td className="px-4 py-3.5 font-bold text-white">₹{alt.amount ? Number(alt.amount).toLocaleString('en-IN') : '95,000'}</td>
                        <td className="px-4 py-3.5 font-extrabold text-brand-rose">{alt.risk_score}/100</td>
                        <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">{alt.reason}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            alt.status === 'Resolved' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30' :
                            alt.status === 'Investigating' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/30' :
                            'bg-brand-rose/15 text-brand-rose border-brand-rose/30 animate-pulse'
                          }`}>
                            {alt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/explainable-ai?id=${alt.transaction_id}`)}
                            className="px-2 py-1 rounded-lg bg-navy-800 text-brand-cyan hover:bg-brand-blue hover:text-white transition-colors"
                            title="XAI Rationale"
                          >
                            <Eye className="w-3.5 h-3.5 inline" />
                          </button>
                          {alt.status !== 'Resolved' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(alt.id, 'Investigating')}
                                className="px-2 py-1 rounded-lg bg-brand-amber/10 text-brand-amber hover:bg-brand-amber hover:text-navy-950 font-bold transition-colors"
                              >
                                Investigate
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(alt.id, 'Resolved')}
                                className="px-2 py-1 rounded-lg bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald hover:text-navy-950 font-bold transition-colors"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(alt.id, 'Blocked')}
                                className="px-2 py-1 rounded-lg bg-brand-rose/10 text-brand-rose hover:bg-brand-rose hover:text-white font-bold transition-colors"
                              >
                                Block
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
