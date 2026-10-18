// src/pages/admin/ManageProjects.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Layers, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetAllProjects, apiCreateProject, apiUpdateProject, apiDeleteProject } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';
import TechPicker from '../../components/TechPicker';
import { parseVideo } from '../../utils/video';
import { parseResults } from '../../utils/project';
import { WORK_KINDS, kindOf, usesCreativeTools } from '../../utils/workKinds';

// ── Shared input style (light + dark) ────────────────────────────────────────
const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 pb-2 mb-1 border-b border-gray-200 dark:border-white/10">
    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{children}</span>
  </div>
);

// The backend refuses any link that is not https (422); checked here first.
const HTTPS = { type: 'url', pattern: 'https://.+', title: 'https://…' };

// ── Per-kind wording ─────────────────────────────────────────────────────────
// What the form asks for changes with the kind of work: a website for web, the
// stores for an app, a video for motion, the account for social media.
const TYPE_HINTS = {
  web:    { ar: 'تُعرض اللقطة داخل إطار متصفح.', en: 'The screenshot is shown in a browser frame.' },
  mobile: { ar: 'تُعرض اللقطة داخل إطار هاتف.', en: 'The screenshot is shown in a phone frame.' },
  design: { ar: 'تُعرض التصاميم بأبعادها الأصلية كمعرض، بلا إطار.', en: 'Designs are shown at their own proportions, as a gallery.' },
  motion: { ar: 'يُعرض الفيديو في صفحة العمل، ولا يُحمَّل إلا عند الضغط على تشغيل.', en: 'The video plays on the work page, loaded only when play is pressed.' },
  infra:  { ar: 'تُعرض صور التركيب كمعرض بأبعادها الأصلية.', en: 'Installation photos are shown as a gallery, at their own proportions.' },
  social: { ar: 'تُعرض النتائج ثم منشورات الحساب كشبكة.', en: 'Shows the results, then the account\'s posts as a grid.' },
};

const LINK_LABELS = {
  web:    { ar: 'رابط الموقع', en: 'Website link' },
  design: { ar: 'رابط العمل على Behance أو Dribbble (اختياري)', en: 'Behance or Dribbble link (optional)' },
  social: { ar: 'رابط الحساب (اختياري)', en: 'Account link (optional)' },
  infra:  { ar: 'رابط (اختياري)', en: 'Link (optional)' },
};

const IMAGE_TEXT = {
  web: {
    cover: { ar: ['صورة المشروع (لقطة شاشة)', 'لقطة أفقية من المتصفح (16:10 تقريباً)'], en: ['Project image (screenshot)', 'A landscape browser screenshot (roughly 16:10)'] },
    more:  { ar: ['لقطات إضافية (تظهر كشرائح عند فتح المشروع)', 'الصورة الرئيسية أعلاه هي الأولى في المعرض'], en: ['More screenshots (shown as slides)', 'The cover above is the first slide'] },
  },
  mobile: {
    cover: { ar: ['صورة المشروع (لقطة شاشة)', 'لقطة عمودية من الهاتف (9:16 تقريباً)'], en: ['Project image (screenshot)', 'A portrait phone screenshot (roughly 9:16)'] },
    more:  { ar: ['لقطات إضافية (تظهر كشرائح عند فتح المشروع)', 'الصورة الرئيسية أعلاه هي الأولى في المعرض'], en: ['More screenshots (shown as slides)', 'The cover above is the first slide'] },
  },
  design: {
    cover: { ar: ['التصميم الأبرز (الغلاف)', 'أي مقاس — يظهر بأبعاده الأصلية'], en: ['Lead design (cover)', 'Any size — shown at its own proportions'] },
    more:  { ar: ['بقية التصاميم (تظهر كمعرض في صفحة العمل)', 'بوسترات، منشورات، هوية — كل صورة وحدها'], en: ['The other designs (shown as a gallery)', 'Posters, posts, branding — one image each'] },
  },
  motion: {
    cover: { ar: ['صورة غلاف الفيديو (اختيارية)', 'إن تُركت فارغة تُستخدم صورة الفيديو من YouTube'], en: ['Video cover (optional)', 'Left empty, the YouTube thumbnail is used'] },
    more:  { ar: ['لقطات من الفيديو (اختياري)', 'تظهر تحت الفيديو'], en: ['Stills from the video (optional)', 'Shown under the video'] },
  },
  infra: {
    cover: { ar: ['صورة الغلاف (أوضح صورة للنظام يعمل)', 'شاشة العرض أو الكاميرا بعد التركيب'], en: ['Cover (the clearest shot of the system working)', 'The monitor or a camera once installed'] },
    more:  { ar: ['صور التركيب والتشغيل', 'مراحل العمل، المعدات، المشاهدة من الجوال'], en: ['Installation and operation photos', 'Work stages, equipment, viewing on a phone'] },
  },
  social: {
    cover: { ar: ['صورة الغلاف (شعار الحساب أو أبرز منشور)', 'مربعة يُفضّل'], en: ['Cover (account logo or a top post)', 'Square works best'] },
    more:  { ar: ['منشورات من الحساب', 'أضف 5 أو 8 لتكتمل شبكة 6 أو 9 مع الغلاف'], en: ['Posts from the account', 'Add 5 or 8 to make a grid of 6 or 9 with the cover'] },
  },
};

