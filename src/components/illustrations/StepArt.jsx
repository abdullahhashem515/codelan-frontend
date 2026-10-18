import { useEffect, useRef } from 'react';
import { User, Headphones, Cloud, Server } from 'lucide-react';
import Anim from './Anim';
import { C, VB } from './artKit';

// One scene per methodology step, in the same palette and canvas as the service
// drawings. Unlike those ambient loops, these tell a short story — a
// conversation, a plan being drawn, a build, a release — so each one restarts
// from its first frame when its step comes on stage (see StepArt below).

// A group that fades and rises in at `at` (fraction of the cycle), holds, then
// clears before the loop restarts.
const Appear = ({ on, at, dur, dy = 8, children }) => {
  const a = +at.toFixed(3);
  const b = +(at + 0.04).toFixed(3);
  const kt = `0;${a};${b};0.88;0.94;1`;
  return (
    <g opacity={on ? 0 : 1}>
      <Anim on={on} attributeName="opacity" dur={dur} values="0;0;1;1;0;0" keyTimes={kt} />
      <Anim on={on} tag="animateTransform" attributeName="transform" type="translate" dur={dur}
        values={`0 ${dy};0 ${dy};0 0;0 0;0 0;0 ${dy}`} keyTimes={kt} />
      {children}
    </g>
  );
};

// A stroke that draws itself between `at` and `at + len`.
const Draw = ({ on, d, at, len = 0.1, dur, stroke = C.blue, width = 1.6, dash }) => {
  const a = +at.toFixed(3);
  const b = +(at + len).toFixed(3);
  return (
    <path d={d} pathLength="1" fill="none" stroke={stroke} strokeWidth={width}
      strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={dash ?? '1'} strokeDashoffset={on ? 1 : 0}>
      <Anim on={on} attributeName="stroke-dashoffset" dur={dur}
        values="1;1;0;0;1;1" keyTimes={`0;${a};${b};0.88;0.94;1`} />
    </path>
  );
};

const box = (x, y, w, h) => `M${x} ${y} h${w} v${h} h${-w} Z`;

// Text stand-in: a rounded bar.
const Bar = ({ x, y, w, h = 5, fill = C.text, o = 0.7 }) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={o} />
);

// ── 1. Consultation — a conversation that ends in agreed requirements ────────
const ConsultArt = ({ on }) => {
  const D = '7s';
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {/* Client */}
      <circle cx="46" cy="50" r="18" fill={C.panel2} stroke={C.edge} />
      <User x="36" y="40" width="20" height="20" strokeWidth={1.8} color={C.text} />
      {/* Team */}
      <circle cx="354" cy="94" r="18" fill={C.deep} stroke={C.blue} />
      <Headphones x="344" y="84" width="20" height="20" strokeWidth={1.8} color="#ffffff" />

      <Appear on={on} at={0.04} dur={D}>
        <rect x="74" y="34" width="160" height="32" rx="12" fill={C.panel2} stroke={C.edge} />
        <Bar x={88} y={44} w={120} /><Bar x={88} y={54} w={80} fill={C.dim} o={1} h={4} />
      </Appear>
      <Appear on={on} at={0.2} dur={D}>
        <rect x="170" y="78" width="160" height="32" rx="12" fill={C.deep} />
        <Bar x={184} y={88} w={112} fill="#ffffff" o={0.85} /><Bar x={184} y={98} w={70} fill="#ffffff" o={0.45} h={4} />
      </Appear>

      {/* Client typing, then the reply lands */}
      <g opacity="0">
        <Anim on={on} attributeName="opacity" dur={D} values="0;0;1;1;0;0" keyTimes="0;0.36;0.38;0.46;0.48;1" />
        <rect x="74" y="122" width="54" height="26" rx="12" fill={C.panel2} stroke={C.edge} />
        {[90, 101, 112].map((x, i) => (
          <circle key={x} cx={x} cy="135" r="3" fill={C.sky}>
            <Anim on={on} attributeName="opacity" dur="0.9s" begin={`${i * 0.15}s`} values="0.3;1;0.3" keyTimes="0;0.5;1" />
          </circle>
        ))}
      </g>
      <Appear on={on} at={0.48} dur={D}>
        <rect x="74" y="122" width="130" height="26" rx="12" fill={C.panel2} stroke={C.edge} />
        <Bar x={88} y={132} w={96} />
      </Appear>

      {/* Agreed requirements */}
      {[62, 152, 242].map((x, i) => (
        <Appear key={x} on={on} at={0.62 + i * 0.06} dur={D} dy={6}>
          <rect x={x} y="170" width="84" height="26" rx="13" fill="rgba(26,127,255,0.12)" stroke={C.blue} strokeOpacity="0.6" />
          <path d={`M${x + 14} 183 l4 4 7-8`} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Bar x={x + 32} y={180} w={40} h={5} />
        </Appear>
      ))}
    </svg>
  );
};

