import { useEffect } from 'react';
import { useLenis } from '../components/SmoothScrollProvider';
import { mountAllSections } from '../utils/sectionMount';

// Slide-deck behaviour at the hero boundary: the first downward gesture does not
// scroll at all. It is swallowed, and the page cuts straight to the next section
// through a soft fade instead of scrolling — the hero dips out, the section is there.
// Scrolling back up at the top of that section cuts back to the hero the same way.
//
// This is a cut, not a scroll, so the gesture has to be cancelled before anything
// moves. Two details make that work:
//
//  • The wheel/touch listeners are registered with `capture: true` and
//    `passive: false`. Lenis binds its own wheel handler on window; capture
//    listeners run before bubble listeners on the same target, so ours sees the
//    event first and can stop it reaching Lenis.
//  • Lenis is paused for the duration. Jumping the document position while its
//    animation loop is running leaves it interpolating toward the old target,
//    which drags the page back.
//
// Only this one boundary behaves this way. Every section below the hero is taller
// than the viewport, so cutting between them would throw the reader past content
// they are still reading.

// Wheel deltas below this are trackpad drift or a rubber-band settle, not intent.
const INTENT = 8;

// Ignore further gestures until the cut has settled. One frame is enough for
// the jump itself; this only debounces the burst of events a single wheel
// flick or momentum scroll produces.
const COOLDOWN = 320;

// How far below the target's top still counts as "at the top of it", for the
// upward cut back to the hero.
const AT_TOP_SLACK = 40;

// A soft dip: the screen eases into the page colour, the jump happens while it
// is covered, then eases back out. Out is slower than in so the arrival reads
// as settling rather than flashing.
const FADE_IN = 180;
const FADE_OUT = 280;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The veil takes the colour of the page it is about to reveal, so the dip is a
// gentle wash rather than a black flash when landing on a light section.
const veilColour = () =>
  document.documentElement.classList.contains('dark') ? '#050810' : '#ffffff';

const createVeil = () => {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483646', 'pointer-events:none',
    'opacity:0', 'will-change:opacity',
  ].join(';');
  document.body.appendChild(el);
  return el;
};

