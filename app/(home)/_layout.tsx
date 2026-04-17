import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import '@/global.css';

export default function HomeLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign_in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
