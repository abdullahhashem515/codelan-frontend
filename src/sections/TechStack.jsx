import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const TechStack = () => {
  const { lang } = useLang();
  const content = {
    ar: {
      tag: '// tech-stack',
      title: 'المكدس التقني والبيئة البرمجية',
      sub: 'نختار الأداة المناسبة للمشكلة الصحيحة. نعتمد على أحدث التقنيات وأكثرها استقراراً لبناء أنظمة تعيش طويلاً.',
    },
    en: {
      tag: '// tech-stack',
      title: 'Our Tech Stack',
      sub: 'We choose the right tool for the right problem. Relying on the latest and most stable technologies to build long-lasting systems.',
    }
  };

  const current = content[lang];

  // قائمة التقنيات مقسمة حسب التخصص (مع إضافة تقنياتكم الفعلية)
  const categories = [
    {
      title: 'Frontend',
      items: [
        { name: 'React', dot: 'bg-blue-400' },
        { name: 'Vue.js', dot: 'bg-green-400' },
        { name: 'Tailwind CSS', dot: 'bg-purple-400' },
        { name: 'TypeScript', dot: 'bg-blue-500' },
        { name: 'Framer Motion', dot: 'bg-pink-400' }
      ]
    },
    {
      title: 'Backend & APIs',
      items: [
        { name: 'Laravel', dot: 'bg-red-500' },
        { name: 'ASP.NET Core', dot: 'bg-indigo-500' },
        { name: 'Node.js', dot: 'bg-green-500' },
        { name: 'RESTful APIs', dot: 'bg-yellow-400' }
      ]
    },
    {
      title: 'Databases',
      items: [
        { name: 'MySQL', dot: 'bg-blue-500' },
        { name: 'PostgreSQL', dot: 'bg-blue-400' },
        { name: 'Redis', dot: 'bg-red-400' },
        { name: 'MongoDB', dot: 'bg-green-500' }
      ]
    },
    {
      title: 'Mobile Apps',
      items: [
        { name: 'Flutter', dot: 'bg-cyan-400' },
        { name: 'Dart', dot: 'bg-blue-300' },
        { name: 'React Native', dot: 'bg-blue-500' }
      ]
    },
    {
      title: 'DevOps & Infra',
      items: [
        { name: 'Citrix (XenServer)', dot: 'bg-slate-300' },
        { name: 'Docker', dot: 'bg-blue-400' },
        { name: 'Kali Linux', dot: 'bg-blue-600' },
        { name: 'AWS', dot: 'bg-orange-400' }
      ]
    },
    {
      title: 'Networks & ISP',
      items: [
        { name: 'MikroTik', dot: 'bg-slate-400' },
        { name: 'Starlink', dot: 'bg-white' },
        { name: 'Ubiquiti', dot: 'bg-blue-500' },
        { name: 'Cisco', dot: 'bg-cyan-500' }
      ]
    }
  ];

  // إعدادات الأنيميشن
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section id="techstack" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      
      {/* عنوان القسم */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
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

      {/* شبكة التصنيفات */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {categories.map((cat, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-[#3b82f6]/15 rounded-2xl p-6 transition-colors duration-300 hover:border-blue-400 dark:hover:border-[#3b82f6]/40 group shadow-sm dark:shadow-none"
          >
            <h3 className="text-sm font-mono text-blue-400 uppercase tracking-wider mb-5">
              {cat.title}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {cat.items.map((tech, tIdx) => (
                <div 
                  key={tIdx} 
                  className="flex items-center gap-2 bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 transition-all duration-200 hover:!bg-blue-50 dark:hover:!bg-blue-500/10 hover:!border-blue-400 dark:hover:!border-blue-500/30 hover:!text-blue-600 dark:hover:!text-blue-300 cursor-default"
                >
                  {/* النقطة الملونة */}
                  <span className={`w-1.5 h-1.5 rounded-full ${tech.dot}`}></span>
                  <span className="font-english">{tech.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};

export default TechStack;