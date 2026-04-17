import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import '@/global.css';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
