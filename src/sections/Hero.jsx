import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { Rocket, Eye, Code2, Cloud, ShieldCheck, Zap } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { apiGetAchievements } from '../services/api';
import Counter from '../components/Counter';
import Text3DFlip from '../components/Text3DFlip';
import { EASE_EXPO, staggerContainer } from '../utils/motion';

const LABELS = {
  ar: {
    headlinePre: 'نصنع ',
    headlineHighlight: 'تجارب رقمية استثنائية',
    headlinePost: '',
    sub: 'هندسة برمجية دقيقة، تبدأ من واجهات المستخدم التفاعلية وحتى الخوادم السحابية المتقدمة لضمان أداء لا يُضاهى.',
    btnPrimary: 'ابدأ مشروعك',
    btnSecondary: 'شاهد أعمالنا',
  },
  en: {
    headlinePre: 'We create ',
    headlineHighlight: 'exceptional digital experiences',
    headlinePost: '',
    sub: 'Precise software engineering — from interactive user interfaces to advanced cloud servers, ensuring unmatched performance.',
    btnPrimary: 'Start Your Project',
    btnSecondary: 'View Our Work',
  },
};

const FALLBACK_STATS = {
  ar: [
    { num: '20', suffix: '+', label: 'مشروع منجز' },
    { num: '15', suffix: '+', label: 'عميل راضٍ' },
    { num: '3',  suffix: '+', label: 'سنوات خبرة' },
    { num: '99', suffix: '%', label: 'معدل رضا العملاء' },
  ],
  en: [
    { num: '20', suffix: '+', label: 'Projects Delivered' },
    { num: '15', suffix: '+', label: 'Happy Clients' },
    { num: '3',  suffix: '+', label: 'Years Experience' },
    { num: '99', suffix: '%', label: 'Client Satisfaction' },
  ],
};

// مدار مصغّر حول كل رقم إحصائية — جسيمات مضيئة صغيرة (3 بألوان الهوية)
// تدور باستمرار حول الرقم كأنها مجرة/إلكترونات مصغّرة. نفس أسلوب المدار
// الآمن المستخدم خلف العنوان (x/y محسوبة مسبقاً على مسار بيضاوي، لا CSS
// rotate على عنصر مضغوط)، والتمركز عبر top/left + margin سلبي بدل translate
// حتى لا يتعارض مع x/y المتحركة على نفس العنصر.
const NUMBER_ORBIT_SAMPLES = 30;

const buildNumberOrbitPath = (startDeg, radiusX, radiusY) => {
  const x = [];
  const y = [];
  const opacity = [];
  const scale = [];
  for (let i = 0; i <= NUMBER_ORBIT_SAMPLES; i++) {
    const angle = (i / NUMBER_ORBIT_SAMPLES) * Math.PI * 2 + (startDeg * Math.PI) / 180;
    x.push(Math.cos(angle) * radiusX);
    y.push(Math.sin(angle) * radiusY);
    const front = (1 - Math.sin(angle)) / 2;
    opacity.push(0.35 + front * 0.5);
    scale.push(0.7 + front * 0.6);
  }
  return { x, y, opacity, scale };
};

const NUMBER_ORBIT_PARTICLES = [
  { startDeg: 0,   radiusX: 42, radiusY: 15, size: 5, duration: 3.4 },
  { startDeg: 150, radiusX: 34, radiusY: 12, size: 3, duration: 4.3 },
  { startDeg: 260, radiusX: 50, radiusY: 18, size: 3, duration: 5.2 },
];

const NUMBER_ORBIT_COLORS = ['#0158B0', '#E1E2E4', '#DC1B1C'];

