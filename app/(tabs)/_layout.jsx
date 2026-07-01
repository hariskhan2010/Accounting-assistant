import { Tabs } from "expo-router";
import { GoldTabBar } from "@/components/animated/GoldTabPill";
import { colors } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.backgroundDeep,
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: colors.backgroundDeep,
          fontFamily: "Cormorant",
          fontSize: 23,
          fontWeight: "700",
          letterSpacing: 0.8,
          textShadowColor: "rgba(237, 232, 208, 0.28)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 1,
          textTransform: "uppercase"
        }
      }}
      tabBar={(props) => <GoldTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="barcodes" options={{ title: "Barcodes" }} />
      <Tabs.Screen name="stock" options={{ title: "Stock" }} />
      <Tabs.Screen name="purchases" options={{ title: "Purchases" }} />
      <Tabs.Screen name="sales" options={{ title: "Sales" }}/>
      <Tabs.Screen name="expenses" options={{ title: "Expenses" }} />
      <Tabs.Screen name="minerals" options={{ title: "Minerals" }} />
      <Tabs.Screen name="staff" options={{ title: "Staff" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
    </Tabs>
  );
}
