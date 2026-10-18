import { Globe, Smartphone, Palette, Clapperboard, Megaphone, Cctv, ExternalLink, AtSign } from 'lucide-react';

// The kinds of work the portfolio shows, stored in a project's `project_type`.
// Software work (web, mobile) is framed as a product — a browser or a phone.
// Creative work is not: a poster is shown as itself, motion as a video, and a
// managed account as its feed and its results.
export const WORK_KINDS = {
  web:    { tab: 'web',      Icon: Globe,        ar: 'تطبيق ويب',     en: 'Web app' },
  mobile: { tab: 'mobile',   Icon: Smartphone,   ar: 'تطبيق موبايل',  en: 'Mobile app' },
  design: { tab: 'design',   Icon: Palette,      ar: 'تصميم',         en: 'Design' },
  motion: { tab: 'motion',   Icon: Clapperboard, ar: 'موشن جرافيك',   en: 'Motion graphics' },
  social: { tab: 'social',   Icon: Megaphone,    ar: 'إدارة حسابات',  en: 'Social media' },
  // Field work — networks, cameras, phone exchanges — shown as a photo
  // gallery of the installation, like design work.
  infra:  { tab: 'infra',    Icon: Cctv,         ar: 'شبكات ومراقبة', en: 'Networks & CCTV' },
};

export const WORK_TABS = [
  // groupAr/groupEn head each category when "All" shows them together.
  { key: 'all',    ar: 'الكل',           en: 'All' },
  { key: 'web',    ar: 'مواقع ويب',      en: 'Websites',      groupAr: 'مواقع وأنظمة ويب',       groupEn: 'Websites & web systems' },
  { key: 'mobile', ar: 'تطبيقات موبايل', en: 'Mobile apps',   groupAr: 'تطبيقات الموبايل',       groupEn: 'Mobile apps' },
  { key: 'design', ar: 'تصميم',          en: 'Design',        groupAr: 'تصاميم',                 groupEn: 'Design' },
  { key: 'motion', ar: 'موشن',           en: 'Motion',        groupAr: 'موشن جرافيك',            groupEn: 'Motion graphics' },
  { key: 'social', ar: 'سوشيال ميديا',   en: 'Social media',  groupAr: 'إدارة حسابات التواصل',   groupEn: 'Social media management' },
  { key: 'infra',  ar: 'شبكات ومراقبة',  en: 'Networks & CCTV', groupAr: 'شبكات وأنظمة مراقبة',  groupEn: 'Networks & surveillance systems' },
];

// Anything unknown (or missing) is treated as web, as it always has been.
export const kindOf = (type) => (WORK_KINDS[type] ? type : 'web');
// Not framed as a product (browser / phone): shown as its own media instead.
export const isCreative = (type) => !['web', 'mobile'].includes(kindOf(type));
// Which tool list the admin form offers: design and marketing tools, or the
// technical list (which also holds networks and surveillance).
export const usesCreativeTools = (type) => ['design', 'motion', 'social'].includes(kindOf(type));

// The outbound links a project offers, by kind.
const LINK_LABELS = {
  ar: { visit: 'زيارة الموقع', appStore: 'App Store', playStore: 'Google Play', account: 'زيارة الحساب', work: 'عرض العمل كاملاً', video: 'مشاهدة على المنصة' },
  en: { visit: 'Visit website', appStore: 'App Store', playStore: 'Google Play', account: 'Visit the account', work: 'View the full work', video: 'Watch on the platform' },
};

export const projectLinks = (project, lang) => {
  const l = LINK_LABELS[lang] ?? LINK_LABELS.en;
  switch (kindOf(project.type)) {
    case 'mobile':
      return [
        project.appStoreUrl && { href: project.appStoreUrl, label: l.appStore, Icon: Smartphone },
        project.playStoreUrl && { href: project.playStoreUrl, label: l.playStore, Icon: Smartphone },
      ].filter(Boolean);
    case 'social':
      return project.url ? [{ href: project.url, label: l.account, Icon: AtSign }] : [];
    case 'design':
      return project.url ? [{ href: project.url, label: l.work, Icon: ExternalLink }] : [];
    case 'motion':
      return project.video ? [{ href: project.video.watch, label: l.video, Icon: ExternalLink }] : [];
    default:
      return project.url ? [{ href: project.url, label: l.visit, Icon: ExternalLink }] : [];
  }
};
