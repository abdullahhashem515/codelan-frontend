import { Cloud, Router, Server, Laptop, Cctv, Phone, PhoneCall, Wifi } from 'lucide-react';
import DynamicIcon from '../DynamicIcon';
import Anim from './Anim';
import ArtStage from './ArtStage';
import { C, VB, useSvgId } from './artKit';
import { artKindFor } from './serviceKinds';

// One animated drawing per service, all built from the same palette and set in
// the same dark stage, so the seven cards read as one family rather than seven
// unrelated pictures.
//
// Everything animates with native SVG (SMIL) elements: the browser runs them
// without any JavaScript per frame. They are only mounted while the card is on
// screen, and never with reduced motion — each drawing then shows its finished
// state as a still.


// ── 1. Web systems — an editor whose code types itself, then the build passes ─
const WebArt = ({ on }) => {
  const DUR = '7s';
  const rows = [
    [0, [[34, C.blue], [56, C.sky], [14, C.dim]]],
    [1, [[40, C.blue], [66, C.text], [12, C.dim], [44, C.sky]]],
    [1, [[52, C.sky], [28, C.dim], [60, C.green]]],
    [2, [[28, C.blue], [80, C.text], [20, C.red]]],
    [2, [[58, C.sky], [38, C.green]]],
    [1, [[18, C.dim]]],
    [0, [[14, C.dim]]],
  ];
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <rect x="40" y="16" width="320" height="188" rx="12" fill={C.panel} stroke={C.edge} />
      <path d="M40 40 V28 a12 12 0 0 1 12 -12 H348 a12 12 0 0 1 12 12 V40 Z" fill={C.panel2} />
      {[58, 72, 86].map((x, i) => <circle key={x} cx={x} cy="28" r="4" fill={i === 0 ? C.red : C.dim} />)}
      <rect x="160" y="23" width="80" height="10" rx="5" fill={C.edge} />
      {rows.map(([indent, toks], r) => {
        let x = 76 + indent * 16;
        const y = 56 + r * 19;
        return (
          <g key={r}>
            <rect x="54" y={y} width="8" height="3" rx="1.5" fill={C.dim} opacity="0.6" />
            {toks.map(([w, col], t) => {
              const tx = x; x += w + 6;
              const s = +((0.04 + r * 0.03 + t * 0.008).toFixed(3));
              const e = +(s + 0.05).toFixed(3);
              return (
                <rect key={t} x={tx} y={y - 2} width={w} height="7" rx="3.5" fill={col} opacity="0.9">
                  <Anim on={on} attributeName="width" dur={DUR}
                    values={`0;0;${w};${w};0;0`} keyTimes={`0;${s};${e};0.82;0.9;1`} />
                </rect>
              );
            })}
          </g>
        );
      })}
      <g>
        <Anim on={on} attributeName="opacity" dur={DUR} values="0;0;1;1;0;0" keyTimes="0;0.55;0.62;0.82;0.9;1" />
        <rect x="248" y="170" width="98" height="24" rx="12" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.5)" />
        <path d="M261 182l4 4 8-8" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="280" y="179" width="54" height="6" rx="3" fill={C.green} opacity="0.85" />
      </g>
    </svg>
  );
};

