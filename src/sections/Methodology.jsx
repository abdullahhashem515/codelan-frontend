import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const Methodology = () => {
  const { lang } = useLang();
  const content = {
    ar: {
      tag: '// methodology',
      title: 'منهجية العمل الاحترافية',
      sub: 'عملية منظمة ومجربة تبدأ من هندسة البيانات وتنتهي بدعم تقني مستمر — شفافية كاملة في كل مرحلة.',
      steps: [
        {
          id: '01',
          icon: '🔍',
          title: 'التحليل وهندسة المتطلبات',
          desc: 'نبدأ بفهم عميق لاحتياجاتك، نحلل السوق، ونقوم ببناء مخططات قاعدة البيانات (ERDs) وهيكلية النظام التقنية.',
        },
        {
          id: '02',
          icon: '🎨',
          title: 'التصميم وتجربة المستخدم',
          desc: 'نحول الهيكل إلى واجهات احترافية في Figma، مع التركيز على سهولة الاستخدام والانسيابية في التنقل.',
        },
        {
          id: '03',
          icon: '⚙️',
          title: 'التطوير البرمجي (Agile)',
          desc: 'نبدأ كتابة كود نظيف وموثق باستخدام تقنياتنا الحديثة، مع تسليمات دورية لتكون على اطلاع دائم بتقدم العمل.',
        },
        {
          id: '04',
          icon: '🧪',
          title: 'الاختبار وضمان الجودة',
          desc: 'تخضع كافة الأنظمة لاختبارات أداء وأمان دقيقة لضمان خلوها من الثغرات البرمجية أو مشاكل الربط الشبكي.',
        },
        {
          id: '05',
          icon: '🚀',
          title: 'الإطلاق والدعم الفني',
          desc: 'نقوم برفع المشروع على السيرفرات السحابية، وتقديم تدريب كامل لفريقك، مع دعم تقني مستمر لضمان الاستدامة.',
        }
      ]
    },
    en: {
      tag: '// methodology',
      title: 'Our Methodology',
      sub: 'A structured and proven process from data engineering to ongoing support — full transparency at every step.',
      steps: [
        {
          id: '01',
          icon: '🔍',
          title: 'Analysis & Requirements',
          desc: 'We start by deeply understanding your needs, analyzing the market, and building ERDs and technical architecture.',
        },
        {
          id: '02',
          icon: '🎨',
          title: 'UI/UX Design',
          desc: 'We transform the structure into professional interfaces in Figma, focusing on ease of use and smooth navigation.',
        },
        {
          id: '03',
          icon: '⚙️',
          title: 'Agile Development',
          desc: 'We start writing clean, documented code using modern tech, with periodic deliverables to keep you updated.',
        },
        {
          id: '04',
          icon: '🧪',
          title: 'Testing & QA',
          desc: 'All systems undergo rigorous performance and security tests to ensure they are free of bugs or network issues.',
        },
        {
          id: '05',
          icon: '🚀',
          title: 'Launch & Support',
          desc: 'We deploy the project to cloud servers, provide full training for your team, and offer ongoing technical support.',
        }
      ]
    }
  };

  const current = content[lang];

  return (
    <section id="methodology" className="py-24 bg-gray-100 dark:bg-[#0a0f1e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* عنوان القسم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center flex flex-col items-center mb-20"
        >
          <div className="inline-block font-mono text-xs text-blue-500 tracking-widest uppercase mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
            {current.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{current.title}</h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{current.sub}</p>
        </motion.div>

        <div className="relative">
          {/* الخط المركزي للتايم لاين (يظهر في الشاشات الكبيرة فقط) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-red-500/50 to-blue-500/50 hidden lg:block -translate-x-1/2"></div>

          <div className="space-y-12 lg:space-y-0">
            {current.steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`flex flex-col lg:flex-row items-center justify-between w-full mb-8 lg:mb-16 ${idx % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* المحتوى */}
                <div className="w-full lg:w-[45%] p-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500/30 transition-colors group shadow-sm dark:shadow-none">
                  <div className="text-blue-500 font-mono text-sm mb-2">STEP {step.id}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>

                {/* الدائرة المركزية (الأيقونة) */}
                <div className="relative z-10 my-6 lg:my-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#050810] border-2 border-blue-500 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    {step.icon}
                  </div>
                </div>

                {/* مساحة فارغة للموازنة في الشاشات الكبيرة */}
                <div className="hidden lg:block lg:w-[45%]"></div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Methodology;