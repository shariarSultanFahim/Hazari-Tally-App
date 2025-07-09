import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const CelebrationAnimation = () => {
  return (
    <View style={styles.animationContainer}>
      <LottieView
        source={require("./Celebration.json")}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default CelebrationAnimation;
