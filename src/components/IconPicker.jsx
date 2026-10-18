import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconForEmoji } from '../utils/iconMap';
import { ICON_GROUPS } from '../utils/iconChoices';

// Admin form control for picking an icon. The catalogue is grouped and covers
// the work this company actually does — the old flat list of 25 emoji had no
// camera, phone, network or code glyph, which is why services ended up with
// whatever was nearest ("cloud" on web systems, "box" on the VoIP exchange).
// Emits a lucide icon name; anything already saved as an emoji still resolves.
const IconPicker = ({ value, onChange, lang = 'ar' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ar = lang === 'ar';
  // Stable reference from a module-level map, not a component created during
  // render (same pattern as DynamicIcon).
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
        {/* eslint-disable-next-line react-hooks/static-components -- stable map lookup, see above */}
        <SelectedIcon size={26} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-2 start-0 w-80 max-h-80 overflow-y-auto p-3 space-y-3 bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl"
          >
            {ICON_GROUPS.map((group) => (
              <div key={group.en}>
                <div className="text-[10px] rtl:text-xs uppercase ltr:tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
                  {ar ? group.ar : group.en}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {group.items.map((name) => {
                    const Icon = getIconForEmoji(name);
                    const selected = name === value;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => { onChange(name); setOpen(false); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                          selected
                            ? 'bg-blue-500/10 border-blue-500 text-blue-500 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconPicker;