const MAX_RESULTS = 4;

// Example text inside the inputs, so a poster is not described as a SaaS platform.
const PLACEHOLDERS = {
  web:    { cat: ['منصة SaaS', 'SaaS Platform'],      title: ['منصة إدارة الأعمال...', 'Smart ERP Platform'] },
  mobile: { cat: ['تطبيق توصيل', 'Delivery app'],     title: ['تطبيق طلبات المطعم...', 'Restaurant ordering app'] },
  design: { cat: ['بوسترات', 'Posters'],              title: ['حملة رمضان لـ...', 'Ramadan campaign for...'] },
  motion: { cat: ['فيديو تعريفي', 'Explainer video'], title: ['فيديو تعريفي لخدمة...', 'Explainer for...'] },
  infra:  { cat: ['تركيب كاميرات مراقبة', 'CCTV installation'], title: ['اسم العميل أو الموقع', 'Client or site name'] },
  social: { cat: ['إدارة حسابات', 'Social media'],    title: ['اسم العميل أو الحساب', 'Client or account name'] },
};

// ── Field mappers ──────────────────────────────────────────────────────────
const toForm = (p) => ({
  id:               p.id,
  categoryAr:       p.category          ?? '',
  categoryEn:       p.category_en       ?? '',
  titleAr:          p.title             ?? '',
  titleEn:          p.title_en          ?? '',
  descriptionAr:    p.description       ?? '',
  descriptionEn:    p.description_en    ?? '',
  technologies:     Array.isArray(p.technologies) ? p.technologies : (p.technologies ? JSON.parse(p.technologies) : []),
  imageUrl:         p.image_url ?? p.cover_image ?? p.image ?? '',
  type:             p.project_type ?? p.type ?? 'web',
  bodyAr:           p.full_description    ?? '',
  bodyEn:           p.full_description_en ?? '',
  images:           Array.isArray(p.images) ? p.images : (typeof p.images === 'string' && p.images ? (() => { try { return JSON.parse(p.images); } catch { return []; } })() : []),
  appStoreUrl:      p.app_store_url     ?? '',
  playStoreUrl:     p.play_store_url    ?? '',
  thumbGradient:    p.thumb_gradient    ?? 'from-[#0a1628] via-[#162a4a] to-[#1e3a6e]',
  strokeColor:      p.stroke_color      ?? '#3b82f6',
  projectUrl:       p.project_url       ?? '',
  videoUrl:         p.video_url         ?? '',
  results:          parseResults(p.results).map(r => ({ label: r.label, labelEn: r.labelEn, value: r.value })),
  status:           p.status            ?? 'active',
});

const toApi = (f) => ({
  category:            f.categoryAr,
  category_en:         f.categoryEn,
  title:               f.titleAr,
  title_en:            f.titleEn,
  description:         f.descriptionAr,
  description_en:      f.descriptionEn,
  technologies:        f.technologies,
  image_url:           f.imageUrl,
  project_type:        f.type,
  full_description:    f.bodyAr,
  full_description_en: f.bodyEn,
  images:              f.images,
  app_store_url:       f.appStoreUrl,
  play_store_url:      f.playStoreUrl,
  thumb_gradient:      f.thumbGradient,
  stroke_color:        f.strokeColor,
  project_url:         f.projectUrl,
  // Kind-specific fields are cleared when the project is another kind, so a
  // project switched from motion to design does not keep a stale video.
  video_url:           f.type === 'motion' ? f.videoUrl.trim() || null : null,
  results:             f.type === 'social'
    ? f.results.filter(r => r.label.trim() && r.value.trim()).map(r => ({ label: r.label.trim(), label_en: r.labelEn.trim(), value: r.value.trim() }))
    : null,
  status:              f.status,
});

