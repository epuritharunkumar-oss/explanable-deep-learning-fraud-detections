import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { 
  Shield, 
  Lock, 
  User, 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Info 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({
        email: identifier.trim(),
        username: identifier.trim(),
        password: password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else {
        // Fallback demo login if backend is unreachable
        setError('Unable to reach backend service. You can use the Quick Demo Login below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIdentifier('tharun@fraudshield.ai');
    setPassword('admin123');
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({
        email: 'tharun@fraudshield.ai',
        username: 'tharun',
        password: 'admin123'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Local fallback for demo access
      const demoUser = {
        id: 7,
        name: 'Tharun Prakash',
        email: 'tharun@fraudshield.ai',
        role: 'Fraud Analyst'
      };
      localStorage.setItem('token', 'demo-session-token-analyst-2026');
      localStorage.setItem('user', JSON.stringify(demoUser));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      {/* Top Simple Navigation Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-navy-900/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/30 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FraudShield<span className="text-brand-cyan">.AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Multi-Modal XAI Platform
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-brand-cyan transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-brand-blue/15 via-brand-cyan/10 to-transparent blur-[130px] pointer-events-none rounded-full"></div>

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Card */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl bg-navy-900/80 space-y-6">
            
            {/* Logo & Welcome Back Heading */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan mx-auto flex items-center justify-center shadow-lg shadow-brand-blue/25 mb-3">
                <Shield className="w-7 h-7 text-white" />
              </div>
              
              <div className="inline-block">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FraudShield<span className="text-brand-cyan">.AI</span>
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white">Welcome Back</h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Sign in to your FraudShield AI account to continue to the Dashboard
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="username-or-email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    required
                    className="w-full bg-navy-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
                  />
                </div>
              </div>

              {/* Password with Show/Hide toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-brand-cyan transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-navy-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
                  />
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-navy-950 border-slate-800 text-brand-blue focus:ring-0 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-brand-cyan/80">Demo Analyst Access</span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                id="login-button"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan text-white font-bold text-xs tracking-wide shadow-lg shadow-brand-blue/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-navy-900/90 px-3 text-slate-500 font-semibold tracking-wider">
                  Or Quick Demo Access
                </span>
              </div>
            </div>

            {/* Quick Demo Button */}
            <button
              type="button"
              id="quick-demo-login-btn"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl glass-panel text-brand-cyan font-bold text-xs border border-brand-cyan/30 hover:bg-brand-cyan/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login with Demo Account</span>
            </button>

            {/* Demo Credentials Box */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800/80 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                <span>Demo Analyst Credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] pt-1">
                <div>
                  <span className="block text-[10px] uppercase text-slate-500 font-sans font-medium">Username/Email:</span>
                  <span className="text-slate-200">tharun@fraudshield.ai</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500 font-sans font-medium">Password:</span>
                  <span className="text-slate-200">admin123</span>
                </div>
              </div>
            </div>

            {/* Security / Academic Disclosure */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-300">Demo Authentication Notice:</strong> This academic demonstration uses local session authentication. It is intended for project evaluation and research purposes, not certified as production banking security.
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-500 border-t border-slate-800/80 bg-navy-950">
        Explainable Deep Learning for Financial Fraud Prediction Using Multi-Modal Data
      </footer>
    </div>
  );
}
