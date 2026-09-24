import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Asset imports
const lightBackground = require('../../Assets/img/lightbackground.png');
const darkBackground = require('../../Assets/img/darkbackground.png');
const lightLogo = require('../../Assets/img/lightlogo.png');
const darkLogo = require('../../Assets/img/darklogo.png');
const lightDivider = require('../../Assets/img/divider_light.png');
const darkDivider = require('../../Assets/img/divider_dark.png');

/**
 * @param {{ navigation?: any }} [props]
 */
const SplashScreen = (props = {}) => {
  const { navigation } = props;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { width: winWidth } = useWindowDimensions();
  const screenWidth =
    (winWidth && winWidth > 0 ? winWidth : null) ||
    Dimensions.get('window').width ||
    Dimensions.get('screen').width ||
    390;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation?.navigate) {
        navigation.navigate('login');
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  const currentBg = isDark ? darkBackground : lightBackground;
  const currentLogo = isDark ? darkLogo : lightLogo;
  const currentDivider = isDark ? darkDivider : lightDivider;

  // Responsive logo sizing with guaranteed non-zero fallbacks (increased size)
  const logoWidth = Math.max(Math.min(screenWidth * 0.74, 300), 240);
  const logoHeight = Math.round(
    logoWidth / (isDark ? 488 / 438 : 516 / 426)
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Layer 1: Background Image (zIndex: 1) */}
      <Image
        source={currentBg}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Layer 2: Foreground Layer explicitly above background (zIndex: 10, elevation: 10) */}
      <View style={styles.foregroundLayer}>
        {/* Exact Center Logo Area */}
        <View style={styles.logoCenterContainer}>
          <Image
            source={currentLogo}
            style={[
              styles.logo,
              {
                width: logoWidth,
                height: logoHeight,
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Section: Divider & Tagline */}
        <SafeAreaView
          style={styles.bottomSafeArea}
          edges={['bottom']}
        >
          <View style={styles.bottomContainer}>
            <Image
              source={currentDivider}
              style={styles.divider}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.tagline,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Meet. <Text style={styles.textPink}>Mix.</Text> Match.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  foregroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    elevation: 10,
  },
  logoCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 50,
    zIndex: 20,
    elevation: 20,
  },
  logo: {
    width: 290,
    height: 245,
    zIndex: 30,
    elevation: 30,
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 28 : 40,
  },
  divider: {
    width: 250,
    height: 22,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  textLight: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#2C2D35',
  },
  textPink: {
    color: '#FC3882',
  },
});
