import { Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import NoIndex from '../components/NoIndex';

// Lazy: keeps the footer out of this page's first load (ProjectDetails in
// particular ships in the main bundle).
const Footer = lazyWithRetry(() => import('../components/Footer'));

const NotFound = () => {
  const { lang } = useLang();
  // "Back" points toward where reading started: right in Arabic, left in English.
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <>
    <NoIndex />
    <div className="min-h-[85svh] bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center relative z-10">
        <div className="text-[120px] font-mono font-bold text-blue-500/10 leading-none select-none mb-2">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
          {lang === 'ar'
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)]"
        >
          <Back size={18} aria-hidden="true" />
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    </div>
    <Suspense fallback={null}><Footer /></Suspense>
    </>
  );
};

export default NotFound;
