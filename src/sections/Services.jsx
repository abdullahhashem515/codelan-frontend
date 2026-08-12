import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { apiGetServices } from '../services/api';
import TiltCard from '../components/TiltCard';
import DynamicIcon from '../components/DynamicIcon';
import { fadeUp, staggerContainer } from '../utils/motion';

const LABELS = {
  ar: { title: 'الحلول والخدمات المتقدمة', sub: 'نقدم حلولاً برمجية متكاملة تلبي احتياجات أعمالك الرقمية بدقة واحترافية.' },
  en: { title: 'Advanced Solutions & Services', sub: 'We deliver complete software solutions tailored to your digital business needs with precision and professionalism.' },
};

const FALLBACK = [
  { icon: '⚡', color: 'bg-blue-500/15 text-blue-400',   accent: '#3b82f6', title: 'تطوير تطبيقات الويب',       titleEn: 'Web Application Development',    desc: 'نبني تطبيقات ويب سريعة وموثوقة باستخدام أحدث التقنيات، مع التركيز على تجربة مستخدم استثنائية.', descEn: 'We build fast and reliable web apps using the latest technologies.',  tags: ['React', 'Next.js', 'Vue', 'TypeScript'] },
  { icon: '🔧', color: 'bg-red-500/15 text-red-400',     accent: '#ef4444', title: 'تطوير الواجهة الخلفية',      titleEn: 'Backend Development',            desc: 'نصمم APIs قوية وقابلة للتوسع مع قواعد بيانات محسّنة وأنظمة موثوقة وآمنة.',                   descEn: 'We design powerful scalable APIs with optimized databases.',          tags: ['Laravel', 'ASP.NET Core', 'Node.js', 'MySQL'] },
  { icon: '☁️', color: 'bg-green-500/15 text-green-400', accent: '#22c55e', title: 'حلول SaaS والبنية التحتية', titleEn: 'SaaS Solutions & Infrastructure', desc: 'نطور منصات SaaS متكاملة وننشئ بنى تحتية سحابية مرنة وقابلة للتوسع.',                          descEn: 'We develop complete SaaS platforms and flexible cloud infrastructure.', tags: ['Docker', 'AWS', 'Citrix', 'Linux'] },
  { icon: '📱', color: 'bg-purple-500/15 text-purple-400', accent: '#a855f7', title: 'تطوير التطبيقات المتنقلة', titleEn: 'Mobile App Development',          desc: 'نصمم تطبيقات موبايل متعددة المنصات بتجارب مستخدم سلسة وأداء عالي.',                             descEn: 'We design cross-platform mobile apps with seamless UX.',              tags: ['Flutter', 'React Native', 'Dart'] },
  { icon: '🛡️', color: 'bg-blue-500/15 text-blue-400',   accent: '#3b82f6', title: 'الشبكات والربط البرمجي',     titleEn: 'Networks & System Integration',  desc: 'ندير ونصمم حلول شبكية آمنة ونقوم بدمج الأنظمة البرمجية مع البنية التحتية.',                    descEn: 'We manage and design secure network solutions.',                      tags: ['MikroTik', 'Cisco', 'Starlink', 'Ubiquiti'] },
  { icon: '🎨', color: 'bg-red-500/15 text-red-400',     accent: '#ef4444', title: 'تصميم UI/UX',                titleEn: 'UI/UX Design',                   desc: 'نصمم واجهات مستخدم جذابة وتجارب رقمية استثنائية تعزز مشاركة المستخدم.',                          descEn: 'We design attractive interfaces and exceptional digital experiences.', tags: ['Figma', 'Prototyping', 'Design Systems'] },
];

const SERVICE_COLORS = [
  'bg-blue-500/15 text-blue-400',
  'bg-red-500/15 text-red-400',
  'bg-green-500/15 text-green-400',
  'bg-purple-500/15 text-purple-400',
  'bg-orange-500/15 text-orange-400',
  'bg-cyan-500/15 text-cyan-400',
];