const NumberOrbit = ({ children }) => (
  <span className="relative inline-flex items-center justify-center">
    {NUMBER_ORBIT_PARTICLES.map((p, i) => {
      const path = buildNumberOrbitPath(p.startDeg, p.radiusX, p.radiusY);
      const color = NUMBER_ORBIT_COLORS[i];
      return (
        <motion.span
          key={i}
          aria-hidden="true"
          animate={{ x: path.x, y: path.y, opacity: path.opacity, scale: path.scale }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            marginTop: -p.size / 2,
            marginLeft: -p.size / 2,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      );
    })}
    {children}
  </span>
);

// نظام المدار — أيقونات شفافة فقط (بلا نص ولا بطاقة زجاجية) تدور دوراناً
// محورياً مستمراً وناعماً (سرعة زاوية ثابتة، بلا توقف) حول مسار بيضاوي، بمنظور
// كوكبي/عالمي هادئ. الحركة عبر تحريك x/y مباشرة على نقاط مُعاينة من القطع
// الناقص (لا CSS rotate) — نفس الأسلوب الآمن المستخدم سابقاً، فلا حاجة لأي
// دوران عكسي أصلاً بما أن المحتوى أيقونة فقط بلا اتجاه نصّي يلزم تصحيحه.
const ORBIT_SAMPLES = 24;
const ORBIT_TRANSITION = { duration: 22, ease: 'linear', repeat: Infinity };

const ORBIT_RADIUS_X = 340;
// تسطيح أفقي أقوى (منظور كوكبي أوضح) + مركز المدار أسفل قليلاً من الأزرار
// (وليس مرتفعاً خلف العنوان) دون لمس شريط الإحصائيات.
const ORBIT_RADIUS_Y = 65;
const ORBIT_CENTER_Y_SHIFT = 25;

const ORBIT_ICONS = [Code2, Cloud, ShieldCheck, Zap];

// idx يحدّد زاوية بداية الأيقونة (موزّعة كل 90° على نفس المسار).
const buildOrbitPath = (idx) => {
  const startStep = idx * (ORBIT_SAMPLES / ORBIT_ICONS.length);
  const x = [];
  const y = [];
  const opacity = [];
  const scale = [];

  for (let i = 0; i <= ORBIT_SAMPLES; i++) {
    const angle = ((i + startStep) / ORBIT_SAMPLES) * Math.PI * 2;
    x.push(Math.sin(angle) * ORBIT_RADIUS_X);
    y.push(-Math.cos(angle) * ORBIT_RADIUS_Y + ORBIT_CENTER_Y_SHIFT);
    // منظور خفيف: أيقونة أوضح وأكبر قليلاً في المقدمة (أسفل)، أشفّ وأصغر
    // في الخلف (أعلى) — بلا أي تدوير، فقط تعديل حجم/شفافية متصل مع الزاوية.
    const front = (1 - Math.cos(angle)) / 2;
    opacity.push(0.2 + front * 0.35);
    scale.push(0.85 + front * 0.25);
  }

  return { icon: ORBIT_ICONS[idx], x, y, opacity, scale };
};

// زر مغناطيسي: ينجذب بلطف نحو مؤشر الماوس + شعاع ضوء متحرك مستمر (Shimmer)
const MagneticButton = ({ children, href, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
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
      <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <motion.span
          animate={{ x: ['-150%', '250%'] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="absolute top-0 start-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[20deg]"
        />
      </span>
      {children}
    </motion.a>
  );
};

// المدار خلف النصوص المركزية — أيقونات شفافة فقط تدور دوراناً محورياً هادئاً
// ومستمراً (سرعة ثابتة) حول مسار بيضاوي، بمنظور كوكبي/عالمي بحت — لا نص ولا
// خلفية، لمسة احترافية خفيفة فقط. يظهر على كل الأحجام (لا يعتمد على hover)،
// بحجم مصغّر تدريجياً على الشاشات الصغيرة عبر scale بدل إخفائه بالكامل.
const OrbitSystem = () => (
  <div className="flex absolute inset-0 z-0 items-center justify-center pointer-events-none" aria-hidden="true">
    <div
      className="relative scale-[0.45] sm:scale-[0.65] md:scale-[0.85] lg:scale-100"
      style={{ width: ORBIT_RADIUS_X * 2, height: ORBIT_RADIUS_Y * 2 }}
    >
      {ORBIT_ICONS.map((_, idx) => {
        const path = buildOrbitPath(idx);
        const Icon = path.icon;
        return (
          // طبقتان منفصلتان عمداً: الخارجية تتمركز بكلاسات Tailwind الثابتة،
          // والداخلية (motion.div) تتحرك عبر x/y من Framer — دمج transform
          // من الاثنين على نفس العنصر يكسر التمركز (الـ style المباشر يطغى).
          <div key={idx} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div animate={{ x: path.x, y: path.y }} transition={ORBIT_TRANSITION}>
              <motion.div
                animate={{ opacity: path.opacity, scale: path.scale }}
                transition={ORBIT_TRANSITION}
                className="text-gray-500 dark:text-brand-gray"
              >
                <Icon size={26} strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  </div>
);

const Hero = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const [apiAchievements, setApiAchievements] = useState([]);
  const sectionRef = useRef(null);

  // انتقال مرتبط بالتمرير (لا اعتماد على "دخول العنصر للشاشة" فقط) — كل
  // المحتوى المقروء في الهيرو يتلاشى ويصغر ويرتفع قليلاً تدريجياً وهو
  // يغادر أعلى الشاشة، بحيث يتزامن اختفاؤه مع ظهور قسم الخدمات فيبدو الانتقال
  // متصلاً وسلساً بدل قطع مفاجئ. النطاق [0.7, 1] يجعل التأثير يبدأ فقط في
  // الجزء الأخير من مغادرة القسم، لا طوال وقت القراءة.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const exitOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);
  const exitScale = useTransform(scrollYProgress, [0.7, 1], [1, 0.92]);
  const exitY = useTransform(scrollYProgress, [0.7, 1], [0, -60]);
  const seamGlowOpacity = useTransform(scrollYProgress, [0.6, 0.85, 1], [0, 1, 0]);

  useEffect(() => {
    apiGetAchievements()
      .then(res => {
        const featured = (res.data ?? []).filter(a => a.is_featured);
        if (featured.length >= 2) setApiAchievements(featured);
      })
      .catch(() => {});
  }, []);

  const current = LABELS[lang];
  const ar = lang === 'ar';

  const sub = ar
    ? (settings.taglineAr || current.sub)
    : (settings.taglineEn || current.sub);

  const stats = apiAchievements.length >= 2
    ? apiAchievements.map(a => ({
        num:    String(a.value ?? ''),
        suffix: a.unit ?? '',
        label:  lang === 'ar' ? (a.title ?? '') : (a.title_en ?? a.title ?? ''),
      }))
    : FALLBACK_STATS[lang];

  return (
    <section id="home" ref={sectionRef} className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-32 px-6">

      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(29,78,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,78,216,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)'
        }}
      ></div>

      {/* توهج شعاعي خافت خلف النصوص المركزية — يعطي عمقاً بصرياً، ويبقى
          "حياً" باستمرار عبر حركة بطيئة لا تتوقف */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 15, 0], y: [0, 25, -15, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[30%] right-[15%] w-[250px] h-[250px] bg-red-500/6 rounded-full blur-[60px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 25, -25, 0], y: [0, -20, 15, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[15%] left-[12%] w-[200px] h-[200px] bg-purple-500/8 rounded-full blur-[70px] pointer-events-none"
      />

      {/* غلاف "الخروج" — كل المحتوى المقروء (النص + الأزرار + الإحصائيات)
          يتلاشى/يصغر/يرتفع معاً كوحدة واحدة أثناء مغادرة القسم (exitOpacity/
          Scale/Y أعلاه)، بينما الخلفيات الزخرفية (الشبكة + التوهجات) تبقى
          ثابتة خارج هذا الغلاف. */}
      <motion.div style={{ opacity: exitOpacity, scale: exitScale, y: exitY }} className="w-full flex flex-col items-center">

      {/* المسرح المركزي: z-20 يضمن بقاءه دائماً فوق المدار (z-0) */}
      <div className="relative z-20 max-w-3xl mx-auto w-full flex flex-col items-center text-center gap-8">
        <OrbitSystem />

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.6] tracking-tight text-gray-900 dark:text-white px-2 pt-2">
          <Text3DFlip
            delay={0.1}
            staggerDuration={0.07}
            rotateDirection="top"
            parts={[
              { text: current.headlinePre },
              {
                text: current.headlineHighlight,
                className: 'text-blue-600 dark:text-brand-blue',
              },
              { text: current.headlinePost },
            ]}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_EXPO }}
          className="text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed"
        >
          {sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_EXPO }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <div className="relative">
            {/* توهج نابض تلقائي خلف الزر الرئيسي — يعمل بلا حاجة لـ hover،
                فيبقى مرئياً على الجوال أيضاً حيث لا يوجد مؤشر ماوس */}
            <motion.span
              animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-xl bg-blue-500 blur-lg -z-10"
            />
            <MagneticButton
              href="#contact"
              className="relative overflow-hidden inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors duration-300 shadow-[0_8px_30px_rgba(29,78,216,0.35)]"
            >
              <Rocket size={18} />
              {current.btnPrimary}
            </MagneticButton>
          </div>
          <motion.a
            href="#portfolio"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-transparent text-gray-700 dark:text-white border border-blue-400/60 dark:border-blue-500/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800/50 px-8 py-3.5 rounded-xl font-medium transition-[background-color,border-color] duration-300"
          >
            <Eye size={18} />
            {current.btnSecondary}
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.12, 0.9)}
        className="relative z-10 max-w-3xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 mt-16 pt-10 border-t border-blue-300/20 dark:border-blue-500/10"
      >
        {stats.map((stat, idx) => {
          const numValue = parseFloat(stat.num);
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_EXPO } },
              }}
              className="text-center"
            >
              <NumberOrbit>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-mono px-3">
                  {Number.isNaN(numValue) ? stat.num : <Counter to={numValue} />}
                  <span className="text-gray-500 dark:text-brand-gray">{stat.suffix}</span>
                </div>
              </NumberOrbit>
              <div className="text-xs md:text-sm text-gray-600 dark:text-slate-300 mt-2">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      </motion.div>

      {/* "شعاع" ضوئي عند حافة القسم السفلى يقوى تحديداً أثناء لحظة الانتقال
          (0.6→0.85 من تقدّم مغادرة الهيرو) ثم يخفت — قسم الخدمات يملك توهجاً
          مطابقاً عند حافته العلوية، فيبدو الاثنان معاً وكأن ضوءاً واحداً
          "ينتقل" من قسم لآخر عبر نقطة الالتقاء. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: seamGlowOpacity }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
      />

    </section>
  );
};

export default Hero;
