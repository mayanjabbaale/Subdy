import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return (
    <View style={{ flex: 1, backgroundColor: '#fff9e3', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#ea7a53" />
    </View>
  );

  return isSignedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/sign_in" />;
}