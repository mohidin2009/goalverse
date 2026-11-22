import React, { useMemo, useState } from 'react';
import {
  Award,
  Dumbbell,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  UserPlus,
} from 'lucide-react';
import {
  CLUBS,
  LEAGUES,
  getClubById,
  getLeagueById,
} from '../data/footballData';
import {
  PlayerArchetype,
  PlayerAttributes,
  PlayerCareerState,
  PositionGroup,
} from '../types/football';
import { ClubCrest } from '../components/ClubCrest';
import { RadarChart } from '../components/RadarChart';

interface PlayerCareerPageProps {
  onSaveChange: (hasSave: boolean) => void;
}

export const PLAYER_CAREER_KEY = 'fu_player_career_v1';

const ARCHETYPES: {
  name: PlayerArchetype;
  pos: string;
  group: PositionGroup;
  description: string;
  base: PlayerAttributes;
}[] = [
  {
    name: 'Clinical Finisher',
    pos: 'ST',
    group: 'FWD',
    description: 'Explosive burst in the box with razor-sharp ball striking and off-shoulder movement.',
    base: { pace: 79, shooting: 78, passing: 64, dribbling: 74, defending: 34, physical: 73 },
  },
  {
    name: 'Deep-Lying Playmaker',
    pos: 'CAM',
    group: 'MID',
    description: 'Line-breaking vision, tight-space ball mastery, and weighted through-balls.',
    base: { pace: 72, shooting: 69, passing: 80, dribbling: 78, defending: 56, physical: 65 },
  },
  {
    name: 'Box-to-Box Engine',
    pos: 'CM',
    group: 'MID',
    description: 'Relentless stamina covering both penalty boxes with strong tackling and late runs.',
    base: { pace: 74, shooting: 68, passing: 75, dribbling: 74, defending: 72, physical: 77 },
  },
  {
    name: 'Ball-Playing Defender',
    pos: 'CB',
    group: 'DEF',
    description: 'Commanding aerial duel winner who steps into midfield to initiate clean build-up.',
    base: { pace: 73, shooting: 45, passing: 72, dribbling: 66, defending: 79, physical: 78 },
  },
  {
    name: 'Sweeper Keeper',
    pos: 'GK',
    group: 'GK',
    description: 'Agile shot-stopper comfortable sweeping behind high lines and launching counters.',
    base: { pace: 58, shooting: 40, passing: 76, dribbling: 56, defending: 79, physical: 75 },
  },
];

function computeOvr(attrs: PlayerAttributes, group: PositionGroup): number {
  if (group === 'FWD') {
    return Math.round(
      attrs.shooting * 0.34 +
        attrs.pace * 0.24 +
        attrs.dribbling * 0.24 +
        attrs.passing * 0.1 +
        attrs.physical * 0.08
    );
  }
  if (group === 'MID') {
    return Math.round(
      attrs.passing * 0.32 +
        attrs.dribbling * 0.26 +
        attrs.shooting * 0.15 +
        attrs.pace * 0.12 +
        attrs.defending * 0.15
    );
  }
  if (group === 'DEF') {
    return Math.round(
      attrs.defending * 0.38 +
        attrs.physical * 0.26 +
        attrs.pace * 0.18 +
        attrs.passing * 0.12 +
        attrs.dribbling * 0.06
    );
  }
  return Math.round(attrs.defending * 0.52 + attrs.passing * 0.24 + attrs.physical * 0.24);
}

interface MatchScenario {
  minute: number;
  headline: string;
  options: {
    label: string;
    statKey: keyof PlayerAttributes;
    goalBonus: number;
    assistBonus: number;
    ratingDelta: number;
  }[];
}

