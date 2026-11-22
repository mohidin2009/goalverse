import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  MapPin,
  Shield,
  Users,
} from 'lucide-react';
import {
  CLUBS,
  LEAGUES,
  getClubById,
  getLeagueById,
  getPlayersByClub,
  sortLeagueClubs,
} from '../data/footballData';
import { Club } from '../types/football';
import { ClubCrest } from '../components/ClubCrest';
import {
  ClubFormMomentumChart,
  InlineFormSparkline,
  LeagueFormOverviewChart,
} from '../components/FormGuideChart';

interface LeaguesClubsPageProps {
  initialLeagueId?: string | null;
  initialClubId?: string | null;
  onClearInitial: () => void;
  onOpenPlayer: (playerId: string) => void;
  onStartManagerWithClub: (clubId: string) => void;
}

export const LeaguesClubsPage: React.FC<LeaguesClubsPageProps> = ({
  initialLeagueId,
  initialClubId,
  onClearInitial,
  onOpenPlayer,
  onStartManagerWithClub,
}) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('premier-league');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'pts' | 'gf' | 'ovr'>('pts');

  useEffect(() => {
    if (initialClubId) {
      const club = getClubById(initialClubId);
      if (club) {
        setSelectedLeagueId(club.leagueId);
        setSelectedClubId(club.id);
      }
      onClearInitial();
    } else if (initialLeagueId) {
      setSelectedLeagueId(initialLeagueId);
      setSelectedClubId(null);
      onClearInitial();
    }
  }, [initialClubId, initialLeagueId, onClearInitial]);

  const activeLeague = getLeagueById(selectedLeagueId) ?? LEAGUES[0];
  const leagueClubs = CLUBS.filter((c) => c.leagueId === activeLeague.id);

  const sortedClubs = [...sortLeagueClubs(leagueClubs)].sort((a, b) => {
    if (sortBy === 'gf') return b.goalsFor - a.goalsFor;
    if (sortBy === 'ovr') return b.overall - a.overall;
    return 0;
  });

  const selectedClub: Club | undefined = selectedClubId
    ? getClubById(selectedClubId)
    : undefined;

  if (selectedClub) {
    const clubLeague = getLeagueById(selectedClub.leagueId);
    const squad = getPlayersByClub(selectedClub.id).sort((a, b) => b.rating - a.rating);
    const pts = selectedClub.won * 3 + selectedClub.drawn;
    const gd = selectedClub.goalsFor - selectedClub.goalsAgainst;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedClubId(null)}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {clubLeague?.name ?? 'Leagues'}</span>
        </button>

        {/* Club Header Card */}
        <section className="rounded-xl border border-white/10 bg-[#0E1116] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <ClubCrest club={selectedClub} size="xl" />
              <div>
                <p className="text-xs text-emerald-400">
                  {clubLeague?.name} · Founded {selectedClub.founded}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedClub.name}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {selectedClub.stadium} ({selectedClub.capacity.toLocaleString()})
                  </span>
                  <span>· Manager: {selectedClub.manager}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onStartManagerWithClub(selectedClub.id)}
                className="rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                Manage This Club
              </button>
            </div>
          </div>

          {/* Club Telemetry Strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-t border-white/8 pt-5">
            <div>
              <p className="text-xs text-zinc-500">Overall Rating</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                {selectedClub.overall}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Attack / Mid / Def</p>
              <p className="mt-1 font-mono text-lg font-semibold text-zinc-200 tabular-nums">
                {selectedClub.attack} / {selectedClub.midfield} / {selectedClub.defense}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">League Points</p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                {pts}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">W-D-L Record</p>
              <p className="mt-1 font-mono text-lg font-semibold text-zinc-200 tabular-nums">
                {selectedClub.won}-{selectedClub.drawn}-{selectedClub.lost}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Goal Difference</p>
              <p className="mt-1 font-mono text-lg font-semibold text-zinc-200 tabular-nums">
                {gd > 0 ? `+${gd}` : gd} ({selectedClub.goalsFor}:{selectedClub.goalsAgainst})
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Transfer Budget</p>
              <p className="mt-1 font-mono text-lg font-semibold text-amber-400 tabular-nums">
                €{selectedClub.transferBudgetM}M
              </p>
            </div>
          </div>
        </section>

        {/* Recent Form */}
        <section className="rounded-xl border border-white/8 bg-[#0E1116] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent 5-Match Form</h2>
              <p className="text-xs text-zinc-400">
                Cumulative points trajectory across the last 5 league fixtures
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedClub.form.map((res, idx) => (
                <span
                  key={idx}
                  className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    res === 'W'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : res === 'D'
                      ? 'bg-zinc-700/40 text-zinc-200 border border-white/10'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
          <ClubFormMomentumChart form={selectedClub.form} />
        </section>

        {/* Club Squad Table */}
        <section className="rounded-xl border border-white/8 bg-[#0E1116] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Key First-Team Squad</h2>
            </div>
            <span className="text-xs text-zinc-400">{squad.length} tracked players</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-4">Player</th>
                  <th className="py-2 px-2">Pos</th>
                  <th className="py-2 px-2 text-right font-mono">Age</th>
                  <th className="py-2 px-2 text-right font-mono">OVR</th>
                  <th className="py-2 px-2 text-right font-mono">G</th>
                  <th className="py-2 px-2 text-right font-mono">A</th>
                  <th className="py-2 pl-2 text-right font-mono">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {squad.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onOpenPlayer(p.id)}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pr-3 font-mono text-xs text-zinc-500 tabular-nums">
                      {p.shirtNumber}
                    </td>
                    <td className="py-3 pr-4 font-medium text-white">
                      {p.name}
                      <span className="ml-2 text-xs text-zinc-500 font-normal">
                        {p.nationality}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-zinc-300">{p.position}</td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                      {p.age}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs font-bold text-emerald-400 tabular-nums">
                      {p.rating}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {p.stats.goals}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {p.stats.assists}
                    </td>
                    <td className="py-3 pl-2 text-right font-mono text-xs text-amber-400 tabular-nums">
                      €{p.marketValueM}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Leagues & Clubs Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Inspect domestic tables, club ratings, form guides, and squad rosters across Europe.
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeagueId(league.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLeagueId === league.id
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'bg-[#0E1116] border border-white/8 text-zinc-300 hover:text-white hover:border-white/20'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </div>

      {/* League Standings Table */}
      <section className="rounded-xl border border-white/8 bg-[#0E1116] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{activeLeague.name} Standings</h2>
            <p className="text-xs text-zinc-400">
              {activeLeague.country} · {activeLeague.season} · {activeLeague.tierLabel}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
            {(['pts', 'gf', 'ovr'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  sortBy === key
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {key === 'pts' ? 'Points' : key === 'gf' ? 'Goals Scored' : 'Club OVR'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500">
                <th className="py-2.5 pr-3">Pos</th>
                <th className="py-2.5 pr-4">Club</th>
                <th className="py-2.5 px-2 text-right font-mono">MP</th>
                <th className="py-2.5 px-2 text-right font-mono">W</th>
                <th className="py-2.5 px-2 text-right font-mono">D</th>
                <th className="py-2.5 px-2 text-right font-mono">L</th>
                <th className="py-2.5 px-2 text-right font-mono">GF</th>
                <th className="py-2.5 px-2 text-right font-mono">GA</th>
                <th className="py-2.5 px-2 text-right font-mono">GD</th>
                <th className="py-2.5 px-2 text-right font-mono">PTS</th>
                <th className="py-2.5 pl-4 hidden md:table-cell">Last 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sortedClubs.map((club, index) => {
                const pts = club.won * 3 + club.drawn;
                const gd = club.goalsFor - club.goalsAgainst;
                const zoneLabel =
                  index === 0
                    ? 'Leader'
                    : index < activeLeague.championsLeagueSpots
                    ? 'UCL'
                    : '';
                return (
                  <tr
                    key={club.id}
                    onClick={() => setSelectedClubId(club.id)}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pr-3 font-mono text-xs tabular-nums">
                      <span
                        className={
                          index < activeLeague.championsLeagueSpots
                            ? 'text-emerald-400 font-semibold'
                            : 'text-zinc-400'
                        }
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <ClubCrest club={club} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{club.name}</p>
                          <p className="text-[11px] text-zinc-500">
                            {club.manager}
                            {zoneLabel ? ` · ${zoneLabel}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                      {club.played}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {club.won}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {club.drawn}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {club.lost}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {club.goalsFor}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {club.goalsAgainst}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-sm font-bold text-white tabular-nums">
                      {pts}
                    </td>
                    <td className="py-2.5 pl-4 hidden md:table-cell">
                      <InlineFormSparkline form={club.form} clubName={club.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* League Form Comparison Graph */}
      <LeagueFormOverviewChart
        clubs={sortedClubs}
        onSelectClub={(id) => setSelectedClubId(id)}
      />

      {/* Club Cards Grid */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Club Profiles</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelectedClubId(club.id)}
              className="rounded-xl border border-white/8 bg-[#0E1116] p-5 text-left hover:border-emerald-500/40 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ClubCrest club={club} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {club.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {club.stadium} · {club.city}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                  {club.overall}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center">
                <div>
                  <p className="text-[11px] text-zinc-500">Attack</p>
                  <p className="font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                    {club.attack}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Midfield</p>
                  <p className="font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                    {club.midfield}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Defense</p>
                  <p className="font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                    {club.defense}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
