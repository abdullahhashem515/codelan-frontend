import { safeHref, safeImg } from './safeUrl';
import { parseVideo } from './video';
// Shared normalisation for a project row coming back from the API.
// The listing and the per-project page both read the same backend record, so
// this lives in one place — otherwise the two drift and a field silently stops
// showing on one of them.

export const GRADIENTS = [
  'from-[#0a1628] to-[#1a2a4a]', 'from-[#1a0a0a] to-[#3a1515]',
  'from-[#0a1a0a] to-[#153015]', 'from-[#1a1000] to-[#3a2a00]',
  'from-[#0a0a1a] to-[#1a1a3a]', 'from-[#1a0028] to-[#2d1545]',
];

export const ACCENTS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

// A URL saved as "#https://..." (the admin form used to pre-fill "#") reads as
// a same-page fragment, so the browser never navigates. Strip any leading "#"
// and treat a bare "#" as "no link at all".
export const cleanUrl = (raw) => {
  const url = String(raw ?? '').trim().replace(/^#+/, '');
  // Allow-listed schemes only — see utils/safeUrl.
  return url && url !== '#' ? safeHref(url) : '';
};

// Screenshots may arrive as a JSON string, an array of urls, an array of
// objects, or only the single cover column — normalise all of them, cover
// first, without duplicates.
export const parseImages = (p) => {
  const raw = p.images ?? p.screenshots ?? [];
  let list = Array.isArray(raw) ? raw : [];
  if (!list.length && typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = raw.split(',').map(u => u.trim());
    }
  }
  const cover = p.image_url ?? p.cover_image ?? p.image ?? '';
  const all = [cover, ...list].map(u => safeImg(typeof u === 'string' ? u : u?.url ?? '')).filter(Boolean);
  return [...new Set(all)];
};

export const parseStack = (stack) => {
  if (Array.isArray(stack)) return stack;
  if (typeof stack === 'string' && stack) return stack.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

// Results of a managed social account: [{ label, label_en, value }], as an
// array or a JSON string. Capped at four — they sit in one row.
export const parseResults = (raw) => {
  let list = raw;
  if (typeof raw === 'string' && raw) { try { list = JSON.parse(raw); } catch { list = []; } }
  if (!Array.isArray(list)) return [];
  return list
    .map(r => ({ label: String(r?.label ?? '').trim(), labelEn: String(r?.label_en ?? r?.label ?? '').trim(), value: String(r?.value ?? '').trim() }))
    .filter(r => r.label && r.value)
    .slice(0, 4);
};

// "+45%" must stay left-to-right or the sign jumps to the far side; "6 أشهر"
// must read right-to-left. Decided by whether the value has Arabic letters.
export const valueDir = (value) => (/[؀-ۿ]/.test(value) ? 'rtl' : 'ltr');

export const fromApiProject = (p, idx = 0) => {
  const video = parseVideo(p.video_url);
  const cover = safeImg(p.image_url ?? p.cover_image ?? p.image ?? '');
  return {
    id:            p.id,
    url:           cleanUrl(p.project_url),
    appStoreUrl:   cleanUrl(p.app_store_url),
    playStoreUrl:  cleanUrl(p.play_store_url),
    images:        parseImages(p),
    // A video project without its own cover borrows the video's thumbnail.
    image:         cover || video?.thumb || '',
    video,
    results:       parseResults(p.results),
    category:      p.category     ?? '',
    categoryEn:    p.category_en  ?? p.category ?? '',
    title:         p.title        ?? '',
    titleEn:       p.title_en     ?? p.title ?? '',
    desc:          p.description  ?? '',
    descEn:        p.description_en ?? p.description ?? '',
    body:          p.full_description    ?? '',
    bodyEn:        p.full_description_en ?? p.full_description ?? '',
    stack:         parseStack(p.technologies || p.stack),
    type:          p.project_type ?? p.type ?? 'web',
    thumbGradient: p.thumb_gradient ?? GRADIENTS[idx % GRADIENTS.length],
    strokeColor:   p.stroke_color  ?? ACCENTS[idx % ACCENTS.length],
  };
};
