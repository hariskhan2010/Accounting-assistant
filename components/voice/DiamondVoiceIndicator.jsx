import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay
} from "react-native-reanimated";

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
  const { width } = useWindowDimensions();
  const [imgLoaded, setImgLoaded] = useState(false);
  const speaking = active && isSpeaking;
  const listening = active && !isSpeaking;
  const size = Math.max(112, Math.min(180, width * 0.38));
  const containerSize = size + 72;

  return (
    <View style={[styles.container, { height: containerSize, width: containerSize }]}>
      <View style={[styles.waveRow, { bottom: size + 10 }]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <WaveBar key={i} index={i} active={speaking} />
        ))}
      </View>
      <View style={[styles.diamondWrap, { height: size, width: size }]}>
        <Image
          source={require("@/public/diamond.png")}
          style={[
            styles.diamondImg,
            { height: size, width: size },
            !imgLoaded && styles.hidden,
            speaking && styles.speakingGlow,
            listening && styles.listeningGlow
          ]}
          onLoad={() => setImgLoaded(true)}
          resizeMode="contain"
        />
      </View>
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
    justifyContent: "flex-end",
    left: -8
  },
  diamondImg: {
  },
  diamondWrap: {
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
    flexDirection: "row",
    gap: 3,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    zIndex: 1
  }
});
