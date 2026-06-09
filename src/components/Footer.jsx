import React from 'react';

const Footer = ({ lang }) => {
  return (
    <footer className="bg-[#050810] border-t border-[#3b82f6]/10 py-12 px-6 text-center relative z-20">
      <div className="flex items-center justify-center gap-3 mb-6">
        <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#0a0f1e"/>
          <text x="50" y="62" fontFamily="JetBrains Mono,monospace" fontSize="42" fontWeight="700" textAnchor="middle" fill="#3b82f6">CL</text>
        </svg>
        <span className="font-bold text-lg font-english text-white">Code<span className="text-red-400">LAN</span></span>
      </div>
      
      <p className="text-slate-500 text-sm mb-2">
        © 2026 Code LAN. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </p>
      <p className="font-mono text-[10px] text-slate-600">Built with React & Tailwind CSS</p>
    </footer>
  );
};

export default Footer;