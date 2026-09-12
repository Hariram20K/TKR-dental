import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthStep, AuthState, SignupFormData, COUNTRIES, Country } from './types';

const STORAGE_AUTH_USER = '@app_auth_current_user_v2';
const STORAGE_USERS_DB = '@app_auth_users_db_v2';

const INITIAL_USERS: AuthUser[] = [
  {
    id: 'TKR-P-1001',
    firstName: 'Rahul',
    lastName: 'Verma',
    displayName: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phoneNumber: '9845011223',
    countryCode: '+91',
    isPhoneVerified: true,
    isEmailVerified: true,
    isNewUser: false,
    onboardingCompleted: true,
    preferences: ['Personalized Recommendations', 'Notifications'],
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    lastLoginAt: '2026-09-10T09:00:00Z'
  },
  {
    id: 'TKR-P-1002',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    displayName: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phoneNumber: '9731233445',
    countryCode: '+91',
    isPhoneVerified: true,
    isEmailVerified: true,
    isNewUser: false,
    onboardingCompleted: true,
    preferences: ['Latest Offers', 'Personalized Services'],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    lastLoginAt: '2026-09-09T14:30:00Z'
  }
];

interface AuthContextType {
  user: AuthUser | null;
  authState: AuthState;
  currentStep: AuthStep;
  isLoading: boolean;
  error: string | null;
  pendingPhone: string;
  pendingCountry: Country;
  pendingOtp: string;
  resendCountdown: number;
  signupData: SignupFormData | null;
  // Actions
  setCurrentStep: (step: AuthStep) => void;
  setPendingCountry: (country: Country) => void;
  requestLoginOtp: (phoneNumber: string, country: Country) => Promise<boolean>;
  requestSignupOtp: (data: SignupFormData) => Promise<boolean>;
  verifyOtp: (otpCode: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  savePreferences: (preferences: string[]) => Promise<void>;
  saveProfileDetails: (details: { displayName?: string; dateOfBirth?: string; location?: string; avatarUri?: string }) => Promise<void>;
  finishOnboarding: () => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>('LOGGED_OUT');
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [pendingCountry, setPendingCountry] = useState<Country>(COUNTRIES[0]);
  const [pendingOtp, setPendingOtp] = useState<string>('482915');
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [signupData, setSignupData] = useState<SignupFormData | null>(null);
  const [usersDb, setUsersDb] = useState<AuthUser[]>(INITIAL_USERS);

  // Initialize from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedDb = await AsyncStorage.getItem(STORAGE_USERS_DB);
        if (storedDb) {
          setUsersDb(JSON.parse(storedDb));
        } else {
          await AsyncStorage.setItem(STORAGE_USERS_DB, JSON.stringify(INITIAL_USERS));
        }

        const storedUser = await AsyncStorage.getItem(STORAGE_AUTH_USER);
        if (storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser.onboardingCompleted) {
            setAuthState('AUTHENTICATED');
          } else {
            setAuthState('ONBOARDING_REQUIRED');
            setCurrentStep('onboarding_preferences');
          }
        }
      } catch (e) {
        console.warn('Failed to load auth session', e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if ((currentStep === 'login_otp' || currentStep === 'signup_otp') && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep, resendCountdown]);

  const generateOtp = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp(code);
    setResendCountdown(30);
    return code;
  };

  const clearError = () => setError(null);

  // 1. Request Login OTP
  const requestLoginOtp = async (phoneNumber: string, country: Country): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 600));
      const clean = phoneNumber.replace(/\D/g, '');
      setPendingPhone(clean);
      setPendingCountry(country);
      generateOtp();
      setAuthState('OTP_PENDING');
      setCurrentStep('login_otp');
      return true;
    } catch {
      setError('Failed to send verification code. Please check your network.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request Signup OTP
  const requestSignupOtp = async (data: SignupFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 650));
      const cleanPhone = data.phone.replace(/\D/g, '');

      // Check if user already exists
      const exists = usersDb.some(
        (u) =>
          u.phoneNumber === cleanPhone ||
          u.email.toLowerCase() === data.email.trim().toLowerCase()
      );
      if (exists) {
        setError('An account with this email or phone number already exists.');
        return false;
      }

      setSignupData(data);
      setPendingPhone(cleanPhone);
      setPendingCountry(
        COUNTRIES.find((c) => c.dialCode === data.countryCode) || COUNTRIES[0]
      );
      generateOtp();
      setAuthState('OTP_PENDING');
      setCurrentStep('signup_otp');
      return true;
    } catch {
      setError('Registration request failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const verifyOtp = async (otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 600));

      // Accept generated code or fallback test code 123456
      if (otpCode !== pendingOtp && otpCode !== '123456') {
        setError('Incorrect verification code. Please check SMS or use 123456.');
        return false;
      }

      if (currentStep === 'login_otp') {
        // Existing user login check
        let existing = usersDb.find((u) => u.phoneNumber === pendingPhone);
        if (!existing) {
          // If phone not found in mock db, create a profile for them
          existing = {
            id: `USR-${Date.now().toString().slice(-6)}`,
            firstName: 'Verified',
            lastName: 'Customer',
            displayName: `Customer ${pendingPhone.slice(-4)}`,
            email: `user.${pendingPhone.slice(-4)}@example.com`,
            phoneNumber: pendingPhone,
            countryCode: pendingCountry.dialCode,
            isPhoneVerified: true,
            isEmailVerified: false,
            isNewUser: false,
            onboardingCompleted: true,
            preferences: ['Personalized Services'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          const updated = [existing, ...usersDb];
          setUsersDb(updated);
          await AsyncStorage.setItem(STORAGE_USERS_DB, JSON.stringify(updated));
        }

        setUser(existing);
        await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(existing));
        setAuthState('AUTHENTICATED');
        return true;
      } else {
        // Sign up flow -> create new user
        if (!signupData) {
          setError('Session expired. Please restart signup.');
          setCurrentStep('signup');
          return false;
        }

        const newUser: AuthUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          firstName: signupData.firstName.trim(),
          lastName: signupData.lastName.trim(),
          displayName: `${signupData.firstName.trim()} ${signupData.lastName.trim()}`,
          email: signupData.email.trim().toLowerCase(),
          phoneNumber: pendingPhone,
          countryCode: pendingCountry.dialCode,
          isPhoneVerified: true,
          isEmailVerified: false,
          isNewUser: true,
          onboardingCompleted: false,
          preferences: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        const updatedDb = [newUser, ...usersDb];
        setUsersDb(updatedDb);
        await AsyncStorage.setItem(STORAGE_USERS_DB, JSON.stringify(updatedDb));

        setUser(newUser);
        await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(newUser));

        setAuthState('NEW_USER');
        setCurrentStep('account_created');
        return true;
      }
    } catch {
      setError('Verification failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Resend OTP
  const resendOtp = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      generateOtp();
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Save Preferences
  const savePreferences = async (preferences: string[]) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 350));
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          preferences,
          updatedAt: new Date().toISOString()
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(updatedUser));
      }
      setCurrentStep('profile_setup');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Save Profile Details
  const saveProfileDetails = async (details: {
    displayName?: string;
    dateOfBirth?: string;
    location?: string;
    avatarUri?: string;
  }) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          displayName: details.displayName || user.displayName,
          dateOfBirth: details.dateOfBirth,
          location: details.location,
          profileImage: details.avatarUri,
          updatedAt: new Date().toISOString()
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(updatedUser));
      }
      setCurrentStep('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Finish Onboarding
  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 300));
      if (user) {
        const finalUser: AuthUser = {
          ...user,
          onboardingCompleted: true,
          isNewUser: false,
          updatedAt: new Date().toISOString()
        };
        setUser(finalUser);
        await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(finalUser));
      }
      setAuthState('AUTHENTICATED');
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Social Login (Google / Facebook / Apple)
  const socialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 800));
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      const socialUser: AuthUser = {
        id: `SOC-${Date.now().toString().slice(-6)}`,
        firstName: providerName,
        lastName: 'User',
        displayName: `${providerName} Member`,
        email: `${provider}.member@example.com`,
        phoneNumber: '9876500000',
        countryCode: '+91',
        isPhoneVerified: true,
        isEmailVerified: true,
        isNewUser: false,
        onboardingCompleted: true,
        preferences: ['Personalized Recommendations'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUser(socialUser);
      await AsyncStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(socialUser));
      setAuthState('AUTHENTICATED');
    } catch {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(STORAGE_AUTH_USER);
      setUser(null);
      setAuthState('LOGGED_OUT');
      setCurrentStep('login');
      setPendingPhone('');
      setSignupData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        currentStep,
        isLoading,
        error,
        pendingPhone,
        pendingCountry,
        pendingOtp,
        resendCountdown,
        signupData,
        setCurrentStep,
        setPendingCountry,
        requestLoginOtp,
        requestSignupOtp,
        verifyOtp,
        resendOtp,
        savePreferences,
        saveProfileDetails,
        finishOnboarding,
        socialLogin,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
