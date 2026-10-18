import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { apiGetProjects } from '../services/api';
import TiltCard from '../components/TiltCard';
import { fadeUp, staggerContainer } from '../utils/motion';
import { fromApiProject, valueDir } from '../utils/project';
import { WORK_KINDS, WORK_TABS, kindOf } from '../utils/workKinds';
import { PORTFOLIO_TAB_EVENT, takePendingTab } from '../utils/portfolioTab';

const LABELS = {
  ar: {
    title: 'أعمالنا',
    sub: 'برمجيات وتصاميم ومحتوى سلّمناه لعملائنا — اضغط أي عمل لاستعراض تفاصيله.',
    view: 'استعراض العمل',
    featured: 'أحدث عمل',
    filter: 'تصفية الأعمال',
  },
  en: {
    title: 'Our Work',
    sub: 'Software, design and content we have delivered — open any piece to see the detail.',
    view: 'View the work',
    featured: 'Latest work',
    filter: 'Filter work',
  },
};

const FALLBACK = [];

// Tech tags are the noisiest thing on a card: this project alone carries seven,
// which wrapped onto three lines and pushed everything else down. Show a few
// and count the rest.
const TAGS_ON_CARD = 4;

const kindLabel = (project, ar) => {
  const k = WORK_KINDS[kindOf(project.type)];
  return (ar ? project.category : (project.categoryEn || project.category)) || (ar ? k.ar : k.en);
};

// ── Frames for software ───────────────────────────────────────────────────────
// A plain screenshot floating on a background reads as an image file. Framing
// it in browser chrome reads as a product — and it costs one small bar.
const BrowserFrame = ({ src, alt = '', priority = false }) => (
  <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1428] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/[0.06] border-b border-white/10">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
    </div>
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className="w-full block"
    />
  </div>
);

