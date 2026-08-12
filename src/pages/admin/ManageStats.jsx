// src/pages/admin/ManageStats.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Eye, EyeOff } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetStats, apiCreateStat, apiUpdateStat, apiDeleteStat } from '../../services/api';
import DynamicIcon from '../../components/DynamicIcon';
import IconPicker from '../../components/IconPicker';

// ─── Shared style ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ── Field mappers ────────────────────────────────────────────────────────────
const toForm = (s) => ({
  id:       s.id,
  labelAr:  s.label    ?? '',
  labelEn:  s.label_en ?? '',
  value:    String(s.value ?? ''),
  suffix:   s.suffix   ?? '+',
  prefix:   s.prefix   ?? '',
  icon:     s.icon     ?? '📊',
  isActive: !!s.is_active,
});

const toApi = (f) => ({
  label:     f.labelAr,
  label_en:  f.labelEn,
  value:     f.value,
  suffix:    f.suffix,
  prefix:    f.prefix,
  icon:      f.icon,
  is_active: f.isActive,
});

const EMPTY_FORM = {
  id: null, labelAr: '', labelEn: '', value: '', suffix: '+', prefix: '', icon: '📊', isActive: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

const ManageStats = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';

  const [stats, setStats]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalMode, setModalMode]       = useState('add');
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    apiGetStats()
      .then(res => setStats((res.data ?? []).map(toForm)))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEdit = (stat) => {
    setFormData({ ...stat });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.labelAr.trim() || !formData.labelEn.trim() || !formData.value.trim()) {
      toast.error(ar ? 'يرجى ملء الحقول المطلوبة.' : 'Please fill required fields.', toastStyle);
      return;
    }
    try {
      if (modalMode === 'add') {
        const res = await apiCreateStat(toApi(formData));
        setStats(prev => [...prev, toForm(res.data)]);
        toast.success(ar ? 'تمت إضافة الإحصائية.' : 'Stat added.', toastStyle);
      } else {
        const res = await apiUpdateStat(formData.id, toApi(formData));
        setStats(prev => prev.map(s => s.id === formData.id ? toForm(res.data) : s));
        toast.success(ar ? 'تم تحديث الإحصائية.' : 'Stat updated.', toastStyle);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.message ?? (ar ? 'حدث خطأ' : 'An error occurred'), toastStyle);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await apiDeleteStat(id);
      setStats(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
      toast.success(ar ? 'تم حذف الإحصائية.' : 'Stat deleted.', toastStyle);
    } catch {
      toast.error(ar ? 'فشل الحذف' : 'Delete failed', toastStyle);
    }
  };

  const toggleActive = async (id) => {
    const item = stats.find(s => s.id === id);
    if (!item) return;
    const updated = { ...item, isActive: !item.isActive };
    setStats(prev => prev.map(s => s.id === id ? updated : s));
    try { await apiUpdateStat(id, toApi(updated)); } catch {
      setStats(prev => prev.map(s => s.id === id ? item : s));
    }
  };

  const swap = (arr, i, j) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const moveUp   = (idx) => { if (idx > 0)                  setStats(prev => swap(prev, idx, idx - 1)); };
  const moveDown = (idx) => { if (idx < stats.length - 1)   setStats(prev => swap(prev, idx, idx + 1)); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm">{ar ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    </div>
  );

  return (
    <div>
      <Toaster position="top-center" />

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {ar ? 'إدارة الإحصائيات' : 'Manage Stats'}
          </h1>
          <p className="text-gray-500 dark:text-slate-500 text-sm">
            {ar
              ? 'الأرقام والإحصائيات التي تظهر في قسم Hero من الموقع'
              : 'Numbers shown in the Hero section of the landing page'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                     px-5 py-2.5 rounded-xl font-medium transition-all
                     shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
        >
          <Plus size={18} />
          {ar ? 'إضافة إحصائية' : 'Add Stat'}
        </button>
      </div>

      {/* Stats list */}
      <div className="space-y-3">
        {stats.length === 0 ? (
          <div className="py-16 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 dark:text-slate-600">
            {ar ? 'لا توجد إحصائيات. أضف واحدة.' : 'No stats yet. Add one.'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-[#0a0f1e] border rounded-2xl px-5 py-4
                            flex flex-wrap items-center gap-4 transition-opacity shadow-sm dark:shadow-none ${
                              stat.isActive
                                ? 'border-gray-200 dark:border-white/10'
                                : 'border-gray-200 dark:border-white/5 opacity-50'
                            }`}
              >
                {/* Up / Down buttons */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-300
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === stats.length - 1}
                    className="p-1 text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-300
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                {/* Preview card */}
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-white/10
                                flex flex-col items-center justify-center gap-0.5 flex-shrink-0">
                  <span className="text-blue-500 dark:text-blue-400 leading-none"><DynamicIcon emoji={stat.icon} size={18} /></span>
                  <span className="text-blue-500 dark:text-blue-400 font-mono font-bold text-xs leading-none">
                    {stat.prefix}{stat.value}{stat.suffix}
                  </span>
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{stat.labelAr}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-xs font-english">{stat.labelEn}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">

                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(stat.id)}
                    title={stat.isActive ? (ar ? 'تعطيل' : 'Disable') : (ar ? 'تفعيل' : 'Enable')}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      stat.isActive
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {stat.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(stat)}
                    className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400
                               border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* Delete with inline confirm */}
                  {deleteConfirm === stat.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-500 dark:text-red-400 text-xs">{ar ? 'تأكيد؟' : 'Sure?'}</span>
                      <button
                        onClick={() => confirmDelete(stat.id)}
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
                      onClick={() => setDeleteConfirm(stat.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400
                                 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

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
                className="w-full max-w-lg bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10
                           rounded-3xl shadow-2xl p-6 md:p-8 pointer-events-auto"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modalMode === 'add'
                      ? (ar ? 'إضافة إحصائية جديدة' : 'Add New Stat')
                      : (ar ? 'تعديل الإحصائية' : 'Edit Stat')}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Labels AR / EN */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 flex items-center gap-1 block">
                        {ar ? 'التسمية (عربي)' : 'Label (AR)'}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={formData.labelAr}
                        onChange={e => updateForm('labelAr', e.target.value)}
                        placeholder="مشروع منجز"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 flex items-center gap-1 block">
                        {ar ? 'التسمية (إنجليزي)' : 'Label (EN)'}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className={inputCls}
                        value={formData.labelEn}
                        onChange={e => updateForm('labelEn', e.target.value)}
                        placeholder="Projects Delivered"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Value / Suffix / Prefix */}
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
                        {ar ? 'اللاحقة' : 'Suffix'}
                      </label>
                      <input
                        className={inputCls}
                        value={formData.suffix}
                        onChange={e => updateForm('suffix', e.target.value)}
                        placeholder="+  أو  %"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                        {ar ? 'السابقة' : 'Prefix'}
                      </label>
                      <input
                        className={inputCls}
                        value={formData.prefix}
                        onChange={e => updateForm('prefix', e.target.value)}
                        placeholder="$"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="text-gray-500 dark:text-slate-400 text-xs mb-1.5 block">
                      {ar ? 'الأيقونة' : 'Icon'}
                    </label>
                    <IconPicker lang={lang} value={formData.icon} onChange={(emoji) => updateForm('icon', emoji)} />
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-medium">
                        {ar ? 'مفعّل في الموقع' : 'Active on site'}
                      </p>
                      <p className="text-gray-400 dark:text-slate-500 text-xs">
                        {ar ? 'يظهر في قسم Hero' : 'Shown in the Hero section'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateForm('isActive', !formData.isActive)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        formData.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: formData.isActive ? 24 : 2 }}
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

export default ManageStats;
