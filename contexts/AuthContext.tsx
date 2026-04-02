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
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@nhf_user',
  USERS_DB: '@nhf_users_db',
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
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string): Promise<{ success: boolean; message: string }> => {
    return EmailService.sendOTP(email);
  };

  const verifyOTP = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    return EmailService.verifyOTP(email, otp);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users: any[] = usersData ? JSON.parse(usersData) : [];

    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email is already registered. Please login instead.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
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
    const users: any[] = usersData ? JSON.parse(usersData) : [];

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === role
    );

    if (!found) {
      throw new Error('Invalid email, password or role. Please check and try again.');
    }

    const { password: _pw, ...userWithoutPassword } = found;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const result = await EmailService.verifyOTP(email, otp);
    if (!result.success) throw new Error(result.message);

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users: any[] = usersData ? JSON.parse(usersData) : [];

    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error('No account found with this email.');

    users[idx].password = newPassword;
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('Not logged in');
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    setUser(updated);

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users: any[] = usersData ? JSON.parse(usersData) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, verifyOTP, sendOTP, resetPassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