// ألوان خام (hex) موازية لـ SERVICE_COLORS — تُستخدم في أماكن يتعذّر فيها
// استخدام كلاس Tailwind ثابت (توهج متحرك، تدرّج hover) لأن اللون يتغيّر
// ديناميكياً حسب كل خدمة.
const SERVICE_ACCENTS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#06b6d4'];

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags) return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

const fromApi = (s, idx) => ({
  icon:    s.icon           ?? '⚡',
  color:   SERVICE_COLORS[idx % SERVICE_COLORS.length],
  accent:  SERVICE_ACCENTS[idx % SERVICE_ACCENTS.length],
  title:   s.title          ?? '',
  titleEn: s.title_en       ?? '',
  desc:    s.description    ?? '',
  descEn:  s.description_en ?? '',
  tags:    parseTags(s.tags),
});

const Services = () => {
  const { lang } = useLang();
  const [items, setItems] = useState(FALLBACK);
  const sectionRef = useRef(null);

  // انتقال مرتبط بالتمرير (وليس فقط "دخل للشاشة فتلاشى مرة واحدة") — القسم
  // كامل يرتفع/يكبر تدريجياً وهو يدخل من أسفل الشاشة، بحيث تتزامن حركته مع
  // خروج الهيرو (نفس المنطق المطبّق هناك) فيبدو الانتقال بينهما متصلاً.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.3'] });
  const enterY = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const enterScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const seamGlowOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7], [1, 1, 0]);

  useEffect(() => {
    apiGetServices()
      .then(res => {
        const active = (res.data ?? []).filter(s => s.is_active !== false && s.is_active !== 0);
        if (active.length > 0) setItems(active.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];

  return (
    <section id="services" ref={sectionRef} className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      {/* توهج عند الحافة العلوية يقوى مباشرة عند دخول القسم من الأسفل، ثم
          يخفت بعد استقراره — يطابق التوهج المماثل عند حافة الهيرو السفلى
          (نفس اللون/الحجم)، فيبدو الاثنان معاً كضوء واحد ينتقل بين القسمين. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: seamGlowOpacity }}
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
      />

      {/* غلاف الدخول — العنوان وشبكة البطاقات يرتفعان/يكبران معاً كوحدة
          واحدة بارتباط مباشر بتقدّم التمرير (enterY/enterScale)، بينما كل
          بطاقة تحتفظ بتتابعها الخاص (stagger) داخل هذا الغلاف. */}
      <motion.div style={{ y: enterY, scale: enterScale }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{lbl.title}</h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto mb-16 leading-relaxed">{lbl.sub}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="flex flex-wrap justify-center gap-6"
      >
        {items.map((srv, idx) => (
          <TiltCard
            key={idx}
            variants={fadeUp}
            className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white dark:bg-[#111827] border border-gray-200 dark:border-brand-gray/15 rounded-2xl p-8 relative overflow-hidden group hover:border-gray-400 dark:hover:border-brand-gray/40 transition-[transform,border-color] duration-300 hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-none dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-default"
          >
            {/* شريط علوي بلون الخدمة — "توقيع" بصري لكل بطاقة، خافت افتراضياً
                ويتوهج عند hover */}
            <span
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-1 opacity-40 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: srv.accent }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${srv.accent}14, transparent 60%)` }}
            />

            <div className="relative w-14 h-14 mb-6">
              {/* توهج نابض خفيف خلف الأيقونة بلون الخدمة نفسه — استمرار
                  لنفس لغة الحركة المستخدمة في بطاقات الإحصائيات بالهيرو */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.25 }}
                className="absolute inset-0 rounded-xl blur-lg"
                style={{ background: srv.accent }}
              />
              <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${srv.color}`}>
                <DynamicIcon emoji={srv.icon} size={26} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-3 relative z-10 text-gray-900 dark:text-white">
              {lang === 'ar' ? srv.title : (srv.titleEn || srv.title)}
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
              {lang === 'ar' ? srv.desc : (srv.descEn || srv.desc)}
            </p>
            {srv.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 relative z-10">
                {srv.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10 group-hover:border-blue-400 dark:group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-[border-color,color] duration-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </TiltCard>
        ))}
      </motion.div>
      </motion.div>
    </section>
  );
};

export default Services;
