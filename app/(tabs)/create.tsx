import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateScreen() {
  const router = useRouter();
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
  const [gameTitle, setGameTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState("1000");
  const [roundScore, setRoundScore] = useState("360");

  useEffect(() => {
    if (players.length === 3) {
      setRoundScore("270");
    } else if (players.length === 4) {
      setRoundScore("360");
    } else {
      setRoundScore("360");
    }
  }, [players]);

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 3) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const saveGame = async () => {
    if (gameTitle.trim() === "") {
      Alert.alert("Error", "Please enter a game title");
      return;
    }
    if (totalPoints.trim() === "") {
      Alert.alert("Error", "Please enter total points");
      return;
    }
    if (players.some((p) => p.trim() === "")) {
      Alert.alert("Error", "Please enter names for all players");
      return;
    }
    const validPlayers = players.filter((p) => p.trim() !== "");
    if (validPlayers.length < 3) {
      Alert.alert("Error", "Please add at least 3 players");
      return;
    }

    try {
      const gameId = Date.now().toString();
      const newGame = {
        id: gameId,
        title: gameTitle.trim(),
        players: validPlayers,
        createdAt: new Date().toISOString(),
        totalPoints: parseInt(totalPoints) || 1000,
        roundScore: parseInt(roundScore) || 360,
        currentRound: 1,
        status: "active",
        scores: validPlayers.map((player) => ({
          player,
          score: 0,
        })),
      };

      const existingGames = await AsyncStorage.getItem("games");
      const games = existingGames ? JSON.parse(existingGames) : [];

      games.unshift(newGame);

      await AsyncStorage.setItem("games", JSON.stringify(games));

      setGameTitle("");
      setPlayers(["", "", "", ""]);
      setTotalPoints("1000");
      setRoundScore("360");

      // Navigate to game details instead of home
      router.replace(`/components/game.details?id=${gameId}`);
    } catch (error) {
      console.error("Error saving game:", error);
      Alert.alert("Error", "Failed to save game");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 25}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: "#181232" }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "ios" ? 100 : 150,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-8 py-8">
          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-2">
              Game Title
            </Text>
            <TextInput
              className="px-4 py-3 text-base text-white"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#ffffff",
                backgroundColor: "transparent",
              }}
              maxLength={40}
              placeholder="Enter game title..."
              placeholderTextColor="#a5d7e8"
              value={gameTitle}
              onChangeText={setGameTitle}
              returnKeyType="next"
            />
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-2">
              Total Points
            </Text>
            <TextInput
              className="px-4 py-3 text-base text-white"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#ffffff",
                backgroundColor: "transparent",
              }}
              placeholder="Enter total points..."
              placeholderTextColor="#a5d7e8"
              value={totalPoints}
              onChangeText={setTotalPoints}
              keyboardType={
                Platform.OS === "android" ? "numeric" : "number-pad"
              }
              returnKeyType="next"
            />
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-2">
              Round Score
            </Text>
            <TextInput
              className="px-4 py-3 text-base text-white"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#ffffff",
                backgroundColor: "transparent",
              }}
              value={roundScore}
              onChangeText={setRoundScore}
              keyboardType={
                Platform.OS === "android" ? "numeric" : "number-pad"
              }
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-4">
              Players ({players.filter((p) => p.trim() !== "").length})
            </Text>

            {players.map((player, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <TextInput
                  maxLength={10}
                  className="flex-1 px-4 py-3 text-base mr-3 text-white"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#ffffff",
                    backgroundColor: "transparent",
                  }}
                  placeholder={`Player ${index + 1} name...`}
                  placeholderTextColor="#a5d7e8"
                  value={player}
                  onChangeText={(text) => updatePlayer(index, text)}
                  returnKeyType={index === players.length - 1 ? "done" : "next"}
                />
                {players.length > 3 && (
                  <Pressable
                    className="bg-white rounded-full p-2"
                    onPress={() => removePlayer(index)}
                  >
                    <Ionicons name="remove" size={20} color="red" />
                  </Pressable>
                )}
              </View>
            ))}

            {players.length < 4 && (
              <Pressable
                className="flex-row items-center justify-center bg-white rounded-lg py-3 mt-2"
                onPress={addPlayer}
              >
                <Ionicons name="add" size={20} color="#181232" />
                <Text className="text-[#181232] font-semibold ml-2">
                  Add Player
                </Text>
              </Pressable>
            )}
          </View>

          <Pressable
            className="bg-white rounded-lg py-4 mt-8 mb-8"
            onPress={saveGame}
          >
            <Text className="text-[#181232] font-bold text-lg text-center">
              Create Game
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
