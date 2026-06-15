// src/pages/sections/Blog.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';

const Blog = () => {
  const { lang } = useLang();
  const content = {
    ar: {
      tag: '// blog',
      title: 'المدونة التقنية',
      sub: 'مقالات تقنية متعمقة من تجاربنا الميدانية — نشارك ما تعلمناه لنرفع مستوى المجتمع التقني.',
      readMore: 'اقرأ المزيد', // تمت إضافة النص هنا
      posts: [
        {
          id: 1,
          category: 'هندسة البرمجيات',
          title: 'بناء APIs قابلة للتوسع: دروس من الميدان',
          desc: 'كيف صممنا API تتعامل مع 10,000 طلب/ثانية في نظام مالي، وما تعلمناه في الطريق حول تحسين قواعد البيانات.',
          time: '8 دقائق',
          date: 'قبل أسبوع',
          icon: '🏗️',
          gradient: 'from-[#0a1628] to-[#162a4a]'
        },
        {
          id: 2,
          category: 'الأمن السيبراني',
          title: 'أكثر 5 ثغرات شيوعاً في تطبيقات الويب عام 2024',
          desc: 'دليل عملي لحماية تطبيقك من الهجمات الأكثر شيوعاً مثل XSS و SQL Injection مع أمثلة حقيقية وحلول برمجية.',
          time: '12 دقيقة',
          date: 'قبل 3 أسابيع',
          icon: '🔒',
          gradient: 'from-[#1a0028] to-[#2d1545]'
        },
        {
          id: 3,
          category: 'الأداء والتحسين',
          title: 'React Performance: من 4 ثوانٍ إلى 0.8 ثانية',
          desc: 'رحلة تحسين أداء تطبيق React ضخم: التقنيات، الأدوات المستخدمة، وكيفية التعامل مع إعادة التصيير (Re-renders).',
          time: '10 دقائق',
          date: 'قبل شهر',
          icon: '⚡',
          gradient: 'from-[#001a0a] to-[#0a3020]'
        }
      ]
    },
    en: {
      tag: '// blog',
      title: 'Tech Insights & Blog',
      sub: 'In-depth technical articles from our field experience — we share what we learn to elevate the tech community.',
      readMore: 'Read More', // تمت إضافة النص هنا
      posts: [
        {
          id: 1,
          category: 'Software Engineering',
          title: 'Building Scalable APIs: Lessons from the Field',
          desc: 'How we designed an API handling 10,000 req/sec in a financial system, and what we learned about database optimization.',
          time: '8 min read',
          date: '1 week ago',
          icon: '🏗️',
          gradient: 'from-[#0a1628] to-[#162a4a]'
        },
        {
          id: 2,
          category: 'Cybersecurity',
          title: 'Top 5 Most Common Web App Vulnerabilities in 2024',
          desc: 'A practical guide to protecting your app from common attacks like XSS and SQL Injection with real examples and solutions.',
          time: '12 min read',
          date: '3 weeks ago',
          icon: '🔒',
          gradient: 'from-[#1a0028] to-[#2d1545]'
        },
        {
          id: 3,
          category: 'Performance',
          title: 'React Performance: From 4s to 0.8s',
          desc: 'The journey of optimizing a massive React application: techniques, tools, and handling unnecessary re-renders.',
          time: '10 min read',
          date: '1 month ago',
          icon: '⚡',
          gradient: 'from-[#001a0a] to-[#0a3020]'
        }
      ]
    }
  };

  const current = content[lang];

  // إعدادات الأنيميشن للمجموعة (Staggering)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15 // تأخير 0.15 ثانية بين كل بطاقة والتي تليها
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="blog" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      {/* ترويسة القسم */}
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
        <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{current.sub}</p>
      </motion.div>

      {/* حاوية البطاقات مع استخدام variants */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {current.posts.map((post) => (
          <motion.div
            key={post.id}
            variants={itemVariants}
            className="flex flex-col bg-white dark:bg-[#111827] border border-blue-200 dark:border-[#3b82f6]/15 rounded-2xl overflow-hidden group hover:border-blue-400 dark:hover:border-[#3b82f6]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer shadow-sm dark:shadow-none"
          >
            {/* صورة غلاف المقال */}
            <div className={`h-48 w-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-5xl relative overflow-hidden shrink-0`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
              {/* إخفاء الإيموجي عن قارئات الشاشة */}
              <span aria-hidden="true" className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                {post.icon}
              </span>
            </div>

            {/* محتوى المقال */}
            <div className="p-6 flex flex-col flex-grow">
              <div>
                <span className="inline-block font-mono text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded mb-4 uppercase tracking-wider">
                  {post.category}
                </span>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.desc}
                </p>
              </div>

              {/* بيانات النشر وزر القراءة (دائماً في الأسفل بفضل flex-grow) */}
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 font-mono">
                  <span aria-hidden="true">⏱️</span>
                  <span>{post.time}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
                
                {/* رابط "اقرأ المزيد" مع تأثير حركة حسب اتجاه اللغة */}
                <span className={`text-sm font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 ${lang === 'ar' ? '-translate-x-2 group-hover:translate-x-0' : 'translate-x-2 group-hover:translate-x-0'}`}>
                  {current.readMore} {lang === 'ar' ? '←' : '→'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Blog;