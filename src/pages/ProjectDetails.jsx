import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Code2, Clock, Users, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';

const PROJECTS = {
  '1': {
    ar: {
      category: 'منصة SaaS',
      title: 'منصة إدارة الأعمال الذكية (Code LAN ERP)',
      description: `نظام ERP سحابي متكامل مصمم خصيصاً للشركات المتوسطة والصغيرة. يوحّد إدارة المبيعات والمخزون والموارد البشرية والمحاسبة في واجهة واحدة سلسة تعمل من أي متصفح.

النظام قادر على معالجة آلاف الحركات المالية لحظياً دون أي تأخر، مع لوحة تحكم تحليلية تعرض إحصائيات الأداء في الوقت الفعلي — مما يمنح الإدارة رؤية شاملة ودقيقة لصحة الأعمال.`,
      features: [
        'إدارة المبيعات والفواتير والعملاء',
        'نظام مخزون ذكي مع تنبيهات تلقائية',
        'تقارير مالية وإحصائيات لحظية',
        'إدارة الموارد البشرية والرواتب',
        'لوحة تحكم تحليلية متقدمة',
        'إدارة الصلاحيات متعددة المستويات',
      ],
      duration: '4 أشهر',
      team: '3 مطورين',
      backLabel: 'العودة إلى المشاريع',
      aboutLabel: 'نبذة عن المشروع',
      featuresLabel: 'المميزات الرئيسية',
      visitLabel: 'زيارة المشروع',
      durationLabel: 'مدة التنفيذ',
      teamLabel: 'فريق العمل',
      stackLabel: 'التقنيات المستخدمة',
    },
    en: {
      category: 'SaaS Platform',
      title: 'Smart Business Management ERP',
      description: `An integrated cloud ERP system designed for SMEs. It unifies sales, inventory, HR, and accounting management in one seamless interface accessible from any browser.

The system handles thousands of real-time financial transactions with zero latency, backed by an analytics dashboard that displays live performance stats — giving management a comprehensive and accurate view of business health.`,
      features: [
        'Sales, invoicing, and customer management',
        'Smart inventory with automatic alerts',
        'Financial reports and real-time analytics',
        'HR management and payroll',
        'Advanced analytics dashboard',
        'Multi-level permissions system',
      ],
      duration: '4 months',
      team: '3 developers',
      backLabel: 'Back to Portfolio',
      aboutLabel: 'About the Project',
      featuresLabel: 'Key Features',
      visitLabel: 'Visit Project',
      durationLabel: 'Duration',
      teamLabel: 'Team Size',
      stackLabel: 'Tech Stack',
    },
    thumbGradient: 'from-[#0a1628] via-[#1e3a6e] to-[#0a1628]',
    strokeColor: '#3b82f6',
    stack: ['React', 'Laravel', 'MySQL', 'Redis', 'Docker', 'AWS'],
    metrics: [
      { val: '40%', lbl: { ar: 'تحسن الكفاءة', en: 'Efficiency Gain' } },
      { val: '3x',  lbl: { ar: 'سرعة المعالجة', en: 'Process Speed' } },
      { val: '500+', lbl: { ar: 'مستخدم نشط', en: 'Active Users' } },
    ],
    liveUrl: '#',
  },
  '2': {
    ar: {
      category: 'تطبيق موبايل',
      title: 'تطبيق خدمات وتوصيل محلي',
      description: `تطبيق موبايل متعدد المنصات يربط مزودي الخدمات المحليين بالعملاء في الوقت الفعلي. يتميز بنظام تتبع حي عبر الخرائط وأنظمة دفع إلكتروني متكاملة تدعم بطاقات الائتمان والمحافظ الرقمية.

يستخدم التطبيق خوارزميات ذكية لمطابقة العملاء مع أقرب مزودي الخدمة وتحسين مسارات التوصيل لتقليل وقت الانتظار إلى أدنى مستوى ممكن.`,
      features: [
        'تتبع حي لموقع مزود الخدمة',
        'نظام دفع إلكتروني متكامل',
        'تقييم ومراجعة الخدمات',
        'إشعارات فورية للتحديثات',
        'واجهة ثنائية اللغة (AR/EN)',
        'لوحة تحكم مخصصة للمزودين',
      ],
      duration: '3 أشهر',
      team: '2 مطورين',
      backLabel: 'العودة إلى المشاريع',
      aboutLabel: 'نبذة عن المشروع',
      featuresLabel: 'المميزات الرئيسية',
      visitLabel: 'زيارة المشروع',
      durationLabel: 'مدة التنفيذ',
      teamLabel: 'فريق العمل',
      stackLabel: 'التقنيات المستخدمة',
    },
    en: {
      category: 'Mobile App',
      title: 'Local Delivery & Services App',
      description: `A cross-platform mobile app connecting local service providers with customers in real time. Features live map tracking and integrated payment systems supporting credit cards and digital wallets.

The app uses smart algorithms to match customers with the nearest providers and optimize delivery routes, reducing wait times to the minimum possible.`,
      features: [
        'Live tracking of service provider location',
        'Integrated electronic payment system',
        'Service rating and review system',
        'Real-time push notifications',
        'Bilingual interface (AR/EN)',
        'Dedicated provider control dashboard',
      ],
      duration: '3 months',
      team: '2 developers',
      backLabel: 'Back to Portfolio',
      aboutLabel: 'About the Project',
      featuresLabel: 'Key Features',
      visitLabel: 'Visit Project',
      durationLabel: 'Duration',
      teamLabel: 'Team Size',
      stackLabel: 'Tech Stack',
    },
    thumbGradient: 'from-[#1a0a0a] via-[#3d1515] to-[#1a0a0a]',
    strokeColor: '#ef4444',
    stack: ['Flutter', 'Dart', 'Node.js', 'PostgreSQL', 'Firebase'],
    metrics: [
      { val: '10K+', lbl: { ar: 'تحميل', en: 'Downloads' } },
      { val: '4.8★', lbl: { ar: 'تقييم المتجر', en: 'Store Rating' } },
      { val: '60%',  lbl: { ar: 'نمو شهري', en: 'Monthly Growth' } },
    ],
    liveUrl: '#',
  },
  '3': {
    ar: {
      category: 'نظام ويب وشبكات',
      title: 'منصة إدارة شبكات مزودي الخدمة (ISP)',
      description: `نظام ويب متخصص لإدارة شبكات مزودي خدمة الإنترنت، مع تكامل مباشر مع أجهزة MikroTik و Ubiquiti عبر API مخصصة تتيح التحكم الكامل في الشبكة من مكان واحد.

يتيح النظام إدارة المشتركين، توزيع الأحمال آلياً، ومراقبة حركة الشبكة لحظياً، مع نظام إنذار تلقائي يكتشف أي خلل تقني أو هجوم شبكي فور وقوعه.`,
      features: [
        'تكامل مباشر مع MikroTik و Ubiquiti',
        'إدارة المشتركين والاشتراكات',
        'مراقبة حركة الشبكة لحظياً',
        'توزيع الأحمال الأوتوماتيكي',
        'نظام إنذار وتنبيهات فوري',
        'تقارير استهلاك تفصيلية',
      ],
      duration: '6 أشهر',
      team: '3 مطورين',
      backLabel: 'العودة إلى المشاريع',
      aboutLabel: 'نبذة عن المشروع',
      featuresLabel: 'المميزات الرئيسية',
      visitLabel: 'زيارة المشروع',
      durationLabel: 'مدة التنفيذ',
      teamLabel: 'فريق العمل',
      stackLabel: 'التقنيات المستخدمة',
    },
    en: {
      category: 'Web & Networks System',
      title: 'ISP Network Management Platform',
      description: `A specialized web system for managing ISP networks, with direct integration with MikroTik and Ubiquiti devices via a custom API that enables full network control from a single place.

The system handles subscriber management, automatic load balancing, and real-time network traffic monitoring, with an instant alert system that detects any technical fault or network attack the moment it occurs.`,
      features: [
        'Direct MikroTik & Ubiquiti integration',
        'Subscriber and subscription management',
        'Real-time network traffic monitoring',
        'Automatic load balancing',
        'Instant alert and notification system',
        'Detailed consumption reports',
      ],
      duration: '6 months',
      team: '3 developers',
      backLabel: 'Back to Portfolio',
      aboutLabel: 'About the Project',
      featuresLabel: 'Key Features',
      visitLabel: 'Visit Project',
      durationLabel: 'Duration',
      teamLabel: 'Team Size',
      stackLabel: 'Tech Stack',
    },
    thumbGradient: 'from-[#0a1a0a] via-[#153015] to-[#0a1a0a]',
    strokeColor: '#22c55e',
    stack: ['Vue.js', 'Laravel', 'MikroTik API', 'MySQL', 'WebSocket'],
    metrics: [
      { val: '99.9%', lbl: { ar: 'استقرار النظام', en: 'Uptime' } },
      { val: '0',     lbl: { ar: 'توقف مفاجئ', en: 'Downtime' } },
      { val: '5K+',   lbl: { ar: 'مشترك', en: 'Subscribers' } },
    ],
    liveUrl: '#',
  },
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { lang } = useLang();
  const ar = lang === 'ar';

  const project = PROJECTS[id];

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-4">
              {ar ? 'المشروع غير موجود' : 'Project Not Found'}
            </h1>
            <Link to="/" className="text-blue-500 hover:underline font-medium">
              {ar ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const data = project[lang];

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">

          {/* زر الرجوع */}
          <motion.div
            initial={{ opacity: 0, x: ar ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {ar ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {data.backLabel}
            </Link>
          </motion.div>

          {/* غلاف المشروع */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-64 md:h-96 rounded-3xl bg-gradient-to-br ${project.thumbGradient} relative overflow-hidden mb-12 flex items-center justify-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
            <svg
              width="220"
              height="150"
              viewBox="0 0 220 150"
              className="opacity-25 relative z-0"
            >
              <rect x="15" y="15" width="190" height="120" rx="14" fill="none" stroke={project.strokeColor} strokeWidth="2" opacity="0.9"/>
              <circle cx="110" cy="75" r="32" fill="none" stroke={project.strokeColor} strokeWidth="2" opacity="0.9"/>
              <line x1="15" y1="75" x2="78" y2="75" stroke={project.strokeColor} strokeWidth="1.5" opacity="0.7"/>
              <line x1="142" y1="75" x2="205" y2="75" stroke={project.strokeColor} strokeWidth="1.5" opacity="0.7"/>
              <circle cx="110" cy="75" r="8" fill={project.strokeColor} opacity="0.6"/>
            </svg>
            <div className="absolute bottom-6 start-6 z-10">
              <span className="font-mono text-xs bg-black/50 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                {data.category}
              </span>
            </div>
          </motion.div>

          {/* المحتوى الرئيسي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* العمود الأيسر — الوصف والمميزات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-10"
            >
              {/* العنوان */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {data.title}
              </h1>

              {/* الوصف */}
              <div>
                <h2 className="text-base font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full block flex-shrink-0"></span>
                  {data.aboutLabel}
                </h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {data.description}
                </p>
              </div>

              {/* المميزات */}
              <div>
                <h2 className="text-base font-bold text-gray-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-red-500 rounded-full block flex-shrink-0"></span>
                  {data.featuresLabel}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-gray-50 dark:bg-[#0d1428] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3"
                    >
                      <ChevronRight size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* المقاييس */}
              <div className="grid grid-cols-3 gap-4">
                {project.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-[#0d1428] border border-gray-200 dark:border-white/5 rounded-2xl p-5 text-center"
                  >
                    <div className="font-mono text-2xl font-bold text-blue-500 dark:text-blue-400 mb-1">
                      {m.val}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                      {m.lbl[lang]}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* الشريط الجانبي */}
            <motion.div
              initial={{ opacity: 0, x: ar ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-5"
            >
              {/* زر الزيارة */}
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                <ExternalLink size={17} />
                {data.visitLabel}
              </a>

              {/* معلومات المشروع */}
              <div className="bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={15} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                      {data.durationLabel}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{data.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users size={15} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                      {data.teamLabel}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{data.team}</div>
                  </div>
                </div>
              </div>

              {/* التقنيات */}
              <div className="bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 size={15} className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                    {data.stackLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech, i) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-white dark:bg-[#111827] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </>
  );
};

export default ProjectDetails;
