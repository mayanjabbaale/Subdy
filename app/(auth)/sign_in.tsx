import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const sign_in = () => {
  return (
    <View>
      <Text>sign_in</Text>
      <Link href="/(auth)/sign_in">Create Account</Link>
    </View>
  )
}

export default sign_in