import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// Cache keys that can be cleared
const CACHE_KEYS = [
  'cachedData',
  'userCache',
  'apiCache',
];

/**
 * Clear specific AsyncStorage cache keys
 */
export const clearAsyncStorageCache = async () => {
  try {
    for (const key of CACHE_KEYS) {
      await AsyncStorage.removeItem(key);
    }
    console.log('AsyncStorage cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage cache:', error);
    return false;
  }
};

/**
 * Clear RNFS cache directory (downloaded files, temp files)
 */
export const clearFileCache = async () => {
  try {
    const cacheDir = RNFS.CachesDirectoryPath;
    
    // Check if cache directory exists
    const exists = await RNFS.exists(cacheDir);
    if (exists) {
      const files = await RNFS.readDir(cacheDir);
      
      // Delete all files in cache directory
      for (const file of files) {
        await RNFS.unlink(file.path);
      }
    }
    
    console.log('File cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing file cache:', error);
    return false;
  }
};

/**
 * Clear all app cache (AsyncStorage + File System)
 */
export const clearAllCache = async () => {
  const asyncStorageResult = await clearAsyncStorageCache();
  const fileCacheResult = await clearFileCache();
  
  return asyncStorageResult && fileCacheResult;
};

/**
 * Start an interval to automatically clear cache
 * @param {number} intervalMs - Interval in milliseconds (default: 5 minutes)
 * @returns {Function} - Function to stop the interval
 */
export const startCacheClearInterval = (intervalMs = 300000) => {
  // Clear cache immediately on start
  clearAllCache();
  
  // Set up interval for periodic cache clearing
  const intervalId = setInterval(() => {
    console.log(`Clearing cache at interval: ${intervalMs}ms`);
    clearAllCache();
  }, intervalMs);
  
  // Return a function to stop the interval
  return () => {
    clearInterval(intervalId);
    console.log('Cache clear interval stopped');
  };
};

/**
 * Get current cache size (approximate)
 * @returns {Promise<number>} - Size in bytes
 */
export const getCacheSize = async () => {
  try {
    const cacheDir = RNFS.CachesDirectoryPath;
    const exists = await RNFS.exists(cacheDir);
    
    if (!exists) return 0;
    
    const files = await RNFS.readDir(cacheDir);
    let totalSize = 0;
    
    for (const file of files) {
      totalSize += file.size;
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
};
