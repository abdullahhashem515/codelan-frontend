// src/pages/admin/ManageFAQ.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Plus, Pencil, Trash2, X, HelpCircle, 
  ChevronUp, ChevronDown, Eye, EyeOff 
} from 'lucide-react';

// ─── Shared Style ─────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white ' +
  'placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────
const INITIAL_FAQ = [
  {
    id: '1',
    questionAr: 'كم يستغرق بناء تطبيق موبايل متكامل؟',
    questionEn: 'How long does it take to build a full mobile app?',
    answerAr: 'يعتمد ذلك على حجم ومميزات التطبيق، ولكن في المتوسط يستغرق تطوير تطبيق متكامل من شهرين إلى ثلاثة أشهر شاملة التصميم والبرمجة والاختبار.',
    answerEn: 'It depends on the scope and features, but on average, it takes 2 to 3 months including design, development, and testing.',
    isActive: true,
  },
  {
    id: '2',
    questionAr: 'هل تقدمون خدمات الاستضافة والدعم الفني بعد التسليم؟',
    questionEn: 'Do you provide hosting and support after delivery?',
    answerAr: 'نعم، نقدم خطط استضافة سحابية متقدمة ودعم فني مستمر لضمان استقرار مشروعك وحمايته من أي ثغرات أمنية.',
    answerEn: 'Yes, we provide advanced cloud hosting plans and ongoing technical support to ensure your project stability.',
    isActive: true,
  }
];

const ManageFAQ = ({ lang }) => {
  const ar = lang === 'ar';
  const [faqs, setFaqs] = useState(INITIAL_FAQ);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '', questionAr: '', questionEn: '', answerAr: '', answerEn: '', isActive: true
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.questionAr.trim() || !formData.questionEn.trim()) {
      toast.error(ar ? 'يرجى إدخال السؤال' : 'Question is required', toastStyle);
      return;
    }
    
    if (modalMode === 'add') {
      setFaqs(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      toast.success(ar ? 'تمت الإضافة بنجاح' : 'Added successfully', toastStyle);
    } else {
      setFaqs(prev => prev.map(f => f.id === formData.id ? formData : f));
      toast.success(ar ? 'تم التحديث بنجاح' : 'Updated successfully', toastStyle);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null);
    toast.success(ar ? 'تم الحذف' : 'Deleted', toastStyle);
  };

  const toggleActive = (id) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    toast.success(ar ? 'تم تغيير الحالة' : 'Status updated', toastStyle);
  };

  // ─── Reorder Helpers ───
  const swap = (arr, i, j) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const moveUp = (idx) => {
    if (idx > 0) setFaqs(prev => swap(prev, idx, idx - 1));
  };

  const moveDown = (idx) => {
    if (idx < faqs.length - 1) setFaqs(prev => swap(prev, idx, idx + 1));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1e] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <HelpCircle className="text-blue-500" size={24} />
            {ar ? 'الأسئلة الشائعة (FAQ)' : 'Manage FAQ'}
          </h1>
          <p className="text-slate-400 text-sm">
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
          <div key={item.id} className={`bg-[#0a0f1e] border ${item.isActive ? 'border-white/5' : 'border-red-500/20 opacity-75'} rounded-2xl p-5 flex flex-col md:flex-row gap-4 transition-all hover:border-white/10`}>
            
            {/* Reorder Controls */}
            <div className="flex md:flex-col items-center justify-center gap-1 bg-white/5 p-2 rounded-xl border border-white/5">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors">
                <ChevronUp size={20} />
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === faqs.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-blue-500 text-sm">س:</span> 
                  {ar ? item.questionAr : item.questionEn}
                </h3>
                <p className="text-slate-400 mt-1 flex items-start gap-2 text-sm leading-relaxed">
                  <span className="text-green-500 font-bold mt-0.5">ج:</span>
                  {ar ? item.answerAr : item.answerEn}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 md:pl-4 md:border-l border-white/5">
              <button
                onClick={() => toggleActive(item.id)}
                className={`p-2 rounded-lg transition-colors w-full flex justify-center ${
                  item.isActive ? 'text-green-400 hover:bg-green-400/10' : 'text-slate-400 hover:bg-white/5'
                }`}
                title={item.isActive ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'عرض' : 'Show')}
              >
                {item.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors w-full flex justify-center">
                <Pencil size={18} />
              </button>

              <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full flex justify-center">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && (
          <div className="text-center p-10 bg-[#0a0f1e] border border-white/5 rounded-2xl text-slate-500">
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
              className="w-full max-w-3xl bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[95vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="text-blue-500" size={20} />
                  {modalMode === 'add' ? (ar ? 'إضافة سؤال جديد' : 'Add New FAQ') : (ar ? 'تعديل السؤال' : 'Edit FAQ')}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  
                  {/* Arabic Side */}
                  <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <span className="font-bold text-lg">المحتوى العربي</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">السؤال</label>
                      <input type="text" required value={formData.questionAr} onChange={(e) => setFormData({...formData, questionAr: e.target.value})} className={inputCls} placeholder="مثال: كم تكلفة التطبيق؟" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">الإجابة</label>
                      <textarea rows="3" required value={formData.answerAr} onChange={(e) => setFormData({...formData, answerAr: e.target.value})} className={inputCls} placeholder="نص الإجابة هنا..." />
                    </div>
                  </div>

                  {/* English Side */}
                  <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/5" dir="ltr">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <span className="font-bold text-lg">English Content</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 text-left">Question</label>
                      <input type="text" required value={formData.questionEn} onChange={(e) => setFormData({...formData, questionEn: e.target.value})} className={inputCls} placeholder="e.g. How much does it cost?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 text-left">Answer</label>
                      <textarea rows="3" required value={formData.answerEn} onChange={(e) => setFormData({...formData, answerEn: e.target.value})} className={inputCls} placeholder="Answer text here..." />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-white/5 flex-shrink-0 bg-[#0a0f1e] rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-[#0a0f1e] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ar ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this FAQ?'}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">
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