// ── 2. Mobile apps — a phone whose list fills in, with a notification and a chart
const MobileArt = ({ on }) => {
  const DUR = '6s';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {/* Notification bubble */}
      <g>
        <Anim on={on} attributeName="opacity" dur={DUR} values="0;0;1;1;0;0" keyTimes="0;0.35;0.42;0.85;0.92;1" />
        <rect x="46" y="54" width="92" height="30" rx="15" fill={C.panel2} stroke={C.blue} strokeOpacity="0.6" />
        <circle cx="62" cy="69" r="6" fill={C.red} />
        <rect x="74" y="63" width="52" height="5" rx="2.5" fill={C.text} opacity="0.7" />
        <rect x="74" y="72" width="34" height="4" rx="2" fill={C.dim} />
      </g>

      {/* Phone */}
      <rect x="152" y="12" width="96" height="196" rx="18" fill={C.panel} stroke={C.edge} strokeWidth="1.5" />
      <rect x="186" y="19" width="28" height="6" rx="3" fill={C.panel2} />
      <rect x="160" y="32" width="80" height="18" rx="5" fill={C.deep} />
      <rect x="168" y="38" width="30" height="5" rx="2.5" fill="#ffffff" opacity="0.8" />
      {[60, 88, 116, 144].map((y, i) => {
        const s = +(0.05 + i * 0.07).toFixed(2);
        return (
          <g key={y}>
            <Anim on={on} attributeName="opacity" dur={DUR}
              values="0;0;1;1;0;0" keyTimes={`0;${s};${+(s + 0.06).toFixed(2)};0.85;0.92;1`} />
            <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={DUR}
              values="0 10;0 10;0 0;0 0;0 0;0 10" keyTimes={`0;${s};${+(s + 0.06).toFixed(2)};0.85;0.92;1`} />
            <rect x="160" y={y} width="80" height="22" rx="6" fill={C.panel2} />
            <circle cx="171" cy={y + 11} r="6" fill={i === 1 ? C.blue : C.sky} opacity="0.85" />
            <rect x="182" y={y + 6} width="44" height="4" rx="2" fill={C.text} opacity="0.6" />
            <rect x="182" y={y + 13} width="28" height="3" rx="1.5" fill={C.dim} />
          </g>
        );
      })}
      {/* Tab bar with a moving indicator */}
      <rect x="160" y="178" width="80" height="20" rx="6" fill={C.panel2} />
      {[172, 192, 212, 230].map(x => <circle key={x} cx={x} cy="186" r="3" fill={C.dim} />)}
      <rect x="165" y="193" width="14" height="3" rx="1.5" fill={C.blue}>
        <Anim on={on} attributeName="x" dur={DUR} calcMode="spline"
          values="165;185;205;223;165" keyTimes="0;0.25;0.5;0.75;1"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
      </rect>

      {/* Chart card */}
      <rect x="264" y="118" width="96" height="62" rx="10" fill={C.panel2} stroke={C.edge} />
      {[0, 1, 2, 3, 4].map(i => {
        const h = [18, 28, 22, 36, 30][i];
        return (
          <rect key={i} x={276 + i * 16} y={170 - h} width="9" height={h} rx="2" fill={i === 3 ? C.blue : C.sky} opacity="0.85">
            <Anim on={on} attributeName="height" dur={DUR} values={`4;${h};${h};4`} keyTimes="0;0.3;0.85;1" />
            <Anim on={on} attributeName="y" dur={DUR} values={`166;${170 - h};${170 - h};166`} keyTimes="0;0.3;0.85;1" />
          </rect>
        );
      })}
    </svg>
  );
};

// ── 3. Cybersecurity — traffic passes the shield, one threat is stopped at it ──
const SecurityArt = ({ on }) => {
  const id = useSvgId();
  const DUR = '4s';
  const shield = 'M200 46 L246 64 V108 C246 140 226 162 200 174 C174 162 154 140 154 108 V64 Z';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <defs>
        <clipPath id={`${id}c`}><path d={shield} /></clipPath>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue} stopOpacity="0" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {[70, 110, 150].map(y => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke={C.line} strokeDasharray="3 5" />
      ))}

      {/* Clean packets pass through */}
      {[[70, 0, C.sky], [110, 1.3, C.blue], [70, 2.4, C.blue]].map(([y, b, col], i) => (
        <rect key={i} x={on ? -20 : 300 - i * 90} y={y - 6} width="18" height="12" rx="3" fill={col}>
          <Anim on={on} attributeName="x" dur={DUR} begin={`${b}s`} values="-20;400" keyTimes="0;1" />
        </rect>
      ))}

      {/* The threat: stops at the shield edge and is dropped */}
      <rect x={on ? -20 : 128} y="144" width="18" height="12" rx="3" fill={C.red} opacity={on ? 1 : 0}>
        <Anim on={on} attributeName="x" dur={DUR} values="-20;134;134;134" keyTimes="0;0.5;0.62;1" />
        <Anim on={on} attributeName="opacity" dur={DUR} values="1;1;0;0" keyTimes="0;0.5;0.62;1" />
      </rect>
      <circle cx="152" cy="150" r="0" fill="none" stroke={C.red} strokeWidth="2">
        <Anim on={on} attributeName="r" dur={DUR} values="0;0;16;16" keyTimes="0;0.5;0.66;1" />
        <Anim on={on} attributeName="opacity" dur={DUR} values="0;1;0;0" keyTimes="0;0.5;0.66;1" />
      </circle>

      {/* Shield with a scan sweeping through it */}
      <path d={shield} fill={C.panel2} stroke={C.blue} strokeWidth="2" />
      <g clipPath={`url(#${id}c)`}>
        <rect x="150" y="30" width="100" height="26" fill={`url(#${id}s)`}>
          <Anim on={on} attributeName="y" dur="2s" values="30;160;30" keyTimes="0;0.5;1" />
        </rect>
      </g>
      <path d="M190 104 V96 a10 10 0 0 1 20 0 V104" fill="none" stroke={C.sky} strokeWidth="3" strokeLinecap="round" />
      <rect x="184" y="104" width="32" height="26" rx="5" fill={C.deep} stroke={C.sky} strokeWidth="1.5" />
      <circle cx="200" cy="115" r="3.5" fill="#ffffff" />
      <rect x="198.5" y="116" width="3" height="7" rx="1.5" fill="#ffffff" />

      {/* All-clear badge */}
      <g>
        <Anim on={on} attributeName="opacity" dur={DUR} values="0;0;1;1;0" keyTimes="0;0.64;0.7;0.92;1" />
        <circle cx="236" cy="150" r="11" fill={C.green} />
        <path d="M231 150l3.5 3.5 6.5-7" fill="none" stroke="#0b1220" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// ── 4. UI/UX design — a cursor places a button, then selects a card ───────────
