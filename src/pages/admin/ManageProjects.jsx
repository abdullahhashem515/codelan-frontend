// src/pages/admin/ManageProjects.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Layers, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetProjects, apiCreateProject, apiUpdateProject, apiDeleteProject } from '../../services/api';

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

const MetricRow = ({ metric, index, onChange, onRemove }) => (
  <div className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-[#050810]/50 p-3 rounded-xl border border-gray-200 dark:border-white/10">
    <div className="col-span-2">
      <input type="text" value={metric.val} onChange={e => onChange(index, 'val', e.target.value)} placeholder="10K" dir="ltr" className={`${inputCls} text-center font-mono font-bold`} />
    </div>
    <div className="col-span-4">
      <input type="text" value={metric.lbl.ar} onChange={e => onChange(index, 'lblAr', e.target.value)} placeholder="وصف عربي" className={inputCls} />
    </div>
    <div className="col-span-5">
      <input type="text" value={metric.lbl.en} onChange={e => onChange(index, 'lblEn', e.target.value)} placeholder="English label" dir="ltr" className={`${inputCls} font-english`} />
    </div>
    <div className="col-span-1 flex justify-center">
      <button type="button" onClick={() => onRemove(index)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
        <X size={14} />
      </button>
    </div>
  </div>
);

// ── Field mappers ──────────────────────────────────────────────────────────
const toForm = (p) => ({
  id:               p.id,
  categoryAr:       p.category          ?? '',
  categoryEn:       p.category_en       ?? '',
  titleAr:          p.title             ?? '',
  titleEn:          p.title_en          ?? '',
  descriptionAr:    p.description       ?? '',
  descriptionEn:    p.description_en    ?? '',
  fullDescriptionAr: p.full_description  ?? '',
  fullDescriptionEn: p.full_description_en ?? '',
  featuresAr:       Array.isArray(p.features)    ? p.features    : (p.features    ? JSON.parse(p.features)    : []),
  featuresEn:       Array.isArray(p.features_en) ? p.features_en : (p.features_en ? JSON.parse(p.features_en) : []),
  metrics:          Array.isArray(p.metrics)     ? p.metrics     : (p.metrics     ? JSON.parse(p.metrics)     : [{ val: '', lbl: { ar: '', en: '' } }]),
  stack:            p.stack             ?? '',
  technologies:     Array.isArray(p.technologies) ? p.technologies : (p.technologies ? JSON.parse(p.technologies) : []),
  thumbGradient:    p.thumb_gradient    ?? 'from-[#0a1628] via-[#162a4a] to-[#1e3a6e]',
  strokeColor:      p.stroke_color      ?? '#3b82f6',
  projectUrl:       p.project_url       ?? '#',
  status:           p.status            ?? 'active',
});

const toApi = (f) => ({
  category:            f.categoryAr,
  category_en:         f.categoryEn,
  title:               f.titleAr,
  title_en:            f.titleEn,
  description:         f.descriptionAr,
  description_en:      f.descriptionEn,
  full_description:    f.fullDescriptionAr,
  full_description_en: f.fullDescriptionEn,
  features:            f.featuresAr,
  features_en:         f.featuresEn,
  metrics:             f.metrics,
  stack:               f.stack,
  technologies:        f.technologies,
  thumb_gradient:      f.thumbGradient,
  stroke_color:        f.strokeColor,
  project_url:         f.projectUrl,
  status:              f.status,
});

const EMPTY_FORM = {
  id: null,
  categoryAr: '', categoryEn: '',
  titleAr: '', titleEn: '',
  descriptionAr: '', descriptionEn: '',
  fullDescriptionAr: '', fullDescriptionEn: '',
  featuresAr: [], featuresEn: [],
  metrics: [{ val: '', lbl: { ar: '', en: '' } }],
  stack: '',
  technologies: [],
  thumbGradient: 'from-[#0a1628] via-[#162a4a] to-[#1e3a6e]',
  strokeColor: '#3b82f6',
  projectUrl: '#',
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
    apiGetProjects()
      .then(res => setProjects((res.data ?? []).map(toForm)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleMetricChange = (index, field, value) => {
    const updated = [...formData.metrics];
    if (field === 'val') updated[index] = { ...updated[index], val: value };
    else if (field === 'lblAr') updated[index] = { ...updated[index], lbl: { ...updated[index].lbl, ar: value } };
    else if (field === 'lblEn') updated[index] = { ...updated[index], lbl: { ...updated[index].lbl, en: value } };
    setField('metrics', updated);
  };

  const addMetric = () => {
    if (formData.metrics.length < 5) setField('metrics', [...formData.metrics, { val: '', lbl: { ar: '', en: '' } }]);
  };

  const removeMetric = (index) => setField('metrics', formData.metrics.filter((_, i) => i !== index));

  const parseFeaturesText = (text) => text.split('\n').map(f => f.trim()).filter(Boolean);
  const joinFeaturesText = (arr) => (arr || []).join('\n');

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setFormData({ ...EMPTY_FORM, metrics: [{ val: '', lbl: { ar: '', en: '' } }] });
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
            {ar ? 'إدارة المشاريع (Portfolio)' : 'Manage Projects (Portfolio)'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'أضف أعمالكم السابقة مع جميع تفاصيل الصفحة التفصيلية' : 'Add past projects with full detail page content'}
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 w-fit">
          <Plus size={18} />
          {ar ? 'إضافة مشروع جديد' : 'Add New Project'}
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
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      {ar ? project.categoryAr : project.categoryEn}
                    </span>
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
              className="relative w-full max-w-4xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827] flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="text-blue-500 w-5 h-5" />
                  {modalMode === 'add' ? (ar ? 'إضافة مشروع جديد' : 'Add New Project') : (ar ? 'تعديل المشروع' : 'Edit Project')}
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
                      <input required placeholder="منصة SaaS" dir="rtl" className={inputCls} value={formData.categoryAr} onChange={e => setField('categoryAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'التصنيف (إنجليزي)' : 'Category (EN)'}</label>
                      <input required placeholder="SaaS Platform" dir="ltr" className={`${inputCls} font-english`} value={formData.categoryEn} onChange={e => setField('categoryEn', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'عنوان المشروع (عربي)' : 'Project Title (AR)'}</label>
                      <input required placeholder="منصة إدارة الأعمال..." dir="rtl" className={inputCls} value={formData.titleAr} onChange={e => setField('titleAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'عنوان المشروع (إنجليزي)' : 'Project Title (EN)'}</label>
                      <input required placeholder="Smart ERP Platform" dir="ltr" className={`${inputCls} font-english`} value={formData.titleEn} onChange={e => setField('titleEn', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'رابط المشروع' : 'Project URL'}</label>
                      <input placeholder="https://..." dir="ltr" className={`${inputCls} font-english`} value={formData.projectUrl} onChange={e => setField('projectUrl', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'الحالة' : 'Status'}</label>
                      <select className={inputCls} value={formData.status} onChange={e => setField('status', e.target.value)}>
                        <option value="active">{ar ? 'مفعل' : 'Active'}</option>
                        <option value="inactive">{ar ? 'معطل' : 'Inactive'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'تدرج الغلاف (Tailwind from/via/to)' : 'Cover Gradient (Tailwind from/via/to)'}</label>
                      <input placeholder="from-[#0a1628] via-[#162a4a] to-[#1e3a6e]" dir="ltr" className={`${inputCls} font-english text-xs`} value={formData.thumbGradient} onChange={e => setField('thumbGradient', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'لون الخط المميز' : 'Stroke / Accent Color'}</label>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl border-2 border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer flex-shrink-0 relative" style={{ backgroundColor: formData.strokeColor }}>
                          <input type="color" value={formData.strokeColor} onChange={e => setField('strokeColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <input type="text" value={formData.strokeColor} dir="ltr" maxLength={7} className={`${inputCls} font-mono text-sm`} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setField('strokeColor', e.target.value); }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Descriptions */}
                <div className="space-y-4">
                  <SectionLabel>{ar ? 'الأوصاف' : 'Descriptions'}</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف مختصر (عربي) — يظهر في القائمة' : 'Short Desc (AR) — shown in listing'}</label>
                      <textarea rows="2" placeholder="وصف قصير للعرض في قائمة المشاريع..." dir="rtl" className={`${inputCls} resize-none`} value={formData.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف مختصر (إنجليزي)' : 'Short Desc (EN)'}</label>
                      <textarea rows="2" placeholder="Short description for projects listing..." dir="ltr" className={`${inputCls} resize-none font-english`} value={formData.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف تفصيلي (عربي) — يظهر في صفحة التفاصيل' : 'Full Desc (AR) — shown on detail page'}</label>
                      <textarea rows="4" placeholder="الوصف الكامل للصفحة التفصيلية..." dir="rtl" className={`${inputCls} resize-none`} value={formData.fullDescriptionAr} onChange={e => setField('fullDescriptionAr', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'وصف تفصيلي (إنجليزي)' : 'Full Desc (EN)'}</label>
                      <textarea rows="4" placeholder="Full description for the detail page..." dir="ltr" className={`${inputCls} resize-none font-english`} value={formData.fullDescriptionEn} onChange={e => setField('fullDescriptionEn', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Features */}
                <div className="space-y-4">
                  <SectionLabel>{ar ? 'المميزات (سطر لكل ميزة)' : 'Features (one per line)'}</SectionLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'المميزات (عربي)' : 'Features (AR)'}</label>
                      <textarea rows="5" placeholder={'إدارة المستخدمين\nتتبع المشاريع\nتقارير فورية'} dir="rtl" className={`${inputCls} resize-none`} value={joinFeaturesText(formData.featuresAr)} onChange={e => setField('featuresAr', parseFeaturesText(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'المميزات (إنجليزي)' : 'Features (EN)'}</label>
                      <textarea rows="5" placeholder={'User management\nProject tracking\nReal-time reports'} dir="ltr" className={`${inputCls} resize-none font-english`} value={joinFeaturesText(formData.featuresEn)} onChange={e => setField('featuresEn', parseFeaturesText(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Section 4: Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                      {ar ? 'المقاييس (حتى 5)' : 'Metrics (up to 5)'}
                    </span>
                    <button type="button" onClick={addMetric} disabled={formData.metrics.length >= 5}
                      className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <Plus size={14} /> {ar ? 'إضافة مقياس' : 'Add Metric'}
                    </button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-400 dark:text-slate-500 px-1 mb-1">
                    <div className="col-span-2">{ar ? 'القيمة' : 'Value'}</div>
                    <div className="col-span-4">{ar ? 'التسمية (عربي)' : 'Label (AR)'}</div>
                    <div className="col-span-5">{ar ? 'التسمية (إنجليزي)' : 'Label (EN)'}</div>
                  </div>
                  <div className="space-y-2">
                    {formData.metrics.map((metric, i) => (
                      <MetricRow key={i} metric={metric} index={i} onChange={handleMetricChange} onRemove={removeMetric} />
                    ))}
                  </div>
                </div>

                {/* Section 5: Tech Stack */}
                <div className="space-y-4">
                  <SectionLabel>{ar ? 'التقنيات المستخدمة' : 'Technologies Used'}</SectionLabel>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                      {ar ? 'قائمة التقنيات (مفصولة بفاصلة) — تظهر كوسوم في صفحة التفاصيل' : 'Technologies (comma-separated) — shown as badges on detail page'}
                    </label>
                    <input
                      placeholder="React, Laravel, MySQL, Docker..."
                      dir="ltr"
                      className={`${inputCls} font-english`}
                      value={(formData.technologies || []).join(', ')}
                      onChange={e => setField('technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
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
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{ar ? 'المكدس التقني (نص مختصر للجدول)' : 'Tech Stack (short text for table)'}</label>
                    <input placeholder="React, Laravel, MySQL" dir="ltr" className={`${inputCls} font-english`} value={formData.stack} onChange={e => setField('stack', e.target.value)} />
                  </div>
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
              className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl"
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