export const useHeroSlide = ({ fromId = 'home', toId = 'services', enabled = true } = {}) => {
  const lenis = useLenis();

  useEffect(() => {
    if (!enabled) return undefined;

    let busy = false;
    let touchY = null;
    let veil = null;
    let timers = [];

    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

    const targetTop = () => {
      const el = document.getElementById(toId);
      if (!el) return null;
      // getBoundingClientRect reflects the live position including any transform
      // the section carries; adding scrollY converts it to a document offset.
      return Math.round(el.getBoundingClientRect().top + window.scrollY);
    };

    const jumpTo = (y) => {
      if (lenis) lenis.stop();
      // 'instant' rather than 'auto': html has scroll-behavior:smooth, which
      // would turn this into the animated scroll we are replacing.
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      if (lenis) {
        // Resync so Lenis does not animate back toward where it thought it was.
        if (typeof lenis.scrollTo === 'function') lenis.scrollTo(y, { immediate: true });
        lenis.start();
      }
    };

    // Soft dip: fade the veil in, jump while covered, fade it out. The target
    // section's own entrance animations fire as the veil lifts, so content is
    // seen settling in rather than a page swapping.
    const cut = (toY) => {
      busy = true;
      clearTimers();

      if (prefersReducedMotion()) {
        jumpTo(toY);
        later(() => { busy = false; }, COOLDOWN);
        return;
      }

      if (!veil) veil = createVeil();
      // Wash toward the colour of where we are going: light section on the way
      // down in light mode, the dark hero on the way back up.
      veil.style.background = toY === 0 ? '#050810' : veilColour();
      veil.style.transition = `opacity ${FADE_IN}ms cubic-bezier(0.4,0,0.2,1)`;
      void veil.offsetWidth; // flush so the transition starts from 0
      veil.style.opacity = '1';

      later(() => {
        jumpTo(toY);
        veil.style.transition = `opacity ${FADE_OUT}ms cubic-bezier(0.16,1,0.3,1)`;
        void veil.offsetWidth;
        veil.style.opacity = '0';
      }, FADE_IN);

      later(() => { busy = false; }, FADE_IN + FADE_OUT);
    };

    // Returns the cut to perform for a gesture in `dir`, or null to let the
    // browser scroll normally.
    const decide = (dir) => {
      const top = targetTop();
      if (top === null) return null;
      const y = window.scrollY || 0;
      const vh = window.innerHeight;
      // Where the hero's bottom sits in document terms is the next section's
      // top. When the hero fits one screen this is 0 and the cut is immediate.
      // When it is taller — a phone, with the headline, the buttons and the
      // figures stacked — the reader scrolls it normally first; cutting at the
      // first gesture used to throw them past everything below the fold, which
      // is how the figures became unreachable on mobile.
      const heroBottomInView = Math.max(0, top - vh);

      // Downward, once the whole hero has been seen → cut forward.
      if (dir > 0 && y < top - AT_TOP_SLACK && y >= heroBottomInView - AT_TOP_SLACK) return top;
      // Upward from the top of the next section → cut back to the hero's
      // bottom (its top when it fits one screen), where the reader left it.
      if (dir < 0 && y <= top + AT_TOP_SLACK && y > heroBottomInView) return heroBottomInView;
      return null;
    };

    const handle = (e, dir) => {
      // Cheap bail-out first. Without it every wheel event anywhere on the page
      // would run the measuring path and re-broadcast the mount signal, for a
      // boundary that only exists in the first screen and a half.
      if ((window.scrollY || 0) > window.innerHeight * 1.5) return;

      if (busy) { e.preventDefault(); return; }
      // Sections mount on approach, so the target may still be a short
      // placeholder and its offset wrong until everything is real.
      mountAllSections();
      const to = decide(dir);
      if (to === null) return;
      e.preventDefault();
      e.stopPropagation();
      cut(to);
    };

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < INTENT) return;
      handle(e, e.deltaY > 0 ? 1 : -1);
    };

    // Touch has to be decided on the *first* touchmove. Chrome and Safari only
    // let that first one be cancelled; if it goes through, native scrolling
    // starts and every later preventDefault is ignored — so waiting for a
    // comfortable 24px of travel meant the page began scrolling natively and
    // then the cut landed on top of it, the two fighting over position.
    //
    // The first move's direction is reliable even at a pixel or two. If it maps
    // to a cut, this gesture is ours for its whole length; otherwise it belongs
    // to the browser and is left alone until the next touchstart.
    let owned = false;
    let first = false;

    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
      owned = false;
      first = true;
    };
    const onTouchMove = (e) => {
      if (touchY === null || e.touches.length > 1) return; // leave pinch-zoom alone
      if (owned) { e.preventDefault(); return; }
      if (!first) return;

      const dy = touchY - (e.touches[0]?.clientY ?? touchY);
      if (dy === 0) return;            // no direction yet — try the next move
      first = false;

      if ((window.scrollY || 0) > window.innerHeight * 1.5) return;
      if (busy) { e.preventDefault(); owned = true; return; }

      mountAllSections();
      const to = decide(dy > 0 ? 1 : -1);
      if (to === null) return;         // native scroll owns this gesture

      owned = true;
      e.preventDefault();
      cut(to);
    };

    const KEYS_DOWN = ['PageDown', 'ArrowDown', ' ', 'Spacebar'];
    const KEYS_UP = ['PageUp', 'ArrowUp'];
    const onKey = (e) => {
      // Never swallow a key while the reader is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (KEYS_DOWN.includes(e.key)) handle(e, 1);
      else if (KEYS_UP.includes(e.key)) handle(e, -1);
    };

    const opts = { capture: true, passive: false };
    window.addEventListener('wheel', onWheel, opts);
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('keydown', onKey, opts);

    return () => {
      clearTimers();
      window.removeEventListener('wheel', onWheel, opts);
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, opts);
      window.removeEventListener('keydown', onKey, opts);
      if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
      if (lenis) lenis.start();
    };
  }, [lenis, enabled, fromId, toId]);
};
