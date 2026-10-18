import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpLeft, ArrowUpRight, Clock } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { getSocialIcon } from '../utils/socialIcons';
import { EASE_EXPO } from '../utils/motion';
import { SITE_NAME, NAV_LINKS } from '../utils/siteConfig';
import { apiGetServices } from '../services/api';
import { Logo } from './Navbar';
import SectionLink from './SectionLink';
import { useLenis } from './SmoothScrollProvider';
import { SOCIAL_ICONS } from '../utils/socialIcons';

const LABELS = {
  ar: {
    about: 'نبني البرمجيات ونؤسّس الشبكات التي تعمل عليها — مواقع وأنظمة وتطبيقات، وشبكات وكاميرات وبدالات، تحت سقف واحد.',
    site: 'الموقع', services: 'الخدمات', follow: 'تابعنا',
    rights: 'جميع الحقوق محفوظة.', top: 'العودة للأعلى', privacy: 'سياسة الخصوصية', time: 'الوقت الآن في اليمن',
    ctaTitle: 'لديك مشروع في بالك؟', ctaSub: 'تحدث معنا مباشرة، أو أرسل تفاصيله وسنعود إليك.', ctaWa: 'راسلنا على واتساب', ctaForm: 'أرسل طلباً',
  },
  en: {
    about: 'We build the software and lay the networks it runs on — websites, systems and apps, networks, cameras and phone systems, under one roof.',
    site: 'Site', services: 'Services', follow: 'Follow',
    rights: 'All rights reserved.', top: 'Back to top', privacy: 'Privacy policy', time: 'Local time in Yemen',
    ctaTitle: 'Have a project in mind?', ctaSub: 'Talk to us directly, or send the details and we will get back to you.', ctaWa: 'Message us on WhatsApp', ctaForm: 'Send a request',
  },
};

// Dark in both themes: it bookends the equally dark hero and gives the page a
// real end instead of fading into another grey band.
const FOOTER_BG = '#050810';

// A live clock in the company's own time zone — the one thing an overseas
// client wants to know before sending a message: is anyone awake there now?
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const yemenTime = (date, locale) => new Intl.DateTimeFormat(locale, {
  timeZone: 'Asia/Aden', hour: '2-digit', minute: '2-digit',
}).format(date);

