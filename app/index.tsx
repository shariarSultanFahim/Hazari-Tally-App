import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <View className="min-h-[35vh] my-8 flex flex-col items-center justify-center">
        <Image
          source={require("@/assets/cards/card1.png")}
          className="h-[50vw] w-[50vw] max-h-60 max-w-[240px]"
        />
      </View>
      <Text
        style={{
          color: Colors.dark.tint,
          fontFamily: "Righteous_400Regular",
          fontWeight: "400",
          fontSize: 24,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Hazari Tally
      </Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontFamily: "Outfit_400Regular",
          fontWeight: "500",
          maxWidth: "80%",

          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Track your Hazari scores easily and focus on the game.
      </Text>
      <Pressable
        className="bg-white rounded-full  px-8 py-4 my-8"
        onPress={() => router.push("/onbording")}
      >
        <Text className="text-[#2e0249] font-semibold text-lg">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
