import { useId } from 'react';

// Shared by every animated drawing on the site (services, methodology), so they
// stay one visual family: same palette, same canvas size.

// The only colours a drawing may use. Brand blues carry the drawing; red marks
// the single thing that matters in a scene (a threat, a recording, an alert);
// green only ever means "done / OK".
export const C = {
  blue:  '#1a7fff',
  sky:   '#60a5fa',
  deep:  '#0158B0',
  red:   '#DC1B1C',
  green: '#34d399',
  panel: '#111a2e',
  panel2:'#16213a',
  edge:  'rgba(148,163,184,0.18)',
  line:  'rgba(148,163,184,0.30)',
  text:  '#cbd5e1',
  dim:   '#475569',
};

export const VB = '0 0 400 220';

// React ids contain characters that break url(#…) references; keep them plain.
export const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, '');
