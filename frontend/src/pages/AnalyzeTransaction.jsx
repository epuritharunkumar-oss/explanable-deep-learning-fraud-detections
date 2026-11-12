import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { transactionApi, genaiApi } from '../services/api';
import { 
  ShieldCheck, 
  DollarSign, 
  UserCheck, 
  Smartphone, 
  MapPin, 
  Lock, 
  RotateCcw, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AnalyzeTransaction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    // Section A: Transaction Info
    transaction_id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
    customer_id: `CUST${Math.floor(1000 + Math.random() * 9000)}`,
    amount: '2500',
    transaction_type: 'UPI',
    merchant_name: 'FreshMart Superstore',
    merchant_category: 'Groceries',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_time: '14:30:00',

    // Section B: Customer Behaviour
    average_amount: '3000',
    transactions_last_24_hours: '3',
    transactions_last_hour: '1',
    account_age: '36',
    previous_fraud_cases: '0', // internal only — not shown in UI
    typical_location: 'Bengaluru, India',
    average_daily_count: '4',

    // Section C: Device Info
    device_type: 'Mobile',
    operating_system: 'Android 14',
    browser: 'Chrome Mobile',
    device_id: 'DEV-ANDR-8812',
    is_new_device: 'No',
    ip_address: '103.24.18.90',

    // Section D: Location Info
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    latitude: '12.9716',
    longitude: '77.5946',
    distance_from_usual_location: '3.5',
    foreign_transaction: 'No',

    // Section E: Security Info
    failed_login_attempts: '0',
    otp_verified: 'Yes',
    two_factor_auth: 'Enabled',
    vpn_detected: 'No',
    proxy_detected: 'No'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const loadPresetLegitimate = () => {
    setFormData({
      ...initialFormState,
      transaction_id: `TXN-LEGIT-${Math.floor(100 + Math.random() * 899)}`,
      amount: '2500',
      transaction_type: 'UPI',
      merchant_name: 'FreshMart Superstore',
      merchant_category: 'Groceries',
      is_new_device: 'No',
      distance_from_usual_location: '3',
      transactions_last_hour: '1',
      failed_login_attempts: '0',
      foreign_transaction: 'No',
      vpn_detected: 'No',
      proxy_detected: 'No',
      otp_verified: 'Yes',
      two_factor_auth: 'Enabled'
    });
  };

  const loadPresetFraudulent = () => {
    setFormData({
      ...initialFormState,
      transaction_id: `TXN-FRAUD-${Math.floor(100 + Math.random() * 899)}`,
      amount: '95000',
      transaction_type: 'Credit Card',
      merchant_name: 'Apex Crypto Exchange',
      merchant_category: 'Crypto/FX',
      is_new_device: 'Yes',
      distance_from_usual_location: '850',
      transactions_last_hour: '8',
      failed_login_attempts: '4',
      foreign_transaction: 'Yes',
      vpn_detected: 'Yes',
      proxy_detected: 'Yes',
      otp_verified: 'No',
      two_factor_auth: 'Disabled'
    });
  };

  const [errorMessage, setErrorMessage] = useState(null);
  const [scenarioNotice, setScenarioNotice] = useState(null);
  const [genAiLoading, setGenAiLoading] = useState(false);

  const handleLoadGenAIScenario = async (scenarioType) => {
    setGenAiLoading(true);
    setScenarioNotice(null);
    try {
      const res = await genaiApi.generateScenario({ scenario_type: scenarioType });
      const scen = res.data;
      setFormData((prev) => ({
        ...prev,
        transaction_id: `TXN-GENAI-${Math.floor(100 + Math.random() * 899)}`,
        ...scen.data
      }));
      setScenarioNotice(`✨ GenAI Scenario Loaded: ${scen.name} — ${scen.description}`);
    } catch (err) {
      console.error("GenAI Scenario error:", err);
    } finally {
      setGenAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await transactionApi.predict(formData);
      // Navigate to prediction result view with real trained model result
      navigate('/prediction-result', { state: { result: res.data, inputData: formData } });
    } catch (err) {
      console.error("Prediction API Error:", err);
      setErrorMessage(err.response?.data?.error || "Error connecting to trained ML backend engine. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader text="Analyzing Financial Transaction & Computing Multi-Modal SHAP Values..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header & Fast Presets */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Analyze Financial Transaction
              </h1>
              <p className="text-xs text-slate-400">
                Input multi-modal parameters to execute deep neural inference & generate XAI explanations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
              <button
                type="button"
                onClick={loadPresetLegitimate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-bold hover:bg-brand-emerald/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Legit
              </button>
              <button
                type="button"
                onClick={loadPresetFraudulent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-bold hover:bg-brand-rose/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Fraud
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] text-brand-cyan font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> GenAI Scenarios:
              </span>
              <button
                type="button"
                onClick={() => handleLoadGenAIScenario('sim_swap')}
                disabled={genAiLoading}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold hover:bg-purple-500/20 transition-all cursor-pointer"
              >
                SIM Swap Attack
              </button>
              <button
                type="button"
                onClick={() => handleLoadGenAIScenario('crypto_mule')}
                disabled={genAiLoading}
                className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                Crypto Mule Flow
              </button>
              <button
                type="button"
                onClick={() => handleLoadGenAIScenario('velocity_burst')}
                disabled={genAiLoading}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                Velocity Burst
              </button>
            </div>
          </div>

          {scenarioNotice && (
            <div className="p-3.5 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 animate-pulse" />
              <span>{scenarioNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl border border-brand-rose/40 bg-brand-rose/10 text-brand-rose text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION A: TRANSACTION INFORMATION */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">SECTION A: TRANSACTION INFORMATION</h2>
                  <p className="text-[11px] text-slate-400">Primary payment values, payment method and merchant details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction ID</label>
                  <input
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-brand-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Customer ID</label>
                  <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-brand-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-brand-blue font-bold text-brand-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction Type</label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-brand-blue"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="ATM Withdrawal">ATM Withdrawal</option>
                    <option value="Online Purchase">Online Purchase</option>
                    <option value="POS Payment">POS Payment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Merchant Name</label>
                  <input
                    type="text"
                    name="merchant_name"
                    value={formData.merchant_name}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Merchant Category</label>
                  <select
                    name="merchant_category"
                    value={formData.merchant_category}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Crypto/FX">Crypto/FX Exchange</option>
                    <option value="Dining">Dining/Restaurants</option>
                    <option value="Travel">Travel & Airlines</option>
                    <option value="ATM Cash">ATM Cash</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction Date</label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction Time</label>
                  <input
                    type="time"
                    name="transaction_time"
                    value={formData.transaction_time}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: CUSTOMER BEHAVIOUR */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">SECTION B: CUSTOMER BEHAVIOUR</h2>
                  <p className="text-[11px] text-slate-400">Historical spending patterns, velocity and account age</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Average Transaction Amount (₹)</label>
                  <input
                    type="number"
                    name="average_amount"
                    value={formData.average_amount}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Txns in Last 24 Hours</label>
                  <input
                    type="number"
                    name="transactions_last_24_hours"
                    value={formData.transactions_last_24_hours}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Txns in Last 1 Hour</label>
                  <input
                    type="number"
                    name="transactions_last_hour"
                    value={formData.transactions_last_hour}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Account Age (Months)</label>
                  <input
                    type="number"
                    name="account_age"
                    value={formData.account_age}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Typical Location</label>
                  <input
                    type="text"
                    name="typical_location"
                    value={formData.typical_location}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Average Daily Count</label>
                  <input
                    type="number"
                    name="average_daily_count"
                    value={formData.average_daily_count}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION C: DEVICE INFORMATION */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">SECTION C: DEVICE INFORMATION</h2>
                  <p className="text-[11px] text-slate-400">Hardware signatures, OS and IP address</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Device Type</label>
                  <select
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="ATM">ATM</option>
                    <option value="POS">POS Terminal</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Operating System</label>
                  <input
                    type="text"
                    name="operating_system"
                    value={formData.operating_system}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Browser</label>
                  <input
                    type="text"
                    name="browser"
                    value={formData.browser}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Device ID</label>
                  <input
                    type="text"
                    name="device_id"
                    value={formData.device_id}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Is New Device?</label>
                  <select
                    name="is_new_device"
                    value={formData.is_new_device}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">IP Address</label>
                  <input
                    type="text"
                    name="ip_address"
                    value={formData.ip_address}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION D: LOCATION INFORMATION */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-brand-emerald/10 text-brand-emerald">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">SECTION D: LOCATION INFORMATION</h2>
                  <p className="text-[11px] text-slate-400">Geolocation coordinates and distance anomaly from home location</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Distance from Usual Location (km)</label>
                  <input
                    type="number"
                    name="distance_from_usual_location"
                    value={formData.distance_from_usual_location}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Is Foreign Transaction?</label>
                  <select
                    name="foreign_transaction"
                    value={formData.foreign_transaction}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION E: SECURITY INFORMATION */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-brand-rose/10 text-brand-rose">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">SECTION E: SECURITY INFORMATION</h2>
                  <p className="text-[11px] text-slate-400">Authentication verification, failed logins, VPN & Proxy detection</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Failed Login Attempts</label>
                  <input
                    type="number"
                    name="failed_login_attempts"
                    value={formData.failed_login_attempts}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">OTP Verification</label>
                  <select
                    name="otp_verified"
                    value={formData.otp_verified}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Two-Factor Auth</label>
                  <select
                    name="two_factor_auth"
                    value={formData.two_factor_auth}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">VPN Detected?</label>
                  <select
                    name="vpn_detected"
                    value={formData.vpn_detected}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Proxy Detected?</label>
                  <select
                    name="proxy_detected"
                    value={formData.proxy_detected}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass-panel text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue via-brand-cyan to-purple-600 text-white font-bold text-xs shadow-xl shadow-brand-blue/25 hover:opacity-95 transition-all"
              >
                Analyze Transaction
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
