// src/pages/admin/ManageRequests.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, X, AlertTriangle } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetRequests, apiUpdateRequestStatus, apiDeleteRequest } from '../../services/api';

const ManageRequests = () => {
  const { lang } = useLang();
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    apiGetRequests()
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleViewRequest = async (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
    if (req.status === 'new') {
      try {
        await apiUpdateRequestStatus(req.id, 'read');
        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'read' } : r));
      } catch { /* marking as read is best-effort — never block opening the request */ }
    }
  };

  const confirmDelete = async () => {
    try {
      await apiDeleteRequest(requestToDelete);
      setRequests(prev => prev.filter(r => r.id !== requestToDelete));
    } catch {
      alert(lang === 'ar' ? 'فشل الحذف' : 'Delete failed');
    }
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm">{lang === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading requests...'}</span>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {lang === 'ar' ? 'طلبات العملاء الواردة' : 'Incoming Client Requests'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          {lang === 'ar' ? 'تابع الرسائل والطلبات التي تصل من نموذج التواصل في الموقع' : 'Track messages and requests from the website contact form'}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0f1e] border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium text-center w-16">#</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'نوع المشروع' : 'Project Type'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-4 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-medium text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 dark:text-slate-500">
                    {lang === 'ar' ? 'لا توجد طلبات بعد' : 'No requests yet'}
                  </td>
                </tr>
              ) : requests.map((req, idx) => (
                <tr key={req.id} className={`hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group text-sm ${req.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-500/[0.02]' : ''}`}>
                  <td className="p-4 text-center text-gray-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-4">
                    <div className="text-gray-900 dark:text-white font-bold">{req.name}</div>
                    <div className="text-gray-400 dark:text-slate-500 text-xs font-english">{req.email}</div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-300">{req.type || '—'}</td>
                  <td className="p-4 text-gray-400 dark:text-slate-500 font-mono text-xs">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="p-4">
                    {req.status === 'new' ? (
                      <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 text-[10px] uppercase font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {lang === 'ar' ? 'جديد' : 'New'}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                        {lang === 'ar' ? 'مقروء' : 'Read'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleViewRequest(req)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Eye size={14} /></button>
                      <button onClick={() => { setRequestToDelete(req.id); setIsDeleteModalOpen(true); }} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isViewModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-[#050810]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl max-h-full overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111827] flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'اسم العميل' : 'Client Name'}</div>
                    <div className="text-gray-900 dark:text-white font-bold">{selectedRequest.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'نوع المشروع' : 'Project Type'}</div>
                    <div className="text-blue-500 dark:text-blue-400 font-bold">{selectedRequest.type || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                    <div className="text-gray-700 dark:text-slate-300 font-english text-sm">{selectedRequest.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'الهاتف' : 'Phone'}</div>
                    <div className="text-gray-700 dark:text-slate-300 font-english text-sm">{selectedRequest.phone || '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mb-1 font-bold">{lang === 'ar' ? 'الرسالة / المتطلبات' : 'Message / Requirements'}</div>
                  <div className="text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-[#111827] p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-sm">
                    {selectedRequest.message}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-[#111827] flex justify-end border-t border-gray-200 dark:border-white/5">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-xl font-bold text-white transition-colors">{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl max-h-full overflow-y-auto"
            >
              <AlertTriangle className="mx-auto mb-4 text-red-500" size={28} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{lang === 'ar' ? 'حذف الطلب' : 'Delete Request'}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">{lang === 'ar' ? 'هل أنت متأكد؟ لا يمكن استرجاع البيانات.' : 'Are you sure? Data cannot be recovered.'}</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold text-white transition-colors">{lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageRequests;
