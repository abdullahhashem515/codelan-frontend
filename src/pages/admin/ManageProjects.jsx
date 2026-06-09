// src/pages/admin/ManageProjects.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageProjects = ({ lang }) => {
  // 1. البيانات الوهمية للمشاريع
  const [projects, setProjects] = useState([
    { id: 1, categoryAr: 'منصة SaaS', categoryEn: 'SaaS Platform', titleAr: 'منصة إدارة الأعمال الذكية', titleEn: 'Smart ERP Platform', stack: 'React, Laravel, MySQL', status: 'active' },
    { id: 2, categoryAr: 'تطبيق موبايل', categoryEn: 'Mobile App', titleAr: 'تطبيق خدمات وتوصيل محلي', titleEn: 'Local Delivery App', stack: 'Flutter, Node.js', status: 'active' },
    { id: 3, categoryAr: 'نظام ويب وشبكات', categoryEn: 'Web & Networks System', titleAr: 'منصة إدارة شبكات (ISP)', titleEn: 'ISP Management Platform', stack: 'Vue.js, MikroTik API', status: 'inactive' },
  ]);

  // 2. حالات النوافذ المنبثقة (Modals States)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' أو 'edit'
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // 3. حالة نموذج البيانات (Form Data)
  const initialFormState = { id: null, categoryAr: '', categoryEn: '', titleAr: '', titleEn: '', stack: '', status: 'active' };
  const [formData, setFormData] = useState(initialFormState);

  // دوال التحكم بالنموذج
  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setModalMode('add');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setFormData(project);
    setModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setProjects([...projects, { ...formData, id: Date.now() }]);
    } else {
      setProjects(projects.map(p => p.id === formData.id ? formData : p));
    }
    setIsFormModalOpen(false);
  };

  // دوال التحكم بالحذف
  const handleOpenDeleteModal = (id) => {
    setProjectToDelete(id); // تخزين الـ ID المراد حذفه
    setIsDeleteModalOpen(true); // فتح النافذة
  };

  const confirmDelete = () => {
    setProjects(projects.filter(p => p.id !== projectToDelete));
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="relative">
      {/* الترويسة وزر الإضافة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {lang === 'ar' ? 'إدارة المشاريع (Portfolio)' : 'Manage Projects (Portfolio)'}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'ar' ? 'أضف أعمالكم السابقة، الإحصائيات، والتقنيات المستخدمة' : 'Add your previous work, statistics, and technologies used'}
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 w-fit"
        >
          <span className="text-xl leading-none">+</span> 
          {lang === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project'}
        </button>
      </div>

      {/* جدول البيانات */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1e] border-b border-white/5 text-slate-400 text-sm">
                <th className="p-4 font-medium text-center w-16">#</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                <th className="p-4 font-medium min-w-[200px]">{lang === 'ar' ? 'اسم المشروع' : 'Project Title'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'المكدس التقني' : 'Tech Stack'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-medium text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group text-sm">
                  <td className="p-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-4">
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      {lang === 'ar' ? project.categoryAr : project.categoryEn}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">
                    {lang === 'ar' ? project.titleAr : project.titleEn}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.split(',').map((tech, i) => (
                        <span key={i} className="text-[10px] text-slate-300 bg-[#1a2540] px-1.5 py-0.5 rounded border border-white/10 font-english">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      project.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {project.status === 'active' ? (lang === 'ar' ? 'مفعل' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(project)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">✎</button>
                      <button onClick={() => handleOpenDeleteModal(project.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ======================= النوافذ المنبثقة (Modals) ======================= */}
      <AnimatePresence>
        
        {/* 1. نافذة الإضافة والتعديل */}
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#111827] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'add' ? (lang === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project') : (lang === 'ar' ? 'تعديل المشروع' : 'Edit Project')}
                </h2>
                <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="التصنيف (عربي)" className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" value={formData.categoryAr} onChange={(e) => setFormData({...formData, categoryAr: e.target.value})} required />
                  <input type="text" placeholder="Category (EN)" className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-english" value={formData.categoryEn} onChange={(e) => setFormData({...formData, categoryEn: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="اسم المشروع (عربي)" className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" value={formData.titleAr} onChange={(e) => setFormData({...formData, titleAr: e.target.value})} required />
                  <input type="text" placeholder="Project Title (EN)" className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-english" value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} required />
                </div>
                <input type="text" placeholder="React, Laravel, MySQL..." className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-english" value={formData.stack} onChange={(e) => setFormData({...formData, stack: e.target.value})} />
                <select className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="active">{lang === 'ar' ? 'مفعل' : 'Active'}</option>
                  <option value="inactive">{lang === 'ar' ? 'معطل' : 'Inactive'}</option>
                </select>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2 rounded-xl text-slate-400 hover:bg-white/5">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                  <button type="submit" className="bg-blue-600 px-8 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20">{lang === 'ar' ? 'حفظ البيانات' : 'Save Data'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. نافذة تأكيد الحذف */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-[#111827] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/20">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-slate-400 text-sm mb-6">{lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع نهائياً؟' : 'Are you sure you want to delete this project permanently?'}</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-xl text-slate-300 hover:bg-white/10 transition-all">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 px-4 py-2 rounded-xl font-bold text-white hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">{lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ManageProjects;