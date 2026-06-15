// src/pages/admin/ManageArticles.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, FileText, ImageIcon, Calendar,
  CheckCircle, Clock, ExternalLink
} from 'lucide-react';
import { useLang } from '../../context/LangContext';

// ─── Shared Style ─────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────
const INITIAL_ARTICLES = [
  {
    id: '1',
    titleAr: 'مستقبل تطوير الويب مع React 19',
    titleEn: 'The Future of Web Development with React 19',
    excerptAr: 'نظرة شاملة على أحدث الميزات وكيف ستغير شكل بناء واجهات المستخدم في المشاريع القادمة.',
    excerptEn: 'A comprehensive look at the latest features and how they will change UI building.',
    contentAr: 'هنا يكتب المحتوى الكامل للمقال...',
    contentEn: 'Full article content goes here...',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    date: '2024-10-15',
    status: 'published',
  },
  {
    id: '2',
    titleAr: 'أهمية الـ Headless CMS للشركات',
    titleEn: 'The Importance of Headless CMS for Businesses',
    excerptAr: 'لماذا تتجه الشركات التقنية الكبرى لفصل الواجهات الأمامية عن لوحات التحكم؟',
    excerptEn: 'Why are major tech companies separating frontends from dashboards?',
    contentAr: 'هنا يكتب المحتوى الكامل للمقال...',
    contentEn: 'Full article content goes here...',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
    date: '2024-11-02',
    status: 'draft',
  }
];

const ManageArticles = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [articles, setArticles] = useState(INITIAL_ARTICLES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    id: '', titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', imageUrl: '', date: '', status: 'draft'
  });

  const openAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: '', titleAr: '', titleEn: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', imageUrl: '', date: today, status: 'draft' });
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
    if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
      toast.error(ar ? 'يرجى إدخال عنوان المقال' : 'Article title is required', toastStyle);
      return;
    }

    if (modalMode === 'add') {
      setArticles(prev => [{ ...formData, id: Date.now().toString() }, ...prev]);
      toast.success(ar ? 'تم نشر/حفظ المقال بنجاح' : 'Article saved successfully', toastStyle);
    } else {
      setArticles(prev => prev.map(a => a.id === formData.id ? formData : a));
      toast.success(ar ? 'تم تحديث المقال' : 'Article updated', toastStyle);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    toast.success(ar ? 'تم حذف المقال' : 'Article deleted', toastStyle);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0f1e] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            {ar ? 'إدارة المقالات (المدونة)' : 'Manage Articles (Blog)'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'أضف، حرر، ونظم محتوى المدونة الخاص بموقعك' : 'Add, edit, and organize your website blog content'}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium whitespace-nowrap">
          <Plus size={20} />
          {ar ? 'مقال جديد' : 'New Article'}
        </button>
      </div>

      {/* ─── Articles Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col transition-all hover:border-gray-300 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/50 group shadow-sm dark:shadow-none">

            {/* Cover Image */}
            <div className="h-48 bg-gray-100 dark:bg-[#111827] relative overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600">
                  <ImageIcon size={40} className="mb-2 opacity-50" />
                  <span className="text-xs">{ar ? 'لا توجد صورة' : 'No Cover Image'}</span>
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex gap-2">
                {item.status === 'published' ? (
                  <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg">
                    <CheckCircle size={12} /> {ar ? 'منشور' : 'Published'}
                  </span>
                ) : (
                  <span className="bg-orange-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg">
                    <Clock size={12} /> {ar ? 'مسودة' : 'Draft'}
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-400 mb-3">
                <Calendar size={14} />
                <span>{item.date}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {ar ? item.titleAr : item.titleEn}
              </h3>

              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 line-clamp-2 flex-1">
                {ar ? item.excerptAr : item.excerptEn}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                <button className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
                  <ExternalLink size={16} />
                  {ar ? 'معاينة المقال' : 'Preview'}
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
          </div>
        ))}
      </div>

      {/* ─── Add/Edit Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[95vh]"
            >

              {/* الهيدر (ثابت) */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 flex-shrink-0 bg-gray-50 dark:bg-[#111827]">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-blue-500" size={20} />
                  {modalMode === 'add' ? (ar ? 'كتابة مقال جديد' : 'Write New Article') : (ar ? 'تعديل المقال' : 'Edit Article')}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 bg-gray-100 dark:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* النموذج بالكامل */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                {/* منطقة المحتوى (قابلة للتمرير) */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                  {/* 1. Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'رابط صورة الغلاف (URL)' : 'Cover Image URL'}</label>
                      <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className={inputCls} placeholder="https://..." dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'تاريخ النشر' : 'Publish Date'}</label>
                      <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'حالة النشر' : 'Status'}</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className={inputCls}>
                        <option value="published">{ar ? 'منشور (عام)' : 'Published (Public)'}</option>
                        <option value="draft">{ar ? 'مسودة (مخفي)' : 'Draft (Hidden)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* 2. Title & Excerpt */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Arabic Side */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 border-b border-gray-200 dark:border-white/5 pb-2">
                        <span className="font-bold text-lg">المحتوى العربي</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">العنوان</label>
                        <input type="text" required value={formData.titleAr} onChange={(e) => setFormData({...formData, titleAr: e.target.value})} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">المقتطف (وصف قصير)</label>
                        <textarea rows="2" value={formData.excerptAr} onChange={(e) => setFormData({...formData, excerptAr: e.target.value})} className={`${inputCls} resize-none`} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">المحتوى الكامل (يدعم HTML)</label>
                        <textarea rows="6" value={formData.contentAr} onChange={(e) => setFormData({...formData, contentAr: e.target.value})} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    {/* English Side */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-500 dark:text-red-400 border-b border-gray-200 dark:border-white/5 pb-2" dir="ltr">
                        <span className="font-bold text-lg">English Content</span>
                      </div>
                      <div dir="ltr">
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2 text-left">Title</label>
                        <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} className={inputCls} />
                      </div>
                      <div dir="ltr">
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2 text-left">Excerpt (Short Description)</label>
                        <textarea rows="2" value={formData.excerptEn} onChange={(e) => setFormData({...formData, excerptEn: e.target.value})} className={`${inputCls} resize-none`} />
                      </div>
                      <div dir="ltr">
                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2 text-left">Full Content (HTML supported)</label>
                        <textarea rows="6" value={formData.contentEn} onChange={(e) => setFormData({...formData, contentEn: e.target.value})} className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* الفوتر */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/5 flex-shrink-0 bg-gray-50 dark:bg-[#111827] rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    {ar ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 font-medium">
                    {ar ? 'حفظ المقال' : 'Save Article'}
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
              <p className="text-gray-500 dark:text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذا المقال نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this article?'}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  {ar ? 'تراجع' : 'Cancel'}
                </button>
                <button onClick={() => confirmDelete(deleteConfirm)} className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                  {ar ? 'نعم، احذف المقال' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageArticles;
