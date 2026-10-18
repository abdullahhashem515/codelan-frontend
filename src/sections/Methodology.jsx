import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useLenis } from '../components/SmoothScrollProvider';
import { apiGetMethodology } from '../services/api';
import { EASE_EXPO } from '../utils/motion';
import ArtStage from '../components/illustrations/ArtStage';
import StepArt from '../components/illustrations/StepArt';

// The methodology as a story told by scrolling. The section pins to the screen
// and each stretch of scroll advances one step: the step list tracks progress
// on one side, and a stage on the other plays that step's scene — the same
// drawing language as the service cards.
//
// Pinning is plain `position: sticky` inside a tall track, which only works if
// no ancestor clips overflow (hidden/auto make a scroll container sticky then
// sticks to). That is why this section carries no overflow class, and why its
// SectionTransition wrapper runs with variant 'none'.

const LABELS = {
  ar: { title: 'منهجية العمل', sub: 'أربع مراحل واضحة، من أول حديث حتى الإطلاق — تعرف أين وصل مشروعك في كل لحظة.', step: 'المرحلة', of: 'من' },
  en: { title: 'How We Work', sub: 'Four clear stages, from the first conversation to launch — you always know where your project stands.', step: 'Step', of: 'of' },
};

const FALLBACK = [
  { id: '01', title: 'التواصل وفهم الاحتياج', titleEn: 'Consultation & Requirements', desc: 'نجتمع بالعميل لفهم أهدافه ومتطلباته بدقة قبل البدء بأي خطوة تقنية.', descEn: 'We meet with the client to understand goals and requirements before any technical step.' },
  { id: '02', title: 'التخطيط والتصميم', titleEn: 'Planning & Design', desc: 'إعداد مخطط تقني وتصميم واجهات يعكس هوية المشروع.', descEn: 'Preparing a technical plan and designing interfaces reflecting the project identity.' },
  { id: '03', title: 'التطوير والبرمجة', titleEn: 'Development', desc: 'تنفيذ المشروع بأحدث التقنيات مع مراجعات دورية للجودة.', descEn: 'Building the project with the latest technologies and regular quality reviews.' },
  { id: '04', title: 'الاختبار والتسليم', titleEn: 'Testing & Delivery', desc: 'اختبار شامل قبل التسليم النهائي وتقديم الدعم الفني بعد الإطلاق.', descEn: 'Comprehensive testing before final delivery, plus technical support after launch.' },
];

const fromApi = (s, idx) => ({
  id:      String(s.order ?? s.step_number ?? idx + 1).padStart(2, '0'),
  title:   s.title       ?? '',
  titleEn: s.title_en    ?? s.title ?? '',
  desc:    s.description ?? '',
  descEn:  s.description_en ?? s.description ?? '',
});

// Scroll distance each step gets, in small-viewport heights. Long enough that a
// single flick of the wheel does not skip a step; short enough that four steps
// do not feel like a chore.
const PER_STEP = 85;

