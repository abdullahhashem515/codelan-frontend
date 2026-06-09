// src/pages/admin/Dashboard.jsx
import React from 'react';

const Dashboard = ({ lang }) => {
  const stats = [
    { title: lang === 'ar' ? 'إجمالي المشاريع' : 'Total Projects', value: '24', icon: '📁', color: 'text-blue-400' },
    { title: lang === 'ar' ? 'الخدمات الفعالة' : 'Active Services', value: '6', icon: '⚡', color: 'text-yellow-400' },
    { title: lang === 'ar' ? 'طلبات جديدة' : 'New Requests', value: '12', icon: '📬', color: 'text-green-400' },
    { title: lang === 'ar' ? 'المقالات' : 'Blog Posts', value: '8', icon: '✍️', color: 'text-red-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">
        {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#111827] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">{stat.title}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className={`text-4xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
      
      {/* مساحة لتجربة إضافة جدول لاحقاً */}
      <div className="mt-10 h-64 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-500">
        {lang === 'ar' ? 'مساحة الرسوم البيانية أو الجداول' : 'Charts / Tables Area'}
      </div>
    </div>
  );
};

export default Dashboard;