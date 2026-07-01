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
        headerTitleStyle: {
          color: colors.backgroundDeep,
          fontFamily: "Montserrat",
          fontSize: 16,
          fontWeight: "700"
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
