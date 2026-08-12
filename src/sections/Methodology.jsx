import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLang } from '../context/LangContext';
import { apiGetMethodology } from '../services/api';
import { EASE_EXPO } from '../utils/motion';
import DynamicIcon from '../components/DynamicIcon';

gsap.registerPlugin(ScrollTrigger);

const LABELS = {
  ar: { title: 'منهجية العمل الاحترافية', sub: 'عملية منظمة ومجربة تبدأ من هندسة البيانات وتنتهي بدعم تقني مستمر — شفافية كاملة في كل مرحلة.' },
  en: { title: 'Our Methodology', sub: 'A structured and proven process from data engineering to ongoing support — full transparency at every step.' },
};

const FALLBACK = [
  { id: '01', icon: '🔍', title: 'التحليل وهندسة المتطلبات', titleEn: 'Analysis & Requirements', desc: 'نبدأ بفهم عميق لاحتياجاتك، نحلل السوق، ونقوم ببناء مخططات قاعدة البيانات (ERDs) وهيكلية النظام التقنية.', descEn: 'We start by deeply understanding your needs, analyzing the market, and building ERDs and technical architecture.' },
  { id: '02', icon: '🎨', title: 'التصميم وتجربة المستخدم', titleEn: 'UI/UX Design', desc: 'نحول الهيكل إلى واجهات احترافية في Figma، مع التركيز على سهولة الاستخدام والانسيابية في التنقل.', descEn: 'We transform the structure into professional interfaces in Figma, focusing on ease of use.' },
  { id: '03', icon: '⚙️', title: 'التطوير البرمجي (Agile)', titleEn: 'Agile Development', desc: 'نبدأ كتابة كود نظيف وموثق باستخدام تقنياتنا الحديثة، مع تسليمات دورية لتكون على اطلاع دائم.', descEn: 'We write clean, documented code using modern tech, with periodic deliverables to keep you updated.' },
  { id: '04', icon: '🧪', title: 'الاختبار وضمان الجودة', titleEn: 'Testing & QA', desc: 'تخضع كافة الأنظمة لاختبارات أداء وأمان دقيقة لضمان خلوها من الثغرات البرمجية.', descEn: 'All systems undergo rigorous performance and security tests to ensure they are free of bugs.' },
  { id: '05', icon: '🚀', title: 'الإطلاق والدعم الفني', titleEn: 'Launch & Support', desc: 'نقوم برفع المشروع على السيرفرات السحابية، وتقديم تدريب كامل لفريقك، مع دعم تقني مستمر.', descEn: 'We deploy to cloud servers, provide full training for your team, and offer ongoing technical support.' },
];

const fromApi = (s, idx) => ({
  id:      String(s.order ?? s.step_number ?? idx + 1).padStart(2, '0'),
  icon:    s.icon        ?? '⚙️',
  title:   s.title       ?? '',
  titleEn: s.title_en    ?? s.title ?? '',
  desc:    s.description ?? '',
  descEn:  s.description_en ?? s.description ?? '',
});

const Methodology = () => {
  const { lang } = useLang();
  const [steps, setSteps] = useState(FALLBACK);
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    apiGetMethodology()
      .then(res => {
        const data = (res.data ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (data.length > 0) setSteps(data.map(fromApi));
      })
      .catch(() => {});
  }, []);

  // Narrative scroll: the connecting line draws itself as the user scrolls
  // through the steps (GSAP ScrollTrigger, scrubbed to scroll progress).
  useGSAP(() => {
    if (!lineRef.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(lineRef.current, { scaleY: 1 });
      return;
    }

    gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' });
    gsap.to(lineRef.current, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: timelineRef.current,
        start: 'top 75%',
        end: 'bottom 85%',
        scrub: 0.6,
      },
    });
  }, { scope: timelineRef, dependencies: [steps] });

  const lbl = LABELS[lang];

  return (
    <section id="methodology" className="py-24 bg-gray-100 dark:bg-[#0a0f1e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center flex flex-col items-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{lbl.title}</h2>
          <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
        </motion.div>

        <div className="relative" ref={timelineRef}>
          <div ref={lineRef} className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-red-500/50 to-blue-500/50 hidden lg:block -translate-x-1/2"></div>

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: EASE_EXPO }}
                className={`flex flex-col lg:flex-row items-center justify-between w-full mb-8 lg:mb-16 ${idx % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="w-full lg:w-[45%] p-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-gray-400 dark:hover:border-brand-gray/40 transition-colors group shadow-sm dark:shadow-none">
                  <div className="text-gray-500 dark:text-brand-gray font-mono text-sm mb-2">STEP {step.id}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-brand-gray transition-colors">
                    {lang === 'ar' ? step.title : (step.titleEn || step.title)}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
                    {lang === 'ar' ? step.desc : (step.descEn || step.desc)}
                  </p>
                </div>

                <div className="relative z-10 my-6 lg:my-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#050810] border-2 border-gray-400 dark:border-brand-gray flex items-center justify-center text-gray-600 dark:text-brand-gray shadow-[0_0_20px_rgba(225,226,228,0.2)]">
                    <DynamicIcon emoji={step.icon} size={20} />
                  </div>
                </div>

                <div className="hidden lg:block lg:w-[45%]"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
