import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { EASE_EXPO, fadeUp, staggerContainer } from '../utils/motion';
import { getSocialIcon } from '../utils/socialIcons';
import { SITE_NAME, NAV_LINKS } from '../utils/siteConfig';
import { useScrollNav } from '../hooks/useScrollNav';
import AnimatedThemeToggler from './AnimatedThemeToggler';
import SectionLink from './SectionLink';

// The header CTA keeps its hover/tap motion but must also work off the home page.
const MotionSectionLink = motion.create(SectionLink);

// Section ids the header tracks, derived from the nav links so the two can
// never drift apart. '#home' is prepended because the hero owns the top of the
// page but is not a nav entry.
const TRACKED_IDS = ['home', ...NAV_LINKS.map(l => l.id.replace('#', ''))];

const tap = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050810]';

// The logo is admin-uploadable, so its aspect ratio is unknown at build time.
// It used to declare width="48" height="48" while the actual file is 404x367:
// the browser reserved a square, then reflowed the whole navbar row once the
// real ratio arrived. Reserving a fixed square box and letting the image
// object-contain inside it keeps the layout stable for any upload.
export const Logo = ({ settings }) => (
  <span className="h-10 w-10 shrink-0 flex items-center justify-center">
    <img
      // Until settings load (or if none is set) use the bundled logo rather
      // than a placeholder mark — the header used to flash "CL" on every visit.
      src={settings.logo || '/logo-96.png'}
      alt=""
      fetchPriority="high"
      decoding="async"
      className="max-h-10 max-w-10 w-auto h-auto object-contain"
    />
  </span>
);