// The frame takes the screenshot's own proportions once it loads. Phones differ
// (9:16, 9:19.5, 9:20…), and a fixed shape cropped the bottom of shorter
// screens — often exactly where an app keeps its controls. Callers set the
// height; the width follows the image.
const PhoneFrame = ({ src, alt = '', className = '', eager = false }) => {
  const [ratio, setRatio] = useState(9 / 19.5);
  return (
    <div
      className={`relative mx-auto shrink-0 rounded-[2rem] border-[6px] border-gray-800 bg-gray-900 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.55)] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={(e) => { const { naturalWidth: w, naturalHeight: h } = e.currentTarget; if (w && h) setRatio(w / h); }}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
};

// The generated artwork, still used when a project has no screenshot yet.
const PlaceholderArt = ({ color }) => (
  <svg viewBox="0 0 120 80" aria-hidden="true" className="w-32 opacity-50">
    <rect x="10" y="10" width="100" height="60" rx="8" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />
    <circle cx="60" cy="40" r="15" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
    <line x1="10" y1="40" x2="45" y2="40" stroke={color} strokeWidth="1" opacity="0.5" />
    <line x1="75" y1="40" x2="110" y2="40" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

// ── Pieces for creative work ──────────────────────────────────────────────────
const PlayMark = ({ big = false }) => (
  <span aria-hidden="true" className={`relative flex items-center justify-center rounded-full bg-white/95 text-[#0158B0] shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110 ${big ? 'w-20 h-20' : 'w-14 h-14'}`}>
    <Play size={big ? 28 : 22} className="ml-1" fill="currentColor" />
  </span>
);

// A managed account is shown the way its audience sees it: a grid of posts.
const PostGrid = ({ images, cells }) => (
  <div className={`grid grid-cols-3 gap-0.5 w-full h-full ${cells === 6 ? 'grid-rows-2' : 'grid-rows-1'}`}>
    {images.slice(0, cells).map(src => (
      <img key={src} src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
    ))}
  </div>
);

const Results = ({ results, ar, limit = 3 }) => (
  <div className="flex flex-wrap gap-x-8 gap-y-4">
    {results.slice(0, limit).map(r => (
      <div key={r.label}>
        <div className="text-2xl md:text-3xl font-bold text-white font-english" dir={valueDir(r.value)}>{r.value}</div>
        <div className="text-xs text-slate-400 mt-1">{ar ? r.label : (r.labelEn || r.label)}</div>
      </div>
    ))}
  </div>
);

const KindBadge = ({ type, label }) => {
  const { Icon } = WORK_KINDS[kindOf(type)];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded">
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
};

const TechTags = ({ stack }) => {
  // dir="auto" on each tag: it takes its direction from its own text, so
  // "6 TB storage" is not reordered to "TB storage 6" inside the Arabic page.
  const shown = stack.slice(0, TAGS_ON_CARD);
  const rest = stack.length - shown.length;
  return (
    <div className="flex flex-wrap gap-2">
      {shown.map(tech => (
        <span key={tech} dir="auto" className="text-xs text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/10">
          {tech}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-xs text-slate-400 px-2.5 py-1">+{rest}</span>
      )}
    </div>
  );
};

// ── The large visual of the featured piece, per kind ──────────────────────────
const FeaturedMedia = ({ project }) => {
  const kind = kindOf(project.type);
  const { image, images } = project;

  if (kind === 'motion') {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0158B0]/40 to-[#050810]">
        {image && <img src={image} alt="" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
        <span aria-hidden="true" className="absolute inset-0 bg-black/20" />
        <PlayMark big />
      </div>
    );
  }

  if (kind === 'social' && images.length >= 3) {
    const cells = images.length >= 9 ? 9 : images.length >= 6 ? 6 : 3;
    return (
      <div className="max-w-[440px] mx-auto rounded-2xl border border-white/10 bg-[#0d1428] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 px-1 pb-3">
          <img src={images[0]} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
          <div className="flex-1 space-y-1.5" aria-hidden="true">
            <div className="h-2 w-28 rounded bg-white/25" />
            <div className="h-2 w-16 rounded bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
          {images.slice(0, cells).map(src => (
            <img key={src} src={src} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
          ))}
        </div>
      </div>
    );
  }

  if ((kind === 'design' || kind === 'infra') && images.length >= 3) {
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-2 aspect-[16/11]">
        {images.slice(0, 3).map((src, i) => (
          <img key={src} src={src} alt="" loading={i ? 'lazy' : 'eager'} decoding="async"
            className={`w-full h-full object-cover rounded-xl border border-white/10 ${i === 0 ? 'col-span-2 row-span-2' : ''}`} />
        ))}
      </div>
    );
  }

  if (image) {
    // An app is shown tall and readable: its main screen, and a second screen
    // tucked behind it when there is one.
    if (kind === 'mobile') {
      const second = images.find(src => src !== image);
      return (
        <div className="flex items-center justify-center py-2">
          {/* On phones there is room for one handset only; the second would push
              the card wider than the screen. */}
          {second && <PhoneFrame eager src={second} className="hidden sm:block h-[440px] -me-16 opacity-90 translate-y-6" />}
          <PhoneFrame eager src={image} className="relative z-10 h-[440px] sm:h-[540px] max-w-full" />
        </div>
      );
    }
    if (kind === 'web') return <BrowserFrame src={image} priority />;
    // A single poster or post: shown as itself, whole.
    return <img src={image} alt="" loading="eager" decoding="async" className="w-full max-h-[520px] object-contain rounded-xl border border-white/10 bg-[#0d1428]" />;
  }

  return (
    <div className={`aspect-[16/10] rounded-xl border border-white/10 flex items-center justify-center bg-gradient-to-br ${project.thumbGradient}`}>
      <PlaceholderArt color={project.strokeColor} />
    </div>
  );
};

// ── The h-48 visual on a grid card, per kind ──────────────────────────────────
const CardMedia = ({ project }) => {
  const kind = kindOf(project.type);
  const { image, images } = project;

  if (kind === 'social' && images.length >= 3) return <PostGrid images={images} cells={images.length >= 6 ? 6 : 3} />;

  if (kind === 'motion') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0158B0]/40 to-[#050810]">
        {image && <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <span className="relative z-20"><PlayMark /></span>
      </div>
    );
  }

  if (!image) return <PlaceholderArt color={project.strokeColor} />;

  if (kind === 'mobile') {
    return (
      <PhoneFrame src={image} className="h-[400px] rounded-[1.75rem] group-hover:-translate-y-1 transition-transform duration-500" />
    );
  }

  // Screenshots are read from the top; posters and posts from the middle.
  return (
    <img src={image} alt="" loading="lazy" decoding="async"
      className={`w-full h-full object-cover ${kind === 'web' ? 'object-top' : 'object-center'} group-hover:scale-105 transition-transform duration-700`} />
  );
};

// ── The featured card: the newest piece of a group, full width ───────────────
const FeaturedCard = ({ project, ar, lbl, open }) => {
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const title = ar ? project.title : (project.titleEn || project.title);
  const desc = ar ? project.desc : (project.descEn || project.desc);
  const isSocial = kindOf(project.type) === 'social';
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => open(project.id)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); open(project.id); } }}
      className="group grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center cursor-pointer rounded-3xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors p-6 sm:p-8 lg:p-10"
    >
      {/* min-w-0: a grid item otherwise grows to its widest child, and wide
          media would push the whole card past the screen edge. */}
      <div className="min-w-0 transition-transform duration-700 group-hover:-translate-y-1.5">
        <FeaturedMedia project={project} />
      </div>

      <div className="min-w-0 flex flex-col items-start text-start">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="font-mono text-[11px] rtl:text-xs uppercase ltr:tracking-[0.18em]" style={{ color: '#1a7fff' }}>
            {lbl.featured}
          </span>
          <KindBadge type={project.type} label={kindLabel(project, ar)} />
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 ltr:leading-snug rtl:leading-[1.5]">{title}</h3>

        {desc && <p className="text-slate-300 leading-relaxed mb-7 max-w-xl">{desc}</p>}

        {isSocial && project.results.length > 0 ? (
          <div className="mb-8"><Results results={project.results} ar={ar} /></div>
        ) : project.stack.length > 0 && (
          <div className="mb-8"><TechTags stack={project.stack} /></div>
        )}

        <span className="inline-flex items-center gap-2 text-white font-semibold border-b-2 border-transparent group-hover:border-white/60 transition-colors pb-0.5">
          {lbl.view}
          <Arrow size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  );
};

