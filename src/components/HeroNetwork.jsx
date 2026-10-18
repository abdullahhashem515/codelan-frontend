import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView, useReducedMotion } from 'framer-motion';

// The hero's background: a network constellation — nodes, the links between
// them, and packets travelling those links — drifting a little with the
// pointer. It replaces two generic blurred glows with something that says what
// the company does (software, and the networks it runs on) in the same visual
// language as the service and methodology drawings.
//
// It sits on the critical path (the hero is not lazy-loaded), so it is kept
// small: the layout is generated once at module load from a fixed seed — same
// shape on every visit, no data, no layout work at render — and what moves is
// animated by the GPU, with no JavaScript or main-thread work per frame.


// Deterministic PRNG so the constellation is identical on every load.
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Two layouts, both built once at module load. The landscape one is cropped to
// its middle on a portrait phone (preserveAspectRatio "slice"), and its middle
// is exactly the oval kept clear for the headline — so a phone saw five nodes
// and a bare hero. The portrait layout puts its network in the bands above and
// below the text instead.
const build = ({ W, H, count, rx, ry, minDist, seed }) => {
  const r = rng(seed);
  const nodes = [];
  for (let tries = 0; nodes.length < count && tries < 3000; tries++) {
    const x = 30 + r() * (W - 60);
    const y = 24 + r() * (H - 48);
    // Keep an oval around the headline and buttons empty.
    const dx = (x - W / 2) / rx, dy = (y - H * 0.47) / ry;
    if (dx * dx + dy * dy < 1) continue;
    if (nodes.some(n => Math.hypot(n.x - x, n.y - y) < minDist)) continue;
    nodes.push({ x: Math.round(x), y: Math.round(y), r: +(1.6 + r() * 1.4).toFixed(1) });
  }

  // Each node links to its two nearest neighbours.
  const seen = new Set();
  const edges = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter(o => o.j !== i && o.d < 280)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(k)) { seen.add(k); edges.push([i, j]); }
      });
  });

  // The three best-connected nodes become hubs.
  const degree = nodes.map((_, i) => edges.filter(e => e.includes(i)).length);
  const hubs = degree.map((d, i) => [d, i]).sort((p, q) => q[0] - p[0]).slice(0, 3).map(([, i]) => i);

  // Packets on a spread of links, staggered so they never move in lockstep;
  // one red — the only accent colour, as in the other drawings.
  const step = Math.max(1, Math.floor(edges.length / 10));
  const packets = edges.filter((_, i) => i % step === 0).slice(0, 10).map((e, i) => ({
    e, dur: +(2.2 + r() * 2).toFixed(1), begin: +(r() * 3).toFixed(1), rev: i % 2 === 1, red: i === 4,
  }));

  // Faint far-layer dust for depth; it moves less than the network.
  const dust = Array.from({ length: 36 }, () => ({ x: Math.round(r() * W), y: Math.round(r() * H), o: +(0.15 + r() * 0.3).toFixed(2) }));

  const line = ([i, j], rev) => {
    const a = nodes[rev ? j : i], b = nodes[rev ? i : j];
    return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  };
  return { W, H, nodes, edges, hubs, packets, dust, line };
};

const LANDSCAPE = build({ W: 1200, H: 700, count: 30, rx: 380, ry: 205, minDist: 80, seed: 11 });
const PORTRAIT  = build({ W: 600,  H: 1100, count: 26, rx: 330, ry: 330, minDist: 64, seed: 23 });

// ── Motion on the compositor ─────────────────────────────────────────────────
// The packets and hub pulses used to be SVG (SMIL) animations. Those run on
// the main thread: every frame the browser recomputed the SVG and repainted
// the hero — and with it the whole page. Measured on a throttled phone, that
// alone kept the main thread busy almost without pause for the first seconds,
// so the page answered taps late.
//
// Now the drawing (links, nodes, dust) is static SVG painted once, and what
// moves is plain HTML elements animated with CSS transform and opacity, which
// the GPU runs without the main thread. Same paths, timings and colours.
//
// Every link is a straight line, so a packet is a translate from one end to
// the other. Coordinates are the drawing's own units: the drawing sits in a
// box of exactly W×H units, scaled to cover the hero (see `fit` below), so the
// keyframes are fixed numbers generated once here.
const keyframesFor = (L, tag) => L.packets.map((p, i) => {
  const [a, b] = p.rev ? [L.nodes[p.e[1]], L.nodes[p.e[0]]] : [L.nodes[p.e[0]], L.nodes[p.e[1]]];
  return `@keyframes hn-${tag}-${i}{from{transform:translate(${a.x}px,${a.y}px)}to{transform:translate(${b.x}px,${b.y}px)}}`;
}).join('');
const HUB_RING = 22; // the ring grows from r 6 to r 22, fading out
const CSS = keyframesFor(LANDSCAPE, 'l') + keyframesFor(PORTRAIT, 'p')
  + `@keyframes hn-hub{from{transform:scale(${(6 / HUB_RING).toFixed(3)});opacity:.6}to{transform:scale(1);opacity:0}}`;

