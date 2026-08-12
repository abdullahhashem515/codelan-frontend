// اسم الشركة وروابط التنقل الرئيسية — ثابتة ومشتركة بين الهيدر والفوتر
// (لا تأتي من الباك اند)، بملف مستقل حتى لا تُصدَّر بيانات خام من ملف مكوّن
// React (يكسر Fast Refresh).
export const SITE_NAME = { ar: 'كودلانكو', en: 'Codelanco' };

export const NAV_LINKS = [
  { id: '#services',     ar: 'الخدمات',    en: 'Services'     },
  { id: '#portfolio',    ar: 'المشاريع',   en: 'Portfolio'    },
  { id: '#techstack',    ar: 'التقنيات',   en: 'Tech Stack'   },
  { id: '#achievements', ar: 'الإنجازات',  en: 'Achievements' },
  { id: '#blog',         ar: 'المدونة',    en: 'Blog'         },
  { id: '#contact',      ar: 'تواصل معنا', en: 'Contact'      },
];
