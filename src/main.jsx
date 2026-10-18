import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { SettingsProvider } from './context/SettingsContext';
import { reloadOnceForChunkError } from './utils/lazyWithRetry';

// Refuse to run inside a frame. The X-Frame-Options / frame-ancestors headers
// (.htaccess) are the real defence against clickjacking — a hostile page
// overlaying the admin's delete buttons in an invisible frame — but headers can
// be lost to a proxy or cache. If framed, the app never mounts; it asks to
// become the top-level page instead.
const framed = (() => { try { return window.self !== window.top; } catch { return true; } })();
if (framed) {
  try { window.top.location.replace(window.self.location.href); } catch { /* sandboxed frame — staying blank is the point */ }
}

// Vite fetches a lazy page's dependencies ahead of it; when one of those is
// refused (429) or gone after a deploy, it fires this event. Same recovery as
// lazyWithRetry: one guarded reload instead of a broken page.
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnceForChunkError()) e.preventDefault();
});

if (!framed) createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
