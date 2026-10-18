import { useState, useEffect, Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import NoIndex from '../components/NoIndex';
import { useLang } from '../context/LangContext';
import { apiGetPost } from '../services/api';
import { parseArticle, parseInline, readingMinutes, deriveExcerpt } from '../utils/articleText';
import { EASE_EXPO } from '../utils/motion';
import { safeImg } from '../utils/safeUrl';

// Lazy: keeps the footer out of this page's first load.
const Footer = lazyWithRetry(() => import('../components/Footer'));

const LABELS = {
  ar: {
    back: 'كل المقالات', loading: 'جاري التحميل...',
    notFound: 'لم نعثر على هذا المقال', notFoundSub: 'ربما حُذف أو تغيّر رابطه.',
    views: 'مشاهدة', minutes: 'دقائق قراءة', empty: 'هذا المقال بلا محتوى منشور بعد.',
  },
  en: {
    back: 'All articles', loading: 'Loading...',
    notFound: 'We could not find this article', notFoundSub: 'It may have been removed, or its link changed.',
    views: 'views', minutes: 'min read', empty: 'This article has no published body yet.',
  },
};

const setMeta = (selector, value, create) => {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

// Inline runs share one renderer so a heading, a paragraph, a list item and a
// quote all support `code` and **bold** identically.
const Inline = ({ text }) => (
  <>
    {parseInline(text).map((run, i) =>
      run.code ? (
        <code key={i} dir="ltr" className="font-english text-[0.9em] bg-gray-100 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 mx-0.5 text-blue-700 dark:text-blue-300">
          {run.text}
        </code>
      ) : run.bold ? (
        <strong key={i} className="font-bold text-gray-900 dark:text-white">{run.text}</strong>
      ) : (
        <span key={i}>{run.text}</span>
      )
    )}
  </>
);

const Block = ({ block, ar }) => {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4"><Inline text={block.text} /></h2>;
    case 'h3':
      return <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-3"><Inline text={block.text} /></h3>;
    case 'quote':
      return (
        <blockquote className={`my-6 py-2 text-gray-700 dark:text-slate-300 italic border-blue-500 ${ar ? 'border-r-2 pr-5' : 'border-l-2 pl-5'}`}>
          <Inline text={block.text} />
        </blockquote>
      );
    case 'code':
      return (
        <pre dir="ltr" className="my-6 overflow-x-auto bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left">
          <code className="font-english text-[13px] leading-relaxed text-gray-800 dark:text-slate-300 whitespace-pre">{block.text}</code>
        </pre>
      );
    case 'table':
      return (
        <div className="my-6 -mx-6 px-6 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm border-collapse">
            {block.head && (
              <thead>
                <tr>
                  {block.head.map((cell, i) => (
                    <th key={i} className={`border-b-2 border-gray-300 dark:border-white/20 py-2.5 px-3 font-bold text-gray-900 dark:text-white ${ar ? 'text-right' : 'text-left'}`}>
                      <Inline text={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-gray-200 dark:border-white/10">
                  {row.map((cell, c) => (
                    <td key={c} className={`py-2.5 px-3 text-gray-700 dark:text-slate-300 align-top ${ar ? 'text-right' : 'text-left'}`}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'ul': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`my-5 space-y-2 marker:text-blue-500 ${ar ? 'pr-5' : 'pl-5'} ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item, i) => (
            <li key={i} className="text-gray-700 dark:text-slate-300 leading-relaxed"><Inline text={item} /></li>
          ))}
        </Tag>
      );
    }
    default:
      return <p className="text-gray-700 dark:text-slate-300 leading-[1.9] my-5"><Inline text={block.text} /></p>;
  }
};

const ArticleDetails = () => {
  const { slug } = useParams();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reset while rendering the new slug rather than inside the effect, so the
  // page never shows the previous article under a "loaded" state for a frame.
  const [renderedSlug, setRenderedSlug] = useState(slug);
  if (renderedSlug !== slug) {
    setRenderedSlug(slug);
    setPost(null);
    setLoading(true);
    setNotFound(false);
  }

  useEffect(() => {
    // Moving between articles quickly leaves more than one request in flight;
    // without this guard a slower earlier response could land last.
    let active = true;
    window.scrollTo(0, 0);
    apiGetPost(slug)
      .then(res => {
        if (!active) return;
        const data = res.data ?? res;
        if (data && data.id) setPost({ ...data, image_url: safeImg(data.image_url) }); else setNotFound(true);
      })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const title   = post ? (ar ? post.title : (post.title_en || post.title)) : '';
  const body    = post ? (ar ? post.content : (post.content_en || post.content)) : '';
  const excerpt = post ? deriveExcerpt(ar ? post.excerpt : (post.excerpt_en || post.excerpt), body) : '';

  useEffect(() => {
    if (!title) return;
    document.title = title;
    setMeta('meta[name="description"]', excerpt, () => {
      const el = document.createElement('meta'); el.setAttribute('name', 'description'); return el;
    });
    setMeta('meta[property="og:title"]', title, () => {
      const el = document.createElement('meta'); el.setAttribute('property', 'og:title'); return el;
    });
    setMeta('meta[property="og:description"]', excerpt, () => {
      const el = document.createElement('meta'); el.setAttribute('property', 'og:description'); return el;
    });
    // The preview image a link shows in WhatsApp, Facebook and X. Without it a
    // shared article is a bare title — and the site has no default og:image set.
    setMeta('meta[property="og:image"]', post?.image_url, () => {
      const el = document.createElement('meta'); el.setAttribute('property', 'og:image'); return el;
    });
  }, [title, excerpt, post?.image_url]);

  const BackArrow = ar ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 px-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4" aria-label={lbl.loading}>
            <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="h-9 w-4/5 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="h-9 w-3/5 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="h-3 w-40 bg-gray-200 dark:bg-white/10 rounded mt-8" />
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-white/10 rounded" style={{ width: `${95 - i * 4}%` }} />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <NoIndex />
        <Navbar />
        <main className="min-h-screen pt-32 px-6 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">{lbl.notFound}</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-8">{lbl.notFoundSub}</p>
          <Link to="/#blog" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <BackArrow size={16} />
            {lbl.back}
          </Link>
        </main>
        <Suspense fallback={null}><Footer /></Suspense>
      </>
    );
  }

  const blocks  = parseArticle(body);
  const minutes = readingMinutes(body, ar);
  const dateStr = post.created_at
    ? new Date(post.created_at).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24">
        {/* A dark band behind the title keeps the article opening consistent with
            the hero and the project pages instead of starting on bare white. */}
        <div data-header="dark" className="relative overflow-hidden pt-32 pb-12 px-6" style={{ backgroundColor: '#050810' }}>
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(26,127,255,0.14), transparent 70%)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
            className="relative max-w-3xl mx-auto"
          >
            <Link to="/#blog" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
              <BackArrow size={16} />
              {lbl.back}
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold text-white ltr:leading-snug rtl:leading-[1.5] tracking-tight mb-5">{title}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-mono">
              {dateStr && <span className="inline-flex items-center gap-1.5"><Calendar size={13} />{dateStr}</span>}
              {minutes > 0 && <span className="inline-flex items-center gap-1.5"><Clock size={13} />{minutes} {lbl.minutes}</span>}
              {post.views > 0 && <span className="inline-flex items-center gap-1.5"><Eye size={13} />{post.views} {lbl.views}</span>}
            </div>
          </motion.div>
        </div>

        {post.image_url && (
          <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
            <img
              src={post.image_url}
              alt={title}
              loading="lazy"
              className="w-full rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg"
            />
          </div>
        )}

        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto px-6 pt-12 text-[17px]"
        >
          {blocks.length > 0
            ? blocks.map((block, i) => <Block key={i} block={block} ar={ar} />)
            : <p className="text-gray-500 dark:text-slate-500 italic">{lbl.empty}</p>}

          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10">
            <Link to="/#blog" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <BackArrow size={16} />
              {lbl.back}
            </Link>
          </div>
        </motion.article>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
    </>
  );
};

export default ArticleDetails;
