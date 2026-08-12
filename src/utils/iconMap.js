import {
  Zap, Wrench, Cloud, Smartphone, ShieldCheck, Palette, Search, Settings,
  FlaskConical, Rocket, Trophy, Package, Star, FileText, Handshake, Lock,
  Sparkles, HardHat, Lightbulb, Hammer, BarChart3,
} from 'lucide-react';

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
};

export const ICON_CHOICES = Object.keys(ICON_MAP);

export const getIconForEmoji = (emoji) => ICON_MAP[emoji] ?? Sparkles;
