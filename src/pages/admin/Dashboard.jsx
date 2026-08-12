// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FolderKanban, Zap, Inbox, PenLine } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { apiGetDashboardStats } from '../../services/api';

const Dashboard = () => {
  const { lang } = useLang();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: lang === 'ar' ? 'إجمالي المشاريع'  : 'Total Projects',
      value: stats?.total_projects  ?? '—',
      icon: FolderKanban, color: 'text-blue-400',
    },
    {
      title: lang === 'ar' ? 'الخدمات الفعالة' : 'Active Services',
      value: stats?.active_services ?? '—',
      icon: Zap, color: 'text-yellow-400',
    },
    {
      title: lang === 'ar' ? 'طلبات جديدة'     : 'New Requests',
      value: stats?.new_requests    ?? '—',
      icon: Inbox, color: 'text-green-400',
    },
    {
      title: lang === 'ar' ? 'المقالات'         : 'Blog Posts',
      value: stats?.blog_posts      ?? '—',
      icon: PenLine, color: 'text-red-400',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{card.title}</span>
              <card.icon size={22} className={card.color} />
            </div>
            <div className={`text-4xl font-mono font-bold ${card.color} ${loading ? 'animate-pulse' : ''}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 h-64 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-slate-500">
        {lang === 'ar' ? 'مساحة الرسوم البيانية أو الجداول' : 'Charts / Tables Area'}
      </div>
    </div>
  );
};

export default Dashboard;
