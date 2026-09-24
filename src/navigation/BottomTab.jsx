import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// const DashboardStackScreen = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Home" component={DashboardScreen} />
//       <Stack.Screen name="Notifications" component={NotificationScreen} />
//     </Stack.Navigator>
//   );
// };
// const SettingsStackScreen = ({ setToken }) => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* <Stack.Screen name="settings" component={Settings} /> */}
//       <Stack.Screen name="settings">
//         {props => <Settings {...props} setToken={setToken} />}
//       </Stack.Screen>
//       <Stack.Screen name="profilesetting" component={Profilesetting} />
//       {/* <Stack.Screen name="defaultspeed" component={Defaultspeed} /> */}
//       <Stack.Screen name="alarm" component={Alarm} />
//       <Stack.Screen name="agreement" component={Agreement} />
//       <Stack.Screen name="privacypolicy" component={Privacypolicy} />
//       <Stack.Screen name="about" component={About} />
//     </Stack.Navigator>
//   );
// };

const BottomTab = ({ setToken }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconSource;
            try {
              if (route.name === 'Home') {
                iconSource = require('../Assets/img/home.png');
              } else if (route.name === 'Live View') {
                iconSource = require('../Assets/img/video-camera.png');
              } else if (route.name === 'Special') {
                iconSource = require('../Assets/img/star.png');
              } else if (route.name === 'Playback') {
                iconSource = require('../Assets/img/play-button.png');
              } else if (route.name === 'Alerts') {
                iconSource = require('../Assets/img/bell2.png');
              } else if (route.name === 'Settings') {
                iconSource = require('../Assets/img/setting.png');
              }
            } catch (error) {
              console.error(`Error loading icon for ${route.name}:`, error);
              return <Text style={styles.icon}>Icon Error</Text>;
            }
            return (
              <View>
                <Image
                  source={iconSource}
                  resizeMode="contain"
                  style={[
                    styles.icon,
                    {
                      tintColor: focused ? '#fff' : '#1E90FF',
                      transform: [{ scale: focused ? 1.19 : 1 }],
                    },
                  ]}
                />
              </View>
            );
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#2979FF',
          tabBarStyle: {
            height: 72 + insets.bottom,
            paddingTop: 13,
            paddingBottom: 5 + insets.bottom,
            borderTopWidth: 0.5,
            borderTopColor: '#ccc',
            backgroundColor: '#ffffff',
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#5694ffff', '#caddffff']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          ),
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={DashboardStackScreen} />
        <Tab.Screen name="Live View" component={Liveview} />
        <Tab.Screen name="Special" component={Special} />
        <Tab.Screen name="Playback" component={Playback} />
        <Tab.Screen name="Alerts" component={Alerts} />
        {/* <Tab.Screen name="Settings" component={SettingsStackScreen} /> */}
        <Tab.Screen name="Settings">
          {props => <SettingsStackScreen {...props} setToken={setToken} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    height: 72,
    paddingTop: 13,
    paddingBottom: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  icon: {
    width: 26,
    height: 28,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});
