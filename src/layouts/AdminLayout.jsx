// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

// 👇 تم استيراد أيقونة Layers لإدارة التقنيات 👇
import { BarChart3, Trophy, Layers } from 'lucide-react';

const AdminLayout = ({ lang, setLang }) => {
  const location = useLocation();

  // عناصر القائمة الجانبية
  const menuItems = [
    { path: '/admin',               icon: '📊',      labelAr: 'لوحة القيادة',    labelEn: 'Dashboard'    },
    { path: '/admin/services',      icon: '🛠️',     labelAr: 'إدارة الخدمات',   labelEn: 'Services'     },
    { path: '/admin/projects',      icon: '📁',      labelAr: 'إدارة المشاريع',  labelEn: 'Projects'     },
    
    {/* 👇 عنصر القائمة الجديد الخاص بإدارة التقنيات 👇 */},
    { path: '/admin/tech-stack',    icon: Layers,    labelAr: 'إدارة التقنيات',  labelEn: 'Tech Stack'   },
    
    { path: '/admin/requests',      icon: '📬',      labelAr: 'طلبات العملاء',   labelEn: 'Requests'     },
    { path: '/admin/stats',         icon: BarChart3, labelAr: 'الإحصائيات',      labelEn: 'Stats'        },
    { path: '/admin/achievements',  icon: Trophy,    labelAr: 'الإنجازات',       labelEn: 'Achievements' },
    { path: '/admin/settings',      icon: '⚙️',      labelAr: 'الإعدادات',       labelEn: 'Settings'     },
    { path: '/',                    icon: '🌐',      labelAr: 'العودة للموقع',   labelEn: 'Back to Site' },
    { path: '/admin/methodology', icon: '🔬', labelAr: 'منهجية العمل', labelEn: 'Methodology' },
    { path: '/admin/testimonials', icon: '💬', labelAr: 'شهادات العملاء', labelEn: 'Testimonials' },
    { path: '/admin/articles', icon: '📎', labelAr: 'إدارة المقالات', labelEn: 'Articles' },
    { path: '/admin/faq', icon: '?', labelAr: 'الأسئلة الشائعة', labelEn: 'FAQ' },
  ];

  return (
    <div className={`min-h-screen bg-[#050810] flex text-slate-200 ${lang === 'ar' ? 'font-arabic' : 'font-english'}`}>
      
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="w-64 bg-[#0a0f1e] border-e border-white/5 flex flex-col">
        {/* شعار لوحة التحكم */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <span className="font-bold text-xl font-english">
            <span className="text-blue-400">Code</span>LAN <span className="text-xs text-red-400">Admin</span>
          </span>
        </div>

        {/* الروابط */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const IconComponent = typeof item.icon !== 'string' ? item.icon : null;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {IconComponent
                  ? <IconComponent size={18} className="flex-shrink-0" />
                  : <span className="text-lg flex-shrink-0">{item.icon}</span>
                }
                <span className="font-medium text-sm">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* مساحة العمل الرئيسية */}
      <div className="flex-1 flex flex-col">
        
        {/* الشريط العلوي (Topbar) */}
        <header className="h-20 bg-[#0a0f1e]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-white">
            {lang === 'ar' ? 'نظام إدارة المحتوى' : 'Content Management System'}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* زر تغيير اللغة داخل لوحة التحكم */}
            <div className="flex bg-[#111827] border border-white/10 rounded-lg p-1">
              <button onClick={() => setLang('ar')} className={`px-3 py-1 rounded text-xs font-english transition-all ${lang === 'ar' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>AR</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1 rounded text-xs font-english transition-all ${lang === 'en' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>EN</button>
            </div>

            {/* أيقونة المستخدم وزر تسجيل الخروج */}
            <div className="flex items-center gap-4 ps-4 border-s border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-red-500 flex items-center justify-center text-white font-bold shadow-lg">
                  A
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-bold text-white">Admin</div>
                  <div className="text-xs text-green-400">Online</div>
                </div>
              </div>
              
              {/* زر تسجيل الخروج */}
              <button 
                onClick={() => {
                  localStorage.removeItem('isAdminAuth'); // مسح جلسة الدخول
                  window.location.href = '/admin/login'; // التوجيه لصفحة الدخول
                }}
                className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة المتغير (تظهر هنا الإحصائيات أو الجداول) */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#050810]">
          <Outlet /> {/* هذا العنصر السحري يجلب محتوى الصفحة المطلوبة */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;