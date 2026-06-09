// src/pages/admin/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = ({ lang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // محاكاة تسجيل الدخول (للتجربة فقط)
    // في الواقع، هنا سنرسل الطلب لـ Laravel API
    if (email === 'admin@codelan.dev' && password === 'password') {
      localStorage.setItem('isAdminAuth', 'true'); // تخزين حالة تسجيل الدخول
      navigate('/admin'); // توجيه المستخدم للوحة التحكم
    } else {
      setError(lang === 'ar' ? 'بيانات الدخول غير صحيحة!' : 'Invalid credentials!');
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* تأثيرات إضاءة في الخلفية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111827] border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <text x="50" y="65" fontFamily="monospace" fontSize="50" fontWeight="700" textAnchor="middle" fill="#3b82f6">CL</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {lang === 'ar' ? 'تسجيل الدخول للإدارة' : 'Admin Login'}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'ar' ? 'أدخل بيانات الاعتماد الخاصة بك للمتابعة' : 'Enter your credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-sm mb-2">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dir-ltr text-left"
              placeholder="admin@codelan.dev"
              required 
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dir-ltr text-left"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-4"
          >
            {lang === 'ar' ? 'دخول النظام' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
            {lang === 'ar' ? '← العودة للموقع الرئيسي' : '← Back to main site'}
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;