import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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

interface Player {
  player: string;
  score: number;
}

interface Game {
  id: string;
  title: string;
  players: string[];
  createdAt: string;
  totalPoints: number;
  roundScore: number;
  currentRound: number;
  status: string;
  scores: Player[];
  history?: any[];
}

export default function EditGameScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [roundScore, setRoundScore] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadGame = async () => {
    try {
      const storedGames = await AsyncStorage.getItem("games");
      if (storedGames) {
        const games = JSON.parse(storedGames);
        const foundGame = games.find((g: Game) => g.id === id);
        if (foundGame) {
          setGame(foundGame);
          setGameTitle(foundGame.title);
          setTotalPoints(foundGame.totalPoints.toString());
          setRoundScore(foundGame.roundScore.toString());
          setPlayers([...foundGame.players]);
        }
      }
    } catch (error) {
      console.error("Error loading game:", error);
      Alert.alert("Error", "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const saveGame = async () => {
    if (!game) return;

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

    try {
      // Update game data while preserving original player scores
      const updatedGame = {
        ...game,
        title: gameTitle.trim(),
        players: players.map((p) => p.trim()),
        totalPoints: parseInt(totalPoints) || 1000,
        roundScore: parseInt(roundScore) || 360,
        // Update scores array to match new player names
        scores: players.map((playerName, index) => {
          const originalPlayer = game.players[index];
          const existingScore = game.scores.find(
            (s) => s.player === originalPlayer
          );
          return {
            player: playerName.trim(),
            score: existingScore ? existingScore.score : 0,
          };
        }),
      };

      // Update history if it exists
      if (updatedGame.history) {
        updatedGame.history = updatedGame.history.map((round: any) => {
          const updatedRoundScores: { [key: string]: number } = {};
          players.forEach((newPlayerName, index) => {
            const originalPlayer = game.players[index];
            updatedRoundScores[newPlayerName.trim()] =
              round.scores[originalPlayer] || 0;
          });
          return {
            ...round,
            scores: updatedRoundScores,
          };
        });
      }

      // Save to storage
      const storedGames = await AsyncStorage.getItem("games");
      const games = storedGames ? JSON.parse(storedGames) : [];
      const gameIndex = games.findIndex((g: Game) => g.id === game.id);

      if (gameIndex !== -1) {
        games[gameIndex] = updatedGame;
        await AsyncStorage.setItem("games", JSON.stringify(games));

        Alert.alert("Success", "Game updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving game:", error);
      Alert.alert("Error", "Failed to save game");
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#181232" }}
      >
        <Text className="text-white text-lg">Loading game...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#181232" }}
      >
        <Text className="text-white text-lg mb-4">Game not found</Text>
        <Pressable
          className="bg-white rounded-lg px-4 py-2"
          onPress={() => router.back()}
        >
          <Text className="text-[#181232] font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 25}
    >
      <View className="flex-1" style={{ backgroundColor: "#181232" }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="bg-white rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#181232" />
          </Pressable>
          <Text className="text-white text-lg font-bold flex-1 text-center">
            Edit Game
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Platform.OS === "ios" ? 100 : 150,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4 py-8">
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
                className="px-4 py-3 text-base text-gray-400"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#6b7280",
                  backgroundColor: "transparent",
                }}
                value={roundScore}
                keyboardType={
                  Platform.OS === "android" ? "numeric" : "number-pad"
                }
                editable={false}
                selectTextOnFocus={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-white mb-4">
                Players ({players.length})
              </Text>

              {players.map((player, index) => (
                <View key={index} className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-white mr-3 flex items-center justify-center">
                    <Text className="text-[#181232] text-sm font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <TextInput
                    maxLength={10}
                    className="flex-1 px-4 py-3 text-base text-white"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#ffffff",
                      backgroundColor: "transparent",
                    }}
                    placeholder={`Player ${index + 1} name...`}
                    placeholderTextColor="#a5d7e8"
                    value={player}
                    onChangeText={(text) => updatePlayer(index, text)}
                    returnKeyType={
                      index === players.length - 1 ? "done" : "next"
                    }
                  />
                </View>
              ))}
            </View>

            <View className="flex-row space-x-4">
              <Pressable
                className="flex-1 bg-gray-600 rounded-lg py-4 mr-2"
                onPress={() => router.back()}
              >
                <Text className="text-white font-bold text-lg text-center">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 bg-white rounded-lg py-4 ml-2"
                onPress={saveGame}
              >
                <Text className="text-[#181232] font-bold text-lg text-center">
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
