import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from './SmoothScrollProvider';
import { mountAllSections } from '../utils/sectionMount';

// Offset for the floating header, matching SmoothScrollProvider's anchor scroll.
const HEADER_OFFSET = 80;

// How long to keep re-aligning to a section after arriving from another page.
// The home page renders in stages — the page transition, then lazy section
// chunks, then content growing inside them — so the target's position keeps
// moving for a moment after it first appears.
const SETTLE_MS = 1600;

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    const go = (y) => {
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo({ top: y, behavior: 'instant' });
    };

    if (!hash) { go(0); return undefined; }

    // Arrived with a section in the URL (e.g. /#services from an article):
    // wait for it to exist, scroll to it, and keep re-aligning while the page
    // settles — but stop the moment the reader scrolls on their own, so they
    // are never pulled back.
    const id = decodeURIComponent(hash.slice(1));
    const started = performance.now();
    let stopped = false;
    let timer = 0;
    const stop = () => { stopped = true; clearTimeout(timer); };

    const tick = () => {
      if (stopped) return;
      mountAllSections();
      const el = document.getElementById(id);
      if (el) go(el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
      if (performance.now() - started < SETTLE_MS) timer = setTimeout(tick, el ? 220 : 50);
    };
    tick();

    const opts = { passive: true };
    window.addEventListener('wheel', stop, opts);
    window.addEventListener('touchstart', stop, opts);
    window.addEventListener('keydown', stop);
    return () => {
      stop();
      window.removeEventListener('wheel', stop, opts);
      window.removeEventListener('touchstart', stop, opts);
      window.removeEventListener('keydown', stop);
    };
  }, [pathname, hash, lenis]);

  return null;
};

export default ScrollToTop;