const DesignArt = ({ on }) => {
  const DUR = '6s';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {/* Artboard */}
      <rect x="44" y="18" width="270" height="184" rx="10" fill={C.panel} stroke={C.edge} />
      <rect x="56" y="30" width="246" height="12" rx="4" fill={C.panel2} />
      <circle cx="64" cy="36" r="3.5" fill={C.blue} />
      {[250, 268, 286].map(x => <rect key={x} x={x} y="34" width="12" height="4" rx="2" fill={C.dim} />)}

      <rect x="56" y="56" width="118" height="8" rx="4" fill={C.text} opacity="0.75" />
      <rect x="56" y="70" width="88" height="6" rx="3" fill={C.dim} />

      {/* The button: outlined, then filled when the cursor clicks it */}
      <rect x="56" y="88" width="64" height="20" rx="10" fill={on ? 'transparent' : C.blue} stroke={C.blue} strokeDasharray={on ? '4 3' : '0'}>
        <Anim on={on} attributeName="fill" dur={DUR} calcMode="discrete"
          values={`transparent;${C.blue};${C.blue};transparent`} keyTimes="0;0.3;0.9;1" />
      </rect>

      {/* Image placeholder */}
      <rect x="196" y="54" width="106" height="58" rx="6" fill={C.panel2} />
      <path d="M204 104 l22 -22 l16 16 l10 -10 l30 16 Z" fill={C.dim} opacity="0.7" />
      <circle cx="280" cy="70" r="6" fill={C.sky} opacity="0.7" />

      {/* Cards, the middle one gets selected */}
      {[56, 138, 220].map((x) => <rect key={x} x={x} y="126" width="74" height="62" rx="7" fill={C.panel2} />)}
      <g opacity={on ? 0 : 1}>
        <Anim on={on} attributeName="opacity" dur={DUR} calcMode="discrete" values="0;1;0" keyTimes="0;0.62;0.92" />
        <rect x="136" y="124" width="78" height="66" rx="8" fill="none" stroke={C.blue} strokeWidth="1.5" />
        {[[136, 124], [214, 124], [136, 190], [214, 190]].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="#ffffff" stroke={C.blue} />
        ))}
      </g>

      {/* Swatches */}
      {[C.blue, C.sky, C.red, C.text].map((c, i) => (
        <circle key={c} cx="344" cy={44 + i * 24} r="8" fill={c} stroke={C.edge} />
      ))}

      {/* Cursor */}
      <g transform={on ? undefined : 'translate(176 150)'}>
        <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={DUR} calcMode="spline"
          values="330 190;88 98;88 98;176 150;176 150;330 190" keyTimes="0;0.24;0.34;0.56;0.9;1"
          keySplines="0.4 0 0.2 1;0 0 1 1;0.4 0 0.2 1;0 0 1 1;0.4 0 0.2 1" />
        <path d="M0 0 L0 16 L4.5 12 L8 19 L11 17.5 L7.5 11 L13 11 Z" fill="#ffffff" stroke="#0b1220" strokeWidth="1" />
      </g>
    </svg>
  );
};

