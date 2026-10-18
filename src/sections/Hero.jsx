import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { apiGetAchievements } from '../services/api';
import { BOOT } from '../utils/boot';
import Counter from '../components/Counter';
import Text3DFlip from '../components/Text3DFlip';
import HeroNetwork from '../components/HeroNetwork';
import { SOCIAL_ICONS } from '../utils/socialIcons';
import { EASE_EXPO, staggerContainer } from '../utils/motion';

const LABELS = {
  ar: {
    headlinePre: 'نصنع ',
    headlineHighlight: 'تجارب رقمية استثنائية',
    headlinePost: '',
    sub: 'هندسة برمجية دقيقة — من واجهة المستخدم حتى الخادم السحابي.',
    btnPrimary: 'حدّثنا عن فكرتك',
    btnSecondary: 'تصفّح أعمالنا',
    waLine: 'أو راسلنا مباشرة على واتساب',
    scroll: 'تصفّح',
  },
  en: {
    headlinePre: 'We create ',
    headlineHighlight: 'exceptional digital experiences',
    headlinePost: '',
    sub: 'Precise software engineering — from the user interface to the cloud server.',
    btnPrimary: 'Tell us your idea',
    btnSecondary: 'See our work',
    waLine: 'or message us on WhatsApp',
    scroll: 'Scroll',
  },
};

// The hero is dark in both themes on purpose. Every other section is white or
// near-white, so a dark opening gives the page the contrast it was missing and
// makes the first light section land as a deliberate release rather than more
// of the same. It also lets the brand glows actually register — on the old
// white background they were invisible.
const HERO_BG = '#050810';
// Mirrors theme.brand['blue-light'] — see tailwind.config.js for why the brand
// blue itself cannot be used here. Kept as a constant too because the orbit
// dots set it through an inline style.
const HIGHLIGHT = '#1a7fff';

// Stat columns by how many figures there are (Tailwind needs literal classes).
const STAT_COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };

// زر مغناطيسي: ينجذب بلطف نحو مؤشر الماوس. اللمعة المتحركة التي كانت فيه حلّ
// محلها شعاع الإطار (انظر الزر الرئيسي أدناه).
const MagneticButton = ({ children, href, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.a>
  );
};

