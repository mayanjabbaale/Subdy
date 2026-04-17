import { View, Text } from 'react-native'
import React from 'react'
import { styled } from 'nativewind';

import {SafeAreaView as RNSafe } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafe);

const subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className='text-xl font-bold'>Subscriptions</Text>
    </SafeAreaView>
  )
}

export default subscriptions