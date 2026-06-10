import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AssistantProvider } from "@/components/voice/AssistantProvider";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <AssistantProvider>
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
          <Stack.Screen name="voice" options={{ title: "Urdu Voice Assistant", animation: "slide_from_bottom" }} />
          <Stack.Screen name="purchase/[id]" options={{ title: "Purchase Detail" }} />
          <Stack.Screen name="sale/[id]" options={{ title: "Sale Detail" }} />
        </Stack>
      </Animated.View>
    </AssistantProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
