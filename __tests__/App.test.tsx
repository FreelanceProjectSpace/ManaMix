/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

import { useColorScheme } from 'react-native';
import SplashScreen from '../src/screens/Splash/SplashScreen';
import LoginScreen from '../src/screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../src/screens/Auth/ForgotPasswordScreen';
import OtpScreen from '../src/screens/Auth/OtpScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock(
  '@react-navigation/native',
  () => ({
    NavigationContainer: ({ children }: any) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    }),
  }),
  { virtual: true }
);

jest.mock(
  '@react-navigation/native-stack',
  () => ({
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: any) => children,
      Screen: ({ component: Component, children }: any) => {
        if (Component) return <Component />;
        if (typeof children === 'function') return children({});
        return children || null;
      },
    }),
  }),
  { virtual: true }
);

jest.mock(
  '@react-navigation/bottom-tabs',
  () => ({
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: any) => children,
      Screen: ({ component: Component, children }: any) => {
        if (Component) return <Component />;
        if (typeof children === 'function') return children({});
        return children || null;
      },
    }),
  }),
  { virtual: true }
);

jest.mock(
  'react-native-toast-notifications',
  () => ({
    useToast: () => ({
      show: jest.fn(),
    }),
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
  }),
  { virtual: true }
);

jest.mock('react-native-linear-gradient', () => 'LinearGradient', { virtual: true });

describe('ManaMix Screens & Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('App renders correctly with Navigator', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
      await Promise.resolve();
    });
    expect(renderer.toJSON()).toBeTruthy();
  });

  test('SplashScreen renders correctly in light mode', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    let renderer: any;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<SplashScreen />);
    });
    expect(renderer.toJSON()).toBeTruthy();
  });

  test('SplashScreen renders correctly in dark mode', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    let renderer: any;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<SplashScreen />);
    });
    expect(renderer.toJSON()).toBeTruthy();
  });

  test('SplashScreen triggers navigation to login after 30s timer', async () => {
    const mockNavigate = jest.fn();
    const navigation = { navigate: mockNavigate };

    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<SplashScreen navigation={navigation} />);
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    // Not called before 30s
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(29000);
    });
    expect(mockNavigate).not.toHaveBeenCalled();

    // Triggered at 30s
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  test('LoginScreen renders correctly in light and dark mode and triggers navigation', async () => {
    const mockNavigate = jest.fn();
    const navigation = { navigate: mockNavigate };

    (useColorScheme as jest.Mock).mockReturnValue('light');
    let rendererLight: any;
    await ReactTestRenderer.act(() => {
      rendererLight = ReactTestRenderer.create(<LoginScreen navigation={navigation} />);
    });
    expect(rendererLight.toJSON()).toBeTruthy();
    expect(JSON.stringify(rendererLight.toJSON())).toContain('Login to Continue');

    // Click "Forgot?"
    const forgotLinks = rendererLight.root.findAll(
      (node: any) =>
        node.props?.children === 'Forgot?' ||
        (Array.isArray(node.props?.children) &&
          node.props.children.includes('Forgot?'))
    );
    let forgotTouchable = forgotLinks[0];
    while (forgotTouchable && !forgotTouchable.props?.onPress) {
      forgotTouchable = forgotTouchable.parent;
    }
    await ReactTestRenderer.act(() => {
      forgotTouchable.props.onPress();
    });
    expect(mockNavigate).toHaveBeenCalledWith('forgotPassword');

    (useColorScheme as jest.Mock).mockReturnValue('dark');
    let rendererDark: any;
    await ReactTestRenderer.act(() => {
      rendererDark = ReactTestRenderer.create(<LoginScreen navigation={navigation} />);
    });
    expect(rendererDark.toJSON()).toBeTruthy();
  });

  test('ForgotPasswordScreen renders correctly and navigates to otpScreen', async () => {
    const mockNavigate = jest.fn();
    const navigation = { navigate: mockNavigate };

    (useColorScheme as jest.Mock).mockReturnValue('light');
    let rendererLight: any;
    await ReactTestRenderer.act(() => {
      rendererLight = ReactTestRenderer.create(
        <ForgotPasswordScreen navigation={navigation} />
      );
    });
    expect(rendererLight.toJSON()).toBeTruthy();
    expect(JSON.stringify(rendererLight.toJSON())).toContain('Forgot Password');

    // Enter email
    const emailInput = rendererLight.root.findByProps({ placeholder: 'Enter your email' });
    await ReactTestRenderer.act(() => {
      emailInput.props.onChangeText('testuser@example.com');
    });

    const sendOtpButton = rendererLight.root.findAll(
      (node: any) =>
        node.props?.children === 'Send OTP Code' ||
        (Array.isArray(node.props?.children) &&
          node.props.children.includes('Send OTP Code'))
    )[0];
    let sendTouchable = sendOtpButton;
    while (sendTouchable && !sendTouchable.props?.onPress) {
      sendTouchable = sendTouchable.parent;
    }

    await ReactTestRenderer.act(() => {
      sendTouchable.props.onPress();
    });

    // Advance simulated request
    await ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('otpScreen', { email: 'testuser@example.com' });

    (useColorScheme as jest.Mock).mockReturnValue('dark');
    let rendererDark: any;
    await ReactTestRenderer.act(() => {
      rendererDark = ReactTestRenderer.create(
        <ForgotPasswordScreen navigation={navigation} />
      );
    });
    expect(rendererDark.toJSON()).toBeTruthy();
  });

  test('OtpScreen renders correctly and navigates back to login', async () => {
    const mockNavigate = jest.fn();
    const navigation = { navigate: mockNavigate };

    (useColorScheme as jest.Mock).mockReturnValue('light');
    let rendererLight: any;
    await ReactTestRenderer.act(() => {
      rendererLight = ReactTestRenderer.create(
        <OtpScreen
          navigation={navigation}
          route={{ params: { email: 'user@example.com' } }}
        />
      );
    });
    expect(rendererLight.toJSON()).toBeTruthy();
    expect(JSON.stringify(rendererLight.toJSON())).toContain('Verify OTP');
    expect(JSON.stringify(rendererLight.toJSON())).toContain('user@example.com');

    // Click "Go back to Login"
    const backToLoginLinks = rendererLight.root.findAll(
      (node: any) =>
        node.props?.children === 'Go back to Login' ||
        (Array.isArray(node.props?.children) &&
          node.props.children.includes('Go back to Login'))
    );
    let backTouchable = backToLoginLinks[0];
    while (backTouchable && !backTouchable.props?.onPress) {
      backTouchable = backTouchable.parent;
    }
    await ReactTestRenderer.act(() => {
      backTouchable.props.onPress();
    });
    expect(mockNavigate).toHaveBeenCalledWith('login');

    (useColorScheme as jest.Mock).mockReturnValue('dark');
    let rendererDark: any;
    await ReactTestRenderer.act(() => {
      rendererDark = ReactTestRenderer.create(
        <OtpScreen
          navigation={navigation}
          route={{ params: { email: 'user@example.com' } }}
        />
      );
    });
    expect(rendererDark.toJSON()).toBeTruthy();
  });
});


