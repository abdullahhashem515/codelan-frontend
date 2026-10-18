import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { CSP_META, HTACCESS, HTACCESS_ASSETS } from './security.config.js'
import { buildSeo } from './scripts/seo-build.mjs'

// Vendor splitting is done on a *normalised* id: module ids arrive with
// backslashes on Windows, so the previous `id.includes('node_modules/react')`
// checks never matched and React silently ended up in the chunk labelled
// "vendor-gsap" — which every other chunk then imported, pulling it onto the
// critical path. Matching on a normalised path keeps that from recurring.
//
// gsap/lenis are deliberately NOT listed: they are only ever reached through
// dynamic import() (SmoothScrollProvider), so Rolldown already isolates them
// into async chunks that load after first paint.
const WIN_SEP = String.fromCharCode(92) // literal backslash, kept out of a regex

// Fewer, larger files. Left to itself the bundler gave every shared icon and
// every small shared module its own chunk — 32 files under 1.5 KB — and a page
// load fired dozens of requests at once. Hostinger treated that burst as abuse
// and answered 429 (Too Many Requests); a section whose file was refused then
// failed to render at all. Grouping cuts the burst; immutable caching (see
// .htaccess) means repeat visits re-request none of it.
//
// Icons can be one chunk only because iconMap no longer imports the whole
// lucide library (see utils/iconRegistry.js) — before that, "all icons" was
// a 740 KB file.
const APP_CORE = /\/src\/(context|hooks|services)\/|\/src\/utils\/(?!icon(Map|Registry|Choices)|fieldImages)|\/src\/components\/(TiltCard|SectionLink|NoIndex)\.jsx|\/src\/components\/illustrations\/(artKit|Anim|ArtStage)\./

const norm = (id) => id.split(WIN_SEP).join('/')
const nm = (pkgs) => {
  const re = new RegExp('/node_modules/(' + pkgs + ')/')
  return (id) => re.test(norm(id))
}

// Explicit groups, highest priority first. includeDependenciesRecursively is
// off on purpose: with it on (the manualChunks default), app-core — matched
// first — dragged every library it imports in with it, and came out as a
// 72 KB file holding all of framer-motion.
const CHUNK_GROUPS = {
  includeDependenciesRecursively: false,
  groups: [
    { name: 'vendor-react',  priority: 40, test: nm('react|react-dom|react-router|react-router-dom|scheduler') },
    { name: 'vendor-motion', priority: 40, test: nm('framer-motion|motion-dom|motion-utils') },
    { name: 'vendor-icons',  priority: 30, test: nm('lucide-react|react-icons') },
    { name: 'app-core',      priority: 10, test: (id) => APP_CORE.test(norm(id)) },
  ],
}

// Production-only security: the CSP <meta> and the .htaccess with the full
// headers (see security.config.js). Build-only because the dev server injects
// inline scripts for hot reload, which the policy would — correctly — block.
const securityHeaders = () => ({
  name: 'codelanco-security-headers',
  apply: 'build',
  // Inserted right after <meta charset>: the charset declaration must come
  // first in <head>, and the policy must precede every resource it governs.
  transformIndexHtml: (html) => html.replace(
    /<meta charset=[^>]*>/i,
    (m) => `${m}\n    <meta http-equiv="Content-Security-Policy" content="${CSP_META.replace(/"/g, '&quot;')}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
  ),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '.htaccess', source: HTACCESS })
    this.emitFile({ type: 'asset', fileName: 'assets/.htaccess', source: HTACCESS_ASSETS })
  },
})

// After the bundle is written: per-page HTML for link previews and crawlers,
// and the sitemap (scripts/seo-build.mjs). It reads the finished index.html,
// so those pages carry the same CSP and assets as the app itself.
const seoPages = () => {
  let outDir = 'dist'
  return {
    name: 'codelanco-seo-pages',
    apply: 'build',
    configResolved(cfg) { outDir = cfg.build.outDir },
    async closeBundle() {
      const r = await buildSeo(outDir)
      console.log(`\n  seo: home ${r.home}; ${r.posts} article pages; ${r.projects} project pages; sitemap ${r.sitemap} urls; api ${r.api}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), securityHeaders(), seoPages()],
  // Local development only. The backend's CORS allows codelanco.com alone, so
  // the dev app calls /api on its own origin and Vite forwards it server-side,
  // where CORS does not apply. The Origin header is dropped so the backend sees
  // an ordinary server-to-server request.
  server: {
    proxy: {
      '/api': {
        target: 'https://back-end.codelanco.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
      },
    },
  },
  build: {
    // Stated explicitly: source maps would publish the original source code.
    sourcemap: false,
    rolldownOptions: {
      output: { codeSplitting: CHUNK_GROUPS },
    },
  },
})
