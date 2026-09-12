import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

const PREFERENCE_OPTIONS = [
  { id: 'recs', label: 'Personalized Recommendations', icon: 'sparkles-outline' },
  { id: 'offers', label: 'Latest Offers', icon: 'pricetag-outline' },
  { id: 'arrivals', label: 'New Arrivals', icon: 'cube-outline' },
  { id: 'popular', label: 'Popular Products', icon: 'trending-up-outline' },
  { id: 'notifs', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'services', label: 'Personalized Services', icon: 'medkit-outline' }
];

export const OnboardingPreferencesScreen: React.FC<{ appName?: string }> = ({
  appName = '[YOUR APP NAME]'
}) => {
  const { savePreferences, setCurrentStep, isLoading } = useAuth();
  const [selected, setSelected] = useState<string[]>(['recs', 'services']);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = async () => {
    const labels = PREFERENCE_OPTIONS.filter((p) => selected.includes(p.id)).map((p) => p.label);
    await savePreferences(labels);
  };

  const handleSkip = () => {
    setCurrentStep('profile_setup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {appName}</Text>
      <Text style={styles.subtitle}>Let's personalize your experience.</Text>

      <Text style={styles.sectionHeading}>What are you interested in?</Text>

      {/* Selectable Cards / Chips */}
      <View style={styles.optionsList}>
        {PREFERENCE_OPTIONS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => toggleOption(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={isSelected ? '#3196F5' : '#777777'}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {item.label}
                </Text>
              </View>

              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Primary Continue Button */}
      <TouchableOpacity
        style={[styles.continueBtn, isLoading && styles.btnDisabled]}
        onPress={handleContinue}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.continueBtnText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Skip for now */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <Text style={styles.skipBtnText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  title: {
    fontFamily: APP_FONT,
    fontSize: 21,
    fontWeight: '700',
    color: '#292929',
    marginBottom: 4
  },
  subtitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    marginBottom: 16
  },
  sectionHeading: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '600',
    color: '#292929',
    marginBottom: 10
  },
  optionsList: {
    gap: 8,
    marginBottom: 20
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  optionCardSelected: {
    borderColor: '#3196F5',
    backgroundColor: '#F0F7FF',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(49, 150, 245, 0.12)'
      }
    })
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  optionLabel: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#292929',
    fontWeight: '400'
  },
  optionLabelSelected: {
    color: '#3196F5',
    fontWeight: '600'
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkCircleSelected: {
    backgroundColor: '#3196F5',
    borderColor: '#3196F5'
  },
  continueBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#3196F5',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(49, 150, 245, 0.3)'
      },
      default: {
        shadowColor: '#3196F5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3
      }
    })
  },
  btnDisabled: {
    backgroundColor: '#A0CEFB'
  },
  continueBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8
  },
  skipBtnText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500'
  }
});
