import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const Services = () => {
  const { lang } = useLang();
  // محتوى الخدمات متضمنة تقنياتكم المفضلة (Flutter, Laravel, React، بالإضافة لشبكات MikroTik و Cisco)
  const content = {
    ar: {
      tag: '// services',
      title: 'الحلول والخدمات المتقدمة',
      sub: 'نقدم حلولاً برمجية متكاملة تلبي احتياجات أعمالك الرقمية بدقة واحترافية.',
      services: [
        {
          icon: '⚡', color: 'bg-blue-500/15 text-blue-400',
          title: 'تطوير تطبيقات الويب',
          desc: 'نبني تطبيقات ويب سريعة وموثوقة باستخدام أحدث التقنيات، مع التركيز على تجربة مستخدم استثنائية للوحات التحكم والمواقع.',
          tags: ['React', 'Next.js', 'Vue', 'TypeScript']
        },
        {
          icon: '🔧', color: 'bg-red-500/15 text-red-400',
          title: 'تطوير الواجهة الخلفية',
          desc: 'نصمم APIs قوية وقابلة للتوسع مع قواعد بيانات محسّنة وأنظمة موثوقة وآمنة لإدارة الأعمال والمحاسبة.',
          tags: ['Laravel', 'ASP.NET Core', 'Node.js', 'MySQL']
        },
        {
          icon: '☁️', color: 'bg-green-500/15 text-green-400',
          title: 'حلول SaaS والبنية التحتية',
          desc: 'نطور منصات SaaS متكاملة وننشئ بنى تحتية سحابية مرنة وقابلة للتوسع لأعمالك المتنامية.',
          tags: ['Docker', 'AWS', 'Citrix', 'Linux']
        },
        {
          icon: '📱', color: 'bg-purple-500/15 text-purple-400',
          title: 'تطوير التطبيقات المتنقلة',
          desc: 'نصمم تطبيقات موبايل متعددة المنصات بتجارب مستخدم سلسة وأداء عالي لـ iOS وAndroid.',
          tags: ['Flutter', 'React Native', 'Dart']
        },
        {
          icon: '🛡️', color: 'bg-blue-500/15 text-blue-400',
          title: 'الشبكات والربط البرمجي',
          desc: 'ندير ونصمم حلول شبكية آمنة، ونقوم بدمج الأنظمة البرمجية مع البنية التحتية للشبكات مثل وتوزيع الأحمال.',
          tags: ['MikroTik', 'Cisco', 'Starlink', 'Ubiquiti']
        },
        {
          icon: '🎨', color: 'bg-red-500/15 text-red-400',
          title: 'تصميم UI/UX',
          desc: 'نصمم واجهات مستخدم جذابة وتجارب رقمية استثنائية تعزز مشاركة المستخدم وتحقق أهداف العمل.',
          tags: ['Figma', 'Prototyping', 'Design Systems']
        }
      ]
    },
    en: {
      tag: '// services',
      title: 'Advanced Solutions & Services',
      sub: 'We deliver complete software solutions tailored to your digital business needs with precision and professionalism.',
      services: [
        {
          icon: '⚡', color: 'bg-blue-500/15 text-blue-400',
          title: 'Web Application Development',
          desc: 'We build fast and reliable web apps using the latest technologies, focusing on exceptional UX for dashboards and sites.',
          tags: ['React', 'Next.js', 'Vue', 'TypeScript']
        },
        {
          icon: '🔧', color: 'bg-red-500/15 text-red-400',
          title: 'Backend Development',
          desc: 'We design powerful scalable APIs with optimized databases and reliable secure systems for business management.',
          tags: ['Laravel', 'ASP.NET Core', 'Node.js', 'MySQL']
        },
        {
          icon: '☁️', color: 'bg-green-500/15 text-green-400',
          title: 'SaaS Solutions & Infrastructure',
          desc: 'We develop complete SaaS platforms and build flexible scalable cloud infrastructure.',
          tags: ['Docker', 'AWS', 'Citrix', 'Linux']
        },
        {
          icon: '📱', color: 'bg-purple-500/15 text-purple-400',
          title: 'Mobile App Development',
          desc: 'We design cross-platform mobile apps with seamless UX and high performance.',
          tags: ['Flutter', 'React Native', 'Dart']
        },
        {
          icon: '🛡️', color: 'bg-blue-500/15 text-blue-400',
          title: 'Networks & System Integration',
          desc: 'We manage and design secure network solutions, integrating software systems with network infrastructure and load balancing.',
          tags: ['MikroTik', 'Cisco', 'Starlink', 'Ubiquiti']
        },
        {
          icon: '🎨', color: 'bg-red-500/15 text-red-400',
          title: 'UI/UX Design',
          desc: 'We design attractive interfaces and exceptional digital experiences that boost engagement.',
          tags: ['Figma', 'Prototyping', 'Design Systems']
        }
      ]
    }
  };

  const current = content[lang];

  // إعدادات الأنيميشن للمجموعة (لكي تظهر البطاقات واحدة تلو الأخرى)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 } // تأخير زمني بين كل بطاقة والتي تليها
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="services" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      
{/* عنوان القسم */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center" // ← أضفنا التوسيط هنا
      >
        <div className="inline-block font-mono text-xs text-blue-500 tracking-widest uppercase mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
          {current.tag}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{current.title}</h2>
        <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
          {current.sub}
        </p>
      </motion.div>
      {/* شبكة البطاقات (Grid) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {current.services.map((srv, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants} 
            className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-[#3b82f6]/15 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-400 dark:hover:border-[#3b82f6]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-default"
          >
            {/* تأثير إضاءة خلفية عند تمرير الماوس */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* أيقونة الخدمة */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 ${srv.color}`}>
              {srv.icon}
            </div>
            
            <h3 className="text-xl font-bold mb-3 relative z-10 text-gray-900 dark:text-white">{srv.title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6 relative z-10">{srv.desc}</p>
            
            {/* التقنيات (Tags) */}
            <div className="flex flex-wrap gap-2 relative z-10">
              {srv.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10 group-hover:border-blue-400 dark:group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};

export default Services;