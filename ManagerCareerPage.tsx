import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Coins,
  Play,
  RotateCcw,
  Shield,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import {
  CLUBS,
  IMAGES,
  LEAGUES,
  PLAYERS,
  getClubById,
  getLeagueById,
  getPlayerById,
} from '../data/footballData';
import {
  Formation,
  ManagerCareerState,
  ManagerStandingRow,
  Player,
  TacticalMentality,
} from '../types/football';
import { ClubCrest } from '../components/ClubCrest';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface ManagerCareerPageProps {
  initialClubId?: string | null;
  onClearInitial: () => void;
  onSaveChange: (hasSave: boolean) => void;
}

export const MANAGER_SAVE_KEY = 'fu_manager_career_v1';

const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];
const MENTALITIES: TacticalMentality[] = [
  'Balanced',
  'Gegenpress',
  'Counter-Attack',
  'Low Block',
];

function buildVirtualSquadForClub(clubId: string): Player[] {
  const realPlayers = PLAYERS.filter((p) => p.clubId === clubId);
  const club = getClubById(clubId);
  const baseRating = club ? club.overall - 4 : 78;
  const neededRoles: { pos: string; group: Player['positionGroup']; num: number }[] = [
    { pos: 'GK', group: 'GK', num: 1 },
    { pos: 'RB', group: 'DEF', num: 2 },
    { pos: 'CB', group: 'DEF', num: 4 },
    { pos: 'CB', group: 'DEF', num: 5 },
    { pos: 'LB', group: 'DEF', num: 3 },
    { pos: 'CDM', group: 'MID', num: 6 },
    { pos: 'CM', group: 'MID', num: 8 },
    { pos: 'CAM', group: 'MID', num: 10 },
    { pos: 'RW', group: 'FWD', num: 7 },
    { pos: 'LW', group: 'FWD', num: 11 },
    { pos: 'ST', group: 'FWD', num: 9 },
    { pos: 'CM', group: 'MID', num: 14 },
    { pos: 'CB', group: 'DEF', num: 15 },
    { pos: 'ST', group: 'FWD', num: 19 },
  ];

  const synthetic: Player[] = [];
  const firstNames = ['Lucas', 'Matteo', 'Hugo', 'Noah', 'Carlos', 'Sander', 'Julian', 'Enzo', 'Tariq', 'Tomas', 'Leo', 'Kai'];
  const lastNames = ['Moreau', 'Rossi', 'Navarro', 'Keller', 'Silva', 'Lind', 'Bauer', 'Costa', 'Mendes', 'Vega', 'Richter', 'Soler'];

  let idx = 0;
  for (const role of neededRoles) {
    const existingCount = realPlayers.filter((p) => p.positionGroup === role.group).length;
    const targetForGroup =
      role.group === 'GK' ? 1 : role.group === 'DEF' ? 4 : role.group === 'MID' ? 4 : 3;
    if (existingCount + synthetic.filter((p) => p.positionGroup === role.group).length >= targetForGroup) {
      continue;
    }
    const rating = Math.max(72, Math.min(84, baseRating + (idx % 4) - 1));
    synthetic.push({
      id: `acad-${clubId}-${idx}`,
      name: `${firstNames[idx % firstNames.length]} ${lastNames[(idx * 3) % lastNames.length]}`,
      clubId,
      nationality: 'Europe',
      age: 20 + (idx % 7),
      position: role.pos,
      positionGroup: role.group,
      shirtNumber: role.num + 20,
      preferredFoot: idx % 3 === 0 ? 'Left' : 'Right',
      rating,
      potential: rating + 4,
      marketValueM: Math.max(8, Math.round((rating - 68) * 2.2)),
      wageK: 45 + (rating - 72) * 8,
      contractUntil: 2028,
      attributes: {
        pace: rating - 2 + (idx % 5),
        shooting: role.group === 'FWD' ? rating + 1 : rating - 10,
        passing: role.group === 'MID' ? rating + 2 : rating - 3,
        dribbling: rating - 1,
        defending: role.group === 'DEF' || role.group === 'GK' ? rating + 2 : 45,
        physical: rating - 1,
      },
      stats: {
        appearances: 0,
        goals: 0,
        assists: 0,
        xG: 0,
        passAccuracy: 82,
        keyPassesPer90: 1.1,
        tacklesPer90: 1.5,
        cleanSheets: 0,
        avgRating: 7.0,
      },
    });
    idx++;
  }
  return [...realPlayers, ...synthetic];
}

