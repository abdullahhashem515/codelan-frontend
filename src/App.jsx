// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLang } from './context/LangContext';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
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
import ManageTechStack from './pages/admin/ManageTechStack';
import NotFound from './pages/NotFound';

// مكون "حارس البوابة" — يعتمد الآن على AuthContext بدلاً من localStorage مباشرة
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const { lang } = useLang();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`min-h-screen bg-white dark:bg-[#050810] text-gray-900 dark:text-slate-100 ${lang === 'ar' ? 'font-arabic' : 'font-english'} text-start selection:bg-blue-500/30 overflow-x-hidden`}>
        <Routes>

          {/* 1. الموقع العام */}
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />

          {/* 2. صفحة تسجيل الدخول */}
          <Route path="/admin/login" element={<Login />} />

          {/* 3. لوحة التحكم (محمية) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services"      element={<ManageServices />}    />
            <Route path="projects"      element={<ManageProjects />}    />
            <Route path="tech-stack"    element={<ManageTechStack />}   />
            <Route path="methodology"   element={<ManageMethodology />} />
            <Route path="testimonials"  element={<ManageTestimonials />}/>
            <Route path="articles"      element={<ManageArticles />}    />
            <Route path="faq"           element={<ManageFAQ />}         />
            <Route path="requests"      element={<ManageRequests />}    />
            <Route path="stats"         element={<ManageStats />}       />
            <Route path="achievements"  element={<ManageAchievements />}/>
            <Route path="settings"      element={<GeneralSettings />}   />
          </Route>

          {/* 4. صفحة 404 مخصصة */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
