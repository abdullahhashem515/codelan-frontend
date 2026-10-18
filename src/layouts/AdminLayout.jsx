// src/layouts/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, FolderKanban, Inbox, BarChart3, Workflow, Quote,
  Newspaper, Settings, ExternalLink, Sun, Moon, Menu, X,
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiGetDashboardStats } from '../services/api';

// Grouped by what the admin is doing, most-used first. Tech Stack and FAQ are
// gone: nothing on the site displays either. Labels drop the repeated
// "إدارة" prefix, and achievements are named for where they actually appear.
const MENU = [
  { items: [
    { path: '/admin',          icon: LayoutDashboard, labelAr: 'نظرة عامة',     labelEn: 'Overview' },
    { path: '/admin/requests', icon: Inbox,           labelAr: 'طلبات العملاء', labelEn: 'Requests', badge: 'requests' },
  ] },
  { titleAr: 'محتوى الموقع', titleEn: 'Site content', items: [
    { path: '/admin/projects',     icon: FolderKanban, labelAr: 'الأعمال',        labelEn: 'Work'         },
    { path: '/admin/articles',     icon: Newspaper,    labelAr: 'المقالات',       labelEn: 'Articles'     },
    { path: '/admin/services',     icon: Wrench,       labelAr: 'الخدمات',        labelEn: 'Services'     },
    { path: '/admin/achievements', icon: BarChart3,    labelAr: 'أرقام الواجهة',  labelEn: 'Hero numbers' },
    { path: '/admin/methodology',  icon: Workflow,     labelAr: 'منهجية العمل',   labelEn: 'Methodology'  },
    { path: '/admin/testimonials', icon: Quote,        labelAr: 'شهادات العملاء', labelEn: 'Testimonials' },
  ] },
  { titleAr: 'النظام', titleEn: 'System', items: [
    { path: '/admin/settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
  ] },
];

const AdminLayout = () => {
  const { lang, setLang } = useLang();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Unread requests on the sidebar, refreshed on every page change so the
  // count drops as soon as they are handled.
  const [newRequests, setNewRequests] = useState(0);
  useEffect(() => {
    let active = true;
    apiGetDashboardStats()
      .then(res => { if (active) setNewRequests(Number(res.data?.new_requests) || 0); })
      .catch(() => {});
    return () => { active = false; };
  }, [location.pathname]);

  // Close the sidebar on route change (mobile nav). Adjusting during render
  // rather than in an effect means the new page never paints once with the
  // old sidebar state and then again after it closes.
  const [renderedPath, setRenderedPath] = useState(location.pathname);
  if (renderedPath !== location.pathname) {
    setRenderedPath(location.pathname);
    setSidebarOpen(false);
  }


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
          {MENU.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'pt-4 mt-4 border-t border-gray-200 dark:border-white/5' : ''}>
              {group.titleAr && (
                <div className="px-4 mb-2 text-[11px] rtl:text-xs font-semibold text-gray-400 dark:text-slate-500 ltr:uppercase ltr:tracking-wider">
                  {lang === 'ar' ? group.titleAr : group.titleEn}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const count = item.badge === 'requests' ? newRequests : 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'border border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="flex-1 font-medium text-sm">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      {count > 0 && (
                        <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* The public site, in a new tab — the admin session stays open here. */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ExternalLink size={18} className="flex-shrink-0" />
              <span className="font-medium text-sm">{lang === 'ar' ? 'عرض الموقع' : 'View site'}</span>
            </a>
          </div>
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