// ── 2. Planning & design — a sitemap and a wireframe drawn like a blueprint ──
const PlanArt = ({ on }) => {
  const D = '7s';
  const kids = [55, 165, 275];
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {/* Fills fade in once the outlines are drawn */}
      <g opacity={on ? 0 : 1}>
        <Anim on={on} attributeName="opacity" dur={D} values="0;0;1;1;0;0" keyTimes="0;0.58;0.64;0.88;0.94;1" />
        <rect x="170" y="18" width="60" height="26" rx="4" fill={C.deep} />
        {kids.map(x => <rect key={x} x={x} y="84" width="70" height="26" rx="4" fill="rgba(26,127,255,0.14)" />)}
        {[30, 90, 280, 340].map(x => <rect key={x} x={x} y="140" width="36" height="20" rx="3" fill="rgba(96,165,250,0.12)" />)}
        <rect x="150" y="134" width="100" height="70" rx="4" fill="rgba(96,165,250,0.08)" />
        <Bar x={160} y={146} w={50} fill={C.sky} o={0.8} />
        <Bar x={160} y={156} w={34} fill={C.dim} o={1} h={4} />
        <rect x="160" y="168" width="36" height="12" rx="6" fill={C.blue} />
        <rect x="206" y="146" width="34" height="34" rx="3" fill={C.panel2} />
        <Bar x={160} y={190} w={80} fill={C.dim} o={1} h={4} />
      </g>

      <Draw on={on} dur={D} at={0.04} d={box(170, 18, 60, 26)} />
      <Draw on={on} dur={D} at={0.14} len={0.08} stroke={C.line} d="M200 44 V64 M90 64 H310 M90 64 V84 M200 64 V84 M310 64 V84" />
      {kids.map((x, i) => <Draw key={x} on={on} dur={D} at={0.22 + i * 0.04} d={box(x, 84, 70, 26)} />)}
      <Draw on={on} dur={D} at={0.36} len={0.06} stroke={C.line} d="M90 110 V126 M48 126 H108 M48 126 V140 M108 126 V140 M310 110 V126 M298 126 H358 M298 126 V140 M358 126 V140" />
      {[30, 90, 280, 340].map((x, i) => <Draw key={x} on={on} dur={D} at={0.42 + i * 0.02} len={0.07} stroke={C.sky} d={box(x, 140, 36, 20)} />)}
      <Draw on={on} dur={D} at={0.36} len={0.06} stroke={C.line} d="M200 110 V134" />
      <Draw on={on} dur={D} at={0.42} len={0.14} stroke={C.sky} d={box(150, 134, 100, 70)} />

      {/* Dimension marker on the root node */}
      <Appear on={on} at={0.66} dur={D} dy={0}>
        <path d="M170 10 H230 M170 7 V13 M230 7 V13" stroke={C.red} strokeWidth="1.2" />
      </Appear>
    </svg>
  );
};

