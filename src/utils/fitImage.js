import { UPLOAD_MAX_BYTES } from '../services/api';

// The backend takes images up to 2 MB. A designer's poster export is often
// 4–10 MB, so instead of refusing it the browser re-encodes it: WebP, longest
// edge 2560 px, stepping down until it fits. At the sizes the site displays
// them the difference is not visible.
//
// GIF is left alone — redrawing it on a canvas would drop the animation — and
// so is ICO. A file that still does not fit is returned unchanged, and the
// upload check reports it.
const SHRINKABLE = ['image/png', 'image/jpeg', 'image/webp'];
const STEPS = [[2560, 0.88], [2048, 0.82], [1600, 0.78], [1280, 0.72]];

const encode = (canvas, type, quality) => new Promise(resolve => canvas.toBlob(resolve, type, quality));

export const fitImage = async (file) => {
  if (file.size <= UPLOAD_MAX_BYTES || !SHRINKABLE.includes(file.type)) return file;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { return file; }
  try {
    for (const [edge, quality] of STEPS) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob = await encode(canvas, 'image/webp', quality);
      // Safari cannot encode WebP and silently hands back a PNG; JPEG then.
      if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg', quality);
      if (blob && blob.size <= UPLOAD_MAX_BYTES) {
        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`, { type: blob.type });
      }
    }
  } finally {
    bitmap.close?.();
  }
  return file;
};
