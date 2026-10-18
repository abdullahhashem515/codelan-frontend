import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { FIELD_IMAGES } from '../utils/fieldImages';

// Real photographs of installed work — racks, camera runs, server rooms. For a
// company that lays networks and mounts cameras, this is the proof a visitor
// cannot get from icons or copy. Stock photography would do the opposite, so
// the section only ever shows files placed in src/assets/field/.

const LABELS = {
  ar: { title: 'من الميدان', sub: 'صور حقيقية من مشاريع نفّذناها — شبكات، كاميرات، وغرف خوادم.', close: 'إغلاق', prev: 'السابقة', next: 'التالية' },
  en: { title: 'In the Field', sub: 'Real photos from work we delivered — networks, cameras and server rooms.', close: 'Close', prev: 'Previous', next: 'Next' },
};

const FieldGallery = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];
  const [open, setOpen] = useState(null); // index of the photo in the lightbox

  const count = FIELD_IMAGES.length;
  const step = useCallback((d) => setOpen(i => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      // Arrow keys follow reading direction: in Arabic, left means "next".
      else if (e.key === 'ArrowLeft') step(ar ? 1 : -1);
      else if (e.key === 'ArrowRight') step(ar ? -1 : 1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, step, ar]);

  if (count === 0) return null;

  const current = open !== null ? FIELD_IMAGES[open] : null;
  const PrevIcon = ar ? ChevronRight : ChevronLeft;
  const NextIcon = ar ? ChevronLeft : ChevronRight;

  return (
    <section id="field" data-header="dark" className="relative z-10 py-24 px-6 overflow-hidden" style={{ backgroundColor: '#0a0f1e' }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 100% at 50% 0%, rgba(26,127,255,0.10), transparent 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">{lbl.title}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
        </motion.div>

        {/* Masonry via CSS columns: photos keep their own aspect ratio instead of
            being cropped to a uniform grid, which matters for tall rack shots. */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {FIELD_IMAGES.map((img, i) => {
            const caption = ar ? img.ar : img.en;
            return (
              <motion.button
                key={img.src}
                type="button"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative block w-full mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={caption || `${lbl.title} ${i + 1}`}
              >
                <img
                  src={img.src}
                  alt={caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {caption && (
                  <span className="absolute inset-x-0 bottom-0 p-3 text-start text-sm text-white bg-gradient-to-t from-black/75 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {caption}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Portaled to <body>: this section sits inside SectionTransition, whose
          transform turns position:fixed into "fixed to the section" and whose
          clip-path would cut the lightbox to the section's box. */}
      {createPortal(
      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ar ? current.ar : current.en}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setOpen(null)}
          >
            <img
              src={current.src}
              alt={ar ? current.ar : current.en}
              className="max-w-full max-h-[85svh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {(ar ? current.ar : current.en) && (
              <p className="absolute bottom-6 inset-x-0 text-center text-slate-200 text-sm px-6">{ar ? current.ar : current.en}</p>
            )}
            <button type="button" aria-label={lbl.close} onClick={() => setOpen(null)}
              className="absolute top-4 end-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <X size={22} />
            </button>
            {count > 1 && (
              <>
                <button type="button" aria-label={lbl.prev} onClick={(e) => { e.stopPropagation(); step(-1); }}
                  className="absolute start-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                  <PrevIcon size={22} />
                </button>
                <button type="button" aria-label={lbl.next} onClick={(e) => { e.stopPropagation(); step(1); }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                  <NextIcon size={22} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </section>
  );
};

export default FieldGallery;
