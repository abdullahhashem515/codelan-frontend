import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { apiGetAchievements } from '../services/api';
import Counter from '../components/Counter';
import DynamicIcon from '../components/DynamicIcon';
import TiltCard from '../components/TiltCard';
import { EASE_EXPO } from '../utils/motion';

const LABELS = {
  ar: { title: 'إنجازاتنا وأرقامنا', sub: 'أرقام حقيقية تعكس جودة عملنا والثقة التي يضعها عملاؤنا فينا.' },
  en: { title: 'Our Achievements', sub: 'Real numbers reflecting the quality of our work and the trust our clients place in us.' },
};

const FALLBACK = [
  { icon: '🏆', num: 3,   suffix: '',  title: 'جوائز تقنية',    titleEn: 'Tech Awards',        sub: 'في مسابقات البرمجة',       subEn: 'in programming competitions' },
  { icon: '📦', num: 20,  suffix: '+', title: 'مشروع مُسلَّم',   titleEn: 'Projects Delivered', sub: 'في الوقت المحدد',          subEn: 'on schedule' },
  { icon: '⭐', num: 15,  suffix: '+', title: 'عميل راضٍ',       titleEn: 'Happy Clients',      sub: 'معدل رضا 99%',              subEn: '99% satisfaction rate' },
  { icon: '📝', num: 10,  suffix: '',  title: 'مقال تقني',       titleEn: 'Tech Articles',      sub: 'منشور في المدونة',         subEn: 'published on our blog' },
  { icon: '🤝', num: 5,   suffix: '',  title: 'شراكات تقنية',   titleEn: 'Tech Partnerships',  sub: 'مع شركات محلية',           subEn: 'with local companies' },
  { icon: '🔒', num: 100, suffix: '%', title: 'معدل الأمان',     titleEn: 'Security Rate',      sub: 'لا خروقات أمنية',          subEn: 'zero security breaches' },
];

const fromApi = (a) => ({
  icon:    a.icon        ?? '🏆',
  num:     parseFloat(a.value ?? 0),
  suffix:  a.unit        ?? '',
  title:   a.title       ?? '',
  titleEn: a.title_en    ?? a.title ?? '',
  sub:     a.subtitle    ?? '',
  subEn:   a.subtitle_en ?? a.subtitle ?? '',
});

const Achievements = () => {
  const { lang } = useLang();
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    apiGetAchievements()
      .then(res => {
        const data = (res.data ?? []);
        if (data.length > 0) setItems(data.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];

  return (
    <section id="achievements" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{lbl.title}</h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">{lbl.sub}</p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6">
        {items.map((item, idx) => (
          <TiltCard
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE_EXPO }}
            className="w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] xl:w-[calc(16.666%-1.25rem)] bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 text-center hover:border-gray-400 dark:hover:border-brand-gray/40 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-red-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
            <span aria-label={lang === 'ar' ? item.title : item.titleEn} className="flex justify-center mb-4 text-gray-500 dark:text-brand-gray opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <DynamicIcon emoji={item.icon} size={34} />
            </span>
            <div className="text-3xl font-bold text-gray-600 dark:text-brand-gray font-mono mb-2">
              <Counter to={item.num} suffix={item.suffix} />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {lang === 'ar' ? item.title : (item.titleEn || item.title)}
            </div>
            <div className="text-xs text-gray-600 dark:text-slate-300">
              {lang === 'ar' ? item.sub : (item.subEn || item.sub)}
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
};

export default Achievements;
