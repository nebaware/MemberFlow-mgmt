import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Fayda ID Verification
export const verifyFaydaId = async (faydaId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fayda/verify`, { faydaId });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Fayda verification failed" };
  }
};

// OTP Service
export const sendOtp = async (phoneNumber: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/send`, { phoneNumber });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Failed to send OTP" };
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/verify`, { phoneNumber, otp });
    return response.data.success;
  } catch (error) {
    return false;
  }
};

// Telebirr Integration
export const initiateTelebirrPayment = async (amount: number, memberId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/telebirr/initiate`, { amount, memberId });
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
    const response = await axios.post(`${API_BASE_URL}/payment/ocr-verify`, formData, {
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
  window.open(`${API_BASE_URL}/invoice/${paymentId}?${queryParams}`, '_blank');
};

// Custom Attributes Service
export const getOrgConfig = async () => {
  const docRef = doc(db, 'config', 'org');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

