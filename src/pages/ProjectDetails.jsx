import { useState, useEffect, Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import NoIndex from '../components/NoIndex';
import ProjectGallery from '../components/ProjectGallery';
import VideoEmbed from '../components/VideoEmbed';
import { useLang } from '../context/LangContext';
import { apiGetProject } from '../services/api';
import { fromApiProject, valueDir } from '../utils/project';
import { WORK_KINDS, kindOf, isCreative, projectLinks } from '../utils/workKinds';
import { EASE_EXPO } from '../utils/motion';

// Lazy: keeps the footer out of this page's first load (ProjectDetails in
// particular ships in the main bundle).
const Footer = lazyWithRetry(() => import('../components/Footer'));

const LABELS = {
  ar: {
    back: 'كل الأعمال', loading: 'جاري التحميل...', notFound: 'لم نعثر على هذا العمل',
    notFoundSub: 'ربما حُذف أو تغيّر رابطه.', tech: 'التقنيات المستخدمة',
    expand: 'عرض بملء الشاشة', tools: 'الأدوات المستخدمة', equipment: 'المعدات والتقنيات', results: 'النتائج', feed: 'من الحساب', stills: 'لقطات من العمل',
  },
  en: {
    back: 'All work', loading: 'Loading...', notFound: 'We could not find this work',
    notFoundSub: 'It may have been removed, or its link changed.', tech: 'Built with',
    expand: 'View full screen', tools: 'Tools used', equipment: 'Equipment & technology', results: 'Results', feed: 'From the account', stills: 'Stills',
  },
};

const setMeta = (selector, attr, value, create) => {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Reset while rendering the new id rather than from inside the effect, so the
  // page never shows the previous project under a "loaded" state for a frame.
  const [renderedId, setRenderedId] = useState(id);
  if (renderedId !== id) {
    setRenderedId(id);
    setProject(null);
    setLoading(true);
    setNotFound(false);
    setSlide(0);
  }

  useEffect(() => {
    // Moving between projects quickly leaves more than one request in flight;
    // without this guard a slower earlier response could land last.
    let active = true;

    apiGetProject(id)
      .then(res => {
        if (!active) return;
        const raw = res.data ?? res;
        if (!raw || !raw.id) { setNotFound(true); return; }
        setProject(fromApiProject(raw));
      })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id]);

  // The whole point of a dedicated page is that search engines and link
  // previews can see it, so publish the project's own title/description/image.
  useEffect(() => {
    if (!project) return;
    const title = ar ? project.title : (project.titleEn || project.title);
    const desc = ar ? project.desc : (project.descEn || project.desc);

    document.title = title;
    setMeta('meta[name="description"]', 'content', desc,
      () => Object.assign(document.createElement('meta'), { name: 'description' }));
    setMeta('meta[property="og:title"]', 'content', title,
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m; });
    setMeta('meta[property="og:description"]', 'content', desc,
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m; });
    setMeta('meta[property="og:image"]', 'content', project.images[0] || project.image,
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:image'); return m; });
  }, [project, ar]);

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-slate-400">
        <span className="text-sm">{lbl.loading}</span>
      </div>
    </>
  );

  if (notFound || !project) return (
    <>
      <NoIndex />
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lbl.notFound}</h1>
        <p className="text-gray-600 dark:text-slate-400 mb-8">{lbl.notFoundSub}</p>
        <Link to="/#portfolio" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold no-underline transition-colors">
          {ar ? <ArrowRight size={18} aria-hidden="true" /> : <ArrowLeft size={18} aria-hidden="true" />}
          {lbl.back}
        </Link>
      </div>
      <Suspense fallback={null}><Footer /></Suspense>
    </>
  );

  const kind = kindOf(project.type);
  const isMobileApp = kind === 'mobile';
  const { Icon: KindIcon } = WORK_KINDS[kind];
  const title = ar ? project.title : (project.titleEn || project.title);
  const desc = ar ? project.desc : (project.descEn || project.desc);
  const body = ar ? project.body : (project.bodyEn || project.body);
  const category = ar ? project.category : (project.categoryEn || project.category);
  const images = project.images;
  const links = projectLinks(project, lang);
  const openAt = (i) => { setSlide(i); setFullscreen(true); };

  // Creative work is shown as itself rather than in the software slider:
  //  • design — every piece at its own proportions (a masonry of posters);
  //  • motion — the video first, then stills if any were added;
  //  • social — the results, then the posts as the account's grid.
  const masonry = (list) => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {list.map((src, i) => (
        <button key={src} type="button" onClick={() => openAt(images.indexOf(src))} aria-label={lbl.expand}
          className="group relative block w-full mb-4 break-inside-avoid rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 cursor-zoom-in bg-gray-100 dark:bg-[#0a0f1e]">
          <img src={src} alt="" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]" />
        </button>
      ))}
    </div>
  );

  const creativeMedia = (() => {
    if (kind === 'motion') {
      const stills = images.length > 1 ? images : [];
      return (
        <>
          <VideoEmbed video={project.video} poster={project.image} title={title} className="mb-10" />
          {stills.length > 0 && (
            <section className="mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase ltr:tracking-wider mb-4">{lbl.stills}</h2>
              {masonry(stills)}
            </section>
          )}
        </>
      );
    }
    if (kind === 'social') {
      return (
        <>
          {project.results.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase ltr:tracking-wider mb-4">{lbl.results}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.results.map(r => (
                  <div key={r.label} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-5">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-english" dir={valueDir(r.value)}>{r.value}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">{ar ? r.label : (r.labelEn || r.label)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {images.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase ltr:tracking-wider mb-4">{lbl.feed}</h2>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-3xl">
                {images.map((src, i) => (
                  <button key={src} type="button" onClick={() => openAt(i)} aria-label={lbl.expand}
                    className="group relative aspect-square overflow-hidden rounded-md sm:rounded-lg cursor-zoom-in bg-gray-100 dark:bg-[#0a0f1e]">
                    <img src={src} alt="" loading={i < 6 ? 'eager' : 'lazy'} decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      );
    }
    return images.length > 0 ? masonry(images) : null;
  })();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/#portfolio" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white no-underline mb-8 transition-colors">
            {ar ? <ArrowRight size={16} aria-hidden="true" /> : <ArrowLeft size={16} aria-hidden="true" />}
            {lbl.back}
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-brand-gray bg-gray-100 dark:bg-brand-gray/10 px-2.5 py-1 rounded mb-4">
              <KindIcon size={12} aria-hidden="true" />
              {category || (ar ? WORK_KINDS[kind].ar : WORK_KINDS[kind].en)}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight ltr:leading-tight rtl:leading-[1.45] text-gray-900 dark:text-white mb-4">{title}</h1>
            {desc && <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-3xl">{desc}</p>}
          </motion.header>

          {isCreative(kind) && creativeMedia && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
              className="mb-12"
            >
              {creativeMedia}
            </motion.div>
          )}

          {/* اللقطات — أفقية للويب، وداخل إطار هاتف للتطبيقات */}
          {!isCreative(kind) && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
              className="mb-12"
            >
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                aria-label={lbl.expand}
                className={`group relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 cursor-zoom-in ${isMobileApp ? 'bg-gradient-to-br from-gray-900 to-gray-800 py-8 flex justify-center' : 'bg-gray-100 dark:bg-[#0a0f1e]'}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={images[slide]}
                    src={images[slide]}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={isMobileApp ? 'max-h-[70vh] w-auto rounded-2xl shadow-2xl' : 'w-full max-h-[70vh] object-contain'}
                  />
                </AnimatePresence>
                <span className="absolute top-3 end-3 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={16} aria-hidden="true" />
                </span>
              </button>

              {images.length > 1 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSlide(i)}
                      aria-current={i === slide}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === slide ? 'border-blue-500' : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'}`}
                    >
                      <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {body && (
            <div className="prose-none max-w-3xl mb-12">
              {body.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">{para}</p>
              ))}
            </div>
          )}

          {project.stack.length > 0 && (
            <section className="mb-12">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase ltr:tracking-wider mb-4">{kind === 'infra' ? lbl.equipment : isCreative(kind) ? lbl.tools : lbl.tech}</h2>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} dir="auto" className="text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-brand-gray/15">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold no-underline transition-colors"
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>

      {/* الصور بملء الشاشة — نفس مكوّن المعرض المستخدم سابقاً */}
      <AnimatePresence>
        {fullscreen && (
          <ProjectGallery
            project={project}
            index={slide}
            onIndex={setSlide}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectDetails;
