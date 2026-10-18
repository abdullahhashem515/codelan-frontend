// Icon catalogue offered to the admin when picking an icon for a service,
// achievement or methodology step.
//
// It used to be 25 generic emoji with no camera, no phone, no network and no
// code glyph — so services ended up labelled with whatever was closest
// ("cloud" for web systems, "box" for the VoIP exchange, "lock" for security
// cameras). The values here are lucide icon names, which getIconForEmoji
// resolves alongside the legacy emoji, so anything already saved keeps working.
export const ICON_GROUPS = [
  {
    ar: 'برمجة وتطوير',
    en: 'Software',
    items: ['code', 'code-xml', 'terminal', 'globe', 'smartphone', 'tablet',
            'layout-dashboard', 'palette', 'database', 'server', 'cloud',
            'git-branch', 'bug', 'rocket'],
  },
  {
    ar: 'شبكات وبنية تحتية',
    en: 'Networks & Infrastructure',
    items: ['network', 'wifi', 'router', 'antenna', 'cable', 'hard-drive',
            'cpu', 'radio', 'shield', 'shield-check', 'lock', 'camera',
            'video', 'phone', 'phone-call'],
  },
  {
    ar: 'تصميم ومحتوى رقمي',
    en: 'Design & Digital Content',
    items: ['pen-tool', 'megaphone', 'share-2', 'heart', 'calendar-days', 'image', 'brush', 'film', 'clapperboard'],
  },
  {
    ar: 'أعمال وعام',
    en: 'Business & General',
    items: ['award', 'users', 'user-check', 'handshake', 'briefcase',
            'check-circle', 'trending-up', 'target', 'zap', 'settings',
            'wrench', 'lightbulb', 'file-text', 'star', 'clock', 'headphones',
            'life-buoy', 'package', 'map-pin', 'mail'],
  },
];

export const ICON_NAMES = ICON_GROUPS.flatMap(g => g.items);
