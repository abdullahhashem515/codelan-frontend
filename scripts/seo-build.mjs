// Build-time SEO: per-page HTML for crawlers and link previews, and the sitemap.
//
// Why: this is a single-page app — every URL is served the same index.html and
// the page's real title, description and image are filled in by JavaScript.
// WhatsApp, Facebook, X and LinkedIn do not run JavaScript when building a link
// preview, so every shared link — an article, a project — showed the same
// generic title and no image. Search engines fare better but slower.
//
// After the bundle is written, this fetches the published content from the API
// and writes:
//   dist/index.html          — home tags filled from the admin's SEO settings
//   dist/blog/<slug>.html    — one per published article
//   dist/projects/<id>.html  — one per project
//   dist/privacy.html        — the privacy page's own title and text
//   dist/sitemap.xml         — every page, with last-modified dates
// .htaccess serves /blog/<slug> from blog/<slug>.html when it exists, so
// crawlers get the right tags and visitors get the same app as before.
//
// Limitation, by design of a static host: content added after a build has no
// page of its own until the next build (it still works — it falls back to the
// SPA — it just previews with the home tags). The full fix is the backend
// serving these tags itself; see the backend requirements document.
//
// Each page also carries its content as real HTML — the article, the project,
// the home page's services and links — inside #root, where React replaces it
// as soon as the app starts. Crawlers that do not run JavaScript (and those
// that index the raw HTML first, before rendering) used to find only a title
// and an empty <div>. The block is visually hidden, so a visitor never sees it
// flash before the app; it is the same content the app then shows.
//
// If the API is unreachable the build still succeeds: the home page keeps its
// fallback tags and the sitemap lists the home page only.

import fs from 'node:fs';
import path from 'node:path';
import { deriveExcerpt, parseArticle } from '../src/utils/articleText.js';
import { fromApiProject } from '../src/utils/project.js';
import { safeImg } from '../src/utils/safeUrl.js';

export const SITE = 'https://codelanco.com';
const API = 'https://back-end.codelanco.com/api';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;
const BRAND = 'كودلانكو';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trim()}…` : t; };

const absolute = (url) => {
  const u = safeImg(url);
  if (!u) return DEFAULT_IMAGE;
  return u.startsWith('/') ? `${SITE}${u}` : u;
};

const seoBlock = ({ title, description, url, image, type = 'website', published }) => [
  `<title>${esc(title)}</title>`,
  `<meta name="description" content="${esc(description)}" />`,
  `<link rel="canonical" href="${esc(url)}" />`,
  `<meta property="og:type" content="${type}" />`,
  `<meta property="og:site_name" content="${BRAND}" />`,
  `<meta property="og:locale" content="ar_AR" />`,
  `<meta property="og:title" content="${esc(title)}" />`,
  `<meta property="og:description" content="${esc(description)}" />`,
  `<meta property="og:url" content="${esc(url)}" />`,
  `<meta property="og:image" content="${esc(image)}" />`,
  ...(image === DEFAULT_IMAGE ? ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />'] : []),
  `<meta name="twitter:card" content="summary_large_image" />`,
  ...(published ? [`<meta property="article:published_time" content="${esc(published)}" />`] : []),
].join('\n    ');

const withSeo = (html, meta) => {
  const a = html.indexOf('<!--seo:start'), b = html.indexOf('<!--seo:end-->');
  if (a < 0 || b < 0) throw new Error('index.html is missing the <!--seo:start--> … <!--seo:end--> block');
  return html.slice(0, a) + seoBlock(meta) + html.slice(b + '<!--seo:end-->'.length);
};

// ── Content for crawlers ───────────────────────────────────────────────────
// Visually hidden (the standard screen-reader pattern), not display:none: it
// stays real, rendered text in the document.
const HIDDEN = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0';
const withContent = (html, inner) => {
  if (!html.includes('<div id="root"></div>')) throw new Error('index.html is missing <div id="root"></div>');
  return html.replace('<div id="root"></div>', `<div id="root"><div data-prerender style="${HIDDEN}">${inner}</div></div>`);
};

// Inline **bold** and `code` markers are display formatting; the text is what matters here.
const plain = (t) => esc(String(t ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1'));

// An article body as HTML, block for block the way the article page renders it.
const bodyHtml = (rawBody) => parseArticle(rawBody).map((b) => {
  switch (b.type) {
    case 'h2': return `<h2>${plain(b.text)}</h2>`;
    case 'h3': return `<h3>${plain(b.text)}</h3>`;
    case 'ul': { const t = b.ordered ? 'ol' : 'ul'; return `<${t}>${b.items.map(i => `<li>${plain(i)}</li>`).join('')}</${t}>`; }
    case 'quote': return `<blockquote>${plain(b.text)}</blockquote>`;
    case 'code': return `<pre>${esc(b.text)}</pre>`;
    case 'table': return `<table>${b.head ? `<tr>${b.head.map(c => `<th>${plain(c)}</th>`).join('')}</tr>` : ''}${b.rows.map(r => `<tr>${r.map(c => `<td>${plain(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    default: return `<p>${plain(b.text)}</p>`;
  }
}).join('');

const paragraphs = (text) => String(text ?? '').split(/\n+/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
const homeLink = `<p><a href="/">${BRAND}</a></p>`;

// The public settings and the hero's figures, embedded as a JSON data block
// (see src/utils/boot.js): the hero then paints in its final shape instead of
// growing when the API answers. '<' is escaped so the data can never close the
// script element it sits in.
const withBoot = (html, data) => {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return html.replace('</head>', `    <script type="application/json" id="cl-boot">${json}</script>\n  </head>`);
};

const getJson = async (p) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`${API}${p}`, { headers: { Accept: 'application/json' }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
};
const list = (j) => { const d = j?.data ?? j; return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []); };
const day = (d) => { const t = new Date(d); return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10); };

