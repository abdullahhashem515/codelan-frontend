import { useState, useEffect } from 'react';

// Tracks which in-page section the reader is currently looking at, and whether
// the page has moved off the top at all.
//
// This reads positions on scroll rather than using IntersectionObserver on the
// section elements, deliberately: DeferredSection renders a placeholder <div>
// carrying the section's id and swaps it for the real <section> once it nears
// the viewport. An observer bound to the placeholder would keep watching a node
// that is no longer in the document, so the header would go dead for exactly
// the sections the reader has not reached yet. Looking the ids up fresh each
// time survives that swap.

// The line, as a fraction of viewport height, that decides "you are here". A
// third of the way down matches where the eye sits while reading, and keeps a
// section from claiming the header the instant its first pixel appears.
const FOCUS_LINE = 0.34;

// Below this the page counts as "at the top" and the header stays open over
// the hero rather than condensing.
const SCROLLED_AT = 24;

// Where the header sits, in px from the top of the viewport — the point probed
// to learn what the header is floating over.
const HEADER_PROBE_Y = 40;

// Tone of whatever is under the header: 'dark' if the element there (or one of
// its ancestors) is marked data-header="dark", otherwise 'light'. Sections that
// are dark in *both* themes carry the mark — hero, projects, blog, footer — so
// in light mode the header can switch to dark glass over them instead of
// floating a pale grey slab across a dark band.
const toneUnderHeader = () => {
  if (typeof document.elementsFromPoint !== 'function') return 'light';
  const stack = document.elementsFromPoint(window.innerWidth / 2, HEADER_PROBE_Y);
  for (const el of stack) {
    if (el.closest('header')) continue;          // the header itself
    const marked = el.closest('[data-header]');
    if (marked) return marked.getAttribute('data-header');
  }
  return 'light';
};

export const useScrollNav = (ids) => {
  const [activeId, setActiveId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState('dark'); // the page opens on the dark hero

  // ids is an array literal at the call site, so a new reference every render.
  // Joining it gives the effect a value that only changes when the ids do.
  const key = ids.join(',');

  useEffect(() => {
    const list = key.split(',').filter(Boolean);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setScrolled(y > SCROLLED_AT);
      setTone(toneUnderHeader());

      const line = window.innerHeight * FOCUS_LINE;
      let current = null;

      // All reads happen together so the browser flushes layout once.
      for (const id of list) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        // The last section whose start is above the line, and which has not
        // scrolled past it yet, wins.
        if (top <= line && bottom > line) current = id;
      }

      // Past the final section — the footer, say — keep the last one lit
      // instead of dropping the indicator entirely.
      if (!current && list.length) {
        for (const id of list) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().bottom <= line) current = id;
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [key]);

  return { activeId, scrolled, tone };
};
