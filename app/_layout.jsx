import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import store from '@/src/redux/store';
import { restoreAuth } from '@/src/redux/authSlice';
import SQLiteService from '@/src/database/SQLiteService';
import ErrorBoundary from '@/src/components/ErrorBoundary';
import outboxRetryService from '@/src/services/OutboxRetryService';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { token, loading } = useSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  // Initialize database and restore auth on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SQLiteService.init();

        // Start the outbox retry service
        outboxRetryService.start();

        await dispatch(restoreAuth());

        setIsReady(true);
      } catch (_error) {
        setIsReady(true); // Still allow app to continue
      }
    };

    initializeApp();

    // Cleanup function to stop the service when component unmounts
    return () => {
      outboxRetryService.stop();
    };
  }, [dispatch]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || loading) return;

    const inAuthGroup = segments[0] === 'auth';


    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      // Redirect to home if authenticated and in auth pages
      router.replace('/(tabs)');
    }
  }, [token, segments, isReady, loading, router]);

  if (!isReady) {
    return null; // Show splash screen while checking auth
  }

  return <>{children}</>;
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    // Poppins Family
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('../assets/fonts/Poppins-ThinItalic.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('../assets/fonts/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('../assets/fonts/Poppins-LightItalic.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Italic': require('../assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('../assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),

    // Roboto Family
    'Roboto-Thin': require('../assets/fonts/Roboto-Thin.ttf'),
    'Roboto-ThinItalic': require('../assets/fonts/Roboto-ThinItalic.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    'Roboto-LightItalic': require('../assets/fonts/Roboto-LightItalic.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Italic': require('../assets/fonts/Roboto-Italic.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-MediumItalic': require('../assets/fonts/Roboto-MediumItalic.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-BoldItalic': require('../assets/fonts/Roboto-BoldItalic.ttf'),
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'Roboto-BlackItalic': require('../assets/fonts/Roboto-BlackItalic.ttf'),

    // Quicksand Family
    'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
    'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),

    // Teko Family
    'Teko-Light': require('../assets/fonts/Teko-Light.ttf'),
    'Teko-Regular': require('../assets/fonts/Teko-Regular.ttf'),
    'Teko-Medium': require('../assets/fonts/Teko-Medium.ttf'),
    'Teko-SemiBold': require('../assets/fonts/Teko-SemiBold.ttf'),
    'Teko-Bold': require('../assets/fonts/Teko-Bold.ttf'),

    // Other Fonts
    'Abel-Regular': require('../assets/fonts/Abel-Regular.ttf'),
    'Dosis-VariableFont_wght': require('../assets/fonts/Dosis-VariableFont_wght.ttf'),
    'Farsan-Regular': require('../assets/fonts/Farsan-Regular.ttf'),
    'Rancho-Regular': require('../assets/fonts/Rancho-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="timesheet/index" options={{ headerShown: false }} />
              <Stack.Screen name="timesheet/create" options={{ headerShown: false }} />
              <Stack.Screen name="timesheet/[id]" options={{ headerShown: false }} />

              <Stack.Screen name="absensi/index" options={{ headerShown: false }} />
              <Stack.Screen name="absensi/map-screen" options={{ headerShown: false }} />
              <Stack.Screen name="insentif/index" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />

            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}