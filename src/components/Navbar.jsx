import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { EASE_EXPO, fadeUp, staggerContainer } from '../utils/motion';
import { getSocialIcon } from '../utils/socialIcons';
import { SITE_NAME, NAV_LINKS } from '../utils/siteConfig';
import AnimatedThemeToggler from './AnimatedThemeToggler';

const tap = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050810]';

export const Logo = ({ settings }) => (
  settings.logo ? (
    <img
      src={settings.logo}
      alt=""
      width="48"
      height="48"
      fetchPriority="high"
      decoding="async"
      className="h-10 w-auto object-contain shrink-0"
    />
  ) : (
    <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-10 w-auto shrink-0">
      <rect width="100" height="100" rx="20" fill="#0a0f1e"/>
      <text x="50" y="62" fontFamily="JetBrains Mono,monospace" fontSize="42" fontWeight="700" textAnchor="middle" fill="url(#lg)">CL</text>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d4ed8"/>
          <stop offset="100%" stopColor="#b91c1c"/>
        </linearGradient>
      </defs>
    </svg>
  )
);

const Navbar = () => {
  const { lang, setLang } = useLang();
  const settings = useSettings();

  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ar = lang === 'ar';

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
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_EXPO }}
        className={`fixed top-4 inset-x-0 z-[100] px-4 md:block ${mobileOpen ? 'hidden' : 'block'}`}
      >
        <nav
          aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}
          className="max-w-5xl mx-auto flex items-center justify-between gap-4 rounded-full border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-[#050810]/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] ps-4 pe-2.5 py-2 md:ps-5 md:pe-2.5 md:py-2.5"
        >

          {/* الشعار + اسم الشركة بنبضة توهج مستمرة (CSS بحت — لا يعتمد على تركيب React) */}
          <a href="#" aria-label={siteName} className={`flex items-center gap-2.5 decoration-transparent shrink-0 rounded-full ${focusRing}`}>
            <Logo settings={settings} />
            <span
              style={{ backgroundImage: 'var(--nav-name-gradient)' }}
              className="text-2xl font-bold bg-clip-text text-transparent inline-block animate-[name-pulse_2.5s_ease-in-out_infinite]"
            >
              {siteName}
            </span>
          </a>

          {/* روابط الديسكتوب — حبة متحركة عند الـ hover */}
          <ul
            className="hidden md:flex items-center gap-1 list-none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {desktopLinks.map((link, idx) => (
              <li key={link.id} className="relative" onMouseEnter={() => setHoveredIdx(idx)}>
                <a
                  href={link.id}
                  className={`relative z-10 block px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-full ${focusRing}`}
                >
                  {ar ? link.ar : link.en}
                </a>
                {hoveredIdx === idx && (
                  <motion.span
                    layoutId="navHoverPill"
                    className="absolute inset-0 rounded-full bg-gray-100 dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
              </li>
            ))}
          </ul>

          {/* إجراءات الديسكتوب */}
          <div className="hidden md:flex items-center gap-1">
            <AnimatedThemeToggler
              iconSize={17}
              label={ar ? 'تبديل الوضع الداكن/الفاتح' : 'Toggle dark/light mode'}
              className={`p-2.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors ${focusRing}`}
            />

            <motion.button
              {...tap}
              onClick={() => setLang(ar ? 'en' : 'ar')}
              className={`px-2.5 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full ${focusRing}`}
              style={{ fontFamily: 'var(--font-en)' }}
            >
              {ar ? 'EN' : 'عربي'}
            </motion.button>

            <motion.a
              href="#contact"
              animate={{ rotate: [0, -7, 6, -5, 4, -2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ transformOrigin: 'top center' }}
              className={`ms-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold px-5 py-2.5 shadow-[0_4px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_22px_rgba(59,130,246,0.5)] transition-shadow ${focusRing}`}
            >
              {ar ? 'تواصل معنا' : 'Contact Us'}
            </motion.a>
          </div>

          {/* هامبرغر الجوال ← يتحول إلى X */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={`md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-gray-700 dark:text-white shrink-0 rounded-full ${focusRing}`}
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
            className="fixed inset-0 z-[90] md:hidden bg-white dark:bg-[#050810] flex flex-col"
          >
            {/* الرأس: الشعار + زر الإغلاق — بلا كبسولة، مباشرة فوق خلفية القائمة */}
            <div className="h-[10%] shrink-0 flex items-center justify-between w-full px-6 pt-6">
              <a href="#" aria-label={siteName} className={`flex items-center gap-2.5 decoration-transparent ${focusRing}`}>
                <Logo settings={settings} />
                <span
                  style={{ backgroundImage: 'var(--nav-name-gradient)' }}
                  className="text-2xl font-bold bg-clip-text text-transparent inline-block animate-[name-pulse_2.5s_ease-in-out_infinite]"
                >
                  {siteName}
                </span>
              </a>
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
                  <a
                    href={link.id}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-xl font-medium text-gray-800 dark:text-gray-200 tracking-wide transition-colors hover:text-gray-500 dark:hover:text-brand-gray rounded-xl ${focusRing}`}
                  >
                    {ar ? link.ar : link.en}
                  </a>
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
                      className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-200 ${focusRing}`}
                    >
                      <Icon size={18} />
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
