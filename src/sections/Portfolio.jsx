import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { apiGetProjects } from '../services/api';
import TiltCard from '../components/TiltCard';
import { fadeUp, staggerContainer } from '../utils/motion';

const LABELS = {
  ar: { title: 'حالات الدراسة والأعمال', sub: 'مشاريع حقيقية، نتائج قابلة للقياس. كل مشروع يحكي قصة مشكلة تم حلها بذكاء هندسي.', viewDetails: 'عرض التفاصيل' },
  en: { title: 'Case Studies & Work', sub: 'Real projects, measurable results. Every project tells the story of a problem solved with engineering intelligence.', viewDetails: 'View Details' },
};

const FALLBACK = [
  {
    id: 1, category: 'منصة SaaS', categoryEn: 'SaaS Platform',
    title: 'منصة إدارة الأعمال الذكية (Code LAN ERP)', titleEn: 'Smart Business Management ERP',
    desc: 'نظام سحابي متكامل لإدارة المبيعات والمخزون والعملاء، مصمم للتعامل مع آلاف الحركات المالية لحظياً.',
    descEn: 'An integrated cloud system for managing sales, inventory, and customers, handling thousands of real-time transactions.',
    metrics: [{ val: '40%', lbl: { ar: 'تحسن الكفاءة', en: 'Efficiency Gain' } }, { val: '3x', lbl: { ar: 'سرعة المعالجة', en: 'Process Speed' } }, { val: '500+', lbl: { ar: 'مستخدم نشط', en: 'Active Users' } }],
    stack: ['React', 'Laravel', 'MySQL', 'Redis'],
    thumbGradient: 'from-[#0a1628] to-[#1a2a4a]', strokeColor: '#3b82f6',
  },
  {
    id: 2, category: 'تطبيق موبايل', categoryEn: 'Mobile App',
    title: 'تطبيق خدمات وتوصيل محلي', titleEn: 'Local Delivery & Services App',
    desc: 'تطبيق موبايل لربط مزودي الخدمات بالعملاء مع تتبع حي ومباشر عبر الخرائط وأنظمة دفع متكاملة.',
    descEn: 'Mobile app connecting service providers with customers, featuring live tracking and integrated payment systems.',
    metrics: [{ val: '10K+', lbl: { ar: 'تحميل', en: 'Downloads' } }, { val: '4.8★', lbl: { ar: 'تقييم المتجر', en: 'Store Rating' } }, { val: '60%', lbl: { ar: 'نمو شهري', en: 'Monthly Growth' } }],
    stack: ['Flutter', 'Node.js', 'PostgreSQL'],
    thumbGradient: 'from-[#1a0a0a] to-[#3a1515]', strokeColor: '#ef4444',
  },
  {
    id: 3, category: 'نظام ويب وشبكات', categoryEn: 'Web & Networks System',
    title: 'منصة إدارة شبكات مزودي الخدمة (ISP)', titleEn: 'ISP Network Management Platform',
    desc: 'نظام مخصص للتحكم بخدمات الإنترنت، متصل مباشرة بأجهزة MikroTik و Ubiquiti.',
    descEn: 'A custom system to control internet services, connecting to MikroTik and Ubiquiti devices.',
    metrics: [{ val: '99.9%', lbl: { ar: 'استقرار النظام', en: 'Uptime' } }, { val: '0', lbl: { ar: 'توقف مفاجئ', en: 'Downtime' } }, { val: '5K+', lbl: { ar: 'مشترك', en: 'Subscribers' } }],
    stack: ['Vue.js', 'Laravel', 'MikroTik API'],
    thumbGradient: 'from-[#0a1a0a] to-[#153015]', strokeColor: '#22c55e',
  },
];

const GRADIENTS = [
  'from-[#0a1628] to-[#1a2a4a]', 'from-[#1a0a0a] to-[#3a1515]',
  'from-[#0a1a0a] to-[#153015]', 'from-[#1a1000] to-[#3a2a00]',
  'from-[#0a0a1a] to-[#1a1a3a]', 'from-[#1a0028] to-[#2d1545]',
];
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

