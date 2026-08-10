import type { Variants } from "framer-motion";

/**
 * The single entrance variant used across TrendK marketing sections. Pass a
 * delay through `custom` to stagger siblings.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

/** Shared hover lift for cards and tiles. */
export const hoverLift = { y: -6, scale: 1.03 };

/** Section-level scroll reveal settings, kept identical everywhere. */
export const revealViewport = { once: true, amount: 0.25 } as const;

/**
 * Step transition for the Goal Builder. Same easing family and travel
 * direction as `fadeUp`, just quicker so the flow stays snappy.
 */
export const stepTransition: Variants = {
  hidden: (direction: number = 1) => ({
    opacity: 0,
    y: 16,
    x: direction * 24,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    y: -12,
    x: direction * -24,
    transition: { duration: 0.28, ease: "easeOut" },
  }),
};