const PACKET = 14; // glow diameter in drawing units; the core is 2.6 units in radius
const packetBg = (red) => {
  const c = red ? '220,27,28' : '96,165,250';
  return `radial-gradient(circle, rgb(${c}) 0 2.6px, rgba(${c},0.18) 2.6px 7px, transparent 7px)`;
};

const HeroNetwork = () => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const on = inView && !reduce;

  const [portrait, setPortrait] = useState(() => window.matchMedia('(max-aspect-ratio: 4/5)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-aspect-ratio: 4/5)');
    const onChange = () => setPortrait(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const L = portrait ? PORTRAIT : LANDSCAPE;
  const tag = portrait ? 'p' : 'l';
  const { W, H } = L;

  // "Cover" the hero with the W×H drawing, centred — what the SVG's
  // preserveAspectRatio="xMidYMid slice" used to do, applied to a box so the
  // HTML packets share the drawing's coordinates.
  const [fit, setFit] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const s = Math.max(w / W, h / H);
      setFit({ s, x: (w - W * s) / 2, y: (h - H * s) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, H]);

  // Pointer parallax: the network drifts toward the cursor, the dust half as
  // much. Only with a fine pointer — on touch there is no hover to follow.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  // Dust travels 40% as far — the gap between the two is what reads as depth.
  const dx = useTransform(sx, v => v * 0.4);
  const dy = useTransform(sy, v => v * 0.4);

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const move = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 36);
      my.set((e.clientY / window.innerHeight - 0.5) * 24);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, mx, my]);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden" style={{ contain: 'strict' }}>
      <style>{CSS}</style>
      {fit && (
        <div
          className="absolute left-0 top-0"
          style={{ width: W, height: H, transformOrigin: '0 0', transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})` }}
        >
          {/* Far layer */}
          <motion.div className="absolute inset-0" style={{ x: dx, y: dy }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
              {L.dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="1" fill="#94a3b8" opacity={d.o} />)}
            </svg>
          </motion.div>

          {/* Network */}
          <motion.div className="absolute inset-0" style={{ x: sx, y: sy }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
              {L.edges.map((e, i) => (
                <path key={i} d={L.line(e)} stroke="rgba(26,127,255,0.22)" strokeWidth="1" fill="none" />
              ))}
              {L.nodes.map((n, i) => {
                const hub = L.hubs.includes(i);
                return <circle key={i} cx={n.x} cy={n.y} r={hub ? 4 : n.r} fill={hub ? '#1a7fff' : '#60a5fa'} opacity={hub ? 1 : 0.7} />;
              })}
            </svg>

            {on && L.hubs.map((h) => {
              const n = L.nodes[h];
              return (
                <span
                  key={`hub-${h}`}
                  className="absolute rounded-full"
                  style={{
                    left: n.x - HUB_RING, top: n.y - HUB_RING, width: HUB_RING * 2, height: HUB_RING * 2,
                    border: '1px solid #1a7fff', opacity: 0,
                    animation: `hn-hub 3s linear ${h % 3}s infinite`,
                  }}
                />
              );
            })}

            {on && L.packets.map((p, i) => (
              <span
                key={`pk-${i}`}
                className="absolute rounded-full"
                style={{
                  left: -PACKET / 2, top: -PACKET / 2, width: PACKET, height: PACKET,
                  background: packetBg(p.red),
                  animation: `hn-${tag}-${i} ${p.dur}s linear ${p.begin}s infinite backwards`,
                  willChange: 'transform',
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Clear in the middle where the headline sits, full strength toward the
          edges. A gradient of the hero's own colour laid over the drawing looks
          the same as masking it — the background is a flat colour — but a mask
          is recomputed over the whole screen on every animated frame, and this
          is painted once. */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 44% 40% at 50% 47%, #050810 35%, rgba(5,8,16,0) 100%)' }} />
    </div>
  );
};

export default HeroNetwork;