// ── 5. Network infrastructure — packets across a real topology ────────────────
const NET_NODES = {
  cloud:  { x: 200, y: 26,  Icon: Cloud },
  router: { x: 200, y: 82,  Icon: Router, main: true },
  swA:    { x: 118, y: 136, Icon: Server },
  swB:    { x: 282, y: 136, Icon: Server },
  laptop: { x: 56,  y: 190, Icon: Laptop },
  camera: { x: 154, y: 190, Icon: Cctv },
  phone:  { x: 246, y: 190, Icon: Phone },
  ap:     { x: 344, y: 190, Icon: Wifi },
};
const NET_LINKS = [['cloud', 'router'], ['router', 'swA'], ['router', 'swB'], ['swA', 'laptop'], ['swA', 'camera'], ['swB', 'phone'], ['swB', 'ap']];
const curve = (a, b) => {
  const A = NET_NODES[a]; const B = NET_NODES[b]; const m = (A.y + B.y) / 2;
  return `M ${A.x} ${A.y} C ${A.x} ${m}, ${B.x} ${m}, ${B.x} ${B.y}`;
};
const NET_PACKETS = [[0, 2.4, 0, false], [0, 2.4, 1.2, true], [1, 1.8, 0.4, false], [2, 1.8, 1, false], [3, 1.5, 0.8, false], [4, 1.5, 1.6, true], [5, 1.5, 0.2, false], [6, 1.5, 1.4, true]];

const InfraArt = ({ on }) => {
  const id = useSvgId();
  const N = 38;
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <defs>
        <radialGradient id={`${id}h`}>
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="82" r="56" fill={`url(#${id}h)`} />
      {NET_LINKS.map(([a, b], i) => (
        <path key={i} id={`${id}l${i}`} d={curve(a, b)} fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="3 4" />
      ))}
      {on && NET_PACKETS.map(([l, d, b, rev], i) => (
        <circle key={i} r="3.4" fill={i === 5 ? C.red : C.sky}>
          <animateMotion dur={`${d}s`} begin={`${b}s`} repeatCount="indefinite" keyPoints={rev ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear">
            <mpath href={`#${id}l${l}`} />
          </animateMotion>
        </circle>
      ))}
      {Object.entries(NET_NODES).map(([k, { x, y, Icon, main }]) => (
        <g key={k}>
          <rect x={x - N / 2} y={y - N / 2} width={N} height={N} rx="11"
            fill={main ? C.deep : C.panel2} stroke={main ? C.blue : C.edge} strokeWidth="1.2" />
          <Icon x={x - 10} y={y - 10} width={20} height={20} strokeWidth={1.8} color={main ? '#ffffff' : C.text} />
        </g>
      ))}
      <circle cx="215" cy="67" r="3" fill={C.green}>
        <Anim on={on} attributeName="opacity" dur="1.1s" values="1;0.25;1" keyTimes="0;0.5;1" />
      </circle>
    </svg>
  );
};

