import card1Image from "@/assets/cards/card1.png";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-between items-center px-6 py-12 ">
      <View />
      <Image
        source={card1Image}
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      />
      <View className="items-center">
        <Text className="text-3xl text-[#a5d7e8] font-bold mb-2">
          Hazari Tally
        </Text>
        <Text className="text-center text-white opacity-70">
          Track your Hazari scores easily and focus on the game.
        </Text>
      </View>

      <Pressable
        className="bg-white rounded-full px-8 py-4 mt-8"
        onPress={() => router.push("/(tabs)")}
      >
        <Text className="text-[#2e0249] font-semibold text-lg">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
