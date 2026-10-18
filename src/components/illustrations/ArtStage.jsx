import { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// The frame every drawing sits in: same dark canvas, same faint grid, same blue
// glow from the top. `children` may be a function of `on` — true while the
// stage is on screen and motion is allowed — so drawings animate only when
// someone can see them.
const ArtStage = ({ children, className = '', style }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-40px' });
  const reduce = useReducedMotion();
  const on = inView && !reduce;

  return (
    <div
      ref={ref}
      className={`relative aspect-[40/22] overflow-hidden bg-[#0b1220] ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(26,127,255,0.16), transparent 70%),' +
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 22px 22px, 22px 22px',
        ...style,
      }}
    >
      {typeof children === 'function' ? children(on) : children}
    </div>
  );
};

export default ArtStage;