// ── 6. IP PBX — a call rings, routes through the exchange, and connects ───────
const VoipArt = ({ on }) => {
  const id = useSvgId();
  const DUR = '6s';
  const ext = [
    { x: 58, y: 96, Icon: PhoneCall },
    { x: 342, y: 96, Icon: Phone },
    { x: 118, y: 184, Icon: Phone },
    { x: 282, y: 184, Icon: Phone },
  ];
  const link = (e) => `M ${e.x} ${e.y} C ${(e.x + 200) / 2} ${e.y}, ${(e.x + 200) / 2} 110, 200 110`;
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {ext.map((e, i) => (
        <path key={i} id={`${id}v${i}`} d={link(e)} fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="3 4" />
      ))}
      {/* Established call: caller → exchange → callee glows once connected */}
      {[0, 1].map(i => (
        <path key={`on${i}`} d={link(ext[i])} fill="none" stroke={C.blue} strokeWidth="2.5" opacity={on ? 0 : 0.9}>
          <Anim on={on} attributeName="opacity" dur={DUR} values="0;0;0.9;0.9;0" keyTimes="0;0.66;0.72;0.92;1" />
        </path>
      ))}
      {/* Signalling: caller → exchange, then exchange → callee */}
      {on && (
        <>
          <circle r="4" fill={C.sky}>
            <animateMotion dur={DUR} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.18;0.36;1" calcMode="linear">
              <mpath href={`#${id}v0`} />
            </animateMotion>
            <animate attributeName="opacity" dur={DUR} repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.18;0.36;0.37;1" />
          </circle>
          <circle r="4" fill={C.sky}>
            <animateMotion dur={DUR} repeatCount="indefinite" keyPoints="1;1;0;0" keyTimes="0;0.38;0.56;1" calcMode="linear">
              <mpath href={`#${id}v1`} />
            </animateMotion>
            <animate attributeName="opacity" dur={DUR} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.38;0.39;0.56;0.57;1" />
          </circle>
        </>
      )}
      {/* Ring waves: caller first, callee after the exchange routes it */}
      {[[0, 0.02], [1, 0.56]].flatMap(([i, t]) => [0, 0.08].map(off => {
        const a = +(t + off).toFixed(2);
        const b = +(a + 0.1).toFixed(2);
        return (
          <circle key={`${i}-${off}`} cx={ext[i].x} cy={ext[i].y} r="20" fill="none" stroke={C.blue} strokeWidth="1.5" opacity="0">
            <Anim on={on} attributeName="r" dur={DUR} values="20;20;36;36" keyTimes={`0;${a};${b};1`} />
            <Anim on={on} attributeName="opacity" dur={DUR} values="0;0.8;0;0" keyTimes={`0;${a};${b};1`} />
          </circle>
        );
      }))}
      {ext.map((e, i) => (
        <g key={`e${i}`}>
          <circle cx={e.x} cy={e.y} r="20" fill={C.panel2} stroke={i < 2 ? C.blue : C.edge} strokeOpacity={i < 2 ? 0.7 : 1} strokeWidth="1.2" />
          <e.Icon x={e.x - 9} y={e.y - 9} width={18} height={18} strokeWidth={1.8} color={C.text} />
        </g>
      ))}
      {/* The exchange */}
      <rect x="160" y="82" width="80" height="56" rx="10" fill={C.deep} stroke={C.blue} strokeWidth="1.5" />
      <Server x="190" y="90" width="20" height="20" strokeWidth={1.8} color="#ffffff" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={i} cx={172 + i * 11} cy="126" r="2.6" fill={i === 0 || i === 1 ? C.green : '#ffffff'} opacity={i < 2 ? 1 : 0.35}>
          {i < 2 && <Anim on={on} attributeName="opacity" dur="0.9s" begin={`${i * 0.3}s`} values="1;0.3;1" keyTimes="0;0.5;1" />}
        </circle>
      ))}
    </svg>
  );
};

// ── 7. CCTV — a camera pans its field of view and tracks a subject ────────────
const CctvArt = ({ on }) => {
  const id = useSvgId();
  const DUR = '7s';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.45" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <line x1="20" y1="196" x2="380" y2="196" stroke={C.line} />
      {[60, 110, 160, 210, 260, 310, 360].map(x => <line key={x} x1={x} y1="196" x2={x - 10} y2="206" stroke={C.edge} />)}

      {/* Subject walking across */}
      <g transform={on ? undefined : 'translate(292 0)'}>
        <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={DUR} calcMode="spline"
          values="200 0;336 0;200 0" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <circle cx="0" cy="146" r="8" fill={C.text} opacity="0.85" />
        <rect x="-9" y="157" width="18" height="36" rx="8" fill={C.text} opacity="0.7" />
        {/* Tracking box */}
        <g>
          <Anim on={on} attributeName="opacity" dur="1.2s" values="1;0.35;1" keyTimes="0;0.5;1" />
          <path d="M-20 132 h8 M-20 132 v8 M20 132 h-8 M20 132 v8 M-20 198 h8 M-20 198 v-8 M20 198 h-8 M20 198 v-8"
            stroke={C.red} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* Wall mount + camera, panning together with its cone */}
      <rect x="30" y="18" width="12" height="40" rx="3" fill={C.panel2} stroke={C.edge} />
      <g transform={on ? undefined : 'rotate(14 50 42)'}>
        <Anim on={on} tag="animateTransform" attributeName="transform" type="rotate" dur={DUR} calcMode="spline"
          values="6 50 42;22 50 42;6 50 42" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <polygon points="120,42 400,110 400,236" fill={`url(#${id}f)`} />
        <rect x="42" y="36" width="10" height="12" rx="2" fill={C.panel2} />
        <rect x="52" y="30" width="62" height="24" rx="7" fill={C.panel2} stroke={C.edge} />
        <circle cx="114" cy="42" r="10" fill={C.deep} stroke={C.blue} strokeWidth="1.5" />
        <circle cx="114" cy="42" r="4" fill="#0b1220" />
        <circle cx="111.5" cy="39.5" r="1.6" fill="#ffffff" opacity="0.8" />
      </g>

      {/* REC */}
      <rect x="300" y="18" width="78" height="24" rx="12" fill={C.panel2} stroke={C.edge} />
      <circle cx="316" cy="30" r="5" fill={C.red}>
        <Anim on={on} attributeName="opacity" dur="1.2s" values="1;0.2;1" keyTimes="0;0.5;1" />
      </circle>
      <rect x="328" y="27" width="38" height="6" rx="3" fill={C.text} opacity="0.7" />
    </svg>
  );
};

