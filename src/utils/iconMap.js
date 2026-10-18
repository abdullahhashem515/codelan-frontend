import {
  Zap, Wrench, Cloud, Smartphone, ShieldCheck, Palette, Search, Settings,
  FlaskConical, Rocket, Trophy, Package, Star, FileText, Handshake, Lock,
  Sparkles, HardHat, Lightbulb, Hammer, BarChart3, Code2, TrendingUp, Target, Timer,
} from 'lucide-react';
import { ICONS_BY_NAME } from './iconRegistry';

// Maps the emoji strings still stored as `icon` values (services, achievements,
// methodology steps, blog posts — either hardcoded fallback data or coming from
// the backend as-is) to a matching lucide SVG icon component for display.
// The underlying data/API contract is untouched — only the rendering changes.
export const ICON_MAP = {
  '⚡': Zap,
  '🔧': Wrench,
  '☁️': Cloud,
  '📱': Smartphone,
  '🛡️': ShieldCheck,
  '🎨': Palette,
  '🔍': Search,
  '⚙️': Settings,
  '🧪': FlaskConical,
  '🚀': Rocket,
  '🏆': Trophy,
  '📦': Package,
  '⭐': Star,
  '📝': FileText,
  '🤝': Handshake,
  '🔒': Lock,
  '✨': Sparkles,
  '🏗️': HardHat,
  '💡': Lightbulb,
  '🛠️': Hammer,
  '📊': BarChart3,
  '💻': Code2,
  '📈': TrendingUp,
  '🎯': Target,
  '⏱️': Timer,
};

export const ICON_CHOICES = Object.keys(ICON_MAP);

// The backend does not send emoji — it sends lucide icon names in kebab-case
// ('users', 'pen-tool', 'check-circle'). Those missed the emoji map entirely, so
// every achievement and every methodology step fell through to the same
// Sparkles placeholder. Resolve a name against lucide first, then the legacy
// emoji map, then give up.
export const getIconForEmoji = (value) => {
  if (!value) return Sparkles;
  if (ICON_MAP[value]) return ICON_MAP[value];

  // Kebab-case lucide names, from an explicit registry — not the whole library.
  return ICONS_BY_NAME[String(value).trim().toLowerCase()] ?? Sparkles;
};
