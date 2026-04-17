import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser, useClerk } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded } = useAuth();
  const router = useRouter();
  
  // Compute email verification status from Clerk user data
  const isEmailVerified = user?.emailAddresses?.some(email => email.verification?.status === 'verified') ?? false;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign_in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-[#fff9e3] items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fff9e3]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-5 py-6">
          <Text className="text-3xl font-sans-bold text-[#081126]">Welcome back</Text>
        </View>

        {/* User Profile Card */}
        <View className="px-5 mb-6">
          <View className="bg-[#fff8e7] rounded-2xl p-4 border border-[#f6eecf]">
            {/* Avatar */}
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 rounded-full bg-[#ea7a53] items-center justify-center">
                <Text className="text-2xl font-sans-bold text-white">
                  {user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-sans-bold text-[#081126]">
                  {user.firstName || 'User'}
                </Text>
                <Text className="text-sm text-[#081126]/60">
                  {user.emailAddresses[0]?.emailAddress}
                </Text>
              </View>
            </View>

            {/* Account Info */}
            <View className="border-t border-[#f6eecf] pt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-[#081126]/70 font-sans-medium">Account created</Text>
                <Text className="text-sm text-[#081126] font-sans-semibold">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-[#081126]/70 font-sans-medium">Email verified</Text>
                <View className="flex-row items-center gap-1">
                  <View className={`w-2 h-2 rounded-full ${isEmailVerified ? 'bg-[#16a34a]' : 'bg-[#d1d5db]'}`} />
                  <Text className={`text-sm font-sans-semibold ${isEmailVerified ? 'text-[#16a34a]' : 'text-[#6b7280]'}`}>
                    {isEmailVerified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View className="px-5 gap-3 mb-6">
          <Link href="/(tabs)" asChild>
            <Pressable className="bg-[#fff8e7] rounded-2xl p-4 flex-row items-center justify-between border border-[#f6eecf] active:opacity-70">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="dashboard" size={24} color={colors.accent} />
                <View>
                  <Text className="font-sans-semibold text-[#081126]">Dashboard</Text>
                  <Text className="text-xs text-[#081126]/60">View your subscriptions</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
            </Pressable>
          </Link>

          <Pressable className="bg-[#fff8e7] rounded-2xl p-4 flex-row items-center justify-between border border-[#f6eecf] active:opacity-70">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="settings" size={24} color={colors.accent} />
              <View>
                <Text className="font-sans-semibold text-[#081126]">Settings</Text>
                <Text className="text-xs text-[#081126]/60">Manage your account</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <View className="px-5 gap-3">
          <Pressable
            onPress={handleSignOut}
            className="bg-[#dc2626] rounded-2xl py-3 px-5 flex-row justify-center items-center active:opacity-80"
          >
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text className="text-white font-sans-semibold text-base ml-2">Sign out</Text>
          </Pressable>

          <Text className="text-xs text-[#081126]/50 text-center font-sans-regular">
            Your session is securely stored
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
