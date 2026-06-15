import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { id: '#services',     ar: 'الخدمات',    en: 'Services'     },
    { id: '#portfolio',    ar: 'المشاريع',   en: 'Portfolio'    },
    { id: '#techstack',    ar: 'التقنيات',   en: 'Tech Stack'   },
    { id: '#achievements', ar: 'الإنجازات',  en: 'Achievements' },
    { id: '#blog',         ar: 'المدونة',    en: 'Blog'         },
    { id: '#contact',      ar: 'تواصل معنا', en: 'Contact'      },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between px-6 md:px-16 py-4 bg-white/90 dark:bg-[#050810]/85 backdrop-blur-md border-b border-gray-200 dark:border-[#3b82f6]/15">

      <a href="#" className="flex items-center gap-3 decoration-transparent">
        <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#0a0f1e"/>
          <text x="50" y="62" fontFamily="JetBrains Mono,monospace" fontSize="42" fontWeight="700" textAnchor="middle" fill="url(#lg)">CL</text>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#ef4444"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-en)' }}>
          <span className="text-[#60a5fa]">Code</span>
          <span className="text-[#f87171]">LAN</span>
        </span>
      </a>

      <ul className="hidden md:flex items-center gap-8 list-none">
        {navLinks.map((link, index) => (
          <li key={index}>
            <a
              href={link.id}
              className="text-gray-600 dark:text-[#94a3b8] text-sm tracking-wide transition-colors duration-200 hover:text-gray-900 dark:hover:text-[#f1f5f9]"
            >
              {lang === 'ar' ? link.ar : link.en}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          title={theme === 'dark'
            ? (lang === 'ar' ? 'وضع فاتح' : 'Light Mode')
            : (lang === 'ar' ? 'وضع داكن' : 'Dark Mode')}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Lang Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111827] border border-blue-300/40 dark:border-[#3b82f6]/30 rounded-lg p-1 cursor-pointer">
          <button
            onClick={() => setLang('ar')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
              lang === 'ar'
                ? 'bg-[#3b82f6] text-white'
                : 'text-gray-500 dark:text-[#94a3b8] bg-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
            style={{ fontFamily: 'var(--font-en)' }}
          >
            عربي
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
              lang === 'en'
                ? 'bg-[#3b82f6] text-white'
                : 'text-gray-500 dark:text-[#94a3b8] bg-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
            style={{ fontFamily: 'var(--font-en)' }}
          >
            EN
          </button>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
