import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// Scroll-linked transitions between sections, with a distinct entrance per
// section instead of the same motion everywhere.
//
// Two effects run on one wrapper:
//
//  • ENTER — a clip-path reveal while the section rises into view. clip-path
//    only masks what is painted; it never moves the section's box. That is what
//    makes these safe on full-bleed sections with their own backgrounds: a
//    translate or scale on the box would open a strip of page background along
//    its edge, a clip cannot.
//
//  • LEAVE — the section lags a little behind the scroll once its top has
//    reached the top of the viewport, so the next one reads as sliding over it.
//    The range starts at 'start start' deliberately: that is also where an anchor
//    link lands, so at arrival the offset is exactly zero and #portfolio lands
//    where the browser aimed. Each wrapper sits one z-index above the previous
//    so the lagging section passes under the next — see Home.jsx.
//
// Once the reveal completes, the clip is dropped to 'none' rather than left at
// inset(0). inset(0) still clips to the border box, which would cut off any card
// shadow or hover lift that extends past the section edge.

const VARIANTS = {
  // A framed window that grows to fill the screen — the section arrives as a
  // rounded card and opens out to full bleed.
  window: (p) => {
    const i = 6 * (1 - p);
    const r = 36 * (1 - p);
    return `inset(${i}% ${i}% 0% ${i}% round ${r}px ${r}px 0px 0px)`;
  },
  // A curtain lifting from below: the lower part shows first and the reveal
  // climbs up to the top edge.
  wipe: (p) => `inset(${22 * (1 - p)}% 0% 0% 0%)`,
  // An iris opening from low in the frame, where the eye already is when a
  // section comes up from the bottom of the screen.
  iris: (p) => `circle(${28 + 100 * p}% at 50% ${70 - 20 * p}%)`,
  // A sweep from the reading edge. `dir` flips it for right-to-left layouts, so
  // Arabic sweeps in from the right.
  side: (p, dir) => (dir === 'rtl'
    ? `inset(0% 0% 0% ${16 * (1 - p)}%)`
    : `inset(0% ${16 * (1 - p)}% 0% 0%)`),
};

// Phones get a smaller lag: 70px is a tenth of a short phone screen and starts
// to look like a layout fault rather than depth.
const lagFor = (vh) => Math.round(Math.min(70, vh * 0.06));

const useViewportHeight = () => {
  const [vh, setVh] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  useEffect(() => {
    const on = () => setVh(window.innerHeight);
    window.addEventListener('resize', on, { passive: true });
    return () => window.removeEventListener('resize', on);
  }, []);
  return vh;
};

const SectionTransition = ({ children, depth = 1, variant = 'window', dir = 'rtl' }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const vh = useViewportHeight();
  const lag = lagFor(vh);

  // Enter: from the moment the top peeks in at the bottom of the screen, to the
  // moment it reaches a quarter of the way down. Short enough that the reveal
  // finishes before the section's content is being read.
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] });
  // Leave: from arrival at the top, through to the bottom leaving the screen.
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const shape = VARIANTS[variant] ?? VARIANTS.window;
  const clipPath = useTransform(enter, (p) => (p >= 0.999 ? 'none' : shape(Math.max(0, p), dir)));
  const y = useTransform(leave, [0, 1], [0, lag]);

  // 'none' is for sections that run their own scroll choreography — the pinned
  // methodology story. Lagging would slide the pinned frame while it is meant
  // to be still, and the percentage-based clips would hide whole screens of a
  // section that is several screens tall.
  const still = reduceMotion || variant === 'none';

  return (
    <motion.div
      ref={ref}
      className="relative"
      style={still
        ? { zIndex: 10 + depth }
        : { zIndex: 10 + depth, clipPath, WebkitClipPath: clipPath, y }}
    >
      {children}
    </motion.div>
  );
};

export default SectionTransition;
