import { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// Count-up animation that starts once the element scrolls into view.
//
// The number is written straight into the element on each frame. It used to
// be React state, which re-rendered the component sixty times a second for two
// seconds per figure — on a phone that showed up as a run of long tasks right
// after the page appeared, exactly when it should be answering the first tap.
const Counter = ({ to, suffix = '', duration = 2000 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !isInView || reduceMotion) return undefined;

    let startTime;
    let rafId;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = `${Math.ceil(progress * to)}${suffix}`;
      if (progress < 1) rafId = window.requestAnimationFrame(animate);
    };
    rafId = window.requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, to, suffix, duration, reduceMotion]);

  // Before the count starts the element shows 0; with reduced motion it shows
  // the final figure and never animates. One string, so React owns a single
  // text node whose value never changes after mount — it has no reason to
  // touch what the animation writes.
  return <span ref={ref}>{`${reduceMotion ? to : 0}${suffix}`}</span>;
};

export default Counter;
