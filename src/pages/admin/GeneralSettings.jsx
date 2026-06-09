// src/pages/admin/GeneralSettings.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Globe, Phone, Mail, MapPin, Share2, Search, Palette,
  Plus, Trash2, GripVertical, Eye, EyeOff, Upload, X, Tag, Save,
} from 'lucide-react';

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white ' +
  'placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

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
  { value: 'facebook',  label: 'Facebook',    icon: '📘' },
  { value: 'twitter',   label: 'Twitter / X', icon: '✖' },
  { value: 'instagram', label: 'Instagram',   icon: '📷' },
  { value: 'linkedin',  label: 'LinkedIn',    icon: '💼' },
  { value: 'github',    label: 'GitHub',      icon: '🐙' },
  { value: 'youtube',   label: 'YouTube',     icon: '▶️' },
  { value: 'tiktok',    label: 'TikTok',      icon: '🎵' },
  { value: 'whatsapp',  label: 'WhatsApp',    icon: '💬' },
  { value: 'telegram',  label: 'Telegram',    icon: '✈️' },
  { value: 'discord',   label: 'Discord',     icon: '🎮' },
  { value: 'custom',    label: 'Custom',      icon: '🔗' },
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
                        'text-slate-500';
  return <span className={`text-xs font-mono tabular-nums ${cls}`}>{n}/{max}</span>;
};

// ─── Utility: image upload with drop-zone preview ────────────────────────────

