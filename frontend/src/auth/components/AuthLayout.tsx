import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface AuthLayoutProps {
  children: ReactNode;
  appName?: string;
  appSubtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  appName = 'TKR DENTAL CARE',
  appSubtitle
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative Corner Shapes bounded to prevent overflow on any device */}
      <View style={styles.decorativeBackground} pointerEvents="none">
        <View style={styles.cornerShapeTopLeft} />
        <View style={styles.cornerShapeBottomRight} />
        <View style={styles.cornerShapeMidRight} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isMobile && styles.scrollContentMobile
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Main Responsive Authentication Card */}
        <View
          style={[
            styles.authCard,
            isMobile && styles.authCardMobile
          ]}
        >
          {/* Logo & Branding Header */}
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#3196F5" />
            </View>
            <View style={styles.brandTextGroup}>
              <Text style={styles.appName}>{appName}</Text>
              {!!appSubtitle && <Text style={styles.appSubtitle}>{appSubtitle}</Text>}
            </View>
          </View>

          {/* Screen Content */}
          {children}
        </View>

        {/* Footer info */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Protected by 256-Bit SSL Encryption • All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3F3',
    width: '100%',
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
        height: '100%'
      }
    })
  },
  decorativeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  cornerShapeTopLeft: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFFFFF',
    opacity: 0.65
  },
  cornerShapeBottomRight: {
    position: 'absolute',
    bottom: -140,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#FFFFFF',
    opacity: 0.55
  },
  cornerShapeMidRight: {
    position: 'absolute',
    top: '32%',
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ECEAE8',
    opacity: 0.4
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 28,
    width: '100%'
  },
  scrollContentMobile: {
    paddingHorizontal: 12,
    paddingVertical: 18
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...Platform.select({
      web: {
        boxShadow: '0 16px 40px -12px rgba(40, 40, 40, 0.07)'
      },
      default: {
        shadowColor: '#202020',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 4
      }
    })
  },
  authCardMobile: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    maxWidth: '100%'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EDF5FE',
    borderWidth: 1,
    borderColor: '#D4E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  brandTextGroup: {
    justifyContent: 'center'
  },
  appName: {
    fontFamily: APP_FONT,
    fontSize: 15,
    fontWeight: '700',
    color: '#292929',
    letterSpacing: 0.3
  },
  appSubtitle: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '500',
    color: '#3196F5',
    letterSpacing: 0.5,
    marginTop: 1
  },
  footerRow: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  footerText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center'
  }
});
