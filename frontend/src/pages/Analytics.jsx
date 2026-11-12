import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { analyticsApi } from '../services/api';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  Smartphone, 
  ShoppingBag, 
  UserX
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsApi.getAnalytics({ range: timeRange });
        setData(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };
    loadAnalytics();
  }, [timeRange]);

  const byTypeData = data?.by_type || [
    { transaction_type: 'UPI', fraud_count: 142, total: 4200 },
    { transaction_type: 'Credit Card', fraud_count: 98, total: 2100 },
    { transaction_type: 'Bank Transfer', fraud_count: 64, total: 1500 },
    { transaction_type: 'ATM Cash', fraud_count: 32, total: 800 },
    { transaction_type: 'POS Payment', fraud_count: 22, total: 3850 },
  ];

  const byDeviceData = data?.by_device || [
    { device_type: 'Mobile', fraud_count: 180, color: '#2563EB' },
    { device_type: 'Desktop', fraud_count: 110, color: '#06B6D4' },
    { device_type: 'ATM', fraud_count: 45, color: '#F59E0B' },
    { device_type: 'POS', fraud_count: 23, color: '#10B981' },
  ];

  const topCustomers = data?.top_high_risk_customers || [
    { customer_id: 'CUST4102', total_txns: 14, fraud_txns: 8, avg_risk_score: 94.2, total_spent: 345000 },
    { customer_id: 'CUST9012', total_txns: 9, fraud_txns: 5, avg_risk_score: 88.5, total_spent: 280000 },
    { customer_id: 'CUST1190', total_txns: 11, fraud_txns: 6, avg_risk_score: 86.0, total_spent: 189000 },
    { customer_id: 'CUST7721', total_txns: 6, fraud_txns: 3, avg_risk_score: 74.0, total_spent: 98000 },
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
                Comprehensive Fraud Analytics
              </h1>
              <p className="text-xs text-slate-400">
                Multi-dimensional trend analysis, risk distribution & spatial parameters
              </p>
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-navy-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-blue"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          {/* Grid 1: Fraud by Payment Type & Device Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-blue" /> Fraud Count by Transaction Type
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#172A54" />
                    <XAxis dataKey="transaction_type" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A1329', borderColor: '#172A54', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="fraud_count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Fraudulent Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-cyan" /> Fraud Distribution by Device Type
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byDeviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="fraud_count"
                      nameKey="device_type"
                      label={({ device_type, percent }) => `${device_type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byDeviceData.map((entry, index) => (
                        <Cell key={`dev-${index}`} fill={entry.color || '#2563EB'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0A1329', borderColor: '#172A54', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top High-Risk Customers Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-brand-rose" /> Top High-Risk Flagged Customers
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Total Txns</th>
                    <th className="px-4 py-3">Fraud Txns</th>
                    <th className="px-4 py-3">Avg Risk Score</th>
                    <th className="px-4 py-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topCustomers.map((cust) => (
                    <tr key={cust.customer_id} className="hover:bg-navy-800/40">
                      <td className="px-4 py-3 font-bold text-white font-mono">{cust.customer_id}</td>
                      <td className="px-4 py-3 text-slate-300">{cust.total_txns}</td>
                      <td className="px-4 py-3 font-bold text-brand-rose">{cust.fraud_txns}</td>
                      <td className="px-4 py-3 font-extrabold text-brand-orange">{Number(cust.avg_risk_score).toFixed(1)}/100</td>
                      <td className="px-4 py-3 font-bold text-white">₹{Number(cust.total_spent).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
