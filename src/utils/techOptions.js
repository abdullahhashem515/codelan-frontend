// Pick-list for the project form's technologies field.
//
// Seeded from the stack the site already advertises in the Tech Stack section,
// plus the neighbours a project realistically pulls in. Anything missing can
// still be typed in by hand — this list is a shortcut, not a restriction.
//
// Groups marked creative are offered for design, motion and social media work;
// the rest for software.
export const TECH_GROUPS = [
  {
    ar: 'الواجهة الأمامية', en: 'Frontend',
    items: ['React', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Bootstrap', 'Alpine.js', 'Livewire', 'HTML/CSS'],
  },
  {
    ar: 'الواجهة الخلفية', en: 'Backend',
    items: ['Laravel', 'PHP', 'Node.js', 'Express', 'ASP.NET Core', 'C#', 'Python', 'Django', 'RESTful APIs', 'GraphQL', 'WebSockets'],
  },
  {
    ar: 'قواعد البيانات', en: 'Databases',
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'MariaDB', 'Firebase'],
  },
  {
    ar: 'تطبيقات الموبايل', en: 'Mobile',
    items: ['Flutter', 'Dart', 'React Native', 'Kotlin', 'Swift', 'Android', 'iOS'],
  },
  {
    ar: 'البنية والتشغيل', en: 'DevOps & Infra',
    items: ['Docker', 'AWS', 'Linux', 'Nginx', 'Apache', 'CI/CD', 'Cloudflare', 'cPanel'],
  },
  {
    ar: 'الشبكات', en: 'Networks',
    items: ['MikroTik', 'Cisco', 'Ubiquiti', 'Starlink', 'RADIUS'],
  },
  {
    ar: 'المراقبة والأمن', en: 'Surveillance & Security',
    items: ['IP Cameras', 'Analog HD', 'NVR', 'DVR', 'HVR', 'PoE', 'Hikvision', 'Dahua', 'Remote viewing', 'UPS / battery backup', 'Structured cabling'],
  },
  {
    ar: 'أدوات ومدفوعات', en: 'Tools & Payments',
    items: ['Figma', 'Git', 'Stripe', 'PayPal', 'Google Maps API', 'Firebase Auth', 'Twilio'],
  },
];

export const CREATIVE_GROUPS = [
  {
    ar: 'التصميم', en: 'Design',
    items: ['Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Canva', 'Lightroom', 'Procreate'],
  },
  {
    ar: 'الموشن والفيديو', en: 'Motion & Video',
    items: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'CapCut', 'Blender', 'Cinema 4D', 'Lottie'],
  },
  {
    ar: 'المنصات والإعلانات', en: 'Platforms & Ads',
    items: ['Instagram', 'Facebook', 'TikTok', 'X', 'LinkedIn', 'Snapchat', 'YouTube', 'Meta Business Suite', 'Meta Ads', 'Google Ads'],
  },
];

export const ALL_TECHS = TECH_GROUPS.flatMap(g => g.items);
