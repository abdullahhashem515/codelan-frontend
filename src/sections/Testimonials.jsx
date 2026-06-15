import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const Testimonials = () => {
  const { lang } = useLang();
  const content = {
    ar: {
      tag: '// testimonials',
      title: 'ماذا يقول عملاؤنا',
      sub: 'ثقة عملائنا هي أعظم إنجازاتنا — آراء حقيقية من شركاء نجاحنا.',
      reviews: [
        {
          name: 'أحمد الحربي', role: 'مؤسس، شركة تقنية ناشئة', initial: 'أح', color: 'from-blue-600 to-blue-400',
          text: 'فريق Code LAN حوّل فكرتي إلى منصة متكاملة بجودة تفوق توقعاتي. الاحترافية والالتزام بالمواعيد كانا استثنائيَّين.'
        },
        {
          name: 'سارة المطيري', role: 'مديرة تسويق رقمي', initial: 'سم', color: 'from-purple-600 to-purple-400',
          text: 'أفضل فريق تطوير تعاملت معه. يفهمون متطلبات الأعمال ويقدمون حلولاً ذكية وقابلة للتوسع.'
        },
        {
          name: 'عبدالله الشمري', role: 'CTO، شركة برمجيات', initial: 'عش', color: 'from-green-600 to-green-400',
          text: 'قدموا لنا استشارة تقنية وفّرت علينا أشهراً من العمل الخاطئ. خبرتهم في البنية التحتية والأمن واضحة جداً.'
        }
      ]
    },
    en: {
      tag: '// testimonials',
      title: 'What Our Clients Say',
      sub: 'Our clients\' trust is our greatest achievement — real opinions from our success partners.',
      reviews: [
        {
          name: 'Ahmed Al-Harbi', role: 'Founder, Tech Startup', initial: 'AA', color: 'from-blue-600 to-blue-400',
          text: 'The Code LAN team turned my idea into a complete platform with quality beyond my expectations. Exceptional professionalism.'
        },
        {
          name: 'Sara Al-Mutairi', role: 'Digital Marketing Manager', initial: 'SA', color: 'from-purple-600 to-purple-400',
          text: 'The best dev team I\'ve worked with. They understand business requirements and deliver smart scalable solutions.'
        },
        {
          name: 'Abdullah Al-Shammari', role: 'CTO, Software Company', initial: 'AS', color: 'from-green-600 to-green-400',
          text: 'Provided us with tech consultation that saved months of wrong work. Their infra and security expertise is very clear.'
        }
      ]
    }
  };

  const current = content[lang];

  return (
    <section id="testimonials" className="py-24 bg-gray-100 dark:bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-6">
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
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">{current.sub}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {current.reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white dark:bg-[#0d1428] border border-gray-200 dark:border-white/5 rounded-2xl p-8 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all hover:-translate-y-1 relative shadow-sm dark:shadow-none"
            >
              {/* علامة الاقتباس المائية */}
              <div className="absolute top-6 left-6 text-6xl text-blue-500/10 font-serif leading-none rotate-180">"</div>
              
              <div className="flex gap-1 text-yellow-400 text-sm mb-6">
                ★★★★★
              </div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-8 relative z-10 text-sm">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                  {review.initial}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{review.name}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-500">{review.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;