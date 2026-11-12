import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, Search, User, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/about') {
    return (
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FraudShield<span className="text-brand-cyan">.AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Multi-Modal XAI Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-brand-cyan transition-colors">Home</Link>
            <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
            <a href="#workflow" className="hover:text-brand-cyan transition-colors">How It Works</a>
            <Link to="/about" className="hover:text-brand-cyan transition-colors">About Project</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-semibold shadow-lg shadow-brand-blue/25 hover:opacity-95 transition-all">
              <Sparkles className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">FraudShield AI</span>
        </Link>
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Transaction ID, Customer, Location..."
            className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-xl bg-navy-950 border border-slate-800 text-slate-300 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-rose animate-pulse"></span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {user?.name ? user.name[0] : 'T'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.name || 'Tharun Prakash'}</div>
            <div className="text-[10px] font-medium text-brand-cyan">{user?.role || 'Fraud Analyst'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-slate-400 hover:text-brand-rose hover:border-brand-rose/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