const parseStack = (stack) => {
  if (Array.isArray(stack)) return stack;
  if (typeof stack === 'string' && stack) return stack.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const fromApi = (p, idx) => ({
  id:           p.id,
  category:     p.category     ?? '',
  categoryEn:   p.category_en  ?? p.category ?? '',
  title:        p.title        ?? '',
  titleEn:      p.title_en     ?? p.title ?? '',
  desc:         p.description  ?? '',
  descEn:       p.description_en ?? p.description ?? '',
  metrics:      Array.isArray(p.metrics) ? p.metrics :
                (typeof p.metrics === 'string' && p.metrics ? (() => { try { return JSON.parse(p.metrics); } catch { return []; } })() : []),
  stack:        parseStack(p.stack || p.technologies),
  thumbGradient: p.thumb_gradient ?? GRADIENTS[idx % GRADIENTS.length],
  strokeColor:   p.stroke_color  ?? COLORS[idx % COLORS.length],
});

const Portfolio = () => {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(FALLBACK);

  useEffect(() => {
    apiGetProjects()
      .then(res => {
        const active = (res.data ?? []).filter(p => !p.status || p.status === 'active');
        if (active.length > 0) setProjects(active.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];

  return (
    <section id="portfolio" className="py-24 w-full bg-gray-100 dark:bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6">
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
          variants={staggerContainer(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-8"
        >
          {projects.map((project) => (
            <TiltCard
              key={project.id}
              variants={fadeUp}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="relative w-full lg:w-[calc(33.333%-1.3334rem)] bg-white dark:bg-[#0d1428] border border-gray-200 dark:border-brand-gray/15 rounded-2xl overflow-hidden group hover:border-gray-400 dark:hover:border-brand-gray/40 transition-[transform,border-color] duration-300 hover:-translate-y-2 shadow-sm hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-none dark:hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              {/* شريط علوي بلون المشروع — نفس "التوقيع" البصري المستخدم في
                  بطاقات الخدمات */}
              <span
                aria-hidden="true"
                className="absolute top-0 inset-x-0 h-1 z-20 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: project.strokeColor }}
              />
              <div className={`h-48 w-full bg-gradient-to-br ${project.thumbGradient} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1428]/80 z-10"></div>
                <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-50 relative z-0 group-hover:scale-110 transition-transform duration-700">
                  <rect x="10" y="10" width="100" height="60" rx="8" fill="none" stroke={project.strokeColor} strokeWidth="2" opacity="0.6"/>
                  <circle cx="60" cy="40" r="15" fill="none" stroke={project.strokeColor} strokeWidth="1.5" opacity="0.8"/>
                  <line x1="10" y1="40" x2="45" y2="40" stroke={project.strokeColor} strokeWidth="1" opacity="0.5"/>
                  <line x1="75" y1="40" x2="110" y2="40" stroke={project.strokeColor} strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <span className="font-mono text-xs text-gray-600 dark:text-brand-gray bg-gray-100 dark:bg-brand-gray/10 px-2.5 py-1 rounded">
                    {lang === 'ar' ? project.category : (project.categoryEn || project.category)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-brand-gray transition-colors">
                  {lang === 'ar' ? project.title : (project.titleEn || project.title)}
                </h3>
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                  {lang === 'ar' ? project.desc : (project.descEn || project.desc)}
                </p>

                {project.metrics.length > 0 && (
                  <div className="flex gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl mb-6">
                    {project.metrics.slice(0, 3).map((metric, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="font-mono text-lg font-bold text-gray-700 dark:text-brand-gray mb-1">{metric.val}</div>
                        <div className="text-[10px] text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                          {typeof metric.lbl === 'object' ? (lang === 'ar' ? metric.lbl.ar : metric.lbl.en) : metric.lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {project.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech, i) => (
                      <span key={i} className="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-200 dark:border-brand-gray/15">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-brand-gray group-hover:underline">
                    {lbl.viewDetails} {lang === 'ar' ? '←' : '→'}
                  </span>
                </div>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
