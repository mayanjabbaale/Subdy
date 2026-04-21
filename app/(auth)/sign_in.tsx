import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, TextInput, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// import images from '@/constants/images'

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [focusedField, setFocusedField] = React.useState<string | null>(null)

  const handleNavigation = ({ session, decorateUrl }: any) => {
    if (session?.currentTask) {
      console.log(session?.currentTask)
      return
    }
    const url = decorateUrl('/')
    if (url.startsWith('http')) {
      window.location.href = url
    } else {
      router.push(url as Href)
    }
  }

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: handleNavigation })
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      )
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode()
      }
    }
  }

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code })
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: handleNavigation })
    }
  }

  // ── MFA Verification View ─────────────────────────────────────────────────
  if (signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff9e3' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ marginBottom: 40, marginTop: 16 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: '#ea7a53',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Text style={{ fontSize: 22 }}>🔐</Text>
              </View>
              <Text style={{
                fontFamily: 'sans-extrabold', fontSize: 28,
                color: '#1a1a2e', marginBottom: 8,
              }}>
                Two-step verification
              </Text>
              <Text style={{
                fontFamily: 'sans-regular', fontSize: 15,
                color: '#6b7280', lineHeight: 22,
              }}>
                We sent a verification code to your email address. Enter it below to continue.
              </Text>
            </View>

            {/* Code Input */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{
                fontFamily: 'sans-semibold', fontSize: 13,
                color: '#374151', marginBottom: 8, letterSpacing: 0.3,
              }}>
                Verification code
              </Text>
              <TextInput
                style={{
                  borderWidth: focusedField === 'code' ? 2 : 1.5,
                  borderColor: focusedField === 'code' ? '#ea7a53' : '#e5e0d4',
                  borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 14,
                  fontSize: 22, fontFamily: 'sans-bold',
                  backgroundColor: '#fffef9',
                  color: '#1a1a2e',
                  letterSpacing: 8,
                  textAlign: 'center',
                }}
                value={code}
                placeholder="• • • • • •"
                placeholderTextColor="#c4bfb3"
                onChangeText={setCode}
                keyboardType="numeric"
                onFocus={() => setFocusedField('code')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.fields.code && (
                <Text style={{
                  fontFamily: 'sans-regular', fontSize: 12,
                  color: '#ef4444', marginTop: 6,
                }}>
                  {errors.fields.code.message}
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={fetchStatus === 'fetching' || !code}
              style={({ pressed }) => ({
                backgroundColor: '#ea7a53',
                paddingVertical: 16, borderRadius: 16,
                alignItems: 'center', marginTop: 8,
                opacity: (fetchStatus === 'fetching' || !code) ? 0.5 : pressed ? 0.88 : 1,
                shadowColor: '#ea7a53',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3, shadowRadius: 12,
                elevation: 4,
              })}
            >
              <Text style={{ fontFamily: 'sans-bold', fontSize: 16, color: '#fff' }}>
                {fetchStatus === 'fetching' ? 'Verifying…' : 'Verify & continue'}
              </Text>
            </Pressable>

            {/* Resend / Reset */}
            <Pressable
              style={{ marginTop: 20, alignItems: 'center' }}
              onPress={() => signIn.mfa.sendEmailCode()}
            >
              <Text style={{ fontFamily: 'sans-medium', fontSize: 14, color: '#ea7a53' }}>
                Resend code
              </Text>
            </Pressable>
            <Pressable
              style={{ marginTop: 12, alignItems: 'center' }}
              onPress={() => signIn.reset()}
            >
              <Text style={{ fontFamily: 'sans-regular', fontSize: 14, color: '#9ca3af' }}>
                Start over
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Main Sign-in View ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 48 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 22,
              backgroundColor: '#ea7a53',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#ea7a53',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25, shadowRadius: 16,
              elevation: 6,
            }}>
              <Text style={{ fontSize: 32 }}>💳</Text>
            </View>
            <Text style={{
              fontFamily: 'sans-extrabold', fontSize: 30,
              color: '#1a1a2e', marginBottom: 6,
            }}>
              Welcome back
            </Text>
            <Text style={{
              fontFamily: 'sans-regular', fontSize: 15,
              color: '#6b7280', textAlign: 'center',
            }}>
              Sign in to manage your subscriptions
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: '#fffef9',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1.5,
            borderColor: '#ede8de',
            shadowColor: '#1a1a2e',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06, shadowRadius: 16,
            elevation: 3,
            marginBottom: 24,
          }}>
            {/* Email */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{
                fontFamily: 'sans-semibold', fontSize: 13,
                color: '#374151', marginBottom: 8, letterSpacing: 0.3,
              }}>
                Email address
              </Text>
              <TextInput
                style={{
                  borderWidth: focusedField === 'email' ? 2 : 1.5,
                  borderColor: focusedField === 'email' ? '#ea7a53' : '#e5e0d4',
                  borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 13,
                  fontSize: 15, fontFamily: 'sans-regular',
                  backgroundColor: focusedField === 'email' ? '#fffdf6' : '#faf8f3',
                  color: '#1a1a2e',
                }}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="you@example.com"
                placeholderTextColor="#c4bfb3"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.fields.identifier && (
                <Text style={{
                  fontFamily: 'sans-regular', fontSize: 12,
                  color: '#ef4444', marginTop: 5,
                }}>
                  {errors.fields.identifier.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{
                  fontFamily: 'sans-semibold', fontSize: 13,
                  color: '#374151', letterSpacing: 0.3,
                }}>
                  Password
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: focusedField === 'password' ? 2 : 1.5,
                  borderColor: focusedField === 'password' ? '#ea7a53' : '#e5e0d4',
                  borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 13,
                  fontSize: 15, fontFamily: 'sans-regular',
                  backgroundColor: focusedField === 'password' ? '#fffdf6' : '#faf8f3',
                  color: '#1a1a2e',
                }}
                value={password}
                placeholder="••••••••"
                placeholderTextColor="#c4bfb3"
                secureTextEntry
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.fields.password && (
                <Text style={{
                  fontFamily: 'sans-regular', fontSize: 12,
                  color: '#ef4444', marginTop: 5,
                }}>
                  {errors.fields.password.message}
                </Text>
              )}
            </View>
          </View>

        <Pressable
          className={`bg-sky-600 py-4 rounded-xl items-center mt-4 ${
            (!emailAddress || !password || fetchStatus === 'fetching') 
              ? 'opacity-50' 
              : 'active:bg-sky-700'
          }`}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === 'fetching'}
        >
          <Text className="text-white font-bold text-lg">Continue</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-8 gap-x-1">
        <Text className="text-gray-600">Do nott have an account?</Text>
        <Link href="/(auth)/signup">
          <Text className="text-sky-600 font-bold">Sign up</Text>
        </Link>
      </View>

      {/* Debug Errors Footer */}
      {Object.keys(errors.fields).length > 0 && (
        <View className="mt-10 p-4 bg-red-50 rounded-lg">
           <Text className="text-red-400 text-[10px]">{JSON.stringify(errors, null, 2)}</Text>
        </View>
      )}
    </SafeAreaView>
  )
}