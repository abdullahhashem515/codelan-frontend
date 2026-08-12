import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICON_CHOICES, getIconForEmoji } from '../utils/iconMap';

// Admin form control that replaces the old "type an emoji" text input.
// Stores/emits the exact same emoji string as before (zero backend changes),
// but the admin picks it visually from a grid of real SVG icons instead of
// typing an OS emoji glyph.
const IconPicker = ({ value, onChange, lang = 'ar' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ar = lang === 'ar';
  const SelectedIcon = getIconForEmoji(value);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-16 h-16 flex items-center justify-center bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
        title={ar ? 'اختر أيقونة' : 'Choose an icon'}
      >
        <SelectedIcon size={26} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-2 start-0 w-64 p-3 grid grid-cols-5 gap-2 bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl"
          >
            {ICON_CHOICES.map((emoji) => {
              const Icon = getIconForEmoji(emoji);
              const selected = emoji === value;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { onChange(emoji); setOpen(false); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                    selected
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconPicker;
