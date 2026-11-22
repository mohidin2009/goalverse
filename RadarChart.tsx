import React from 'react';
import { PlayerAttributes } from '../types/football';

interface RadarChartProps {
  primary: PlayerAttributes;
  primaryLabel?: string;
  secondary?: PlayerAttributes;
  secondaryLabel?: string;
  size?: number;
}

const AXES: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace', label: 'PAC' },
  { key: 'shooting', label: 'SHO' },
  { key: 'passing', label: 'PAS' },
  { key: 'dribbling', label: 'DRI' },
  { key: 'defending', label: 'DEF' },
  { key: 'physical', label: 'PHY' },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  primary,
  primaryLabel,
  secondary,
  secondaryLabel,
  size = 248,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const rings = [25, 50, 75, 100];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    const r = (Math.max(10, Math.min(100, value)) / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const buildPolygon = (attrs: PlayerAttributes) =>
    AXES.map((axis, i) => {
      const pt = getPoint(i, attrs[axis.key]);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="Player attribute radar chart"
      >
        {/* Concentric rings */}
        {rings.map((ring) => {
          const pts = AXES.map((_, i) => {
            const pt = getPoint(i, ring);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis spokes */}
        {AXES.map((axis, i) => {
          const outer = getPoint(i, 100);
          return (
            <line
              key={axis.key}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Secondary comparison polygon */}
        {secondary && (
          <polygon
            points={buildPolygon(secondary)}
            fill="rgba(245,158,11,0.18)"
            stroke="#F59E0B"
            strokeWidth="2"
          />
        )}

        {/* Primary player polygon */}
        <polygon
          points={buildPolygon(primary)}
          fill="rgba(16,185,129,0.22)"
          stroke="#10B981"
          strokeWidth="2"
        />

        {/* Vertex dots */}
        {AXES.map((axis, i) => {
          const pt = getPoint(i, primary[axis.key]);
          return (
            <circle
              key={`dot-${axis.key}`}
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill="#10B981"
              stroke="#07080A"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels & numeric values */}
        {AXES.map((axis, i) => {
          const labelPt = getPoint(i, 122);
          return (
            <g key={`lbl-${axis.key}`}>
              <text
                x={labelPt.x}
                y={labelPt.y - 4}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {axis.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 9}
                textAnchor="middle"
                fill="#F3F4F6"
                fontSize="11"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {primary[axis.key]}
                {secondary ? ` / ${secondary[axis.key]}` : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {(primaryLabel || secondaryLabel) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          {primaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-emerald-500" />
              <span className="text-zinc-200 font-medium">{primaryLabel}</span>
            </div>
          )}
          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-amber-500" />
              <span className="text-zinc-200 font-medium">{secondaryLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
