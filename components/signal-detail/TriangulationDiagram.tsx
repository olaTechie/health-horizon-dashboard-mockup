import type { SourceCitation, SourceType } from '@/lib/types';

const ALL_TYPES: SourceType[] = [
  'peer-reviewed',
  'who-alert',
  'regulatory',
  'industry',
  'environmental',
  'social',
];

const TYPE_LABEL: Record<SourceType, string> = {
  'peer-reviewed': 'Peer-Reviewed',
  'who-alert': 'WHO Alert',
  'regulatory': 'Regulatory',
  'industry': 'Industry',
  'environmental': 'Environmental',
  'social': 'Social / Media',
};

const TYPE_COLOR: Record<SourceType, string> = {
  'peer-reviewed': '#3A6EA5',
  'who-alert': '#C9821B',
  'regulatory': '#5E5A8A',
  'industry': '#5B8466',
  'environmental': '#4A7A6A',
  'social': '#A85C3E',
};

const W = 360;
const H = 200;
const CX = 180;
const CY = 100;
const R_ORBIT = 78;
const R_CENTER = 18;
const R_SAT = 13;

function satCoords(idx: number): [number, number] {
  const angle = (idx / ALL_TYPES.length) * 2 * Math.PI - Math.PI / 2;
  return [
    CX + R_ORBIT * Math.cos(angle),
    CY + R_ORBIT * Math.sin(angle),
  ];
}

export function TriangulationDiagram({ sources }: { sources: SourceCitation[] }) {
  const present = new Set(sources.map((s) => s.type));
  const count = present.size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--ink-secondary)]">
          Triangulation Map
        </h4>
        <span className="text-xs font-mono text-[var(--ink-secondary)]">
          {count} / {ALL_TYPES.length} source types
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="w-full max-w-[360px]"
        aria-label="Triangulation diagram showing signal source types"
      >
        {/* connection lines — only for present sources */}
        {ALL_TYPES.map((type, idx) => {
          if (!present.has(type)) return null;
          const [sx, sy] = satCoords(idx);
          return (
            <line
              key={`line-${type}`}
              x1={CX}
              y1={CY}
              x2={sx}
              y2={sy}
              stroke={TYPE_COLOR[type]}
              strokeWidth={1.5}
              strokeOpacity={0.55}
            />
          );
        })}

        {/* center "Signal" node */}
        <circle cx={CX} cy={CY} r={R_CENTER} fill="var(--ink)" fillOpacity={0.9} />
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8}
          fontFamily="var(--font-mono)"
          fill="var(--surface)"
          fontWeight="600"
          letterSpacing="0.05em"
        >
          SIGNAL
        </text>

        {/* satellite nodes */}
        {ALL_TYPES.map((type, idx) => {
          const [sx, sy] = satCoords(idx);
          const active = present.has(type);
          const color = TYPE_COLOR[type];
          const label = TYPE_LABEL[type];

          // label offset — push text away from center
          const angle = (idx / ALL_TYPES.length) * 2 * Math.PI - Math.PI / 2;
          const labelR = R_ORBIT + R_SAT + 10;
          const lx = CX + labelR * Math.cos(angle);
          const ly = CY + labelR * Math.sin(angle);
          const anchor = lx < CX - 10 ? 'end' : lx > CX + 10 ? 'start' : 'middle';

          return (
            <g key={type}>
              <circle
                cx={sx}
                cy={sy}
                r={R_SAT}
                fill={active ? color : 'var(--panel)'}
                fillOpacity={active ? 0.9 : 1}
                stroke={color}
                strokeWidth={active ? 0 : 1}
                strokeOpacity={0.3}
              />
              {active && (
                <circle cx={sx} cy={sy} r={R_SAT + 3} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.35} />
              )}
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={7}
                fontFamily="var(--font-mono)"
                fill={active ? 'var(--ink)' : 'var(--ink-tertiary)'}
                fontWeight={active ? '600' : '400'}
                letterSpacing="0.04em"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
