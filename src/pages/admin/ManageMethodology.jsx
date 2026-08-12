// src/pages/admin/ManageMethodology.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetMethodology, apiCreateStep, apiUpdateStep, apiDeleteStep } from '../../services/api';
import DynamicIcon from '../../components/DynamicIcon';
import IconPicker from '../../components/IconPicker';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Shared Style ─────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ── Field mappers ────────────────────────────────────────────────────────────
const toForm = (s) => ({
  id:      String(s.id),
  icon:    s.icon           ?? '✨',
  titleAr: s.title          ?? '',
  titleEn: s.title_en       ?? '',
  descAr:  s.description    ?? '',
  descEn:  s.description_en ?? '',
});

const toApi = (f, order) => ({
  icon:           f.icon,
  title:          f.titleAr,
  title_en:       f.titleEn,
  description:    f.descAr,
  description_en: f.descEn,
  ...(order !== undefined ? { order } : {}),
});

// ─── Sortable Item Component ──────────────────────────────────────────────
const SortableStep = ({ step, index, onEdit, onDelete, ar }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-[#0a0f1e] border ${
        isDragging
          ? 'border-blue-500 shadow-xl shadow-blue-900/20'
          : 'border-gray-200 dark:border-white/5'
      } rounded-2xl p-5 flex items-start gap-4 transition-colors hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none`}
    >
      {/* مقبض السحب */}
      <div
        {...attributes}
        {...listeners}
        className="mt-2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white cursor-grab active:cursor-grabbing p-1 bg-gray-100 dark:bg-white/5 rounded-lg"
        title={ar ? 'اسحب للترتيب' : 'Drag to reorder'}
      >
        <GripVertical size={20} />
      </div>

      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-white/5 flex items-center justify-center text-blue-500 dark:text-blue-400 flex-shrink-0">
        <DynamicIcon emoji={step.icon} size={22} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
            {ar ? 'خطوة' : 'Step'} {index + 1}
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ar ? step.titleAr : step.titleEn}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{ar ? step.descAr : step.descEn}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onEdit(step)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
          <Pencil size={18} />
        </button>
        <button onClick={() => onDelete(step.id)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const ManageMethodology = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [steps, setSteps]     = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    id: '', icon: '', titleAr: '', titleEn: '', descAr: '', descEn: ''
  });

  useEffect(() => {
    apiGetMethodology()
      .then(res => setSteps((res.data ?? []).map(toForm)))
      .catch(() => setSteps([]))
      .finally(() => setLoading(false));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        toast.success(ar ? 'تم تحديث الترتيب' : 'Order updated', toastStyle);
        newArray.forEach((step, idx) => {
          apiUpdateStep(step.id, toApi(step, idx + 1)).catch(() => {});
        });
        return newArray;
      });
    }
  };

  const openAdd = () => {
    setFormData({ id: '', icon: '✨', titleAr: '', titleEn: '', descAr: '', descEn: '' });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEdit = (step) => {
    setFormData({ ...step });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
      toast.error(ar ? 'يرجى إدخال العنوان' : 'Title is required', toastStyle);
      return;
    }
    try {
      if (modalMode === 'add') {
        const res = await apiCreateStep(toApi(formData, steps.length + 1));
        setSteps(prev => [...prev, toForm(res.data)]);
        toast.success(ar ? 'تمت الإضافة بنجاح' : 'Added successfully', toastStyle);
      } else {
        const res = await apiUpdateStep(formData.id, toApi(formData));
        setSteps(prev => prev.map(s => s.id === formData.id ? toForm(res.data) : s));
        toast.success(ar ? 'تم التحديث بنجاح' : 'Updated successfully', toastStyle);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.message ?? (ar ? 'حدث خطأ' : 'An error occurred'), toastStyle);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await apiDeleteStep(id);
      setSteps(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
      toast.success(ar ? 'تم الحذف' : 'Deleted', toastStyle);
    } catch {
      toast.error(ar ? 'فشل الحذف' : 'Delete failed', toastStyle);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0f1e] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {ar ? 'منهجية العمل' : 'Methodology'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {ar ? 'أضف ورتب خطوات العمل التي يتبعها فريقك (يمكنك السحب لإعادة الترتيب)' : 'Add and reorder the workflow steps your team follows (drag to reorder)'}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium">
          <Plus size={20} />
          {ar ? 'خطوة جديدة' : 'New Step'}
        </button>
      </div>

      {/* قائمة الخطوات (Drag & Drop) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <SortableStep key={step.id} step={step} index={index} onEdit={openEdit} onDelete={setDeleteConfirm} ar={ar} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* نافذة الإضافة/التعديل (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' ? (ar ? 'إضافة خطوة' : 'Add Step') : (ar ? 'تعديل خطوة' : 'Edit Step')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">
                    {ar ? 'الأيقونة' : 'Icon'}
                  </label>
                  <IconPicker lang={lang} value={formData.icon} onChange={(emoji) => setFormData({ ...formData, icon: emoji })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'العنوان (عربي)' : 'Title (AR)'}</label>
                    <input type="text" required value={formData.titleAr} onChange={(e) => setFormData({...formData, titleAr: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label>
                    <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} className={inputCls} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                  <textarea rows="2" required value={formData.descAr} onChange={(e) => setFormData({...formData, descAr: e.target.value})} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">{ar ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label>
                  <textarea rows="2" required value={formData.descEn} onChange={(e) => setFormData({...formData, descEn: e.target.value})} className={`${inputCls} resize-none`} dir="ltr" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    {ar ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 font-medium">
                    {ar ? 'حفظ البيانات' : 'Save Details'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة تأكيد الحذف */}
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
              <p className="text-gray-500 dark:text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذه الخطوة؟' : 'Are you sure you want to delete this step?'}</p>
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

export default ManageMethodology;
