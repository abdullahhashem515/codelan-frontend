import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { apiGetTechStack } from '../services/api';
import TiltCard from '../components/TiltCard';
import { fadeUp, staggerContainer } from '../utils/motion';

const LABELS = {
  ar: { title: 'المكدس التقني والبيئة البرمجية', sub: 'نختار الأداة المناسبة للمشكلة الصحيحة. نعتمد على أحدث التقنيات وأكثرها استقراراً لبناء أنظمة تعيش طويلاً.' },
  en: { title: 'Our Tech Stack', sub: 'We choose the right tool for the right problem. Relying on the latest and most stable technologies to build long-lasting systems.' },
};

const FALLBACK = [
  { title: 'Frontend', titleEn: 'Frontend', items: [{ name: 'React', dot: '#60a5fa' }, { name: 'Vue.js', dot: '#4ade80' }, { name: 'Tailwind CSS', dot: '#a78bfa' }, { name: 'TypeScript', dot: '#3b82f6' }] },
  { title: 'Backend & APIs', titleEn: 'Backend & APIs', items: [{ name: 'Laravel', dot: '#ef4444' }, { name: 'ASP.NET Core', dot: '#6366f1' }, { name: 'Node.js', dot: '#22c55e' }, { name: 'RESTful APIs', dot: '#facc15' }] },
  { title: 'Databases', titleEn: 'Databases', items: [{ name: 'MySQL', dot: '#3b82f6' }, { name: 'PostgreSQL', dot: '#60a5fa' }, { name: 'Redis', dot: '#f87171' }, { name: 'MongoDB', dot: '#22c55e' }] },
  { title: 'Mobile Apps', titleEn: 'Mobile Apps', items: [{ name: 'Flutter', dot: '#22d3ee' }, { name: 'Dart', dot: '#93c5fd' }, { name: 'React Native', dot: '#3b82f6' }] },
  { title: 'DevOps & Infra', titleEn: 'DevOps & Infra', items: [{ name: 'Docker', dot: '#60a5fa' }, { name: 'AWS', dot: '#fb923c' }, { name: 'Linux', dot: '#eab308' }] },
  { title: 'Networks & ISP', titleEn: 'Networks & ISP', items: [{ name: 'MikroTik', dot: '#94a3b8' }, { name: 'Cisco', dot: '#06b6d4' }, { name: 'Ubiquiti', dot: '#3b82f6' }] },
];

const fromApi = (cat) => ({
  title:   cat.title    ?? cat.name    ?? '',
  titleEn: cat.title_en ?? cat.name_en ?? '',
  items: (cat.items ?? []).map(i => ({
    name: i.name  ?? '',
    dot:  i.color ?? '#60a5fa',
  })),
});

const TechStack = () => {
  const { lang } = useLang();
  const [categories, setCategories] = useState(FALLBACK);

  useEffect(() => {
    apiGetTechStack()
      .then(res => {
        const cats = (res.data ?? []).filter(c => c.items && c.items.length > 0);
        if (cats.length > 0) setCategories(cats.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];

  return (
    <section id="techstack" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{lbl.title}</h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="flex flex-wrap justify-center gap-6"
      >
        {categories.map((cat, idx) => (
          <TiltCard
            key={idx}
            variants={fadeUp}
            className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white dark:bg-[#111827] border border-gray-200 dark:border-brand-gray/15 rounded-2xl p-6 transition-[border-color] duration-300 hover:border-gray-400 dark:hover:border-brand-gray/40 group shadow-sm dark:shadow-none"
          >
            <h3 className="text-sm font-mono text-gray-600 dark:text-brand-gray uppercase tracking-wider mb-5">
              {lang === 'ar' ? cat.title : (cat.titleEn || cat.title)}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {cat.items.map((tech, tIdx) => (
                <div
                  key={tIdx}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 transition-[border-color,background-color,color] duration-200 hover:!bg-blue-50 dark:hover:!bg-blue-500/10 hover:!border-blue-400 dark:hover:!border-blue-500/30 hover:!text-blue-600 dark:hover:!text-blue-300 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tech.dot }}></span>
                  <span className="font-english">{tech.name}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        ))}
      </motion.div>
    </section>
  );
};

export default TechStack;
