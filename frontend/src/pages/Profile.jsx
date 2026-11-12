import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import { User, Mail, Phone, ShieldCheck, Key, Save } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'Tharun Prakash',
    email: 'tharun@fraudshield.ai',
    phone: '+91 98765 43210',
    role: 'Fraud Analyst',
    created_at: '2026-01-15'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getProfile();
        if (res.data?.user) setUser(res.data.user);
      } catch (err) {
        console.error("Profile error:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              User Profile & Credentials
            </h1>
            <p className="text-xs text-slate-400">
              Analyst account preferences & security authorization role
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {user.name ? user.name[0] : 'T'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <span className="px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 text-xs font-bold">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={user.phone || '+91 98765 43210'}
                  readOnly
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">System Role</label>
                <input
                  type="text"
                  value={user.role}
                  readOnly
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
