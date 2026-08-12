// src/pages/admin/GeneralSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Globe, Phone, Mail, MapPin, Share2, Search, Palette,
  Plus, Trash2, GripVertical, Eye, EyeOff, Upload, X, Tag, Save, RotateCcw,
  Sun, Moon, Link2,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useTheme, DEFAULT_LIGHT, DEFAULT_DARK } from '../../context/ThemeContext';
import { SOCIAL_ICONS } from '../../utils/socialIcons';
import { apiGetSettings, apiUpdateSettings, apiUploadFile } from '../../services/api';
import { getDiff } from '../../utils/diff';

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'identity', labelAr: 'هوية الموقع',        labelEn: 'Site Identity', Icon: Globe   },
  { id: 'contact',  labelAr: 'معلومات التواصل',    labelEn: 'Contact Info',  Icon: Phone   },
  { id: 'social',   labelAr: 'التواصل الاجتماعي', labelEn: 'Social Links',  Icon: Share2  },
  { id: 'seo',      labelAr: 'إعدادات SEO',        labelEn: 'SEO Settings',  Icon: Search  },
  { id: 'theme',    labelAr: 'الألوان والمظهر',    labelEn: 'Theme',         Icon: Palette },
];

// ─── Social platforms ─────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: 'facebook',  label: 'Facebook'    },
  { value: 'twitter',   label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram'   },
  { value: 'linkedin',  label: 'LinkedIn'    },
  { value: 'github',    label: 'GitHub'      },
  { value: 'youtube',   label: 'YouTube'     },
  { value: 'tiktok',    label: 'TikTok'      },
  { value: 'whatsapp',  label: 'WhatsApp'    },
  { value: 'telegram',  label: 'Telegram'    },
  { value: 'discord',   label: 'Discord'     },
  { value: 'custom',    label: 'Custom'      },
];

// ─── Country calling codes ────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '+967', flag: '🇾🇪' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+973', flag: '🇧🇭' },
  { code: '+974', flag: '🇶🇦' },
  { code: '+1',   flag: '🇺🇸' },
  { code: '+44',  flag: '🇬🇧' },
];

// ─── Utility: character counter badge ────────────────────────────────────────

const CharCounter = ({ value = '', max }) => {
  const n = value.length;
  const cls =
    n >= max          ? 'text-red-400'    :
    n > max * 0.75    ? 'text-yellow-400' :
                        'text-gray-400 dark:text-slate-500';
  return <span className={`text-xs font-mono tabular-nums ${cls}`}>{n}/{max}</span>;
};

// ─── Utility: image upload with drop-zone preview ────────────────────────────

