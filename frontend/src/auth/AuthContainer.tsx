import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { AuthTabs } from './components/AuthTabs';
import { LoginForm } from './screens/LoginForm';
import { SignupForm } from './screens/SignupForm';
import { OTPVerification } from './components/OTPVerification';
import { AccountCreatedScreen } from './screens/AccountCreatedScreen';
import { OnboardingPreferencesScreen } from './screens/OnboardingPreferencesScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

interface AuthContainerProps {
  appName?: string;
  appSubtitle?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  appName = 'TKR DENTAL CARE',
  appSubtitle
}) => {
  const {
    currentStep,
    setCurrentStep,
    pendingPhone,
    pendingCountry,
    pendingOtp,
    resendCountdown,
    verifyOtp,
    resendOtp,
    isLoading,
    error,
    clearError
  } = useAuth();

  // Show segmented tabs only on initial login / signup entry
  const showTabs = currentStep === 'login' || currentStep === 'signup';

  return (
    <AuthLayout appName={appName} appSubtitle={appSubtitle}>
      {showTabs && (
        <AuthTabs
          activeTab={currentStep as 'login' | 'signup'}
          onTabChange={(tab) => {
            clearError();
            setCurrentStep(tab);
          }}
        />
      )}

      {/* Screen Router */}
      {currentStep === 'login' && <LoginForm />}

      {currentStep === 'signup' && <SignupForm />}

      {currentStep === 'login_otp' && (
        <OTPVerification
          title="Verify Your Number"
          subtitle="Enter the 6-digit code sent to your phone number."
          phoneNumber={pendingPhone}
          country={pendingCountry}
          generatedOtp={pendingOtp}
          resendCountdown={resendCountdown}
          isLoading={isLoading}
          error={error}
          submitButtonText="Verify & Continue"
          onVerify={verifyOtp}
          onResend={resendOtp}
          onChangeNumber={() => {
            clearError();
            setCurrentStep('login');
          }}
        />
      )}

      {currentStep === 'signup_otp' && (
        <OTPVerification
          title="Verify Your Account"
          subtitle="We've sent a 6-digit verification code to your phone number."
          phoneNumber={pendingPhone}
          country={pendingCountry}
          generatedOtp={pendingOtp}
          resendCountdown={resendCountdown}
          isLoading={isLoading}
          error={error}
          submitButtonText="Verify & Create Account"
          onVerify={verifyOtp}
          onResend={resendOtp}
          onChangeNumber={() => {
            clearError();
            setCurrentStep('signup');
          }}
        />
      )}

      {currentStep === 'account_created' && <AccountCreatedScreen />}

      {currentStep === 'onboarding_preferences' && (
        <OnboardingPreferencesScreen appName={appName} />
      )}

      {currentStep === 'profile_setup' && <ProfileSetupScreen />}

      {currentStep === 'welcome' && <WelcomeScreen />}
    </AuthLayout>
  );
};