const Hero = () => {
  const { lang } = useLang();
  const settings = useSettings();
  // The figures embedded at build time (utils/boot) are shown from the first
  // paint; the live list replaces them when it arrives.
  const [apiAchievements, setApiAchievements] = useState(() => (Array.isArray(BOOT.achievements) ? BOOT.achievements.slice(0, 4) : []));
  const sectionRef = useRef(null);

  // انتقال مرتبط بالتمرير — المحتوى يتلاشى ويصغر ويرتفع تدريجياً وهو يغادر
  // أعلى الشاشة، فيتزامن اختفاؤه مع ظهور القسم التالي.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const exitOpacity = useTransform(scrollYProgress, [0.55, 1], [1, 0]);
  const exitScale = useTransform(scrollYProgress, [0.55, 1], [1, 0.92]);
  const exitY = useTransform(scrollYProgress, [0.55, 1], [0, -80]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // الانتقال الأساسي قطعٌ فوري بلا تمرير (useHeroSlide في Home). هذا التثبيت
  // والستارة احتياطٌ لمن يسحب شريط التمرير بالفأرة — وهو ما لا يُنتج حدث عجلة
  // يلتقطه القطع — فيرى القسم التالي ينزلق فوق الهيرو بدل أن يتمرّر الاثنان معاً.
  //
  // شرطان يجب ألا ينكسرا:
  //  • لا overflow-x:hidden على أي سلف — يجعله حاوية تمرير فتموت sticky. غُيّر
  //    إلى clip في index.css و App.jsx.
  //  • لا transform على هذا العنصر — يُزيح موضع التثبيت. ولهذا لا يوجد parallax
  //    هنا: التثبيت نفسه هو الأثر.
  const veil = useTransform(scrollYProgress, [0.25, 1], [0, 0.6]);

  // احترام تفضيل تقليل الحركة: التحويلات تُلغى ويبقى التلاشي فقط.
  const reduceMotion = useReducedMotion();

  // موضع التثبيت. sticky top:0 على عنصر أطول من الشاشة يُبقيه ملتصقاً من
  // أعلاه، فينزلق القسم التالي فوق نصفه السفلي ولا يُرى أبداً — وهذا ما أخفى
  // الإحصائيات على الجوال. حين يكون الهيرو أطول من الشاشة يُثبَّت من أسفله
  // (top سالب بمقدار الفرق)، فيُقرأ كاملاً ثم يُغطّى.
  const [stickTop, setStickTop] = useState(0);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const measure = () => setStickTop(Math.min(0, window.innerHeight - el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    apiGetAchievements()
      .then(res => {
        // الأرقام الحقيقية فقط، بترتيب لوحة التحكم. لا بدائل مخترعة — إن لم
        // توجد إنجازات لا يظهر الشريط أصلاً.
        const next = (res.data ?? []).slice(0, 4);
        // Same figures as the embedded copy → keep the state as is, no re-render.
        setApiAchievements(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      })
      .catch(() => {});
  }, []);

  const current = LABELS[lang];
  const ar = lang === 'ar';
  const Forward = ar ? ArrowLeft : ArrowRight;
  const WaIcon = SOCIAL_ICONS.whatsapp;
  const waDigits = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const waHref = waDigits ? `https://wa.me/${waDigits}` : null;

  const sub = ar
    ? (settings.taglineAr || current.sub)
    : (settings.taglineEn || current.sub);

  const stats = apiAchievements.map(a => ({
    num:    String(a.value ?? ''),
    suffix: a.unit ?? '',
    label:  ar ? (a.title ?? '') : (a.title_en ?? a.title ?? ''),
  }));

  return (
    <section
      id="home"
      data-header="dark"
      ref={sectionRef}
      dir={ar ? 'rtl' : 'ltr'}
      className={`${reduceMotion ? 'relative' : 'sticky'} z-0 min-h-svh flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-10 sm:py-20 [@media(min-height:800px)]:py-28`}
      style={{ backgroundColor: HERO_BG, top: stickTop }}
    >
      {/* ستارة تُعتِم الهيرو وهو ينحسر، فلا يبقى لامعاً خلف القسم القادم */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-30 pointer-events-none bg-black"
        style={{ opacity: veil }}
      />
      {/* ── الخلفية ─────────────────────────────────────────────────────── */}

      {/* كوكبة شبكة: عُقد وروابط وحزم بيانات تسري، تميل مع المؤشر. تحلّ محل
          شبكة المربعات الثابتة والتوهّجين الضبابيين — نفس مقدار الحركة، لكنها
          تقول "برمجيات وشبكات" بلغة رسوم الخدمات والمنهجية. */}
      <HeroNetwork />

      {/* ضوء كشّاف واسع خلف العنوان — المصدر البصري الرئيسي للقسم */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[70%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(26,127,255,0.18), transparent 70%)' }}
      />

      {/* لمسة أحمر العلامة — ثابتة. التوهّجان السابقان كانا ضبابية 130px تتحرك
          باستمرار، وهي أثقل ما كان يُرسم على الجوال. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 35% 30% at 85% 88%, rgba(220,27,28,0.10), transparent 70%)' }}
      />

      {/* ── المحتوى ─────────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: exitOpacity, scale: exitScale, y: exitY }}
        className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.3] tracking-tight text-white px-2 pt-2 mb-7 [@media(min-height:800px)]:mb-9">
          <Text3DFlip
            delay={0.1}
            staggerDuration={0.07}
            rotateDirection="top"
            parts={[
              { text: current.headlinePre },
              { text: current.headlineHighlight, className: 'text-brand-blue-light', style: { color: HIGHLIGHT } },
              { text: current.headlinePost },
            ]}
          />
        </h1>

        {/* Slides in without fading from zero: this paragraph is the page's
            largest text block, and a browser does not count an element as
            painted while its opacity is 0 — the fade alone delayed the page's
            "largest content" moment by more than a second on a phone. */}
        <motion.p
          initial={{ opacity: 0.4, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_EXPO }}
          className="text-lg md:text-xl text-slate-300/90 max-w-[38rem] leading-relaxed mb-10 [@media(min-height:800px)]:mb-12"
        >
          {sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE_EXPO }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          {/* الزر الرئيسي: شعاع بلون الشعار (أزرق ← أحمر) يدور حول إطاره، كحزمة
              بيانات على حلقة — نفس الحزم التي تسري في شبكة الخلفية. الإطار
              هو الحلقة: غلاف بحشوة 1.5px، يدور خلفه تدرّج مخروطي، ويغطي الداخل
              لونٌ معتم فلا يظهر من الدوران إلا حافته. */}
          <div className="relative">
            <span aria-hidden="true" className="absolute -inset-3 rounded-full bg-[#1a7fff]/20 blur-2xl -z-10" />
            <MagneticButton
              href="#contact"
              className="group relative isolate inline-flex rounded-full p-[1.5px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fff] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050810]"
            >
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/15" />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[beam-spin_3.2s_linear_infinite] motion-reduce:animate-none"
                style={{ background: 'conic-gradient(from 0deg, transparent 0 60%, rgba(26,127,255,0.9) 76%, #DC1B1C 90%, transparent 100%)' }}
              />
              <span className="relative inline-flex items-center gap-3 rounded-full bg-[#0b1220] group-hover:bg-[#0f1a30] transition-colors duration-300 ps-7 pe-2 py-2 text-white font-semibold text-base">
                {current.btnPrimary}
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1a7fff] to-[#0158B0] shadow-[0_6px_18px_rgba(26,127,255,0.45)] transition-transform duration-300 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  <Forward size={18} aria-hidden="true" />
                </span>
              </span>
            </MagneticButton>
          </div>

          {/* الثانوي رابط نصي هادئ لا زر ثانٍ: زرّان متساويا الوزن يتنافسان على
              العين، والرئيسي يجب أن يكون واضحاً. خط سفلي يُرسم عند المرور. */}
          <a
            href="#portfolio"
            className="group inline-flex items-center gap-2 px-2 py-3 text-slate-300 hover:text-white font-medium text-base transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md"
          >
            <span className="relative">
              {current.btnSecondary}
              <span aria-hidden="true" className="absolute -bottom-1 inset-x-0 h-px bg-white/25" />
              <span aria-hidden="true" className="absolute -bottom-1 inset-x-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ltr:origin-left rtl:origin-right" />
            </span>
            <ArrowDown size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </motion.div>

        {/* أقصر طريق لمن لا يريد نموذجاً: واتساب، من أول شاشة. */}
        {waHref && (
          <motion.a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors"
          >
            <WaIcon size={15} aria-hidden="true" className="text-green-500" />
            {current.waLine}
          </motion.a>
        )}

        {/* الأرقام الحقيقية — تختفي كلياً إن لم توجد */}
        {stats.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.12, 0.9)}
            // الأعمدة على عدد الأرقام: كانت شبكة بعمودين دائماً، فثلاثة أرقام
            // تترك الثالث وحده في صف ثانٍ أبعد عن الشاشة على الجوال.
            className={`w-full max-w-3xl mx-auto grid ${STAT_COLS[stats.length] ?? 'grid-cols-2 md:grid-cols-4'} gap-y-6 gap-x-3 mt-8 pt-6 sm:mt-12 sm:pt-8 [@media(min-height:800px)]:mt-20 [@media(min-height:800px)]:pt-10 border-t border-white/10`}
          >
            {stats.map((stat, idx) => {
              const numValue = parseFloat(stat.num);
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EXPO } },
                  }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-mono">
                    {Number.isNaN(numValue) ? stat.num : <Counter to={numValue} />}
                    <span style={{ color: HIGHLIGHT }}>{stat.suffix}</span>
                  </div>
                  <div className="text-xs md:text-sm text-slate-400 mt-1.5 sm:mt-2 leading-snug">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* مؤشر التمرير — يختفي فور أن يبدأ الزائر بالنزول */}
      <motion.a
        href="#services"
        aria-label={current.scroll}
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-8 inset-x-0 mx-auto w-fit hidden sm:flex flex-col items-center gap-1.5 text-white/55 hover:text-white/85 transition-colors no-underline z-20"
      >
        <span className="text-[11px] rtl:text-xs ltr:tracking-[0.2em] uppercase font-mono">{current.scroll}</span>
        {/* CSS, not a framer-motion loop: a JS animation that never ends kept the
            main thread working on every frame for as long as the hero was open. */}
        <span className="inline-block animate-[hint-bob_1.8s_ease-in-out_infinite] motion-reduce:animate-none">
          <ArrowDown size={16} aria-hidden="true" />
        </span>
      </motion.a>
    </section>
  );
};

export default Hero;
