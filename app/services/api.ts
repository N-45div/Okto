import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token Services
export const tokenService = {
  getTokens: async () => (await api.get('/explorer/getTokens')).data,
  transfer: async (params: any) => (await api.post('/intents/tokenTransfer', params)).data,
};

// Portfolio Services
export const portfolioService = {
  getPortfolio: async () => (await api.get('/explorer/getPortfolio')).data,
  getChains: async () => (await api.get('/explorer/getChains')).data,
  getActivity: async () => (await api.get('/explorer/getPortfolioActivity')).data,
  getAccount: async () => (await api.get('/explorer/getAccount')).data,
};

// Auth Services
export const authService = {
  googleAuth: async (token: string) => {
    const response = await api.post('/auth/googleAuthenticate', { token });
    return response.data;
  },
  emailAuth: async (email: string) => {
    const response = await api.post('/auth/emailAuthenticate', { email });
    return response.data;
  },
  verifyEmailOTP: async (email: string, otp: string, token: string) => {
    const response = await api.post('/auth/emailAuthenticate/verify', { email, otp, token });
    return response.data;
  },
};

// Session Services
export const sessionService = {
  getSessionKey: async () => {
    const response = await api.get('/utils/sessionKey');
    return response.data;
  },
};

// Transfer Token API
export const transferTokenAPI = async (payload: {
  caip2Id: string;
  recipient: string;
  token: string;
  amount: number;
  sessionConfig: {
    userSWA: string;
    sessionPrivKey: string;
    sessionPubKey: string;
  };
  feePayerAddress?: string;
}) => {
  try {
    const response = await api.post('/intents/tokenTransfer', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || "Failed to initiate token transfer");
  }
};

export default api;