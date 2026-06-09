import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ lang }) => {
  // محتوى الواجهة بناءً على اللغة
  const content = {
    ar: {
      badge: 'نبني الحلول التقنية التي تُحدث الفرق',
      tagline: 'فريق التطوير البرمجي',
      sub: 'نصمم ونبني منتجات رقمية استثنائية — من تطبيقات الويب إلى الأنظمة السحابية وحلول SaaS المتكاملة.',
      btnPrimary: '🚀 ابدأ مشروعك',
      btnSecondary: '👁️ شاهد أعمالنا',
      stats: [
        { num: '20', suffix: '+', label: 'مشروع منجز' },
        { num: '15', suffix: '+', label: 'عميل راضٍ' },
        { num: '3', suffix: '+', label: 'سنوات خبرة' },
        { num: '99', suffix: '%', label: 'معدل رضا العملاء' },
      ]
    },
    en: {
      badge: 'We build tech solutions that make a difference',
      tagline: 'Software Development Team',
      sub: 'We design and build exceptional digital products — from web apps to cloud systems and integrated SaaS solutions.',
      btnPrimary: '🚀 Start Your Project',
      btnSecondary: '👁️ View Our Work',
      stats: [
        { num: '20', suffix: '+', label: 'Projects Delivered' },
        { num: '15', suffix: '+', label: 'Happy Clients' },
        { num: '3', suffix: '+', label: 'Years Experience' },
        { num: '99', suffix: '%', label: 'Client Satisfaction' },
      ]
    }
  };

  const current = content[lang];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32 pb-16 px-6 text-center">
      
      {/* الخلفية الشبكية (Grid Pattern) */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)'
        }}
      ></div>

      {/* الإضاءات الخلفية (Glow Effects) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* شارة البداية مع حركة دخول ناعمة */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-5 py-2 text-sm text-blue-400 mb-8 font-mono"
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          {current.badge}
        </motion.div>

        {/* العنوان الرئيسي */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
        >
          <span className="text-blue-400 font-[var(--font-en)]">Code</span>
          <span className="text-red-400 font-[var(--font-en)]">LAN</span>
          <br />
          <span className="text-white mt-2 block">{current.tagline}</span>
        </motion.h1>

        {/* الوصف */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {current.sub}
        </motion.p>

        {/* الأزرار */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)]">
            {current.btnPrimary}
          </a>
          <a href="#portfolio" className="inline-flex items-center gap-2 bg-transparent text-white border border-blue-500/30 hover:border-blue-500 hover:bg-slate-800/50 px-8 py-3.5 rounded-xl font-medium transition-all duration-300">
            {current.btnSecondary}
          </a>
        </motion.div>

        {/* الأرقام والإحصائيات */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-20 pt-10 border-t border-blue-500/10"
        >
          {current.stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono mb-1">
                {stat.num}<span className="text-blue-400">{stat.suffix}</span>
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;