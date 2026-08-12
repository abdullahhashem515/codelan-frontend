import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { getSocialIcon } from '../utils/socialIcons';
import { EASE_EXPO, fadeUp, staggerContainer } from '../utils/motion';
import { SITE_NAME, NAV_LINKS } from '../utils/siteConfig';
import { Logo } from './Navbar';

const LABELS = {
  ar: { about: 'شريكك التقني لبناء حلول برمجية دقيقة واحترافية تدفع أعمالك للأمام.', links: 'روابط سريعة', contact: 'تواصل معنا', rights: 'جميع الحقوق محفوظة.', top: 'العودة للأعلى' },
  en: { about: 'Your technical partner for building precise, professional software solutions that move your business forward.', links: 'Quick Links', contact: 'Contact Us', rights: 'All rights reserved.', top: 'Back to top' },
};

const Footer = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const ar = lang === 'ar';

  const lbl = LABELS[lang];
  const siteName = ar ? SITE_NAME.ar : SITE_NAME.en;
  const activeSocialLinks = settings.socialLinks.filter(l => l.active !== false && l.url);
  const address = ar ? settings.addressAr : settings.addressEn;
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-gray-100 dark:bg-[#050810] border-t border-gray-200 dark:border-white/5 pt-20 pb-8 px-6">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12 mb-16"
      >
        <motion.div variants={fadeUp}>
          <a href="#home" aria-label={siteName} className="inline-flex items-center gap-2.5 mb-4">
            <Logo settings={settings} />
            <span
              style={{ backgroundImage: 'var(--nav-name-gradient)' }}
              className="text-2xl font-bold bg-clip-text text-transparent"
            >
              {siteName}
            </span>
          </a>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-6">{lbl.about}</p>

          {activeSocialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {activeSocialLinks.map((link, i) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500/40 transition-colors"
                  >
                    <Icon size={16} />
                  </motion.a>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">{lbl.links}</h3>
          <ul className="space-y-3 list-none">
            {NAV_LINKS.map(link => (
              <li key={link.id}>
                <a
                  href={link.id}
                  className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-brand-gray transition-colors"
                >
                  {ar ? link.ar : link.en}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">{lbl.contact}</h3>
          <ul className="space-y-4 list-none">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-brand-gray transition-colors">
                  <Mail size={16} className="shrink-0" />
                  <span dir="ltr">{settings.email}</span>
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-brand-gray transition-colors">
                  <Phone size={16} className="shrink-0" />
                  <span dir="ltr">{settings.phone}</span>
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-400">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
            )}
          </ul>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE_EXPO }}
        className="max-w-7xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-white/5"
      >
        <p className="text-xs text-gray-500 dark:text-slate-500">
          © {year} {siteName}. {lbl.rights}
        </p>

        <motion.a
          href="#home"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label={lbl.top}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500/40 transition-colors"
        >
          <ArrowUp size={16} />
        </motion.a>
      </motion.div>
    </footer>
  );
};

export default Footer;
