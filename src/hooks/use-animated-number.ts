import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Tweens between values whenever `value` changes, matching the cubic ease-out
 * used by the scroll counters. Returns the target immediately when the visitor
 * prefers reduced motion.
 */
export const useAnimatedNumber = (value: number, duration = 600) => {
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (shouldReduceMotion) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const delta = value - from;

    if (delta === 0) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + delta * eased);
      setDisplay(next);
      fromRef.current = next;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [duration, shouldReduceMotion, value]);

  return display;
};