function getAllPlayerPool(career: ManagerCareerState): Player[] {
  const ownVirtual = buildVirtualSquadForClub(career.clubId);
  const map = new Map<string, Player>();
  for (const p of PLAYERS) map.set(p.id, p);
  for (const p of ownVirtual) map.set(p.id, p);
  return Array.from(map.values());
}

function createInitialCareer(clubId: string, managerName: string): ManagerCareerState {
  const club = getClubById(clubId) ?? CLUBS[0];
  const leagueClubs = CLUBS.filter((c) => c.leagueId === club.leagueId);
  const opponents = leagueClubs.filter((c) => c.id !== club.id);
  const squad = buildVirtualSquadForClub(club.id);

  const standings: ManagerStandingRow[] = leagueClubs.map((c) => ({
    clubId: c.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }));

  const sortedByPos = [...squad].sort((a, b) => b.rating - a.rating);
  const startingIds = sortedByPos.slice(0, 11).map((p) => p.id);

  return {
    clubId: club.id,
    managerName: managerName.trim() || 'Alex Mercer',
    season: 1,
    matchday: 1,
    totalMatchdays: Math.max(8, (leagueClubs.length - 1) * 2),
    budgetM: club.transferBudgetM,
    boardConfidence: 78,
    formation: '4-3-3',
    mentality: 'Balanced',
    squadIds: squad.map((p) => p.id),
    startingIds,
    standings,
    matchHistory: [],
    nextOpponentId: opponents[0]?.id ?? CLUBS[1].id,
    nextIsHome: true,
  };
}