// ── A regular card ────────────────────────────────────────────────────────────
// App cards are tall: a phone screen is portrait, and squeezing it into the
// 192px band the other cards use left it unreadable.
const WorkCard = ({ project, ar, lbl, open }) => {
  const kind = kindOf(project.type);
  const isApp = kind === 'mobile';
  const title = ar ? project.title : (project.titleEn || project.title);
  const desc = ar ? project.desc : (project.descEn || project.desc);
  const darkBg = project.image && !isApp;
  return (
    <TiltCard
      variants={fadeUp}
      onClick={() => open(project.id)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); open(project.id); } }}
      className={`relative grow ${isApp ? 'basis-[280px] max-w-[360px]' : 'basis-[340px] max-w-[440px]'} rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 overflow-hidden group transition-[transform,border-color] duration-300 hover:-translate-y-2 cursor-pointer`}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-1 z-20 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: project.strokeColor }}
      />
      <div className={`${isApp ? 'h-[440px] items-center' : 'h-48 items-end'} w-full relative overflow-hidden flex justify-center ${darkBg ? 'bg-[#0d1428]' : `bg-gradient-to-br ${project.thumbGradient}`}`}>
        <CardMedia project={project} />
        {!isApp && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1e]/80 z-10 pointer-events-none" />}
      </div>

      <div className="p-6">
        <div className="mb-3">
          <KindBadge type={project.type} label={kindLabel(project, ar)} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">{desc}</p>
        {kind === 'social' && project.results.length > 0
          ? <Results results={project.results} ar={ar} limit={2} />
          : project.stack.length > 0 && <TechTags stack={project.stack} />}
        <div className="mt-5 pt-4 border-t border-white/5">
          <span className="text-sm font-semibold text-white/90 group-hover:underline">
            {lbl.view} {ar ? '←' : '→'}
          </span>
        </div>
      </div>
    </TiltCard>
  );
};

