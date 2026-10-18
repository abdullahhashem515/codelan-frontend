import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { apiGetServices, apiGetProjects } from '../services/api';
import { WORK_KINDS, kindOf } from '../utils/workKinds';
import { requestPortfolioTab } from '../utils/portfolioTab';
import TiltCard from '../components/TiltCard';
import { fadeUp, staggerContainer } from '../utils/motion';
import ServiceArt from '../components/illustrations/ServiceArt';
import { artKindFor, WORK_TABS_FOR_KIND } from '../components/illustrations/serviceKinds';

const LABELS = {
  ar: { title: 'خدماتنا', sub: 'نبني البرمجيات ونؤسّس الشبكات التي تعمل عليها — تحت سقف واحد.', seeWork: 'شاهد أعمالنا' },
  en: { title: 'What We Do', sub: 'We build the software and lay the networks it runs on — under one roof.', seeWork: 'See our work' },
};

const FALLBACK = [
  { icon: '⚡', title: 'تطوير تطبيقات الويب',       titleEn: 'Web Application Development',    desc: 'نبني تطبيقات ويب سريعة وموثوقة باستخدام أحدث التقنيات، مع التركيز على تجربة مستخدم استثنائية.', descEn: 'We build fast and reliable web apps using the latest technologies.',  tags: ['React', 'Next.js', 'Vue', 'TypeScript'] },
  { icon: '🔧', title: 'تطوير الواجهة الخلفية',      titleEn: 'Backend Development',            desc: 'نصمم APIs قوية وقابلة للتوسع مع قواعد بيانات محسّنة وأنظمة موثوقة وآمنة.',                   descEn: 'We design powerful scalable APIs with optimized databases.',          tags: ['Laravel', 'ASP.NET Core', 'Node.js', 'MySQL'] },
  { icon: '☁️', title: 'حلول SaaS والبنية التحتية', titleEn: 'SaaS Solutions & Infrastructure', desc: 'نطور منصات SaaS متكاملة وننشئ بنى تحتية سحابية مرنة وقابلة للتوسع.',                          descEn: 'We develop complete SaaS platforms and flexible cloud infrastructure.', tags: ['Docker', 'AWS', 'Citrix', 'Linux'] },
  { icon: '📱', title: 'تطوير التطبيقات المتنقلة', titleEn: 'Mobile App Development',          desc: 'نصمم تطبيقات موبايل متعددة المنصات بتجارب مستخدم سلسة وأداء عالي.',                             descEn: 'We design cross-platform mobile apps with seamless UX.',              tags: ['Flutter', 'React Native', 'Dart'] },
  { icon: '🛡️', title: 'الشبكات والربط البرمجي',     titleEn: 'Networks & System Integration',  desc: 'ندير ونصمم حلول شبكية آمنة ونقوم بدمج الأنظمة البرمجية مع البنية التحتية.',                    descEn: 'We manage and design secure network solutions.',                      tags: ['MikroTik', 'Cisco', 'Starlink', 'Ubiquiti'] },
  { icon: '🎨', title: 'تصميم UI/UX',                titleEn: 'UI/UX Design',                   desc: 'نصمم واجهات مستخدم جذابة وتجارب رقمية استثنائية تعزز مشاركة المستخدم.',                          descEn: 'We design attractive interfaces and exceptional digital experiences.', tags: ['Figma', 'Prototyping', 'Design Systems'] },
];


// Match the projects grid: show a few tags, count the rest, keep card heights
// even regardless of how many technologies a service lists.
const TAGS_ON_CARD = 4;

// The seven services are really two business lines — building software, and
// laying the networks it runs on — but they arrive in one mixed list, so
// "UI/UX design" sits between "cybersecurity" and "network infrastructure".
// Grouping makes the shape of the company legible.
//
// Degrades on purpose: until the backend stores a category, every service
// comes back uncategorised and the whole set renders as one group exactly as
// it does today. Nothing waits on the column; it just gets better when it
// lands.
const GROUP_LABELS = {
  software:       { ar: 'برمجة وتطوير',      en: 'Software' },
  infrastructure: { ar: 'شبكات وبنية تحتية', en: 'Networks & Infrastructure' },
  creative:       { ar: 'تصميم ومحتوى رقمي', en: 'Design & Digital Content' },
};

// The backend accepts only software / infrastructure as a category, so the
// creative services (social media, posters & motion) are recognised by title —
// the same matcher that picks their drawing — whatever category was saved.
// A stored 'creative' is honoured too, for when the backend accepts it.
const CREATIVE_KINDS = new Set(['social', 'motion']);
const groupOf = (s) => (s.category === 'creative' || CREATIVE_KINDS.has(artKindFor(s)) ? 'creative' : s.category);

const groupServices = (items) => {
  const known = items.filter(s => GROUP_LABELS[groupOf(s)]);
  if (known.length < 2) return [{ key: null, items }];

  const order = Object.keys(GROUP_LABELS);
  const groups = order
    .map(key => ({ key, items: items.filter(s => groupOf(s) === key) }))
    .filter(g => g.items.length > 0);

  const ungrouped = items.filter(s => !GROUP_LABELS[groupOf(s)]);
  // Uncategorised services lead, without a heading: while the core services
  // have no category saved, they stay first and the creative group follows,
  // instead of two new services opening the section.
  if (ungrouped.length) groups.unshift({ key: null, items: ungrouped });
  return groups;
};

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags) return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

