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
import { useSignUp, useAuth } from '@clerk/expo';
import { useRouter, Link } from 'expo-router';
import { colors } from '@/constants/theme';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  parseClerkError,
} from '@/utils/validation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { isLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'strong'>();
  const [verificationCode, setVerificationCode] = useState('');
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string>();

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-[#fff9e3] items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const validation = validatePassword(text);
    setPasswordStrength(validation.strength);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);
    if (!passwordMatchValidation.valid) {
      newErrors.confirmPassword = passwordMatchValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signUp.create({
        emailAddress: email.toLowerCase().trim(),
        password,
      });

      // In Clerk Expo, handle the signup response
      if (result && !result.error) {
        // Signup created successfully - navigate to home
        router.replace('/(home)');
      } else {
        setErrors({ general: result?.error?.message || 'Sign up failed. Please try again.' });
      }
    } catch (err: any) {
      setErrors({ general: parseClerkError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setVerificationError(undefined);

    try {
      // Email verification flow for Expo (if supported)
      // This may need to be adjusted based on your Clerk Expo setup
      setNeedsEmailVerification(false);
      router.replace('/(home)');
    } catch (err: any) {
      setVerificationError(parseClerkError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // Resend verification code logic
      // Adjust based on your Clerk Expo implementation
    } catch (err: any) {
      setVerificationError(parseClerkError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (needsEmailVerification) {
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

            {/* Verification Code Input */}
            <View className="mb-6">
              <Text className="font-sans-semibold text-[#081126] mb-3">Verification Code</Text>
              <TextInput
                className="bg-[#fff8e7] border border-[#f6eecf] rounded-2xl px-4 py-3 text-base text-[#081126] font-sans-regular"
                placeholder="Enter 6-digit code"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!isLoading}
                maxLength={6}
                keyboardType="number-pad"
              />
              {verificationError && (
                <Text className="text-[#dc2626] text-sm mt-2 font-sans-medium">
                  {verificationError}
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleEmailVerification}
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
                <Text className="text-white font-sans-semibold text-base">Verify Email</Text>
              )}
            </Pressable>

            {/* Resend Code */}
            <View className="mt-6 flex-row justify-center gap-1">
              <Text className="text-[#081126] font-sans-regular">Didn&apos;t receive the code? </Text>
              <Pressable onPress={handleResendCode} disabled={isLoading}>
                <Text className="text-[#ea7a53] font-sans-semibold">Resend</Text>
              </Pressable>
            </View>

            {/* Back Button */}
            <Pressable
              onPress={() => setNeedsEmailVerification(false)}
              disabled={isLoading}
              className="mt-4"
            >
              <Text className="text-[#081126] font-sans-medium text-center">Back to Sign Up</Text>
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
            <Text className="text-3xl font-sans-bold text-[#081126]">Create account</Text>
            <Text className="text-base text-[#081126]/60 mt-2">
              Sign up to start managing your subscriptions
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
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-sans-semibold text-[#081126]">Password</Text>
              {password && (
                <View className="flex-row items-center gap-1">
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPasswordStrengthColor(passwordStrength) }}
                  />
                  <Text
                    className="text-xs font-sans-semibold"
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthLabel(passwordStrength)}
                  </Text>
                </View>
              )}
            </View>
            <View
              className={`flex-row items-center bg-[#fff8e7] border-2 rounded-2xl px-4 ${
                errors.password ? 'border-[#dc2626]' : 'border-[#f6eecf]'
              }`}
            >
              <TextInput
                className="flex-1 py-3 text-base font-sans-regular text-[#081126]"
                placeholder="Min 8 chars, upper, lower, number, symbol"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                value={password}
                onChangeText={handlePasswordChange}
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

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="font-sans-semibold text-[#081126] mb-2">Confirm password</Text>
            <View
              className={`flex-row items-center bg-[#fff8e7] border-2 rounded-2xl px-4 ${
                errors.confirmPassword ? 'border-[#dc2626]' : 'border-[#f6eecf]'
              }`}
            >
              <TextInput
                className="flex-1 py-3 text-base font-sans-regular text-[#081126]"
                placeholder="Re-enter your password"
                placeholderTextColor="rgba(8, 17, 38, 0.4)"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: undefined });
                }}
                editable={!isLoading}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-2"
                disabled={isLoading}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.primary}
                />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Text className="text-[#dc2626] text-sm mt-2 font-sans-medium">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading}
            className={`rounded-2xl py-3 px-5 flex-row justify-center items-center mb-6 ${
              isLoading ? 'bg-[#ea7a53]/50' : 'bg-[#ea7a53] active:opacity-80'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-sans-semibold text-base">Create account</Text>
            )}
          </Pressable>

          {/* Clerk CAPTCHA */}
          <View nativeID="clerk-captcha" />

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-[#081126] font-sans-regular">Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-[#ea7a53] font-sans-semibold">Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}