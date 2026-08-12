import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGetSettings } from '../services/api';
import { DEFAULT_LIGHT, DEFAULT_DARK } from './ThemeContext';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

const CACHE_KEY = 'cl_settings_v1';

const DEFAULTS = {
  siteNameAr:  'كود لان التقنية',
  siteNameEn:  'CodeLAN Tech',
  taglineAr:   'نبني مستقبلك التقني',
  taglineEn:   'We Build Your Tech Future',
  logo:        null,
  favicon:     null,
  email:       'info@codelan.com',
  phone:       '',
  whatsapp:    '',
  addressAr:   '',
  addressEn:   '',
  socialLinks: [],
  metaTitleAr: 'كود لان | فريق التطوير البرمجي',
  metaTitleEn: 'CodeLAN | Software Dev Team',
  metaDescAr:  '',
  metaDescEn:  '',
  keywords:    [],
  ogImage:     null,
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const writeCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
};

const buildSocialLinks = (s) => {
  const map = [
    { platform: 'facebook',  url: s.facebook  },
    { platform: 'twitter',   url: s.twitter   },
    { platform: 'instagram', url: s.instagram },
    { platform: 'linkedin',  url: s.linkedin  },
    { platform: 'github',    url: s.github    },
    { platform: 'youtube',   url: s.youtube   },
    { platform: 'tiktok',    url: s.tiktok    },
    { platform: 'telegram',  url: s.telegram  },
    { platform: 'discord',   url: s.discord   },
  ];
  return map.filter(l => l.url).map((l, i) => ({ id: i + 1, ...l, active: true }));
};

const parseKeywords = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw) return raw.split(',').map(k => k.trim()).filter(Boolean);
  return [];
};

const parseColors = (raw, defaults) => {
  if (!raw) return null;
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return typeof obj === 'object' && obj ? { ...defaults, ...obj } : null;
  } catch { return null; }
};

function injectCSS(light, dark) {
  let el = document.getElementById('codelan-theme-vars');
  if (!el) { el = document.createElement('style'); el.id = 'codelan-theme-vars'; document.head.appendChild(el); }
  const block = (c) => [
    `  --color-accent:      ${c.accent};`,
    `  --color-accent-2:    ${c.accent2};`,
    `  --color-accent-3:    ${c.accent3};`,
    `  --color-bg-base:     ${c.bgBase};`,
    `  --color-bg-card:     ${c.bgCard};`,
    `  --color-bg-elevated: ${c.bgElevated};`,
    `  --color-text-base:   ${c.textBase};`,
    `  --color-text-muted:  ${c.textMuted};`,
    `  --color-border:      ${c.border};`,
  ].join('\n');
  el.textContent = `:root {\n${block(light)}\n}\n.dark {\n${block(dark)}\n}`;
}

const buildSettings = (s) => ({
  siteNameAr:  s.company_name    || DEFAULTS.siteNameAr,
  siteNameEn:  s.company_name_en || DEFAULTS.siteNameEn,
  taglineAr:   s.tagline         || DEFAULTS.taglineAr,
  taglineEn:   s.tagline_en      || DEFAULTS.taglineEn,
  logo:        s.logo_url        || null,
  favicon:     s.favicon         || null,
  email:       s.email           || DEFAULTS.email,
  phone:       s.phone           || '',
  whatsapp:    s.whatsapp        || '',
  addressAr:   s.address         || '',
  addressEn:   s.address_en      || '',
  socialLinks: buildSocialLinks(s),
  metaTitleAr: s.meta_title          || DEFAULTS.metaTitleAr,
  metaTitleEn: s.meta_title_en       || DEFAULTS.metaTitleEn,
  metaDescAr:  s.meta_description    || '',
  metaDescEn:  s.meta_description_en || '',
  keywords:    parseKeywords(s.keywords),
  ogImage:     s.og_image        || null,
});

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage cache to prevent CLS on repeat visits
  const [settings, setSettings] = useState(() => readCache() ?? DEFAULTS);

  useEffect(() => {
    apiGetSettings()
      .then(res => {
        const s = res.data ?? {};

        const lightFromDB = parseColors(s.theme_light, DEFAULT_LIGHT);
        const darkFromDB  = parseColors(s.theme_dark,  DEFAULT_DARK);
        if (lightFromDB || darkFromDB) {
          injectCSS(lightFromDB ?? DEFAULT_LIGHT, darkFromDB ?? DEFAULT_DARK);
        }

        const newSettings = buildSettings(s);
        setSettings(newSettings);
        writeCache(newSettings);
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
