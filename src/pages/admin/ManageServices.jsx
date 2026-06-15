// src/pages/admin/ManageServices.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LangContext';

const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

const ManageServices = () => {
  const { lang } = useLang();
  const [services, setServices] = useState([
    { id: 1, icon: '⚡', titleAr: 'تطوير تطبيقات الويب', titleEn: 'Web Development', descAr: 'وصف تجريبي 1', descEn: 'Test Desc 1', tags: 'React, Laravel', status: 'active' },
    { id: 2, icon: '🔧', titleAr: 'تطوير الواجهة الخلفية', titleEn: 'Backend Development', descAr: 'وصف تجريبي 2', descEn: 'Test Desc 2', tags: 'Node.js, MySQL', status: 'active' },
    { id: 3, icon: '☁️', titleAr: 'حلول SaaS', titleEn: 'SaaS Solutions', descAr: 'وصف تجريبي 3', descEn: 'Test Desc 3', tags: 'AWS, Docker', status: 'active' },
  ]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const initialFormState = { id: null, icon: '⚡', titleAr: '', titleEn: '', descAr: '', descEn: '', tags: '', status: 'active' };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAddModal = () => { setFormData(initialFormState); setModalMode('add'); setIsFormModalOpen(true); };
  const handleOpenEditModal = (service) => { setFormData(service); setModalMode('edit'); setIsFormModalOpen(true); };
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') setServices([...services, { ...formData, id: Date.now() }]);
    else setServices(services.map(srv => srv.id === formData.id ? formData : srv));
    setIsFormModalOpen(false);
  };
  const handleOpenDeleteModal = (id) => { setServiceToDelete(id); setIsDeleteModalOpen(true); };
  const confirmDelete = () => { setServices(services.filter(srv => srv.id !== serviceToDelete)); setIsDeleteModalOpen(false); setServiceToDelete(null); };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{lang === 'ar' ? 'إدارة الخدمات' : 'Manage Services'}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{lang === 'ar' ? 'أضف، عدل، أو احذف الخدمات المعروضة في الموقع' : 'Add, edit, or delete services shown on the website'}</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 w-fit">
          <span className="text-xl leading-none">+</span>
          {lang === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0f1e] border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium text-center w-16">#</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الأيقونة' : 'Icon'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الاسم' : 'Title'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-medium text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {services.map((service, idx) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 text-center text-gray-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-4 text-2xl">{service.icon}</td>
                  <td className="p-4">
                    <div className="text-gray-900 dark:text-white font-medium">{lang === 'ar' ? service.titleAr : service.titleEn}</div>
                    <div className="text-gray-400 dark:text-slate-500 text-xs mt-1">{lang === 'ar' ? service.titleEn : service.titleAr}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      service.status === 'active'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                        : 'bg-gray-100 dark:bg-slate-500/10 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-500/20'
                    }`}>
                      {service.status === 'active' ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(service)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">✎</button>
                      <button onClick={() => handleOpenDeleteModal(service.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#111827]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' ? (lang === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service') : (lang === 'ar' ? 'تعديل الخدمة' : 'Edit Service')}
                </h2>
                <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg w-8 h-8 flex items-center justify-center transition-colors">✕</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="serviceForm" onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'الأيقونة (Emoji)' : 'Icon (Emoji)'}</label>
                      <input type="text" name="icon" value={formData.icon} onChange={handleFormChange} required className="w-20 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-2xl text-center text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'حالة الخدمة' : 'Status'}</label>
                      <select name="status" value={formData.status} onChange={handleFormChange} className={inputCls}>
                        <option value="active">{lang === 'ar' ? 'مفعل' : 'Active'}</option>
                        <option value="inactive">{lang === 'ar' ? 'معطل' : 'Inactive'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'الاسم (عربي)' : 'Title (AR)'}</label>
                      <input type="text" name="titleAr" value={formData.titleAr} onChange={handleFormChange} required dir="rtl" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Title (EN)'}</label>
                      <input type="text" name="titleEn" value={formData.titleEn} onChange={handleFormChange} required dir="ltr" className={`${inputCls} font-english`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                      <textarea name="descAr" value={formData.descAr} onChange={handleFormChange} required rows="3" dir="rtl" className={`${inputCls} resize-none`} />
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label>
                      <textarea name="descEn" value={formData.descEn} onChange={handleFormChange} required rows="3" dir="ltr" className={`${inputCls} font-english resize-none`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">{lang === 'ar' ? 'التقنيات (مفصولة بفاصلة)' : 'Tech Stack (comma separated)'}</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleFormChange} dir="ltr" className={`${inputCls} font-english`} />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827] flex justify-end gap-3">
                <button onClick={() => setIsFormModalOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" form="serviceForm" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">{lang === 'ar' ? 'حفظ البيانات' : 'Save Data'}</button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-red-500/20 rounded-2xl p-6 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/20">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">{lang === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?'}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">{lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageServices;