// ── 3. Development — code on the left builds the interface on the right ──────
const BuildArt = ({ on }) => {
  const D = '7s';
  const lines = [[0, 60, C.blue], [1, 84, C.sky], [1, 56, C.text], [2, 96, C.sky], [2, 70, C.green], [1, 40, C.text], [0, 22, C.dim]];
  // Each preview block appears when the line that "writes" it has been typed.
  const at = (i) => +(0.06 + i * 0.07).toFixed(2);
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      {/* Editor */}
      <rect x="16" y="14" width="176" height="164" rx="10" fill={C.panel} stroke={C.edge} />
      <rect x="16" y="14" width="176" height="20" rx="10" fill={C.panel2} />
      <rect x="16" y="26" width="176" height="8" fill={C.panel2} />
      {lines.map(([ind, w, col], i) => {
        const a = at(i);
        return (
          <rect key={i} x={30 + ind * 12} y={46 + i * 17} width={w} height="7" rx="3.5" fill={col} opacity="0.9">
            <Anim on={on} attributeName="width" dur={D} values={`0;0;${w};${w};0;0`} keyTimes={`0;${a};${+(a + 0.05).toFixed(2)};0.86;0.93;1`} />
          </rect>
        );
      })}

      {/* Live preview */}
      <rect x="208" y="14" width="176" height="164" rx="10" fill={C.panel} stroke={C.edge} />
      <rect x="208" y="14" width="176" height="20" rx="10" fill={C.panel2} />
      <rect x="208" y="26" width="176" height="8" fill={C.panel2} />
      {[222, 232, 242].map(x => <circle key={x} cx={x} cy="24" r="2.5" fill={C.dim} />)}
      <Appear on={on} at={at(1)} dur={D} dy={4}>
        <rect x="218" y="42" width="156" height="12" rx="3" fill={C.panel2} />
        <circle cx="226" cy="48" r="3" fill={C.blue} />
      </Appear>
      <Appear on={on} at={at(2)} dur={D} dy={4}>
        <Bar x={218} y={64} w={100} h={7} fill={C.text} o={0.8} />
        <Bar x={218} y={76} w={70} h={5} fill={C.dim} o={1} />
      </Appear>
      <Appear on={on} at={at(3)} dur={D} dy={4}>
        <rect x="218" y="90" width="52" height="16" rx="8" fill={C.blue} />
      </Appear>
      {[218, 272, 326].map((x, i) => (
        <Appear key={x} on={on} at={at(4) + i * 0.03} dur={D} dy={6}>
          <rect x={x} y="118" width="48" height="48" rx="6" fill={C.panel2} stroke={C.edge} />
          <rect x={x + 8} y="126" width="32" height="18" rx="3" fill={i === 1 ? C.deep : 'rgba(96,165,250,0.18)'} />
          <Bar x={x + 8} y={150} w={24} h={4} fill={C.dim} o={1} />
        </Appear>
      ))}

      {/* Sprints */}
      {[0, 1, 2, 3].map(i => {
        const x = 16 + i * 94;
        const a = +(0.08 + i * 0.18).toFixed(2);
        return (
          <g key={i}>
            <rect x={x} y="192" width="86" height="8" rx="4" fill={C.panel2} />
            <rect x={x} y="192" width="86" height="8" rx="4" fill={i === 3 ? C.green : C.blue}>
              <Anim on={on} attributeName="width" dur={D} values="0;0;86;86;0;0" keyTimes={`0;${a};${+(a + 0.16).toFixed(2)};0.86;0.93;1`} />
            </rect>
          </g>
        );
      })}
    </svg>
  );
};

