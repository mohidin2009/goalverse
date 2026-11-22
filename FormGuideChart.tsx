import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Club, FormResult } from '../types/football';

interface InlineFormTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      matchLabel: string;
      result: FormResult;
      points: number;
    };
  }>;
}

const InlineFormTooltip: React.FC<InlineFormTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const label = item.result === 'W' ? 'Win' : item.result === 'D' ? 'Draw' : 'Loss';
  const color =
    item.result === 'W'
      ? 'text-emerald-400'
      : item.result === 'D'
      ? 'text-zinc-300'
      : 'text-red-400';

  return (
    <div className="rounded-md border border-white/15 bg-[#0A0C10] px-2.5 py-1.5 shadow-lg text-[11px] whitespace-nowrap z-50">
      <p className="text-zinc-400">{item.matchLabel}</p>
      <p className={`font-mono font-semibold ${color}`}>
        {label} ({item.points} pts)
      </p>
    </div>
  );
};

interface InlineFormSparklineProps {
  form: FormResult[];
  clubName: string;
}

export const InlineFormSparkline: React.FC<InlineFormSparklineProps> = ({
  form,
  clubName,
}) => {
  const data = form.map((res, idx) => ({
    matchLabel: `Match ${idx + 1} of 5`,
    result: res,
    points: res === 'W' ? 3 : res === 'D' ? 1 : 0,
    visualValue: res === 'W' ? 3 : res === 'D' ? 1.4 : 0.45,
  }));

  const formPoints = form.reduce((sum, r) => sum + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);

  return (
    <div
      className="flex items-center gap-2.5"
      aria-label={`${clubName} last 5 matches form: ${form.join(' ')} (${formPoints} of 15 points)`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-[28px] w-[84px] shrink-0">
        <BarChart
          width={84}
          height={28}
          data={data}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          barCategoryGap={3}
        >
          <YAxis domain={[0, 3.2]} hide />
          <Tooltip
            content={<InlineFormTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="visualValue" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  entry.result === 'W'
                    ? '#10B981'
                    : entry.result === 'D'
                    ? '#6B7280'
                    : '#EF4444'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </div>
      <span className="font-mono text-[11px] text-zinc-400 tabular-nums w-9 text-right shrink-0">
        {formPoints}/15
      </span>
    </div>
  );
};

interface LeagueFormTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      shortName: string;
      fullName: string;
      formPoints: number;
      formString: string;
      wins: number;
      draws: number;
      losses: number;
    };
  }>;
}

const LeagueFormTooltip: React.FC<LeagueFormTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/15 bg-[#0A0C10] px-3.5 py-2.5 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-white">{item.fullName}</p>
      <p className="font-mono text-emerald-400 font-semibold tabular-nums">
        {item.formPoints} / 15 Form Points
      </p>
      <p className="text-zinc-400 font-mono text-[11px]">
        Sequence: <span className="text-zinc-200">{item.formString}</span>
      </p>
      <p className="text-zinc-500 text-[11px]">
        {item.wins}W · {item.draws}D · {item.losses}L
      </p>
    </div>
  );
};

interface LeagueFormOverviewChartProps {
  clubs: Club[];
  onSelectClub: (clubId: string) => void;
}

export const LeagueFormOverviewChart: React.FC<LeagueFormOverviewChartProps> = ({
  clubs,
  onSelectClub,
}) => {
  const data = clubs.map((club) => {
    const wins = club.form.filter((r) => r === 'W').length;
    const draws = club.form.filter((r) => r === 'D').length;
    const losses = club.form.filter((r) => r === 'L').length;
    const formPoints = wins * 3 + draws;

    return {
      clubId: club.id,
      shortName: club.code,
      fullName: club.name,
      formPoints,
      formString: club.form.join(' · '),
      wins,
      draws,
      losses,
    };
  });

  return (
    <div className="rounded-xl border border-white/8 bg-[#0E1116] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Last 5 Matches Form Guide
          </h2>
          <p className="text-xs text-zinc-400">
            Points earned across the last 5 league fixtures (max 15 pts) · Click a bar to inspect club
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
            Strong (11–15 pts)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
            Steady (7–10 pts)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-red-500" />
            Dip (0–6 pts)
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
            barCategoryGap="24%"
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 15]}
              ticks={[0, 3, 6, 9, 12, 15]}
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<LeagueFormTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar
              dataKey="formPoints"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
              onClick={(_barItem, index) => {
                const target = data[index];
                if (target) {
                  onSelectClub(target.clubId);
                }
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.clubId}
                  fill={
                    entry.formPoints >= 11
                      ? '#10B981'
                      : entry.formPoints >= 7
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ClubMomentumTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      resultLabel: string;
      matchPts: number;
      cumulativePts: number;
    };
  }>;
}

const ClubMomentumTooltip: React.FC<ClubMomentumTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/15 bg-[#0A0C10] px-3 py-2 shadow-xl text-xs space-y-0.5">
      <p className="text-zinc-400">{item.label}</p>
      <p className="font-semibold text-white">
        {item.resultLabel} (+{item.matchPts} pts)
      </p>
      <p className="font-mono text-[11px] text-emerald-400 tabular-nums">
        Cumulative: {item.cumulativePts} pts
      </p>
    </div>
  );
};

interface ClubFormMomentumChartProps {
  form: FormResult[];
}

export const ClubFormMomentumChart: React.FC<ClubFormMomentumChartProps> = ({ form }) => {
  let running = 0;
  const data = form.map((res, idx) => {
    const matchPts = res === 'W' ? 3 : res === 'D' ? 1 : 0;
    running += matchPts;
    return {
      label: idx === form.length - 1 ? 'Latest' : `Match -${form.length - 1 - idx}`,
      resultLabel: res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss',
      matchPts,
      cumulativePts: running,
    };
  });

  return (
    <div className="h-44 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="formMomentumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 15]}
            ticks={[0, 5, 10, 15]}
            tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ClubMomentumTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativePts"
            stroke="#10B981"
            strokeWidth={2.2}
            fillOpacity={1}
            fill="url(#formMomentumGrad)"
            dot={{ r: 4, fill: '#10B981', stroke: '#0E1116', strokeWidth: 2 }}
            activeDot={{ r: 5.5, fill: '#34D399' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
