// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// استيراد الصفحات الأساسية للموقع
import Home from './pages/Home';

// استيراد مكونات لوحة التحكم
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import ManageServices from './pages/admin/ManageServices';
import ManageProjects from './pages/admin/ManageProjects';
import ManageRequests from './pages/admin/ManageRequests';
import GeneralSettings from './pages/admin/GeneralSettings';
import ManageStats from './pages/admin/ManageStats';
import ManageAchievements from './pages/admin/ManageAchievements';
import ManageMethodology from './pages/admin/ManageMethodology';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageArticles from './pages/admin/ManageArticles';
import ManageFAQ from './pages/admin/ManageFAQ';

// 👇 استيراد صفحة إدارة التقنيات الجديدة 👇
import ManageTechStack from './pages/admin/ManageTechStack';

// مكون "حارس البوابة" لحماية الروابط
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuth') === 'true';

  // إذا لم يكن مسجلاً، اطرده إلى صفحة الدخول
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // إذا كان مسجلاً، اسمح له بالدخول
  return children;
};

function App() {
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-[#050810] text-slate-100 ${lang === 'ar' ? 'font-arabic' : 'font-english'} text-start selection:bg-blue-500/30 overflow-x-hidden`}>
        <Routes>

          {/* 1. مسار الموقع العام (Landing Page) */}
          <Route path="/" element={<Home lang={lang} setLang={setLang} />} />

          {/* 2. مسار صفحة تسجيل الدخول */}
          <Route path="/admin/login" element={<Login lang={lang} />} />

          {/* 3. مجموعة مسارات لوحة التحكم (محمية بالكامل) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout lang={lang} setLang={setLang} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard lang={lang} />} />
            <Route path="services" element={<ManageServices lang={lang} />} />
            <Route path="projects" element={<ManageProjects lang={lang} />} />
            
            {/* 👇 مسار واجهة إدارة التقنيات المضاف حديثاً 👇 */}
            <Route path="tech-stack" element={<ManageTechStack lang={lang} />} />
            <Route path="methodology" element={<ManageMethodology lang={lang} />} />
            <Route path="testimonials" element={<ManageTestimonials lang={lang} />} />
            <Route path="articles" element={<ManageArticles lang={lang} />} />
            <Route path="faq" element={<ManageFAQ lang={lang} />} />
            
            <Route path="requests"      element={<ManageRequests    lang={lang} />} />
            <Route path="stats"         element={<ManageStats        lang={lang} />} />
            <Route path="achievements"  element={<ManageAchievements lang={lang} />} />
            <Route path="settings"      element={<GeneralSettings    lang={lang} />} />
          </Route>

          {/* إعادة توجيه أي مسار خاطئ إلى الصفحة الرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;