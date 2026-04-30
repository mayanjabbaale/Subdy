import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, TextInput, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
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
    const { error } = await signUp.password({ emailAddress, password })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }
    await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code })
    if (signUp.status === 'complete') {
      await signUp.finalize({ navigate: handleNavigation })
    } else {
      console.error('Sign-up attempt not complete:', signUp)
    }
  }

  if (signUp.status === 'complete' || isSignedIn) {
    return null
  }

  // ── Email Verification View ───────────────────────────────────────────────
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
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
                <Text style={{ fontSize: 22 }}>📬</Text>
              </View>
              <Text style={{
                fontFamily: 'sans-extrabold', fontSize: 28,
                color: '#1a1a2e', marginBottom: 8,
              }}>
                Check your inbox
              </Text>
              <Text style={{
                fontFamily: 'sans-regular', fontSize: 15,
                color: '#6b7280', lineHeight: 22,
              }}>
                We sent a 6-digit code to{' '}
                <Text style={{ fontFamily: 'sans-semibold', color: '#ea7a53' }}>
                  {emailAddress}
                </Text>
                . Enter it below to confirm your account.
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
                {fetchStatus === 'fetching' ? 'Verifying…' : 'Confirm & create account'}
              </Text>
            </Pressable>

            {/* Resend */}
            <Pressable
              style={{ marginTop: 20, alignItems: 'center' }}
              onPress={() => signUp.verifications.sendEmailCode()}
            >
              <Text style={{ fontFamily: 'sans-medium', fontSize: 14, color: '#ea7a53' }}>
                Resend code
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Main Sign-up View ─────────────────────────────────────────────────────
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
              Create account
            </Text>
            <Text style={{
              fontFamily: 'sans-regular', fontSize: 15,
              color: '#6b7280', textAlign: 'center',
            }}>
              Take control of your subscriptions
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
              {errors.fields.emailAddress && (
                <Text style={{
                  fontFamily: 'sans-regular', fontSize: 12,
                  color: '#ef4444', marginTop: 5,
                }}>
                  {errors.fields.emailAddress.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{
                fontFamily: 'sans-semibold', fontSize: 13,
                color: '#374151', marginBottom: 8, letterSpacing: 0.3,
              }}>
                Password
              </Text>
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

          {/* Password hint */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            gap: 6, marginBottom: 20, paddingHorizontal: 4,
          }}>
            <View style={{
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: '#e5e0d4',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 9, color: '#9ca3af' }}>i</Text>
            </View>
            <Text style={{ fontFamily: 'sans-regular', fontSize: 12, color: '#9ca3af' }}>
              Use 8+ characters with a mix of letters and numbers
            </Text>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!emailAddress || !password || fetchStatus === 'fetching'}
            style={({ pressed }) => ({
              backgroundColor: '#ea7a53',
              paddingVertical: 16, borderRadius: 16,
              alignItems: 'center',
              opacity: (!emailAddress || !password || fetchStatus === 'fetching') ? 0.5 : pressed ? 0.88 : 1,
              shadowColor: '#ea7a53',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 12,
              elevation: 4,
              marginBottom: 20,
            })}
          >
            <Text style={{ fontFamily: 'sans-bold', fontSize: 16, color: '#fff' }}>
              {fetchStatus === 'fetching' ? 'Creating account…' : 'Create account'}
            </Text>
          </Pressable>

          {/* Sign In Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontFamily: 'sans-regular', fontSize: 14, color: '#6b7280' }}>
              Already have an account?
            </Text>
            <Link href="/(auth)/sign_in">
              <Text style={{ fontFamily: 'sans-bold', fontSize: 14, color: '#ea7a53' }}>
                Sign in
              </Text>
            </Link>
          </View>

          {/* Required for Clerk bot protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}