const ImageUpload = ({ value, onChange, label, hint }) => {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiUploadFile(form);
      onChange(res.data.url);
    } catch {
      toast.error('فشل رفع الصورة — حاول مرة أخرى', {
        style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => !uploading && ref.current.click()}
        className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 rounded-2xl p-6
                   flex flex-col items-center gap-3 cursor-pointer transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-500">
            <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-xs">جاري الرفع...</span>
          </div>
        ) : value ? (
          <img src={value} alt="preview" className="max-h-40 rounded-xl object-contain" />
        ) : (
          <>
            <Upload size={28} className="text-gray-400 dark:text-slate-600" />
            <div className="text-center">
              <p className="text-gray-500 dark:text-slate-400 text-sm">{label}</p>
              {hint && <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">{hint}</p>}
            </div>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </>
  );
};

// ─── Tab 1 — Site Identity ────────────────────────────────────────────────────

const SiteIdentityTab = ({ lang, data, onChange }) => {
  const ar = lang === 'ar';
  return (
    <div className="space-y-8">

      {/* Logo & Favicon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">
            {ar ? 'شعار الموقع (Logo)' : 'Site Logo'}
          </p>
          <ImageUpload
            value={data.logo}
            onChange={v => onChange('logo', v)}
            label={ar ? 'اضغط لرفع الشعار' : 'Click to upload logo'}
            hint="PNG / SVG — max 2 MB"
          />
        </div>
        <div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">
            {ar ? 'أيقونة الموقع (Favicon)' : 'Favicon'}
          </p>
          <ImageUpload
            value={data.favicon}
            onChange={v => onChange('favicon', v)}
            label={ar ? 'اضغط لرفع الفيفيكون' : 'Click to upload favicon'}
            hint="ICO / PNG — 32×32 px"
          />
        </div>
      </div>

      {/* Site names — required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-sm mb-2">
            {ar ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
            <span className="text-red-400">*</span>
          </label>
          <input
            className={inputCls}
            value={data.siteNameAr}
            onChange={e => onChange('siteNameAr', e.target.value)}
            placeholder="كود لان"
            dir="rtl"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-sm mb-2">
            {ar ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
            <span className="text-red-400">*</span>
          </label>
          <input
            className={inputCls}
            value={data.siteNameEn}
            onChange={e => onChange('siteNameEn', e.target.value)}
            placeholder="CodeLAN"
            dir="ltr"
          />
        </div>
      </div>

      {/* Taglines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
            {ar ? 'الشعار النصي (عربي)' : 'Tagline (Arabic)'}
          </label>
          <input
            className={inputCls}
            value={data.taglineAr}
            onChange={e => onChange('taglineAr', e.target.value)}
            placeholder="نبني مستقبلك التقني"
            dir="rtl"
          />
        </div>
        <div>
          <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
            {ar ? 'الشعار النصي (إنجليزي)' : 'Tagline (English)'}
          </label>
          <input
            className={inputCls}
            value={data.taglineEn}
            onChange={e => onChange('taglineEn', e.target.value)}
            placeholder="We Build Your Tech Future"
            dir="ltr"
          />
        </div>
      </div>

    </div>
  );
};

// ─── Tab 2 — Contact Info ─────────────────────────────────────────────────────

const ContactInfoTab = ({ lang, data, onChange }) => {
  const ar = lang === 'ar';
  return (
    <div className="space-y-6">

      {/* Email — required */}
      <div>
        <label className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-sm mb-2">
          {ar ? 'البريد الإلكتروني' : 'Email Address'}
          <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input
            className={`${inputCls} ps-10`}
            type="email"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="info@codelan.com"
            dir="ltr"
          />
        </div>
      </div>

      {/* Phone — required */}
      <div>
        <label className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-sm mb-2">
          {ar ? 'رقم الهاتف' : 'Phone Number'}
          <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input
            className={`${inputCls} ps-10`}
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+967 770 000 000"
            dir="ltr"
          />
        </div>
      </div>

      {/* WhatsApp with country code selector */}
      <div>
        <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
          {ar ? 'رقم واتساب' : 'WhatsApp Number'}
        </label>
        <div className="flex gap-3">
          <select
            value={data.whatsappCountry}
            onChange={e => onChange('whatsappCountry', e.target.value)}
            className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 text-gray-900 dark:text-white
                       focus:border-blue-500 outline-none transition-all text-sm flex-shrink-0"
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
          <input
            className={inputCls}
            value={data.whatsapp}
            onChange={e => onChange('whatsapp', e.target.value)}
            placeholder="770 000 000"
            dir="ltr"
          />
        </div>
      </div>

      {/* Address — bilingual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
            {ar ? 'العنوان (عربي)' : 'Address (Arabic)'}
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute start-4 top-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
            <textarea
              className={`${inputCls} ps-10 resize-none h-24`}
              value={data.addressAr}
              onChange={e => onChange('addressAr', e.target.value)}
              placeholder="حضرموت - المكلا، اليمن"
              dir="rtl"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
            {ar ? 'العنوان (إنجليزي)' : 'Address (English)'}
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute start-4 top-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
            <textarea
              className={`${inputCls} ps-10 resize-none h-24`}
              value={data.addressEn}
              onChange={e => onChange('addressEn', e.target.value)}
              placeholder="Hadhramaut - Al-Mukalla, Yemen"
              dir="ltr"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

// ─── Tab 3 — Social Links ─────────────────────────────────────────────────────

const SocialLinksTab = ({ lang, links, setLinks }) => {
  const ar = lang === 'ar';
  const [confirmDelete, setConfirmDelete] = useState(null);

  const addLink = () =>
    setLinks(prev => [...prev, { id: Date.now(), platform: 'facebook', url: '', active: true }]);

  const updateLink = (id, field, value) =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const removeLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 dark:text-slate-500 text-sm">
          {ar ? `${links.length} روابط مضافة` : `${links.length} links added`}
        </p>
        <button
          onClick={addLink}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                     text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          {ar ? 'إضافة رابط' : 'Add Link'}
        </button>
      </div>

      {/* Links list */}
      <AnimatePresence initial={false}>
        {links.map(link => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl p-4
                            flex flex-wrap gap-3 items-center">

              {/* Drag handle — visual only */}
              <GripVertical size={16} className="text-gray-400 dark:text-slate-600 cursor-grab flex-shrink-0" />

              {/* Platform brand icon */}
              {(() => {
                const PlatformIcon = SOCIAL_ICONS[link.platform] ?? Link2;
                return <PlatformIcon size={18} className="text-gray-500 dark:text-slate-400 flex-shrink-0" />;
              })()}

              {/* Platform dropdown */}
              <select
                value={link.platform}
                onChange={e => updateLink(link.id, 'platform', e.target.value)}
                className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5
                           text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all flex-shrink-0"
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {/* URL input */}
              <input
                value={link.url}
                onChange={e => updateLink(link.id, 'url', e.target.value)}
                placeholder={`https://${link.platform !== 'custom' ? link.platform + '.com' : 'example.com'}/...`}
                className="flex-1 min-w-[180px] bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-xl
                           px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 text-sm
                           focus:border-blue-500 outline-none transition-all"
                dir="ltr"
              />

              {/* Active toggle */}
              <button
                onClick={() => updateLink(link.id, 'active', !link.active)}
                title={link.active ? (ar ? 'تعطيل' : 'Disable') : (ar ? 'تفعيل' : 'Enable')}
                className={`p-2.5 rounded-xl border transition-colors flex-shrink-0 ${
                  link.active
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {link.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              {/* Delete with inline confirm */}
              {confirmDelete === link.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-red-500 dark:text-red-400 text-xs">
                    {ar ? 'تأكيد الحذف؟' : 'Delete?'}
                  </span>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg text-xs
                               hover:bg-red-500/30 transition-colors"
                  >
                    {ar ? 'نعم' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 rounded-lg text-xs
                               hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  >
                    {ar ? 'لا' : 'No'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(link.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20
                             hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}

            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {links.length === 0 && (
        <div className="py-14 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 dark:text-slate-600">
          {ar
            ? 'لا توجد روابط. أضف روابطك الاجتماعية.'
            : 'No links yet. Add your social profiles.'}
        </div>
      )}

    </div>
  );
};

// ─── Tab 4 — SEO ──────────────────────────────────────────────────────────────

const SEOTab = ({ lang, data, onChange }) => {
  const ar = lang === 'ar';
  const [keyword, setKeyword] = useState('');

  const handleAddKeyword = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const kw = keyword.trim();
    if (kw && !data.keywords.includes(kw)) {
      onChange('keywords', [...data.keywords, kw]);
    }
    setKeyword('');
  };

  const removeKeyword = (kw) =>
    onChange('keywords', data.keywords.filter(k => k !== kw));

  return (
    <div className="space-y-6">

      {/* Meta Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-1">
              {ar ? 'عنوان الصفحة (عربي)' : 'Meta Title (AR)'}
              <span className="text-red-400">*</span>
            </label>
            <CharCounter value={data.metaTitleAr} max={60} />
          </div>
          <input
            className={inputCls}
            value={data.metaTitleAr}
            onChange={e => onChange('metaTitleAr', e.target.value.slice(0, 60))}
            placeholder="كود لان | فريق التطوير البرمجي"
            dir="rtl"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-1">
              {ar ? 'عنوان الصفحة (إنجليزي)' : 'Meta Title (EN)'}
              <span className="text-red-400">*</span>
            </label>
            <CharCounter value={data.metaTitleEn} max={60} />
          </div>
          <input
            className={inputCls}
            value={data.metaTitleEn}
            onChange={e => onChange('metaTitleEn', e.target.value.slice(0, 60))}
            placeholder="CodeLAN | Software Dev Team"
            dir="ltr"
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-500 dark:text-slate-400 text-sm">
              {ar ? 'وصف الصفحة (عربي)' : 'Meta Description (AR)'}
            </label>
            <CharCounter value={data.metaDescAr} max={160} />
          </div>
          <textarea
            className={`${inputCls} resize-none h-28`}
            value={data.metaDescAr}
            onChange={e => onChange('metaDescAr', e.target.value.slice(0, 160))}
            placeholder="نصمم ونبني منتجات رقمية استثنائية..."
            dir="rtl"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-500 dark:text-slate-400 text-sm">
              {ar ? 'وصف الصفحة (إنجليزي)' : 'Meta Description (EN)'}
            </label>
            <CharCounter value={data.metaDescEn} max={160} />
          </div>
          <textarea
            className={`${inputCls} resize-none h-28`}
            value={data.metaDescEn}
            onChange={e => onChange('metaDescEn', e.target.value.slice(0, 160))}
            placeholder="We design and build exceptional digital products..."
            dir="ltr"
          />
        </div>
      </div>

      {/* Keywords tags input */}
      <div>
        <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
          {ar ? 'الكلمات المفتاحية (اضغط Enter للإضافة)' : 'Keywords (press Enter to add)'}
        </label>
        <div
          className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[56px]
                     flex flex-wrap gap-2 focus-within:border-blue-500 transition-all"
        >
          {data.keywords.map(kw => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20
                         text-blue-500 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full"
            >
              <Tag size={10} />
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="hover:text-blue-700 dark:hover:text-white transition-colors ms-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            className="bg-transparent flex-1 min-w-[140px] text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 dark:placeholder-slate-600"
            placeholder={ar ? 'أضف كلمة مفتاحية...' : 'Add keyword and press Enter...'}
          />
        </div>
      </div>

      {/* Open Graph image */}
      <div>
        <label className="text-gray-500 dark:text-slate-400 text-sm mb-2 block">
          {ar ? 'صورة Open Graph (للمشاركة الاجتماعية)' : 'Open Graph Image (social sharing)'}
        </label>
        <ImageUpload
          value={data.ogImage}
          onChange={v => onChange('ogImage', v)}
          label={ar ? 'اضغط لرفع الصورة' : 'Click to upload image'}
          hint="1200 × 630 px — JPG / PNG"
        />
      </div>

    </div>
  );
};

// ─── Tab 5 — Theme (Dynamic Color System) ────────────────────────────────────

const COLOR_ROWS = [
  {
    group: 'brand',
    groupLabelAr: 'ألوان العلامة التجارية',
    groupLabelEn: 'Brand Colors',
    items: [
      { key: 'accent',  labelAr: 'اللون الأساسي',  labelEn: 'Primary Color',   hintAr: 'الأزرار، الروابط، شريط التقدم',   hintEn: 'Buttons, links, progress bar'   },
      { key: 'accent2', labelAr: 'اللون الثانوي',  labelEn: 'Secondary Color', hintAr: 'الحدود والأطر الثانوية',           hintEn: 'Secondary borders & outlines'   },
      { key: 'accent3', labelAr: 'لون التمييز',    labelEn: 'Accent Color',    hintAr: 'الشارات والتوهجات',                hintEn: 'Badges & glows'                 },
    ],
  },
  {
    group: 'bg',
    groupLabelAr: 'ألوان الخلفيات',
    groupLabelEn: 'Backgrounds',
    items: [
      { key: 'bgBase',     labelAr: 'خلفية الصفحة',    labelEn: 'Page Background',  hintAr: 'الخلفية الأساسية للتطبيق',   hintEn: 'Base application background' },
      { key: 'bgCard',     labelAr: 'خلفية البطاقات',   labelEn: 'Card Surface',     hintAr: 'بطاقات وألواح المحتوى',      hintEn: 'Content cards & panels'      },
      { key: 'bgElevated', labelAr: 'السطح المرتفع',    labelEn: 'Elevated Surface', hintAr: 'العناصر الداخلية المرفوعة',  hintEn: 'Nested / inner elements'     },
    ],
  },
  {
    group: 'text',
    groupLabelAr: 'ألوان النصوص',
    groupLabelEn: 'Typography',
    items: [
      { key: 'textBase',  labelAr: 'النص الأساسي', labelEn: 'Body Text',  hintAr: 'النص الرئيسي للمحتوى',     hintEn: 'Primary content text'     },
      { key: 'textMuted', labelAr: 'النص الثانوي', labelEn: 'Muted Text', hintAr: 'النصوص الثانوية والرمادية', hintEn: 'Subtle / secondary text'  },
    ],
  },
];

const ThemeTab = ({ lang, lightColors, darkColors, onLightChange, onDarkChange, onReset }) => {
  const ar = lang === 'ar';
  const [activeMode, setActiveMode] = useState('dark');

  const colors   = activeMode === 'light' ? lightColors : darkColors;
  const onChange = activeMode === 'light' ? onLightChange : onDarkChange;

  return (
    <div className="space-y-8">

      {/* Mode switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl w-fit">
        {[
          { mode: 'light', Icon: Sun,  labelAr: 'الوضع الفاتح', labelEn: 'Light Mode' },
          { mode: 'dark',  Icon: Moon, labelAr: 'الوضع الداكن', labelEn: 'Dark Mode'  },
        ].map(({ mode, Icon, labelAr, labelEn }) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeMode === mode
                ? 'bg-white dark:bg-[#0a0f1e] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon size={15} />
            {ar ? labelAr : labelEn}
          </button>
        ))}
      </div>

      {/* Color groups */}
      {COLOR_ROWS.map(({ group, groupLabelAr, groupLabelEn, items }) => (
        <div key={group}>
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            {ar ? groupLabelAr : groupLabelEn}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(({ key, labelAr, labelEn, hintAr, hintEn }) => (
              <div
                key={key}
                className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{ar ? labelAr : labelEn}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">{ar ? hintAr : hintEn}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-white/10
                               cursor-pointer flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: colors[key] }}
                  >
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={e => onChange(key, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={colors[key]}
                    onChange={e => {
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(key, e.target.value);
                    }}
                    maxLength={7}
                    className="flex-1 bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10
                               rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm font-mono
                               focus:border-blue-500 outline-none transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Live preview */}
      <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-900 dark:text-white text-sm font-semibold">
            {ar ? 'معاينة مباشرة' : 'Live Preview'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
            {activeMode === 'light' ? <Sun size={12} /> : <Moon size={12} />}
            {ar
              ? (activeMode === 'light' ? 'الوضع الفاتح' : 'الوضع الداكن')
              : (activeMode === 'light' ? 'Light Mode'   : 'Dark Mode')}
          </span>
        </div>

        {/* Mini UI skin */}
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: colors.bgBase, borderColor: colors.border }}>

          {/* Toolbar */}
          <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
            </div>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.bgElevated }} />
            <div
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: colors.accent }}
            >
              {ar ? 'حفظ' : 'Save'}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="rounded-xl p-4 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <p className="font-semibold text-sm mb-1" style={{ color: colors.textBase }}>
                {ar ? 'عنوان البطاقة' : 'Card Title'}
              </p>
              <p className="text-xs" style={{ color: colors.textMuted }}>
                {ar ? 'نص توضيحي ثانوي للعنصر' : 'Secondary descriptive text inside the card'}
              </p>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgElevated }}>
                <div className="h-full w-3/5 rounded-full" style={{ backgroundColor: colors.accent }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: colors.accent }}>
                {ar ? 'رئيسي' : 'Primary'}
              </button>
              <button
                className="px-4 py-1.5 rounded-lg text-xs font-medium border-2 bg-transparent"
                style={{ borderColor: colors.accent2, color: colors.accent2 }}
              >
                {ar ? 'ثانوي' : 'Secondary'}
              </button>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs border font-medium"
                style={{ backgroundColor: `${colors.accent3}22`, color: colors.accent3, borderColor: `${colors.accent3}44` }}
              >
                {ar ? 'شارة' : 'Badge'}
              </span>
              <span style={{ color: colors.accent }} className="text-xs font-medium cursor-pointer">
                {ar ? 'رابط ←' : '→ Link'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-600 mt-3">
          {ar
            ? 'التغييرات تُطبَّق فورياً عبر CSS Variables. اضغط "حفظ" لتثبيتها.'
            : 'Changes apply instantly via CSS Variables. Press "Save" to persist.'}
        </p>
      </div>

      {/* Reset row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {ar ? 'استعادة الألوان الافتراضية' : 'Restore default colors'}
        </p>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-100 dark:bg-white/5
                     text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10
                     rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <RotateCcw size={14} />
          {ar ? 'إعادة التعيين' : 'Reset Defaults'}
        </button>
      </div>

    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const GeneralSettings = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const { customColors, previewColors, saveCustomColors, resetColors } = useTheme();
  const [activeTab, setActiveTab] = useState('identity');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  // ── Per-tab state ──────────────────────────────────────────────────────────

  const [identity, setIdentity] = useState({
    logo: null,
    favicon: null,
    siteNameAr: 'كود لان التقنية',
    siteNameEn: 'CodeLAN Tech',
    taglineAr: 'نبني مستقبلك التقني',
    taglineEn: 'We Build Your Tech Future',
  });

  const [contact, setContact] = useState({
    email: 'info@codelan.com',
    phone: '+967 770 000 000',
    whatsappCountry: '+967',
    whatsapp: '770 000 000',
    addressAr: 'حضرموت - المكلا، اليمن',
    addressEn: 'Hadhramaut - Al-Mukalla, Yemen',
  });

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: 'facebook', url: 'https://facebook.com/codelan',  active: true  },
    { id: 2, platform: 'github',   url: 'https://github.com/codelan',    active: true  },
    { id: 3, platform: 'whatsapp', url: 'https://wa.me/967770000000',    active: true  },
    { id: 4, platform: 'telegram', url: 'https://t.me/codelan',          active: false },
  ]);

  const [seo, setSeo] = useState({
    metaTitleAr: 'كود لان | فريق التطوير البرمجي',
    metaTitleEn: 'CodeLAN | Software Dev Team',
    metaDescAr: 'نصمم ونبني منتجات رقمية استثنائية من حضرموت اليمن',
    metaDescEn: 'We design and build exceptional digital products from Hadhramaut, Yemen',
    keywords: ['React', 'Laravel', 'Web Development', 'SaaS', 'Yemen'],
    ogImage: null,
  });

  const [lightColors,  setLightColors]  = useState(() => ({ ...customColors.light }));
  const [darkColors,   setDarkColors]   = useState(() => ({ ...customColors.dark  }));

  const initialPayloadRef = useRef(null);

  // ── Load settings from API on mount ───────────────────────────────────────

  useEffect(() => {
    apiGetSettings()
      .then(res => {
        const s = res.data ?? {};
        // ── Tab 1: هوية الموقع ──────────────────────────────────────────
        setIdentity(prev => ({
          ...prev,
          logo:       s.logo_url        ?? prev.logo,
          favicon:    s.favicon         ?? prev.favicon,
          siteNameAr: s.company_name    ?? prev.siteNameAr,
          siteNameEn: s.company_name_en ?? prev.siteNameEn,
          taglineAr:  s.tagline         ?? prev.taglineAr,
          taglineEn:  s.tagline_en      ?? prev.taglineEn,
        }));

        // ── Tab 2: معلومات التواصل ──────────────────────────────────────
        const savedWa = s.whatsapp ?? '';
        let waCountry = '+967';
        let waNumber  = savedWa;
        if (savedWa) {
          const match = COUNTRY_CODES.find(c => savedWa.startsWith(c.code));
          if (match) { waCountry = match.code; waNumber = savedWa.slice(match.code.length).trim(); }
        }
        setContact(prev => ({
          ...prev,
          email:           s.email      ?? prev.email,
          phone:           s.phone      ?? prev.phone,
          whatsappCountry: waCountry,
          whatsapp:        waNumber,
          addressAr:       s.address    ?? prev.addressAr,
          addressEn:       s.address_en ?? prev.addressEn,
        }));

        // ── Tab 3: روابط التواصل الاجتماعي (حقول منفصلة في البيانات) ──
        const fromFields = [
          { platform: 'facebook',  url: s.facebook  },
          { platform: 'twitter',   url: s.twitter   },
          { platform: 'instagram', url: s.instagram },
          { platform: 'linkedin',  url: s.linkedin  },
          { platform: 'github',    url: s.github    },
          { platform: 'youtube',   url: s.youtube   },
          { platform: 'tiktok',    url: s.tiktok    },
          { platform: 'telegram',  url: s.telegram  },
          { platform: 'discord',   url: s.discord   },
        ].filter(l => l.url).map((l, i) => ({ id: Date.now() + i, ...l, active: true }));
        if (fromFields.length > 0) setSocialLinks(fromFields);

        // ── Tab 4: SEO ──────────────────────────────────────────────────
        setSeo(prev => ({
          ...prev,
          metaTitleAr: s.meta_title          ?? prev.metaTitleAr,
          metaTitleEn: s.meta_title_en       ?? prev.metaTitleEn,
          metaDescAr:  s.meta_description    ?? prev.metaDescAr,
          metaDescEn:  s.meta_description_en ?? prev.metaDescEn,
          ogImage:     s.og_image            ?? prev.ogImage,
          keywords: Array.isArray(s.keywords)
            ? s.keywords
            : (typeof s.keywords === 'string' && s.keywords
                ? s.keywords.split(',').map(k => k.trim()).filter(Boolean)
                : prev.keywords),
        }));

        // ── Tab 5: الألوان والخطوط ──────────────────────────────────────
        if (s.theme_light) {
          try {
            const lc = typeof s.theme_light === 'string' ? JSON.parse(s.theme_light) : s.theme_light;
            setLightColors(prev => ({ ...prev, ...lc }));
          } catch {}
        }
        if (s.theme_dark) {
          try {
            const dc = typeof s.theme_dark === 'string' ? JSON.parse(s.theme_dark) : s.theme_dark;
            setDarkColors(prev => ({ ...prev, ...dc }));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setField = (setter) => (key, value) =>
    setter(prev => ({ ...prev, [key]: value }));

  const onLightChange = (key, val) => {
    setLightColors(prev => {
      const next = { ...prev, [key]: val };
      previewColors(next, darkColors);
      return next;
    });
  };

  const onDarkChange = (key, val) => {
    setDarkColors(prev => {
      const next = { ...prev, [key]: val };
      previewColors(lightColors, next);
      return next;
    });
  };

  const onResetColors = () => {
    resetColors();
    setLightColors({ ...DEFAULT_LIGHT });
    setDarkColors({ ...DEFAULT_DARK });
  };

  // Builds the full settings payload from current state.
  // Used both for saving and for dirty-tracking comparisons.
  const buildPayload = () => {
    const sf = (p) => socialLinks.find(l => l.platform === p && l.url)?.url ?? null;
    return {
      company_name:        identity.siteNameAr,
      company_name_en:     identity.siteNameEn,
      tagline:             identity.taglineAr,
      tagline_en:          identity.taglineEn,
      logo_url:            identity.logo    || null,
      favicon:             identity.favicon || null,
      email:               contact.email,
      phone:               contact.phone,
      whatsapp:            contact.whatsapp
        ? `${contact.whatsappCountry}${contact.whatsapp}`.trim()
        : null,
      address:             contact.addressAr,
      address_en:          contact.addressEn,
      facebook:            sf('facebook'),
      twitter:             sf('twitter'),
      instagram:           sf('instagram'),
      linkedin:            sf('linkedin'),
      github:              sf('github'),
      youtube:             sf('youtube'),
      tiktok:              sf('tiktok'),
      telegram:            sf('telegram'),
      discord:             sf('discord'),
      meta_title:          seo.metaTitleAr,
      meta_title_en:       seo.metaTitleEn,
      meta_description:    seo.metaDescAr,
      meta_description_en: seo.metaDescEn,
      keywords:            seo.keywords.join(', '),
      og_image:            seo.ogImage || null,
      theme_light:         lightColors,
      theme_dark:          darkColors,
    };
  };

  const toastStyle = {
    style: {
      background: '#111827',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  };

  const validate = () => {
    if (!identity.siteNameAr.trim() || !identity.siteNameEn.trim()) {
      toast.error(
        ar ? 'يرجى إدخال اسم الموقع بالعربي والإنجليزي.' : 'Site name (AR & EN) is required.',
        toastStyle,
      );
      setActiveTab('identity');
      return false;
    }
    if (!contact.email.trim() || !contact.phone.trim()) {
      toast.error(
        ar ? 'البريد الإلكتروني والهاتف مطلوبان.' : 'Email and phone are required.',
        toastStyle,
      );
      setActiveTab('contact');
      return false;
    }
    if (!seo.metaTitleAr.trim() || !seo.metaTitleEn.trim()) {
      toast.error(
        ar ? 'يرجى إدخال عنوان الصفحة بالعربي والإنجليزي.' : 'Meta titles (AR & EN) are required.',
        toastStyle,
      );
      setActiveTab('seo');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    saveCustomColors(lightColors, darkColors);
    try {
      const payload = buildPayload();
      const toSend  = getDiff(payload, initialPayloadRef.current);

      if (Object.keys(toSend).length === 0) {
        toast(ar ? 'لا توجد تغييرات للحفظ' : 'No changes to save', {
          icon: 'ℹ️',
          style: toastStyle.style,
        });
        return;
      }

      await apiUpdateSettings(toSend);
      initialPayloadRef.current = payload;
      toast.success(
        ar ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!',
        { ...toastStyle, iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
      );
    } catch (err) {
      toast.error(
        err?.message ?? (ar ? 'فشل حفظ الإعدادات' : 'Failed to save settings'),
        toastStyle,
      );
    } finally {
      setSaving(false);
    }
  };

  const tabContent = {
    identity: <SiteIdentityTab lang={lang} data={identity}    onChange={setField(setIdentity)} />,
    contact:  <ContactInfoTab  lang={lang} data={contact}     onChange={setField(setContact)}  />,
    social:   <SocialLinksTab  lang={lang} links={socialLinks} setLinks={setSocialLinks}        />,
    seo:      <SEOTab          lang={lang} data={seo}         onChange={setField(setSeo)}      />,
    theme: (
      <ThemeTab
        lang={lang}
        lightColors={lightColors}
        darkColors={darkColors}
        onLightChange={onLightChange}
        onDarkChange={onDarkChange}
        onReset={onResetColors}
      />
    ),
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-slate-500">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm">{ar ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</span>
      </div>
    </div>
  );

  return (
    <div>
      <Toaster position="top-center" />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {ar ? 'الإعدادات العامة' : 'General Settings'}
        </h1>
        <p className="text-gray-500 dark:text-slate-500 text-sm">
          {ar
            ? 'إدارة هوية الموقع، بيانات التواصل، والمظهر'
            : 'Manage site identity, contact info, and appearance'}
        </p>
      </div>

      {/* Tab navigation — horizontally scrollable on mobile */}
      <div className="overflow-x-auto pb-1 mb-6 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {TABS.map(({ id, labelAr, labelEn, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all whitespace-nowrap ${
                              active
                                ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/20'
                                : 'text-gray-500 dark:text-slate-400 border border-transparent hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                            }`}
              >
                <Icon size={16} />
                {ar ? labelAr : labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content card */}
      <div className="bg-white/50 dark:bg-[#0a0f1e]/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>

        {/* Save button — bottom of every tab */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                       px-6 py-3 rounded-xl font-semibold transition-all duration-200
                       shadow-[0_0_20px_rgba(59,130,246,0.2)]
                       hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:-translate-y-0.5
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? (
              <svg className="animate-spin w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Save size={18} />
            )}
            {saving
              ? (ar ? 'جاري الحفظ...' : 'Saving...')
              : (ar ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </div>

    </div>
  );
};

export default GeneralSettings;
