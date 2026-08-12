import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Code2, Clock, Users, ChevronRight, Search } from 'lucide-react';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import { apiGetProject } from '../services/api';

const LABELS = {
  ar: { back: 'العودة إلى المشاريع', about: 'نبذة عن المشروع', features: 'المميزات الرئيسية', visit: 'زيارة المشروع', duration: 'مدة التنفيذ', team: 'فريق العمل', stack: 'التقنيات المستخدمة', loading: 'جاري التحميل...', notFound: 'المشروع غير موجود', home: 'العودة للصفحة الرئيسية' },
  en: { back: 'Back to Portfolio', about: 'About the Project', features: 'Key Features', visit: 'Visit Project', duration: 'Duration', team: 'Team Size', stack: 'Tech Stack', loading: 'Loading...', notFound: 'Project Not Found', home: 'Back to Home' },
};

const parseJson = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val) { try { return JSON.parse(val); } catch {} }
  return fallback;
};

const parseStack = (stack, technologies) => {
  if (Array.isArray(technologies) && technologies.length) return technologies;
  if (Array.isArray(stack) && stack.length) return stack;
  if (typeof stack === 'string' && stack) return stack.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const lbl = LABELS[lang];

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    apiGetProject(id)
      .then(res => {
        const p = res.data ?? res;
        if (!p || !p.id) { setNotFound(true); return; }
        setProject(p);
        const name = ar ? (p.title ?? '') : (p.title_en ?? p.title ?? '');
        if (name) document.title = name;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, lang]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400 dark:text-slate-500">
          <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>{lbl.loading}</span>
        </div>
      </main>
    </>
  );

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !project) return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Search className="mx-auto mb-4 text-gray-400" size={56} />
          <h1 className="text-2xl font-bold mb-4">{lbl.notFound}</h1>
          <Link to="/" className="text-blue-500 hover:underline font-medium">{lbl.home}</Link>
        </div>
      </main>
    </>
  );

  // ── Map project fields ───────────────────────────────────────────────────
  const title        = ar ? project.title         : (project.title_en         ?? project.title);
  const category     = ar ? project.category      : (project.category_en      ?? project.category);
  const description  = ar ? (project.full_description  || project.description)
                           : (project.full_description_en || project.description_en || project.full_description || project.description);
  const features     = ar ? parseJson(project.features)    : parseJson(project.features_en, parseJson(project.features));
  const metrics      = parseJson(project.metrics);
  const stack        = parseStack(project.stack, parseJson(project.technologies));
  const thumbGradient = project.thumb_gradient ?? 'from-[#0a1628] to-[#1a2a4a]';
  const strokeColor   = project.stroke_color  ?? '#3b82f6';
  const liveUrl       = project.project_url   ?? '#';

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">

          {/* زر الرجوع */}
          <motion.div initial={{ opacity: 0, x: ar ? 16 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              {ar ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {lbl.back}
            </Link>
          </motion.div>

          {/* غلاف المشروع */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-64 md:h-96 rounded-3xl bg-gradient-to-br ${thumbGradient} relative overflow-hidden mb-12 flex items-center justify-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
            <svg width="220" height="150" viewBox="0 0 220 150" className="opacity-25 relative z-0">
              <rect x="15" y="15" width="190" height="120" rx="14" fill="none" stroke={strokeColor} strokeWidth="2" opacity="0.9"/>
              <circle cx="110" cy="75" r="32" fill="none" stroke={strokeColor} strokeWidth="2" opacity="0.9"/>
              <line x1="15" y1="75" x2="78" y2="75" stroke={strokeColor} strokeWidth="1.5" opacity="0.7"/>
              <line x1="142" y1="75" x2="205" y2="75" stroke={strokeColor} strokeWidth="1.5" opacity="0.7"/>
              <circle cx="110" cy="75" r="8" fill={strokeColor} opacity="0.6"/>
            </svg>
            {category && (
              <div className="absolute bottom-6 start-6 z-10">
                <span className="font-mono text-xs bg-black/50 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  {category}
                </span>
              </div>
            )}
          </motion.div>

          {/* المحتوى الرئيسي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* العمود الرئيسي */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 space-y-10">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>

              {description && (
                <div>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full block flex-shrink-0"></span>
                    {lbl.about}
                  </h2>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              )}

              {features.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-500 rounded-full block flex-shrink-0"></span>
                    {lbl.features}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-[#0d1428] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3">
                        <ChevronRight size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-slate-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {metrics.slice(0, 3).map((m, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-[#0d1428] border border-gray-200 dark:border-white/5 rounded-2xl p-5 text-center">
                      <div className="font-mono text-2xl font-bold text-blue-500 dark:text-blue-400 mb-1">{m.val}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                        {typeof m.lbl === 'object' ? (ar ? m.lbl.ar : m.lbl.en) : m.lbl}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* الشريط الجانبي */}
            <motion.div initial={{ opacity: 0, x: ar ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-5">
              {liveUrl !== '#' && (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20">
                  <ExternalLink size={17} />
                  {lbl.visit}
                </a>
              )}

              <div className="bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                {project.duration && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center flex-shrink-0"><Clock size={15} /></div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">{lbl.duration}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{project.duration}</div>
                    </div>
                  </div>
                )}
                {project.team_size && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0"><Users size={15} /></div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">{lbl.team}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{project.team_size}</div>
                    </div>
                  </div>
                )}
              </div>

              {stack.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 size={15} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{lbl.stack}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.map((tech, i) => (
                      <span key={i} className="font-mono text-xs bg-white dark:bg-[#111827] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </main>
    </>
  );
};

export default ProjectDetails;
