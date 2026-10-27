import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getHealth = () => api.get('/health');
export const getDatasetSummary = () => api.get('/dataset/summary');
export const getYieldDatasetSummary = () => api.get('/dataset/yield/summary');
export const getModelPerformance = () => api.get('/models/performance');
export const getModelComparison = () => api.get('/models/comparison');
export const getConfusionMatrix = () => api.get('/models/confusion-matrix');
export const getCropDistribution = () => api.get('/eda/crop-distribution');
export const getCorrelation = () => api.get('/eda/correlation');
export const getYieldEDA = () => api.get('/eda/yield');
export const predictCrop = (data) => api.post('/predict/crop', data);
export const predictYield = (data) => api.post('/predict/yield', data);

export default api;
