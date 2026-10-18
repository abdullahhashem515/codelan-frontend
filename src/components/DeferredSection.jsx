import { useEffect, useRef, useState } from 'react';
import { MOUNT_ALL_SECTIONS } from '../utils/sectionMount';

// Below-fold sections were `lazy()` but rendered unconditionally, so React
// fetched and executed all nine chunks — plus their observers, tilt handlers
// and GSAP setup — during initial load, for content nobody had scrolled to yet.
// This mounts a section only once it is within ~600px of the viewport, keeping
// that work off the first-paint burst.
//
// The placeholder carries the section's own id so in-page anchors (#services,
// #contact, ...) always resolve, and reserves a plausible height so the swap to
// real content does not shift anything that is already on screen.
//
// untilScroll — for the section right under the hero. It sits at the bottom
// edge of the first screen, so the 600px approach zone mounted it at once:
// nine cards and their animated drawings built during load for something no
// one sees before scrolling — the largest block of main-thread work left on a
// phone. With this it mounts on the first sign of scrolling (or once actually
// on screen); its code is fetched ahead at idle (see Home), so that is quick.

const SCROLL_INTENT = ['scroll', 'wheel', 'touchmove', 'keydown'];

const DeferredSection = ({ id, minHeight = 640, untilScroll = false, children }) => {
  const ref = useRef(null);
  // Browsers without IntersectionObserver just render everything up front —
  // decided at init so the effect never has to setState synchronously.
  const [mounted, setMounted] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (mounted) return undefined;

    const show = () => setMounted(true);
    window.addEventListener(MOUNT_ALL_SECTIONS, show);
    const intent = { passive: true, once: true };
    if (untilScroll) SCROLL_INTENT.forEach(t => window.addEventListener(t, show, intent));

    const io = new IntersectionObserver(
      (entries) => { if (entries.some(e => e.isIntersecting)) show(); },
      // -2px: touching the bottom edge of the screen is not "on screen".
      { rootMargin: untilScroll ? '-2px 0px' : '600px 0px' },
    );
    if (ref.current) io.observe(ref.current);

    return () => {
      window.removeEventListener(MOUNT_ALL_SECTIONS, show);
      if (untilScroll) SCROLL_INTENT.forEach(t => window.removeEventListener(t, show, intent));
      io.disconnect();
    };
  }, [mounted, untilScroll]);

  if (mounted) return children;

  return <div ref={ref} id={id} style={{ minHeight }} aria-hidden="true" />;
};

export default DeferredSection;
