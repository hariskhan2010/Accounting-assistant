import { useEffect, useRef } from "react";
import { Platform, View } from "react-native";

export function GsapReveal({ children, delay = 0, y = 28, style }) {
  const ref = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;

    let context;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollModule]) => {
      if (cancelled || !ref.current) return;

      const gsap = gsapModule.default || gsapModule;
      const ScrollTrigger = scrollModule.default || scrollModule.ScrollTrigger || scrollModule;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            delay: delay / 1000,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              once: true,
              start: "top 88%",
              trigger: ref.current
            },
            y: 0
          }
        );
      }, ref);
    });

    return () => {
      cancelled = true;
      if (context) context.revert();
    };
  }, [delay, y]);

  return (
    <View ref={ref} style={style}>
      {children}
    </View>
  );
}
