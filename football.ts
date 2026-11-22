export type RouteId =
  | 'home'
  | 'news'
  | 'leagues'
  | 'players'
  | 'quizzes'
  | 'manager'
  | 'player-career';

export type PositionGroup = 'FWD' | 'MID' | 'DEF' | 'GK';

export interface League {
  id: string;
  name: string;
  country: string;
  season: string;
  tierLabel: string;
  accentColor: string;
  championsLeagueSpots: number;
  europaLeagueSpots: number;
  relegationSpots: number;
}

export type FormResult = 'W' | 'D' | 'L';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  code: string;
  leagueId: string;
  city: string;
  stadium: string;
  capacity: number;
  manager: string;
  founded: number;
  primaryColor: string;
  secondaryColor: string;
  crestStyle: 'shield' | 'stripes' | 'diagonal' | 'circle' | 'chevron';
  attack: number;
  midfield: number;
  defense: number;
  overall: number;
  transferBudgetM: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: FormResult[];
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  xG: number;
  passAccuracy: number;
  keyPassesPer90: number;
  tacklesPer90: number;
  cleanSheets: number;
  avgRating: number;
}

export interface Player {
  id: string;
  name: string;
  clubId: string;
  nationality: string;
  age: number;
  position: string;
  positionGroup: PositionGroup;
  shirtNumber: number;
  preferredFoot: 'Right' | 'Left' | 'Both';
  rating: number;
  potential: number;
  marketValueM: number;
  wageK: number;
  contractUntil: number;
  attributes: PlayerAttributes;
  stats: PlayerStats;
}

export type NewsCategory =
  | 'Transfers'
  | 'Match Reports'
  | 'Tactical Analysis'
  | 'International';

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  category: NewsCategory;
  author: string;
  publishedAgo: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  relatedClubIds: string[];
  relatedPlayerIds: string[];
  paragraphs: string[];
  tacticalTakeaways: string[];
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'assist' | 'yellow' | 'sub';
  playerName: string;
  team: 'home' | 'away';
  detail?: string;
}

export interface MatchFixture {
  id: string;
  leagueId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'LIVE' | 'FT' | 'UPCOMING';
  minute?: number;
  kickoffLabel: string;
  venue: string;
  homePossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeXG?: number;
  awayXG?: number;
  events?: MatchEvent[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Standard' | 'Tactical' | 'Master';
}

export interface QuizPack {
  id: string;
  title: string;
  topic: string;
  description: string;
  questions: QuizQuestion[];
}

export type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2';
export type TacticalMentality = 'Balanced' | 'Gegenpress' | 'Counter-Attack' | 'Low Block';

export interface ManagerMatchRecord {
  matchday: number;
  opponentId: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: FormResult;
  scorers: string[];
}

export interface ManagerStandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface ManagerCareerState {
  clubId: string;
  managerName: string;
  season: number;
  matchday: number;
  totalMatchdays: number;
  budgetM: number;
  boardConfidence: number;
  formation: Formation;
  mentality: TacticalMentality;
  squadIds: string[];
  startingIds: string[];
  standings: ManagerStandingRow[];
  matchHistory: ManagerMatchRecord[];
  nextOpponentId: string;
  nextIsHome: boolean;
}

export type PlayerArchetype =
  | 'Clinical Finisher'
  | 'Deep-Lying Playmaker'
  | 'Box-to-Box Engine'
  | 'Ball-Playing Defender'
  | 'Sweeper Keeper';

export interface PlayerCareerHistoryEntry {
  season: number;
  clubName: string;
  leagueName: string;
  ovr: number;
  apps: number;
  goals: number;
  assists: number;
  avgRating: number;
  trophy?: string;
}

export interface PlayerCareerState {
  name: string;
  nationality: string;
  position: string;
  positionGroup: PositionGroup;
  preferredFoot: 'Right' | 'Left' | 'Both';
  shirtNumber: number;
  archetype: PlayerArchetype;
  clubId: string;
  age: number;
  season: number;
  matchday: number;
  ovr: number;
  xp: number;
  trainingPoints: number;
  stamina: number;
  morale: number;
  marketValueM: number;
  wageK: number;
  attributes: PlayerAttributes;
  seasonStats: {
    apps: number;
    goals: number;
    assists: number;
    avgRating: number;
    motm: number;
    cleanSheets: number;
  };
  careerLog: PlayerCareerHistoryEntry[];
  trophies: string[];
  recentEvents: string[];
}

export type TransferStatus = 'Confirmed' | 'Rumor';

export interface TransferUpdate {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  age: number;
  headshotUrl: string;
  fromClubId: string;
  toClubId: string;
  status: TransferStatus;
  stageLabel: string;
  likelihoodPct: number;
  feeLabel: string;
  contractTerm: string;
  summary: string;
  updatedAgo: string;
}

