import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function Loader({ text = "Analyzing transaction..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-brand-blue/20 border-t-brand-cyan animate-spin"></div>
        <BrainCircuit className="w-7 h-7 text-brand-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-sm font-semibold text-slate-300 tracking-wide">{text}</p>
      <p className="text-xs text-slate-500">Extracting multi-modal features & running SHAP/LIME inference...</p>
    </div>
  );
}
