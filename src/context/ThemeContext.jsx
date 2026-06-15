import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Default color palettes ────────────────────────────────────────────────────

export const DEFAULT_LIGHT = {
  accent:      '#3b82f6',
  accent2:     '#ef4444',
  accent3:     '#8b5cf6',
  bgBase:      '#f9fafb',
  bgCard:      '#ffffff',
  bgElevated:  '#f3f4f6',
  textBase:    '#111827',
  textMuted:   '#6b7280',
  border:      '#e5e7eb',
};

export const DEFAULT_DARK = {
  accent:      '#3b82f6',
  accent2:     '#ef4444',
  accent3:     '#8b5cf6',
  bgBase:      '#050810',
  bgCard:      '#0a0f1e',
  bgElevated:  '#111827',
  textBase:    '#f1f5f9',
  textMuted:   '#94a3b8',
  border:      '#1e293b',
};

// ─── Default & available fonts ────────────────────────────────────────────────

export const DEFAULT_FONTS = {
  arabic:  'IBM Plex Sans Arabic',
  english: 'Space Grotesk',
};

export const ARABIC_FONTS = [
  'IBM Plex Sans Arabic',
  'Cairo',
  'Tajawal',
  'Noto Kufi Arabic',
  'Readex Pro',
];

export const ENGLISH_FONTS = [
  'Space Grotesk',
  'Poppins',
  'Inter',
  'Roboto',
  'Nunito',
];

// ─── Color CSS injection ───────────────────────────────────────────────────────

function toVarBlock(colors) {
  return [
    `  --color-accent:      ${colors.accent};`,
    `  --color-accent-2:    ${colors.accent2};`,
    `  --color-accent-3:    ${colors.accent3};`,
    `  --color-bg-base:     ${colors.bgBase};`,
    `  --color-bg-card:     ${colors.bgCard};`,
    `  --color-bg-elevated: ${colors.bgElevated};`,
    `  --color-text-base:   ${colors.textBase};`,
    `  --color-text-muted:  ${colors.textMuted};`,
    `  --color-border:      ${colors.border};`,
  ].join('\n');
}

function injectCSS(light, dark) {
  let el = document.getElementById('codelan-theme-vars');
  if (!el) {
    el = document.createElement('style');
    el.id = 'codelan-theme-vars';
    document.head.appendChild(el);
  }
  el.textContent = `:root {\n${toVarBlock(light)}\n}\n.dark {\n${toVarBlock(dark)}\n}`;
}

// ─── Font injection ────────────────────────────────────────────────────────────

function loadGoogleFont(name) {
  const id = `gf-${name.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}&display=swap`;
  document.head.appendChild(link);
}

function applyFonts({ arabic, english }) {
  loadGoogleFont(arabic);
  loadGoogleFont(english);
  document.documentElement.style.setProperty('--font-ar', `'${arabic}'`);
  document.documentElement.style.setProperty('--font-en', `'${english}'`);
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  const [customColors, setCustomColors] = useState(() => {
    try {
      const raw = localStorage.getItem('themeColors');
      if (raw) {
        const p = JSON.parse(raw);
        return {
          light: { ...DEFAULT_LIGHT, ...p.light },
          dark:  { ...DEFAULT_DARK,  ...p.dark  },
        };
      }
    } catch {}
    return { light: { ...DEFAULT_LIGHT }, dark: { ...DEFAULT_DARK } };
  });

  const [customFonts, setCustomFonts] = useState(() => {
    try {
      const raw = localStorage.getItem('themeFonts');
      if (raw) {
        const p = JSON.parse(raw);
        return { ...DEFAULT_FONTS, ...p };
      }
    } catch {}
    return { ...DEFAULT_FONTS };
  });

  // Toggle dark class on <html>
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Inject color CSS vars on mount and whenever saved colors change
  useEffect(() => {
    injectCSS(customColors.light, customColors.dark);
  }, [customColors]);

  // Apply fonts on mount and whenever saved fonts change
  useEffect(() => {
    applyFonts(customFonts);
  }, [customFonts]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // ── Color API ──────────────────────────────────────────────────────────────

  const previewColors = useCallback((light, dark) => {
    injectCSS(
      { ...DEFAULT_LIGHT, ...light },
      { ...DEFAULT_DARK,  ...dark  }
    );
  }, []);

  const saveCustomColors = useCallback((light, dark) => {
    const next = {
      light: { ...DEFAULT_LIGHT, ...light },
      dark:  { ...DEFAULT_DARK,  ...dark  },
    };
    setCustomColors(next);
    localStorage.setItem('themeColors', JSON.stringify(next));
    injectCSS(next.light, next.dark);
  }, []);

  const resetColors = useCallback(() => {
    const next = { light: { ...DEFAULT_LIGHT }, dark: { ...DEFAULT_DARK } };
    setCustomColors(next);
    localStorage.removeItem('themeColors');
    injectCSS(next.light, next.dark);
  }, []);

  // ── Font API ───────────────────────────────────────────────────────────────

  const previewFont = useCallback((arabic, english) => {
    applyFonts({ arabic, english });
  }, []);

  const saveFonts = useCallback((arabic, english) => {
    const next = { arabic, english };
    setCustomFonts(next);
    localStorage.setItem('themeFonts', JSON.stringify(next));
    applyFonts(next);
  }, []);

  const resetFonts = useCallback(() => {
    setCustomFonts({ ...DEFAULT_FONTS });
    localStorage.removeItem('themeFonts');
    applyFonts(DEFAULT_FONTS);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      customColors,
      previewColors,
      saveCustomColors,
      resetColors,
      customFonts,
      previewFont,
      saveFonts,
      resetFonts,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