export const buildSeo = async (outDir) => {
  const indexPath = path.join(outDir, 'index.html');
  let shell = fs.readFileSync(indexPath, 'utf8');
  const urls = [{ loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' }];
  const report = { home: 'fallback tags', posts: 0, projects: 0, api: 'ok' };

  let settings = null, posts = [], projects = [], achievements = [], services = [];
  try {
    [settings, posts, projects, achievements, services] = await Promise.all([
      getJson('/settings').then(j => j?.data ?? null),
      getJson('/posts').then(list),
      getJson('/projects').then(list),
      getJson('/achievements').then(list).catch(() => []),
      getJson('/services').then(list).catch(() => []),
    ]);
  } catch (e) {
    report.api = `unreachable (${e.message}) — fallbacks only`;
  }

  // Every page below is written from this shell, so all of them carry the
  // embedded data. Same list the hero shows: the first four, in admin order.
  if (settings || achievements.length) {
    shell = withBoot(shell, { settings, achievements: achievements.slice(0, 4) });
    fs.writeFileSync(indexPath, shell);
    report.boot = `settings ${settings ? 'yes' : 'no'}, ${achievements.slice(0, 4).length} figures`;
  }

  // Home — what the company does, its services, and a link to every work and
  // article: for a crawler reading the HTML, the way to discover the rest.
  const livePosts = posts.filter(p => (!p.status || p.status === 'published') && p.slug && /^[a-z0-9-]+$/i.test(p.slug));
  const liveProjects = projects.filter(p => (!p.status || p.status === 'active') && /^\d+$/.test(String(p.id)));
  const homeInner = [
    `<h1>${esc(settings?.company_name || BRAND)} — نصنع تجارب رقمية استثنائية</h1>`,
    settings?.tagline ? `<p>${esc(settings.tagline)}</p>` : '',
    services.length ? `<h2>خدماتنا</h2><ul>${services.filter(x => x.is_active !== false && x.is_active !== 0).map(x => `<li><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></li>`).join('')}</ul>` : '',
    liveProjects.length ? `<h2>أعمالنا</h2><ul>${liveProjects.map(p => `<li><a href="/projects/${p.id}">${esc(p.title)}</a>${p.description ? ` — ${esc(p.description)}` : ''}</li>`).join('')}</ul>` : '',
    livePosts.length ? `<h2>المدونة</h2><ul>${livePosts.map(p => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a></li>`).join('')}</ul>` : '',
    settings ? `<h2>تواصل معنا</h2><p>${[settings.email, settings.phone, settings.address].filter(Boolean).map(esc).join(' · ')}</p>` : '',
    '<p><a href="/privacy">سياسة الخصوصية</a></p>',
  ].join('');
  fs.writeFileSync(indexPath, withContent(shell, homeInner));

  // Home — the admin's SEO settings, when they are set.
  if (settings) {
    const title = settings.meta_title || null;
    const description = settings.meta_description || null;
    if (title || description) {
      fs.writeFileSync(indexPath, withContent(withSeo(shell, {
        title: title || `${BRAND} | برمجيات وشبكات`,
        description: clip(description || 'نبني البرمجيات ونؤسّس الشبكات التي تعمل عليها — مواقع وأنظمة وتطبيقات، وشبكات وكاميرات وبدالات.', 200),
        url: `${SITE}/`,
        image: absolute(settings.og_image),
      }), homeInner));
      report.home = 'from admin SEO settings';
    }
  }

  // Articles
  const blogDir = path.join(outDir, 'blog');
  for (const p of posts) {
    if (p.status && p.status !== 'published') continue;
    if (!p.slug || !/^[a-z0-9-]+$/i.test(p.slug)) continue; // only safe, path-like slugs become files
    const url = `${SITE}/blog/${p.slug}`;
    fs.mkdirSync(blogDir, { recursive: true });
    const articleInner = `<article><h1>${esc(p.title)}</h1>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}${bodyHtml(p.content)}</article>${homeLink}`;
    fs.writeFileSync(path.join(blogDir, `${p.slug}.html`), withContent(withSeo(shell, {
      title: `${clip(p.title, 70)} | ${BRAND}`,
      description: clip(deriveExcerpt(p.excerpt, p.content), 200),
      url,
      image: absolute(p.image_url),
      type: 'article',
      published: p.published_at || p.created_at,
    }), articleInner));
    urls.push({ loc: url, lastmod: day(p.updated_at || p.created_at), priority: '0.7', changefreq: 'monthly' });
    report.posts++;
  }

  // Projects
  const projDir = path.join(outDir, 'projects');
  for (const raw of projects) {
    const pr = fromApiProject(raw);
    if (!pr.id || !/^\d+$/.test(String(pr.id))) continue;
    const url = `${SITE}/projects/${pr.id}`;
    fs.mkdirSync(projDir, { recursive: true });
    const projectInner = [
      `<article><h1>${esc(pr.title)}</h1>`,
      pr.category ? `<p>${esc(pr.category)}</p>` : '',
      pr.desc ? `<p>${esc(pr.desc)}</p>` : '',
      paragraphs(pr.body),
      pr.stack.length ? `<ul>${pr.stack.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '',
      pr.url ? `<p><a href="${esc(pr.url)}" rel="noopener">${esc(pr.url)}</a></p>` : '',
      `</article>${homeLink}`,
    ].join('');
    fs.writeFileSync(path.join(projDir, `${pr.id}.html`), withContent(withSeo(shell, {
      title: `${clip(pr.title, 70)} | ${BRAND}`,
      description: clip(pr.desc || pr.body || `${pr.title} — من أعمال ${BRAND}.`, 200),
      url,
      image: absolute(pr.image),
    }), projectInner));
    urls.push({ loc: url, lastmod: day(raw.updated_at || raw.created_at), priority: '0.8', changefreq: 'monthly' });
    report.projects++;
  }

  // Privacy — it used to be served the home page's title and description. The
  // summary mirrors src/pages/Privacy.jsx; keep the two in step.
  fs.writeFileSync(path.join(outDir, 'privacy.html'), withContent(withSeo(shell, {
    title: `سياسة الخصوصية | ${BRAND}`,
    description: 'ما يجمعه موقع كودلانكو ولماذا: بيانات نموذج التواصل فقط للرد على طلبك، بلا ملفات تعريف ارتباط ولا أدوات تتبّع أو إعلانات.',
    url: `${SITE}/privacy`,
    image: DEFAULT_IMAGE,
  }), `<article><h1>سياسة الخصوصية</h1><p>نجمع فقط ما تكتبه بنفسك في نموذج «تواصل معنا»: الاسم، والبريد الإلكتروني، ورقم الهاتف (اختياري)، ونوع المشروع (اختياري)، وتفاصيل رسالتك، ونستخدمها للرد على طلبك فقط.</p><p>لا يستخدم الموقع ملفات تعريف الارتباط (Cookies)، ولا أدوات تتبّع أو إعلانات أو تحليلات، ولا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض تسويقية.</p></article>${homeLink}`));
  urls.push({ loc: `${SITE}/privacy`, priority: '0.2', changefreq: 'yearly' });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
  report.sitemap = urls.length;
  return report;
};
