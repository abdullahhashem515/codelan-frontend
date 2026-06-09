// src/pages/admin/ManageMethodology.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';
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
  'w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white ' +
  'placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const toastStyle = {
  style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────
const INITIAL_STEPS = [
  { id: '1', icon: '🔍', titleAr: 'التحليل وهندسة المتطلبات', titleEn: 'Analysis & Requirements', descAr: 'نبدأ بفهم عميق لاحتياجاتك ونحلل السوق.', descEn: 'We start by deeply understanding your needs.' },
  { id: '2', icon: '🎨', titleAr: 'التصميم وتجربة المستخدم', titleEn: 'UI/UX Design', descAr: 'نحول الهيكل إلى واجهات احترافية.', descEn: 'We transform the structure into professional interfaces.' },
  { id: '3', icon: '⚙️', titleAr: 'التطوير البرمجي (Agile)', titleEn: 'Agile Development', descAr: 'كتابة كود نظيف وموثق باستخدام تقنياتنا الحديثة.', descEn: 'Writing clean, documented code using modern tech.' },
  { id: '4', icon: '🧪', titleAr: 'الاختبار وضمان الجودة', titleEn: 'Testing & QA', descAr: 'تخضع الأنظمة لاختبارات أداء وأمان دقيقة.', descEn: 'Systems undergo rigorous performance and security tests.' },
  { id: '5', icon: '🚀', titleAr: 'الإطلاق والدعم الفني', titleEn: 'Launch & Support', descAr: 'رفع المشروع على السيرفرات مع دعم تقني مستمر.', descEn: 'Deploying the project with ongoing support.' },
];

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
      className={`bg-[#0a0f1e] border ${isDragging ? 'border-blue-500 shadow-xl shadow-blue-900/20' : 'border-white/5'} rounded-2xl p-5 flex items-start gap-4 transition-colors hover:border-white/10`}
    >
      {/* مقبض السحب */}
      <div
        {...attributes}
        {...listeners}
        className="mt-2 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing p-1 bg-white/5 rounded-lg"
        title={ar ? 'اسحب للترتيب' : 'Drag to reorder'}
      >
        <GripVertical size={20} />
      </div>

      <div className="w-12 h-12 rounded-xl bg-[#111827] border border-white/5 flex items-center justify-center text-2xl flex-shrink-0">
        {step.icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
            {ar ? 'خطوة' : 'Step'} {index + 1}
          </span>
          <h3 className="text-lg font-bold text-white">{ar ? step.titleAr : step.titleEn}</h3>
        </div>
        <p className="text-sm text-slate-400 mt-2">{ar ? step.descAr : step.descEn}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onEdit(step)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
          <Pencil size={18} />
        </button>
        <button onClick={() => onDelete(step.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const ManageMethodology = ({ lang }) => {
  const ar = lang === 'ar';
  const [steps, setSteps] = useState(INITIAL_STEPS);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '', icon: '', titleAr: '', titleEn: '', descAr: '', descEn: ''
  });

  // إعدادات حساسات السحب والإفلات
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
      toast.error(ar ? 'يرجى إدخال العنوان' : 'Title is required', toastStyle);
      return;
    }
    if (modalMode === 'add') {
      setSteps(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      toast.success(ar ? 'تمت الإضافة بنجاح' : 'Added successfully', toastStyle);
    } else {
      setSteps(prev => prev.map(s => s.id === formData.id ? formData : s));
      toast.success(ar ? 'تم التحديث بنجاح' : 'Updated successfully', toastStyle);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setSteps(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    toast.success(ar ? 'تم الحذف' : 'Deleted', toastStyle);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1e] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {ar ? 'منهجية العمل' : 'Methodology'}
          </h1>
          <p className="text-slate-400 text-sm">
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">
                  {modalMode === 'add' ? (ar ? 'إضافة خطوة' : 'Add Step') : (ar ? 'تعديل خطوة' : 'Edit Step')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {ar ? 'الأيقونة (إيموجي)' : 'Icon (Emoji)'}
                  </label>
                  <input type="text" name="icon" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className={inputCls} placeholder="🚀" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{ar ? 'العنوان (عربي)' : 'Title (AR)'}</label>
                    <input type="text" required value={formData.titleAr} onChange={(e) => setFormData({...formData, titleAr: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{ar ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label>
                    <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} className={inputCls} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{ar ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                  <textarea rows="2" required value={formData.descAr} onChange={(e) => setFormData({...formData, descAr: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{ar ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label>
                  <textarea rows="2" required value={formData.descEn} onChange={(e) => setFormData({...formData, descEn: e.target.value})} className={inputCls} dir="ltr" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-[#0a0f1e] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ar ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-slate-400 mb-6">{ar ? 'هل أنت متأكد من حذف هذه الخطوة؟' : 'Are you sure you want to delete this step?'}</p>
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

export default ManageMethodology;