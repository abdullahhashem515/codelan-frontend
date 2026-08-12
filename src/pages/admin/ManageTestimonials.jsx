// src/pages/admin/ManageTestimonials.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Star, Eye, EyeOff, MessageSquare, Building2 } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetTestimonials, apiCreateTestimonial, apiUpdateTestimonial, apiDeleteTestimonial } from '../../services/api';

// ─── Shared Style ─────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ── Field mappers ─────────────────────────────────────────────────────────
const toForm = (t) => ({
  id:         t.id,
  nameAr:     t.name        ?? '',
  nameEn:     t.name_en     ?? '',
  positionAr: t.position    ?? '',
  positionEn: t.position_en ?? '',
  company:    t.company     ?? '',
  textAr:     t.text        ?? '',
  textEn:     t.text_en     ?? '',
  rating:     t.rating      ?? 5,
  isActive:   !!t.is_active,
});

const toApi = (f) => ({
  name:        f.nameAr,
  name_en:     f.nameEn,
  position:    f.positionAr,
  position_en: f.positionEn,
  company:     f.company,
  text:        f.textAr,
  text_en:     f.textEn,
  rating:      f.rating,
  is_active:   f.isActive,
});

const ManageTestimonials = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    id: '', nameAr: '', nameEn: '', positionAr: '', positionEn: '', company: '', textAr: '', textEn: '', rating: 5, isActive: true
  });

  useEffect(() => {
    apiGetTestimonials()
      .then(res => setTestimonials((res.data ?? []).map(toForm)))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setFormData({ id: '', nameAr: '', nameEn: '', positionAr: '', positionEn: '', company: '', textAr: '', textEn: '', rating: 5, isActive: true });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({ ...item });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      toast.error(ar ? 'يرجى إدخال اسم العميل' : 'Client name is required', toastStyle);
      return;
    }
    try {
      if (modalMode === 'add') {
        const res = await apiCreateTestimonial(toApi(formData));
        setTestimonials(prev => [toForm(res.data), ...prev]);
        toast.success(ar ? 'تمت الإضافة بنجاح' : 'Added successfully', toastStyle);
      } else {
        const res = await apiUpdateTestimonial(formData.id, toApi(formData));
        setTestimonials(prev => prev.map(t => t.id === formData.id ? toForm(res.data) : t));
        toast.success(ar ? 'تم التحديث بنجاح' : 'Updated successfully', toastStyle);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.message ?? (ar ? 'حدث خطأ' : 'An error occurred'), toastStyle);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await apiDeleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setDeleteConfirm(null);
      toast.success(ar ? 'تم الحذف' : 'Deleted', toastStyle);
    } catch {
      toast.error(ar ? 'فشل الحذف' : 'Delete failed', toastStyle);
    }
  };

  const toggleActive = async (id) => {
    const item = testimonials.find(t => t.id === id);
    if (!item) return;
    const updated = { ...item, isActive: !item.isActive };
    setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
    toast.success(ar ? 'تم تغيير حالة الظهور' : 'Visibility changed', toastStyle);
    try { await apiUpdateTestimonial(id, toApi(updated)); } catch {
      setTestimonials(prev => prev.map(t => t.id === id ? item : t));
    }
  };

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0f1e] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={24} />
            {ar ? 'شهادات العملاء' : 'Testimonials'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'إدارة آراء وتقييمات العملاء المعروضة في الصفحة الرئيسية' : 'Manage client reviews and ratings displayed on the homepage'}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium whitespace-nowrap">
          <Plus size={20} />
          {ar ? 'إضافة تقييم' : 'Add Review'}
        </button>
      </div>

      {/* ─── Testimonials Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-[#0a0f1e] border ${
              item.isActive
                ? 'border-gray-200 dark:border-white/5'
                : 'border-red-500/20 opacity-75'
            } rounded-2xl p-6 flex flex-col transition-all hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{ar ? item.nameAr : item.nameEn}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                  <span>{ar ? item.positionAr : item.positionEn}</span>
                  {item.company && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                      <Building2 size={14} />
                      <span>{item.company}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={16} className={star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-700'} />
                ))}
              </div>
            </div>

            <p className="text-gray-600 dark:text-slate-300 text-sm mb-6 flex-1 bg-gray-50 dark:bg-white/5 p-4 rounded-xl leading-relaxed">
              "{ar ? item.textAr : item.textEn}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
              <button
                onClick={() => toggleActive(item.id)}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  item.isActive
                    ? 'text-green-600 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20'
                    : 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                {item.isActive ? (ar ? 'مرئي' : 'Visible') : (ar ? 'مخفي' : 'Hidden')}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add/Edit Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827]">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' ? (ar ? 'إضافة تقييم جديد' : 'Add New Review') : (ar ? 'تعديل التقييم' : 'Edit Review')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'التقييم' : 'Rating'}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setFormData({...formData, rating: star})} className="focus:outline-none transition-transform hover:scale-110">
                        <Star size={28} className={star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'اسم العميل (عربي)' : 'Name (AR)'}</label>
                    <input type="text" required value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'اسم العميل (إنجليزي)' : 'Name (EN)'}</label>
                    <input type="text" required value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'المنصب (عربي)' : 'Position (AR)'}</label>
                    <input type="text" value={formData.positionAr} onChange={(e) => setFormData({...formData, positionAr: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'المنصب (إنجليزي)' : 'Position (EN)'}</label>
                    <input type="text" value={formData.positionEn} onChange={(e) => setFormData({...formData, positionEn: e.target.value})} className={inputCls} dir="ltr" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'اسم الشركة (اختياري)' : 'Company Name (Optional)'}</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className={inputCls} placeholder="e.g. CodeLAN" />
                  </div>
                </div>

                {/* Review Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'نص التقييم (عربي)' : 'Review Text (AR)'}</label>
                    <textarea rows="4" required value={formData.textAr} onChange={(e) => setFormData({...formData, textAr: e.target.value})} className={`${inputCls} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'نص التقييم (إنجليزي)' : 'Review Text (EN)'}</label>
                    <textarea rows="4" required value={formData.textEn} onChange={(e) => setFormData({...formData, textEn: e.target.value})} className={`${inputCls} resize-none`} dir="ltr" />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="isActiveForm" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-blue-500 rounded cursor-pointer" />
                  <label htmlFor="isActiveForm" className="text-sm font-medium text-gray-600 dark:text-slate-300 cursor-pointer">
                    {ar ? 'عرض هذه الشهادة في الموقع العام' : 'Show this testimonial on the public site'}
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    {ar ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 font-medium">
                    {ar ? 'حفظ البيانات' : 'Save Testimonial'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#0a0f1e] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ar ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذا التقييم نهائياً؟' : 'Are you sure you want to permanently delete this review?'}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  {ar ? 'تراجع' : 'Cancel'}
                </button>
                <button onClick={() => confirmDelete(deleteConfirm)} className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                  {ar ? 'نعم، احذف' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageTestimonials;
