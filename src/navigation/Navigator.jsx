import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Splash from '../screens/Splash/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import otpScreen from '../screens/Auth/OtpScreen';
import BottomTab from '../navigation/BottomTab';
import { useToast } from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../App';

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        toast.show('Error reading token', { type: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      {loading ? null : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {token ? (
            <Stack.Screen name="bottomTab">
              {props => <BottomTab {...props} setToken={setToken} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="splash" component={Splash} />
              <Stack.Screen name="login">
                {props => <LoginScreen {...props} setToken={setToken} />}
              </Stack.Screen>
              <Stack.Screen
                name="forgotPassword"
                component={ForgotPasswordScreen}
              />
              <Stack.Screen name="otpScreen" component={otpScreen} />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Navigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    height: 60,
    paddingTop: 8,
    paddingBottom: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});
