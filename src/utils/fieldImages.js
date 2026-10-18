// Photos for the "In the field" gallery, picked up from src/assets/field/ at
// build time. No list to maintain: add a file, rebuild, it appears. With the
// folder empty the gallery section is left out of the page entirely.
//
// Captions come from the file name, so nothing else needs editing:
//
//   01__غرفة الخوادم__Server room.webp   → ar "غرفة الخوادم", en "Server room"
//   02__تركيب كاميرات.jpg                 → ar and en both "تركيب كاميرات"
//   03.jpg                                → no caption
//
// The leading number only sets the order. See src/assets/field/README.md.

const files = import.meta.glob('../assets/field/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
});

const captionFrom = (path) => {
  const base = decodeURIComponent(path.split('/').pop()).replace(/\.[^.]+$/, '');
  const parts = base.split('__').map(s => s.trim());
  // Drop a leading order number, whether it has its own segment or not.
  if (/^\d+$/.test(parts[0])) parts.shift();
  else parts[0] = parts[0].replace(/^\d+[\s._-]*/, '');
  const ar = (parts[0] || '').replace(/[_-]+/g, ' ').trim();
  const en = (parts[1] || ar).replace(/[_-]+/g, ' ').trim();
  return { ar, en };
};

export const FIELD_IMAGES = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
  .map(([path, src]) => ({ src, ...captionFrom(path) }));
