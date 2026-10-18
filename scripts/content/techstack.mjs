// خطة توسيع قسم التقنيات: من 4 تقنيات في فئتين إلى 32 في سبع فئات.
//
// الفئتان الأوليان موجودتان على الخادم (الواجهة الأمامية / الواجهة الخلفية)
// وتُستخدمان كما هما — السكربت يضيف إليها ولا يُعدّلها. الخمس الباقية تُنشأ.
//
// المصدر: قائمة التقنيات المكتوبة أصلاً في src/sections/TechStack.jsx كبديل
// احتياطي (FALLBACK)، مضافاً إليها أدوات الشبكات والمراقبة والاتصالات التي
// تقابل خدماتكم السبع المعلنة على الموقع.
//
// ⚠ راجع القائمة واحذف أي تقنية لا تستخدمونها فعلاً قبل التنفيذ. هذه صفحة
// قدرات — كل اسم فيها التزام أمام العميل.
export const TECH_PLAN = [
  {
    title: 'الواجهة الأمامية', titleEn: 'Frontend',
    items: [
      { name: 'Vue.js',     color: '#4ade80' },
      { name: 'TypeScript', color: '#3b82f6' },
      { name: 'JavaScript', color: '#facc15' },
    ],
  },
  {
    title: 'الواجهة الخلفية', titleEn: 'Backend & APIs',
    items: [
      { name: 'PHP',          color: '#8b95a5' },
      { name: 'Node.js',      color: '#22c55e' },
      { name: 'RESTful APIs', color: '#facc15' },
    ],
  },
  {
    title: 'قواعد البيانات', titleEn: 'Databases',
    items: [
      { name: 'MySQL',      color: '#3b82f6' },
      { name: 'PostgreSQL', color: '#60a5fa' },
      { name: 'Redis',      color: '#f87171' },
      { name: 'MongoDB',    color: '#22c55e' },
    ],
  },
  {
    title: 'تطبيقات الهواتف', titleEn: 'Mobile Apps',
    items: [
      { name: 'Flutter',      color: '#22d3ee' },
      { name: 'Dart',         color: '#93c5fd' },
      { name: 'React Native', color: '#3b82f6' },
    ],
  },
  {
    title: 'الشبكات والبنية التحتية', titleEn: 'Networks & Infrastructure',
    items: [
      { name: 'MikroTik RouterOS', color: '#94a3b8' },
      { name: 'Cisco',             color: '#06b6d4' },
      { name: 'Ubiquiti',          color: '#3b82f6' },
      { name: 'FreeRADIUS',        color: '#f59e0b' },
      { name: 'VLAN / 802.1Q',     color: '#a78bfa' },
    ],
  },
  {
    title: 'الأنظمة والاستضافة', titleEn: 'Systems & Hosting',
    items: [
      { name: 'Linux',  color: '#eab308' },
      { name: 'Nginx',  color: '#22c55e' },
      { name: 'Docker', color: '#60a5fa' },
      { name: 'Git',    color: '#fb923c' },
    ],
  },
  {
    title: 'المراقبة والاتصالات', titleEn: 'Surveillance & Voice',
    items: [
      { name: 'Hikvision', color: '#ef4444' },
      { name: 'Dahua',     color: '#f97316' },
      { name: 'Asterisk',  color: '#0158B0' },
      { name: 'FreePBX',   color: '#14b8a6' },
      { name: 'ONVIF',     color: '#8b95a5' },
    ],
  },
];
