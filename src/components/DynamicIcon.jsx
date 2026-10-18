import { motion } from 'framer-motion';
import { getIconForEmoji } from '../utils/iconMap';

// Renders the SVG icon matching a legacy emoji value (service.icon,
// achievement.icon, methodology step.icon, ...) instead of the raw OS emoji
// glyph. Purely a display-layer swap — the underlying value is still the
// same emoji string sent to/from the API.
const DynamicIcon = ({ emoji, size = 22, className = '' }) => {
  // getIconForEmoji is a lookup in a module-level map, so the same emoji
  // always yields the same component reference — nothing is constructed
  // during render and React never remounts the icon.
  const Icon = getIconForEmoji(emoji);
  return (
    <motion.span
      whileHover={{ scale: 1.12, rotate: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- stable map lookup, see above */}
      <Icon size={size} strokeWidth={1.8} />
    </motion.span>
  );
};

export default DynamicIcon;