// ── 8. Social media management — a post lands and gets liked, the feed moves
//       on, while the content calendar fills and reach climbs ──────────────────
const HEART = 'M0 4.5 C-1 3.6 -6 0.4 -6 -2.2 A3 3 0 0 1 0 -3 A3 3 0 0 1 6 -2.2 C6 0.4 1 3.6 0 4.5 Z';
const CAL_ON = [[1, 0.12], [3, 0.24], [6, 0.36], [8, 0.48], [9, 0.6]]; // [cell, when it gets booked]
const REACH = 'M218 178 L246 166 L274 170 L302 148 L330 140 L360 116';

const SocialArt = ({ on }) => {
  const id = useSvgId();
  const DUR = '6s';
  const post = (y, accent) => (
    <g>
      <circle cx="80" cy={y + 6} r="5" fill={accent} />
      <rect x="90" y={y + 3} width="40" height="5" rx="2.5" fill={C.text} opacity="0.6" />
      <rect x="72" y={y + 16} width="96" height="58" rx="6" fill={C.deep} opacity="0.55" />
      <circle cx="148" cy={y + 30} r="6" fill={C.sky} opacity="0.8" />
      <path d={`M78 ${y + 68} l22 -20 l14 12 l12 -10 l34 18 Z`} fill={C.blue} opacity="0.75" />
      <path d={HEART} transform={`translate(80 ${y + 86})`} fill="none" stroke={C.dim} strokeWidth="1.3" />
      <circle cx="98" cy={y + 86} r="4.5" fill="none" stroke={C.dim} strokeWidth="1.3" />
      <path d={`M110 ${y + 86} l8 -4 v8 Z`} fill={C.dim} />
      <rect x="72" y={y + 96} width="62" height="4" rx="2" fill={C.dim} />
    </g>
  );
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-screen`}><rect x="68" y="30" width="104" height="168" rx="8" /></clipPath>
      </defs>

      {/* Phone */}
      <rect x="60" y="14" width="120" height="196" rx="18" fill={C.panel} stroke={C.edge} />
      <rect x="104" y="20" width="32" height="5" rx="2.5" fill={C.panel2} />

      {/* The feed: first post, then it scrolls to the next one */}
      <g clipPath={`url(#${id}-screen)`}>
        <rect x="68" y="30" width="104" height="168" fill={C.panel2} />
        <g>
          <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={DUR} calcMode="spline"
            values="0 0;0 0;0 -108;0 -108;0 0" keyTimes="0;0.5;0.62;0.94;1"
            keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1;0.4 0 0.2 1" />
          {post(38, C.blue)}
          {post(146, C.sky)}

          {/* The like: the heart fills red, and a few hearts float up */}
          <path d={HEART} transform="translate(80 124)" fill={C.red} opacity={on ? 0 : 1}>
            <Anim on={on} attributeName="opacity" dur={DUR} calcMode="discrete" values="0;1;0" keyTimes="0;0.22;0.96" />
          </path>
          {[[-2, 0.24], [5, 0.3], [-6, 0.36]].map(([dx, t]) => (
            <path key={t} d={HEART} transform={`translate(${80 + dx} 116) scale(0.6)`} fill={C.red} opacity="0">
              <Anim on={on} attributeName="opacity" dur={DUR} values="0;0;0.9;0;0" keyTimes={`0;${t};${+(t + 0.04).toFixed(2)};${+(t + 0.16).toFixed(2)};1`} />
              <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" additive="sum" dur={DUR}
                values="0 0;0 0;0 -26;0 -26" keyTimes={`0;${t};${+(t + 0.16).toFixed(2)};1`} />
            </path>
          ))}
          {/* Likes counter grows */}
          <rect x="72" y="134" height="4" rx="2" width={on ? 20 : 62} fill={C.red} opacity="0.85">
            <Anim on={on} attributeName="width" dur={DUR} calcMode="spline"
              values="20;20;62;62;20" keyTimes="0;0.22;0.4;0.96;1" keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1;0 0 1 1" />
          </rect>
        </g>
      </g>

      {/* Content calendar + reach */}
      <rect x="204" y="26" width="172" height="172" rx="10" fill={C.panel} stroke={C.edge} />
      <rect x="216" y="36" width="56" height="6" rx="3" fill={C.text} opacity="0.7" />
      <circle cx="362" cy="39" r="3.5" fill={C.green} />
      {Array.from({ length: 10 }, (_, i) => {
        const x = 216 + (i % 5) * 31; const y = 52 + Math.floor(i / 5) * 24;
        const booked = CAL_ON.find(([c]) => c === i);
        return (
          <g key={i}>
            <rect x={x} y={y} width="26" height="19" rx="4" fill={C.panel2} stroke={C.edge} />
            {booked && (
              <rect x={x + 3} y={y + 3} width="20" height="13" rx="3" fill={i === 6 ? C.sky : C.blue} opacity={on ? 0 : 0.9}>
                <Anim on={on} attributeName="opacity" dur={DUR} calcMode="discrete" values="0;0.9;0" keyTimes={`0;${booked[1]};0.96`} />
              </rect>
            )}
          </g>
        );
      })}
      {[124, 150, 176].map(y => <line key={y} x1="216" y1={y} x2="364" y2={y} stroke={C.edge} />)}
      <path d={REACH} fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        pathLength="1" strokeDasharray="1" strokeDashoffset={on ? 1 : 0}>
        <Anim on={on} attributeName="stroke-dashoffset" dur={DUR} calcMode="spline"
          values="1;1;0;0;1" keyTimes="0;0.3;0.75;0.96;1" keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1;0 0 1 1" />
      </path>
      <circle cx="360" cy="116" r="4" fill={C.green} opacity={on ? 0 : 1}>
        <Anim on={on} attributeName="opacity" dur={DUR} calcMode="discrete" values="0;1;0" keyTimes="0;0.75;0.96" />
      </circle>
    </svg>
  );
};

