import { useEffect, Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import { useSettings } from '../context/SettingsContext';
import { useLang } from '../context/LangContext';

// Below-fold sections — lazy loaded to reduce initial JS parse time
// Fetched ahead at idle — it mounts only on the first scroll (see below).
const loadServices  = () => import('../sections/Services');
const Services      = lazyWithRetry(loadServices);
const Portfolio     = lazyWithRetry(() => import('../sections/Portfolio'));
const Methodology   = lazyWithRetry(() => import('../sections/Methodology'));
const Testimonials  = lazyWithRetry(() => import('../sections/Testimonials'));
const Blog          = lazyWithRetry(() => import('../sections/Blog'));
const Contact       = lazyWithRetry(() => import('../sections/Contact'));
const FieldGallery  = lazyWithRetry(() => import('../sections/FieldGallery'));
const Footer        = lazyWithRetry(() => import('../components/Footer'));

import DeferredSection from '../components/DeferredSection';
import SectionTransition from '../components/SectionTransition';
import { FIELD_IMAGES } from '../utils/fieldImages';
import { useHeroSlide } from '../hooks/useHeroSlide';

// Keeps the section's reserved height while its code downloads. It used to be
// a 192px strip: the placeholder (900px and more) was swapped for it, the next
// section's placeholder slid up into the mount-on-approach zone, mounted, and
// collapsed in turn — so every section on the page loaded and rendered at
// startup in a chain, which was most of the main-thread work on a phone.
const SectionFallback = ({ minHeight = 0 }) => <div style={{ minHeight }} aria-hidden="true" />;

const SECTIONS = [
  { id: 'services',     minHeight: 900,  Component: Services,     transition: 'window', untilScroll: true },
  { id: 'portfolio',    minHeight: 1000, Component: Portfolio,    transition: 'window' },
  { id: 'methodology',  minHeight: 2400, Component: Methodology,  transition: 'none'   },
  // Only on the page once photos exist in src/assets/field/ — an empty
  // placeholder would otherwise reserve 900px of nothing.
  ...(FIELD_IMAGES.length ? [{ id: 'field', minHeight: 900, Component: FieldGallery, transition: 'window' }] : []),
  { id: 'testimonials', minHeight: 700,  Component: Testimonials, transition: 'iris'   },
  { id: 'blog',         minHeight: 900,  Component: Blog,         transition: 'iris'   },
  { id: 'contact',      minHeight: 900,  Component: Contact,      transition: 'side'   },
];

const setMeta = (name, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
};

const setOgMeta = (property, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
};

const Home = () => {
  const settings = useSettings();

  // قطع مباشر من الهيرو إلى أول قسم — لا تمرير. انظر useHeroSlide.
  useHeroSlide({ fromId: 'home', toId: SECTIONS[0].id });

  // The first section's code, fetched while the browser is idle, so that
  // mounting it on the first scroll does not wait on the network.
  useEffect(() => {
    const fetchAhead = () => { loadServices().catch(() => {}); };
    if (window.requestIdleCallback) {
      const h = window.requestIdleCallback(fetchAhead, { timeout: 4000 });
      return () => window.cancelIdleCallback(h);
    }
    const t = window.setTimeout(fetchAhead, 2500);
    return () => window.clearTimeout(t);
  }, []);
  const { lang } = useLang();
  const ar = lang === 'ar';

  useEffect(() => {
    const title = ar ? settings.metaTitleAr : settings.metaTitleEn;
    const desc  = ar ? settings.metaDescAr  : settings.metaDescEn;

    if (title) document.title = title;
    setMeta('description', desc);
    setMeta('keywords', settings.keywords.join(', '));
    setOgMeta('og:title', title);
    setOgMeta('og:description', desc);
    if (settings.ogImage) setOgMeta('og:image', settings.ogImage);

    if (settings.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = settings.favicon;
    }
  }, [settings, lang, ar]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {SECTIONS.map(({ id, minHeight, Component, transition, untilScroll }, idx) => (
          <DeferredSection key={id} id={id} minHeight={minHeight} untilScroll={untilScroll}>
            {/* depth ascends so each section passes under the next one, and
                each gets its own entrance — see SectionTransition. */}
            <SectionTransition depth={idx + 1} variant={transition} dir={ar ? 'rtl' : 'ltr'}>
              <Suspense fallback={<SectionFallback minHeight={minHeight} />}><Component /></Suspense>
            </SectionTransition>
          </DeferredSection>
        ))}
      </main>
      {/* The footer closes the stack, so it sits above every section and does
          not lag — nothing follows it to cover the gap that would leave. */}
      <DeferredSection id="site-footer" minHeight={420}>
        <div className="relative" style={{ zIndex: 10 + SECTIONS.length + 1 }}>
          <Suspense fallback={<SectionFallback minHeight={420} />}><Footer /></Suspense>
        </div>
      </DeferredSection>
    </>
  );
};

export default Home;
