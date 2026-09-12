import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DentalStoreProvider, useDentalStore } from './src/context/DentalStoreContext';
import { AuthProvider, useAuth } from './src/auth';
import { PatientPortalApp } from './src/portal/PatientPortalApp';

const PatientRootApp: React.FC = () => {
  const { isServerConnected, refreshFromServer } = useDentalStore();
  const { authState } = useAuth();
  const isAuthenticated = authState === 'AUTHENTICATED';

  return (
    <SafeAreaView style={[styles.safeArea, !isAuthenticated && styles.safeAreaAuth]}>
      <StatusBar barStyle="dark-content" backgroundColor={isAuthenticated ? '#ffffff' : '#F5F3F3'} />
      
      {/* Central Cloud Sync Indicator Header - only in clinic app */}
      {isAuthenticated && (
        <View style={[styles.syncBar, isServerConnected ? styles.syncBarOnline : styles.syncBarOffline]}>
          <View style={styles.syncRow}>
            <View style={[styles.statusDot, isServerConnected ? styles.statusDotOnline : styles.statusDotOffline]} />
            <Text style={styles.syncText}>
              {isServerConnected 
                ? 'TKR CLOUD CONNECTED • Unified Sync Engine (Port 5000)' 
                : 'OFFLINE CACHE MODE • Stored locally'}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => refreshFromServer()} activeOpacity={0.7}>
            <Ionicons name="sync" size={13} color={isServerConnected ? '#065f46' : '#9a3412'} />
            <Text style={[styles.refreshText, { color: isServerConnected ? '#065f46' : '#9a3412' }]}>Sync</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dedicated Patient Mobile App */}
      <View style={[styles.body, !isAuthenticated && styles.bodyAuth]}>
        <PatientPortalApp onSwitchToStaff={() => {}} />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <DentalStoreProvider>
      <AuthProvider>
        <PatientRootApp />
      </AuthProvider>
    </DentalStoreProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  safeAreaAuth: {
    backgroundColor: '#F5F3F3'
  },
  body: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  bodyAuth: {
    backgroundColor: '#F5F3F3'
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1
  },
  syncBarOnline: {
    backgroundColor: '#ecfdf5',
    borderBottomColor: '#a7f3d0'
  },
  syncBarOffline: {
    backgroundColor: '#fff7ed',
    borderBottomColor: '#fed7aa'
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6
  },
  statusDotOnline: {
    backgroundColor: '#10b981'
  },
  statusDotOffline: {
    backgroundColor: '#f97316'
  },
  syncText: {
    fontFamily: Platform.select({ web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', default: undefined }),
    fontSize: 10,
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: 0.2
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  refreshText: {
    fontFamily: Platform.select({ web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', default: undefined }),
    fontSize: 9,
    fontWeight: '500',
    marginLeft: 3
  }
});
