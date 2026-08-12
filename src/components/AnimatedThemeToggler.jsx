import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// زر تبديل الوضع الداكن/الفاتح مع دائرة كشف تتمدد من نقطة الزر عبر
// View Transitions API (مبني يدوياً، بدون أي حزمة خارجية). المتصفحات التي لا
// تدعم الـ API (Firefox/Safari القديمة) تتحول تلقائياً للتبديل الفوري العادي.
const AnimatedThemeToggler = ({ className = '', iconSize = 17, label = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef(null);

  const handleClick = async () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!buttonRef.current || !document.startViewTransition || reduceMotion) {
      toggleTheme();
      return;
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      toggleTheme();
    });

    try {
      await transition.ready;
    } catch {
      return;
    }

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
    );
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      title={label}
      aria-label={label}
      className={className}
    >
      {theme === 'dark' ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
    </motion.button>
  );
};

export default AnimatedThemeToggler;
