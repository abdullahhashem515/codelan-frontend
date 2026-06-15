// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Trophy, Layers, Sun, Moon, Menu, X } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
  const { lang, setLang } = useLang();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/admin',              icon: '📊',      labelAr: 'لوحة القيادة',    labelEn: 'Dashboard'    },
    { path: '/admin/services',     icon: '🛠️',     labelAr: 'إدارة الخدمات',   labelEn: 'Services'     },
    { path: '/admin/projects',     icon: '📁',      labelAr: 'إدارة المشاريع',  labelEn: 'Projects'     },
    { path: '/admin/tech-stack',   icon: Layers,    labelAr: 'إدارة التقنيات',  labelEn: 'Tech Stack'   },
    { path: '/admin/requests',     icon: '📬',      labelAr: 'طلبات العملاء',   labelEn: 'Requests'     },
    { path: '/admin/stats',        icon: BarChart3, labelAr: 'الإحصائيات',      labelEn: 'Stats'        },
    { path: '/admin/achievements', icon: Trophy,    labelAr: 'الإنجازات',       labelEn: 'Achievements' },
    { path: '/admin/methodology',  icon: '🔬',      labelAr: 'منهجية العمل',    labelEn: 'Methodology'  },
    { path: '/admin/testimonials', icon: '💬',      labelAr: 'شهادات العملاء',  labelEn: 'Testimonials' },
    { path: '/admin/articles',     icon: '📎',      labelAr: 'إدارة المقالات',  labelEn: 'Articles'     },
    { path: '/admin/faq',          icon: '?',       labelAr: 'الأسئلة الشائعة', labelEn: 'FAQ'          },
    { path: '/admin/settings',     icon: '⚙️',      labelAr: 'الإعدادات',       labelEn: 'Settings'     },
    { path: '/',                   icon: '🌐',      labelAr: 'العودة للموقع',   labelEn: 'Back to Site' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // RTL-aware: sidebar slides in from the start edge
  // In LTR: start = left, hidden by sliding -100% on X (left)
  // In RTL: start = right, hidden by sliding +100% on X (right)
  const hiddenTransform = lang === 'ar' ? 'translate-x-full' : '-translate-x-full';

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-[#050810] flex text-gray-900 dark:text-slate-200 ${lang === 'ar' ? 'font-arabic' : 'font-english'}`}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 start-0 z-50 w-64
          bg-white dark:bg-[#0a0f1e]
          border-e border-gray-200 dark:border-white/5
          flex flex-col shadow-sm dark:shadow-none
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : hiddenTransform}
        `}
      >
        {/* Logo */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5">
          <span className="font-bold text-xl font-english">
            <span className="text-blue-500 dark:text-blue-400">Code</span>
            <span className="text-gray-800 dark:text-white">LAN</span>{' '}
            <span className="text-xs text-red-400">Admin</span>
          </span>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const IconComponent = typeof item.icon !== 'string' ? item.icon : null;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="h-16 md:h-20 bg-white/80 dark:bg-[#0a0f1e]/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 shadow-sm dark:shadow-none">

          {/* Left: hamburger (mobile) + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
              {lang === 'ar' ? 'نظام إدارة المحتوى' : 'Content Management System'}
            </h2>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              title={theme === 'dark'
                ? (lang === 'ar' ? 'وضع فاتح' : 'Light Mode')
                : (lang === 'ar' ? 'وضع داكن' : 'Dark Mode')}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Lang toggle */}
            <div className="flex bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-lg p-1">
              <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1 rounded text-xs font-english transition-all ${
                  lang === 'ar'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                AR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded text-xs font-english transition-all ${
                  lang === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Avatar + logout */}
            <div className="flex items-center gap-3 ps-2 md:ps-3 border-s border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-red-500 flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-base">
                  A
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">Admin</div>
                  <div className="text-xs text-green-500 dark:text-green-400">Online</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#050810]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
