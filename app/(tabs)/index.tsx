import "@/global.css"
import { Text, View } from "react-native";
import { Link } from "expo-router";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onBoardingScreen" className="mt-4 p-4 bg-primary text-white rounded-lg">Go to OnBoarding</Link>
      
      <Link href="/(auth)/sign_in" className="mt-4 p-4 bg-primary text-white rounded-lg">Login</Link>
      <Link href="/(auth)/signup" className="mt-4 p-4 bg-primary text-white rounded-lg">Sign Up</Link>

      <Link  href={{pathname: "/(tabs)/subscriptions/[id]", params: {id: "claude"}}} className="mt-4 p-4 bg-primary text-white rounded-lg">Spotify</Link>
    </View>
  );
}