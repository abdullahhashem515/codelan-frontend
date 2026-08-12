// src/pages/admin/ManageFAQ.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, HelpCircle,
  ChevronUp, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetFAQ, apiCreateFAQ, apiUpdateFAQ, apiDeleteFAQ } from '../../services/api';

// ─── Shared Style ─────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ── Field mappers ────────────────────────────────────────────────────────────
const toForm = (f) => ({
  id:         f.id,
  questionAr: f.question    ?? '',
  questionEn: f.question_en ?? '',
  answerAr:   f.answer      ?? '',
  answerEn:   f.answer_en   ?? '',
  isActive:   !!f.is_active,
});

const toApi = (f) => ({
  question:    f.questionAr,
  question_en: f.questionEn,
  answer:      f.answerAr,
  answer_en:   f.answerEn,
  is_active:   f.isActive,
});

const ManageFAQ = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [faqs, setFaqs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    id: '', questionAr: '', questionEn: '', answerAr: '', answerEn: '', isActive: true
  });

  useEffect(() => {
    apiGetFAQ()
      .then(res => setFaqs((res.data ?? []).map(toForm)))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setFormData({ id: '', questionAr: '', questionEn: '', answerAr: '', answerEn: '', isActive: true });
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
    if (!formData.questionAr.trim() || !formData.questionEn.trim()) {
      toast.error(ar ? 'يرجى إدخال السؤال' : 'Question is required', toastStyle);
      return;
    }
    try {
      if (modalMode === 'add') {
        const res = await apiCreateFAQ(toApi(formData));
        setFaqs(prev => [...prev, toForm(res.data)]);
        toast.success(ar ? 'تمت الإضافة بنجاح' : 'Added successfully', toastStyle);
      } else {
        const res = await apiUpdateFAQ(formData.id, toApi(formData));
        setFaqs(prev => prev.map(f => f.id === formData.id ? toForm(res.data) : f));
        toast.success(ar ? 'تم التحديث بنجاح' : 'Updated successfully', toastStyle);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.message ?? (ar ? 'حدث خطأ' : 'An error occurred'), toastStyle);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await apiDeleteFAQ(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      setDeleteConfirm(null);
      toast.success(ar ? 'تم الحذف' : 'Deleted', toastStyle);
    } catch {
      toast.error(ar ? 'فشل الحذف' : 'Delete failed', toastStyle);
    }
  };

  const toggleActive = async (id) => {
    const item = faqs.find(f => f.id === id);
    if (!item) return;
    const updated = { ...item, isActive: !item.isActive };
    setFaqs(prev => prev.map(f => f.id === id ? updated : f));
    toast.success(ar ? 'تم تغيير الحالة' : 'Status updated', toastStyle);
    try { await apiUpdateFAQ(id, toApi(updated)); } catch {
      setFaqs(prev => prev.map(f => f.id === id ? item : f));
    }
  };

  const swap = (arr, i, j) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const moveUp   = (idx) => { if (idx > 0)                setFaqs(prev => swap(prev, idx, idx - 1)); };
  const moveDown = (idx) => { if (idx < faqs.length - 1) setFaqs(prev => swap(prev, idx, idx + 1)); };

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0f1e] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <HelpCircle className="text-blue-500" size={24} />
            {ar ? 'الأسئلة الشائعة (FAQ)' : 'Manage FAQ'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'أضف ورتب الأسئلة الشائعة التي تظهر للعملاء في الموقع' : 'Add and reorder frequently asked questions for your clients'}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium whitespace-nowrap">
          <Plus size={20} />
          {ar ? 'إضافة سؤال' : 'Add Question'}
        </button>
      </div>

      {/* ─── FAQ List ─── */}
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-[#0a0f1e] border ${
              item.isActive
                ? 'border-gray-200 dark:border-white/5'
                : 'border-red-500/20 opacity-75'
            } rounded-2xl p-5 flex flex-col md:flex-row gap-4 transition-all hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none`}
          >

            {/* Reorder Controls */}
            <div className="flex md:flex-col items-center justify-center gap-1 bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-200 dark:border-white/5">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 dark:disabled:hover:text-slate-400 transition-colors">
                <ChevronUp size={20} />
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === faqs.length - 1} className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 dark:disabled:hover:text-slate-400 transition-colors">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-blue-500 text-sm">س:</span>
                  {ar ? item.questionAr : item.questionEn}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1 flex items-start gap-2 text-sm leading-relaxed">
                  <span className="text-green-600 dark:text-green-500 font-bold mt-0.5">ج:</span>
                  {ar ? item.answerAr : item.answerEn}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 md:pl-4 md:border-l border-gray-200 dark:border-white/5">
              <button
                onClick={() => toggleActive(item.id)}
                className={`p-2 rounded-lg transition-colors w-full flex justify-center ${
                  item.isActive
                    ? 'text-green-600 dark:text-green-400 hover:bg-green-500/10'
                    : 'text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
                title={item.isActive ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'عرض' : 'Show')}
              >
                {item.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              <button onClick={() => openEdit(item)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors w-full flex justify-center">
                <Pencil size={18} />
              </button>

              <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full flex justify-center">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && (
          <div className="text-center p-10 bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl text-gray-400 dark:text-slate-500">
            {ar ? 'لا توجد أسئلة شائعة مضافة حالياً.' : 'No FAQs added yet.'}
          </div>
        )}
      </div>

      {/* ─── Add/Edit Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[95vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 flex-shrink-0 bg-gray-50 dark:bg-[#111827]">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="text-blue-500" size={20} />
                  {modalMode === 'add' ? (ar ? 'إضافة سؤال جديد' : 'Add New FAQ') : (ar ? 'تعديل السؤال' : 'Edit FAQ')}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 bg-gray-100 dark:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                  {/* Arabic Side */}
                  <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                      <span className="font-bold text-lg">المحتوى العربي</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">السؤال</label>
                      <input type="text" required value={formData.questionAr} onChange={(e) => setFormData({...formData, questionAr: e.target.value})} className={inputCls} placeholder="مثال: كم تكلفة التطبيق؟" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">الإجابة</label>
                      <textarea rows="3" required value={formData.answerAr} onChange={(e) => setFormData({...formData, answerAr: e.target.value})} className={`${inputCls} resize-none`} placeholder="نص الإجابة هنا..." />
                    </div>
                  </div>

                  {/* English Side */}
                  <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5" dir="ltr">
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-2">
                      <span className="font-bold text-lg">English Content</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2 text-left">Question</label>
                      <input type="text" required value={formData.questionEn} onChange={(e) => setFormData({...formData, questionEn: e.target.value})} className={inputCls} placeholder="e.g. How much does it cost?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2 text-left">Answer</label>
                      <textarea rows="3" required value={formData.answerEn} onChange={(e) => setFormData({...formData, answerEn: e.target.value})} className={`${inputCls} resize-none`} placeholder="Answer text here..." />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/5 flex-shrink-0 bg-gray-50 dark:bg-[#111827] rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    {ar ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 font-medium">
                    {ar ? 'حفظ البيانات' : 'Save FAQ'}
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
              <p className="text-gray-500 dark:text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this FAQ?'}</p>
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

export default ManageFAQ;
