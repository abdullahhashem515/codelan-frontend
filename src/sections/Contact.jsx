import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, CheckCircle2, Clock, Copy, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';
import { apiSendContact, apiGetServices } from '../services/api';
import { SOCIAL_ICONS } from '../utils/socialIcons';

// Two ways in, side by side:
//
//  • WhatsApp first, as a card rather than one row among four. It is how most
//    visitors here actually reach a company, and it needs no form at all.
//  • One short form on a single screen. It used to be a three-step wizard for
//    four fields — the visitor clicked "Next" twice before they could even see
//    where to describe the project, and every extra step loses people.
//
// Errors sit under the field they belong to, not in a banner, and submitting
// with a mistake moves focus to the first field that needs attention.

const FALLBACK_TYPES = {
  ar: ['موقع أو نظام ويب', 'تطبيق هواتف', 'تصميم واجهات', 'شبكات وبنية تحتية', 'كاميرات مراقبة', 'بدالة شبكية', 'أمن سيبراني'],
  en: ['Website or web system', 'Mobile app', 'UI/UX design', 'Networks', 'Security cameras', 'IP PBX', 'Cybersecurity'],
};
const OTHER = { ar: 'شيء آخر', en: 'Something else' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE = 10;

// Limits per field — generous for people, and a hard ceiling on what a script
// can push through the form in one request.
const MAX = { name: 100, email: 254, phone: 30, message: 5000 };

// Anti-spam, invisible to people:
//  • HONEYPOT — a field hidden from sighted users and screen readers alike.
//    Form-filling bots fill every input they find; a person never sees it.
//  • MIN_FILL_MS — nobody reads the form and writes a project description in
//    under a couple of seconds; bots submit instantly.
// A bot caught by the honeypot gets the normal success screen, so it learns
// nothing. A submit that is merely too fast is NOT faked: a real person who
// pastes a prepared message could hit it, and a fake "received" would lose
// their request silently. They are asked to check and press again instead —
// the backend's rate limit (3 a minute, 20 a day) is the real flood guard.
const HONEYPOT = 'company_website';
const MIN_FILL_MS = 2500;

const digits = (s) => String(s ?? '').replace(/\D/g, '');

// The same number was showing as "+967 730 866 638" and "+967730 866 638"
// depending on how it was typed into the admin. One format everywhere.
const formatPhone = (s) => {
  const d = digits(s);
  if (d.length === 12 && d.startsWith('967')) return `+967 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  return String(s ?? '').trim();
};

const T = {
  ar: {
    eyebrow: 'تواصل معنا', title: 'ابدأ مشروعك اليوم',
    sub: 'لديك فكرة؟ نحوّلها إلى واقع رقمي. اختر الطريقة الأنسب لك.',
    waTitle: 'راسلنا على واتساب', waSub: 'أسرع طريقة للوصول إلينا',
    email: 'البريد الإلكتروني', phone: 'الهاتف', location: 'الموقع',
    copy: 'نسخ البريد', copied: 'تم النسخ',
    reply: 'نرد على كل طلب خلال 24 ساعة',
    formTitle: 'أخبرنا عن مشروعك', formSub: 'بضع معلومات وسنعود إليك.',
    typeQ: 'ما نوع مشروعك؟', optional: 'اختياري',
    name: 'الاسم الكامل', namePh: 'مثال: محمد أحمد',
    mail: 'البريد الإلكتروني', mailPh: 'you@example.com',
    tel: 'رقم الهاتف', telPh: '+967 7xx xxx xxx',
    msg: 'تفاصيل المشروع', msgPh: 'ما الذي تريد بناءه؟ من المستخدمون؟ هل لديك موعد تسليم؟',
    submit: 'إرسال الطلب', sending: 'جاري الإرسال...',
    errName: 'اكتب اسمك', errMail: 'اكتب بريدك الإلكتروني', errMailBad: 'صيغة البريد غير صحيحة',
    errMsg: `اكتب ${MIN_MESSAGE} أحرف على الأقل عن مشروعك`, errSend: 'تعذّر الإرسال، حاول مرة أخرى أو راسلنا على واتساب.',
    errFast: 'راجع بياناتك ثم اضغط «إرسال» مرة أخرى.',
    errRate: 'أرسلت عدة طلبات خلال وقت قصير. انتظر دقيقة ثم حاول، أو راسلنا على واتساب.',
    errInvalid: 'بعض البيانات غير مقبولة، راجع البريد ورقم الهاتف ثم حاول مجدداً.',
    ok: 'وصلنا طلبك!', okSub: 'سنتواصل معك قريباً. شكراً لثقتك بـ كودلانكو.',
    okWa: 'تابع معنا على واتساب', again: 'إرسال طلب آخر',
    consentA: 'نستخدم بياناتك للرد على طلبك فقط. ', consentB: 'سياسة الخصوصية',
  },
  en: {
    eyebrow: 'Contact', title: 'Start Your Project Today',
    sub: 'Have an idea? We turn it into digital reality. Pick whichever way suits you.',
    waTitle: 'Message us on WhatsApp', waSub: 'The fastest way to reach us',
    email: 'Email', phone: 'Phone', location: 'Location',
    copy: 'Copy email', copied: 'Copied',
    reply: 'We reply to every request within 24 hours',
    formTitle: 'Tell us about your project', formSub: 'A few details and we will get back to you.',
    typeQ: 'What are you building?', optional: 'optional',
    name: 'Full name', namePh: 'e.g. Mohammed Ahmed',
    mail: 'Email', mailPh: 'you@example.com',
    tel: 'Phone number', telPh: '+967 7xx xxx xxx',
    msg: 'Project details', msgPh: 'What do you want to build? Who is it for? Any deadline?',
    submit: 'Send request', sending: 'Sending...',
    errName: 'Enter your name', errMail: 'Enter your email', errMailBad: 'That email address is not valid',
    errMsg: `Write at least ${MIN_MESSAGE} characters about your project`, errSend: 'Could not send. Try again, or message us on WhatsApp.',
    errFast: 'Check your details, then press Send again.',
    errRate: 'Several requests were sent in a short time. Wait a minute and try again, or message us on WhatsApp.',
    errInvalid: 'Some details were not accepted. Check the email and phone, then try again.',
    ok: 'Request received!', okSub: 'We will be in touch soon. Thank you for trusting Codelanco.',
    okWa: 'Continue on WhatsApp', again: 'Send another request',
    consentA: 'We use your details only to reply to your request. ', consentB: 'Privacy policy',
  },
};

const inputCls = (bad) =>
  `w-full h-12 rounded-xl px-4 bg-gray-50 dark:bg-white/[0.03] border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-[border-color,box-shadow] duration-200 focus:ring-4 ${
    bad
      ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/15'
      : 'border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/15'
  }`;

const Field = ({ id, label, hint, error, children }) => (
  <div>
    <label htmlFor={id} className="flex items-baseline gap-1.5 mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
      {label}
      {hint && <span className="text-xs font-normal text-gray-400 dark:text-slate-500">({hint})</span>}
    </label>
    {children}
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          id={`${id}-err`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1.5 text-xs text-red-600 dark:text-red-400 overflow-hidden"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const Contact = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const ar = lang === 'ar';
  const t = T[lang];

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [type, setType] = useState('');
  const [errors, setErrors] = useState({});
  const [sendError, setSendError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiTypes, setApiTypes] = useState(null);
  const nameRef = useRef(null);
  const openedAt = useRef(0);
  const [trap, setTrap] = useState('');
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => { openedAt.current = Date.now(); }, [sent]);

  // Project types come from the same list the services section shows.
  useEffect(() => {
    let active = true;
    apiGetServices()
      .then(res => {
        if (!active) return;
        const list = (res.data ?? [])
          .map(s => ({ ar: s.title ?? '', en: s.title_en ?? s.title ?? '' }))
          .filter(s => s.ar || s.en);
        if (list.length) setApiTypes(list);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const types = [
    ...(apiTypes ? apiTypes.map(s => (ar ? s.ar : (s.en || s.ar))) : FALLBACK_TYPES[lang]),
    ar ? OTHER.ar : OTHER.en,
  ];

  const wa = settings.whatsapp ? `https://wa.me/${digits(settings.whatsapp)}` : null;
  const address = ar ? settings.addressAr : settings.addressEn;
  // Same number for calls and WhatsApp: show it once, in the phone row, and let
  // the WhatsApp card be the action rather than repeat the digits.
  const samePhone = Boolean(digits(settings.phone)) && digits(settings.phone) === digits(settings.whatsapp);
  const WaIcon = SOCIAL_ICONS.whatsapp;
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t.errName;
    if (!form.email.trim()) e.email = t.errMail;
    else if (!EMAIL_RE.test(form.email.trim())) e.email = t.errMailBad;
    if (form.message.trim().length < MIN_MESSAGE) e.message = t.errMsg;
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (trap) { setSent(true); return; }
    if (Date.now() - openedAt.current < MIN_FILL_MS) {
      openedAt.current = 0; // the second press goes through
      setSendError(t.errFast);
      return;
    }
    const e = validate();
    setErrors(e);
    setSendError('');
    const first = ['name', 'email', 'message'].find(k => e[k]);
    if (first) {
      ({ name: nameRef, email: emailRef, message: messageRef })[first].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await apiSendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        type: type || undefined,
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err) {
      setSendError(err?.status === 429 ? t.errRate : err?.status === 422 ? t.errInvalid : t.errSend);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', phone: '', message: '' });
    setType('');
    setErrors({});
    setSendError('');
    setSent(false);
    setTrap('');
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(settings.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the mailto link still works */ }
  };

  const errProps = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `c-${k}-err` } : {});

  return (
    <section id="contact" className="py-24 bg-gray-100 dark:bg-[#0a0f1e] border-t border-gray-200 dark:border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

        {/* ── Channels ───────────────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <span className="font-mono text-xs uppercase ltr:tracking-[0.2em] text-blue-600 dark:text-blue-400">{t.eyebrow}</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight ltr:leading-tight rtl:leading-[1.4]">{t.title}</h2>
          <p className="mt-4 text-gray-600 dark:text-slate-300 leading-relaxed">{t.sub}</p>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mt-8 flex items-center gap-4 p-5 rounded-2xl bg-[#0b1220] text-white overflow-hidden ring-1 ring-white/10 hover:ring-green-500/50 transition-[box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <span aria-hidden="true" className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-green-500/20 blur-2xl group-hover:bg-green-500/30 transition-colors" />
              <span className="relative shrink-0 w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-[0_8px_24px_rgba(34,197,94,0.35)]">
                <WaIcon size={24} aria-hidden="true" />
              </span>
              <span className="relative flex-1 min-w-0">
                <span className="block font-bold">{t.waTitle}</span>
                <span className="block text-sm text-slate-400">{t.waSub}</span>
                {!samePhone && (
                  <span dir="ltr" className="block mt-1 text-sm text-green-400 font-mono text-start">{formatPhone(settings.whatsapp)}</span>
                )}
              </span>
              <Arrow size={20} aria-hidden="true" className="relative shrink-0 text-slate-400 group-hover:text-white transition-[transform,color] duration-300 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </a>
          )}

          <ul className="mt-6 list-none divide-y divide-gray-200 dark:divide-white/10 border-y border-gray-200 dark:border-white/10">
            {settings.email && (
              <li className="flex items-center gap-4 py-4">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-slate-300"><Mail size={18} /></span>
                <a href={`mailto:${settings.email}`} className="flex-1 min-w-0 group">
                  <span className="block text-xs text-gray-500 dark:text-slate-500">{t.email}</span>
                  <span dir="ltr" className="block font-medium text-gray-900 dark:text-white truncate text-start group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{settings.email}</span>
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? t.copied : t.copy}
                  title={copied ? t.copied : t.copy}
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {copied ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
                </button>
              </li>
            )}
            {settings.phone && (
              <li>
                <a href={`tel:${digits(settings.phone) ? '+' + digits(settings.phone) : settings.phone}`} className="flex items-center gap-4 py-4 group">
                  <span className="shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-slate-300"><Phone size={18} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs text-gray-500 dark:text-slate-500">{t.phone}</span>
                    <span dir="ltr" className="block font-medium text-gray-900 dark:text-white text-start group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{formatPhone(settings.phone)}</span>
                  </span>
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-center gap-4 py-4">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-slate-300"><MapPin size={18} /></span>
                <span>
                  <span className="block text-xs text-gray-500 dark:text-slate-500">{t.location}</span>
                  <span className="block font-medium text-gray-900 dark:text-white">{address}</span>
                </span>
              </li>
            )}
          </ul>

          <p className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Clock size={16} aria-hidden="true" /> {t.reply}
          </p>
        </motion.aside>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <div className="rounded-3xl bg-white dark:bg-[#0d1428] border border-gray-200 dark:border-white/10 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] dark:shadow-2xl p-6 sm:p-8 md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                  role="status"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }} className="flex justify-center mb-4 text-green-500">
                    <CheckCircle2 size={60} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.ok}</h3>
                  <p className="text-gray-600 dark:text-slate-300">{t.okSub}</p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
                        <WaIcon size={16} aria-hidden="true" /> {t.okWa}
                      </a>
                    )}
                    <button type="button" onClick={reset} className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-4 py-2.5 transition-colors">
                      {t.again}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={onSubmit} exit={{ opacity: 0 }} className="space-y-6">
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                    <label htmlFor={HONEYPOT}>Website</label>
                    <input id={HONEYPOT} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.formTitle}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t.formSub}</p>
                  </div>

                  {/* Project type — one click, and optional: a visitor who does
                      not know what to call their project should not be stopped. */}
                  <fieldset>
                    <legend className="flex items-baseline gap-1.5 mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      {t.typeQ} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">({t.optional})</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {types.map((opt) => {
                        const on = type === opt;
                        return (
                          <label
                            key={opt}
                            className={`cursor-pointer select-none rounded-full border px-4 py-2 text-sm transition-[background-color,border-color,color] duration-200 focus-within:ring-2 focus-within:ring-blue-500 ${
                              on
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="projectType"
                              value={opt}
                              checked={on}
                              onChange={() => setType(opt)}
                              onClick={() => { if (on) setType(''); }}
                              className="sr-only"
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field id="c-name" label={t.name} error={errors.name}>
                      <input id="c-name" ref={nameRef} type="text" autoComplete="name" maxLength={MAX.name} value={form.name} onChange={set('name')} placeholder={t.namePh} className={inputCls(errors.name)} {...errProps('name')} />
                    </Field>
                    <Field id="c-email" label={t.mail} error={errors.email}>
                      <input id="c-email" ref={emailRef} type="email" dir="ltr" autoComplete="email" maxLength={MAX.email} value={form.email} onChange={set('email')} placeholder={t.mailPh} className={`${inputCls(errors.email)} text-start`} {...errProps('email')} />
                    </Field>
                  </div>

                  <Field id="c-phone" label={t.tel} hint={t.optional}>
                    <input id="c-phone" type="tel" dir="ltr" autoComplete="tel" maxLength={MAX.phone} value={form.phone} onChange={set('phone')} placeholder={t.telPh} className={`${inputCls(false)} text-start`} />
                  </Field>

                  <Field id="c-message" label={t.msg} error={errors.message}>
                    <textarea id="c-message" ref={messageRef} rows={5} maxLength={MAX.message} value={form.message} onChange={set('message')} placeholder={t.msgPh}
                      className={`${inputCls(errors.message)} h-auto py-3 resize-none leading-relaxed`} {...errProps('message')} />
                  </Field>

                  {sendError && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{sendError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold shadow-[0_10px_30px_-8px_rgba(26,127,255,0.6)] hover:shadow-[0_14px_36px_-8px_rgba(26,127,255,0.75)] disabled:opacity-70 transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> {t.sending}</> : <>{t.submit} <Arrow size={18} aria-hidden="true" /></>}
                  </button>
                  <p className="text-xs text-center text-gray-500 dark:text-slate-400">
                    {t.consentA}
                    <Link to="/privacy" className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white">{t.consentB}</Link>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