export const ManagerCareerPage: React.FC<ManagerCareerPageProps> = ({
  initialClubId,
  onClearInitial,
  onSaveChange,
}) => {
  const [career, setCareer] = useState<ManagerCareerState | null>(() => {
    try {
      const raw = localStorage.getItem(MANAGER_SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Setup Wizard state
  const [setupLeagueId, setSetupLeagueId] = useState<string>('premier-league');
  const [setupClubId, setSetupClubId] = useState<string>('arsenal');
  const [managerInput, setManagerInput] = useState<string>('Alex Mercer');

  // Manager Hub tabs
  const [tab, setTab] = useState<'overview' | 'tactics' | 'transfers' | 'table'>('overview');
  const [selectedSwapId, setSelectedSwapId] = useState<string | null>(null);
  const [transferSearch, setTransferSearch] = useState('');
  const [transferPos, setTransferPos] = useState<string>('ALL');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Live Match Simulator state
  const [liveMatch, setLiveMatch] = useState<{
    active: boolean;
    minute: number;
    homeScore: number;
    awayScore: number;
    homeXG: number;
    awayXG: number;
    possession: number;
    events: string[];
    scorers: string[];
    finished: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialClubId) {
      const club = getClubById(initialClubId);
      if (club) {
        setSetupLeagueId(club.leagueId);
        setSetupClubId(club.id);
      }
      onClearInitial();
    }
  }, [initialClubId, onClearInitial]);

  const persistCareer = (next: ManagerCareerState | null) => {
    setCareer(next);
    onSaveChange(Boolean(next));
    try {
      if (next) {
        localStorage.setItem(MANAGER_SAVE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(MANAGER_SAVE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Live match ticker effect
  useEffect(() => {
    if (!liveMatch || !liveMatch.active || liveMatch.finished || !career) return;

    const timer = setTimeout(() => {
      const nextMin = Math.min(90, liveMatch.minute + 5);
      const myClub = getClubById(career.clubId)!;
      const oppClub = getClubById(career.nextOpponentId)!;
      const allPool = getAllPlayerPool(career);
      const attackers = career.startingIds
        .map((id) => allPool.find((p) => p.id === id))
        .filter((p): p is Player => Boolean(p && (p.positionGroup === 'FWD' || p.positionGroup === 'MID')));

      const mentalityBoost =
        career.mentality === 'Gegenpress'
          ? 3
          : career.mentality === 'Counter-Attack'
          ? 1
          : career.mentality === 'Low Block'
          ? -3
          : 0;
      const homeBoost = career.nextIsHome ? 2 : -1;
      const myStrength = myClub.overall + mentalityBoost + homeBoost;
      const oppStrength = oppClub.overall;

      const myGoalChance = Math.max(0.04, Math.min(0.18, 0.085 + (myStrength - oppStrength) * 0.008));
      const oppGoalChance = Math.max(
        0.04,
        Math.min(
          0.18,
          0.085 +
            (oppStrength - myStrength) * 0.008 +
            (career.mentality === 'Gegenpress' ? 0.02 : career.mentality === 'Low Block' ? -0.025 : 0)
        )
      );

      let { homeScore, awayScore, homeXG, awayXG } = liveMatch;
      const newEvents = [...liveMatch.events];
      const newScorers = [...liveMatch.scorers];

      if (Math.random() < myGoalChance) {
        const scorer =
          attackers[Math.floor(Math.random() * Math.max(1, attackers.length))]?.name ??
          `${myClub.shortName} Forward`;
        if (career.nextIsHome) {
          homeScore += 1;
          homeXG += 0.38;
        } else {
          awayScore += 1;
          awayXG += 0.38;
        }
        newScorers.push(scorer);
        newEvents.unshift(`${nextMin}′ GOAL — ${scorer} scores for ${myClub.shortName}!`);
      } else if (Math.random() < 0.22) {
        if (career.nextIsHome) homeXG += 0.14;
        else awayXG += 0.14;
      }

      if (Math.random() < oppGoalChance) {
        if (career.nextIsHome) {
          awayScore += 1;
          awayXG += 0.36;
        } else {
          homeScore += 1;
          homeXG += 0.36;
        }
        newEvents.unshift(`${nextMin}′ GOAL — ${oppClub.shortName} find the back of the net!`);
      } else if (Math.random() < 0.2) {
        if (career.nextIsHome) awayXG += 0.12;
        else homeXG += 0.12;
      }

      const isDone = nextMin >= 90;
      setLiveMatch({
        ...liveMatch,
        minute: nextMin,
        homeScore,
        awayScore,
        homeXG,
        awayXG,
        possession: Math.max(36, Math.min(66, 50 + (myStrength - oppStrength) + (career.mentality === 'Gegenpress' ? 5 : -2))),
        events: newEvents,
        scorers: newScorers,
        finished: isDone,
        active: !isDone,
      });
    }, 320);

    return () => clearTimeout(timer);
  }, [liveMatch, career]);

  const startLiveMatch = () => {
    if (!career) return;
    setLiveMatch({
      active: true,
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      homeXG: 0,
      awayXG: 0,
      possession: 50,
      events: [`Kickoff! ${career.formation} · ${career.mentality} mentality selected.`],
      scorers: [],
      finished: false,
    });
  };

  const commitMatchResult = () => {
    if (!career || !liveMatch) return;
    const goalsFor = career.nextIsHome ? liveMatch.homeScore : liveMatch.awayScore;
    const goalsAgainst = career.nextIsHome ? liveMatch.awayScore : liveMatch.homeScore;
    const result: 'W' | 'D' | 'L' =
      goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L';

    const leagueClubs = CLUBS.filter((c) => c.leagueId === getClubById(career.clubId)?.leagueId);
    const otherClubIds = leagueClubs
      .map((c) => c.id)
      .filter((id) => id !== career.clubId && id !== career.nextOpponentId);

    // Update standings for user, opponent, and simulate remaining league fixtures
    const nextStandings = career.standings.map((row) => {
      if (row.clubId === career.clubId) {
        return {
          ...row,
          played: row.played + 1,
          won: row.won + (result === 'W' ? 1 : 0),
          drawn: row.drawn + (result === 'D' ? 1 : 0),
          lost: row.lost + (result === 'L' ? 1 : 0),
          goalsFor: row.goalsFor + goalsFor,
          goalsAgainst: row.goalsAgainst + goalsAgainst,
          points: row.points + (result === 'W' ? 3 : result === 'D' ? 1 : 0),
        };
      }
      if (row.clubId === career.nextOpponentId) {
        const oppRes = result === 'W' ? 'L' : result === 'L' ? 'W' : 'D';
        return {
          ...row,
          played: row.played + 1,
          won: row.won + (oppRes === 'W' ? 1 : 0),
          drawn: row.drawn + (oppRes === 'D' ? 1 : 0),
          lost: row.lost + (oppRes === 'L' ? 1 : 0),
          goalsFor: row.goalsFor + goalsAgainst,
          goalsAgainst: row.goalsAgainst + goalsFor,
          points: row.points + (oppRes === 'W' ? 3 : oppRes === 'D' ? 1 : 0),
        };
      }
      if (otherClubIds.includes(row.clubId)) {
        const g1 = Math.floor(Math.random() * 3);
        const g2 = Math.floor(Math.random() * 3);
        const r = g1 > g2 ? 'W' : g1 === g2 ? 'D' : 'L';
        return {
          ...row,
          played: row.played + 1,
          won: row.won + (r === 'W' ? 1 : 0),
          drawn: row.drawn + (r === 'D' ? 1 : 0),
          lost: row.lost + (r === 'L' ? 1 : 0),
          goalsFor: row.goalsFor + g1,
          goalsAgainst: row.goalsAgainst + g2,
          points: row.points + (r === 'W' ? 3 : r === 'D' ? 1 : 0),
        };
      }
      return row;
    });

    const opponents = leagueClubs.filter((c) => c.id !== career.clubId);
    const nextOpp = opponents[career.matchday % opponents.length] ?? opponents[0];
    const nextConfidence = Math.max(
      25,
      Math.min(99, career.boardConfidence + (result === 'W' ? 4 : result === 'D' ? 0 : -5))
    );
    const prizeBonus = result === 'W' ? 4 : result === 'D' ? 1 : 0;

    const updated: ManagerCareerState = {
      ...career,
      matchday: career.matchday + 1,
      budgetM: career.budgetM + prizeBonus,
      boardConfidence: nextConfidence,
      standings: nextStandings,
      matchHistory: [
        {
          matchday: career.matchday,
          opponentId: career.nextOpponentId,
          isHome: career.nextIsHome,
          goalsFor,
          goalsAgainst,
          result,
          scorers: liveMatch.scorers,
        },
        ...career.matchHistory,
      ],
      nextOpponentId: nextOpp.id,
      nextIsHome: career.matchday % 2 === 1,
    };

    persistCareer(updated);
    setLiveMatch(null);
    setStatusNotice(
      `Matchday ${career.matchday} complete (${goalsFor}–${goalsAgainst}). Board confidence ${nextConfidence}%.`
    );
  };

  const startNextSeason = () => {
    if (!career) return;
    const club = getClubById(career.clubId)!;
    const leagueClubs = CLUBS.filter((c) => c.leagueId === club.leagueId);
    const opponents = leagueClubs.filter((c) => c.id !== club.id);
    const sorted = [...career.standings].sort((a, b) => b.points - a.points);
    const finishedFirst = sorted[0]?.clubId === career.clubId;

    persistCareer({
      ...career,
      season: career.season + 1,
      matchday: 1,
      budgetM: career.budgetM + (finishedFirst ? 60 : 35),
      boardConfidence: finishedFirst ? 92 : 76,
      standings: leagueClubs.map((c) => ({
        clubId: c.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      })),
      matchHistory: [],
      nextOpponentId: opponents[0]?.id ?? CLUBS[1].id,
      nextIsHome: true,
    });
    setStatusNotice(
      `Season ${career.season + 1} underway! ${
        finishedFirst ? 'Champions bonus €60M added to budget.' : 'Fresh €35M board budget allocated.'
      }`
    );
  };

  // Setup Wizard View
  if (!career) {
    const leagueClubs = CLUBS.filter((c) => c.leagueId === setupLeagueId);
    const chosenClub = getClubById(setupClubId) ?? leagueClubs[0];

    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0E1116]">
          <ImageWithFallback
            src={IMAGES.managerDugout}
            alt="Manager on football pitch touchline"
            className="h-48 sm:h-56 w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/75 to-transparent" />
          <div className="relative z-10 -mt-20 p-6 sm:p-8">
            <p className="text-xs font-medium text-emerald-400">Football Manager Career Mode</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Step Into the Technical Area
            </h1>
            <p className="mt-2 text-sm text-zinc-300 max-w-2xl">
              Select a club across Europe’s top five leagues, customize your formation and pressing triggers, execute transfers, and manage live matchdays.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-xl border border-white/8 bg-[#0E1116] p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Manager Name
              </label>
              <input
                type="text"
                value={managerInput}
                onChange={(e) => setManagerInput(e.target.value)}
                placeholder="Enter your manager name..."
                className="w-full max-w-sm rounded-lg border border-white/10 bg-[#12161D] px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Select League</p>
              <div className="flex flex-wrap gap-1.5">
                {LEAGUES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setSetupLeagueId(l.id);
                      const firstClub = CLUBS.find((c) => c.leagueId === l.id);
                      if (firstClub) setSetupClubId(firstClub.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      setupLeagueId === l.id
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'bg-[#12161D] border border-white/8 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Choose Your Club</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leagueClubs.map((club) => {
                  const selected = chosenClub.id === club.id;
                  return (
                    <button
                      key={club.id}
                      onClick={() => setSetupClubId(club.id)}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                        selected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/8 bg-[#12161D] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ClubCrest club={club} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {club.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Budget €{club.transferBudgetM}M · OVR {club.overall}
                          </p>
                        </div>
                      </div>
                      {selected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-white/10 bg-[#0E1116] p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs font-medium text-emerald-400">Club Briefing</p>
              <div className="flex items-center gap-4">
                <ClubCrest club={chosenClub} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-white">{chosenClub.name}</h2>
                  <p className="text-xs text-zinc-400">
                    {chosenClub.stadium} · {getLeagueById(chosenClub.leagueId)?.name}
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t border-white/8 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Squad Overall</span>
                  <span className="font-mono font-semibold text-white">{chosenClub.overall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Attack / Mid / Def</span>
                  <span className="font-mono font-semibold text-zinc-200">
                    {chosenClub.attack} / {chosenClub.midfield} / {chosenClub.defense}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Transfer Budget</span>
                  <span className="font-mono font-semibold text-amber-400">
                    €{chosenClub.transferBudgetM}M
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => persistCareer(createInitialCareer(chosenClub.id, managerInput))}
              className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Sign Manager Contract
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Manager Career Dashboard
  const myClub = getClubById(career.clubId) ?? CLUBS[0];
  const myLeague = getLeagueById(myClub.leagueId) ?? LEAGUES[0];
  const nextOpp = getClubById(career.nextOpponentId) ?? CLUBS[1];
  const allPool = getAllPlayerPool(career);
  const mySquad = career.squadIds
    .map((id) => allPool.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const startingXI = career.startingIds
    .map((id) => mySquad.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const benchPlayers = mySquad.filter((p) => !career.startingIds.includes(p.id));

  const sortedStandings = [...career.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    return gdB - gdA;
  });
  const myPosition = sortedStandings.findIndex((r) => r.clubId === career.clubId) + 1;
  const seasonComplete = career.matchday > career.totalMatchdays;

  const avgXI = Math.round(
    startingXI.reduce((s, p) => s + p.rating, 0) / Math.max(1, startingXI.length)
  );

  const handlePlayerSwap = (playerId: string) => {
    if (!selectedSwapId) {
      setSelectedSwapId(playerId);
      return;
    }
    if (selectedSwapId === playerId) {
      setSelectedSwapId(null);
      return;
    }
    const aInXI = career.startingIds.includes(selectedSwapId);
    const bInXI = career.startingIds.includes(playerId);
    if (aInXI === bInXI) {
      setSelectedSwapId(playerId);
      return;
    }
    const xiId = aInXI ? selectedSwapId : playerId;
    const benchId = aInXI ? playerId : selectedSwapId;
    const nextStarting = career.startingIds.map((id) => (id === xiId ? benchId : id));
    persistCareer({ ...career, startingIds: nextStarting });
    setSelectedSwapId(null);
    setStatusNotice('Starting XI updated.');
  };

  const transferTargets = PLAYERS.filter((p) => {
    if (career.squadIds.includes(p.id)) return false;
    if (transferPos !== 'ALL' && p.positionGroup !== transferPos) return false;
    if (
      transferSearch.trim() &&
      !p.name.toLowerCase().includes(transferSearch.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => b.rating - a.rating);

  const signTransferPlayer = (player: Player) => {
    if (career.budgetM < player.marketValueM) {
      setStatusNotice(`Insufficient budget: €${player.marketValueM}M required.`);
      return;
    }
    persistCareer({
      ...career,
      budgetM: career.budgetM - player.marketValueM,
      squadIds: [...career.squadIds, player.id],
    });
    setStatusNotice(`Signed ${player.name} for €${player.marketValueM}M! Available on your bench.`);
  };

  const sellSquadPlayer = (player: Player) => {
    if (career.squadIds.length <= 12) {
      setStatusNotice('Cannot sell: minimum 12 squad players required.');
      return;
    }
    const nextSquad = career.squadIds.filter((id) => id !== player.id);
    let nextStarting = career.startingIds.filter((id) => id !== player.id);
    if (nextStarting.length < 11) {
      const replacement = nextSquad.find((id) => !nextStarting.includes(id));
      if (replacement) nextStarting = [...nextStarting, replacement];
    }
    persistCareer({
      ...career,
      budgetM: career.budgetM + player.marketValueM,
      squadIds: nextSquad,
      startingIds: nextStarting,
    });
    setStatusNotice(`Sold ${player.name} for €${player.marketValueM}M.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Manager Banner */}
      <div className="rounded-xl border border-white/10 bg-[#0E1116] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <ClubCrest club={myClub} size="lg" />
          <div>
            <p className="text-xs text-emerald-400">
              Season {career.season} · {myLeague.name} · Manager: {career.managerName}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{myClub.name}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] text-zinc-500">League Pos</p>
            <p className="font-mono text-lg font-bold text-white tabular-nums">#{myPosition}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">XI Rating</p>
            <p className="font-mono text-lg font-bold text-emerald-400 tabular-nums">{avgXI}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Budget</p>
            <p className="font-mono text-lg font-bold text-amber-400 tabular-nums">
              €{career.budgetM}M
            </p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Board Trust</p>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              {career.boardConfidence}%
            </p>
          </div>
          <button
            onClick={() => persistCareer(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-red-500/40 hover:text-red-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Career</span>
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-emerald-400 hover:text-white ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Club Hub & Matchday', icon: Shield },
          { id: 'tactics', label: 'Tactics & Starting XI', icon: Users },
          { id: 'transfers', label: 'Transfer Market', icon: Coins },
          { id: 'table', label: 'League Table', icon: Trophy },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'bg-[#0E1116] border border-white/8 text-zinc-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Matchday Modal/Panel */}
      {liveMatch && (
        <div className="rounded-xl border border-emerald-500/40 bg-[#10161E] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              {liveMatch.finished
                ? 'FULL TIME'
                : `LIVE MATCHDAY ${career.matchday} · ${liveMatch.minute}′`}
            </span>
            <div className="flex items-center gap-2">
              {!liveMatch.finished && (
                <>
                  <span className="text-xs text-zinc-400">Live Mentality:</span>
                  {MENTALITIES.map((m) => (
                    <button
                      key={m}
                      onClick={() => persistCareer({ ...career, mentality: m })}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        career.mentality === m
                          ? 'bg-emerald-500 text-zinc-950 font-semibold'
                          : 'bg-white/5 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-12 py-3">
            <div className="flex flex-col items-center gap-2 text-center w-28">
              <ClubCrest club={career.nextIsHome ? myClub : nextOpp} size="lg" />
              <span className="text-sm font-semibold text-white truncate w-full">
                {(career.nextIsHome ? myClub : nextOpp).shortName}
              </span>
            </div>
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-white tabular-nums">
                {liveMatch.homeScore} – {liveMatch.awayScore}
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-400 tabular-nums">
                xG {liveMatch.homeXG.toFixed(2)} vs {liveMatch.awayXG.toFixed(2)} · Poss {liveMatch.possession}%
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center w-28">
              <ClubCrest club={career.nextIsHome ? nextOpp : myClub} size="lg" />
              <span className="text-sm font-semibold text-white truncate w-full">
                {(career.nextIsHome ? nextOpp : myClub).shortName}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#090C10] p-4 max-h-36 overflow-y-auto space-y-1.5 text-xs">
            {liveMatch.events.map((ev, i) => (
              <p key={i} className={ev.includes('GOAL') ? 'text-emerald-300 font-medium' : 'text-zinc-400'}>
                {ev}
              </p>
            ))}
          </div>

          {liveMatch.finished && (
            <div className="flex justify-end">
              <button
                onClick={commitMatchResult}
                className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
              >
                Confirm Result & Advance Calendar
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Club Hub */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-white/8 bg-[#0E1116] p-6 flex flex-col justify-between">
            {seasonComplete ? (
              <div className="space-y-4">
                <p className="text-xs font-medium text-amber-400">
                  Season {career.season} Complete
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {myPosition === 1
                    ? `${myClub.name} Are League Champions!`
                    : `Finished #${myPosition} in ${myLeague.name}`}
                </h2>
                <p className="text-sm text-zinc-400">
                  Review your final table standings or launch Season {career.season + 1} with a fresh board budget.
                </p>
                <button
                  onClick={startNextSeason}
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Begin Season {career.season + 1}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      Next Fixture · Matchday {career.matchday} of {career.totalMatchdays}
                    </span>
                    <span>{career.nextIsHome ? myClub.stadium : nextOpp.stadium}</span>
                  </div>

                  <div className="my-6 flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#12161D] p-5">
                    <div className="flex items-center gap-3">
                      <ClubCrest club={career.nextIsHome ? myClub : nextOpp} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {(career.nextIsHome ? myClub : nextOpp).shortName}
                        </p>
                        <p className="text-[11px] text-zinc-500">Home</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-zinc-500">VS</span>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {(career.nextIsHome ? nextOpp : myClub).shortName}
                        </p>
                        <p className="text-[11px] text-zinc-500">Away</p>
                      </div>
                      <ClubCrest club={career.nextIsHome ? nextOpp : myClub} size="md" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-zinc-400">
                    System: <strong className="text-white">{career.formation}</strong> ·{' '}
                    <strong className="text-emerald-400">{career.mentality}</strong>
                  </p>
                  <button
                    disabled={Boolean(liveMatch)}
                    onClick={startLiveMatch}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Play Matchday {career.matchday}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-5 rounded-xl border border-white/8 bg-[#0E1116] p-6">
            <h2 className="text-base font-semibold text-white mb-4">Recent Results</h2>
            {career.matchHistory.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">
                No matches played yet this season. Kick off Matchday 1 to build your record.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {career.matchHistory.map((m) => {
                  const opp = getClubById(m.opponentId);
                  return (
                    <div
                      key={m.matchday}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-[#12161D] px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono font-bold w-5 text-center rounded py-0.5 ${
                            m.result === 'W'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : m.result === 'D'
                              ? 'bg-zinc-700/50 text-zinc-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {m.result}
                        </span>
                        <span className="text-zinc-200 truncate">
                          MD {m.matchday} {m.isHome ? 'vs' : '@'} {opp?.shortName}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white tabular-nums shrink-0">
                        {m.goalsFor} – {m.goalsAgainst}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Tactics & Squad */}
      {tab === 'tactics' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 mr-1">Formation:</span>
              {FORMATIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => persistCareer({ ...career, formation: f })}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                    career.formation === f
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-[#12161D] text-zinc-300 border border-white/8 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 mr-1">Mentality:</span>
              {MENTALITIES.map((m) => (
                <button
                  key={m}
                  onClick={() => persistCareer({ ...career, mentality: m })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    career.mentality === m
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-[#12161D] text-zinc-300 border border-white/8 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-xl border border-white/8 bg-[#0E1116] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Starting XI</h2>
                <span className="text-xs text-zinc-400">
                  {selectedSwapId ? 'Select a bench player to swap' : 'Click a player to swap'}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {startingXI.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlayerSwap(p.id)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs rounded transition-colors ${
                      selectedSwapId === p.id
                        ? 'bg-emerald-500/20 text-white'
                        : 'hover:bg-white/5 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-bold w-8">{p.position}</span>
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono tabular-nums">
                      <span className="text-zinc-400">Age {p.age}</span>
                      <span className="font-bold text-emerald-400">OVR {p.rating}</span>
                      <ArrowLeftRight className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-white/8 bg-[#0E1116] p-5">
              <h2 className="text-sm font-semibold text-white mb-3">
                Bench & Reserves ({benchPlayers.length})
              </h2>
              <div className="divide-y divide-white/5">
                {benchPlayers.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded text-xs ${
                      selectedSwapId === p.id ? 'bg-emerald-500/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => handlePlayerSwap(p.id)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <span className="font-mono text-zinc-400 w-8">{p.position}</span>
                      <span className="font-medium text-white truncate">{p.name}</span>
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-zinc-200 tabular-nums">
                        {p.rating}
                      </span>
                      <button
                        onClick={() => sellSquadPlayer(p)}
                        className="text-[11px] text-amber-400 hover:text-amber-300"
                      >
                        Sell €{p.marketValueM}M
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Transfer Market */}
      {tab === 'transfers' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <input
              type="text"
              value={transferSearch}
              onChange={(e) => setTransferSearch(e.target.value)}
              placeholder="Scout world players by name..."
              className="w-full sm:max-w-xs rounded-lg border border-white/10 bg-[#12161D] px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {['ALL', 'FWD', 'MID', 'DEF', 'GK'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setTransferPos(pos)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    transferPos === pos
                      ? 'bg-emerald-500 text-zinc-950 font-semibold'
                      : 'bg-[#12161D] text-zinc-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-[#0E1116] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500 bg-[#11151C]">
                    <th className="py-3 pl-5 pr-3">Player</th>
                    <th className="py-3 px-2">Club</th>
                    <th className="py-3 px-2">Pos</th>
                    <th className="py-3 px-2 text-right font-mono">OVR</th>
                    <th className="py-3 px-2 text-right font-mono">Fee</th>
                    <th className="py-3 pl-2 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {transferTargets.map((p) => {
                    const c = getClubById(p.clubId);
                    const canAfford = career.budgetM >= p.marketValueM;
                    return (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="py-3 pl-5 pr-3 font-medium text-white">
                          {p.name}
                          <span className="ml-2 text-zinc-500 font-normal">Age {p.age}</span>
                        </td>
                        <td className="py-3 px-2 text-zinc-400">{c?.shortName}</td>
                        <td className="py-3 px-2 font-mono text-zinc-300">{p.position}</td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400 tabular-nums">
                          {p.rating}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-amber-400 tabular-nums">
                          €{p.marketValueM}M
                        </td>
                        <td className="py-3 pl-2 pr-5 text-right">
                          <button
                            disabled={!canAfford}
                            onClick={() => signTransferPlayer(p)}
                            className="rounded bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-950 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                          >
                            {canAfford ? 'Sign Player' : 'Over Budget'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: League Table */}
      {tab === 'table' && (
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              {myLeague.name} — Season {career.season}
            </h2>
            <span className="text-xs text-zinc-400">
              Matchday {Math.min(career.matchday, career.totalMatchdays)} / {career.totalMatchdays}
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-[11px] font-medium text-zinc-500">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-4">Club</th>
                <th className="py-2 px-2 text-right font-mono">MP</th>
                <th className="py-2 px-2 text-right font-mono">W</th>
                <th className="py-2 px-2 text-right font-mono">D</th>
                <th className="py-2 px-2 text-right font-mono">L</th>
                <th className="py-2 px-2 text-right font-mono">GD</th>
                <th className="py-2 pl-2 text-right font-mono">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sortedStandings.map((row, idx) => {
                const c = getClubById(row.clubId);
                if (!c) return null;
                const isMine = c.id === career.clubId;
                const gd = row.goalsFor - row.goalsAgainst;
                return (
                  <tr
                    key={row.clubId}
                    className={isMine ? 'bg-emerald-500/10' : 'hover:bg-white/5'}
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs text-zinc-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <ClubCrest club={c} size="xs" />
                        <span className={`font-medium ${isMine ? 'text-emerald-300' : 'text-white'}`}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-400 tabular-nums">
                      {row.played}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {row.won}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {row.drawn}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-300 tabular-nums">
                      {row.lost}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono text-sm font-bold text-white tabular-nums">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
