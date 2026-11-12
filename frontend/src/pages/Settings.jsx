import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Settings as SettingsIcon, Sliders, Bell, Shield, Save } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    criticalThreshold: 80,
    highThreshold: 60,
    mediumThreshold: 30,
    autoBlockCritical: true,
    emailAlerts: true,
    shapKernelSamples: 100
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Fraud Detection Threshold & System Settings
            </h1>
            <p className="text-xs text-slate-400">
              Configure risk classification boundaries, automated block rules & SHAP XAI parameters
            </p>
          </div>

          {saved && (
            <div className="p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-bold">
              Settings updated successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-cyan" /> Risk Score Threshold Boundaries
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Critical Risk Cutoff (&gt;=)</label>
                  <input
                    type="number"
                    value={config.criticalThreshold}
                    onChange={(e) => setConfig({ ...config, criticalThreshold: parseInt(e.target.value) })}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">High Risk Cutoff (&gt;=)</label>
                  <input
                    type="number"
                    value={config.highThreshold}
                    onChange={(e) => setConfig({ ...config, highThreshold: parseInt(e.target.value) })}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Medium Risk Cutoff (&gt;=)</label>
                  <input
                    type="number"
                    value={config.mediumThreshold}
                    onChange={(e) => setConfig({ ...config, mediumThreshold: parseInt(e.target.value) })}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-rose" /> Automated Security Triggers
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoBlockCritical}
                    onChange={(e) => setConfig({ ...config, autoBlockCritical: e.target.checked })}
                    className="rounded bg-navy-950 border-slate-800 text-brand-blue"
                  />
                  <span>Automatically block transactions triggering Critical Risk (&gt;= 81)</span>
                </label>

                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.emailAlerts}
                    onChange={(e) => setConfig({ ...config, emailAlerts: e.target.checked })}
                    className="rounded bg-navy-950 border-slate-800 text-brand-blue"
                  />
                  <span>Dispatch instant email notifications to fraud analysts upon High/Critical alerts</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
