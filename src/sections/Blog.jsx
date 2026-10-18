import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { apiGetPosts } from '../services/api';
import { fadeUp, staggerContainer } from '../utils/motion';
import DynamicIcon from '../components/DynamicIcon';
import TiltCard from '../components/TiltCard';
import { readingMinutes, deriveExcerpt } from '../utils/articleText';
import { safeImg } from '../utils/safeUrl';

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

const FALLBACK = [];

const formatDate = (dateStr, ar) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

const fromApi = (p, idx) => {
  const style = CARD_STYLES[idx % CARD_STYLES.length];
  const dateStr = p.published_at ?? p.date ?? p.created_at ?? '';
  const contentAr = p.content ?? '';
  const contentEn = p.content_en ?? p.content ?? '';
  return {
    id:         p.id,
    // The single-post route keys on the slug; without one the card has nowhere
    // to go, so it renders as plain text rather than a broken link.
    slug:       p.slug ?? '',
    title:      p.title       ?? '',
    titleEn:    p.title_en    ?? p.title ?? '',
    // Every post currently published leaves the excerpt empty, which used to
    // render the card with a blank body. Fall back to the opening prose.
    desc:       deriveExcerpt(p.excerpt,    contentAr),
    descEn:     deriveExcerpt(p.excerpt_en ?? p.excerpt, contentEn),
    // There is no reading_time column — estimate it from the body instead of
    // leaving the slot empty.
    minutes:    readingMinutes(contentAr, true),
    minutesEn:  readingMinutes(contentEn, false),
    views:      Number(p.views) || 0,
    date:       dateStr,
    image:      safeImg(p.image_url),
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

  // Nothing real to show yet — keep the anchor target, show no content.
  if (posts.length === 0) return <section id="blog" />;

  return (
    // داكن دائماً، كالمشاريع والشهادات: إخفاء الشهادات يترك المنهجية والمدونة
    // والتواصل ثلاثة أقسام فاتحة متتالية، وهو أطول تتابع رتيب يبقى على الصفحة.
    <section id="blog" data-header="dark" className="relative py-24 px-6 overflow-hidden z-10" style={{ backgroundColor: '#0a0f1e' }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[60%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 100% at 50% 0%, rgba(26,127,255,0.10), transparent 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">{lbl.title}</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="flex flex-wrap justify-center gap-8"
      >
        {posts.map((post, idx) => {
          const displayTitle = ar ? post.title : (post.titleEn || post.title);
          const displayDesc  = ar ? post.desc  : (post.descEn  || post.desc);
          const minutes      = ar ? post.minutes : (post.minutesEn || post.minutes);
          const displayDate  = formatDate(post.date, ar);
          const Arrow        = ar ? ArrowLeft : ArrowRight;

          const card = (
            <>
              <div className={`h-48 w-full bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                {post.image ? (
                  <img src={post.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-[background-color] duration-300" />
                    <span aria-hidden="true" className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-500">
                      <DynamicIcon emoji={post.icon} size={40} />
                    </span>
                  </>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors ltr:leading-snug rtl:leading-[1.5]">
                  {displayTitle}
                </h3>
                {displayDesc && (
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {displayDesc}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    {displayDate && <span>{displayDate}</span>}
                    {minutes > 0 && (
                      <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />{minutes}{ar ? ' د' : 'm'}</span>
                    )}
                    {post.views > 0 && (
                      <span className="inline-flex items-center gap-1"><Eye size={12} aria-hidden="true" />{post.views}</span>
                    )}
                  </div>
                  {post.slug && (
                    <span className={`shrink-0 inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 transition-[transform,opacity] duration-300 md:opacity-0 md:group-hover:opacity-100 ${ar ? 'md:translate-x-2 md:group-hover:translate-x-0' : 'md:-translate-x-2 md:group-hover:translate-x-0'}`}>
                      {lbl.readMore}
                      <Arrow size={14} aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            </>
          );

          // The card used to carry cursor-pointer and a "Read more" affordance
          // with no handler and no href at all — it looked clickable and did
          // nothing. It is a real <a> rather than a role="link" div because an
          // article has to be crawlable. A post with no slug renders as a plain
          // card instead of pretending to be a link.
          const shell = 'grow basis-[320px] max-w-[400px] flex';
          const inner = 'w-full flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-[transform,border-color] duration-300';

          if (!post.slug) {
            return (
              <TiltCard key={post.id ?? idx} variants={fadeUp} className={`${shell} ${inner} group`}>
                {card}
              </TiltCard>
            );
          }

          return (
            <Link
              key={post.id ?? idx}
              to={`/blog/${post.slug}`}
              className={`${shell} group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0b1120]`}
            >
              <TiltCard
                variants={fadeUp}
                className={`${inner} group-hover:border-blue-400 dark:group-hover:border-blue-500/40 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
              >
                {card}
              </TiltCard>
            </Link>
          );
        })}
      </motion.div>
      </div>
    </section>
  );
};

export default Blog;
