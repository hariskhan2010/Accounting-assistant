import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

export function ChatBubble({ role, text }) {
  const assistant = role === "assistant";

  return (
    <View style={[styles.bubble, assistant ? styles.assistant : styles.user]}>
      <View style={styles.roleIndicator}>
        <View style={[styles.dot, { backgroundColor: assistant ? colors.primary : colors.secondary }]} />
        <Text style={styles.roleLabel}>{assistant ? "Assistant" : "You"}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  assistant: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface
  },
  bubble: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: "88%",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  roleIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 6
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "right",
    writingDirection: "rtl"
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: colors.surfaceMuted
  }
});
