import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/theme";

const icons = {
  index: "grid",
  purchases: "bag-add",
  stock: "cube",
  sales: "receipt",
  expenses: "wallet",
  minerals: "diamond",
  staff: "people",
  reports: "bar-chart"
};

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: !compact,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          elevation: 0,
          height: compact ? 56 : 64,
          paddingBottom: compact ? 6 : 8,
          paddingTop: compact ? 4 : 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons color={color} name={icons[route.name] || "ellipse"} size={focused ? size + (compact ? 1 : 2) : size} />
            </View>
          </Animated.View>
        )
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="stock" options={{ title: "Stock" }} />
      <Tabs.Screen name="sales" options={{ title: "Sales" }} />
      <Tabs.Screen name="expenses" options={{ title: "Expenses" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    padding: 2
  },
  iconWrapActive: {
    backgroundColor: "rgba(212, 175, 55, 0.1)"
  }
});
