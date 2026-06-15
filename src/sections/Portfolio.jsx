import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const Portfolio = () => {
  const { lang } = useLang();
  const navigate = useNavigate();

  const content = {
    ar: {
      tag: '// portfolio',
      title: 'حالات الدراسة والأعمال',
      sub: 'مشاريع حقيقية، نتائج قابلة للقياس. كل مشروع يحكي قصة مشكلة تم حلها بذكاء هندسي.',
      viewDetails: 'عرض التفاصيل',
      projects: [
        {
          id: 1,
          category: 'منصة SaaS',
          title: 'منصة إدارة الأعمال الذكية (Code LAN ERP)',
          desc: 'نظام سحابي متكامل لإدارة المبيعات والمخزون والعملاء، مصمم للتعامل مع آلاف الحركات المالية لحظياً.',
          metrics: [
            { val: '40%', lbl: 'تحسن الكفاءة' },
            { val: '3x', lbl: 'سرعة المعالجة' },
            { val: '500+', lbl: 'مستخدم نشط' }
          ],
          stack: ['React', 'Laravel', 'MySQL', 'Redis'],
          thumbGradient: 'from-[#0a1628] to-[#1a2a4a]',
          strokeColor: '#3b82f6'
        },
        {
          id: 2,
          category: 'تطبيق موبايل',
          title: 'تطبيق خدمات وتوصيل محلي',
          desc: 'تطبيق موبايل لربط مزودي الخدمات بالعملاء مع تتبع حي ومباشر عبر الخرائط وأنظمة دفع متكاملة.',
          metrics: [
            { val: '10K+', lbl: 'تحميل' },
            { val: '4.8★', lbl: 'تقييم المتجر' },
            { val: '60%', lbl: 'نمو شهري' }
          ],
          stack: ['Flutter', 'Node.js', 'PostgreSQL'],
          thumbGradient: 'from-[#1a0a0a] to-[#3a1515]',
          strokeColor: '#ef4444'
        },
        {
          id: 3,
          category: 'نظام ويب وشبكات',
          title: 'منصة إدارة شبكات مزودي الخدمة (ISP)',
          desc: 'نظام مخصص للتحكم بخدمات الإنترنت، متصل مباشرة بأجهزة MikroTik و Ubiquiti لتوزيع الأحمال وإدارة المشتركين.',
          metrics: [
            { val: '99.9%', lbl: 'استقرار النظام' },
            { val: '0', lbl: 'توقف مفاجئ' },
            { val: '5K+', lbl: 'مشترك' }
          ],
          stack: ['Vue.js', 'Laravel', 'MikroTik API'],
          thumbGradient: 'from-[#0a1a0a] to-[#153015]',
          strokeColor: '#22c55e'
        }
      ]
    },
    en: {
      tag: '// portfolio',
      title: 'Case Studies & Work',
      sub: 'Real projects, measurable results. Every project tells the story of a problem solved with engineering intelligence.',
      viewDetails: 'View Details',
      projects: [
        {
          id: 1,
          category: 'SaaS Platform',
          title: 'Smart Business Management ERP',
          desc: 'An integrated cloud system for managing sales, inventory, and customers, handling thousands of real-time transactions.',
          metrics: [
            { val: '40%', lbl: 'Efficiency Gain' },
            { val: '3x', lbl: 'Process Speed' },
            { val: '500+', lbl: 'Active Users' }
          ],
          stack: ['React', 'Laravel', 'MySQL', 'Redis'],
          thumbGradient: 'from-[#0a1628] to-[#1a2a4a]',
          strokeColor: '#3b82f6'
        },
        {
          id: 2,
          category: 'Mobile App',
          title: 'Local Delivery & Services App',
          desc: 'Mobile app connecting service providers with customers, featuring live tracking and integrated payment systems.',
          metrics: [
            { val: '10K+', lbl: 'Downloads' },
            { val: '4.8★', lbl: 'Store Rating' },
            { val: '60%', lbl: 'Monthly Growth' }
          ],
          stack: ['Flutter', 'Node.js', 'PostgreSQL'],
          thumbGradient: 'from-[#1a0a0a] to-[#3a1515]',
          strokeColor: '#ef4444'
        },
        {
          id: 3,
          category: 'Web & Networks System',
          title: 'ISP Network Management Platform',
          desc: 'A custom system to control internet services, connecting to MikroTik and Ubiquiti devices for load balancing and subscriber management.',
          metrics: [
            { val: '99.9%', lbl: 'Uptime' },
            { val: '0', lbl: 'Downtime' },
            { val: '5K+', lbl: 'Subscribers' }
          ],
          stack: ['Vue.js', 'Laravel', 'MikroTik API'],
          thumbGradient: 'from-[#0a1a0a] to-[#153015]',
          strokeColor: '#22c55e'
        }
      ]
    }
  };

  const current = content[lang];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <section id="portfolio" className="py-24 w-full bg-gray-100 dark:bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* عنوان القسم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center mb-16"
        >
          <div className="inline-block font-mono text-xs text-blue-500 tracking-widest uppercase mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
            {current.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{current.title}</h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {current.sub}
          </p>
        </motion.div>

        {/* شبكة المشاريع */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {current.projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white dark:bg-[#0d1428] border border-blue-200 dark:border-[#3b82f6]/15 rounded-2xl overflow-hidden group hover:border-blue-400 dark:hover:border-[#3b82f6]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              {/* صورة تشويقية مجردة للمشروع */}
              <div className={`h-48 w-full bg-gradient-to-br ${project.thumbGradient} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1428]/80 z-10"></div>
                <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-50 relative z-0 group-hover:scale-110 transition-transform duration-700">
                  <rect x="10" y="10" width="100" height="60" rx="8" fill="none" stroke={project.strokeColor} strokeWidth="2" opacity="0.6"/>
                  <circle cx="60" cy="40" r="15" fill="none" stroke={project.strokeColor} strokeWidth="1.5" opacity="0.8"/>
                  <line x1="10" y1="40" x2="45" y2="40" stroke={project.strokeColor} strokeWidth="1" opacity="0.5"/>
                  <line x1="75" y1="40" x2="110" y2="40" stroke={project.strokeColor} strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>

              {/* محتوى البطاقة */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="font-mono text-xs text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">
                    {project.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>

                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {project.desc}
                </p>

                {/* مقاييس النجاح */}
                <div className="flex gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl mb-6">
                  {project.metrics.map((metric, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="font-mono text-lg font-bold text-blue-500 dark:text-blue-400 mb-1">{metric.val}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider">{metric.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* المكدس التقني */}
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech, i) => (
                    <span key={i} className="text-xs text-gray-600 dark:text-slate-300 bg-blue-50 dark:bg-[#1a2540] px-2 py-1 rounded-md border border-blue-200 dark:border-[#3b82f6]/10">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* زر التفاصيل */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                  <span className="text-sm font-semibold text-blue-500 dark:text-blue-400 group-hover:underline">
                    {current.viewDetails} {lang === 'ar' ? '←' : '→'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Portfolio;
