// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useLang } from './context/LangContext';
import ScrollToTop from './components/ScrollToTop';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import BrandedLoader from './components/BrandedLoader';
import ContactFab from './components/ContactFab';

// Public pages — eager (first thing users see)
import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages — lazy loaded (not needed on public site)
const Login           = lazy(() => import('./pages/admin/Login'));
const AdminLayout     = lazy(() => import('./layouts/AdminLayout'));
const Dashboard       = lazy(() => import('./pages/admin/Dashboard'));
const ManageServices  = lazy(() => import('./pages/admin/ManageServices'));
const ManageProjects  = lazy(() => import('./pages/admin/ManageProjects'));
const ManageTechStack = lazy(() => import('./pages/admin/ManageTechStack'));
const ManageMethodology  = lazy(() => import('./pages/admin/ManageMethodology'));
const ManageTestimonials = lazy(() => import('./pages/admin/ManageTestimonials'));
const ManageArticles  = lazy(() => import('./pages/admin/ManageArticles'));
const ManageFAQ       = lazy(() => import('./pages/admin/ManageFAQ'));
const ManageRequests  = lazy(() => import('./pages/admin/ManageRequests'));
const ManageStats     = lazy(() => import('./pages/admin/ManageStats'));
const ManageAchievements = lazy(() => import('./pages/admin/ManageAchievements'));
const GeneralSettings = lazy(() => import('./pages/admin/GeneralSettings'));

const AdminFallback = () => <BrandedLoader />;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

// Fade/slide transition wrapper for public pages only — admin keeps instant swaps.
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

// Dedicated Routes for the public marketing site so page transitions never
// touch admin routing (which relies on AdminLayout staying mounted across
// nested navigation). Ranked below the more specific /admin/* routes below.
const PublicSite = () => {
  const location = useLocation();
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/projects/:id" element={<PageTransition><ProjectDetails /></PageTransition>} />
          <Route path="*" element={
            <PageTransition>
              <Suspense fallback={<AdminFallback />}>
                <NotFound />
              </Suspense>
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
      <ContactFab />
    </>
  );
};

function App() {
  const { lang } = useLang();

  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <ScrollToTop />
        <MotionConfig reducedMotion="user">
          <div className={`min-h-screen bg-white dark:bg-[#050810] text-gray-900 dark:text-slate-100 ${lang === 'ar' ? 'font-arabic' : 'font-english'} text-start selection:bg-blue-500/30 overflow-x-hidden`}>
            <Routes>

              {/* 2. صفحة تسجيل الدخول */}
              <Route path="/admin/login" element={
                <Suspense fallback={<AdminFallback />}>
                  <Login />
                </Suspense>
              } />

              {/* 3. لوحة التحكم (محمية) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route index                element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
                <Route path="services"      element={<Suspense fallback={<AdminFallback />}><ManageServices /></Suspense>} />
                <Route path="projects"      element={<Suspense fallback={<AdminFallback />}><ManageProjects /></Suspense>} />
                <Route path="tech-stack"    element={<Suspense fallback={<AdminFallback />}><ManageTechStack /></Suspense>} />
                <Route path="methodology"   element={<Suspense fallback={<AdminFallback />}><ManageMethodology /></Suspense>} />
                <Route path="testimonials"  element={<Suspense fallback={<AdminFallback />}><ManageTestimonials /></Suspense>} />
                <Route path="articles"      element={<Suspense fallback={<AdminFallback />}><ManageArticles /></Suspense>} />
                <Route path="faq"           element={<Suspense fallback={<AdminFallback />}><ManageFAQ /></Suspense>} />
                <Route path="requests"      element={<Suspense fallback={<AdminFallback />}><ManageRequests /></Suspense>} />
                <Route path="stats"         element={<Suspense fallback={<AdminFallback />}><ManageStats /></Suspense>} />
                <Route path="achievements"  element={<Suspense fallback={<AdminFallback />}><ManageAchievements /></Suspense>} />
                <Route path="settings"      element={<Suspense fallback={<AdminFallback />}><GeneralSettings /></Suspense>} />
              </Route>

              {/* 1. الموقع العام + 4. صفحة 404 (كلاهما داخل PublicSite بحركة انتقال) */}
              <Route path="/*" element={<PublicSite />} />

            </Routes>
          </div>
        </MotionConfig>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;
