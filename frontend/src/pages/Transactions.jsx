import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TransactionTable from '../components/TransactionTable';
import { transactionApi, reportApi } from '../services/api';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [txType, setTxType] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getTransactions({
        search,
        risk_level: riskLevel,
        type: txType,
        prediction: predictionFilter
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, riskLevel, txType, predictionFilter]);

  const handleDelete = async (id) => {
    try {
      await transactionApi.deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

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
                Transaction History Log
              </h1>
              <p className="text-xs text-slate-400">
                Searchable repository of evaluated multi-modal financial transactions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:bg-navy-800 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
              <button
                onClick={() => window.location.href = reportApi.getExportUrl()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-emerald text-navy-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, Customer, Merchant..."
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk (0-30)</option>
              <option value="Medium">Medium Risk (31-60)</option>
              <option value="High">High Risk (61-80)</option>
              <option value="Critical">Critical Risk (81-100)</option>
            </select>

            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="">All Payment Types</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="ATM Withdrawal">ATM Withdrawal</option>
              <option value="POS Payment">POS Payment</option>
            </select>

            <select
              value={predictionFilter}
              onChange={(e) => setPredictionFilter(e.target.value)}
              className="bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="">All Predictions</option>
              <option value="Legitimate">Legitimate Only</option>
              <option value="Fraudulent">Fraudulent Only</option>
            </select>
          </div>

          {/* Table View */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <TransactionTable transactions={transactions} onDelete={handleDelete} />
          </div>
        </main>
      </div>
    </div>
  );
}