const EMPTY_FORM = {
  id: null,
  categoryAr: '', categoryEn: '',
  titleAr: '', titleEn: '',
  descriptionAr: '', descriptionEn: '',
  technologies: [],
  imageUrl: '',
  type: 'web',
  bodyAr: '', bodyEn: '',
  images: [],
  appStoreUrl: '', playStoreUrl: '',
  thumbGradient: 'from-[#0a1628] via-[#162a4a] to-[#1e3a6e]',
  strokeColor: '#3b82f6',
  projectUrl: '',
  videoUrl: '',
  results: [],
  status: 'active',
};

const ManageProjects = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';

  const [projects, setProjects]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode]         = useState('add');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [formData, setFormData]           = useState(EMPTY_FORM);

  useEffect(() => {
    apiGetAllProjects()
      .then(res => setProjects((res.data ?? []).map(toForm)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setFormData(EMPTY_FORM);
    setModalMode('add');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setFormData({ ...project });
    setModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'motion' && !parseVideo(formData.videoUrl)) {
      alert(ar ? 'أضف رابط فيديو صحيحاً من YouTube أو Vimeo.' : 'Add a valid YouTube or Vimeo link.');
      return;
    }
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await apiCreateProject(toApi(formData));
        setProjects(prev => [...prev, toForm(res.data)]);
      } else {
        const res = await apiUpdateProject(formData.id, toApi(formData));
        setProjects(prev => prev.map(p => p.id === formData.id ? toForm(res.data) : p));
      }
      setIsFormModalOpen(false);
    } catch (err) {
      alert(err?.message ?? (ar ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = (id) => { setProjectToDelete(id); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    try {
      await apiDeleteProject(projectToDelete);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
    } catch {
      alert(ar ? 'فشل الحذف' : 'Delete failed');
    }
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const ph = PLACEHOLDERS[kindOf(formData.type)];
  const imgKind = IMAGE_TEXT[kindOf(formData.type)];
  const imgText = { cover: imgKind.cover[ar ? 'ar' : 'en'], more: imgKind.more[ar ? 'ar' : 'en'] };
  const setResult = (i, key, value) => setField('results', formData.results.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm">{ar ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</span>
      </div>
    </div>
  );

  return (
    <div className="relative">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Layers className="text-blue-500 w-6 h-6" />
            {ar ? 'إدارة الأعمال (Portfolio)' : 'Manage Work (Portfolio)'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'برمجيات، تصاميم، موشن، وإدارة حسابات — لكلٍّ طريقة عرض تناسبه' : 'Software, design, motion and social media — each shown its own way'}
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 w-fit">
          <Plus size={18} />
          {ar ? 'إضافة عمل جديد' : 'Add New Work'}
        </button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0f1e] border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium text-center w-12">#</th>
                <th className="p-4 font-medium">{ar ? 'التصنيف' : 'Category'}</th>
                <th className="p-4 font-medium min-w-[200px]">{ar ? 'اسم المشروع' : 'Project Title'}</th>
                <th className="p-4 font-medium">{ar ? 'التقنيات' : 'Technologies'}</th>
                <th className="p-4 font-medium">{ar ? 'الغلاف' : 'Cover'}</th>
                <th className="p-4 font-medium">{ar ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-medium text-center">{ar ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {projects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group text-sm">
                  <td className="p-4 text-center text-gray-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[10px] text-gray-500 dark:text-slate-400">{WORK_KINDS[kindOf(project.type)][ar ? 'ar' : 'en']}</span>
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {ar ? project.categoryAr : project.categoryEn}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">{ar ? project.titleAr : project.titleEn}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{ar ? project.descriptionAr : project.descriptionEn}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.technologies || []).slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[10px] text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-[#1a2540] px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 font-english">
                          {tech}
                        </span>
                      ))}
                      {(project.technologies || []).length > 3 && (
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${project.thumbGradient} flex-shrink-0 border border-white/10`}></div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      project.status === 'active'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                        : 'bg-gray-100 dark:bg-slate-500/10 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-500/20'
                    }`}>
                      {project.status === 'active' ? (ar ? 'مفعل' : 'Active') : (ar ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(project)} title={ar ? 'تعديل' : 'Edit'} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleOpenDeleteModal(project.id)} title={ar ? 'حذف' : 'Delete'} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ════════════ MODALS ════════════ */}
      <AnimatePresence>

        {/* 1. Add / Edit Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827] flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="text-blue-500 w-5 h-5" />
                  {modalMode === 'add' ? (ar ? 'إضافة عمل جديد' : 'Add New Work') : (ar ? 'تعديل العمل' : 'Edit Work')}
                </h2>
                <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={18} /></button>
              </div>

              {/* Body */}
              <form id="projectForm" onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">

                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <SectionLabel>{ar ? 'المعلومات الأساسية' : 'Basic Information'}</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'التصنيف (عربي)' : 'Category (AR)'}</label>
                      <input required placeholder={ph.cat[0]} dir="rtl" className={inputCls} value={formData.categoryAr} onChange={e => setField('categoryAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'التصنيف (إنجليزي)' : 'Category (EN)'}</label>
                      <input required placeholder={ph.cat[1]} dir="ltr" className={`${inputCls} font-english`} value={formData.categoryEn} onChange={e => setField('categoryEn', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'عنوان المشروع (عربي)' : 'Project Title (AR)'}</label>
                      <input required placeholder={ph.title[0]} dir="rtl" className={inputCls} value={formData.titleAr} onChange={e => setField('titleAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'عنوان المشروع (إنجليزي)' : 'Project Title (EN)'}</label>
                      <input required placeholder={ph.title[1]} dir="ltr" className={`${inputCls} font-english`} value={formData.titleEn} onChange={e => setField('titleEn', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'نوع العمل' : 'Kind of work'}</label>
                      <select className={inputCls} value={formData.type} onChange={e => setField('type', e.target.value)}>
                        <optgroup label={ar ? 'برمجيات' : 'Software'}>
                          <option value="web">{ar ? 'تطبيق ويب' : 'Web app'}</option>
                          <option value="mobile">{ar ? 'تطبيق موبايل' : 'Mobile app'}</option>
                        </optgroup>
                        <optgroup label={ar ? 'تصميم ومحتوى' : 'Design & content'}>
                          <option value="design">{ar ? 'تصميم — بوسترات، هوية، إعلانات' : 'Design — posters, branding, ads'}</option>
                          <option value="motion">{ar ? 'موشن جرافيك — فيديو' : 'Motion graphics — video'}</option>
                          <option value="social">{ar ? 'إدارة حسابات التواصل' : 'Social media management'}</option>
                        </optgroup>
                        <optgroup label={ar ? 'تركيبات ميدانية' : 'Field installations'}>
                          <option value="infra">{ar ? 'شبكات وأنظمة مراقبة' : 'Networks & surveillance'}</option>
                        </optgroup>
                      </select>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">{TYPE_HINTS[kindOf(formData.type)][ar ? 'ar' : 'en']}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'الحالة' : 'Status'}</label>
                      <select className={inputCls} value={formData.status} onChange={e => setField('status', e.target.value)}>
                        <option value="active">{ar ? 'مفعل' : 'Active'}</option>
                        <option value="inactive">{ar ? 'معطل' : 'Inactive'}</option>
                      </select>
                    </div>

                    {formData.type === 'mobile' ? (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'رابط App Store' : 'App Store link'}</label>
                          <input {...HTTPS} placeholder="https://apps.apple.com/..." dir="ltr" className={`${inputCls} font-english`} value={formData.appStoreUrl} onChange={e => setField('appStoreUrl', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'رابط Google Play' : 'Google Play link'}</label>
                          <input {...HTTPS} placeholder="https://play.google.com/..." dir="ltr" className={`${inputCls} font-english`} value={formData.playStoreUrl} onChange={e => setField('playStoreUrl', e.target.value)} />
                        </div>
                      </>
                    ) : formData.type === 'motion' ? (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'رابط الفيديو — YouTube أو Vimeo' : 'Video link — YouTube or Vimeo'}</label>
                        <input {...HTTPS} required placeholder="https://www.youtube.com/watch?v=..." dir="ltr" className={`${inputCls} font-english`} value={formData.videoUrl} onChange={e => setField('videoUrl', e.target.value)} />
                        {formData.videoUrl.trim() && (
                          parseVideo(formData.videoUrl)
                            ? <p className="text-[11px] text-green-600 dark:text-green-400 mt-1.5">{ar ? `✓ رابط ${parseVideo(formData.videoUrl).provider === 'youtube' ? 'YouTube' : 'Vimeo'} صالح` : `✓ Valid ${parseVideo(formData.videoUrl).provider === 'youtube' ? 'YouTube' : 'Vimeo'} link`}</p>
                            : <p className="text-[11px] text-red-500 mt-1.5">{ar ? 'رابط غير مدعوم — انسخ رابط الفيديو من YouTube أو Vimeo مباشرة.' : 'Unsupported link — copy the video link straight from YouTube or Vimeo.'}</p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">
                          {ar ? 'يمكن رفع الفيديو على YouTube كـ «غير مدرج» (Unlisted) فلا يظهر في قناتكم ويعمل هنا.' : 'An Unlisted YouTube video works here without appearing on your channel.'}
                        </p>
                      </div>
                    ) : (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{LINK_LABELS[kindOf(formData.type)][ar ? 'ar' : 'en']}</label>
                        <input {...HTTPS} placeholder="https://..." dir="ltr" className={`${inputCls} font-english`} value={formData.projectUrl} onChange={e => setField('projectUrl', e.target.value)} />
                      </div>
                    )}
                  </div>
                  {/* صورة الغلاف الحقيقية — لقطة شاشة للمشروع. إن تُركت فارغة
                      يعرض الموقع الرسم التوضيحي المتدرّج كما كان سابقاً. */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{imgText.cover[0]}</label>
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={url => setField('imageUrl', url)}
                      label={ar ? 'اضغط لرفع صورة' : 'Click to upload an image'}
                      hint={imgText.cover[1]}
                      previewClass="max-h-52"
                    />
                    {formData.imageUrl && (
                      <button type="button" onClick={() => setField('imageUrl', '')} className="mt-2 text-xs text-red-400 hover:text-red-300">
                        {ar ? 'إزالة الصورة' : 'Remove image'}
                      </button>
                    )}
                  </div>

                  {/* لقطات إضافية — تظهر كشرائح داخل معرض المشروع */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                      {imgText.more[0]}
                    </label>
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {formData.images.map((url) => (
                          <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setField('images', formData.images.filter(u => u !== url))}
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              aria-label={ar ? 'إزالة' : 'Remove'}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <ImageUpload
                      value=""
                      multiple
                      onChange={url => url && setFormData(prev => (prev.images.includes(url) ? prev : { ...prev, images: [...prev.images, url] }))}
                      label={ar ? 'أضف صوراً — يمكن اختيار عدة صور معاً' : 'Add images — several at once is fine'}
                      hint={imgText.more[1]}
                    />
                  </div>

                </div>

                {/* Results — social media management only */}
                {formData.type === 'social' && (
                  <div className="space-y-3">
                    <SectionLabel>{ar ? 'النتائج (اختياري)' : 'Results (optional)'}</SectionLabel>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400/90">
                      {ar
                        ? 'أرقام حقيقية فقط، وبموافقة العميل. مثال: «نمو المتابعين» ‎+45%، «الوصول الشهري» 120K، «مدة الإدارة» 6 أشهر.'
                        : 'Real numbers only, with the client\'s consent. E.g. "Follower growth" +45%, "Monthly reach" 120K, "Managed for" 6 months.'}
                    </p>
                    {formData.results.map((r, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_7rem_auto] gap-2 items-center">
                        <input required placeholder={ar ? 'الوصف (عربي)' : 'Label (AR)'} dir="rtl" maxLength={40} className={inputCls} value={r.label} onChange={e => setResult(i, 'label', e.target.value)} />
                        <input placeholder="Label (EN)" dir="ltr" maxLength={40} className={`${inputCls} font-english`} value={r.labelEn} onChange={e => setResult(i, 'labelEn', e.target.value)} />
                        <input required placeholder="+45%" dir="ltr" maxLength={12} className={`${inputCls} font-english text-center`} value={r.value} onChange={e => setResult(i, 'value', e.target.value)} />
                        <button type="button" onClick={() => setField('results', formData.results.filter((_, j) => j !== i))}
                          aria-label={ar ? 'حذف' : 'Remove'} className="w-10 h-10 rounded-lg text-red-500 hover:bg-red-500/10 flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {formData.results.length < MAX_RESULTS && (
                      <button type="button" onClick={() => setField('results', [...formData.results, { label: '', labelEn: '', value: '' }])}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Plus size={16} /> {ar ? 'إضافة نتيجة' : 'Add a result'}
                      </button>
                    )}
                  </div>
                )}

                {/* Section 2: Descriptions */}
                <div className="space-y-4">
                  <SectionLabel>{ar ? 'الأوصاف' : 'Descriptions'}</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف مختصر (عربي) — يظهر في القائمة' : 'Short Desc (AR) — shown in listing'}</label>
                      <textarea rows="2" maxLength={160} placeholder="وصف قصير للعرض في قائمة المشاريع..." dir="rtl" className={`${inputCls} resize-none`} value={formData.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} />
                      <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-end font-mono">{formData.descriptionAr.length}/160</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف مختصر (إنجليزي)' : 'Short Desc (EN)'}</label>
                      <textarea rows="2" maxLength={160} placeholder="Short description for projects listing..." dir="ltr" className={`${inputCls} resize-none font-english`} value={formData.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} />
                      <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-end font-mono">{formData.descriptionEn.length}/160</div>
                    </div>
                  </div>

                  {/* نص صفحة المشروع — اختياري، لكنه ما يجعل الصفحة المستقلة
                      تستحق الوجود لدى محركات البحث بدل صفحة شبه فارغة. */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'نص صفحة المشروع (عربي) — اختياري' : 'Project page text (AR) — optional'}</label>
                      <textarea rows="5" placeholder="فقرة أو فقرتان عن المشروع: المشكلة، ما بنيناه، النتيجة..." dir="rtl" className={`${inputCls} resize-none`} value={formData.bodyAr} onChange={e => setField('bodyAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'نص صفحة المشروع (إنجليزي) — اختياري' : 'Project page text (EN) — optional'}</label>
                      <textarea rows="5" placeholder="A paragraph or two: the problem, what we built, the outcome..." dir="ltr" className={`${inputCls} resize-none font-english`} value={formData.bodyEn} onChange={e => setField('bodyEn', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 5: Tech Stack */}
                <div className="space-y-4">
                  <SectionLabel>{formData.type === 'infra' ? (ar ? 'المعدات والتقنيات' : 'Equipment & technology') : usesCreativeTools(formData.type) ? (ar ? 'الأدوات المستخدمة' : 'Tools used') : (ar ? 'التقنيات المستخدمة' : 'Technologies Used')}</SectionLabel>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                      {ar ? 'اختر ما استُخدم — يظهر كوسوم على بطاقة العمل' : 'Pick what was used — shown as badges on the card'}
                    </label>
                    <TechPicker
                      value={formData.technologies}
                      onChange={list => setField('technologies', list)}
                      lang={lang}
                      creative={usesCreativeTools(formData.type)}
                    />
                  </div>
                  {(formData.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-[#050810]/50 rounded-xl border border-gray-200 dark:border-white/5">
                      {formData.technologies.map((tech, i) => (
                        <span key={i} className="text-xs bg-blue-50 dark:bg-[#1a2540] text-blue-600 dark:text-slate-300 border border-blue-200 dark:border-[#3b82f6]/20 px-2.5 py-1 rounded-full font-english">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </form>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827] flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  {ar ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" form="projectForm" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? (ar ? 'جاري الحفظ...' : 'Saving...') : (ar ? 'حفظ البيانات' : 'Save Project')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl max-h-full overflow-y-auto"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20"><AlertTriangle size={28} /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{ar ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">{ar ? 'هل أنت متأكد من حذف هذا المشروع نهائياً؟' : 'Are you sure you want to delete this project permanently?'}</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">{ar ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg shadow-red-600/20">{ar ? 'نعم، احذف' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ManageProjects;
