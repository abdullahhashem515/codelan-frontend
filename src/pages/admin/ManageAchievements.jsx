// src/pages/admin/ManageAchievements.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Star } from 'lucide-react';
import { useLang } from '../../context/LangContext';

// ─── Shared style ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_ACHIEVEMENTS = [
  {
    id: 1,
    titleAr: 'مشاريع مكتملة',       titleEn: 'Completed Projects',
    subtitleAr: 'لعملاء في اليمن والخليج', subtitleEn: 'For clients in Yemen & Gulf',
    value: '20', unit: '+', icon: '🚀',
    isFeatured: true,
  },
  {
    id: 2,
    titleAr: 'عملاء راضون',         titleEn: 'Happy Clients',
    subtitleAr: 'من مختلف القطاعات',     subtitleEn: 'Across diverse sectors',
    value: '15', unit: '+', icon: '🤝',
    isFeatured: true,
  },
  {
    id: 3,
    titleAr: 'سنوات الخبرة',        titleEn: 'Years Experience',
    subtitleAr: 'في تطوير البرمجيات',    subtitleEn: 'In software development',
    value: '3',  unit: '+', icon: '⚡',
    isFeatured: false,
  },
  {
    id: 4,
    titleAr: 'رضا العملاء',         titleEn: 'Client Satisfaction',
    subtitleAr: 'معدل رضا موثق ومستمر',  subtitleEn: 'Verified satisfaction rate',
    value: '99', unit: '%', icon: '⭐',
    isFeatured: true,
  },
];

