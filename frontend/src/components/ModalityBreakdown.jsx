import React from 'react';
import { DollarSign, UserCheck, Smartphone, MapPin, Clock, Info } from 'lucide-react';

export default function ModalityBreakdown({ modalityData }) {
  if (!modalityData) return null;

  const modalities = [
    { title: 'Transaction Modality', key: 'transaction_risk', icon: DollarSign, sub: 'Amount, Merchant & Category' },
    { title: 'Behavioural Modality', key: 'behaviour_risk', icon: UserCheck, sub: 'Spending History & Frequency' },
    { title: 'Device Modality', key: 'device_risk', icon: Smartphone, sub: 'Device ID, OS & VPN Detection' },
    { title: 'Location Modality', key: 'location_risk', icon: MapPin, sub: 'Coordinates & Distance Anomaly' },
    { title: 'Temporal & Security', key: 'temporal_security_risk', icon: Clock, sub: 'Velocity & Failed Login Count' },
  ];

  // Extract raw scores from modalityData
  const rawScores = modalities.map((item) => {
    const val = Number(modalityData[item.key]);
    return !isNaN(val) && val >= 0 ? val : 15;
  });

  const totalRaw = rawScores.reduce((acc, v) => acc + v, 0);

  // Normalize scores so the five modality contributions ALWAYS sum to exactly 100%
  let normalizedScores;
  if (totalRaw === 0) {
    normalizedScores = [20, 20, 20, 20, 20];
  } else {
    // Largest Remainder Method (Hamilton-Hare method)
    const exactShares = rawScores.map((score) => (score / totalRaw) * 100);
    const floors = exactShares.map(Math.floor);
    const remainders = exactShares.map((val, idx) => ({ idx, rem: val - floors[idx] }));
    remainders.sort((a, b) => b.rem - a.rem);

    let deficit = 100 - floors.reduce((acc, v) => acc + v, 0);
    for (let i = 0; i < deficit; i++) {
      floors[remainders[i].idx] += 1;
    }
    normalizedScores = floors;
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {modalities.map((item, idx) => {
          const score = normalizedScores[idx];
          const Icon = item.icon;

          let badgeColor = 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30';
          if (score >= 80) badgeColor = 'bg-brand-rose/10 text-brand-rose border-brand-rose/30';
          else if (score >= 60) badgeColor = 'bg-brand-orange/10 text-brand-orange border-brand-orange/30';
          else if (score >= 35) badgeColor = 'bg-brand-amber/10 text-brand-amber border-brand-amber/30';

          return (
            <div key={item.title} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-navy-800 text-brand-cyan">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${badgeColor}`}>
                  {score}% Contribution
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">{item.title}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{item.sub}</p>
              </div>

              <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    score >= 80 ? 'bg-brand-rose' : score >= 60 ? 'bg-brand-orange' : score >= 35 ? 'bg-brand-amber' : 'bg-brand-emerald'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
        <Info className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
        <span>Modality Contribution shows the relative influence of each information category on the model's decision. It is not the probability of fraud.</span>
      </p>
    </div>
  );
}
