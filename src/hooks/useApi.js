import axios from 'axios';
import { BASE_URL } from '../Api/Elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../App';

const handleUnauthorized = async () => {
  try {
    // Clear token from storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    
    // Navigate to login screen
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    }
  } catch (error) {
    console.error('Error handling unauthorized:', error);
  }
};

export const useApi = () => {
  const request = async (method, endpoint, data = {}) => {
    let token = null;
    try {
      token = await AsyncStorage.getItem('token');
    } catch (error) {
      console.warn('Failed to get token from storage:', error);
    }

    const isFormData = data instanceof FormData;

    try {
      const response = await axios({
        method,
        url: `${BASE_URL}${endpoint}`,
        data,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Check for 401 unauthorized or unauthorized message in response
      const status = error?.response?.status;
      const message = error?.response?.data?.message || '';
      const isUnauthorized = status === 401 || 
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('unauthenticated');
      
      if (isUnauthorized) {
        await handleUnauthorized();
      }
      
      return {
        status: status || 500,
        message: message || 'Something went wrong',
        isUnauthorized: isUnauthorized,
      };
    }
  };

  return { request };
};
