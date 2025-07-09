import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import card2 from "@/assets/cards/card2.png";
import card3 from "@/assets/cards/card3.png";
import card4 from "@/assets/cards/card4.png";

interface Game {
  id: string;
  title: string;
  players: string[];
  createdAt: string;
  totalPoints: number;
  status: string;
}

interface GameHistoryCardProps {
  game: Game;
  onDelete: (gameId: string) => void;
}

const cardImages = [card2, card3, card4];

export default function GameHistoryCard({
  game,
  onDelete,
}: GameHistoryCardProps) {
  // Generate a consistent random card based on game ID
  const getRandomCard = (gameId: string) => {
    const hash = gameId.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return cardImages[hash % cardImages.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      className=" rounded-2xl p-4 mb-4 shadow-lg"
      style={{ backgroundColor: "#5D1DC1" }}
    >
      <View className="flex-row items-center justify-between mb-3">
        {/* Card Icon and Title */}
        <View className="flex-row items-center flex-1">
          <View className="bg-transparent rounded-full p-2 mr-3">
            <Image
              source={getRandomCard(game.id)}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold">{game.title}</Text>
              {game.status === "active" && (
                <View className="bg-green-500 rounded-full w-3 h-3 ml-2" />
              )}
            </View>
            <Text className="text-gray-300 text-sm">
              {formatDate(game.createdAt)} at {formatTime(game.createdAt)}
            </Text>
          </View>
        </View>

        {/* Delete Button */}
        <Pressable
          className="bg-red-500 rounded-full p-2"
          onPress={() => onDelete(game.id)}
        >
          <Ionicons name="trash" size={16} color="white" />
        </Pressable>
      </View>

      {/* Game Info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#a5d7e8" />
          <Text className="text-gray-300 text-sm ml-2">
            {game.players.length} Person, {game.totalPoints || 1000} Points
          </Text>
        </View>

        {/* Status indicator */}
        <View className="bg-gray-600 rounded-full px-3 py-1">
          <Text className="text-white text-xs">
            {game.status === "active" ? "Running" : "Finished"}
          </Text>
        </View>
      </View>

      {/* Players List */}
      <View className="mt-3 pt-3 border-t border-gray-600">
        <Text className="text-gray-400 text-xs mb-1">Players:</Text>
        <Text className="text-white text-sm">{game.players.join(", ")}</Text>
      </View>
    </View>
  );
}
