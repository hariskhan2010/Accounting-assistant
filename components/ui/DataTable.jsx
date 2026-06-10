import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from "react-native-reanimated";
import { colors } from "@/theme";

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

export function DataTable({ columns, rows, emptyLabel = "No records yet" }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Text key={column.key} style={[styles.cell, styles.headerCell, column.width && { width: column.width }]}>
              {column.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>◇</Text>
            <Text style={styles.empty}>{emptyLabel}</Text>
          </View>
        ) : (
          rows.map((row, index) => (
            <AnimatedRow key={row.id} index={index}>
              {columns.map((column) => (
                <Text key={column.key} style={[styles.cell, column.width && { width: column.width }]}>
                  {row[column.key]}
                </Text>
              ))}
            </AnimatedRow>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cell: {
    color: colors.text,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center"
  },
  emptyIcon: {
    color: colors.textMuted,
    fontSize: 24,
    marginBottom: 6,
    textAlign: "center"
  },
  emptyWrap: {
    alignItems: "center",
    padding: 24
  },
  headerCell: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  headerRow: {
    backgroundColor: colors.surfaceMuted,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
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
  table: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 520,
    overflow: "hidden"
  }
});
