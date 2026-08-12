// Shared Framer Motion primitives — professional easing, no linear transitions.
export const EASE_EXPO = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EXPO } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_EXPO } },
};

// "Focus pull" reveal — text starts slightly blurred/offset and sharpens
// into place. Reserved for headline/body copy, not buttons or chrome.
export const blurFadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_EXPO } },
};

export const staggerContainer = (stagger = 0.12, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});
