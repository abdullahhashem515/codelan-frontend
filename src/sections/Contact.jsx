  // src/pages/sections/Contact.jsx
  import React, { useState } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';

  const Contact = ({ lang }) => {
    const [step, setStep] = useState(1);
    
    // 1. إضافة حالة (State) لحفظ بيانات النموذج بالكامل
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: ''
    });
    const [projectType, setProjectType] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(''); // لعرض رسائل الخطأ

    const t = {
      ar: {
        tag: '// contact', title: 'ابدأ مشروعك اليوم', sub: 'لديك فكرة؟ نحن نحولها إلى واقع رقمي. تواصل معنا وسنرد عليك خلال 24 ساعة.',
        step1Title: 'معلوماتك الشخصية', step2Title: 'نوع المشروع', step3Title: 'تفاصيل المشروع',
        next: 'التالي', prev: 'السابق', submit: 'إرسال الطلب',
        success: 'تم إرسال طلبك بنجاح!', successSub: 'سنتواصل معك قريباً. شكراً لثقتك بـ Code LAN.',
        reqError: 'يرجى تعبئة جميع الحقول المطلوبة'
      },
      en: {
        tag: '// contact', title: 'Start Your Project Today', sub: 'Have an idea? We turn it into digital reality. Contact us within 24 hours.',
        step1Title: 'Your Information', step2Title: 'Project Type', step3Title: 'Project Details',
        next: 'Next', prev: 'Back', submit: 'Submit Request',
        success: 'Request Submitted Successfully!', successSub: 'We will contact you soon. Thank you for trusting Code LAN.',
        reqError: 'Please fill out all required fields'
      }
    };
    const current = t[lang];

    const typesAr = ['موقع أو تطبيق ويب', 'تطبيق موبايل', 'منصة SaaS / نظام إدارة', 'أمن سيبراني / شبكات'];
    const typesEn = ['Website or Web App', 'Mobile App', 'SaaS / Management System', 'Cybersecurity / Networks'];
    const types = lang === 'ar' ? typesAr : typesEn;

    // 2. دالة للتحكم في الانتقال للخطوة التالية مع التحقق من البيانات
    const handleNextStep = (nextStep) => {
      if (nextStep === 2) {
        if (!formData.name.trim() || !formData.email.trim()) {
          setError(current.reqError);
          return;
        }
      }
      setError('');
      setStep(nextStep);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.message.trim()) {
        setError(current.reqError);
        return;
      }
      // هنا يتم إرسال البيانات للـ Backend لاحقاً
      console.log({ ...formData, projectType });
      setIsSubmitted(true);
    };

    return (
      <section id="contact" className="py-24 bg-[#0a0f1e] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* معلومات التواصل */}
          <div className="lg:col-span-2">
            <div className="inline-block font-mono text-xs text-blue-500 tracking-widest uppercase mb-4 bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
              {current.tag}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{current.title}</h2>
            <p className="text-slate-400 leading-relaxed mb-10">{current.sub}</p>
            
            <div className="space-y-4">
              <a href="mailto:hello@codelan.dev" className="flex items-center gap-4 text-slate-300 hover:text-blue-400 transition-colors group">
                <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-xl group-hover:border-blue-500/50">
                  <span aria-hidden="true">📧</span>
                </div>
                <span>hello@codelan.dev</span>
              </a>
              <a href="#" className="flex items-center gap-4 text-slate-300 hover:text-blue-400 transition-colors group">
                <div className="w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-xl group-hover:border-blue-500/50">
                  <span aria-hidden="true">💬</span>
                </div>
                <span className="dir-ltr">+966 50 000 0000</span>
              </a>
            </div>
          </div>

          {/* النموذج الذكي */}
          <div className="lg:col-span-3">
            <div className="bg-[#0d1428] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div aria-hidden="true" className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{current.success}</h3>
                  <p className="text-slate-400">{current.successSub}</p>
                </motion.div>
              ) : (
                <>
                  {/* شريط التقدم */}
                  <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -z-10"></div>
                    <div className="absolute left-0 top-1/2 h-0.5 bg-blue-500 -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', [lang === 'ar' ? 'right' : 'left']: 0 }}></div>
                    
                    {[1, 2, 3].map((num) => (
                      <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${step >= num ? 'bg-blue-500 border-blue-500 text-white' : 'bg-[#0d1428] border-white/20 text-slate-500'}`}>
                        {step > num ? '✓' : num}
                      </div>
                    ))}
                  </div>

                  {/* عرض رسالة الخطأ إن وجدت */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-bold">
                      {error}
                    </motion.div>
                  )}

                  {/* الخطوات */}
                  <form onSubmit={handleSubmit} className="min-h-[250px] flex flex-col">
                    <AnimatePresence mode="wait">
                      
                      {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-6 text-white">{current.step1Title}</h3>
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} 
                              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                            />
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} 
                              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                            />
                          </div>
                          <div className="mt-auto pt-8 flex justify-end">
                            <button type="button" onClick={() => handleNextStep(2)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                              {current.next}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-6 text-white">{current.step2Title}</h3>
                          <div className="space-y-3">
                            {types.map((type, i) => (
                              <div key={i} onClick={() => setProjectType(type)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${projectType === type ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-[#111827] text-slate-300 hover:border-white/30'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${projectType === type ? 'border-blue-500' : 'border-slate-500'}`}>
                                  {projectType === type && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </div>
                                {type}
                              </div>
                            ))}
                          </div>
                          <div className="mt-auto pt-8 flex justify-between">
                            <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-4 py-2.5 font-medium transition-colors">{current.prev}</button>
                            <button type="button" onClick={() => handleNextStep(3)} disabled={!projectType} className="bg-blue-600 disabled:opacity-50 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                              {current.next}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-6 text-white">{current.step3Title}</h3>
                          <textarea 
                            rows="4" 
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            placeholder={lang === 'ar' ? 'أخبرنا عن فكرتك أو متطلباتك...' : 'Tell us about your idea...'} 
                            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none mb-4" 
                          ></textarea>
                          <div className="mt-auto pt-4 flex justify-between items-center">
                            <button type="button" onClick={() => setStep(2)} className="text-slate-400 hover:text-white px-4 py-2.5 font-medium transition-colors">{current.prev}</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                              {current.submit}
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    );
  };

  export default Contact;