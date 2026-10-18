// ── Matching a service to its drawing ─────────────────────────────────────────
// Shared by ServiceArt (which drawing) and the services section (which group).
// By title, not icon: the icons stored for these services are leftover emoji
// (a parcel for the phone exchange, a padlock for cameras). Order matters — the
// cameras title contains "الأمنية", so cameras must be tested before security,
// and the security title mentions networks, so it is tested before infra.
// Social and motion come first: "تصميم بوسترات" would otherwise be caught by
// the UI/UX "تصميم" rule.
const KINDS = [
  ['social',   /تواصل\s*(ال)?اجتماعي|سوشيال|سوشال|social/i],
  ['motion',   /بوستر|موشن|جرافيك|جرافيكس|poster|motion|graphic/i],
  ['cctv',     /كاميرا|كاميرات|cctv|camera/i],
  ['voip',     /بدال|pbx|voip/i],
  ['security', /أمن|سيبران|security|cyber/i],
  ['infra',    /بنية|شبكات|network|infrastructure/i],
  ['design',   /تصميم|ui\s*\/?\s*ux|design/i],
  ['mobile',   /هواتف|موبايل|جوال|mobile|\bapps?\b/i],
  ['web',      /ويب|web|خلفية|backend|\bapi/i],
];

// Which portfolio tab(s) hold examples of a service, best first. Network,
// security, PBX and camera work point at the networks & surveillance tab. The posters & motion service points at design first, then motion;
// UI/UX at apps first, then websites.
export const WORK_TABS_FOR_KIND = {
  web: ['web'], mobile: ['mobile'], design: ['mobile', 'web'],
  social: ['social'], motion: ['design', 'motion'],
  infra: ['infra'], cctv: ['infra'], security: ['infra'], voip: ['infra'],
};

export const artKindFor = (service) => {
  const text = `${service.title ?? ''} ${service.titleEn ?? ''}`;
  const hit = KINDS.find(([, re]) => re.test(text));
  return hit ? hit[0] : 'generic';
};
