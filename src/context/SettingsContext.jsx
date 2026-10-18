import { createContext, useContext, useState, useEffect } from 'react';
import { apiGetSettings } from '../services/api';
import { BOOT } from '../utils/boot';
import { safeHref, safeImg } from '../utils/safeUrl';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

const CACHE_KEY = 'cl_settings_v2';

const DEFAULTS = {
  taglineAr:   'نبني مستقبلك التقني',
  taglineEn:   'We Build Your Tech Future',
  logo:        null,
  favicon:     null,
  email:       'info@codelanco.com',
  phone:       '',
  whatsapp:    '',
  addressAr:   '',
  addressEn:   '',
  socialLinks: [],
  metaTitleAr: 'كودلانكو | فريق التطوير البرمجي',
  metaTitleEn: 'Codelanco | Software Dev Team',
  metaDescAr:  '',
  metaDescEn:  '',
  keywords:    [],
  ogImage:     null,
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* no localStorage, or a corrupt cache entry — fall back to a live fetch */ }
  return null;
};

const writeCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* private mode or quota exceeded — caching is an optimisation, not a requirement */ }
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
  return map
    .map(l => ({ ...l, url: safeHref(l.url) }))
    .filter(l => l.url)
    .map((l, i) => ({ id: i + 1, ...l, active: true }));
};

const parseKeywords = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw) return raw.split(',').map(k => k.trim()).filter(Boolean);
  return [];
};

const buildSettings = (s) => ({
  taglineAr:   s.tagline         || DEFAULTS.taglineAr,
  taglineEn:   s.tagline_en      || DEFAULTS.taglineEn,
  logo:        safeImg(s.logo_url) || null,
  favicon:     safeImg(s.favicon)  || null,
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
  ogImage:     safeImg(s.og_image) || null,
});

export const SettingsProvider = ({ children }) => {
  // Start from the last copy this browser saw, else the one embedded in the
  // page at build time (utils/boot), so the first paint already has the real
  // tagline and WhatsApp line instead of shifting when the API answers.
  const [settings, setSettings] = useState(() => readCache() ?? (BOOT.settings ? buildSettings(BOOT.settings) : DEFAULTS));

  useEffect(() => {
    apiGetSettings()
      .then(res => {
        const s = res.data ?? {};

        const newSettings = buildSettings(s);
        writeCache(newSettings);
        // Usually identical to what the page started from (cache or embedded
        // copy). Replacing it with an equal object would still re-render every
        // consumer — the header and the whole hero — for nothing, in the middle
        // of the page's first seconds.
        setSettings(prev => (JSON.stringify(prev) === JSON.stringify(newSettings) ? prev : newSettings));
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
