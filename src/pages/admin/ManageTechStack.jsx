// src/pages/admin/ManageTechStack.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, ChevronDown, Layers, Code2, X
} from 'lucide-react';
import { useLang } from '../../context/LangContext';

const ManageTechStack = () => {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  // 1. البيانات الوهمية (Mock Data) مهيأة لتتوافق مع نهج Headless CMS
  const [categories, setCategories] = useState([
    {
      id: 1,
      titleAr: 'تطوير الواجهات (Frontend)',
      titleEn: 'Frontend Development',
      techs: [
        { id: 101, name: 'React 19', icon: '⚛️', color: 'text-blue-400' },
        { id: 102, name: 'Tailwind CSS', icon: '🎨', color: 'text-cyan-400' },
        { id: 103, name: 'Framer Motion', icon: '✨', color: 'text-purple-400' },
      ],
    },
    {
      id: 2,
      titleAr: 'تطوير الخلفية والـ APIs',
      titleEn: 'Backend & APIs',
      techs: [
        { id: 201, name: 'Laravel', icon: '🐘', color: 'text-red-500' },
        { id: 202, name: 'Node.js', icon: '🟢', color: 'text-green-500' },
        { id: 203, name: 'MySQL', icon: '🐬', color: 'text-blue-500' },
      ],
    },
    {
      id: 3,
      titleAr: 'البنية التحتية والشبكات',
      titleEn: 'Infrastructure & Networks',
      techs: [
        { id: 301, name: 'MikroTik API', icon: '📡', color: 'text-blue-300' },
        { id: 302, name: 'Docker', icon: '🐳', color: 'text-blue-500' },
      ],
    }
  ]);

  // حالة التحكم في الـ Accordion المفتوح
  const [expandedId, setExpandedId] = useState(1);

  // حالات النوافذ المنبثقة (Modals)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: '', data: null, catId: null });

  // ستايل الحقول النصية الموحد
  const inputCls = 'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

  // دوال التحكم
  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openModal = (mode, data = null, catId = null) => {
    setModalConfig({ isOpen: true, mode, data, catId });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, mode: '', data: null, catId: null });
  };

  const handleDeleteCat = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleDeleteTech = (catId, techId) => {
    setCategories(categories.map(c => 
      c.id === catId ? { ...c, techs: c.techs.filter(t => t.id !== techId) } : c
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="text-blue-500 w-7 h-7" />
            {isAr ? 'التقنيات والتصنيفات (Tech Stack)' : 'Manage Tech Stack'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {isAr ? 'إدارة تصنيفات التقنيات والأدوات المستخدمة في مشاريعكم' : 'Manage your technology categories and tools'}
          </p>
        </div>
        
        <button 
          onClick={() => openModal('addCat')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          {isAr ? 'تصنيف جديد' : 'New Category'}
        </button>
      </div>

      {/* قائمة الـ Accordion */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.id;

          return (
            <div key={cat.id} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg">
              
              {/* هيدر التصنيف (الزر الذي يفتح ويغلق الأكورديون) */}
              <div 
                onClick={() => toggleAccordion(cat.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    animate={{ rotate: isExpanded ? 180 : 0 }} 
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="text-slate-400 w-5 h-5" />
                  </motion.div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isAr ? cat.titleAr : cat.titleEn}
                  </h2>
                  <span className="bg-blue-500/10 text-blue-400 text-xs py-1 px-2.5 rounded-full font-mono">
                    {cat.techs.length} {isAr ? 'تقنيات' : 'Techs'}
                  </span>
                </div>

                {/* أزرار التحكم بالتصنيف (توقف انتشار الحدث حتى لا يُفتح/يُغلق الأكورديون عند الضغط عليها) */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openModal('editCat', cat)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCat(cat.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* محتوى الأكورديون (التقنيات) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#050810]/50">
                      
                      {/* زر إضافة تقنية داخل التصنيف */}
                      <div className="flex justify-end mb-4">
                        <button 
                          onClick={() => openModal('addTech', null, cat.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {isAr ? 'إضافة تقنية هنا' : 'Add Tech Here'}
                        </button>
                      </div>

                      {/* شبكة التقنيات */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cat.techs.map((tech) => (
                          <div key={tech.id} className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{tech.icon}</span>
                              <span className="font-medium text-gray-700 dark:text-slate-200">{tech.name}</span>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                              <button onClick={() => openModal('editTech', tech, cat.id)} className="p-1.5 text-slate-400 hover:text-blue-400 rounded-md">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteTech(cat.id, tech.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {cat.techs.length === 0 && (
                          <div className="col-span-full py-6 text-center text-gray-400 dark:text-slate-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                            <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            {isAr ? 'لا توجد تقنيات مضافة في هذا التصنيف' : 'No technologies added in this category'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* النافذة المنبثقة (Modal) للتعامل مع النماذج */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalConfig.mode.includes('Cat') 
                    ? (isAr ? 'إدارة التصنيف' : 'Manage Category') 
                    : (isAr ? 'إدارة التقنية' : 'Manage Technology')}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* مجرد Form هيكلي يتناسب مع تصميم الموقع */}
              <form onSubmit={(e) => { e.preventDefault(); closeModal(); }} className="space-y-4">
                {modalConfig.mode.includes('Cat') ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">{isAr ? 'العنوان (عربي)' : 'Title (AR)'}</label>
                      <input type="text" className={inputCls} defaultValue={modalConfig.data?.titleAr || ''} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">{isAr ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label>
                      <input type="text" className={inputCls} defaultValue={modalConfig.data?.titleEn || ''} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">{isAr ? 'اسم التقنية' : 'Tech Name'}</label>
                      <input type="text" className={inputCls} defaultValue={modalConfig.data?.name || ''} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">{isAr ? 'الأيقونة (Emoji)' : 'Icon (Emoji)'}</label>
                      <input type="text" className={inputCls} defaultValue={modalConfig.data?.icon || ''} />
                    </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
                    {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageTechStack;