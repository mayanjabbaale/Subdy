import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const signup = () => {
  return (
    <View>
      <Text>signup</Text>
      <Link href="/(auth)/signup">Login</Link>
    </View>
  )
}

export default signup