// ── 9. Posters & motion graphics — an artboard animating to its timeline ─────
// The playhead, the sliders and the shapes share one clock, so the keyframes
// on the timeline line up with the moments the poster actually changes.
const TL_X0 = 60; const TL_W = 300;
const atT = (t) => +(TL_X0 + t * TL_W).toFixed(1);
const TRACKS = [
  { y: 170, keys: [0.1, 0.45], color: C.text },  // title
  { y: 184, keys: [0.2, 0.6],  color: C.blue },  // position
  { y: 198, keys: [0.35, 0.75], color: C.sky },  // scale
];
const diamond = (x, y) => `M${x} ${y - 4} l4 4 l-4 4 l-4 -4 Z`;

const MotionArt = ({ on }) => {
  const id = useSvgId();
  const DUR = '6s';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <defs>
        <clipPath id={`${id}-board`}><rect x="36" y="12" width="206" height="128" rx="8" /></clipPath>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.deep} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.panel2} />
        </linearGradient>
      </defs>

      {/* Artboard: the poster being animated */}
      <rect x="36" y="12" width="206" height="128" rx="8" fill={`url(#${id}-bg)`} stroke={C.edge} />
      <g clipPath={`url(#${id}-board)`}>
        <circle cx={on ? 84 : 190} cy="60" r={on ? 14 : 24} fill={C.blue} opacity="0.9">
          <Anim on={on} attributeName="cx" dur={DUR} calcMode="spline" values="84;84;190;190" keyTimes="0;0.2;0.6;1"
            keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1" />
          <Anim on={on} attributeName="r" dur={DUR} calcMode="spline" values="14;14;24;24" keyTimes="0;0.35;0.75;1"
            keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1" />
        </circle>
        <rect x="196" y="22" width="14" height="14" rx="2" fill={C.red} opacity="0.85">
          <Anim on={on} tag="animateTransform" attributeName="transform" type="rotate" dur="4s"
            values="0 203 29;360 203 29" keyTimes="0;1" />
        </rect>
        <rect x="52" y="100" height="10" rx="3" width={on ? 0 : 110} fill={C.text} opacity="0.85">
          <Anim on={on} attributeName="width" dur={DUR} calcMode="spline" values="0;0;110;110" keyTimes="0;0.1;0.45;1"
            keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1" />
        </rect>
        <rect x="52" y="116" width="70" height="6" rx="3" fill={C.dim} />
      </g>

      {/* Properties: sliders that move with the shapes */}
      <rect x="252" y="12" width="124" height="128" rx="8" fill={C.panel} stroke={C.edge} />
      {[['P', 40], ['S', 74], ['O', 108]].map(([, y]) => (
        <g key={y}>
          <rect x="264" y={y - 12} width="34" height="5" rx="2.5" fill={C.dim} />
          <rect x="264" y={y} width="100" height="4" rx="2" fill={C.panel2} />
        </g>
      ))}
      <circle cy="42" r="5" cx={on ? 272 : 352} fill={C.blue}>
        <Anim on={on} attributeName="cx" dur={DUR} calcMode="spline" values="272;272;352;352" keyTimes="0;0.2;0.6;1"
          keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1" />
      </circle>
      <circle cy="76" r="5" cx={on ? 290 : 344} fill={C.sky}>
        <Anim on={on} attributeName="cx" dur={DUR} calcMode="spline" values="290;290;344;344" keyTimes="0;0.35;0.75;1"
          keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1" />
      </circle>
      <circle cy="110" r="5" cx="336" fill={C.text} />

      {/* Timeline */}
      <rect x="36" y="150" width="340" height="62" rx="8" fill={C.panel} stroke={C.edge} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={atT(i / 10)} y1="155" x2={atT(i / 10)} y2={i % 5 ? 158 : 161} stroke={C.line} />
      ))}
      {TRACKS.map(({ y, keys, color }) => (
        <g key={y}>
          <circle cx="47" cy={y} r="3" fill={color} />
          <rect x={TL_X0} y={y - 3} width={TL_W} height="6" rx="3" fill={C.panel2} />
          <rect x={atT(keys[0])} y={y - 3} width={atT(keys[1]) - atT(keys[0])} height="6" rx="3" fill={color} opacity="0.35" />
          {keys.map(k => <path key={k} d={diamond(atT(k), y)} fill={color} />)}
        </g>
      ))}

      {/* Playhead */}
      <g transform={on ? undefined : `translate(${atT(0.85) - TL_X0} 0)`}>
        <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={DUR}
          values={`0 0;${TL_W} 0`} keyTimes="0;1" />
        <path d={`M${TL_X0 - 4} 153 h8 v4 l-4 4 l-4 -4 Z`} fill={C.red} />
        <line x1={TL_X0} y1="160" x2={TL_X0} y2="207" stroke={C.red} strokeWidth="1.5" />
      </g>
    </svg>
  );
};

