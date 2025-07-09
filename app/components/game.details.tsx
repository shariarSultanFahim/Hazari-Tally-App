import CelebrationAnimation from "@/assets/LottieAnimation/Celebration/celebration";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Player {
  player: string;
  score: number;
}

interface RoundHistory {
  round: number;
  scores: { [playerName: string]: number };
  timestamp: string;
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
  history: RoundHistory[];
}

export default function GameDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [currentScores, setCurrentScores] = useState<{ [key: string]: string }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const loadGame = useCallback(async () => {
    try {
      setLoading(true);
      const storedGames = await AsyncStorage.getItem("games");
      if (storedGames) {
        const games = JSON.parse(storedGames);
        const foundGame = games.find((g: Game) => g.id === id);
        if (foundGame) {
          // Ensure history exists
          if (!foundGame.history) {
            foundGame.history = [];
          }
          setGame(foundGame);
          // Initialize current scores
          const initialScores: { [key: string]: string } = {};
          foundGame.scores.forEach((score: Player) => {
            initialScores[score.player] = "0";
          });
          setCurrentScores(initialScores);
        }
      }
    } catch (error) {
      console.error("Error loading game:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchWinner = useCallback(async () => {
    try {
      const storedGames = await AsyncStorage.getItem("games");
      const games = storedGames ? JSON.parse(storedGames) : [];
      const foundGame = games.find((g: Game) => g.id === id);
      if (
        foundGame &&
        foundGame.scores &&
        foundGame.status !== "active" &&
        foundGame.scores.length > 0
      ) {
        // Find the player with the highest score
        const maxScore = Math.max(
          ...foundGame.scores.map((s: Player) => s.score)
        );
        const winnerPlayer =
          foundGame.scores.find((s: Player) => s.score === maxScore) || null;
        setWinner(winnerPlayer);
        setShowCelebration(true);
      }
    } catch (error) {
      console.error("Error fetching winner:", error);
    }
  }, [id]);

  // Load game data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGame();
      fetchWinner();
    }, [loadGame, fetchWinner])
  );

  const updateCurrentScore = (player: string, score: string) => {
    setCurrentScores((prev) => ({
      ...prev,
      [player]: score,
    }));
  };

  const fillRemainingScore = (targetPlayer: string) => {
    if (!game) return;

    // Calculate total of other players' scores
    const otherPlayersTotal = Object.entries(currentScores)
      .filter(([player]) => player !== targetPlayer)
      .reduce((sum, [, score]) => sum + (parseInt(score) || 0), 0);

    // Calculate remaining score
    const remainingScore = game.roundScore - otherPlayersTotal;

    // Update the target player's score
    setCurrentScores((prev) => ({
      ...prev,
      [targetPlayer]: remainingScore.toString(),
    }));
  };

  const addScores = async () => {
    if (!game) return;

    // Validate scores
    const totalCurrentScore = Object.values(currentScores).reduce(
      (sum, score) => {
        return sum + (parseInt(score) || 0);
      },
      0
    );

    if (totalCurrentScore !== game.roundScore) {
      Alert.alert("Error", `Total scores must equal ${game.roundScore}`);
      return;
    }

    try {
      // Update game scores
      const updatedScores = game.scores.map((playerScore) => {
        const currentScore = parseInt(currentScores[playerScore.player]) || 0;
        return {
          ...playerScore,
          score: playerScore.score + currentScore,
        };
      });

      // Create round history entry
      const roundScores: { [playerName: string]: number } = {};
      Object.entries(currentScores).forEach(([player, score]) => {
        roundScores[player] = parseInt(score) || 0;
      });

      const newRoundHistory: RoundHistory = {
        round: game.currentRound,
        scores: roundScores,
        timestamp: new Date().toISOString(),
      };

      // Check if game is finished
      const maxScore = Math.max(...updatedScores.map((s) => s.score));
      const isGameFinished = maxScore >= game.totalPoints;

      const updatedGame = {
        ...game,
        scores: updatedScores,
        currentRound: game.currentRound + 1,
        status: isGameFinished ? "completed" : "active",
        history: [...(game.history || []), newRoundHistory],
      };

      // Save to storage
      const storedGames = await AsyncStorage.getItem("games");
      const games = storedGames ? JSON.parse(storedGames) : [];
      const gameIndex = games.findIndex((g: Game) => g.id === game.id);

      if (gameIndex !== -1) {
        games[gameIndex] = updatedGame;
        await AsyncStorage.setItem("games", JSON.stringify(games));
        setGame(updatedGame);

        // Reset current scores
        const resetScores: { [key: string]: string } = {};
        updatedGame.scores.forEach((score: Player) => {
          resetScores[score.player] = "0";
        });
        setCurrentScores(resetScores);

        if (isGameFinished) {
          const winnerPlayer = updatedScores.find(
            (s) => s.score >= game.totalPoints
          );
          setWinner(winnerPlayer || null);
          setShowCelebration(true);

          // Auto-hide celebration after 5 seconds
          setTimeout(() => {
            setShowCelebration(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Error updating game:", error);
      Alert.alert("Error", "Failed to update scores");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#181232" }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="bg-white rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#181232" />
        </Pressable>
        <Text className="text-white text-lg font-bold flex-1 text-center">
          {game.title}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Game Info */}
        <View className="bg-white rounded-lg p-4 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#181232] font-bold text-lg">
              Game Information
            </Text>
            <Pressable
              className="bg-[#181232] rounded-lg px-3 py-2"
              onPress={() => router.push(`/components/edit-game?id=${game.id}`)}
            >
              <Ionicons name="pencil" size={16} color="white" />
            </Pressable>
          </View>
          <Text className="text-gray-600 mb-1">
            Created: {formatDate(game.createdAt)}
          </Text>
          <Text className="text-gray-600 mb-1">
            Total Points: {game.totalPoints}
          </Text>
          <Text className="text-gray-600 mb-1">
            Round Score: {game.roundScore}
          </Text>
          <Text className="text-gray-600 mb-1">
            Current Round: {game.currentRound}
          </Text>
          <Text className="text-gray-600">Status: {game.status}</Text>
        </View>

        {/* Current Scores */}
        <View className="bg-white rounded-lg p-4 mb-6">
          <Text className="text-[#181232] font-bold text-lg mb-4">
            Current Scores
          </Text>
          {[...game.scores]
            .sort((a, b) => b.score - a.score)
            .map((playerScore, index) => (
              <View
                key={playerScore.player}
                className="flex-row justify-between items-center mb-2"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-[#181232] mr-3 flex items-center justify-center">
                    <Text className="text-white text-sm font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="text-gray-800 font-semibold flex-1">
                    {playerScore.player}
                  </Text>
                </View>
                <Text className="text-gray-600 text-lg font-bold">
                  {playerScore.score}
                </Text>
              </View>
            ))}
        </View>

        {/* Add Scores (only if game is active) */}
        {game.status === "active" && (
          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-[#181232] font-bold text-lg mb-4">
              Add Scores for Round {game.currentRound}
            </Text>
            {game.scores.map((playerScore, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <Text className="text-gray-800 font-semibold flex-1">
                  {playerScore.player}
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-center w-20 mr-2"
                    value={currentScores[playerScore.player]}
                    onChangeText={(text) =>
                      updateCurrentScore(playerScore.player, text)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Pressable
                    className="bg-[#181232] rounded-lg px-3 py-2"
                    onPress={() => fillRemainingScore(playerScore.player)}
                  >
                    <Ionicons name="calculator" size={16} color="white" />
                  </Pressable>
                </View>
              </View>
            ))}

            <Pressable
              className="bg-[#181232] rounded-lg py-3 mt-4"
              onPress={addScores}
            >
              <Text className="text-white font-bold text-center">
                Add Scores
              </Text>
            </Pressable>
          </View>
        )}

        {/* Round History */}
        {game.history && game.history.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-[#181232] font-bold text-lg mb-4">
              Round History
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header Row: Player Names */}
                <View className="flex-row mb-3">
                  <View className="w-16" />
                  {game.scores.map((player, index) => (
                    <View key={index} className="w-20 justify-center">
                      <Text className="text-gray-800 font-semibold text-center text-xs">
                        {player.player}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Round Rows: Round number and player scores */}
                {[...game.history].reverse().map((round, roundIndex) => (
                  <View key={roundIndex} className="flex-row mb-2">
                    <View className="w-16 justify-center py-2">
                      <Text className="text-gray-800 font-medium text-sm text-center">
                        R{round.round}
                      </Text>
                    </View>
                    {game.scores.map((player, playerIndex) => (
                      <View
                        key={playerIndex}
                        className="w-20 justify-center py-2"
                      >
                        <Text className="text-gray-600 text-center text-sm">
                          {round.scores[player.player] ?? 0}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Game Completed */}
        {game.status === "completed" && (
          <View className="bg-green-100 rounded-lg p-4 mb-6">
            <Text className="text-green-800 font-bold text-lg mb-2">
              Game Completed!
            </Text>
            <Text className="text-green-600">
              Winner:{" "}
              {game.scores.find((s) => s.score >= game.totalPoints)?.player}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Celebration Animation Overlay */}
      {showCelebration && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 100,
          }}
        >
          {/* Animation on top */}
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CelebrationAnimation />
          </View>

          {/* Winner announcement at bottom */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 40,
              paddingVertical: 30,
              marginHorizontal: 40,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#181232",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Game Completed!
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#2e7d32",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {winner?.player} Wins!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Final Score: {winner?.score} points
            </Text>
            <Pressable
              style={{
                backgroundColor: "#181232",
                paddingHorizontal: 30,
                paddingVertical: 12,
                borderRadius: 25,
              }}
              onPress={() => setShowCelebration(false)}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