const EMPTY_FORM = {
  id: null,
  titleAr: '',  titleEn: '',
  subtitleAr: '', subtitleEn: '',
  value: '', unit: '+', icon: '🏆',
  isFeatured: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

const ManageAchievements = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';

  const [achievements, setAchievements]   = useState(INITIAL_ACHIEVEMENTS);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [modalMode, setModalMode]         = useState('add');
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({ ...item });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.titleEn.trim() || !formData.value.trim()) {
      toast.error(ar ? 'يرجى ملء الحقول المطلوبة.' : 'Please fill required fields.', toastStyle);
      return;
    }
    if (modalMode === 'add') {
      setAchievements(prev => [...prev, { ...formData, id: Date.now() }]);
      toast.success(ar ? 'تمت إضافة الإنجاز.' : 'Achievement added.', toastStyle);
    } else {
      setAchievements(prev => prev.map(a => a.id === formData.id ? formData : a));
      toast.success(ar ? 'تم تحديث الإنجاز.' : 'Achievement updated.', toastStyle);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    toast.success(ar ? 'تم حذف الإنجاز.' : 'Achievement deleted.', toastStyle);
  };

  const toggleFeatured = (id) =>
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, isFeatured: !a.isFeatured } : a));

  const swap = (arr, i, j) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const moveUp   = (idx) => { if (idx > 0)                       setAchievements(prev => swap(prev, idx, idx - 1)); };
  const moveDown = (idx) => { if (idx < achievements.length - 1) setAchievements(prev => swap(prev, idx, idx + 1)); };

  return (
    <div>
      <Toaster position="top-center" />

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {ar ? 'إدارة الإنجازات' : 'Manage Achievements'}
          </h1>
          <p className="text-gray-500 dark:text-slate-500 text-sm">
            {ar
              ? 'الإنجازات والأرقام البارزة التي تُعرض في صفحة الموقع'
              : 'Key achievements and numbers displayed on the landing page'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                     px-5 py-2.5 rounded-xl font-medium transition-all
                     shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
        >
          <Plus size={18} />
          {ar ? 'إضافة إنجاز' : 'Add Achievement'}
        </button>
      </div>

      {/* Cards grid */}
      {achievements.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 dark:text-slate-600">
          {ar ? 'لا توجد إنجازات. أضف واحداً.' : 'No achievements yet. Add one.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          <AnimatePresence initial={false}>
            {achievements.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-[#0a0f1e] border rounded-2xl p-6 flex flex-col gap-4
                            transition-opacity relative shadow-sm dark:shadow-none ${
                              item.isFeatured
                                ? 'border-yellow-500/20'
                                : 'border-gray-200 dark:border-white/10'
                            }`}
              >
                {/* Featured badge */}
                {item.isFeatured && (
                  <span className="absolute top-4 end-4 flex items-center gap-1
                                   bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 dark:text-yellow-400
                                   text-xs px-2.5 py-1 rounded-full">
                    <Star size={10} className="fill-yellow-500 dark:fill-yellow-400" />
                    {ar ? 'مميز' : 'Featured'}
                  </span>
                )}

                {/* Icon + Value */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-white/10
                                  flex items-center justify-center text-3xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-4xl font-bold font-mono text-gray-900 dark:text-white leading-none">
                      {item.value}
                      <span className="text-blue-500 dark:text-blue-400 text-2xl">{item.unit}</span>
                    </div>
                    <p className="text-gray-700 dark:text-slate-300 font-medium text-sm mt-1">{item.titleAr}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs font-english">{item.titleEn}</p>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 dark:text-slate-500 text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                  {ar ? item.subtitleAr : item.subtitleEn}
                </p>

                {/* Actions row */}
                <div className="flex items-center justify-between">

                  {/* Reorder */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-2 text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-300
                                 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="text-gray-400 dark:text-slate-600 text-xs w-5 text-center">{idx + 1}</span>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === achievements.length - 1}
                      className="p-2 text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-300
                                 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      title={item.isFeatured ? (ar ? 'إلغاء التمييز' : 'Unfeature') : (ar ? 'تمييز' : 'Feature')}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        item.isFeatured
                          ? 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <Star size={16} className={item.isFeatured ? 'fill-yellow-500 dark:fill-yellow-400' : ''} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400
                                 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Delete with inline confirm */}
                    {deleteConfirm === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-500 dark:text-red-400 text-xs">{ar ? 'تأكيد؟' : 'Sure?'}</span>
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="px-2.5 py-1.5 bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                        >
                          {ar ? 'نعم' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                          {ar ? 'لا' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400
                                   border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10
                           rounded-3xl shadow-2xl p-6 md:p-8 pointer-events-auto
                           max-h-[90vh] overflow-y-auto"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modalMode === 'add'
                      ? (ar ? 'إضافة إنجاز جديد' : 'Add New Achievement')
                      : (ar ? 'تعديل الإنجاز' : 'Edit Achievement')}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Titles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 flex items-center gap-1 block">
                        {ar ? 'العنوان (عربي)' : 'Title (AR)'}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={formData.titleAr}
                        onChange={e => updateForm('titleAr', e.target.value)}
                        placeholder="مشاريع مكتملة"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 flex items-center gap-1 block">
                        {ar ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={formData.titleEn}
                        onChange={e => updateForm('titleEn', e.target.value)}
                        placeholder="Completed Projects"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Subtitles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                        {ar ? 'الوصف الفرعي (عربي)' : 'Subtitle (AR)'}
                      </label>
                      <input
                        className={inputCls}
                        value={formData.subtitleAr}
                        onChange={e => updateForm('subtitleAr', e.target.value)}
                        placeholder="لعملاء في اليمن والخليج"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                        {ar ? 'الوصف الفرعي (إنجليزي)' : 'Subtitle (EN)'}
                      </label>
                      <input
                        className={inputCls}
                        value={formData.subtitleEn}
                        onChange={e => updateForm('subtitleEn', e.target.value)}
                        placeholder="For clients in Yemen & Gulf"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Value / Unit / Icon */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 flex items-center gap-1 block">
                        {ar ? 'القيمة' : 'Value'}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={formData.value}
                        onChange={e => updateForm('value', e.target.value)}
                        placeholder="20"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                        {ar ? 'الوحدة' : 'Unit'}
                      </label>
                      <input
                        className={inputCls}
                        value={formData.unit}
                        onChange={e => updateForm('unit', e.target.value)}
                        placeholder="+  أو  %"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                        {ar ? 'الأيقونة' : 'Icon'}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-12 h-12 flex items-center justify-center
                                         bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl flex-shrink-0">
                          {formData.icon || '🏆'}
                        </span>
                        <input
                          className={inputCls}
                          value={formData.icon}
                          onChange={e => updateForm('icon', e.target.value)}
                          placeholder="🏆"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2">
                        <Star size={14} className="text-yellow-500 dark:text-yellow-400" />
                        {ar ? 'إنجاز مميز' : 'Featured Achievement'}
                      </p>
                      <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">
                        {ar ? 'يظهر بشكل بارز في الصفحة' : 'Highlighted prominently on the page'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateForm('isFeatured', !formData.isFeatured)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        formData.isFeatured ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: formData.isFeatured ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300 rounded-xl
                                 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-medium"
                    >
                      {ar ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white
                                 rounded-xl font-semibold transition-colors"
                    >
                      {modalMode === 'add'
                        ? (ar ? 'إضافة' : 'Add')
                        : (ar ? 'حفظ التعديلات' : 'Save Changes')}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageAchievements;
