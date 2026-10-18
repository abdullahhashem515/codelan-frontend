// تعبئة محتوى موقع كودلانكو عبر الـAPI.
//
//   node scripts/populate.mjs --plan                        ← مراجعة الخطة بلا توكن
//   node scripts/populate.mjs --token "<التوكن>"            ← عرض فقط + فحص التوكن
//   node scripts/populate.mjs --token "<التوكن>" --apply     ← تنفيذ الكتابة
//
// السكربت آمن بالتصميم:
//   • لا يحذف ولا يُعدّل أي صف قائم — إضافة فقط.
//   • يقرأ الموجود أولاً ويتجاوز أي عنصر موجود مسبقاً (قابل للتشغيل مرّات).
//   • بلا --apply لا يُرسل أي طلب كتابة إطلاقاً.
//   • يتوقف فوراً إن كان التوكن غير صالح.
//
// ما لا يفعله — بقصد: لا يُضيف مشاريع ولا شهادات عملاء. هذه ادّعاءات عن أعمال
// منفَّذة وعن أشخاص حقيقيين، ولا يجوز توليدها. انظر الملاحظة في نهاية التقرير.

import { ARTICLES } from './content/articles.mjs';
import { TECH_PLAN } from './content/techstack.mjs';
import { RADIUS_POST } from './content/fixes.mjs';

const BASE = 'https://back-end.codelanco.com/api';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
// --plan يعرض ما سيُكتب بلا توكن إطلاقاً: كل القراءات المستخدمة هنا عامة،
// فيمكن مراجعة الخطة كاملة قبل استخراج توكن.
const PLAN_ONLY = argv.includes('--plan');
const tokenIdx = argv.indexOf('--token');
const TOKEN = tokenIdx !== -1 ? argv[tokenIdx + 1] : process.env.CODELANCO_TOKEN;

if (!TOKEN && !PLAN_ONLY) {
  console.error('لم يُعطَ توكن.  استخدم:  --token "<التوكن>"  أو متغيّر البيئة CODELANCO_TOKEN');
  process.exit(1);
}

