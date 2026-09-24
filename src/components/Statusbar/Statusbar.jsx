import React from "react";
import { StatusBar, View, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Statusbar = ({ backgroundColor = "#ffffff", barStyle = "dark-content" }) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
      {Platform.OS === "ios" && <View style={{ height: 0 }} />}
    </SafeAreaView>
  );
};

export default Statusbar;

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
});
