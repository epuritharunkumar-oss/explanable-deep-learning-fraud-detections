import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: 'border-brand-blue/30 text-brand-blue bg-brand-blue/10',
    rose: 'border-brand-rose/30 text-brand-rose bg-brand-rose/10',
    emerald: 'border-brand-emerald/30 text-brand-emerald bg-brand-emerald/10',
    amber: 'border-brand-amber/30 text-brand-amber bg-brand-amber/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between glass-panel-hover">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
        {subtext && (
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            {trend && <span className={trend.startsWith('+') ? 'text-brand-rose' : 'text-brand-emerald'}>{trend}</span>}
            <span>{subtext}</span>
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
