import { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate, useTransform, useReducedMotion } from 'framer-motion';

// Reusable hover micro-interaction: subtle 3D tilt + a pointer-following
// spotlight. Responds to both mouse (desktop) AND touch (mobile) — without
// touch support this entire interaction was silently dead on phones/tablets,
// since :hover/mousemove never fire there, making touch devices feel static
// next to desktop despite identical markup. The spotlight's visibility is
// driven by an `active` state (not CSS `group-hover`) so it works the same
// way regardless of input method.
// Entrance animation is untouched — pass `variants` and let the parent's
// whileInView/staggerChildren container drive it as usual.
const TiltCard = ({ children, className = '', variants, onClick, maxTilt = 6, ...rest }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(480px circle at ${spotlightX}px ${spotlightY}px, rgba(59,130,246,0.14), transparent 60%)`;

  const updateFromPoint = (clientX, clientY) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    spotlightX.set(px);
    spotlightY.set(py);
    if (!reduceMotion) {
      mouseX.set(px / rect.width - 0.5);
      mouseY.set(py / rect.height - 0.5);
    }
  };

  const handleMouseMove = (e) => { setActive(true); updateFromPoint(e.clientX, e.clientY); };
  const handleLeave = () => { setActive(false); mouseX.set(0); mouseY.set(0); };
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    setActive(true);
    updateFromPoint(touch.clientX, touch.clientY);
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 900,
      }}
      className={className}
      {...rest}
    >
      <motion.div
        aria-hidden="true"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background }}
      />
      {children}
    </motion.div>
  );
};

export default TiltCard;
