import card1Image from "@/assets/cards/card1.png";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import GameHistoryCard from "../components/GameHistoryCard";
interface Game {
  id: string;
  title: string;
  players: string[];
  createdAt: string;
  totalPoints: number;
  status: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);

  const loadGames = async () => {
    try {
      const storedGames = await AsyncStorage.getItem("games");
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }
    } catch (error) {
      console.error("Error loading games:", error);
    }
  };

  // Load games when component mounts
  useEffect(() => {
    loadGames();
  }, []);

  // Reload games when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const deleteGame = async (gameId: string) => {
    Alert.alert("Delete Game", "Are you sure you want to delete this game?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedGames = games.filter((game) => game.id !== gameId);
            await AsyncStorage.setItem("games", JSON.stringify(updatedGames));
            setGames(updatedGames);
          } catch (error) {
            console.error("Error deleting game:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0E0045" }}>
      {/* Header with Create Button */}
      <LinearGradient
        colors={["#396197", "#5D1DC1"]}
        style={{
          height: "35%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          borderBottomLeftRadius: 9999,
          borderBottomRightRadius: 9999,
        }}
      >
        <View className="items-center">
          <Image
            source={card1Image}
            className="w-40 h-40 mb-6"
            resizeMode="contain"
          />
          <Pressable
            className="bg-white rounded-full px-6 py-4"
            onPress={() => router.push("/(tabs)/create")}
          >
            <Text className="text-[#2e0249] font-semibold">Create Game</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Game History List */}
      <ScrollView
        className="flex-1 px-6 py-8"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "ios" ? 100 : 150,
        }}
      >
        <Text className="text-2xl font-bold text-white mb-4">Game History</Text>
        <Text className="text-gray-300 mb-4">
          {games.length} {games.length === 1 ? "game" : "games"} created
        </Text>
        {/* If no games, show empty state */}
        {games.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons
              name="game-controller-outline"
              size={64}
              color="#9ca3af"
            />
            <Text className="text-gray-500 text-lg mt-4 text-center">
              No games created yet
            </Text>
          </View>
        ) : (
          games.map((game) => (
            <GameHistoryCard key={game.id} game={game} onDelete={deleteGame} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