function generateScenario(group: PositionGroup, opponentName: string): MatchScenario {
  if (group === 'FWD') {
    return {
      minute: 74,
      headline: `74′ against ${opponentName}: A threaded pass splits their center-backs as you sprint into the box.`,
      options: [
        { label: 'Curl a finesse shot into the far corner', statKey: 'shooting', goalBonus: 0.72, assistBonus: 0.05, ratingDelta: 0.9 },
        { label: 'Cut inside the defender and square it across goal', statKey: 'dribbling', goalBonus: 0.15, assistBonus: 0.68, ratingDelta: 0.7 },
        { label: 'Sprint past the keeper at the near post', statKey: 'pace', goalBonus: 0.58, assistBonus: 0.1, ratingDelta: 0.8 },
      ],
    };
  }
  if (group === 'MID') {
    return {
      minute: 68,
      headline: `68′ against ${opponentName}: You pick up possession between the lines with two defenders closing in.`,
      options: [
        { label: 'Slide a first-time through-ball in behind', statKey: 'passing', goalBonus: 0.1, assistBonus: 0.72, ratingDelta: 0.85 },
        { label: 'Drop a shoulder and drive into the shooting zone', statKey: 'dribbling', goalBonus: 0.48, assistBonus: 0.22, ratingDelta: 0.8 },
        { label: 'Unleash a dipped half-volley from 22 yards', statKey: 'shooting', goalBonus: 0.55, assistBonus: 0.05, ratingDelta: 0.9 },
      ],
    };
  }
  if (group === 'DEF') {
    return {
      minute: 81,
      headline: `81′ against ${opponentName}: Their fastest forward breaks clear on the counter.`,
      options: [
        { label: 'Time a clean recovery slide tackle on the ball', statKey: 'defending', goalBonus: 0.05, assistBonus: 0.15, ratingDelta: 0.95 },
        { label: 'Outmuscle them shoulder-to-shoulder & launch a pass', statKey: 'physical', goalBonus: 0.05, assistBonus: 0.35, ratingDelta: 0.8 },
        { label: 'Track the sprint stride-for-stride to block the angle', statKey: 'pace', goalBonus: 0.05, assistBonus: 0.1, ratingDelta: 0.75 },
      ],
    };
  }
  return {
    minute: 86,
    headline: `86′ against ${opponentName}: A deflected strike dips sharply toward your top corner.`,
    options: [
      { label: 'Tip it over the bar with a full-stretch reflex dive', statKey: 'defending', goalBonus: 0, assistBonus: 0, ratingDelta: 1.0 },
      { label: 'Catch cleanly and immediately bowl a counter pass', statKey: 'passing', goalBonus: 0, assistBonus: 0.35, ratingDelta: 0.9 },
      { label: 'Command the six-yard box and claim the follow-up', statKey: 'physical', goalBonus: 0, assistBonus: 0, ratingDelta: 0.8 },
    ],
  };
}