const Navbar = () => {
  const { lang, setLang } = useLang();
  const settings = useSettings();

  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ar = lang === 'ar';

  const reduceMotion = useReducedMotion();
  const { activeId, scrolled, tone } = useScrollNav(TRACKED_IDS);

  // Over a section that is dark in both themes (hero, projects, blog, footer)
  // the header takes dark glass and light text, whatever the page theme. In
  // light mode it used to float a pale grey slab across those bands — and at
  // the very top, with no glass at all, it put grey links on the dark hero.
  const onDark = tone === 'dark';
  const ui = onDark
    ? {
        glass: 'border-white/10 bg-[#050810]/70 shadow-[0_8px_30px_rgba(0,0,0,0.45)]',
        link: 'text-slate-300 hover:text-white',
        linkLit: 'text-white',
        pill: 'bg-white/10',
        icon: 'text-slate-300 hover:bg-white/10 hover:text-white',
        burger: 'text-white',
      }
    : {
        glass: 'border-gray-200/70 dark:border-white/10 bg-white/75 dark:bg-[#050810]/75 shadow-[0_8px_30px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]',
        link: 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white',
        linkLit: 'text-gray-900 dark:text-white',
        pill: 'bg-gray-100 dark:bg-white/10',
        icon: 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
        burger: 'text-gray-700 dark:text-white',
      };

  // Reading progress. Spring-smoothed so the bar glides instead of stuttering
  // with the scroll wheel; it is decorative, so it is hidden from assistive tech.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  // Lock page scroll while the fullscreen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Auto-close the mobile menu if the viewport grows into desktop size.
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const siteName = ar ? SITE_NAME.ar : SITE_NAME.en;
  const activeSocialLinks = settings.socialLinks.filter(l => l.active !== false && l.url);
  // زر "تواصل معنا" البارز يغني عن تكرار نفس الرابط في قائمة الديسكتوب
  const desktopLinks = NAV_LINKS.filter(link => link.id !== '#contact');

  return (
    <>
      {/* شريط تقدّم القراءة — أعلى الشاشة، يظهر فور مغادرة القمة */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 inset-x-0 z-[110] h-[2px] origin-left pointer-events-none"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, #0158B0, #1a7fff 55%, #DC1B1C)',
          opacity: scrolled ? 1 : 0,
          transition: 'opacity 300ms ease',
          transformOrigin: ar ? 'right' : 'left',
        }}
      />

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_EXPO }}
        className={`fixed inset-x-0 z-[100] px-4 md:block ${mobileOpen ? 'hidden' : 'block'}`}
        // The header used to look identical over the hero and over the content,
        // so it read as a fixed bar rather than something belonging to the page.
        // It now opens wide and frameless across the hero, then draws itself in
        // once the reader leaves the top.
        style={{
          top: scrolled ? 12 : 22,
          transition: 'top 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <nav
          aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}
          className={`mx-auto flex items-center justify-between gap-4 rounded-full ps-4 pe-2.5 py-2 md:pe-2.5 ${
            scrolled
              ? `max-w-5xl md:ps-5 md:py-2.5 border backdrop-blur-xl ${ui.glass}`
              : 'max-w-6xl md:ps-6 md:py-3 border border-transparent bg-transparent shadow-none'
          }`}
          style={{ transition: 'max-width 400ms cubic-bezier(0.16,1,0.3,1), background-color 350ms ease, border-color 350ms ease, box-shadow 350ms ease, padding 400ms cubic-bezier(0.16,1,0.3,1)' }}
        >

          {/* الشعار + اسم الشركة بنبضة توهج مستمرة (CSS بحت — لا يعتمد على تركيب React) */}
          <SectionLink to="#home" aria-label={siteName} className={`flex items-center gap-2.5 decoration-transparent shrink-0 rounded-full ${focusRing}`}>
            <Logo settings={settings} />
            {/* The pulse is on the outer span and the gradient text on the inner one:
                animating a background-clip:text element made the browser repaint the
                text on every frame; animating its plain wrapper only moves a finished
                image, on the GPU. */}
            <span className="inline-block animate-[name-pulse_2.5s_ease-in-out_infinite]">
              <span
                style={{ backgroundImage: 'var(--nav-name-gradient)' }}
                className="text-2xl font-bold bg-clip-text text-transparent inline-block"
              >
                {siteName}
              </span>
            </span>
          </SectionLink>

          {/* روابط الديسكتوب — حبة متحركة عند الـ hover */}
          <ul
            className="hidden md:flex items-center gap-1 list-none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {desktopLinks.map((link, idx) => {
              const isActive = activeId === link.id.replace('#', '');
              // One pill, not two. The hovered item borrows it as a preview and
              // it settles back on the section actually being read when the
              // pointer leaves — so the header always answers "where am I?".
              const lit = hoveredIdx !== null ? hoveredIdx === idx : isActive;
              return (
                <li key={link.id} className="relative" onMouseEnter={() => setHoveredIdx(idx)}>
                  <SectionLink
                    to={link.id}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative z-10 block px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${focusRing} ${
                      lit
                        ? ui.linkLit
                        : ui.link
                    }`}
                  >
                    {ar ? link.ar : link.en}
                  </SectionLink>
                  {lit && (
                    <motion.span
                      layoutId="navPill"
                      className={`absolute inset-0 rounded-full ${ui.pill}`}
                      transition={reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* إجراءات الديسكتوب */}
          <div className="hidden md:flex items-center gap-1">
            <AnimatedThemeToggler
              iconSize={17}
              label={ar ? 'تبديل الوضع الداكن/الفاتح' : 'Toggle dark/light mode'}
              className={`p-2.5 rounded-full ${ui.icon} transition-colors ${focusRing}`}
            />

            <motion.button
              {...tap}
              onClick={() => setLang(ar ? 'en' : 'ar')}
              className={`px-2.5 py-2 text-sm font-medium ${ui.link} transition-colors rounded-full ${focusRing}`}
              style={{ fontFamily: 'var(--font-en)' }}
            >
              {ar ? 'EN' : 'عربي'}
            </motion.button>

            <MotionSectionLink
              to="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`ms-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold px-5 py-2.5 shadow-[0_4px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_22px_rgba(59,130,246,0.5)] transition-shadow ${focusRing}`}
            >
              {ar ? 'تواصل معنا' : 'Contact Us'}
            </MotionSectionLink>
          </div>

          {/* هامبرغر الجوال ← يتحول إلى X */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={`md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 ${ui.burger} shrink-0 rounded-full ${focusRing}`}
            aria-label={mobileOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')}
            aria-expanded={mobileOpen}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_EXPO }}
              className="block w-5 h-0.5 bg-current rounded-full"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-0.5 bg-current rounded-full"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_EXPO }}
              className="block w-5 h-0.5 bg-current rounded-full"
            />
          </button>
        </nav>
      </motion.header>

      {/* قائمة الجوال ملء الشاشة */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            // Its link list scrolls on short screens; keep the wheel native there.
            data-lenis-prevent
            className="fixed inset-0 z-[90] md:hidden bg-white dark:bg-[#050810] flex flex-col"
          >
            {/* الرأس: الشعار + زر الإغلاق — بلا كبسولة، مباشرة فوق خلفية القائمة */}
            <div className="h-[10%] shrink-0 flex items-center justify-between w-full px-6 pt-6">
              <SectionLink to="#home" aria-label={siteName} className={`flex items-center gap-2.5 decoration-transparent ${focusRing}`}>
                <Logo settings={settings} />
                {/* The pulse is on the outer span and the gradient text on the inner one:
                    animating a background-clip:text element made the browser repaint the
                    text on every frame; animating its plain wrapper only moves a finished
                    image, on the GPU. */}
                <span className="inline-block animate-[name-pulse_2.5s_ease-in-out_infinite]">
                  <span
                    style={{ backgroundImage: 'var(--nav-name-gradient)' }}
                    className="text-2xl font-bold bg-clip-text text-transparent inline-block"
                  >
                    {siteName}
                  </span>
                </span>
              </SectionLink>
              <motion.button
                {...tap}
                onClick={() => setMobileOpen(false)}
                className={`w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white ${focusRing}`}
                aria-label={ar ? 'إغلاق القائمة' : 'Close menu'}
              >
                <X size={26} />
              </motion.button>
            </div>

            {/* المنتصف: الروابط، مستندة لخط وهمي نظيف من جهة البداية */}
            <motion.ul
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              animate="visible"
              className="flex-1 flex flex-col items-start w-full px-8 pt-12 gap-6 list-none overflow-y-auto"
            >
              {NAV_LINKS.map((link) => (
                <motion.li key={link.id} variants={fadeUp}>
                  <SectionLink
                    to={link.id}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-xl font-medium text-gray-800 dark:text-gray-200 ltr:tracking-wide transition-colors hover:text-gray-500 dark:hover:text-brand-gray rounded-xl ${focusRing}`}
                  >
                    {ar ? link.ar : link.en}
                  </SectionLink>
                </motion.li>
              ))}
            </motion.ul>

            {/* القدم: أيقونات التواصل في سطر، وأزرار التحكم في سطر منفصل — كلاهما
                متمركز حتى لا يبقى صف أخير معلّقاً بطرف واحد عند التفاف الأيقونات */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="shrink-0 flex flex-col items-center gap-5 w-full border-t border-gray-200 dark:border-gray-800 pt-6 pb-8 px-6"
            >
              <div className="flex flex-wrap justify-center gap-3">
                {activeSocialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <motion.a
                      key={i}
                      {...tap}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-200 ${focusRing}`}
                    >
                      <Icon size={18} aria-hidden="true" focusable="false" />
                    </motion.a>
                  );
                })}
              </div>

              <div className="flex justify-center items-center gap-4">
                <motion.button
                  {...tap}
                  onClick={() => setLang(ar ? 'en' : 'ar')}
                  className={`h-12 px-5 rounded-full text-base font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-200 ${focusRing}`}
                  style={{ fontFamily: 'var(--font-en)' }}
                >
                  {ar ? 'EN' : 'عربي'}
                </motion.button>
                <AnimatedThemeToggler
                  iconSize={19}
                  label={ar ? 'تبديل الوضع الداكن/الفاتح' : 'Toggle dark/light mode'}
                  className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-200 ${focusRing}`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
