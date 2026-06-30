import { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors } from "@/theme";

export function AnimatedScreenWrapper({ children, style, contentContainerStyle, scrollRef: externalRef }) {
  const internalRef = useRef(null);
  const scrollRef = externalRef || internalRef;

  const ContentContainer = useCallback(
    ({ children: innerChildren }) => (
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        style={[styles.screen, style]}
      >
        {innerChildren}
      </ScrollView>
    ),
    []
  );

  return <ContentContainer>{children}</ContentContainer>;
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  screen: {
    backgroundColor: colors.backgroundDeep,
    flex: 1
  }
});
