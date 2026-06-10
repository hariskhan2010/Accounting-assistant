import { useEffect, useRef } from "react";
import { Platform, ScrollView } from "react-native";

let gsap = null;
let ScrollTrigger = null;

if (Platform.OS === "web") {
  import("gsap").then((mod) => {
    gsap = mod.default || mod;
    import("gsap/ScrollTrigger").then((stMod) => {
      ScrollTrigger = stMod.default || stMod;
      if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }
    });
  });
}

export function useGsapScroll(scrollRef, targets, options = {}) {
  const { start = "top 85%", end = "top 30%", toggleActions = "play none none reverse" } = options;
  const animations = useRef([]);

  useEffect(() => {
    if (Platform.OS !== "web" || !gsap || !ScrollTrigger || !scrollRef.current || !targets.length) return;

    const ctx = gsap.context(() => {
      targets.forEach((target) => {
        const anim = gsap.from(target, {
          duration: 0.8,
          ease: "power3.out",
          opacity: 0,
          y: 40,
          scale: 0.95,
          scrollTrigger: {
            end,
            invalidateOnRefresh: true,
            scroller: scrollRef.current,
            start,
            toggleActions
          }
        });
        animations.current.push(anim);
      });
    });

    return () => ctx.revert();
  }, [targets.length]);

  return animations;
}

export function useGsapParallax(scrollRef, target, options = {}) {
  const { speed = 0.3, start = "top bottom", end = "bottom top" } = options;

  useEffect(() => {
    if (Platform.OS !== "web" || !gsap || !ScrollTrigger || !scrollRef.current || !target) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { y: `${-speed * 100}px` },
        {
          ease: "none",
          scrollTrigger: {
            end,
            scrub: true,
            scroller: scrollRef.current,
            start
          },
          y: `${speed * 100}px`
        }
      );
    });

    return () => ctx.revert();
  }, []);
}

export function useGsapStagger(scrollRef, targets, options = {}) {
  const { stagger = 0.08, start = "top 85%", toggleActions = "play none none reverse" } = options;

  useEffect(() => {
    if (Platform.OS !== "web" || !gsap || !ScrollTrigger || !scrollRef.current || !targets.length) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        duration: 0.6,
        ease: "power2.out",
        opacity: 0,
        stagger,
        y: 30,
        scrollTrigger: {
          end: "top 20%",
          invalidateOnRefresh: true,
          scroller: scrollRef.current,
          start,
          toggleActions
        }
      });
    });

    return () => ctx.revert();
  }, [targets.length]);
}
