import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeTransaction from './pages/AnalyzeTransaction';
import PredictionResult from './pages/PredictionResult';
import ExplainableAI from './pages/ExplainableAI';
import Transactions from './pages/Transactions';
import FraudAlerts from './pages/FraudAlerts';
import Analytics from './pages/Analytics';
import BatchAnalysis from './pages/BatchAnalysis';
import Reports from './pages/Reports';
import ModelInfo from './pages/ModelInfo';
import About from './pages/About';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import GenAICopilot from './components/GenAICopilot';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root Website URL is the existing Landing Page (Home) */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* Protected Application Routes: Cannot open directly before login */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><AnalyzeTransaction /></ProtectedRoute>} />
        <Route path="/prediction-result" element={<ProtectedRoute><PredictionResult /></ProtectedRoute>} />
        <Route path="/explainable-ai" element={<ProtectedRoute><ExplainableAI /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><FraudAlerts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/batch" element={<ProtectedRoute><BatchAnalysis /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/model-info" element={<ProtectedRoute><ModelInfo /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <GenAICopilot />
    </Router>
  );
}
