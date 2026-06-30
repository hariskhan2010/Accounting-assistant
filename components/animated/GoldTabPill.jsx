import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme";

const iconMap = {
  index: { icon: "grid", lib: "ion" },
  orders: { icon: "briefcase", lib: "ion" },
  barcodes: { icon: "barcode", lib: "ion" },
  stock: { icon: "cube", lib: "ion" },
  purchases: { icon: "cart", lib: "ion" },
  sales: { icon: "receipt", lib: "ion" },
  expenses: { icon: "wallet", lib: "ion" },
  minerals: { icon: "diamond-stone", lib: "material" },
  staff: { icon: "people", lib: "ion" },
  reports: { icon: "bar-chart", lib: "ion" },
  voice: { icon: "chatbubbles", lib: "ion" }
};

const TABS = [
  { name: "index", label: "Home" },
  { name: "orders", label: "Orders" },
  { name: "barcodes", label: "Barcodes" },
  { name: "stock", label: "Stock" },
  { name: "purchases", label: "Buy" },
  { name: "sales", label: "Sell" },
  { name: "expenses", label: "Spend" },
  { name: "minerals", label: "Minerals" },
  { name: "staff", label: "Staff" },
  { name: "reports", label: "Reports" },
  { name: "voice", label: "AI" }
];

export function GoldTabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const tabCount = state.routes.length;
  const tabWidth = (width - 16) / tabCount;
  const pillTranslate = useSharedValue(0);
  const lastIdx = useRef(state.index);

  useEffect(() => {
    pillTranslate.value = withSpring(state.index * tabWidth, {
      damping: 22,
      stiffness: 120,
      mass: 0.5
    });
    lastIdx.current = state.index;
  }, [state.index, tabWidth]);

  const handleTabPress = useCallback(
    (routeName) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeName,
        canPreventDefault: true
      });
      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillTranslate.value }]
  }));

  const renderIcon = (routeName, idx) => {
    const focused = state.index === idx;
    const iconInfo = iconMap[routeName] || { icon: "ellipse", lib: "ion" };
    const size = 20;
    const color = focused ? colors.background : colors.textMuted;

    if (iconInfo.lib === "material") {
      return (
        <MaterialCommunityIcons
          name={iconInfo.icon}
          size={focused ? size + 1 : size}
          color={color}
        />
      );
    }
    return (
      <Ionicons
        name={iconInfo.icon}
        size={focused ? size + 1 : size}
        color={color}
      />
    );
  };

  return (
    <View style={[styles.container, { height: compact ? 56 : 64 }]}>
      <View style={[styles.track, { height: compact ? 36 : 40 }]}>
        <Animated.View
          style={[
            styles.pill,
            {
              width: tabWidth - 8,
              height: compact ? 30 : 34,
              borderRadius: compact ? 15 : 17
            },
            pillStyle
          ]}
        />
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(route.name, idx)}
              style={[styles.tab, { width: tabWidth }]}
            >
              {renderIcon(route.name, idx)}
              {!compact && (
                <Text
                  style={[
                    styles.label,
                    focused && styles.labelActive,
                    { color: focused ? colors.background : colors.textMuted }
                  ]}
                  numberOfLines={1}
                >
                  {TABS.find((t) => t.name === route.name)?.label || ""}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  label: {
    fontFamily: "Montserrat",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  labelActive: {
    fontWeight: "800"
  },
  pill: {
    backgroundColor: colors.primary,
    left: 4,
    position: "absolute",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    top: 3
  },
  tab: {
    alignItems: "center",
    gap: 1,
    height: "100%",
    justifyContent: "center",
    zIndex: 2
  },
  track: {
    borderRadius: 20,
    flexDirection: "row",
    position: "relative",
    width: "100%"
  }
});
