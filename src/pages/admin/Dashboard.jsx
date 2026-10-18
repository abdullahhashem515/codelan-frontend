import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Wrench, Inbox, Newspaper, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import {
  apiGetDashboardStats, apiGetRequests, apiGetSettings,
  apiGetAllProjects, apiGetAllPosts, apiGetAllTestimonials,
} from '../../services/api';

// The overview answers two questions: what came in, and what on the site still
// needs fixing. It used to end in a dashed box reading "charts / tables area" —
// a development placeholder that shipped.
//
// The checklist is computed from live data every visit, so an item disappears
// the moment it is fixed; nothing here is a hard-coded reminder.

const list = (res) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
};

const SOCIAL_KEYS = ['facebook', 'twitter', 'instagram', 'linkedin', 'github', 'youtube', 'tiktok', 'telegram', 'discord'];

const buildChecks = ({ settings, projects, posts, testimonials }) => {
  const checks = [];
  if (settings && !settings.og_image) {
    checks.push({
      to: '/admin/settings',
      ar: 'صورة المشاركة غير مضبوطة', en: 'No share image set',
      subAr: 'روابط الموقع تظهر على واتساب وفيسبوك بلا صورة معاينة.',
      subEn: 'Links to the site show no preview image on WhatsApp and Facebook.',
    });
  }
  const legacy = settings ? SOCIAL_KEYS.filter(k => /codelan(?!co)/i.test(String(settings[k] ?? ''))) : [];
  if (legacy.length) {
    checks.push({
      to: '/admin/settings',
      ar: `${legacy.length} روابط تواصل باسم «codelan» القديم`, en: `${legacy.length} social links use the old "codelan" handle`,
      subAr: 'على الأقل حساب GitHub منها ليس لكم. استبدلها بحساباتكم أو احذفها.',
      subEn: 'At least the GitHub one belongs to someone else. Replace or remove them.',
    });
  }
  if (projects && projects.length < 3) {
    checks.push({
      to: '/admin/projects',
      ar: projects.length === 1 ? 'مشروع واحد فقط معروض' : `${projects.length} مشاريع فقط معروضة`,
      en: `Only ${projects.length} project${projects.length === 1 ? '' : 's'} shown`,
      subAr: 'قسم الأعمال هو الدليل الأقوى على خبرتكم — أضيفوا ما نفّذتموه.',
      subEn: 'The portfolio is your strongest proof — add the work you have delivered.',
    });
  }
  const noCover = posts ? posts.filter(p => !p.image_url).length : 0;
  if (noCover) {
    checks.push({
      to: '/admin/articles',
      ar: `${noCover} مقالات بلا صورة غلاف`, en: `${noCover} articles without a cover image`,
      subAr: 'تظهر بتدرّج لوني بدل صورة، وبلا معاينة عند مشاركتها.',
      subEn: 'They show a colour gradient instead of a picture, and no preview when shared.',
    });
  }
  if (testimonials && testimonials.length === 0) {
    checks.push({
      to: '/admin/testimonials',
      ar: 'قسم الشهادات مخفي', en: 'Testimonials section is hidden',
      subAr: 'لا توجد شهادة مفعّلة. أضيفوا شهادات حقيقية بموافقة أصحابها ليظهر القسم.',
      subEn: 'No testimonial is active. Add real ones, with permission, and the section appears.',
    });
  }
  return checks;
};

const Dashboard = () => {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [checks, setChecks] = useState(null);

  useEffect(() => {
    let active = true;
    apiGetDashboardStats().then(res => active && setStats(res.data)).catch(() => {});
    apiGetRequests().then(res => active && setRequests(list(res).slice(0, 5))).catch(() => {});
    Promise.allSettled([apiGetSettings(), apiGetAllProjects(), apiGetAllPosts(), apiGetAllTestimonials()])
      .then(([s, p, po, t]) => {
        if (!active) return;
        const val = (r) => (r.status === 'fulfilled' ? r.value : null);
        setChecks(buildChecks({
          settings: val(s)?.data ?? null,
          projects: val(p) ? list(val(p)) : null,
          posts: val(po) ? list(val(po)) : null,
          testimonials: val(t) ? list(val(t)).filter(x => x.is_active !== false && x.is_active !== 0) : null,
        }));
      });
    return () => { active = false; };
  }, []);

  const cards = [
    { to: '/admin/requests', icon: Inbox,        value: stats?.new_requests,    ar: 'طلبات جديدة',     en: 'New requests'    },
    { to: '/admin/projects', icon: FolderKanban, value: stats?.total_projects,  ar: 'الأعمال',         en: 'Work'            },
    { to: '/admin/articles', icon: Newspaper,    value: stats?.blog_posts,      ar: 'المقالات',        en: 'Articles'        },
    { to: '/admin/services', icon: Wrench,       value: stats?.active_services, ar: 'الخدمات الفعّالة', en: 'Active services' },
  ];

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString(ar ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  const panel = 'bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{ar ? 'نظرة عامة' : 'Overview'}</h1>

      {/* Counts — each one opens its page. One colour: they are four numbers,
          not four categories. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className={`${panel} p-5 md:p-6 group hover:border-blue-400/60 dark:hover:border-blue-500/30 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{ar ? c.ar : c.en}</span>
              <c.icon size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div className={`text-3xl md:text-4xl font-bold font-mono text-gray-900 dark:text-white ${stats ? '' : 'animate-pulse'}`}>
              {stats ? (c.value ?? '—') : '—'}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        {/* Latest requests */}
        <section className={`${panel} lg:col-span-3 p-5 md:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{ar ? 'آخر الطلبات' : 'Latest requests'}</h2>
            <Link to="/admin/requests" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {ar ? 'كل الطلبات' : 'All requests'} <Arrow size={14} />
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-slate-500">
              {ar ? 'لا توجد طلبات بعد. ستظهر هنا فور إرسال أي زائر لنموذج التواصل.' : 'No requests yet. They appear here as soon as a visitor uses the contact form.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/5 list-none">
              {requests.map(r => (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'new' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/15'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{r.type || r.email}</div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{fmtDate(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Needs attention */}
        <section className={`${panel} lg:col-span-2 p-5 md:p-6`}>
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">{ar ? 'يحتاج انتباهك' : 'Needs attention'}</h2>
          {checks === null ? (
            <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}</div>
          ) : checks.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 size={32} className="text-green-500" />
              <p className="text-sm text-gray-600 dark:text-slate-300">{ar ? 'كل شيء مضبوط.' : 'Everything is in order.'}</p>
            </div>
          ) : (
            <ul className="space-y-2 list-none">
              {checks.map((c, i) => (
                <li key={i}>
                  <Link to={c.to} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">{ar ? c.ar : c.en}</span>
                      <span className="block mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{ar ? c.subAr : c.subEn}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