// ── 4. Testing & delivery — checks pass one by one, then the release goes live
const ShipArt = ({ on }) => {
  const D = '8s';
  const rows = [48, 88, 128, 168];
  const done = [0.14, 0.28, 0.42, 0.56];
  return (
    <svg viewBox={VB} aria-hidden="true" className="w-full h-full">
      <rect x="16" y="20" width="206" height="180" rx="12" fill={C.panel} stroke={C.edge} />
      {rows.map((y, i) => {
        const t = done[i];
        const kt = `0;${t};${+(t + 0.01).toFixed(2)};0.94;1`;
        return (
          <g key={y}>
            {/* Pending spinner */}
            <g opacity={on ? 1 : 0}>
              <Anim on={on} attributeName="opacity" dur={D} values="1;1;0;0;1" keyTimes={kt} />
              <circle cx="44" cy={y} r="9" fill="none" stroke={C.dim} strokeWidth="2" />
              <path d={`M44 ${y - 9} a9 9 0 0 1 9 9`} fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round">
                <Anim on={on} tag="animateTransform" attributeName="transform" type="rotate" dur="0.9s"
                  values={`0 44 ${y};360 44 ${y}`} keyTimes="0;1" />
              </path>
            </g>
            {/* Passed */}
            <g opacity={on ? 0 : 1}>
              <Anim on={on} attributeName="opacity" dur={D} values="0;0;1;1;0" keyTimes={kt} />
              <circle cx="44" cy={y} r="10" fill={C.green} />
              <path d={`M39 ${y} l3.5 3.5 6.5-7`} fill="none" stroke="#0b1220" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <Bar x={66} y={y - 6} w={[110, 90, 120, 80][i]} h={6} />
            <Bar x={66} y={y + 4} w={[60, 74, 50, 66][i]} h={4} fill={C.dim} o={1} />
          </g>
        );
      })}

      {/* Release: server → cloud */}
      <line x1="310" y1="72" x2="310" y2="150" stroke={C.line} strokeDasharray="3 4" />
      <rect x="288" y="150" width="44" height="40" rx="10" fill={C.panel2} stroke={C.edge} />
      <Server x="300" y="160" width="20" height="20" strokeWidth={1.8} color={C.text} />
      <rect x="284" y="30" width="52" height="42" rx="12" fill={C.panel2} stroke={on ? C.edge : C.green}>
        <Anim on={on} attributeName="stroke" dur={D} calcMode="discrete" values={`${C.edge};${C.green};${C.edge}`} keyTimes="0;0.8;0.94" />
      </rect>
      <Cloud x="298" y="39" width="24" height="24" strokeWidth={1.8} color={C.sky} />
      <circle cx="310" cy="150" r="5" fill={C.sky} opacity="0">
        <Anim on={on} attributeName="cy" dur={D} values="150;150;72;72" keyTimes="0;0.62;0.78;1" />
        <Anim on={on} attributeName="opacity" dur={D} values="0;0;1;1;0;0" keyTimes="0;0.62;0.63;0.77;0.78;1" />
      </circle>

      {/* LIVE */}
      <Appear on={on} at={0.8} dur={D} dy={4}>
        <rect x="262" y="96" width="96" height="28" rx="14" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.55)" />
        <circle cx="280" cy="110" r="5" fill={C.green} />
        <Bar x={292} y={107} w={52} h={6} fill={C.green} o={0.9} />
      </Appear>
    </svg>
  );
};

const ARTS = { consult: ConsultArt, plan: PlanArt, build: BuildArt, ship: ShipArt };
const ORDER = ['consult', 'plan', 'build', 'ship'];

// Picks the scene from the step's title, falling back to its position — the
// admin can reword a step without it losing its drawing.
const KINDS = [
  ['consult', /تواصل|فهم|استشار|تحليل|consult|requirement|discover|analys/i],
  ['plan',    /تخطيط|تصميم|plan|design|architect/i],
  ['build',   /تطوير|برمجة|تنفيذ|develop|build|code|implement/i],
  ['ship',    /اختبار|تسليم|إطلاق|دعم|test|deliver|launch|qa|support/i],
];

const stepKind = (step, index) => {
  const text = `${step.title ?? ''} ${step.titleEn ?? ''}`;
  const hit = KINDS.find(([, re]) => re.test(text));
  return hit ? hit[0] : ORDER[index % ORDER.length];
};

// Each inline <svg> keeps its own animation clock. These scenes are stories,
// so the clock is rewound whenever the scene starts playing — otherwise one
// that mounted mid-cycle would open halfway through its own plot.
const StepArt = ({ step, index, on }) => {
  const ref = useRef(null);
  const Art = ARTS[stepKind(step, index)];

  useEffect(() => {
    if (!on) return;
    const svg = ref.current?.querySelector('svg');
    if (svg && typeof svg.setCurrentTime === 'function') svg.setCurrentTime(0);
  }, [on, index]);

  return (
    <div ref={ref} className="absolute inset-0">
      <Art on={on} />
    </div>
  );
};

export default StepArt;
