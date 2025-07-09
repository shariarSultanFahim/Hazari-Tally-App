import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Text className="text-yellow-300 text-lg mt-4">
        This should be styled
      </Text>
      <Link href="/welcome/welcome">Welcome</Link>
    </View>
  );
}