// ── Fallback — any future service the matcher does not recognise ──────────────
const GenericArt = ({ on, icon }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <svg viewBox={VB} aria-hidden="true" className="absolute inset-0 w-full h-full">
      {[34, 52, 70].map((r, i) => (
        <circle key={r} cx="200" cy="110" r={r} fill="none" stroke={i === 1 ? C.blue : C.line} strokeDasharray={i === 1 ? '6 8' : '2 6'} strokeWidth="1.5">
          <Anim on={on} tag="animateTransform" attributeName="transform" type="rotate" dur={`${14 + i * 6}s`}
            values={i % 2 ? '360 200 110;0 200 110' : '0 200 110;360 200 110'} keyTimes="0;1" />
        </circle>
      ))}
      <circle cx="200" cy="110" r="26" fill={C.deep} stroke={C.blue} />
    </svg>
    <span className="relative text-white"><DynamicIcon emoji={icon} size={26} /></span>
  </div>
);


const ARTS = { web: WebArt, mobile: MobileArt, security: SecurityArt, design: DesignArt, infra: InfraArt, voip: VoipArt, cctv: CctvArt, social: SocialArt, motion: MotionArt };

const ServiceArt = ({ service, className = '' }) => {
  const Art = ARTS[artKindFor(service)];
  return (
    <ArtStage className={className}>
      {(on) => (Art ? <Art on={on} /> : <GenericArt on={on} icon={service.icon} />)}
    </ArtStage>
  );
};

export default ServiceArt;
