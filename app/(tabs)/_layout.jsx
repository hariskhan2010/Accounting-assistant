import { Tabs } from "expo-router";
import { GoldTabBar } from "@/components/animated/GoldTabPill";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <GoldTabBar {...props} />}>
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
