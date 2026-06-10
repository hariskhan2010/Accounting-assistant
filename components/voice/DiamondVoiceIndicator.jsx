import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay
} from "react-native-reanimated";
import { colors } from "@/theme";

const BAR_COLORS = ["#D4AF37", "#F0D060", "#9B59B6", "#C084FC", "#1ABC9C", "#48E5C0", "#D4AF37"];

function WaveBar({ index, active }) {
  const height = useSharedValue(4);
  const delay = useMemo(() => index * 120, [index]);

  useEffect(() => {
    if (active) {
      height.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(32 + Math.random() * 24, { duration: 500 }),
          withTiming(8 + Math.random() * 12, { duration: 500 }),
          withTiming(40 + Math.random() * 20, { duration: 500 }),
          withTiming(6 + Math.random() * 10, { duration: 500 })
        ),
        -1,
        true
      ));
    } else {
      height.value = withTiming(4, { duration: 300 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    height: height.value
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        style,
        { backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }
      ]}
    />
  );
}

export function DiamondVoiceIndicator({ active, onPress, isSpeaking }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const speaking = active && isSpeaking;
  const listening = active && !isSpeaking;

  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
    transformOrigin: "center"
  }));

  return (
    <View style={styles.container}>
      <View style={styles.waveRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <WaveBar key={i} index={i} active={speaking} />
        ))}
      </View>
      <Animated.View style={[styles.diamondWrap, spinStyle]}>
        <Image
          source={require("@/public/diamond.png")}
          style={[
            styles.diamondImg,
            !imgLoaded && styles.hidden,
            speaking && styles.speakingGlow,
            listening && styles.listeningGlow
          ]}
          onLoad={() => setImgLoaded(true)}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 3,
    width: 4
  },
  container: {
    alignItems: "center",
    height: 200,
    justifyContent: "flex-end",
    left: -15,
    width: 200
  },
  diamondImg: {
    height: 180,
    width: 180
  },
  diamondWrap: {
    height: 180,
    width: 180,
    zIndex: 2
  },
  hidden: {
    opacity: 0
  },
  listeningGlow: {
    opacity: 0.85
  },
  speakingGlow: {
    opacity: 1
  },
  waveRow: {
    alignItems: "center",
    bottom: 20,
    flexDirection: "row",
    gap: 3,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    zIndex: 1
  }
});
