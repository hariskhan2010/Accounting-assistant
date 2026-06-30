import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Polygon, Circle } from "react-native-svg";
import { colors } from "@/theme";

function DiamondCrest({ size = 76 }) {
  const half = size / 2;
  const top = half * 0.15;
  const mid = half;
  const bottom = size * 0.85;
  const leftInset = size * 0.22;
  const rightInset = size * 0.78;

  const points = [
    `${half},${top}`,
    `${rightInset},${mid * 0.55}`,
    `${size - leftInset * 0.6},${mid * 1.1}`,
    `${half},${bottom}`,
    `${leftInset * 0.6},${mid * 1.1}`,
    `${leftInset},${mid * 0.55}`
  ].join(" ");

  return (
    <Svg height={size} width={size}>
      <Defs>
        <LinearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F0D060" />
          <Stop offset="50%" stopColor="#D4AF37" />
          <Stop offset="100%" stopColor="#B8962E" />
        </LinearGradient>
        <LinearGradient id="innerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </LinearGradient>
      </Defs>
      <Circle cx={half} cy={half} fill="rgba(212,175,55,0.06)" r={half} />
      <Polygon fill="url(#crestGrad)" points={points} />
      <Polygon fill="url(#innerGrad)" points={points} />
    </Svg>
  );
}

export function GemHero({ compact = false }) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.crestWrap}>
        <DiamondCrest size={compact ? 52 : 76} />
        <View style={[styles.innerDot, compact && styles.innerDotCompact]}>
          <Text style={[styles.glyph, compact && styles.glyphCompact]}>◆</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, compact && styles.titleCompact]}>Gems & Minerals</Text>
        <Text style={styles.subtitle}>Accounting and stock control</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    gap: 6,
    minHeight: 96,
    padding: 12
  },
  copy: {
    alignItems: "center",
    gap: 3
  },
  crestWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  glyph: {
    color: colors.background,
    fontSize: 22,
    includeFontPadding: false,
    lineHeight: 26,
    textAlign: "center"
  },
  glyphCompact: {
    fontSize: 16,
    lineHeight: 18
  },
  innerDot: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    width: 28
  },
  innerDotCompact: {
    borderRadius: 10,
    height: 20,
    width: 20
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: "Cormorant",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  titleCompact: {
    fontSize: 18
  },
  wrap: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    minHeight: 190,
    padding: 18,
    position: "relative",
    width: "100%"
  }
});
