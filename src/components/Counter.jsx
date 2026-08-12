import { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// Count-up animation that starts once the element scrolls into view.
const Counter = ({ to, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) { setCount(to); return; }

    let startTime;
    let rafId;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.ceil(progress * to));
      if (progress < 1) rafId = window.requestAnimationFrame(animate);
    };
    rafId = window.requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, to, duration, reduceMotion]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default Counter;
