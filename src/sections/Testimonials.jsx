import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { apiGetTestimonials } from '../services/api';
import TiltCard from '../components/TiltCard';
import { EASE_EXPO } from '../utils/motion';

const LABELS = {
  ar: { title: 'ماذا يقول عملاؤنا', sub: 'ثقة عملائنا هي أعظم إنجازاتنا — آراء حقيقية من شركاء نجاحنا.' },
  en: { title: 'What Our Clients Say', sub: "Our clients' trust is our greatest achievement — real opinions from our success partners." },
};

const CARD_COLORS = [
  'from-blue-600 to-blue-400',
  'from-purple-600 to-purple-400',
  'from-green-600 to-green-400',
  'from-red-600 to-red-400',
  'from-orange-600 to-orange-400',
  'from-cyan-600 to-cyan-400',
];

const FALLBACK = [];

const getInitials = (name = '') => name.trim().split(' ').slice(0, 2).map(w => w[0] ?? '').join('');

const fromApi = (t, idx) => ({
  name:    t.name        ?? '',
  nameEn:  t.name_en     ?? t.name ?? '',
  role:    t.position    ?? t.role ?? '',
  roleEn:  t.position_en ?? t.role_en ?? t.position ?? t.role ?? '',
  text:    t.text        ?? t.review ?? t.message ?? '',
  textEn:  t.text_en     ?? t.review_en ?? t.text ?? t.review ?? '',
  color:   CARD_COLORS[idx % CARD_COLORS.length],
});

const Testimonials = () => {
  const { lang } = useLang();
  const [reviews, setReviews] = useState(FALLBACK);

  useEffect(() => {
    apiGetTestimonials()
      .then(res => {
        const active = (res.data ?? []).filter(t => t.is_active !== false && t.is_active !== 0);
        if (active.length > 0) setReviews(active.map(fromApi));
      })
      .catch(() => {});
  }, []);

  const lbl = LABELS[lang];

  // Nothing real to show yet — keep the anchor target, show no content.
  if (reviews.length === 0) return <section id="testimonials" />;

  return (
    <section id="testimonials" data-header="dark" className="relative z-10 py-24 overflow-hidden" style={{ backgroundColor: '#0a0f1e' }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[60%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 100% at 50% 0%, rgba(26,127,255,0.10), transparent 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center flex flex-col items-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">{lbl.title}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{lbl.sub}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {reviews.map((review, idx) => {
            const displayName = lang === 'ar' ? review.name : (review.nameEn || review.name);
            const displayRole = lang === 'ar' ? review.role : (review.roleEn || review.role);
            const displayText = lang === 'ar' ? review.text : (review.textEn || review.text);
            return (
              <TiltCard
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: EASE_EXPO }}
                className="grow basis-[320px] max-w-[400px] bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/25 transition-[transform,border-color] duration-300 hover:-translate-y-1 relative shadow-sm dark:shadow-none"
              >
                <div className="absolute top-6 left-6 text-6xl text-white/10 font-serif leading-none rotate-180">"</div>
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: idx * 0.15 + i * 0.06 }}
                    >
                      <Star size={14} className="fill-yellow-400" />
                    </motion.span>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-8 relative z-10 text-sm">
                  "{displayText}"
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center font-bold text-white shadow-lg text-sm`}>
                    {getInitials(displayName) || '؟'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{displayName}</div>
                    <div className="text-xs text-slate-400">{displayRole}</div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
