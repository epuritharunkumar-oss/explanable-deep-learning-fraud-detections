import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => apiClient.post('/login', data),
  register: (data) => apiClient.post('/register', data),
  logout: () => apiClient.post('/logout'),
  getProfile: () => apiClient.get('/profile'),
};

export const transactionApi = {
  predict: (data) => apiClient.post('/predict', data),
  batchPredict: (formData) => apiClient.post('/batch-predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTransactions: (params) => apiClient.get('/transactions', { params }),
  getTransactionById: (id) => apiClient.get(`/transactions/${id}`),
  deleteTransaction: (id) => apiClient.delete(`/transactions/${id}`),
};

export const batchApi = {
  trainModel: (formData) => apiClient.post('/train', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  trainModelJson: (data) => apiClient.post('/train', data),
  predictBatch: (formData, params) => apiClient.post('/predict-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params
  }),
  predictBatchJson: (data, params) => apiClient.post('/predict-batch', data, { params }),
  getModelMetrics: () => apiClient.get('/model-metrics'),
  exportResultsExcel: (payload) => apiClient.post('/export-results', payload, {
    responseType: 'blob'
  }),
  getDemoDataset: () => apiClient.get('/demo-dataset'),
};

export const analyticsApi = {
  getDashboardStats: () => apiClient.get('/dashboard/statistics'),
  getAnalytics: (params) => apiClient.get('/analytics', { params }),
  getAlerts: () => apiClient.get('/alerts'),
  updateAlertStatus: (id, status) => apiClient.put(`/alerts/${id}`, { status }),
};

export const reportApi = {
  getReports: (params) => apiClient.get('/reports', { params }),
  getExportUrl: () => `${API_BASE_URL}/reports/export`,
};

export const modelApi = {
  getModelInfo: () => apiClient.get('/model/info'),
  getModelMetrics: () => apiClient.get('/model/metrics'),
  trainModel: () => apiClient.post('/model/train'),
};

export const genaiApi = {
  explainTransaction: (data) => apiClient.post('/genai/explain', data),
  generateSar: (data) => apiClient.post('/genai/sar', data),
  chatCopilot: (data) => apiClient.post('/genai/chat', data),
  generateScenario: (data) => apiClient.post('/genai/generate-scenario', data),
};

export default apiClient;
