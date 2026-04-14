import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from 'nativewind';

import {SafeAreaProvider, SafeAreaView as RNSafe } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafe);

export default function App() {
  return (
    <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-xl font-bold text-success">
              Welcome to Nativewind!
            </Text>
            <Link href="/onBoardingScreen" className="mt-4 p-4 bg-primary text-white rounded-lg">Go to OnBoarding</Link>
            
            <Link href="/(auth)/sign_in" className="mt-4 p-4 bg-primary text-white rounded-lg">Login</Link>
            <Link href="/(auth)/signup" className="mt-4 p-4 bg-primary text-white rounded-lg">Sign Up</Link>

            <Link  href="/(tabs)/subscriptions" className="mt-4 p-4 bg-primary text-white rounded-lg">Spotify</Link>
          </SafeAreaView>
    </SafeAreaProvider>

  );
}