// ── One category: its newest piece featured, the rest as cards ───────────────
const WorkGroup = ({ items, ar, lbl, open }) => {
  const [featured, ...rest] = items;
  return (
    <>
      <FeaturedCard project={featured} ar={ar} lbl={lbl} open={open} />
      {rest.length > 0 && (
        <motion.div
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-6 mt-8"
        >
          {rest.map(p => <WorkCard key={p.id} project={p} ar={ar} lbl={lbl} open={open} />)}
        </motion.div>
      )}
    </>
  );
};

const Portfolio = () => {
  const { lang } = useLang();
  const [projects, setProjects] = useState(FALLBACK);
  // A service card may have asked for a tab before this section mounted.
  const [tab, setTab] = useState(() => takePendingTab() ?? 'all');
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];

  useEffect(() => {
    apiGetProjects()
      .then(res => {
        const active = (res.data ?? []).filter(p => !p.status || p.status === 'active');
        // Newest first: the API lists oldest first, and the featured slot is
        // labelled "latest work". Newer rows have higher ids.
        const newest = [...active].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        if (newest.length > 0) setProjects(newest.map(fromApiProject));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onTab = (e) => { takePendingTab(); setTab(e.detail); };
    window.addEventListener(PORTFOLIO_TAB_EVENT, onTab);
    return () => window.removeEventListener(PORTFOLIO_TAB_EVENT, onTab);
  }, []);

  // Nothing real to show yet — keep the anchor target, show no content.
  if (projects.length === 0) return <section id="portfolio" />;

  const open = (id) => navigate(`/projects/${id}`);

  // Tabs only for the kinds that have work in them, and no tab bar at all
  // while everything is one kind.
  const tabOf = (p) => WORK_KINDS[kindOf(p.type)].tab;
  const present = new Set(projects.map(tabOf));
  const tabs = WORK_TABS.filter(t => t.key === 'all' || present.has(t.key));
  const current = present.has(tab) ? tab : 'all';

  // "All" shows every category as its own group, in tab order, each under a
  // heading — websites together, apps together — instead of one mixed list.
  // A single category shows just that group.
  const groups = WORK_TABS
    .filter(t => t.key !== 'all' && (current === 'all' || current === t.key))
    .map(t => ({ ...t, items: projects.filter(p => tabOf(p) === t.key) }))
    .filter(g => g.items.length > 0);
  const headed = groups.length > 1;

  return (
    <section id="portfolio" data-header="dark" className="relative z-10 py-24 w-full overflow-hidden" style={{ backgroundColor: '#0a0f1e' }}>
      {/* توهج خافت يضيء المشروع المميّز دون أن يُرى كزخرفة */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[60%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 100% at 50% 0%, rgba(26,127,255,0.12), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">{lbl.title}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{lbl.sub}</p>
        </motion.div>

        {tabs.length > 2 && (
          <div role="tablist" aria-label={lbl.filter} className="flex flex-wrap justify-center gap-2 mb-10">
            {tabs.map(t => {
              const selected = t.key === current;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selected
                    ? 'bg-white text-[#0a0f1e] border-white'
                    : 'text-slate-300 border-white/15 hover:border-white/40 hover:text-white'}`}
                >
                  {ar ? t.ar : t.en}
                </button>
              );
            })}
          </div>
        )}

        <motion.div key={current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-16">
          {groups.map(g => (
            <div key={g.key}>
              {headed && (
                <h3 className="flex items-center gap-4 mb-8 text-sm font-mono uppercase ltr:tracking-[0.18em] text-slate-400">
                  <span className="h-px flex-1 bg-white/10" />
                  {ar ? g.groupAr : g.groupEn}
                  <span className="font-english text-slate-500">({g.items.length})</span>
                  <span className="h-px flex-1 bg-white/10" />
                </h3>
              )}
              <WorkGroup items={g.items} ar={ar} lbl={lbl} open={open} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
