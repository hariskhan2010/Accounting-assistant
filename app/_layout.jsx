import { Platform, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Font from "expo-font";
import { Cormorant_700Bold } from "@expo-google-fonts/cormorant";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { NotoNastaliqUrdu_400Regular } from "@expo-google-fonts/noto-nastaliq-urdu";
import { colors } from "@/theme";

export default function RootLayout() {
  if (Platform.OS !== "web") {
    Font.loadAsync({
      Cormorant: Cormorant_700Bold,
      Montserrat: Montserrat_400Regular,
      "Noto Nastaliq Urdu": NotoNastaliqUrdu_400Regular
    }).catch(() => {});
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
