import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GemHero } from "./GemHero";
import { colors } from "@/theme";

export function LazyGemScene(props) {
  const [GemScene, setGemScene] = useState(null);
  const height = props.height || 220;
  const enable3d = props.enable3d ?? height >= 180;

  useEffect(() => {
    if (Platform.OS !== "web" || !enable3d) return undefined;

    let cancelled = false;
    let idleHandle = null;
    const loadScene = () => {
      import("./GemScene").then((module) => {
        if (cancelled) return;
        setGemScene(() => module.GemScene);
      });
    };
    const timer = globalThis.setTimeout(() => {
      if (typeof globalThis.requestIdleCallback === "function") {
        idleHandle = globalThis.requestIdleCallback(loadScene, { timeout: 1200 });
        return;
      }

      loadScene();
    }, props.loadDelay ?? 1200);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
      if (idleHandle && typeof globalThis.cancelIdleCallback === "function") {
        globalThis.cancelIdleCallback(idleHandle);
      }
    };
  }, [enable3d, props.loadDelay]);

  if (!GemScene) {
    return (
      <View style={[styles.fallback, { minHeight: height }]}>
        <GemHero compact={height < 200} />
      </View>
    );
  }

  return <GemScene {...props} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.background,
    justifyContent: "center",
    width: "100%"
  }
});
