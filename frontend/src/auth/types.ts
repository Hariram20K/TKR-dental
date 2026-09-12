export type AuthStep = 
  | 'login'
  | 'signup'
  | 'login_otp'
  | 'signup_otp'
  | 'account_created'
  | 'onboarding_preferences'
  | 'profile_setup'
  | 'welcome';

export type AuthState =
  | 'LOGGED_OUT'
  | 'OTP_PENDING'
  | 'OTP_VERIFIED'
  | 'NEW_USER'
  | 'EXISTING_USER'
  | 'ONBOARDING_REQUIRED'
  | 'AUTHENTICATED';

export interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
  format: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', flag: '🇮🇳', dialCode: '+91', format: 'XXXXX XXXXX' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1', format: 'XXX XXX-XXXX' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dialCode: '+44', format: 'XXXX XXXXXX' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dialCode: '+971', format: 'XX XXX XXXX' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', dialCode: '+65', format: 'XXXX XXXX' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dialCode: '+1', format: 'XXX XXX-XXXX' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dialCode: '+61', format: 'XXX XXX XXX' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dialCode: '+49', format: 'XXX XXXXXXXX' }
];

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  passwordHash?: string;
  profileImage?: string;
  displayName?: string;
  dateOfBirth?: string;
  location?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}
