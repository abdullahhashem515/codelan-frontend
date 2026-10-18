// SMIL helper for the drawings: renders the animation only when `on`, so the
// static attributes on the parent element are exactly what a still frame (off
// screen, or reduced motion) shows.
const Anim = ({ on, tag = 'animate', ...p }) => {
  if (!on) return null;
  const Tag = tag;
  return <Tag repeatCount="indefinite" {...p} />;
};

export default Anim;
