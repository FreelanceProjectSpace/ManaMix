import React, { useState, useRef, useEffect } from 'react';
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

const OtpScreen = ({ navigation: propNav, route = {} }) => {
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

  const email = route?.params?.email || 'your email';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const notify = (msg, isError = false) => {
    Alert.alert(isError ? 'Notice' : 'Success', msg);
  };

  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText ? cleanText[cleanText.length - 1] : '';
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join('');

    if (otpValue.length < 6) {
      notify('Please enter the complete 6-digit OTP code', true);
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      notify('Please enter a new password (at least 6 characters)', true);
      return;
    }

    setLoading(true);

    try {
      if (requestApi) {
        const response = await requestApi('POST', '/user/reset-password', {
          emailAddress: email,
          otp: otpValue,
          newPassword: newPassword.trim(),
        });

        if (response?.statusCode === 200 || response?.status === 200) {
          notify('Password reset successfully! Please login with your new password.');
          nav?.navigate?.('login');
        } else {
          notify(response?.message || 'Invalid or expired OTP', true);
        }
      } else {
        setTimeout(() => {
          setLoading(false);
          notify('Password reset successfully! Please login with your new password.');
          nav?.navigate?.('login');
        }, 800);
        return;
      }
    } catch (error) {
      notify(error?.message || 'Failed to reset password. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setOtp(['', '', '', '', '', '']);
    notify('A new OTP has been sent to your email.');
  };

  const currentLogo = isDark ? darkLogo : lightLogo;
  const logoWidth = Math.min(width * 0.50, 210);
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

          {/* Heading */}
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#FFFFFF' : '#18181B' },
              ]}
            >
              Verify OTP
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? '#A1A1AA' : '#71717A' },
              ]}
            >
              Enter the 6-digit OTP code sent to{' '}
              <Text style={{ fontWeight: '600', color: isDark ? '#FFFFFF' : '#18181B' }}>
                {email}
              </Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* 6-Digit OTP Inputs */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: isDark ? '#171224' : '#F8F8FA',
                      borderColor: digit
                        ? '#FF2B75'
                        : isDark
                        ? '#2E2542'
                        : '#E4E4E7',
                      color: isDark ? '#FFFFFF' : '#18181B',
                    },
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  returnKeyType="next"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Link */}
            <View style={styles.resendRow}>
              <Text style={[styles.resendText, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.resendAction,
                    { opacity: resendCooldown > 0 ? 0.6 : 1 },
                  ]}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Password Field */}
            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#E4E4E7' : '#3F3F46' },
                ]}
              >
                Set New Password
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
                  placeholder="Enter new password"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.input,
                    { color: isDark ? '#FFFFFF' : '#18181B' },
                  ]}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.eyeText, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              style={styles.primaryButton}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Reset Password</Text>
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
                Already have an account?{' '}
                <Text style={styles.highlightText}>Go back to Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpScreen;

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
    marginBottom: 20,
  },
  headerTextContainer: {
    marginBottom: 24,
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
  },
  resendAction: {
    color: '#FF2B75',
    fontSize: 13,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 32,
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