const Footer = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];
  const siteName = ar ? SITE_NAME.ar : SITE_NAME.en;
  const social = settings.socialLinks.filter(l => l.active !== false && l.url);
  const year = new Date().getFullYear();
  const time = yemenTime(useNow(), ar ? 'ar-EG' : 'en-GB');
  const LinkArrow = ar ? ArrowUpLeft : ArrowUpRight;

  // On the home page the footer sits directly under the contact section, so it
  // carries no contact details of its own. Everywhere else — an article, a
  // project, a 404 — there is no contact section, and a reader who arrived from
  // Google finishes the page with no way to reach the company. Those pages get
  // a short call to action at the top of the footer.
  const { pathname } = useLocation();
  const standalone = pathname !== '/';
  const lenis = useLenis();
  const wa = settings.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/D/g, '')}` : null;
  const WaIcon = SOCIAL_ICONS.whatsapp;
  const toTop = () => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Each service links to its own card (Services gives them ids). They all used
  // to point at #services — six links doing the job of one.
  const [services, setServices] = useState([]);
  useEffect(() => {
    let active = true;
    apiGetServices()
      .then(res => {
        if (!active) return;
        setServices((res.data ?? [])
          .map(s => ({
            href: s.id ? `#service-${s.id}` : '#services',
            title: ar ? (s.title ?? '') : (s.title_en ?? s.title ?? ''),
          }))
          .filter(s => s.title));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [ar]);

  const linkCls = 'group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors';
  const headCls = 'mb-5 font-mono text-[11px] rtl:text-xs uppercase ltr:tracking-[0.2em] text-slate-500';

  return (
    <footer id="site-footer" data-header="dark" className="relative z-10 overflow-hidden border-t border-white/5" style={{ backgroundColor: FOOTER_BG }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(26,127,255,0.12), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20">
        {standalone && (
          <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{lbl.ctaTitle}</h2>
              <p className="mt-1.5 text-sm text-slate-400">{lbl.ctaSub}</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition-colors">
                  <WaIcon size={16} aria-hidden="true" /> {lbl.ctaWa}
                </a>
              )}
              <SectionLink to="#contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 hover:border-blue-500/60 hover:bg-blue-500/10 px-5 py-2.5 text-sm font-bold text-white transition-colors">
                {lbl.ctaForm}
              </SectionLink>
            </div>
          </div>
        )}
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE_EXPO }}
            className="lg:col-span-5"
          >
            <SectionLink to="#home" aria-label={siteName} className="inline-flex items-center gap-2.5">
              <Logo settings={settings} />
              <span style={{ backgroundImage: 'var(--nav-name-gradient)' }} className="text-2xl font-bold bg-clip-text text-transparent">
                {siteName}
              </span>
            </SectionLink>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">{lbl.about}</p>

            {social.length > 0 && (
              <div className="mt-8">
                <div className={headCls}>{lbl.follow}</div>
                <div className="flex flex-wrap gap-2.5">
                  {social.map((link, i) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                      >
                        <Icon size={16} aria-hidden="true" focusable="false" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Site */}
          <motion.nav
            aria-label={lbl.site}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE_EXPO }}
            className="lg:col-span-2"
          >
            <div className={headCls}>{lbl.site}</div>
            <ul className="space-y-3 list-none">
              {NAV_LINKS.map(link => (
                <li key={link.id}>
                  <SectionLink to={link.id} className={linkCls}>{ar ? link.ar : link.en}</SectionLink>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Services — two columns so long titles do not stack into a tower */}
          {services.length > 0 && (
            <motion.nav
              aria-label={lbl.services}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE_EXPO }}
              className="lg:col-span-5"
            >
              <div className={headCls}>{lbl.services}</div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 list-none">
                {services.map(s => (
                  <li key={s.href + s.title}>
                    <SectionLink to={s.href} className={linkCls}>
                      <span>{s.title}</span>
                      <LinkArrow size={13} aria-hidden="true" className="shrink-0 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-opacity" />
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </div>
      </div>

      {/* Signature: the name, set as large as the page allows, rising into place.
          Not split into letters — Arabic is cursive, and separating the letters
          would break their joins. */}
      <div aria-hidden="true" className="relative mt-10 md:mt-12 overflow-hidden select-none pointer-events-none">
        <motion.div
          initial={{ y: '60%', opacity: 0 }}
          whileInView={{ y: '0%', opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: EASE_EXPO }}
          className="text-center font-bold leading-[0.9] whitespace-nowrap bg-clip-text text-transparent"
          style={{
            fontSize: 'clamp(3.25rem, 15.5vw, 13.5rem)',
            // Brand blue at the crown, dissolving into the page toward the baseline —
            // grey read as a disabled watermark rather than a signature.
            backgroundImage: 'linear-gradient(180deg, rgba(96,165,250,0.34) 0%, rgba(26,127,255,0.12) 55%, rgba(26,127,255,0) 100%)',
            paddingBottom: '0.08em',
          }}
        >
          {siteName}
        </motion.div>
      </div>

      {/* Bottom bar — three parts around a centred copyright: the clock on the
          reading side, back-to-top on the far side. Horizontal padding is kept
          symmetric (so the copyright stays truly centred) and wide enough on
          laptop widths to clear the floating contact button's corner, so nothing
          can sit underneath it even while it is showing. */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-20 py-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-3 sm:gap-6 text-xs text-slate-500">
          <p className="sm:col-start-2 text-center">
            © {year} {siteName}. {lbl.rights}
            <span aria-hidden="true" className="mx-2 text-slate-700">·</span>
            <Link to="/privacy" className="hover:text-white transition-colors">{lbl.privacy}</Link>
          </p>
          <span
            className="sm:col-start-1 sm:row-start-1 justify-self-center sm:justify-self-start inline-flex items-center gap-2"
            title={lbl.time}
          >
            <Clock size={13} aria-hidden="true" />
            <span>{lbl.time}</span>
            <span dir="ltr" className="font-mono text-slate-300">{time}</span>
          </span>
          <button
            type="button"
            onClick={toTop}
            aria-label={lbl.top}
            className="sm:col-start-3 sm:row-start-1 justify-self-center sm:justify-self-end w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