const c = {
  dim:  (s) => `\x1b[2m${s}\x1b[0m`,
  ok:   (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err:  (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

let created = 0, skipped = 0, failed = 0;

async function api(method, path, body = null) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body === null ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* استجابة بلا JSON */ }
  return { status: res.status, ok: res.ok, json };
}

// ── التحقق من التوكن قبل أي شيء ───────────────────────────────────────────────
// يُرجع نجاحاً/فشلاً بدل استدعاء process.exit: الإنهاء القسري وسط طلب معلّق
// يُسقط libuv على ويندوز ويُرجع رمز خروج خاطئاً.
async function checkAuth() {
  const r = await api('GET', '/me');
  if (r.status === 401) {
    console.error(c.err('\nالتوكن مرفوض (401 Unauthenticated).'));
    console.error('اطلب توكناً جديداً بتسجيل الدخول:');
    console.error(c.dim(`  curl -s -X POST ${BASE}/login \\`));
    console.error(c.dim('       -H "Accept: application/json" -H "Content-Type: application/json" \\'));
    console.error(c.dim('       -d \'{"email":"<بريدك>","password":"<كلمتك>"}\''));
    console.error('أو افتح /admin/login في الموقع، ثم من أدوات المتصفح:');
    console.error(c.dim("  localStorage.getItem('auth_token')"));
    return false;
  }
  if (!r.ok) {
    console.error(c.err(`فحص التوكن أعاد ${r.status}.`), r.json ?? '');
    return false;
  }
  const u = r.json?.data ?? r.json ?? {};
  console.log(c.ok('التوكن صالح') + c.dim(`  (${u.email ?? u.name ?? 'مستخدم'})`));
  return true;
}

async function create(label, path, body) {
  if (!APPLY || PLAN_ONLY) { console.log('  ' + c.warn('[عرض]') + ' ' + label); return; }
  const r = await api('POST', path, body);
  if (r.ok) {
    created++;
    console.log('  ' + c.ok('أُضيف') + ' ' + label);
    return r.json?.data ?? r.json;
  }
  failed++;
  const msg = r.json?.message ?? '';
  const errs = r.json?.errors ? ' | ' + JSON.stringify(r.json.errors) : '';
  console.log('  ' + c.err(`فشل [${r.status}]`) + ' ' + label + c.dim(' ← ' + msg + errs));
  return null;
}

// ── المقالات ──────────────────────────────────────────────────────────────────
async function doPosts() {
  console.log(c.bold('\n■ المقالات'));
  const r = await api('GET', '/posts');
  const existing = (r.json?.data ?? []).map(p => String(p.title ?? '').trim());
  const today = new Date().toISOString().slice(0, 10);

  for (const a of ARTICLES) {
    if (existing.includes(a.titleAr.trim())) {
      skipped++; console.log('  ' + c.dim('موجود — تُجوهل: ' + a.titleAr.slice(0, 50)));
      continue;
    }
    await create(a.titleAr.slice(0, 55) + '…', '/posts', {
      title:      a.titleAr,
      title_en:   a.titleEn,
      excerpt:    a.excerptAr,
      excerpt_en: a.excerptEn,
      content:    a.contentAr,
      content_en: a.contentEn,
      image_url:  '',
      date:       today,
      status:     'published',
    });
  }
}

// ── التقنيات ──────────────────────────────────────────────────────────────────
async function doTechStack() {
  console.log(c.bold('\n■ التقنيات'));
  const r = await api('GET', '/tech-stack');
  const cats = r.json?.data ?? [];

  // مطابقة بالعنوان العربي؛ الفئة الموجودة تُستخدم كما هي ولا تُعدَّل.
  const byTitle = new Map(cats.map(x => [String(x.title ?? '').trim(), x]));

  // التجاهل عام لا داخل الفئة: تقنية موجودة في أي فئة لا تُضاف مرّة أخرى في
  // غيرها. بدون هذا يظهر MySQL — الموجود تحت «الواجهة الخلفية» — مرّة ثانية
  // تحت «قواعد البيانات».
  const seen = new Set();
  for (const x of cats) {
    for (const i of (x.items ?? [])) seen.add(String(i.name ?? '').trim().toLowerCase());
  }

  for (const plan of TECH_PLAN) {
    let cat = byTitle.get(plan.title.trim());

    if (!cat) {
      const made = await create(`فئة: ${plan.title}`, '/tech-categories', {
        title: plan.title, title_en: plan.titleEn,
      });
      if (!APPLY) {
        // في العرض فقط: نطبع التقنيات المزمعة ثم نكمل
        for (const t of plan.items) {
          const key = t.name.trim().toLowerCase();
          if (seen.has(key)) { console.log('    ' + c.dim(`موجودة — تُجوهل: ${plan.title} → ${t.name}`)); continue; }
          seen.add(key);
          console.log('    ' + c.warn('[عرض]') + ` ${plan.title} → ${t.name}`);
        }
        continue;
      }
      if (!made) continue;
      cat = { id: made.id, items: [] };
    }

    for (const t of plan.items) {
      const key = t.name.trim().toLowerCase();
      if (seen.has(key)) {
        skipped++; console.log('    ' + c.dim(`موجودة — تُجوهل: ${plan.title} → ${t.name}`));
        continue;
      }
      seen.add(key);
      await create(`${plan.title} → ${t.name}`, '/tech-items', {
        tech_category_id: cat.id,
        name:  t.name,
        icon:  '',
        color: t.color,
      });
    }
  }
}

async function update(label, path, body) {
  if (!APPLY || PLAN_ONLY) { console.log('  ' + c.warn('[عرض]') + ' ' + label); return null; }
  const r = await api('PUT', path, body);
  if (r.ok) {
    created++;
    console.log('  ' + c.ok('حُدّث') + ' ' + label);
    return r.json?.data ?? r.json;
  }
  failed++;
  const msg = r.json?.message ?? '';
  const errs = r.json?.errors ? ' | ' + JSON.stringify(r.json.errors) : '';
  console.log('  ' + c.err(`فشل [${r.status}]`) + ' ' + label + c.dim(' ← ' + msg + errs));
  return null;
}

// ── توسعة مقال الـRadius ──────────────────────────────────────────────────────
// المقال منشور بجملة واحدة (116 حرفاً) وحقوله الإنجليزية فارغة. الجملة الأصلية
// محفوظة في مطلع النص الجديد، والنسخة القديمة كاملة في ملف النسخ الاحتياطي.
async function doFixRadiusPost() {
  console.log(c.bold('\n■ توسعة مقال الـRadius'));
  const r = await api('GET', '/posts');
  const post = (r.json?.data ?? []).find(p => p.slug === RADIUS_POST.slug);

  if (!post) { console.log('  ' + c.dim('لم يُعثر على المقال — تُجوهل')); skipped++; return; }
  if (String(post.content ?? '').length > 1000) {
    console.log('  ' + c.dim('المقال موسّع مسبقاً — يُجوهل')); skipped++; return;
  }

  await update(`${post.title} (${String(post.content ?? '').length} → ${RADIUS_POST.contentAr.length} حرفاً)`,
    `/posts/${post.id}`, {
      title:      RADIUS_POST.titleAr,
      title_en:   RADIUS_POST.titleEn,
      excerpt:    RADIUS_POST.excerptAr,
      excerpt_en: RADIUS_POST.excerptEn,
      content:    RADIUS_POST.contentAr,
      content_en: RADIUS_POST.contentEn,
      image_url:  post.image_url ?? '',
      status:     'published',
    });
}

// ── تعطيل الشهادات التجريبية ──────────────────────────────────────────────────
// تعطيل لا حذف: الصف يبقى في قاعدة البيانات، والواجهة تُصفّي على is_active
// فيختفي القسم من الموقع. قابل للتراجع بضغطة في لوحة التحكم.
async function doDisableSeedTestimonials() {
  console.log(c.bold('\n■ الشهادات التجريبية'));
  const r = await api('GET', '/testimonials');
  const list = (r.json?.data ?? []).filter(t => t.is_active !== false && t.is_active !== 0);

  if (list.length === 0) { console.log('  ' + c.dim('لا توجد شهادات فعّالة — تُجوهل')); skipped++; return; }

  for (const t of list) {
    await update(`تعطيل: ${t.name}`, `/testimonials/${t.id}`, {
      name: t.name, name_en: t.name_en,
      position: t.position, position_en: t.position_en,
      company: t.company,
      text: t.text, text_en: t.text_en,
      rating: t.rating,
      is_active: false,
    });
  }
}

// ── التنفيذ ───────────────────────────────────────────────────────────────────
console.log(c.bold('تعبئة محتوى كودلانكو'));
console.log(APPLY
  ? c.warn('الوضع: تنفيذ فعلي — ستُكتب البيانات على الخادم')
  : c.dim('الوضع: عرض فقط — لن يُكتب شيء.  أضف --apply للتنفيذ'));

if (PLAN_ONLY) {
  await doPosts();
  await doTechStack();
  await doFixRadiusPost();
  await doDisableSeedTestimonials();
  console.log(c.bold('\n── الخلاصة ──'));
  console.log(c.dim('  عرض الخطة فقط، بلا مصادقة. للتنفيذ:  --token "<التوكن>" --apply'));
} else if (!(await checkAuth())) {
  process.exitCode = 2;
} else {
  await doPosts();
  await doTechStack();
  await doFixRadiusPost();
  await doDisableSeedTestimonials();

  console.log(c.bold('\n── الخلاصة ──'));
  if (APPLY) {
    console.log(`  أُضيف: ${created}   تُجوهل: ${skipped}   فشل: ${failed}`);
    if (failed) process.exitCode = 1;
  } else {
    console.log(c.dim('  عرض فقط. أعد التشغيل مع --apply للكتابة.'));
  }
}
