import { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from "react-native-reanimated";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/theme";

const EMPTY_ICONS = {
  "staff profiles": "staff",
  "salary payments": "salary",
  "profit and loss": "profit",
  sales: "sales",
  purchases: "purchases",
  expenses: "expenses",
};

function getEmptyIcon(label) {
  const lower = (label || "").toLowerCase();
  for (const [key, icon] of Object.entries(EMPTY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "default";
}

function AnimatedRow({ children, index }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(200 + index * 60, withSpring(1, { damping: 18, stiffness: 120 }));
    translateX.value = withDelay(200 + index * 60, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }]
  }));

  return <Animated.View style={[styles.row, index % 2 === 1 && styles.rowAlt, style]}>{children}</Animated.View>;
}

export function DataTable({ columns, rows, emptyLabel = "No records yet", onRowPress }) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const availableWidth = Math.max(280, width - (compact ? 24 : 32));

  const emptyIcon = getEmptyIcon(emptyLabel);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.scrollContent}>
      <View style={[styles.table, { minWidth: Math.min(520, availableWidth) }]}>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Text key={column.key} style={[styles.cell, compact && styles.cellCompact, styles.headerCell, column.width && { width: compact ? Math.max(112, column.width * 0.78) : column.width }]}>
              {column.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyLabel} />
        ) : (
          rows.map((row, index) => (
            <Pressable key={row.id || index} onPress={onRowPress ? () => onRowPress(row) : undefined}>
              <AnimatedRow index={index}>
                {columns.map((column) => (
                  <Text key={column.key} numberOfLines={2} style={[styles.cell, compact && styles.cellCompact, column.width && { width: compact ? Math.max(112, column.width * 0.78) : column.width }]}>
                    {row[column.key]}
                  </Text>
                ))}
              </AnimatedRow>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cell: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  cellCompact: {
    fontSize: 12,
    minWidth: 96,
    paddingHorizontal: 9,
    paddingVertical: 9
  },
  headerCell: {
    color: colors.primary,
    fontFamily: "Montserrat",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  headerRow: {
    backgroundColor: colors.surfaceMuted,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row"
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row"
  },
  rowAlt: {
    backgroundColor: "rgba(212, 175, 55, 0.03)"
  },
  scrollContent: {
    flexGrow: 1
  },
  table: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 10
      },
      android: {
        elevation: 5
      }
    })
  }
});
