import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

export function ChatBubble({ role, text, source }) {
  const assistant = role === "assistant";
  const isAction = source === "action";
  const isError = source === "error";
  const isSuccess = isAction && text.startsWith("✅");

  const badgeColor = isSuccess
    ? colors.success
    : isError
      ? colors.danger
      : assistant
        ? colors.primary
        : colors.secondary;

  const parts = text.split(/(Rs\s[\d,]+)/g);

  return (
    <View style={[styles.bubble, assistant ? styles.assistant : styles.user]}>
      <View style={styles.roleIndicator}>
        <Ionicons
          name={
            isSuccess
              ? "checkmark-circle"
              : isError
                ? "alert-circle"
                : assistant
                  ? "diamond"
                  : "person-circle"
          }
          size={15}
          color={badgeColor}
        />
        <Text style={[styles.roleLabel, { color: badgeColor }]}>
          {isSuccess ? "Success" : isError ? "Error" : assistant ? "Assistant" : "You"}
        </Text>
      </View>
      <Text style={styles.text}>
        {parts.map((part, i) =>
          /^Rs\s[\d,]+$/.test(part) ? (
            <Text key={i} style={styles.highlight}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  assistant: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3
  },
  bubble: {
    borderRadius: 14,
    borderWidth: 0,
    maxWidth: "90%",
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  highlight: {
    color: colors.primaryLight,
    fontWeight: "700"
  },
  roleIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 10
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
    writingDirection: "rtl"
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: colors.surfaceMuted,
    borderRightColor: colors.glowGold,
    borderRightWidth: 3
  }
});
