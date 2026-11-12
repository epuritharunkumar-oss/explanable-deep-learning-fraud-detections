import React from 'react';

export default function RiskGauge({ score = 0, probability = '0%', riskLevel = 'Low' }) {
  // Gauge angle calculation (180 degrees arc)
  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'stroke-brand-emerald text-brand-emerald';
  let badgeBg = 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald';

  if (score >= 81) {
    colorClass = 'stroke-brand-rose text-brand-rose';
    badgeBg = 'bg-brand-rose/10 border-brand-rose/30 text-brand-rose';
  } else if (score >= 61) {
    colorClass = 'stroke-brand-orange text-brand-orange';
    badgeBg = 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange';
  } else if (score >= 31) {
    colorClass = 'stroke-brand-amber text-brand-amber';
    badgeBg = 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-28 flex items-end justify-center">
        <svg className="w-48 h-48 -rotate-90 transform overflow-visible" viewBox="0 0 160 160">
          {/* Background Arc */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#172A54"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Active Fill Arc */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            className={colorClass}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>

        <div className="absolute text-center -bottom-1">
          <div className="text-3xl font-black text-white tracking-tight">{score}<span className="text-xs text-slate-400 font-semibold">/100</span></div>
          <div className="text-[11px] font-medium text-slate-400">Fraud Score ({probability})</div>
        </div>
      </div>

      <div className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase ${badgeBg}`}>
        {riskLevel} Risk
      </div>
    </div>
  );
}
