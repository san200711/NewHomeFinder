import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as EmailService from '@/services/email';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  sendOTP: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@newhomefinder_user',
  USERS_DB: '@newhomefinder_users_db',
  OTP_STORAGE: '@newhomefinder_otp',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const result = await EmailService.sendOTP(email);
      if (!result.success) {
        throw new Error(result.message);
      }
      console.log('✅', result.message);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const result = await EmailService.verifyOTP(email, otp);
      if (result.success) {
        console.log('✅', result.message);
        return true;
      } else {
        console.warn('⚠️', result.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password });
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string, role: UserRole) => {
    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password && u.role === role
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      throw new Error('Invalid OTP');
    }

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const userIndex = users.findIndex((u: any) => u.email === email);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].password = newPassword;
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        verifyOTP,
        sendOTP,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
