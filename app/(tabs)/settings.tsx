import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Alert, BackHandler, Pressable, Text, View } from "react-native";

export default function SettingsScreen() {
  const clearAllHistory = async () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all game history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("games");
              Alert.alert("Success", "All game history has been cleared");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const closeApp = () => {
    Alert.alert("Close App", "Are you sure you want to close the app?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Close",
        style: "destructive",
        onPress: () => BackHandler.exitApp(),
      },
    ]);
  };

  const SettingButton = ({
    icon,
    title,
    subtitle,
    onPress,
    color = "#2e0249",
    dangerous = false,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
    dangerous?: boolean;
  }) => (
    <Pressable
      className={`flex-row items-center ${
        dangerous ? "bg-red-50" : "bg-white"
      } rounded-lg px-6 py-4 mb-4 shadow-sm`}
      onPress={onPress}
    >
      <View
        className={`${
          dangerous ? "bg-red-500" : "bg-[#2e0249]"
        } rounded-full p-3 mr-4`}
      >
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <View className="flex-1">
        <Text
          className={`text-lg font-semibold ${
            dangerous ? "text-red-700" : "text-gray-800"
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-sm mt-1 ${
            dangerous ? "text-red-600" : "text-gray-600"
          }`}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={dangerous ? "#dc2626" : "#9ca3af"}
      />
    </Pressable>
  );

  return (
    <View className="flex-1 " style={{ backgroundColor: "#181232" }}>
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-white mb-8">Settings</Text>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-white mb-4">
            Data Management
          </Text>

          <SettingButton
            icon="trash"
            title="Clear All History"
            subtitle="Delete all saved games and data"
            onPress={clearAllHistory}
            dangerous={true}
          />
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-white mb-4">
            Application
          </Text>

          <SettingButton
            icon="exit"
            title="Close App"
            subtitle="Exit the application"
            onPress={closeApp}
            dangerous={true}
          />
        </View>

        <View className="items-center mt-12">
          <Text className="text-gray-500 text-sm">Hazari Tally App</Text>
          <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}
