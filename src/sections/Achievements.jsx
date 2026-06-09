// src/pages/sections/Achievements.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// مكون فرعي صغير لعمل تأثير "العدّاد" للأرقام (تم تحديثه ليستخدم requestAnimationFrame لأداء فائق النعومة)
const Counter = ({ to, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const duration = 2000; // مدة الأنيميشن (ثانيتين)

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        setCount(Math.ceil(progress * to));
        
        if (progress < 1) {
          window.requestAnimationFrame(animate);
        }
      };
      
      window.requestAnimationFrame(animate);
    }
  }, [isInView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Achievements = ({ lang }) => {
  const content = {
    ar: {
      tag: '// achievements',
      title: 'إنجازاتنا وأرقامنا',
      sub: 'أرقام حقيقية تعكس جودة عملنا والثقة التي يضعها عملاؤنا فينا.',
      items: [
        { icon: '🏆', num: 3, suffix: '', title: 'جوائز تقنية', sub: 'في مسابقات البرمجة' },
        { icon: '📦', num: 20, suffix: '+', title: 'مشروع مُسلَّم', sub: 'في الوقت المحدد' },
        { icon: '⭐', num: 15, suffix: '+', title: 'عميل راضٍ', sub: 'معدل رضا 99%' },
        { icon: '📝', num: 10, suffix: '', title: 'مقال تقني', sub: 'منشور في المدونة' },
        { icon: '🤝', num: 5, suffix: '', title: 'شراكات تقنية', sub: 'مع شركات محلية' },
        { icon: '🔒', num: 100, suffix: '%', title: 'معدل الأمان', sub: 'لا خروقات أمنية' }
      ]
    },
    en: {
      tag: '// achievements',
      title: 'Our Achievements',
      sub: 'Real numbers reflecting the quality of our work and the trust our clients place in us.',
      items: [
        { icon: '🏆', num: 3, suffix: '', title: 'Tech Awards', sub: 'in programming competitions' },
        { icon: '📦', num: 20, suffix: '+', title: 'Projects Delivered', sub: 'on schedule' },
        { icon: '⭐', num: 15, suffix: '+', title: 'Happy Clients', sub: '99% satisfaction rate' },
        { icon: '📝', num: 10, suffix: '', title: 'Tech Articles', sub: 'published on our blog' },
        { icon: '🤝', num: 5, suffix: '', title: 'Tech Partnerships', sub: 'with local companies' },
        { icon: '🔒', num: 100, suffix: '%', title: 'Security Rate', sub: 'zero security breaches' }
      ]
    }
  };

  const current = content[lang];

  return (
    <section id="achievements" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center mb-16"
      >
        <div className="inline-block font-mono text-xs text-blue-500 tracking-widest uppercase mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
          {current.tag}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{current.title}</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">{current.sub}</p>
      </motion.div>

      {/* التعديل الأول: تحسين التجاوب (Responsive) للشاشات المتوسطة والكبيرة */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {current.items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#111827] border border-white/5 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors group relative overflow-hidden"
          >
            {/* خط إضاءة علوي للبطاقة */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* التعديل الثاني: إضافة خصائص Accessibility للإيموجي */}
            <span role="img" aria-label={item.title} className="block text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">
              {item.icon}
            </span>
            
            <div className="text-3xl font-bold text-blue-400 font-mono mb-2">
              <Counter to={item.num} suffix={item.suffix} />
            </div>
            <div className="text-sm font-bold text-white mb-1">{item.title}</div>
            <div className="text-xs text-slate-500">{item.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Achievements;