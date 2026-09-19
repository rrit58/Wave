import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  email: string;
  isVerified?: boolean;
  isLoggedIn?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  register: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  forgetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (otp: string, email: string, newPassword: string, confirmNewPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  register: async () => ({ success: false, message: '' }),
  login: async () => ({ success: false, message: '' }),
  logout: async () => ({ success: false, message: '' }),
  verifyEmail: async () => ({ success: false, message: '' }),
  forgetPassword: async () => ({ success: false, message: '' }),
  resetPassword: async () => ({ success: false, message: '' }),
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>((): any => {
    const waveUser = localStorage.getItem('wave_user')
    return waveUser ? JSON.parse(waveUser) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('wave_accessToken') || null;
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem('wave_refreshToken') || null;
  });

  const isLoggedIn = !!user && !!accessToken && !!refreshToken;

  useEffect(() => {
    if (user) {
      localStorage.setItem('wave_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wave_user');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem('wave_accessToken', accessToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('wave_accessToken');
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('wave_refreshToken', refreshToken);
    } else {
      localStorage.removeItem('wave_refreshToken');
    }
  }, [refreshToken]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Register User
  const register = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await axios.post(`${API_URL}/user/register`, {
        fullName,
        email,
        password,
        confirmPassword
      });

      if (res.data.success) {
        sessionStorage.setItem('verify_email', res.data.user.email);
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    }
  };

  // Login User
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/user/login`, { email, password });

      const { user, accessToken, refreshToken } = res.data;

      if (res.data.success) {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    }
  };

  // Logout User
  const logout = async () => {
    try {
      const res = await axios.post(`${API_URL}/user/logout`);

      if (res.data.success) {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  // Verify User Email
  const verifyEmail = async (email: string, otp: string) => {
    try {
      const res = await axios.post(`${API_URL}/user/verify`, { email, otp });

      const { user, accessToken, refreshToken } = res.data;

      if (res.data.success) {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    }
  }

  // Forget Password
  const forgetPassword = async (email: string) => {
    try {
      const res = await axios.post(`${API_URL}/user/forget-password`, { email });

      if (res.data.success) {
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    }
  }

  // Reset Password
  const resetPassword = async (otp: string, email: string, newPassword: string, confirmNewPassword: string) => {
    try {
      const res = await axios.post(`${API_URL}/user/reset-password`, { otp, email, newPassword, confirmNewPassword });

      if (res.data.success) {
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Server connection failed." };
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isLoggedIn, register, login, logout, verifyEmail, forgetPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
