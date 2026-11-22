import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Search, SlidersHorizontal } from 'lucide-react';
import {
  LEAGUES,
  PLAYERS,
  getClubById,
  getLeagueById,
} from '../data/footballData';
import { Player, PositionGroup } from '../types/football';
import { ClubCrest } from '../components/ClubCrest';
import { RadarChart } from '../components/RadarChart';

interface PlayersPageProps {
  initialPlayerId?: string | null;
  onClearInitial: () => void;
  onOpenClub: (clubId: string) => void;
}

const POSITION_FILTERS: ('ALL' | PositionGroup)[] = ['ALL', 'FWD', 'MID', 'DEF', 'GK'];

export const PlayersPage: React.FC<PlayersPageProps> = ({
  initialPlayerId,
  onClearInitial,
  onOpenClub,
}) => {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<'ALL' | PositionGroup>('ALL');
  const [leagueFilter, setLeagueFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'goals' | 'assists' | 'value'>('rating');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [comparePlayerId, setComparePlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
      setComparePlayerId(null);
      onClearInitial();
    }
  }, [initialPlayerId, onClearInitial]);

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...PLAYERS]
      .filter((p) => {
        if (posFilter !== 'ALL' && p.positionGroup !== posFilter) return false;
        const club = getClubById(p.clubId);
        if (leagueFilter !== 'ALL' && club?.leagueId !== leagueFilter) return false;
        if (q) {
          const matchName = p.name.toLowerCase().includes(q);
          const matchNat = p.nationality.toLowerCase().includes(q);
          const matchClub = club?.name.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchNat && !matchClub) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'goals') return b.stats.goals - a.stats.goals;
        if (sortBy === 'assists') return b.stats.assists - a.stats.assists;
        if (sortBy === 'value') return b.marketValueM - a.marketValueM;
        return b.rating - a.rating;
      });
  }, [search, posFilter, leagueFilter, sortBy]);

  const selectedPlayer: Player | undefined = selectedPlayerId
    ? PLAYERS.find((p) => p.id === selectedPlayerId)
    : undefined;
  const comparePlayer: Player | undefined = comparePlayerId
    ? PLAYERS.find((p) => p.id === comparePlayerId)
    : undefined;

  if (selectedPlayer) {
    const club = getClubById(selectedPlayer.clubId);
    const league = club ? getLeagueById(club.leagueId) : undefined;
    const otherPlayers = PLAYERS.filter((p) => p.id !== selectedPlayer.id);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedPlayerId(null);
              setComparePlayerId(null);
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Player Directory</span>
          </button>

          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
            <select
              value={comparePlayerId ?? ''}
              onChange={(e) => setComparePlayerId(e.target.value || null)}
              aria-label="Compare with another player"
              className="rounded-lg border border-white/10 bg-[#0E1116] px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Compare with another player...</option>
              {otherPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.position} · {p.rating})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Player Dossier Header */}
        <section className="rounded-xl border border-white/10 bg-[#0E1116] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums shrink-0">
                {selectedPlayer.rating}
              </div>
              <div>
                <p className="text-xs text-emerald-400">
                  #{selectedPlayer.shirtNumber} · {selectedPlayer.position} · {selectedPlayer.nationality} · Age {selectedPlayer.age}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedPlayer.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  {club && (
                    <button
                      onClick={() => onOpenClub(club.id)}
                      className="inline-flex items-center gap-2 text-zinc-200 hover:text-emerald-400 transition-colors"
                    >
                      <ClubCrest club={club} size="xs" />
                      <span>{club.name}</span>
                    </button>
                  )}
                  <span>· {league?.name}</span>
                  <span>· Foot: {selectedPlayer.preferredFoot}</span>
                  <span>· Contract to {selectedPlayer.contractUntil}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/8">
              <div>
                <p className="text-xs text-zinc-500">Market Value</p>
                <p className="mt-1 font-mono text-xl font-bold text-amber-400 tabular-nums">
                  €{selectedPlayer.marketValueM}M
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Weekly Wage</p>
                <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                  €{selectedPlayer.wageK}K
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Potential</p>
                <p className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                  {selectedPlayer.potential}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Radar & Season Statistics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-white/8 bg-[#0E1116] p-6 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold text-white self-start mb-4">
              {comparePlayer ? 'Head-to-Head Attribute Radar' : 'Six-Pillar Attribute Profile'}
            </h2>
            <RadarChart
              primary={selectedPlayer.attributes}
              primaryLabel={selectedPlayer.name}
              secondary={comparePlayer?.attributes}
              secondaryLabel={comparePlayer?.name}
              size={256}
            />
          </div>

          <div className="lg:col-span-7 rounded-xl border border-white/8 bg-[#0E1116] p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white mb-4">
                2026/27 Season Output & Telemetry
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border border-white/8 bg-[#12161D] p-3.5">
                  <p className="text-xs text-zinc-400">Appearances</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                    {selectedPlayer.stats.appearances}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#12161D] p-3.5">
                  <p className="text-xs text-zinc-400">Goals</p>
                  <p className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                    {selectedPlayer.stats.goals}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#12161D] p-3.5">
                  <p className="text-xs text-zinc-400">Assists</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                    {selectedPlayer.stats.assists}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#12161D] p-3.5">
                  <p className="text-xs text-zinc-400">Match Rating</p>
                  <p className="mt-1 font-mono text-xl font-bold text-amber-400 tabular-nums">
                    {selectedPlayer.stats.avgRating.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-xs">
                {[
                  {
                    label: 'Expected Goals (xG)',
                    valA: selectedPlayer.stats.xG.toFixed(1),
                    valB: comparePlayer?.stats.xG.toFixed(1),
                  },
                  {
                    label: 'Pass Completion',
                    valA: `${selectedPlayer.stats.passAccuracy.toFixed(1)}%`,
                    valB: comparePlayer ? `${comparePlayer.stats.passAccuracy.toFixed(1)}%` : undefined,
                  },
                  {
                    label: 'Key Passes / 90',
                    valA: selectedPlayer.stats.keyPassesPer90.toFixed(1),
                    valB: comparePlayer?.stats.keyPassesPer90.toFixed(1),
                  },
                  {
                    label: 'Tackles / 90',
                    valA: selectedPlayer.stats.tacklesPer90.toFixed(1),
                    valB: comparePlayer?.stats.tacklesPer90.toFixed(1),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1.5 border-b border-white/5"
                  >
                    <span className="text-zinc-400">{row.label}</span>
                    <div className="font-mono font-semibold text-white tabular-nums flex items-center gap-3">
                      <span className="text-emerald-400">{row.valA}</span>
                      {row.valB !== undefined && (
                        <>
                          <span className="text-zinc-600">vs</span>
                          <span className="text-amber-400">{row.valB}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Player Profiles & Scouting Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Filter world football stars, inspect 6-axis attribute radars, and compare players head-to-head.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-white/8 bg-[#0E1116] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by player, nationality, or club..."
            className="w-full rounded-lg border border-white/10 bg-[#12161D] pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-[#12161D] p-1 border border-white/8">
            {POSITION_FILTERS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  posFilter === pos
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            aria-label="Filter by league"
            className="rounded-lg border border-white/10 bg-[#12161D] px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Leagues</option>
            {LEAGUES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort players"
              className="rounded-lg border border-white/10 bg-[#12161D] px-3 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="rating">Sort: OVR Rating</option>
              <option value="goals">Sort: Goals</option>
              <option value="assists">Sort: Assists</option>
              <option value="value">Sort: Market Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      {filteredPlayers.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-12 text-center">
          <p className="text-sm font-medium text-zinc-200">No players match your filters</p>
          <button
            onClick={() => {
              setSearch('');
              setPosFilter('ALL');
              setLeagueFilter('ALL');
            }}
            className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-[#0E1116] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500 bg-[#11151C]">
                  <th className="py-3 pl-5 pr-3">Player</th>
                  <th className="py-3 px-3">Club</th>
                  <th className="py-3 px-2">Pos</th>
                  <th className="py-3 px-2 text-right font-mono">Age</th>
                  <th className="py-3 px-2 text-right font-mono">OVR</th>
                  <th className="py-3 px-2 text-right font-mono">G</th>
                  <th className="py-3 px-2 text-right font-mono">A</th>
                  <th className="py-3 px-2 text-right font-mono">Avg</th>
                  <th className="py-3 pl-2 pr-5 text-right font-mono">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredPlayers.map((player) => {
                  const club = getClubById(player.clubId);
                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 pl-5 pr-3">
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-xs text-zinc-500">{player.nationality}</p>
                      </td>
                      <td className="py-3 px-3">
                        {club && (
                          <div className="flex items-center gap-2">
                            <ClubCrest club={club} size="xs" />
                            <span className="text-xs text-zinc-300">{club.shortName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-zinc-300">
                        {player.position}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                        {player.age}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs font-bold text-emerald-400 tabular-nums">
                        {player.rating}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                        {player.stats.goals}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                        {player.stats.assists}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                        {player.stats.avgRating.toFixed(2)}
                      </td>
                      <td className="py-3 pl-2 pr-5 text-right font-mono text-xs text-amber-400 tabular-nums">
                        €{player.marketValueM}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
