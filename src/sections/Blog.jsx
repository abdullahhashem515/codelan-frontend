import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { apiGetPosts } from '../services/api';
import { fadeUp, staggerContainer } from '../utils/motion';
import DynamicIcon from '../components/DynamicIcon';
import TiltCard from '../components/TiltCard';

const LABELS = {
  ar: { title: 'المدونة التقنية', sub: 'مقالات تقنية متعمقة من تجاربنا الميدانية — نشارك ما تعلمناه لنرفع مستوى المجتمع التقني.', readMore: 'اقرأ المزيد' },
  en: { title: 'Tech Insights & Blog', sub: 'In-depth technical articles from our field experience — we share what we learn to elevate the tech community.', readMore: 'Read More' },
};

const CARD_STYLES = [
  { icon: '🏗️', gradient: 'from-[#0a1628] to-[#162a4a]' },
  { icon: '🔒', gradient: 'from-[#1a0028] to-[#2d1545]' },
  { icon: '⚡', gradient: 'from-[#001a0a] to-[#0a3020]' },
  { icon: '🚀', gradient: 'from-[#1a1000] to-[#3a2a00]' },
  { icon: '💡', gradient: 'from-[#0a0a1a] to-[#1a1a3a]' },
  { icon: '🛠️', gradient: 'from-[#1a0a0a] to-[#3a1515]' },
];

const FALLBACK = [
  { id: 1, category: 'هندسة البرمجيات', categoryEn: 'Software Engineering', title: 'بناء APIs قابلة للتوسع: دروس من الميدان', titleEn: 'Building Scalable APIs: Lessons from the Field', desc: 'كيف صممنا API تتعامل مع 10,000 طلب/ثانية في نظام مالي، وما تعلمناه في الطريق.', descEn: 'How we designed an API handling 10,000 req/sec in a financial system, and what we learned.', time: '8 دقائق', timeEn: '8 min read', date: '', icon: '🏗️', gradient: 'from-[#0a1628] to-[#162a4a]' },
  { id: 2, category: 'الأمن السيبراني', categoryEn: 'Cybersecurity', title: 'أكثر 5 ثغرات شيوعاً في تطبيقات الويب', titleEn: 'Top 5 Most Common Web App Vulnerabilities', desc: 'دليل عملي لحماية تطبيقك من الهجمات الأكثر شيوعاً مثل XSS و SQL Injection.', descEn: 'A practical guide to protecting your app from common attacks like XSS and SQL Injection.', time: '12 دقيقة', timeEn: '12 min read', date: '', icon: '🔒', gradient: 'from-[#1a0028] to-[#2d1545]' },
  { id: 3, category: 'الأداء والتحسين', categoryEn: 'Performance', title: 'React Performance: من 4 ثوانٍ إلى 0.8 ثانية', titleEn: 'React Performance: From 4s to 0.8s', desc: 'رحلة تحسين أداء تطبيق React ضخم: التقنيات، الأدوات المستخدمة، وكيفية التعامل مع Re-renders.', descEn: 'The journey of optimizing a massive React app: techniques, tools, and handling re-renders.', time: '10 دقائق', timeEn: '10 min read', date: '', icon: '⚡', gradient: 'from-[#001a0a] to-[#0a3020]' },
];

const formatDate = (dateStr, ar) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

const fromApi = (p, idx) => {
  const style = CARD_STYLES[idx % CARD_STYLES.length];
  const dateStr = p.published_at ?? p.date ?? p.created_at ?? '';
  return {
    id:         p.id,
    category:   p.category    ?? '',
    categoryEn: p.category_en ?? p.category ?? '',
    title:      p.title       ?? '',
    titleEn:    p.title_en    ?? p.title ?? '',
    desc:       p.excerpt     ?? p.description ?? '',
    descEn:     p.excerpt_en  ?? p.description_en ?? p.excerpt ?? p.description ?? '',
    time:       p.reading_time ? `${p.reading_time} دقيقة` : '',
    timeEn:     p.reading_time ? `${p.reading_time} min read` : '',
    date:       dateStr,
    icon:       p.icon ?? style.icon,
    gradient:   style.gradient,
  };
};

const Blog = () => {
  const { lang } = useLang();
  const [posts, setPosts] = useState(FALLBACK);

  useEffect(() => {
    apiGetPosts()
      .then(res => {
        const published = (res.data ?? []).filter(p => !p.status || p.status === 'published');
        if (published.length > 0) setPosts(published.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];
  const ar = lang === 'ar';

  return (
    <section id="blog" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{lbl.title}</h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="flex flex-wrap justify-center gap-8"
      >
        {posts.map((post, idx) => {
          const displayCategory = ar ? post.category : (post.categoryEn || post.category);
          const displayTitle    = ar ? post.title    : (post.titleEn    || post.title);
          const displayDesc     = ar ? post.desc     : (post.descEn     || post.desc);
          const displayTime     = ar ? post.time     : (post.timeEn     || post.time);
          const displayDate     = formatDate(post.date, ar);
          return (
            <TiltCard
              key={post.id ?? idx}
              variants={fadeUp}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] flex flex-col bg-white dark:bg-[#111827] border border-gray-200 dark:border-brand-gray/15 rounded-2xl overflow-hidden group hover:border-gray-400 dark:hover:border-brand-gray/40 transition-[transform,border-color] duration-300 hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              <div className={`h-48 w-full bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-[background-color] duration-300"></div>
                <span aria-hidden="true" className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-500">
                  <DynamicIcon emoji={post.icon} size={40} />
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div>
                  <span className="inline-block font-mono text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded mb-4 uppercase tracking-wider">
                    {displayCategory}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-brand-gray transition-colors leading-snug">
                    {displayTitle}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {displayDesc}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 font-mono">
                    {displayTime && <><span aria-hidden="true">⏱️</span><span>{displayTime}</span></>}
                    {displayTime && displayDate && <span>·</span>}
                    {displayDate && <span>{displayDate}</span>}
                  </div>
                  <span className={`text-sm font-bold text-gray-700 dark:text-brand-gray md:opacity-0 md:group-hover:opacity-100 transition-[transform,opacity] duration-300 ${ar ? 'md:-translate-x-2 md:group-hover:translate-x-0' : 'md:translate-x-2 md:group-hover:translate-x-0'}`}>
                    {lbl.readMore} {ar ? '←' : '→'}
                  </span>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Blog;
