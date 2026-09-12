import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface AuthTabsProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'login' ? styles.activeTab : styles.inactiveTab
        ]}
        onPress={() => onTabChange('login')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'login' ? styles.activeTabText : styles.inactiveTabText
          ]}
        >
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'signup' ? styles.activeTab : styles.inactiveTab
        ]}
        onPress={() => onTabChange('signup')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'signup' ? styles.activeTabText : styles.inactiveTabText
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTab: {
    backgroundColor: '#3196F5',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(49, 150, 245, 0.28)'
      },
      default: {
        shadowColor: '#3196F5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2
      }
    })
  },
  inactiveTab: {
    backgroundColor: 'transparent'
  },
  tabText: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  activeTabText: {
    color: '#FFFFFF'
  },
  inactiveTabText: {
    color: '#777777'
  }
});
