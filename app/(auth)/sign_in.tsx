import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, TextInput, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context' 

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn()
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
    const { error } = await signIn.password({
      emailAddress,
      password,
    })
    
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

  // Common input style
  const inputClasses = "border border-gray-300 rounded-lg p-4 text-base bg-white mb-1"

  if (signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView className="flex-1 bg-white p-6">
        <Text className="text-2xl font-bold mb-6">Verify your account</Text>
        
        <TextInput
          className={inputClasses}
          value={code}
          placeholder="Enter verification code"
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

        <Pressable className="mt-6 items-center" onPress={() => signIn.mfa.sendEmailCode()}>
          <Text className="text-sky-600 font-semibold">I need a new code</Text>
        </Pressable>

        <Pressable className="mt-4 items-center" onPress={() => signIn.reset()}>
          <Text className="text-gray-500 font-medium">Start over</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <Text className="text-3xl font-bold mb-8">Sign in</Text>

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
          {errors.fields.identifier && (
            <Text className="text-red-500 text-xs mt-1">{errors.fields.identifier.message}</Text>
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
          <Text className="text-white font-bold text-lg">Continue</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-8 gap-x-1">
        <Text className="text-gray-600">Don't have an account?</Text>
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