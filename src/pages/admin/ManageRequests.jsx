// src/pages/admin/ManageRequests.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageRequests = ({ lang }) => {
  // 1. بيانات وهمية لطلبات العملاء
  const [requests, setRequests] = useState([
    { id: 1, name: 'سالم بن علي', email: 'salem@example.com', type: 'تطبيق موبايل', date: '2026-05-14', message: 'أريد بناء تطبيق لمتجري الخاص لبيع قطع غيار السيارات مع ربط بوابات دفع محلي.', status: 'new' },
    { id: 2, name: 'John Doe', email: 'john@tech.com', type: 'SaaS Platform', date: '2026-05-12', message: 'We need a custom ERP system for our warehouse management in Al-Mukalla.', status: 'read' },
    { id: 3, name: 'مؤسسة الأمل', email: 'info@alamal.org', type: 'موقع ويب', date: '2026-05-10', message: 'نحتاج لتطوير موقع تعريفي للمؤسسة يدعم اللغتين العربية والإنجليزية.', status: 'read' },
  ]);

  // 2. حالات النافذة المنبثقة للعرض والحذف
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // دوال التحكم
  const handleViewRequest = (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
    // محاكاة تحديث الحالة إلى "تمت القراءة"
    setRequests(requests.map(r => r.id === req.id ? {...r, status: 'read'} : r));
  };

  const confirmDelete = () => {
    setRequests(requests.filter(r => r.id !== requestToDelete));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="relative">
      {/* الترويسة */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          {lang === 'ar' ? 'طلبات العملاء الواردة' : 'Incoming Client Requests'}
        </h1>
        <p className="text-slate-400 text-sm">
          {lang === 'ar' ? 'تابع الرسائل والطلبات التي تصل من نموذج التواصل في الموقع' : 'Track messages and requests from the website contact form'}
        </p>
      </div>

      {/* الجدول */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1e] border-b border-white/5 text-slate-400 text-sm">
                <th className="p-4 font-medium text-center w-16">#</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'نوع المشروع' : 'Project Type'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-medium text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((req, idx) => (
                <tr key={req.id} className={`hover:bg-white/[0.02] transition-colors group text-sm ${req.status === 'new' ? 'bg-blue-500/[0.02]' : ''}`}>
                  <td className="p-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-4">
                    <div className="text-white font-bold">{req.name}</div>
                    <div className="text-slate-500 text-xs font-english">{req.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">{req.type}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{req.date}</td>
                  <td className="p-4">
                    {req.status === 'new' ? (
                      <span className="flex items-center gap-1.5 text-blue-400 text-[10px] uppercase font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {lang === 'ar' ? 'جديد' : 'New'}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                        {lang === 'ar' ? 'مقروء' : 'Read'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleViewRequest(req)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20">👁️</button>
                      <button onClick={() => { setRequestToDelete(req.id); setIsDeleteModalOpen(true); }} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ======================= النوافذ المنبثقة ======================= */}
      <AnimatePresence>
        
        {/* 1. نافذة عرض تفاصيل الطلب */}
        {isViewModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-[#050810]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#111827] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'اسم العميل' : 'Client Name'}</div>
                    <div className="text-white font-bold">{selectedRequest.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'نوع المشروع' : 'Project Type'}</div>
                    <div className="text-blue-400 font-bold">{selectedRequest.type}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'الرسالة / المتطلبات' : 'Message / Requirements'}</div>
                  <div className="text-slate-300 leading-relaxed bg-[#111827] p-4 rounded-2xl border border-white/5 text-sm italic">
                    "{selectedRequest.message}"
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#111827] flex justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 px-8 py-2.5 rounded-xl font-bold text-white">{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. نافذة تأكيد الحذف */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-[#111827] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl">
              <div className="text-3xl mb-4 text-red-500">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">{lang === 'ar' ? 'حذف الطلب' : 'Delete Request'}</h3>
              <p className="text-slate-400 text-sm mb-6">{lang === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن استرجاع البيانات.' : 'Are you sure you want to delete this request? Data cannot be recovered.'}</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 bg-white/5 rounded-xl text-slate-300">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 px-4 py-2 rounded-xl font-bold text-white">{lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageRequests;