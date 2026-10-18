import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mountAllSections } from '../utils/sectionMount';

const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);

  // What components get from useLenis(): one object for the life of the app,
  // forwarding to Lenis once it exists and to native scrolling until then.
  // It used to be the Lenis instance itself, held in state — so the moment
  // Lenis started (a couple of seconds after load) every consumer re-rendered,
  // the home page and its hero included, in one long task for no visible change.
  const api = useMemo(() => ({
    scrollTo(target, opts = {}) {
      const l = lenisRef.current;
      if (l) return l.scrollTo(target, opts);
      const top = typeof target === 'number'
        ? target
        : (target?.getBoundingClientRect ? target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0) : 0);
      window.scrollTo({ top, behavior: opts.immediate ? 'instant' : 'smooth' });
      return undefined;
    },
    stop() { lenisRef.current?.stop(); },
    start() { lenisRef.current?.start(); },
  }), []);

  // Smooth scrolling is an enhancement for the mouse wheel, so it costs
  // nothing until it can matter:
  //  • Only with a mouse. Lenis smooths wheel scrolling; on a touch screen it
  //    does nothing, yet it used to load and run a loop on every frame there.
  //  • Loaded after the page settles (browser idle), or at the first wheel
  //    movement if that comes sooner — never during first paint.
  //  • No GSAP. Lenis was driven by GSAP's ticker and ScrollTrigger was
  //    registered, but nothing on the site uses either; Lenis runs its own
  //    frame loop (autoRaf). That is ~45 KB of script the page no longer loads.
  // No smooth scrolling in the admin. Lenis takes over the mouse wheel for the
  // whole window, which stopped every scrollable box inside the admin modals
  // from scrolling — and a data-entry tool gains nothing from eased scrolling.
  // The instance is torn down on entering /admin and rebuilt on leaving.
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin || prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    let cancelled = false;
    let started = false;
    let cleanup = () => {};

    const start = async () => {
      if (started || cancelled) return;
      started = true;
      window.removeEventListener('wheel', start);
      const { default: Lenis } = await import('lenis');
      if (cancelled) return;

      // Any element marked data-lenis-prevent keeps native wheel scrolling —
      // for scrollable panels and dialogs on the public site.
      const instance = new Lenis({ autoRaf: true, duration: 1.1, smoothWheel: true, prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent]')) });
      lenisRef.current = instance;

      cleanup = () => {
        instance.destroy();
        lenisRef.current = null;
      };
    };

    window.addEventListener('wheel', start, { passive: true, once: true });
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 2000);

    return () => {
      cancelled = true;
      window.removeEventListener('wheel', start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else window.clearTimeout(idle);
      cleanup();
    };
  }, [isAdmin]);

  // Route in-page anchor links (#services, #contact, ...) through Lenis.
  // Falls back to native smooth scrolling while Lenis is still loading.
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      // "#" followed by anything that is not a plain id (a pasted URL, say) is
      // not an in-page anchor — and querySelector would throw on it, killing
      // the click entirely. Leave those to the browser.
      let target = null;
      try { target = document.querySelector(hash); } catch { return; }
      if (!target) return;

      e.preventDefault();

      // Sections below the fold mount on approach, so their placeholders are
      // shorter than the real content. Scrolling now would aim at an offset
      // that stops being correct the moment the sections in between grow, so
      // mount everything first and scroll once heights are final.
      mountAllSections();

      requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.querySelector(hash) ?? target;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        }
      }));
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <LenisContext.Provider value={api}>
      {children}
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
