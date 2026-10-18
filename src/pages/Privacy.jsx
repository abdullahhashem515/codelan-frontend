import { useEffect, Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LangContext';
import { useSettings } from '../context/SettingsContext';

const Footer = lazyWithRetry(() => import('../components/Footer'));

// Written from what the site actually does — checked against the code when it
// was written, not adapted from a template:
//  • The only personal data collected is what a visitor types into the
//    contact form: name, email, optional phone, optional project type, message.
//  • No cookies are set. The browser keeps three things locally: the chosen
//    language, light/dark mode, and a cached copy of the public site settings.
//  • There are no analytics or advertising scripts.
//  • Videos (motion-graphics work) come from YouTube or Vimeo, and their
//    player is loaded only when the visitor presses play.
// If any of that changes — analytics added, a newsletter, a new form — this
// page has to change with it.
const UPDATED = '2026-10-05';

const CONTENT = {
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث',
    back: 'العودة للرئيسية',
    sections: [
      ['من نحن', ['كودلانكو شركة تقنية في اليمن تقدّم خدمات البرمجيات والشبكات. هذه السياسة تشرح ما نجمعه عبر هذا الموقع، ولماذا، وكيف تتحكم فيه.']],
      ['ما الذي نجمعه', [
        'نجمع فقط ما تكتبه بنفسك في نموذج «تواصل معنا»: الاسم، والبريد الإلكتروني، ورقم الهاتف (اختياري)، ونوع المشروع (اختياري)، وتفاصيل رسالتك.',
        'لا نطلب منك إنشاء حساب، ولا نجمع أي بيانات شخصية أخرى عبر الموقع.',
      ]],
      ['لماذا نجمعه', ['نستخدم هذه البيانات للرد على طلبك والتواصل معك بخصوص مشروعك فقط، ولا نستخدمها لأي غرض آخر.']],
      ['أين تُحفظ ومن يطّلع عليها', [
        'تُحفظ طلبات التواصل في قاعدة بيانات الموقع، ولا يطّلع عليها إلا فريقنا عبر لوحة إدارة محمية بكلمة مرور.',
        'لا نبيع بياناتك ولا نؤجّرها ولا نشاركها مع أي جهة لأغراض تسويقية.',
      ]],
      ['ملفات تعريف الارتباط والتخزين في متصفحك', [
        'لا يستخدم الموقع ملفات تعريف الارتباط (Cookies)، ولا أدوات تتبّع أو إعلانات أو تحليلات.',
        'يحفظ الموقع في متصفحك ثلاثة أشياء فقط لتحسين تجربتك: اللغة التي اخترتها، والوضع الفاتح أو الداكن، ونسخة من إعدادات الموقع العامة لتسريع التحميل. تبقى هذه في جهازك، ويمكنك حذفها من إعدادات المتصفح في أي وقت.',
      ]],
      ['الروابط الخارجية', ['عند الضغط على رابط واتساب أو حساباتنا على مواقع التواصل، تنتقل إلى تلك الخدمات وتسري عليك سياسات الخصوصية الخاصة بها.']],
      ['الفيديوهات المضمّنة', ['بعض أعمالنا فيديوهات مستضافة على YouTube أو Vimeo. لا يُحمَّل مشغّل الفيديو ولا يتصل متصفحك بتلك الخدمة إلا عندما تضغط زر التشغيل بنفسك؛ عندها تسري سياسة خصوصية الخدمة المشغِّلة. نستخدم وضع YouTube المحسَّن للخصوصية (youtube-nocookie).']],
      ['حقوقك', ['يمكنك في أي وقت أن تطلب الاطلاع على البيانات التي أرسلتها لنا أو تصحيحها أو حذفها، بمراسلتنا على البريد أدناه.']],
      ['التعديلات على هذه السياسة', ['قد نحدّث هذه السياسة إذا تغيّر ما يقوم به الموقع، وسيظهر تاريخ آخر تحديث أعلى الصفحة.']],
    ],
    contact: 'للتواصل بخصوص الخصوصية:',
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated',
    back: 'Back to home',
    sections: [
      ['Who we are', ['Codelanco is a technology company in Yemen providing software and networking services. This policy explains what this website collects, why, and how you control it.']],
      ['What we collect', [
        'Only what you type into the "Contact us" form yourself: your name, email address, phone number (optional), project type (optional) and your message.',
        'You do not need an account, and the website collects no other personal data.',
      ]],
      ['Why we collect it', ['We use it only to reply to your request and to contact you about your project — for nothing else.']],
      ['Where it is kept and who sees it', [
        'Contact requests are stored in the website\'s database and are seen only by our team, through a password-protected admin panel.',
        'We do not sell, rent or share your data with anyone for marketing.',
      ]],
      ['Cookies and storage in your browser', [
        'The website sets no cookies and uses no tracking, advertising or analytics tools.',
        'It stores three things in your browser to improve your experience: your chosen language, light or dark mode, and a copy of the public site settings so pages load faster. They stay on your device, and you can clear them from your browser settings at any time.',
      ]],
      ['External links', ['When you follow a WhatsApp link or one of our social media accounts, you move to those services and their own privacy policies apply.']],
      ['Embedded videos', ['Some of our work is video hosted on YouTube or Vimeo. The player is not loaded, and your browser does not contact that service, until you press play yourself; from then on that service’s privacy policy applies. We use YouTube’s privacy-enhanced mode (youtube-nocookie).']],
      ['Your rights', ['You can ask at any time to see, correct or delete the data you sent us, by emailing the address below.']],
      ['Changes to this policy', ['We will update this policy if what the website does changes; the date of the last update appears at the top of this page.']],
    ],
    contact: 'Privacy questions:',
  },
};

const Privacy = () => {
  const { lang } = useLang();
  const settings = useSettings();
  const ar = lang === 'ar';
  const c = CONTENT[lang];
  const Back = ar ? ArrowRight : ArrowLeft;

  useEffect(() => { document.title = `${c.title} | ${ar ? 'كودلانكو' : 'Codelanco'}`; }, [c.title, ar]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-32 pb-24">
        <article className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
            <Back size={16} aria-hidden="true" /> {c.back}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {c.updated}: <time dateTime={UPDATED}>{new Date(UPDATED).toLocaleDateString(ar ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </p>

          <div className="mt-10 space-y-9">
            {c.sections.map(([heading, paras]) => (
              <section key={heading}>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">{heading}</h2>
                {paras.map((p, i) => (
                  <p key={i} className="text-gray-700 dark:text-slate-300 leading-[1.9] mb-3">{p}</p>
                ))}
              </section>
            ))}
          </div>

          {settings.email && (
            <p className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300">
              {c.contact}{' '}
              <a href={`mailto:${settings.email}`} dir="ltr" className="text-blue-600 dark:text-blue-400 hover:underline">{settings.email}</a>
            </p>
          )}
        </article>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
    </>
  );
};

export default Privacy;
