import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (mobile: string, password: string, role: UserRole) => Promise<void>;
  register: (mobile: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<void>;
  resetPassword: (mobile: string, otp: string, newPassword: string) => Promise<void>;
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

  const sendOTP = async (mobile: string) => {
    const otp = '123456'; // Mock OTP
    await AsyncStorage.setItem(
      STORAGE_KEYS.OTP_STORAGE,
      JSON.stringify({ mobile, otp, expiresAt: Date.now() + 300000 })
    );
    console.log(`OTP sent to ${mobile}: ${otp}`);
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
    const otpData = await AsyncStorage.getItem(STORAGE_KEYS.OTP_STORAGE);
    if (!otpData) return false;

    const { mobile: storedMobile, otp: storedOTP, expiresAt } = JSON.parse(otpData);
    
    if (storedMobile === mobile && storedOTP === otp && Date.now() < expiresAt) {
      return true;
    }
    return false;
  };

  const register = async (mobile: string, password: string, name: string, role: UserRole) => {
    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const existingUser = users.find((u: any) => u.mobile === mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      mobile,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password });
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (mobile: string, password: string, role: UserRole) => {
    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const foundUser = users.find(
      (u: any) => u.mobile === mobile && u.password === password && u.role === role
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  };

  const resetPassword = async (mobile: string, otp: string, newPassword: string) => {
    const isValid = await verifyOTP(mobile, otp);
    if (!isValid) {
      throw new Error('Invalid OTP');
    }

    const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users = usersData ? JSON.parse(usersData) : [];

    const userIndex = users.findIndex((u: any) => u.mobile === mobile);
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
