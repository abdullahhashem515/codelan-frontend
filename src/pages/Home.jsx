import React, { useEffect, lazy, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import { useSettings } from '../context/SettingsContext';
import { useLang } from '../context/LangContext';

// Below-fold sections — lazy loaded to reduce initial JS parse time
const Services      = lazy(() => import('../sections/Services'));
const Portfolio     = lazy(() => import('../sections/Portfolio'));
const TechStack     = lazy(() => import('../sections/TechStack'));
const Methodology   = lazy(() => import('../sections/Methodology'));
const Achievements  = lazy(() => import('../sections/Achievements'));
const Testimonials  = lazy(() => import('../sections/Testimonials'));
const Blog          = lazy(() => import('../sections/Blog'));
const Contact       = lazy(() => import('../sections/Contact'));
const Footer        = lazy(() => import('../components/Footer'));

const SectionFallback = () => <div className="py-24" aria-hidden="true" />;

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
  }, [settings, lang]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}><Services /></Suspense>
        <Suspense fallback={<SectionFallback />}><Portfolio /></Suspense>
        <Suspense fallback={<SectionFallback />}><TechStack /></Suspense>
        <Suspense fallback={<SectionFallback />}><Methodology /></Suspense>
        <Suspense fallback={<SectionFallback />}><Achievements /></Suspense>
        <Suspense fallback={<SectionFallback />}><Testimonials /></Suspense>
        <Suspense fallback={<SectionFallback />}><Blog /></Suspense>
        <Suspense fallback={<SectionFallback />}><Contact /></Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}><Footer /></Suspense>
    </>
  );
};

export default Home;
