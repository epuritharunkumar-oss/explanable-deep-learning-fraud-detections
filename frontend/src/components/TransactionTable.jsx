import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';

export default function TransactionTable({ transactions = [], onDelete }) {
  const navigate = useNavigate();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No transaction records found matching the current criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
          <tr>
            <th className="px-4 py-3">Txn ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Risk Level</th>
            <th className="px-4 py-3">Prediction</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {transactions.map((txn) => {
            const isFraud = txn.prediction === 'Fraudulent';
            let riskBadge = 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30';
            if (txn.risk_level === 'Critical') riskBadge = 'bg-brand-rose/20 text-brand-rose border-brand-rose/40 animate-pulse';
            else if (txn.risk_level === 'High') riskBadge = 'bg-brand-orange/15 text-brand-orange border-brand-orange/30';
            else if (txn.risk_level === 'Medium') riskBadge = 'bg-brand-amber/15 text-brand-amber border-brand-amber/30';

            return (
              <tr key={txn.transaction_id || txn.id} className="hover:bg-navy-800/40 transition-colors">
                <td className="px-4 py-3.5 font-bold text-white font-mono">{txn.transaction_id}</td>
                <td className="px-4 py-3.5 font-medium text-slate-300">{txn.customer_id}</td>
                <td className="px-4 py-3.5 text-slate-400">{txn.transaction_date} <span className="text-[10px] text-slate-500">{txn.transaction_time}</span></td>
                <td className="px-4 py-3.5 font-bold text-white">₹{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3.5 text-slate-300">{txn.transaction_type}</td>
                <td className="px-4 py-3.5 text-slate-300">{txn.city || 'India'} ({txn.distance_from_usual_location || 0} km)</td>
                <td className="px-4 py-3.5 font-extrabold text-white">{txn.risk_score}/100</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${riskBadge}`}>
                    {txn.risk_level}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`flex items-center gap-1 font-bold ${isFraud ? 'text-brand-rose' : 'text-brand-emerald'}`}>
                    {isFraud ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {txn.prediction}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/explainable-ai?id=${txn.transaction_id}`)}
                    className="p-1.5 rounded-lg bg-navy-800 text-brand-cyan hover:bg-brand-blue hover:text-white transition-colors"
                    title="View XAI Explanation"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(txn.transaction_id)}
                      className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:bg-brand-rose hover:text-white transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