const ImageUpload = ({ value, onChange, label, hint }) => {
  const ref = useRef();
  return (
    <>
      <div
        onClick={() => ref.current.click()}
        className="border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-2xl p-6
                   flex flex-col items-center gap-3 cursor-pointer transition-colors"
      >
        {value ? (
          <img src={value} alt="preview" className="max-h-40 rounded-xl object-contain" />
        ) : (
          <>
            <Upload size={28} className="text-slate-600" />
            <div className="text-center">
              <p className="text-slate-400 text-sm">{label}</p>
              {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
            </div>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files[0];
          if (file) onChange(URL.createObjectURL(file));
        }}
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
          <p className="text-slate-400 text-sm mb-3">
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
          <p className="text-slate-400 text-sm mb-3">
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
          <label className="flex items-center gap-1 text-slate-400 text-sm mb-2">
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
          <label className="flex items-center gap-1 text-slate-400 text-sm mb-2">
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
          <label className="text-slate-400 text-sm mb-2 block">
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
          <label className="text-slate-400 text-sm mb-2 block">
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
        <label className="flex items-center gap-1 text-slate-400 text-sm mb-2">
          {ar ? 'البريد الإلكتروني' : 'Email Address'}
          <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
        <label className="flex items-center gap-1 text-slate-400 text-sm mb-2">
          {ar ? 'رقم الهاتف' : 'Phone Number'}
          <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
        <label className="text-slate-400 text-sm mb-2 block">
          {ar ? 'رقم واتساب' : 'WhatsApp Number'}
        </label>
        <div className="flex gap-3">
          <select
            value={data.whatsappCountry}
            onChange={e => onChange('whatsappCountry', e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-3 py-3 text-white
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
          <label className="text-slate-400 text-sm mb-2 block">
            {ar ? 'العنوان (عربي)' : 'Address (Arabic)'}
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute start-4 top-4 text-slate-500 pointer-events-none" />
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
          <label className="text-slate-400 text-sm mb-2 block">
            {ar ? 'العنوان (إنجليزي)' : 'Address (English)'}
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute start-4 top-4 text-slate-500 pointer-events-none" />
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
        <p className="text-slate-500 text-sm">
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
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-4
                            flex flex-wrap gap-3 items-center">

              {/* Drag handle — visual only */}
              <GripVertical size={16} className="text-slate-600 cursor-grab flex-shrink-0" />

              {/* Platform dropdown */}
              <select
                value={link.platform}
                onChange={e => updateLink(link.id, 'platform', e.target.value)}
                className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2.5
                           text-white text-sm focus:border-blue-500 outline-none transition-all flex-shrink-0"
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                ))}
              </select>

              {/* URL input */}
              <input
                value={link.url}
                onChange={e => updateLink(link.id, 'url', e.target.value)}
                placeholder={`https://${link.platform !== 'custom' ? link.platform + '.com' : 'example.com'}/...`}
                className="flex-1 min-w-[180px] bg-[#0a0f1e] border border-white/10 rounded-xl
                           px-4 py-2.5 text-white placeholder-slate-600 text-sm
                           focus:border-blue-500 outline-none transition-all"
                dir="ltr"
              />

              {/* Active toggle */}
              <button
                onClick={() => updateLink(link.id, 'active', !link.active)}
                title={link.active ? (ar ? 'تعطيل' : 'Disable') : (ar ? 'تفعيل' : 'Enable')}
                className={`p-2.5 rounded-xl border transition-colors flex-shrink-0 ${
                  link.active
                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
                }`}
              >
                {link.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              {/* Delete with inline confirm */}
              {confirmDelete === link.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-red-400 text-xs">
                    {ar ? 'تأكيد الحذف؟' : 'Delete?'}
                  </span>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs
                               hover:bg-red-500/30 transition-colors"
                  >
                    {ar ? 'نعم' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-xs
                               hover:bg-white/10 transition-colors"
                  >
                    {ar ? 'لا' : 'No'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(link.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20
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
        <div className="py-14 border-2 border-dashed border-white/10 rounded-2xl text-center text-slate-600">
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
            <label className="text-slate-400 text-sm flex items-center gap-1">
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
            <label className="text-slate-400 text-sm flex items-center gap-1">
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
            <label className="text-slate-400 text-sm">
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
            <label className="text-slate-400 text-sm">
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
        <label className="text-slate-400 text-sm mb-2 block">
          {ar ? 'الكلمات المفتاحية (اضغط Enter للإضافة)' : 'Keywords (press Enter to add)'}
        </label>
        <div
          className="bg-[#111827] border border-white/10 rounded-xl p-3 min-h-[56px]
                     flex flex-wrap gap-2 focus-within:border-blue-500 transition-all"
        >
          {data.keywords.map(kw => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20
                         text-blue-400 text-xs px-3 py-1.5 rounded-full"
            >
              <Tag size={10} />
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="hover:text-white transition-colors ms-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            className="bg-transparent flex-1 min-w-[140px] text-white text-sm outline-none placeholder-slate-600"
            placeholder={ar ? 'أضف كلمة مفتاحية...' : 'Add keyword and press Enter...'}
          />
        </div>
      </div>

      {/* Open Graph image */}
      <div>
        <label className="text-slate-400 text-sm mb-2 block">
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

// ─── Tab 5 — Theme ────────────────────────────────────────────────────────────

const SWATCHES = [
  {
    key: 'primary',
    labelAr: 'اللون الأساسي',  labelEn: 'Primary Color',
    hintAr:  'الأزرار والروابط', hintEn: 'Buttons & links',
  },
  {
    key: 'secondary',
    labelAr: 'اللون الثانوي',  labelEn: 'Secondary Color',
    hintAr:  'الحدود والخلفيات', hintEn: 'Borders & backgrounds',
  },
  {
    key: 'accent',
    labelAr: 'لون التمييز',    labelEn: 'Accent Color',
    hintAr:  'الشارات والتوهجات', hintEn: 'Badges & glows',
  },
];

const ThemeTab = ({ lang, data, onChange }) => {
  const ar = lang === 'ar';
  return (
    <div className="space-y-8">

      {/* Color pickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SWATCHES.map(({ key, labelAr, labelEn, hintAr, hintEn }) => (
          <div key={key} className="bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-white font-medium text-sm">{ar ? labelAr : labelEn}</p>
              <p className="text-slate-500 text-xs mt-0.5">{ar ? hintAr : hintEn}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Clickable swatch — native color picker hidden beneath */}
              <div
                className="w-14 h-14 rounded-xl border-2 border-white/10 overflow-hidden
                           cursor-pointer flex-shrink-0 relative"
                style={{ backgroundColor: data[key] }}
              >
                <input
                  type="color"
                  value={data[key]}
                  onChange={e => onChange(key, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {/* Hex text input */}
              <input
                type="text"
                value={data[key]}
                onChange={e => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(key, e.target.value);
                }}
                maxLength={7}
                className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-white
                           text-sm font-mono w-28 focus:border-blue-500 outline-none transition-all"
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
        <p className="text-slate-400 text-sm mb-5">
          {ar ? 'معاينة مباشرة للألوان' : 'Live Color Preview'}
        </p>
        <div className="space-y-5">

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              style={{ backgroundColor: data.primary }}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              {ar ? 'زر رئيسي' : 'Primary Button'}
            </button>
            <button
              style={{ borderColor: data.secondary, color: data.secondary }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border-2 bg-transparent"
            >
              {ar ? 'زر ثانوي' : 'Secondary Button'}
            </button>
            <span
              style={{
                backgroundColor: `${data.accent}22`,
                color: data.accent,
                borderColor: `${data.accent}44`,
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs border font-medium"
            >
              {ar ? 'شارة' : 'Badge'}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <p className="text-slate-500 text-xs mb-2">{ar ? 'شريط التقدم' : 'Progress bar'}</p>
            <div className="h-2 bg-[#0a0f1e] rounded-full overflow-hidden">
              <div
                style={{ width: '68%', backgroundColor: data.primary }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Inline link */}
          <p className="text-slate-400 text-sm">
            {ar ? 'مثال على رابط: ' : 'Link example: '}
            <span style={{ color: data.primary }} className="cursor-pointer hover:opacity-80 transition-opacity">
              {ar ? 'رابط تجريبي' : 'Sample link'}
            </span>
          </p>

          {/* Accent glow card */}
          <div
            style={{
              boxShadow: `0 0 20px ${data.accent}28`,
              borderColor: `${data.accent}33`,
            }}
            className="bg-[#0a0f1e] border rounded-xl p-4"
          >
            <p className="text-sm" style={{ color: data.accent }}>
              {ar ? 'بطاقة مع توهج لون التمييز' : 'Card with accent color glow'}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const GeneralSettings = ({ lang }) => {
  const ar = lang === 'ar';
  const [activeTab, setActiveTab] = useState('identity');

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

  const [theme, setTheme] = useState({
    primary:   '#3b82f6',
    secondary: '#ef4444',
    accent:    '#8b5cf6',
  });

  // ── Generic field updater factory ──────────────────────────────────────────
  // Returns an (key, value) => void setter that patches only one field.
  const setField = (setter) => (key, value) =>
    setter(prev => ({ ...prev, [key]: value }));

  // ── Toast style ────────────────────────────────────────────────────────────

  const toastStyle = {
    style: {
      background: '#111827',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  // Checks required fields; switches to the offending tab and shows an error.

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

  const handleSave = () => {
    if (!validate()) return;
    toast.success(
      ar ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!',
      { ...toastStyle, iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
    );
  };

  // ── Tab content map ────────────────────────────────────────────────────────

  const tabContent = {
    identity: <SiteIdentityTab lang={lang} data={identity}    onChange={setField(setIdentity)} />,
    contact:  <ContactInfoTab  lang={lang} data={contact}     onChange={setField(setContact)}  />,
    social:   <SocialLinksTab  lang={lang} links={socialLinks} setLinks={setSocialLinks}        />,
    seo:      <SEOTab          lang={lang} data={seo}         onChange={setField(setSeo)}      />,
    theme:    <ThemeTab        lang={lang} data={theme}       onChange={setField(setTheme)}    />,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Toast portal — react-hot-toast portals to document.body from anywhere */}
      <Toaster position="top-center" />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          {ar ? 'الإعدادات العامة' : 'General Settings'}
        </h1>
        <p className="text-slate-500 text-sm">
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
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
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
      <div className="bg-[#0a0f1e]/50 border border-white/5 rounded-2xl p-6 md:p-8">
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
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                       px-6 py-3 rounded-xl font-semibold transition-all duration-200
                       shadow-[0_0_20px_rgba(59,130,246,0.2)]
                       hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:-translate-y-0.5"
          >
            <Save size={18} />
            {ar ? 'حفظ التغييرات' : 'Save Changes'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default GeneralSettings;
