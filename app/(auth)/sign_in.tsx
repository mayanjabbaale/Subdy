import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/expo';
import { useRouter, Link } from 'expo-router';
import { colors } from '@/constants/theme';
import { validateEmail, parseClerkError } from '@/utils/validation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaError, setMfaError] = useState<string>();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    // For sign-in, only check that password is non-empty
    // Server-side validation (Clerk) handles credential verification
    if (!password || password.trim().length === 0) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn.password({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      // Clerk Expo returns { error: ClerkError | null }
      if (result?.error) {
        setErrors({ general: parseClerkError(result.error) });
      } else {
        // Sign in successful, navigate to home
        router.replace('/(home)');
      }
    } catch (err: any) {
      setErrors({ general: parseClerkError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerify = async () => {
    if (!verificationCode.trim()) {
      setMfaError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setMfaError(undefined);

    try {
      const result = await signIn.mfa.verifyEmailCode({ code: verificationCode });

      if (result && !result.error) {
        router.replace('/(home)');
      } else {
        setMfaError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setMfaError(parseClerkError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (needsMFA) {
    return (
      <SafeAreaView className="flex-1 bg-[#fff9e3]">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ justifyContent: 'center', minHeight: '100%' }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-sans-bold text-[#081126] mb-2">Verify Your Email</Text>
              <Text className="text-base text-[#081126]/60">
                We sent a verification code to {email}
              </Text>
            </View>

            {/* MFA Code Input */}
            <View className="mb-6">
              <Text className="font-sans-semibold text-[#081126] mb-3">Verification Code</Text>
              <TextInput
                className="bg-[#fff8e7] border border-[#f6eecf] rounded-2xl px-4 py-3 text-base text-[#081126] font-sans-regular"
                placeholder="Enter 6-digit code"
                placeholderTextColor="#08112666"
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!isLoading}
                maxLength={6}
                keyboardType="number-pad"
              />
              {mfaError && (
                <Text className="text-[#dc2626] text-sm mt-2 font-sans-medium">{mfaError}</Text>
              )}
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleMFAVerify}
              disabled={isLoading || !verificationCode.trim()}
              className={`rounded-2xl py-3 px-5 flex-row justify-center items-center ${
                isLoading || !verificationCode.trim()
                  ? 'bg-[#ea7a53]/50'
                  : 'bg-[#ea7a53] active:opacity-80'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-sans-semibold text-base">Verify Code</Text>
              )}
            </Pressable>

            {/* Back Button */}
            <Pressable onPress={() => setNeedsMFA(false)} disabled={isLoading} className="mt-4">
              <Text className="text-[#081126] font-sans-medium text-center">Back to Sign In</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fff9e3]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ justifyContent: 'center', minHeight: '100%' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-sans-bold text-[#081126]">Welcome back</Text>
            <Text className="text-base text-[#081126]/60 mt-2">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          {/* General Error */}
          {errors.general && (
            <View className="bg-[#fecaca] border border-[#fca5a5] rounded-lg p-3 mb-6">
              <Text className="text-[#dc2626] font-sans-medium text-sm">{errors.general}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-5">
            <Text className="font-sans-semibold text-[#081126] mb-2">Email address</Text>
            <TextInput
              className={`bg-[#fff8e7] border-2 rounded-2xl px-4 py-3 text-base font-sans-regular ${
                errors.email ? 'border-[#dc2626]' : 'border-[#f6eecf]'
              }`}
              placeholder="Enter your email"
              placeholderTextColor="rgba(8, 17, 38, 0.4)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && (
              <Text className="text-[#dc2626] text-sm mt-2 font-sans-medium">{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="font-sans-semibold text-[#081126] mb-2">Password</Text>
            <View className={`flex-row items-center bg-[#fff8e7] border-2 rounded-2xl px-4 ${
                errors.password ? 'border-[#dc2626]' : 'border-[#f6eecf]'
              }`}>
              <TextInput
                className="flex-1 py-3 text-base font-sans-regular text-[#081126]"
                placeholder="Enter your password"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                editable={!isLoading}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="p-2"
                disabled={isLoading}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.primary}
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text className="text-[#dc2626] text-sm mt-2 font-sans-medium">{errors.password}</Text>
            )}
          </View>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            className={`rounded-2xl py-3 px-5 flex-row justify-center items-center ${
              isLoading ? 'bg-[#ea7a53]/50' : 'bg-[#ea7a53] active:opacity-80'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-sans-semibold text-base">Sign in</Text>
            )}
          </Pressable>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-6 gap-2">
            <Text className="text-[#081126] font-sans-regular">{`${"Don't have an account?"}`}</Text>
            <Link href="/(auth)/signup">
              <Text className="text-[#ea7a53] font-sans-semibold">Create an account</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}