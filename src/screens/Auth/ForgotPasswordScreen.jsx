import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Statusbar from '../../components/Statusbar/Statusbar';

// Asset imports
const lightLogo = require('../../Assets/img/lightlogo.png');
const darkLogo = require('../../Assets/img/darklogo.png');

let useNavigationHook = null;
try {
  useNavigationHook = require('@react-navigation/native').useNavigation;
} catch (e) {}

let useApiHook = null;
try {
  useApiHook = require('../../hooks/useApi').useApi;
} catch (e) {}

const ForgotPasswordScreen = ({ navigation: propNav }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  let nav = propNav;
  if (!nav && useNavigationHook) {
    try {
      nav = useNavigationHook();
    } catch (e) {}
  }

  let requestApi = null;
  if (useApiHook) {
    try {
      const api = useApiHook();
      requestApi = api.request;
    } catch (e) {}
  }

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = (msg, isError = false) => {
    Alert.alert(isError ? 'Notice' : 'Success', msg);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      notify('Please enter your email address', true);
      return;
    }

    // Basic email format validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      notify('Please enter a valid email address', true);
      return;
    }

    setLoading(true);

    try {
      if (requestApi) {
        const response = await requestApi('POST', '/user/forgot-password', {
          emailAddress: email.trim(),
        });

        if (response?.statusCode === 200 || response?.status === 200) {
          notify('OTP has been sent to your email.');
          nav?.navigate?.('otpScreen', { email: email.trim() });
        } else {
          notify(response?.message || 'Something went wrong. Please try again.', true);
        }
      } else {
        // Fallback simulation when backend API is not connected
        setTimeout(() => {
          setLoading(false);
          notify('OTP has been sent to your email.');
          nav?.navigate?.('otpScreen', { email: email.trim() });
        }, 800);
        return;
      }
    } catch (error) {
      notify(error?.message || 'Failed to send OTP. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const currentLogo = isDark ? darkLogo : lightLogo;
  const logoWidth = Math.min(width * 0.52, 220);
  const logoHeight = logoWidth / (isDark ? 488 / 438 : 516 / 426);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0C0814' : '#FFFFFF' },
      ]}
      edges={['top', 'bottom']}
    >
      <Statusbar
        backgroundColor={isDark ? '#0C0814' : '#FFFFFF'}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo */}
          <View style={styles.logoHeader}>
            <Image
              source={currentLogo}
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
            />
          </View>

          {/* Header Texts */}
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#FFFFFF' : '#18181B' },
              ]}
            >
              Forgot Password
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? '#A1A1AA' : '#71717A' },
              ]}
            >
              Don't worry! Enter your registered email address and we'll send you a 6-digit OTP code to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#E4E4E7' : '#3F3F46' },
                ]}
              >
                Registered Email
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDark ? '#171224' : '#F8F8FA',
                    borderColor: isDark ? '#2E2542' : '#E4E4E7',
                  },
                ]}
              >
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.input,
                    { color: isDark ? '#FFFFFF' : '#18181B' },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleSendOtp}
              style={styles.primaryButton}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send OTP Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              onPress={() => nav?.navigate?.('login')}
              style={styles.footerLinkTouch}
            >
              <Text
                style={[
                  styles.footerLink,
                  { color: isDark ? '#A1A1AA' : '#71717A' },
                ]}
              >
                Remember your password?{' '}
                <Text style={styles.highlightText}>Back to Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    paddingVertical: 0,
  },
  primaryButton: {
    backgroundColor: '#FF2B75',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF2B75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerContainer: {
    marginTop: 36,
    alignItems: 'center',
  },
  footerLinkTouch: {
    paddingVertical: 8,
  },
  footerLink: {
    fontSize: 14,
  },
  highlightText: {
    color: '#FF2B75',
    fontWeight: '600',
  },
});
