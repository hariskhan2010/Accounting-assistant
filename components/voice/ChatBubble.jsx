import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

export function ChatBubble({ role, text, source }) {
  const assistant = role === "assistant";
  const isAction = source === "action";
  const isError = source === "error";
  const isSuccess = isAction && text.startsWith("✅");

  const borderColor = isSuccess
    ? `${colors.success}44`
    : isError
      ? `${colors.danger}44`
      : assistant
        ? `${colors.primary}33`
        : `${colors.secondary}33`;

  const badgeColor = isSuccess
    ? colors.success
    : isError
      ? colors.danger
      : assistant
        ? colors.primary
        : colors.secondary;

  const parts = text.split(/(Rs\s[\d,]+)/g);

  return (
    <View style={[styles.bubble, { borderColor }, assistant ? styles.assistant : styles.user]}>
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
          size={14}
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
    backgroundColor: colors.surface
  },
  bubble: {
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: "90%",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  highlight: {
    color: colors.primaryLight,
    fontWeight: "700"
  },
  roleIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 8
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
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
    backgroundColor: colors.surfaceMuted
  }
});