export const PlayerCareerPage: React.FC<PlayerCareerPageProps> = ({ onSaveChange }) => {
  const [career, setCareer] = useState<PlayerCareerState | null>(() => {
    try {
      const raw = localStorage.getItem(PLAYER_CAREER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Creator Wizard state
  const [name, setName] = useState('Kieran Vance');
  const [nationality, setNationality] = useState('England');
  const [foot, setFoot] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [shirtNumber, setShirtNumber] = useState(17);
  const [archetypeIdx, setArchetypeIdx] = useState(0);
  const [leagueId, setLeagueId] = useState('premier-league');
  const [clubId, setClubId] = useState('aston-villa');

  // Interactive Match Decision modal
  const [pendingScenario, setPendingScenario] = useState<{
    opponentId: string;
    scenario: MatchScenario;
  } | null>(null);

  const persist = (next: PlayerCareerState | null) => {
    setCareer(next);
    onSaveChange(Boolean(next));
    try {
      if (next) localStorage.setItem(PLAYER_CAREER_KEY, JSON.stringify(next));
      else localStorage.removeItem(PLAYER_CAREER_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const chosenArchetype = ARCHETYPES[archetypeIdx];
  const startingOvr = computeOvr(chosenArchetype.base, chosenArchetype.group);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const club = getClubById(clubId) ?? CLUBS[0];
    const initial: PlayerCareerState = {
      name: name.trim() || 'Kieran Vance',
      nationality: nationality.trim() || 'England',
      position: chosenArchetype.pos,
      positionGroup: chosenArchetype.group,
      preferredFoot: foot,
      shirtNumber,
      archetype: chosenArchetype.name,
      clubId: club.id,
      age: 19,
      season: 1,
      matchday: 1,
      ovr: startingOvr,
      xp: 0,
      trainingPoints: 3,
      stamina: 95,
      morale: 85,
      marketValueM: Math.max(8, Math.round((startingOvr - 66) * 2.5)),
      wageK: 45,
      attributes: { ...chosenArchetype.base },
      seasonStats: {
        apps: 0,
        goals: 0,
        assists: 0,
        avgRating: 0,
        motm: 0,
        cleanSheets: 0,
      },
      careerLog: [],
      trophies: [],
      recentEvents: [`Signed rookie contract with ${club.name} as #${shirtNumber} (${chosenArchetype.pos}).`],
    };
    persist(initial);
  };

  const transferOffers = useMemo(() => {
    if (!career) return [];
    return CLUBS.filter(
      (c) => c.id !== career.clubId && c.overall <= career.ovr + 6 && c.overall >= career.ovr - 2
    ).slice(0, 3);
  }, [career]);

  // Creator Wizard
  if (!career) {
    const leagueClubs = CLUBS.filter((c) => c.leagueId === leagueId);
    const selectedClub = getClubById(clubId) ?? leagueClubs[0];

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-emerald-400">Player Career Creator</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your Own Football Player
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Design your custom footballer, train attributes week by week, make decisive matchday plays, and earn moves to Europe’s biggest clubs.
          </p>
        </div>

        <form onSubmit={handleCreatePlayer} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-white/8 bg-[#0E1116] p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Player Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#12161D] px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#12161D] px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Preferred Foot
                </label>
                <div className="flex gap-1.5">
                  {(['Right', 'Left', 'Both'] as const).map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFoot(f)}
                      className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                        foot === f
                          ? 'bg-emerald-500 text-zinc-950 font-semibold'
                          : 'bg-[#12161D] border border-white/8 text-zinc-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Jersey Number
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={shirtNumber}
                  onChange={(e) => setShirtNumber(Number(e.target.value) || 10)}
                  className="w-full rounded-lg border border-white/10 bg-[#12161D] px-3.5 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Role & Archetype</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ARCHETYPES.map((arch, idx) => (
                  <button
                    type="button"
                    key={arch.name}
                    onClick={() => setArchetypeIdx(idx)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      archetypeIdx === idx
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/8 bg-[#12161D] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{arch.name}</span>
                      <span className="font-mono text-emerald-400">{arch.pos}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                      {arch.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Starting League
                </label>
                <select
                  value={leagueId}
                  onChange={(e) => {
                    setLeagueId(e.target.value);
                    const c = CLUBS.find((item) => item.leagueId === e.target.value);
                    if (c) setClubId(c.id);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-[#12161D] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {LEAGUES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Starting Club
                </label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#12161D] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {leagueClubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (OVR {c.overall})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Live Player Card Preview */}
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0E1116] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 font-mono text-2xl font-bold text-emerald-400">
                    {startingOvr}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{name || 'New Prospect'}</h2>
                    <p className="text-xs text-zinc-400">
                      #{shirtNumber} · {chosenArchetype.pos} · {nationality} · Age 19
                    </p>
                  </div>
                </div>
                <ClubCrest club={selectedClub} size="md" />
              </div>

              <div className="mt-5 flex justify-center">
                <RadarChart primary={chosenArchetype.base} size={236} />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Begin Pro Career</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Active Player Career Dashboard
  const myClub = getClubById(career.clubId) ?? CLUBS[0];
  const myLeague = getLeagueById(myClub.leagueId) ?? LEAGUES[0];
  const seasonComplete = career.matchday > 12;

  const launchMatchday = () => {
    const opponents = CLUBS.filter((c) => c.leagueId === myClub.leagueId && c.id !== myClub.id);
    const opp = opponents[career.matchday % opponents.length] ?? CLUBS[1];
    setPendingScenario({
      opponentId: opp.id,
      scenario: generateScenario(career.positionGroup, opp.shortName),
    });
  };

  const resolveMatchDecision = (optionIdx: number) => {
    if (!pendingScenario) return;
    const opt = pendingScenario.scenario.options[optionIdx];
    const opp = getClubById(pendingScenario.opponentId)!;
    const statVal = career.attributes[opt.statKey];
    const successProb = Math.min(0.92, Math.max(0.35, (statVal - 55) / 40));
    const succeeded = Math.random() < successProb;

    const scoredGoal = succeeded && Math.random() < opt.goalBonus ? 1 : 0;
    const madeAssist = succeeded && Math.random() < opt.assistBonus ? 1 : 0;
    const cleanSheet =
      (career.positionGroup === 'DEF' || career.positionGroup === 'GK') && succeeded ? 1 : 0;

    const matchRating = Number(
      Math.min(
        9.9,
        Math.max(
          5.8,
          6.5 + (succeeded ? opt.ratingDelta : -0.3) + (scoredGoal * 0.8 + madeAssist * 0.5)
        )
      ).toFixed(1)
    );
    const isMotm = matchRating >= 8.4;

    const prevApps = career.seasonStats.apps;
    const nextAvg =
      prevApps === 0
        ? matchRating
        : Number(((career.seasonStats.avgRating * prevApps + matchRating) / (prevApps + 1)).toFixed(2));

    const summary = `MD ${career.matchday} vs ${opp.shortName}: ${
      succeeded ? 'Clutch play!' : 'Close effort.'
    } Rating ${matchRating}${scoredGoal ? ' · 1 Goal' : ''}${madeAssist ? ' · 1 Assist' : ''}${
      isMotm ? ' · MOTM' : ''
    }`;

    persist({
      ...career,
      matchday: career.matchday + 1,
      trainingPoints: career.trainingPoints + (succeeded ? 2 : 1),
      xp: career.xp + (succeeded ? 45 : 25),
      stamina: Math.max(60, career.stamina - 6),
      morale: Math.min(99, career.morale + (succeeded ? 4 : -2)),
      seasonStats: {
        apps: prevApps + 1,
        goals: career.seasonStats.goals + scoredGoal,
        assists: career.seasonStats.assists + madeAssist,
        avgRating: nextAvg,
        motm: career.seasonStats.motm + (isMotm ? 1 : 0),
        cleanSheets: career.seasonStats.cleanSheets + cleanSheet,
      },
      recentEvents: [summary, ...career.recentEvents].slice(0, 8),
    });
    setPendingScenario(null);
  };

  const trainAttribute = (key: keyof PlayerAttributes) => {
    if (career.trainingPoints <= 0 || career.attributes[key] >= 99) return;
    const nextAttrs = {
      ...career.attributes,
      [key]: Math.min(99, career.attributes[key] + 2),
    };
    const nextOvr = computeOvr(nextAttrs, career.positionGroup);
    const nextVal = Math.max(8, Math.round((nextOvr - 66) * 2.9 + career.seasonStats.goals * 0.8));

    persist({
      ...career,
      trainingPoints: career.trainingPoints - 1,
      stamina: Math.min(100, career.stamina + 4),
      attributes: nextAttrs,
      ovr: nextOvr,
      marketValueM: nextVal,
      recentEvents: [
        `Training session improved ${key.toUpperCase()} to ${nextAttrs[key]}.`,
        ...career.recentEvents,
      ].slice(0, 8),
    });
  };

  const acceptTransfer = (targetClubId: string) => {
    const club = getClubById(targetClubId);
    if (!club) return;
    persist({
      ...career,
      clubId: club.id,
      wageK: Math.round(career.wageK * 1.45),
      morale: 95,
      recentEvents: [`Transferred to ${club.name} on €${Math.round(career.wageK * 1.45)}K/wk!`, ...career.recentEvents].slice(0, 8),
    });
  };

  const finishSeasonAndAdvance = () => {
    const wonTrophy =
      myClub.overall >= 84 && career.seasonStats.avgRating >= 7.3
        ? `${myLeague.name} Title`
        : career.seasonStats.goals >= 10
        ? 'Golden Boot Contender'
        : undefined;

    persist({
      ...career,
      age: career.age + 1,
      season: career.season + 1,
      matchday: 1,
      stamina: 100,
      trainingPoints: career.trainingPoints + 4,
      seasonStats: { apps: 0, goals: 0, assists: 0, avgRating: 0, motm: 0, cleanSheets: 0 },
      trophies: wonTrophy ? [...career.trophies, `S${career.season} ${wonTrophy}`] : career.trophies,
      careerLog: [
        {
          season: career.season,
          clubName: myClub.shortName,
          leagueName: myLeague.name,
          ovr: career.ovr,
          apps: career.seasonStats.apps,
          goals: career.seasonStats.goals,
          assists: career.seasonStats.assists,
          avgRating: career.seasonStats.avgRating,
          trophy: wonTrophy,
        },
        ...career.careerLog,
      ],
      recentEvents: [`Season ${career.season + 1} begins! +4 Off-Season Training Points.`, ...career.recentEvents].slice(0, 8),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-white/10 bg-[#0E1116] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 font-mono text-2xl font-bold text-emerald-400 tabular-nums shrink-0">
            {career.ovr}
          </div>
          <div>
            <p className="text-xs text-emerald-400">
              Season {career.season} · #{career.shirtNumber} {career.position} · {career.archetype}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{career.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
              <ClubCrest club={myClub} size="xs" />
              <span>{myClub.name}</span>
              <span>· Age {career.age}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] text-zinc-500">Market Value</p>
            <p className="font-mono text-lg font-bold text-amber-400 tabular-nums">
              €{career.marketValueM}M
            </p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Weekly Wage</p>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              €{career.wageK}K
            </p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Training Pts</p>
            <p className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
              {career.trainingPoints}
            </p>
          </div>
          <button
            onClick={() => persist(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-red-500/40 hover:text-red-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Player</span>
          </button>
        </div>
      </div>

      {/* Interactive Match Decision Modal */}
      {pendingScenario && (
        <div className="rounded-xl border border-emerald-500/40 bg-[#10161E] p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>MATCHDAY {career.matchday} · KEY MOMENT</span>
            <span>vs {getClubById(pendingScenario.opponentId)?.name}</span>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {pendingScenario.scenario.headline}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingScenario.scenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => resolveMatchDecision(idx)}
                className="rounded-lg border border-white/10 bg-[#141A23] p-4 text-left hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors"
              >
                <p className="text-xs font-semibold text-white">{opt.label}</p>
                <p className="mt-2 font-mono text-[11px] text-emerald-400">
                  Uses {opt.statKey.toUpperCase()} ({career.attributes[opt.statKey]})
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Matchday + Season Stats + Training */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-6">
            {seasonComplete ? (
              <div className="space-y-4">
                <p className="text-xs font-medium text-amber-400">
                  Season {career.season} Complete (12/12 Matches)
                </p>
                <h2 className="text-xl font-bold text-white">End-of-Season Review</h2>
                <p className="text-xs text-zinc-400">
                  Finished with {career.seasonStats.goals} goals, {career.seasonStats.assists} assists, and a {career.seasonStats.avgRating} average match rating.
                </p>
                <button
                  onClick={finishSeasonAndAdvance}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Archive Season & Start Year {career.season + 1}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-400">
                    Next Match · Fixture {career.matchday} of 12
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Step onto the pitch for {myClub.shortName}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Make decisive tactical choices to earn Match Rating, Goals, and Training Points.
                  </p>
                </div>
                <button
                  disabled={Boolean(pendingScenario)}
                  onClick={launchMatchday}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Matchday {career.matchday}</span>
                </button>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-white/8 pt-5">
              <div>
                <p className="text-[11px] text-zinc-500">Apps</p>
                <p className="font-mono text-lg font-bold text-white tabular-nums">
                  {career.seasonStats.apps}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Goals</p>
                <p className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
                  {career.seasonStats.goals}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Assists</p>
                <p className="font-mono text-lg font-bold text-white tabular-nums">
                  {career.seasonStats.assists}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Avg Rating</p>
                <p className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                  {career.seasonStats.avgRating ? career.seasonStats.avgRating.toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">MOTM</p>
                <p className="font-mono text-lg font-bold text-white tabular-nums">
                  {career.seasonStats.motm}
                </p>
              </div>
            </div>
          </div>

          {/* Training Ground */}
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Training Ground</h2>
              </div>
              <span className="font-mono text-xs text-emerald-400">
                {career.trainingPoints} Points Available
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(career.attributes) as (keyof PlayerAttributes)[]).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-white/8 bg-[#12161D] px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-300 capitalize">{key}</p>
                    <p className="font-mono text-sm font-bold text-white tabular-nums">
                      {career.attributes[key]}
                    </p>
                  </div>
                  <button
                    disabled={career.trainingPoints <= 0 || career.attributes[key] >= 99}
                    onClick={() => trainAttribute(key)}
                    className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-zinc-950 disabled:opacity-40 transition-colors"
                  >
                    +2 Train
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Offers */}
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Club Transfer Offers</h2>
            </div>
            {transferOffers.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Train your OVR higher to attract fresh transfer interest across Europe.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {transferOffers.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-lg border border-white/8 bg-[#12161D] p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <ClubCrest club={club} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {club.shortName}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {getLeagueById(club.leagueId)?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => acceptTransfer(club.id)}
                      className="w-full rounded bg-white/10 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
                    >
                      Accept €{Math.round(career.wageK * 1.45)}K/wk
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Radar & Career Log */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-white self-start mb-3">
              Attribute Radar Profile
            </h2>
            <RadarChart primary={career.attributes} primaryLabel={career.name} size={236} />
          </div>

          <div className="rounded-xl border border-white/8 bg-[#0E1116] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Career Feed & Milestones</h2>
            </div>
            <div className="space-y-2 text-xs">
              {career.recentEvents.map((ev, i) => (
                <p key={i} className="text-zinc-300 border-b border-white/5 pb-2">
                  {ev}
                </p>
              ))}
            </div>

            {career.trophies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/8">
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" /> Honours
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-200">
                  {career.trophies.map((t, idx) => (
                    <span key={idx}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {career.careerLog.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
                <p className="text-xs font-semibold text-zinc-400">Previous Seasons</p>
                {career.careerLog.map((entry) => (
                  <div
                    key={entry.season}
                    className="flex items-center justify-between text-xs text-zinc-300 font-mono tabular-nums"
                  >
                    <span className="font-sans">
                      S{entry.season} · {entry.clubName}
                    </span>
                    <span>
                      {entry.goals}G {entry.assists}A · {entry.avgRating}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
