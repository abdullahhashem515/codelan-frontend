// Generates public/og-image.png — the 1200×630 preview shown when a link to the
// site is shared on WhatsApp, Facebook, X or LinkedIn.
//
//   node scripts/make-og-image.mjs
//
// The site's dark hero background, the brand glows (blue top, a touch of red),
// and the logo from public/logo.png centred on it. Pure Node (zlib only), so it
// needs no image library. Run again after changing the logo.

import fs from 'node:fs';
import zlib from 'node:zlib';

const W = 1200, H = 630;
// logo.png carries wide transparent margins, so the canvas is drawn large for
// the mark itself to read at thumbnail size.
const LOGO_SIZE = 540;

// ── PNG decode (8-bit RGBA / RGB, non-interlaced) ─────────────────────────────
const decode = (buf) => {
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  const depth = buf[24], type = buf[25], interlace = buf[28];
  if (depth !== 8 || interlace !== 0 || ![2, 6].includes(type)) throw new Error(`unsupported PNG (depth ${depth}, type ${type}, interlace ${interlace})`);
  const bpp = type === 6 ? 4 : 3;
  const idat = [];
  for (let o = 8; o < buf.length;) {
    const len = buf.readUInt32BE(o), t = buf.toString('ascii', o + 4, o + 8);
    if (t === 'IDAT') idat.push(buf.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp, out = Buffer.alloc(w * h * 4), prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    raw.copy(cur, 0, y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = cur[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const s = x * bpp, d = (y * w + x) * 4;
      out[d] = cur[s]; out[d + 1] = cur[s + 1]; out[d + 2] = cur[s + 2]; out[d + 3] = bpp === 4 ? cur[s + 3] : 255;
    }
    cur.copy(prev);
  }
  return { w, h, px: out };
};

// ── PNG encode (RGB, filter 0) ────────────────────────────────────────────────
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type, 'ascii'), l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]); };
const encode = (w, h, rgb) => {
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

// ── Background: #050810 with the hero's glows ─────────────────────────────────
const img = Buffer.alloc(W * H * 3);
const glow = (x, y, cx, cy, rx, ry) => { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; return Math.max(0, 1 - d) ** 2; };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  // Glow from the top edge only: a glow directly behind the logo swallowed its
  // blue letters and the blue wordmark.
  const blue = glow(x, y, W / 2, -120, 820, 430) * 0.5;
  const red = glow(x, y, W * 0.88, H * 0.95, 420, 300) * 0.28;
  // faint grid, like the old hero background
  const grid = (x % 60 === 0 || y % 60 === 0) ? 0.035 : 0;
  const i = (y * W + x) * 3;
  img[i]     = Math.min(255, 5  + blue * 26  + red * 220 + grid * 255 * 0.3);
  img[i + 1] = Math.min(255, 8  + blue * 127 + red * 27  + grid * 255 * 0.5);
  img[i + 2] = Math.min(255, 16 + blue * 255 + red * 28  + grid * 255);
}

// ── Logo, area-averaged down to LOGO_SIZE and alpha-blended in the centre ─────
const logo = decode(fs.readFileSync('public/logo.png'));
const scale = logo.w / LOGO_SIZE;
const ox = Math.round((W - LOGO_SIZE) / 2), oy = Math.round((H - LOGO_SIZE) / 2);
for (let y = 0; y < LOGO_SIZE; y++) for (let x = 0; x < LOGO_SIZE; x++) {
  let r = 0, g = 0, b = 0, a = 0, n = 0;
  for (let sy = Math.floor(y * scale); sy < Math.floor((y + 1) * scale); sy++)
    for (let sx = Math.floor(x * scale); sx < Math.floor((x + 1) * scale); sx++) {
      const s = (sy * logo.w + sx) * 4, al = logo.px[s + 3] / 255;
      r += logo.px[s] * al; g += logo.px[s + 1] * al; b += logo.px[s + 2] * al; a += al; n++;
    }
  if (!a) continue;
  const A = a / n, i = ((oy + y) * W + ox + x) * 3;
  img[i]     = Math.round(img[i]     * (1 - A) + (r / a) * A);
  img[i + 1] = Math.round(img[i + 1] * (1 - A) + (g / a) * A);
  img[i + 2] = Math.round(img[i + 2] * (1 - A) + (b / a) * A);
}

const png = encode(W, H, img);
fs.writeFileSync('public/og-image.png', png);
console.log(`public/og-image.png  ${W}x${H}  ${(png.length / 1024).toFixed(0)} KB`);
