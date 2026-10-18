import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { EASE_EXPO } from '../utils/motion';
import { projectLinks } from '../utils/workKinds';

const LABELS = {
  ar: { close: 'إغلاق', prev: 'السابق', next: 'التالي', of: 'من' },
  en: { close: 'Close', prev: 'Previous', next: 'Next', of: 'of' },
};

// Lightbox gallery for one project: every screenshot, plus the links that
// actually matter (the live site for web work, the stores for an app). It
// stands in for the per-project page we removed — same payoff for a visitor,
// none of the CMS weight.
const ProjectGallery = ({ project, index, onIndex, onClose }) => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];
  const panelRef = useRef(null);
  const restoreFocusTo = useRef(null);

  const images = project.images?.length ? project.images : (project.image ? [project.image] : []);
  const count = images.length;
  const isMobileApp = project.type === 'mobile';

  const go = useCallback((delta) => {
    if (count < 2) return;
    onIndex((index + delta + count) % count);
  }, [count, index, onIndex]);

  // Escape closes; arrows move. Arrow direction follows the reading direction
  // so it matches the way the images are laid out on screen.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') go(ar ? -1 : 1);
      if (e.key === 'ArrowLeft') go(ar ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose, ar]);

  // Freeze the page behind the overlay and move focus into the dialog.
  useEffect(() => {
    restoreFocusTo.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusTo.current?.focus?.();
    };
  }, []);

  // On phones the back gesture should dismiss the gallery rather than leave
  // the site, so push a history entry while it is open.
  useEffect(() => {
    window.history.pushState({ gallery: true }, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (window.history.state?.gallery) window.history.back();
    };
  }, [onClose]);

  const title = ar ? project.title : (project.titleEn || project.title);
  const desc = ar ? project.desc : (project.descEn || project.desc);

  const links = projectLinks(project, lang);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: EASE_EXPO }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-full overflow-y-auto bg-white dark:bg-[#0d1428] rounded-2xl outline-none shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={lbl.close}
          className="absolute top-3 end-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {count > 0 && (
          <div className={`relative w-full flex items-center justify-center overflow-hidden ${isMobileApp ? 'bg-gradient-to-br from-gray-900 to-gray-800 py-6' : 'bg-gray-100 dark:bg-[#0a0f1e]'}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={images[index]}
                src={images[index]}
                alt=""
                decoding="async"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                drag={count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(ar ? -1 : 1);
                  else if (info.offset.x > 60) go(ar ? 1 : -1);
                }}
                className={isMobileApp
                  ? 'max-h-[60vh] w-auto rounded-xl shadow-2xl cursor-grab active:cursor-grabbing'
                  : 'w-full max-h-[60vh] object-contain cursor-grab active:cursor-grabbing'}
              />
            </AnimatePresence>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(ar ? 1 : -1)}
                  aria-label={lbl.prev}
                  className="absolute start-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={20} aria-hidden="true" className={ar ? 'rotate-180' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => go(ar ? -1 : 1)}
                  aria-label={lbl.next}
                  className="absolute end-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={20} aria-hidden="true" className={ar ? 'rotate-180' : ''} />
                </button>
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => onIndex(i)}
                      aria-label={`${i + 1} ${lbl.of} ${count}`}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
          {desc && <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-6">{desc}</p>}

          {project.stack?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.stack.map((tech) => (
                <span key={tech} dir="auto" className="text-xs text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200 dark:border-brand-gray/15">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold no-underline transition-colors"
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectGallery;
