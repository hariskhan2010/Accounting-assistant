import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Font from "expo-font";
import { Cormorant_700Bold } from "@expo-google-fonts/cormorant";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { NotoNastaliqUrdu_400Regular } from "@expo-google-fonts/noto-nastaliq-urdu";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme";

function AuthGuard({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isAuthenticated, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  if (Platform.OS !== "web") {
    Font.loadAsync({
      Cormorant: Cormorant_700Bold,
      Montserrat: Montserrat_400Regular,
      "Noto Nastaliq Urdu": NotoNastaliqUrdu_400Regular
    }).catch(() => {});
  }

  return (
    <AuthGuard>
      <Animated.View entering={FadeIn.duration(500)} style={styles.root}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            animation: "fade",
            animationDuration: 300,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: "700", fontSize: 17 }
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard-breakdown/[metric]" options={{ title: "Entity Breakdown" }} />
          <Stack.Screen name="purchase/[id]" options={{ title: "Purchase Detail" }} />
          <Stack.Screen name="sale/[id]" options={{ title: "Sale Detail" }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </Animated.View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center"
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 14
  },
  root: {
    flex: 1
  }
});
