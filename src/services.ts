import axios from 'axios';

// Dynamically determine the API base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('memberflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Update export to use the 'api' instance
export default api;

// Fayda ID Verification
export const verifyFaydaId = async (faydaId: string) => {
  try {
    const response = await api.post(`/fayda/verify`, { faydaId });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Fayda verification failed" };
  }
};

// OTP Service
export const sendOtp = async (phoneNumber: string) => {
  try {
    const response = await api.post(`/otp/send`, { phoneNumber });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Failed to send OTP" };
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    const response = await api.post(`/otp/verify`, { phoneNumber, otp });
    return response.data.success;
  } catch (error) {
    return false;
  }
};

// Telebirr Integration
export const initiateTelebirrPayment = async (amount: number, memberId: string) => {
  try {
    const response = await api.post(`/payments/telebirr/initiate`, { amount, memberId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Telebirr initiation failed");
  }
};

// OCR Screenshot Verification
export const verifyPaymentScreenshot = async (file: File) => {
  const formData = new FormData();
  formData.append('screenshot', file);
  try {
    const response = await api.post(`/payments/ocr-verify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "OCR processing failed" };
  }
};

// Invoice Service
export const downloadInvoice = (paymentId: string, params: any) => {
  const queryParams = new URLSearchParams(params).toString();
  window.open(`${API_BASE_URL}/payments/invoice/${paymentId}?${queryParams}`, '_blank');
};

// Organization Config
export const getOrgConfig = async () => {
  try {
    const response = await api.get(`/config`);
    return response.data;
  } catch (error) {
    return null;
  }
};

