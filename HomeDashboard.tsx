import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Play,
  Shield,
  Trophy,
  UserPlus,
} from 'lucide-react';
import {
  CLUBS,
  FIXTURES,
  IMAGES,
  LEAGUES,
  NEWS_ARTICLES,
  PLAYERS,
  getClubById,
  getLeagueById,
  sortLeagueClubs,
} from '../data/footballData';
import { MatchFixture, RouteId } from '../types/football';
import { ClubCrest } from '../components/ClubCrest';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomeDashboardProps {
  onNavigate: (route: RouteId) => void;
  onOpenClub: (clubId: string) => void;
  onOpenPlayer: (playerId: string) => void;
  onOpenArticle: (articleId: string) => void;
  hasManagerSave: boolean;
  hasPlayerSave: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onOpenClub,
  onOpenPlayer,
  onOpenArticle,
  hasManagerSave,
  hasPlayerSave,
}) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('premier-league');
  const [selectedFixture, setSelectedFixture] = useState<MatchFixture>(FIXTURES[0]);

  const tableClubs = sortLeagueClubs(
    CLUBS.filter((c) => c.leagueId === selectedLeagueId)
  );
  const topScorers = [...PLAYERS]
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);
  const leadNews = NEWS_ARTICLES[0];
  const secondaryNews = NEWS_ARTICLES.slice(1, 4);

  const homeClub = getClubById(selectedFixture.homeClubId);
  const awayClub = getClubById(selectedFixture.awayClubId);
  const fixtureLeague = getLeagueById(selectedFixture.leagueId);

  return (
    <div className="space-y-8">
      {/* Hero Banner Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 relative overflow-hidden rounded-xl border border-white/10 bg-[#0E1116] min-h-[320px] flex flex-col justify-end">
          <ImageWithFallback
            src={IMAGES.stadiumHero}
            alt="Floodlit European stadium at night"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/70 to-[#07080A]/25" />

          <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
            <p className="text-xs font-medium text-emerald-400 tracking-wide">
              2026/27 Global Matchday Hub · Five Major Leagues
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              Every league table, tactical shift, and career decision in one command center.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              Follow live European fixtures, scout elite player analytics, test your football IQ, or take charge from the touchline.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('manager')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{hasManagerSave ? 'Resume Manager Career' : 'Start Manager Career'}</span>
              </button>
              <button
                onClick={() => onNavigate('player-career')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <span>{hasPlayerSave ? 'My Player Career' : 'Create Football Player'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Matchday Spotlight Panel */}
        <div className="lg:col-span-4 rounded-xl border border-white/10 bg-[#0E1116] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{fixtureLeague?.name}</span>
              <span
                className={`font-mono font-semibold ${
                  selectedFixture.status === 'LIVE'
                    ? 'text-emerald-400'
                    : selectedFixture.status === 'FT'
                    ? 'text-zinc-300'
                    : 'text-amber-400'
                }`}
              >
                {selectedFixture.status === 'LIVE'
                  ? `LIVE · ${selectedFixture.minute}′`
                  : selectedFixture.status === 'FT'
                  ? 'FULL TIME'
                  : 'UPCOMING'}
              </span>
            </div>

            {homeClub && awayClub && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenClub(homeClub.id)}
                  className="flex flex-col items-center gap-2 flex-1 text-center group"
                >
                  <ClubCrest club={homeClub} size="lg" />
                  <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[110px]">
                    {homeClub.shortName}
                  </span>
                </button>

                <div className="text-center shrink-0 px-2">
                  <div className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight">
                    {selectedFixture.homeScore !== null
                      ? `${selectedFixture.homeScore} – ${selectedFixture.awayScore}`
                      : 'vs'}
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {selectedFixture.kickoffLabel}
                  </p>
                </div>

                <button
                  onClick={() => onOpenClub(awayClub.id)}
                  className="flex flex-col items-center gap-2 flex-1 text-center group"
                >
                  <ClubCrest club={awayClub} size="lg" />
                  <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[110px]">
                    {awayClub.shortName}
                  </span>
                </button>
              </div>
            )}

            {/* Match Stats or Venue */}
            {selectedFixture.homePossession !== undefined ? (
              <div className="mt-6 space-y-3 border-t border-white/8 pt-4 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 font-mono tabular-nums mb-1.5">
                    <span>{selectedFixture.homePossession}%</span>
                    <span className="font-sans text-zinc-500">Possession</span>
                    <span>{100 - selectedFixture.homePossession}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${selectedFixture.homePossession}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between font-mono tabular-nums text-zinc-300">
                  <span>{selectedFixture.homeShots}</span>
                  <span className="font-sans text-zinc-500">Total Shots</span>
                  <span>{selectedFixture.awayShots}</span>
                </div>
                <div className="flex justify-between font-mono tabular-nums text-zinc-300">
                  <span>{selectedFixture.homeXG?.toFixed(2)}</span>
                  <span className="font-sans text-zinc-500">Expected Goals (xG)</span>
                  <span>{selectedFixture.awayXG?.toFixed(2)}</span>
                </div>
                {selectedFixture.events && selectedFixture.events.length > 0 && (
                  <div className="border-t border-white/8 pt-3 space-y-1.5 max-h-24 overflow-y-auto">
                    {selectedFixture.events.map((ev, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="truncate">
                          <span className="font-mono text-emerald-400 mr-1.5">{ev.minute}′</span>
                          <span className="text-zinc-200">{ev.playerName}</span>
                        </span>
                        <span className="text-zinc-500 shrink-0 ml-2">
                          {ev.team === 'home' ? homeClub?.code : awayClub?.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 border-t border-white/8 pt-4 text-xs text-zinc-400 space-y-2">
                <p>Venue: <span className="text-zinc-200">{selectedFixture.venue}</span></p>
                <p>Kickoff: <span className="text-zinc-200">{selectedFixture.kickoffLabel}</span></p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('leagues')}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/8 bg-[#141820] px-3.5 py-2 text-xs font-medium text-zinc-200 hover:border-emerald-500/40 hover:text-white transition-colors"
          >
            <span>Explore Full League Tables</span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* Matchday Strip */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Matchday Center</h2>
          <span className="text-xs text-zinc-400">Select a fixture to inspect match telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {FIXTURES.map((fixture) => {
            const h = getClubById(fixture.homeClubId);
            const a = getClubById(fixture.awayClubId);
            if (!h || !a) return null;
            const active = selectedFixture.id === fixture.id;
            return (
              <button
                key={fixture.id}
                onClick={() => setSelectedFixture(fixture)}
                className={`rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-emerald-500/60 bg-[#131922]'
                    : 'border-white/8 bg-[#0E1116] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2.5">
                  <span className="truncate">{getLeagueById(fixture.leagueId)?.name}</span>
                  <span
                    className={`font-mono font-semibold shrink-0 ml-2 ${
                      fixture.status === 'LIVE'
                        ? 'text-emerald-400'
                        : fixture.status === 'FT'
                        ? 'text-zinc-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {fixture.status === 'LIVE' ? `${fixture.minute}′` : fixture.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ClubCrest club={h} size="xs" />
                      <span className="text-xs font-medium text-zinc-100 truncate">
                        {h.shortName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {fixture.homeScore ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ClubCrest club={a} size="xs" />
                      <span className="text-xs font-medium text-zinc-100 truncate">
                        {a.shortName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {fixture.awayScore ?? '-'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Standings Snapshot + World News Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* League Table Snapshot */}
        <div className="lg:col-span-6 rounded-xl border border-white/8 bg-[#0E1116] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">League Standings</h2>
              <p className="text-xs text-zinc-400">2026/27 Season · Click any club for squad & stadium</p>
            </div>
            <button
              onClick={() => onNavigate('leagues')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>All Leagues</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 border-b border-white/8">
            {LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeagueId(league.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedLeagueId === league.id
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-3">Club</th>
                  <th className="py-2 px-2 text-right font-mono">MP</th>
                  <th className="py-2 px-2 text-right font-mono">GD</th>
                  <th className="py-2 pl-2 text-right font-mono">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {tableClubs.map((club, idx) => {
                  const pts = club.won * 3 + club.drawn;
                  const gd = club.goalsFor - club.goalsAgainst;
                  return (
                    <tr
                      key={club.id}
                      onClick={() => onOpenClub(club.id)}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2.5 pr-2 font-mono text-xs text-zinc-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <ClubCrest club={club} size="xs" />
                          <span className="font-medium text-zinc-100 truncate">
                            {club.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                        {club.played}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                        {gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-mono text-xs font-bold text-white tabular-nums">
                        {pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* World Football News Feed */}
        <div className="lg:col-span-6 rounded-xl border border-white/8 bg-[#0E1116] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">World Football News</h2>
              <p className="text-xs text-zinc-400">Latest tactical reports, transfers, and match coverage</p>
            </div>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Newsroom</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => onOpenArticle(leadNews.id)}
            className="group text-left rounded-lg overflow-hidden border border-white/8 bg-[#12161D] hover:border-emerald-500/40 transition-colors"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
              <div className="sm:col-span-5 aspect-video sm:aspect-auto overflow-hidden">
                <ImageWithFallback
                  src={leadNews.imageUrl}
                  alt={leadNews.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="sm:col-span-7 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-emerald-400">
                    {leadNews.category} · {leadNews.publishedAgo}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {leadNews.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">
                    {leadNews.subtitle}
                  </p>
                </div>
                <p className="mt-3 text-[11px] text-zinc-500">
                  By {leadNews.author} · {leadNews.readTime}
                </p>
              </div>
            </div>
          </button>

          <div className="mt-4 divide-y divide-white/8 flex-1">
            {secondaryNews.map((article) => (
              <button
                key={article.id}
                onClick={() => onOpenArticle(article.id)}
                className="w-full py-3 text-left group flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors rounded px-1"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-400">
                    {article.category} · {article.publishedAgo} · {article.readTime}
                  </p>
                  <h4 className="mt-0.5 text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {article.title}
                  </h4>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 shrink-0 mt-2" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Golden Boot Leaders & Interactive Modes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-white/8 bg-[#0E1116] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Top Scorers Across Europe</h2>
              <p className="text-xs text-zinc-400">Click any player to open scouting dossier & attribute radar</p>
            </div>
            <button
              onClick={() => onNavigate('players')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>All Players</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {topScorers.map((player, index) => {
              const club = getClubById(player.clubId);
              return (
                <button
                  key={player.id}
                  onClick={() => onOpenPlayer(player.id)}
                  className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-white/5 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">
                      0{index + 1}
                    </span>
                    {club && <ClubCrest club={club} size="sm" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {club?.shortName} · {player.position} · xG {player.stats.xG.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        {player.stats.goals}
                      </p>
                      <p className="text-[11px] text-zinc-500">Goals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-zinc-200 tabular-nums">
                        {player.stats.avgRating.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-zinc-500">Rating</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Career & Quiz Launchpad */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">Interactive Simulation</span>
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Football Manager Career</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Pick a club, design formations, sign elite players in the transfer market, and coach live matchdays.
              </p>
            </div>
            <button
              onClick={() => onNavigate('manager')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
            >
              <span>{hasManagerSave ? 'Continue Manager Career' : 'Launch Manager Mode'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400">Quiz & Player Creator</span>
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Player Career & Trivia</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Build your custom footballer from rookie to world star, or test your knowledge across 3 football quiz packs.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('player-career')}
                className="rounded-lg border border-white/10 bg-[#141820] px-3 py-2 text-xs font-semibold text-white hover:border-emerald-500/40 transition-colors whitespace-nowrap"
              >
                Player Career
              </button>
              <button
                onClick={() => onNavigate('quizzes')}
                className="rounded-lg border border-white/10 bg-[#141820] px-3 py-2 text-xs font-semibold text-amber-300 hover:border-amber-500/40 transition-colors whitespace-nowrap"
              >
                Play Quizzes
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
