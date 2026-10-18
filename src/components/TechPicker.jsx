import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { TECH_GROUPS, CREATIVE_GROUPS } from '../utils/techOptions';

// Replaces the old free-text "comma separated" input, which could not actually
// be typed into: it parsed on every keystroke and dropped empty entries, so the
// comma you had just typed was deleted before you could type the next name
// ("React, Laravel" ended up as "ReactLaravel"). Picking from a list removes
// the parsing step entirely, and anything missing can still be added by hand.
const TechPicker = ({ value = [], onChange, lang = 'ar', creative = false }) => {
  const ar = lang === 'ar';
  const groups = creative ? CREATIVE_GROUPS : TECH_GROUPS;
  const [custom, setCustom] = useState('');

  const selected = Array.isArray(value) ? value : [];
  const has = (tech) => selected.includes(tech);

  const toggle = (tech) => {
    onChange(has(tech) ? selected.filter(t => t !== tech) : [...selected, tech]);
  };

  const addCustom = () => {
    const tech = custom.trim();
    if (!tech || has(tech)) { setCustom(''); return; }
    onChange([...selected, tech]);
    setCustom('');
  };

  return (
    <div className="space-y-4">
      {/* المختار حالياً — بالترتيب الذي سيظهر به على البطاقة */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#050810]/50 border border-gray-200 dark:border-white/10">
          {selected.map(tech => (
            <span key={tech} className="inline-flex items-center gap-1.5 text-xs font-english bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg">
              {tech}
              <button
                type="button"
                onClick={() => toggle(tech)}
                aria-label={(ar ? 'إزالة ' : 'Remove ') + tech}
                className="hover:text-red-400 transition-colors"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* الخيارات، مجمّعة */}
      <div className="space-y-3 max-h-64 overflow-y-auto pe-1">
        {groups.map(group => (
          <div key={group.en}>
            <div className="text-[10px] rtl:text-xs uppercase ltr:tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
              {ar ? group.ar : group.en}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggle(tech)}
                  aria-pressed={has(tech)}
                  className={`text-xs font-english px-2.5 py-1 rounded-lg border transition-colors ${
                    has(tech)
                      ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500/40'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* أي تقنية خارج القائمة */}
      <div className="flex gap-2">
        <input
          type="text"
          dir="ltr"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={ar ? 'تقنية أخرى غير موجودة أعلاه...' : 'Another technology not listed above...'}
          className="flex-1 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:border-blue-500 outline-none transition-colors font-english"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:border-blue-500 transition-colors"
          aria-label={ar ? 'إضافة' : 'Add'}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default TechPicker;
