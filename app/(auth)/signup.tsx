import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, TextInput, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

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
    const { error } = await signUp.password({
      emailAddress,
      password,
    })
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

  // Common input style to keep things DRY
  const inputClasses = "border border-gray-300 rounded-lg p-4 text-base bg-white mb-1"

  // VERIFICATION VIEW
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 bg-white p-6">
        <Text className="text-2xl font-bold mb-6 text-gray-900">Verify your account</Text>
        
        <TextInput
          className={inputClasses}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#999"
          onChangeText={setCode}
          keyboardType="numeric"
        />

        {errors.fields.code && (
          <Text className="text-red-500 text-sm mb-4">{errors.fields.code.message}</Text>
        )}

        <Pressable
          className={`bg-sky-600 py-4 rounded-xl items-center mt-2 ${
            fetchStatus === 'fetching' ? 'opacity-50' : 'active:bg-sky-700'
          }`}
          onPress={handleVerify}
          disabled={fetchStatus === 'fetching'}
        >
          <Text className="text-white font-bold text-lg">Verify</Text>
        </Pressable>

        <Pressable 
          className="mt-6 items-center active:opacity-60" 
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text className="text-sky-600 font-semibold">I need a new code</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  // INITIAL SIGN UP VIEW
  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <Text className="text-3xl font-bold mb-8 text-gray-900">Sign up</Text>

      <View className="gap-y-4">
        <View>
          <Text className="font-semibold text-gray-700 mb-2">Email address</Text>
          <TextInput
            className={inputClasses}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="email@example.com"
            placeholderTextColor="#999"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          {errors.fields.emailAddress && (
            <Text className="text-red-500 text-xs mt-1">{errors.fields.emailAddress.message}</Text>
          )}
        </View>

        <View>
          <Text className="font-semibold text-gray-700 mb-2">Password</Text>
          <TextInput
            className={inputClasses}
            value={password}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
          />
          {errors.fields.password && (
            <Text className="text-red-500 text-xs mt-1">{errors.fields.password.message}</Text>
          )}
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
          <Text className="text-white font-bold text-lg">Sign up</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-8 gap-x-1">
        <Text className="text-gray-600">Already have an account?</Text>
        <Link href="/(auth)/sign_in">
          <Text className="text-sky-600 font-bold">Sign in</Text>
        </Link>
      </View>

      {/* Debug view for errors */}
      {Object.keys(errors.fields).length > 0 && (
        <View className="mt-10 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-400 text-[10px]">{JSON.stringify(errors, null, 2)}</Text>
        </View>
      )}

      {/* Required for Clerk bot protection */}
      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  )
}