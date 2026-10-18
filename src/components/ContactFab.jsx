import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { getSocialIcon } from '../utils/socialIcons';

const tap = { whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } };

// زر تواصل عائم ثابت في الموقع — يفتح "دروب-أب" بكل أيقونات التواصل النشطة
// (واتساب، انستقرام، ...) بدل تكديسها في الصفحة.
const ContactFab = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [overContact, setOverContact] = useState(false);
  const ar = lang === 'ar';

  // Step aside while the contact section is on screen: it already lists every
  // channel, and the button sat on top of its content. Measured on scroll by id
  // rather than with an observer, because the section mounts late and replaces
  // its placeholder — an observer bound to the placeholder would go deaf.
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const vh = window.innerHeight;
      const el = document.getElementById('contact');
      const r = el?.getBoundingClientRect();
      const overSection = Boolean(r) && r.top < vh * 0.6 && r.bottom > vh * 0.4;
      // Also over the footer: its bottom bar puts the copyright exactly where
      // the button sits, and the button was hiding the ©.
      const foot = document.getElementById('site-footer')?.getBoundingClientRect();
      const overFooter = Boolean(foot) && foot.top < vh - 80;
      // And over the hero: it already offers the main call to action and a
      // WhatsApp link, and on a phone the button sat on top of the first
      // figure. It appears once the hero has mostly scrolled away.
      const hero = document.getElementById('home')?.getBoundingClientRect();
      const overHero = Boolean(hero) && hero.bottom > vh * 0.35;
      const covering = overSection || overFooter || overHero;
      setOverContact(prev => (prev === covering ? prev : covering));
      if (covering) setOpen(false);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const activeSocialLinks = settings.socialLinks.filter(l => l.active !== false && l.url);
  if (activeSocialLinks.length === 0) return null;

  const hasWhatsapp = activeSocialLinks.some(l => l.platform === 'whatsapp');

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[80] flex flex-col items-center gap-3"
      initial={false}
      animate={overContact ? { opacity: 0, scale: 0.6, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ pointerEvents: overContact ? 'none' : 'auto' }}
      aria-hidden={overContact || undefined}
    >
      <AnimatePresence>
        {open && activeSocialLinks.map((link, i) => {
          const Icon = getSocialIcon(link.platform);
          return (
            <motion.a
              key={link.id ?? link.platform}
              {...tap}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.5 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 340, damping: 22 }}
              aria-label={link.platform}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] text-gray-700 dark:text-slate-200 shadow-[0_6px_18px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-white/10"
            >
              <Icon size={20} aria-hidden="true" focusable="false" />
            </motion.a>
          );
        })}
      </AnimatePresence>

      <div className="relative">
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
        )}
        <motion.button
          {...tap}
          onClick={() => setOpen(o => !o)}
          aria-label={ar ? 'تواصل معنا' : 'Contact us'}
          aria-expanded={open}
          className="relative w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_8px_24px_rgba(59,130,246,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050810]"
        >
          <motion.span animate={{ rotate: open ? 135 : 0 }} transition={{ duration: 0.25 }}>
            {open ? (
              <X size={24} />
            ) : hasWhatsapp ? (
              <SiWhatsapp size={24} aria-hidden="true" focusable="false" />
            ) : (
              <MessageCircle size={24} />
            )}
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ContactFab;
