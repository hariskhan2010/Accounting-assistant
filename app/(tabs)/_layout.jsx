import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/theme";

const icons = {
  index: "grid",
  purchases: "bag-add",
  orders: "briefcase",
  barcodes: "barcode",
  stock: "cube",
  sales: "receipt",
  expenses: "wallet",
  staff: "people",
  minerals: "gem",
  reports: "bar-chart",
  voice: "chatbubbles"
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
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: compact ? 56 : 64,
          paddingBottom: compact ? 6 : 8,
          paddingTop: compact ? 4 : 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
          fontFamily: "Montserrat"
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              {route.name === "minerals" ? (
                <MaterialCommunityIcons color={color} name="diamond-stone" size={focused ? size + (compact ? 1 : 2) : size} />
              ) : (
                <Ionicons color={color} name={icons[route.name] || "ellipse"} size={focused ? size + (compact ? 1 : 2) : size} />
              )}
            </View>
          </Animated.View>
        )
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="barcodes" options={{ title: "Barcodes" }} />
      <Tabs.Screen name="stock" options={{ title: "Stock" }} />
      <Tabs.Screen name="sales" options={{ title: "Sales" }}/>
      <Tabs.Screen name="expenses" options={{ title: "Expenses" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="voice" options={{ title: "AI Assistant" }} />
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
