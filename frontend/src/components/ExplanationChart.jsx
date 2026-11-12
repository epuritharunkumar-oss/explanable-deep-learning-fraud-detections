import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ExplanationChart({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return <div className="text-xs text-slate-400 p-4">No explanation factors available.</div>;
  }

  return (
    <div className="space-y-3">
      {factors.map((item, idx) => {
        const isFraud = item.direction === 'fraud';
        const absImpact = Math.abs(item.impact);
        const percentage = Math.round(absImpact * 100);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                {isFraud ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-rose" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-brand-emerald" />
                )}
                {item.feature}
              </span>
              <span className={`font-bold ${isFraud ? 'text-brand-rose' : 'text-brand-emerald'}`}>
                {isFraud ? `+${percentage}%` : `-${percentage}%`}
              </span>
            </div>

            <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isFraud ? 'bg-gradient-to-r from-brand-orange to-brand-rose' : 'bg-gradient-to-r from-emerald-600 to-brand-emerald'
                }`}
                style={{ width: `${Math.min(100, percentage * 2.5)}%` }}
              ></div>
            </div>

            {item.description && (
              <p className="text-[11px] text-slate-400 leading-tight">{item.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