const Methodology = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];
  const reduce = useReducedMotion();
  const lenis = useLenis();

  const [steps, setSteps] = useState(FALLBACK);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    apiGetMethodology()
      .then(res => {
        const data = (res.data ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (data.length > 0) setSteps(data.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const n = steps.length;

  // 0 when the track's top meets the top of the screen (the frame pins), 1 when
  // its bottom meets the bottom (the frame releases).
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const rail = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.max(0, Math.min(n - 1, Math.floor(p * n)));
    setActive(prev => (prev === i ? prev : i));
  });

  // Clicking a step scrolls to the middle of its stretch, so it lands firmly on
  // that step rather than on the boundary with the next.
  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / n) * travel;
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const tt = (s) => (ar ? s.title : (s.titleEn || s.title));
  const dd = (s) => (ar ? s.desc : (s.descEn || s.desc));
  const pad = (k) => String(k).padStart(2, '0');

  const heading = (
    <div className="text-center mb-8 lg:mb-12">
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{lbl.title}</h2>
      <p className="hidden sm:block [@media(max-height:720px)]:hidden mt-4 text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
    </div>
  );

  // ── Reduced motion: no pinning, no scenes playing — the four steps as a
  //    plain, readable list with each scene shown as a still.
  if (reduce) {
    return (
      <section id="methodology" className="py-24 bg-gray-100 dark:bg-[#0a0f1e] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {heading}
          <ol className="grid md:grid-cols-2 gap-6 list-none">
            {steps.map((s, i) => (
              <li key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10">
                <ArtStage>{() => <StepArt step={s} index={i} on={false} />}</ArtStage>
                <div className="p-6">
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-2">{lbl.step} {pad(i + 1)}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tt(s)}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{dd(s)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  const current = steps[active] ?? steps[0];

  return (
    <section id="methodology" className="bg-gray-100 dark:bg-[#0a0f1e] relative z-10">
      <div ref={trackRef} className="relative" style={{ height: `${n * PER_STEP + 100}svh` }}>
        <div className="sticky top-0 h-svh flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 pt-16">
            {heading}

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-14 items-center">

              {/* Step list with a progress rail — desktop */}
              <ol className="hidden lg:block lg:col-span-5 relative list-none">
                <span aria-hidden="true" className="absolute start-5 top-5 bottom-5 w-px bg-gray-300 dark:bg-white/10" />
                <motion.span
                  aria-hidden="true"
                  className="absolute start-5 top-5 bottom-5 w-px origin-top"
                  style={{ scaleY: rail, background: 'linear-gradient(#0158B0, #1a7fff)' }}
                />
                {steps.map((s, i) => {
                  const state = i < active ? 'done' : i === active ? 'now' : 'next';
                  return (
                    <li key={i} className="relative pb-7 last:pb-0">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={state === 'now' ? 'step' : undefined}
                        className="w-full flex items-start gap-4 text-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-[background-color,color,box-shadow,border-color] duration-300 border ${
                          state === 'done' ? 'bg-blue-600 border-blue-600 text-white'
                          : state === 'now' ? 'bg-white dark:bg-[#0b1220] border-blue-500 text-blue-600 dark:text-blue-400 shadow-[0_0_0_6px_rgba(26,127,255,0.15)]'
                          : 'bg-gray-100 dark:bg-[#0a0f1e] border-gray-300 dark:border-white/15 text-gray-400 dark:text-slate-500'
                        }`}>
                          {state === 'done' ? <Check size={16} strokeWidth={3} /> : pad(i + 1)}
                        </span>
                        <span className="pt-2 min-w-0">
                          <span className={`block text-lg font-bold transition-colors duration-300 ${
                            state === 'now' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'
                          }`}>
                            {tt(s)}
                          </span>
                          <AnimatePresence initial={false}>
                            {state === 'now' && (
                              <motion.span
                                key="d"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: EASE_EXPO }}
                                className="block overflow-hidden"
                              >
                                <span className="block pt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">{dd(s)}</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* Stage */}
              <div className="lg:col-span-7">
                <ArtStage className="rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(1,88,176,0.45)]">
                  {(on) => (
                    <>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={active}
                          className="absolute inset-0"
                          initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
                          transition={{ duration: 0.4, ease: EASE_EXPO }}
                        >
                          <StepArt step={current} index={active} on={on} />
                        </motion.div>
                      </AnimatePresence>
                      <span className="absolute top-3 start-3 font-mono text-[11px] rtl:text-xs ltr:tracking-wider text-slate-300 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                        {lbl.step} {pad(active + 1)} {lbl.of} {pad(n)}
                      </span>
                      <span aria-hidden="true" className="absolute bottom-1 end-4 font-mono text-6xl md:text-7xl font-bold text-white/[0.06] select-none">
                        {pad(active + 1)}
                      </span>
                    </>
                  )}
                </ArtStage>

                {/* Mobile / tablet: segments + the active step's text */}
                <div className="lg:hidden mt-5">
                  <div className="flex gap-1.5 mb-4" aria-hidden="true">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => goTo(i)}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'}`}
                      />
                    ))}
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: EASE_EXPO }}
                      aria-live="polite"
                    >
                      <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-1.5">{lbl.step} {pad(active + 1)}</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tt(current)}</h3>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{dd(current)}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