const fromApi = (s) => ({
  id:      s.id,
  icon:    s.icon           ?? '⚡',
  title:   s.title          ?? '',
  titleEn: s.title_en       ?? '',
  desc:    s.description    ?? '',
  descEn:  s.description_en ?? '',
  tags:    parseTags(s.tags),
  category: s.category ?? '',
});

const Services = () => {
  const { lang } = useLang();
  const [items, setItems] = useState(FALLBACK);
  // Portfolio tabs that have published work — a card links to its examples
  // only when there are some to see.
  const [workTabs, setWorkTabs] = useState(() => new Set());
  const sectionRef = useRef(null);

  // انتقال مرتبط بالتمرير (وليس فقط "دخل للشاشة فتلاشى مرة واحدة") — القسم
  // كامل يرتفع/يكبر تدريجياً وهو يدخل من أسفل الشاشة، بحيث تتزامن حركته مع
  // خروج الهيرو (نفس المنطق المطبّق هناك) فيبدو الانتقال بينهما متصلاً.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.3'] });
  const enterY = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const enterScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  useEffect(() => {
    apiGetServices()
      .then(res => {
        const active = (res.data ?? []).filter(s => s.is_active !== false && s.is_active !== 0);
        if (active.length > 0) setItems(active.map(fromApi));
      })
      .catch(() => {});
    apiGetProjects()
      .then(res => setWorkTabs(new Set((res.data ?? [])
        .filter(p => !p.status || p.status === 'active')
        .map(p => WORK_KINDS[kindOf(p.project_type ?? p.type)].tab))))
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const workTabFor = (srv) => (WORK_TABS_FOR_KIND[artKindFor(srv)] ?? []).find(t => workTabs.has(t));
  const ar = lang === 'ar';
  const groups = groupServices(items);

  return (
    <section id="services" ref={sectionRef} className="py-24 px-6 relative z-10 bg-white dark:bg-[#050810]">
      <div className="max-w-7xl mx-auto">
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

      {groups.map((group, gi) => (
        <div key={group.key ?? `g${gi}`} className={gi > 0 ? 'mt-16' : ''}>
          {group.key && (
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              className="flex items-center gap-4 mb-8 text-sm font-mono uppercase ltr:tracking-[0.18em] text-gray-500 dark:text-slate-400"
            >
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              {ar ? GROUP_LABELS[group.key].ar : GROUP_LABELS[group.key].en}
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </motion.h3>
          )}
        <motion.div
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-6"
        >
          {group.items.map((srv, idx) => (
            <TiltCard
              key={srv.id ?? idx}
              // Anchor for the footer's service links, which now land on the
              // card itself instead of all six pointing at the section heading.
              id={srv.id ? `service-${srv.id}` : undefined}
              variants={fadeUp}
              // Three per row on desktop, two on tablets, one on phones. Widths are
              // computed against the 1.5rem gap so rows fill exactly; flex-wrap with
              // justify-center keeps a short last row centred instead of stranded
              // at one edge (7 services = 3 + 3 + 1).
              className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] flex flex-col bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden group hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-[transform,border-color] duration-300 hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_60px_rgba(1,88,176,0.18)] dark:shadow-none dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-default"
            >
              {/* One colour for every card. The cards used to rotate through blue,
                  red and grey, which read as three categories that did not exist;
                  the drawing now carries each card's identity instead. */}
              <span
                aria-hidden="true"
                className="absolute top-0 inset-x-0 h-1 z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, #0158B0, #1a7fff)' }}
              />

              <ServiceArt service={srv} />

              <div className="relative flex flex-col flex-1 p-6 md:p-7">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lang === 'ar' ? srv.title : (srv.titleEn || srv.title)}
                </h3>
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  {lang === 'ar' ? srv.desc : (srv.descEn || srv.desc)}
                </p>
                {srv.tags.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2">
                    {srv.tags.slice(0, TAGS_ON_CARD).map((tag, tIdx) => (
                      <span key={tIdx} className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10 group-hover:border-blue-400 dark:group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-[border-color,color] duration-200">
                        {tag}
                      </span>
                    ))}
                    {srv.tags.length > TAGS_ON_CARD && (
                      <span className="font-mono text-xs px-2.5 py-1 text-gray-400 dark:text-slate-500">
                        +{srv.tags.length - TAGS_ON_CARD}
                      </span>
                    )}
                  </div>
                )}
                {workTabFor(srv) && (
                  <a
                    href="#portfolio"
                    onClick={() => requestPortfolioTab(workTabFor(srv))}
                    className={`${srv.tags.length > 0 ? 'mt-5' : 'mt-auto'} self-start inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors`}
                  >
                    {lbl.seeWork}
                    <Arrow size={15} aria-hidden="true" className="transition-transform duration-200 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </a>
                )}
              </div>
            </TiltCard>
          ))}
        </motion.div>
        </div>
      ))}
      </motion.div>
      </div>
    </section>
  );
};

export default Services;
