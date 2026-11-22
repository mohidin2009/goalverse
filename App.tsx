import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Briefcase,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Trophy,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { RouteId } from './types/football';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HomeDashboard } from './pages/HomeDashboard';
import { NewsPage } from './pages/NewsPage';
import { LeaguesClubsPage } from './pages/LeaguesClubsPage';
import { PlayersPage } from './pages/PlayersPage';
import { QuizzesPage } from './pages/QuizzesPage';
import {
  MANAGER_SAVE_KEY,
  ManagerCareerPage,
} from './pages/ManagerCareerPage';
import {
  PLAYER_CAREER_KEY,
  PlayerCareerPage,
} from './pages/PlayerCareerPage';

interface NavItem {
  id: RouteId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home Dashboard', icon: LayoutDashboard },
  { id: 'news', label: 'World News', icon: Newspaper },
  { id: 'leagues', label: 'Leagues & Clubs', icon: Trophy },
  { id: 'players', label: 'Players & Stats', icon: Users },
  { id: 'quizzes', label: 'Football Quizzes', icon: HelpCircle },
  { id: 'manager', label: 'Manager Career', icon: Briefcase },
  { id: 'player-career', label: 'Player Career', icon: UserCheck },
];

function getInitialRoute(): RouteId {
  const hash = window.location.hash.replace('#', '') as RouteId;
  if (NAV_ITEMS.some((n) => n.id === hash)) return hash;
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<RouteId>(getInitialRoute);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Deep-link states passed down to child pages
  const [targetClubId, setTargetClubId] = useState<string | null>(null);
  const [targetLeagueId, setTargetLeagueId] = useState<string | null>(null);
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [targetArticleId, setTargetArticleId] = useState<string | null>(null);
  const [targetQuizId, setTargetQuizId] = useState<string | null>(null);
  const [targetManagerClubId, setTargetManagerClubId] = useState<string | null>(null);

  const [hasManagerSave, setHasManagerSave] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(MANAGER_SAVE_KEY));
    } catch {
      return false;
    }
  });
  const [hasPlayerSave, setHasPlayerSave] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(PLAYER_CAREER_KEY));
    } catch {
      return false;
    }
  });

  const navigate = useCallback((nextRoute: RouteId) => {
    setRoute(nextRoute);
    setMobileNavOpen(false);
    window.location.hash = nextRoute;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as RouteId;
      if (NAV_ITEMS.some((n) => n.id === hash)) {
        setRoute(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openClub = useCallback(
    (clubId: string) => {
      setTargetClubId(clubId);
      setTargetLeagueId(null);
      navigate('leagues');
    },
    [navigate]
  );

  const openLeague = useCallback(
    (leagueId: string) => {
      setTargetLeagueId(leagueId);
      setTargetClubId(null);
      navigate('leagues');
    },
    [navigate]
  );

  const openPlayer = useCallback(
    (playerId: string) => {
      setTargetPlayerId(playerId);
      navigate('players');
    },
    [navigate]
  );

  const openArticle = useCallback(
    (articleId: string) => {
      setTargetArticleId(articleId);
      navigate('news');
    },
    [navigate]
  );

  const openQuiz = useCallback(
    (quizId: string) => {
      setTargetQuizId(quizId);
      navigate('quizzes');
    },
    [navigate]
  );

  const startManagerWithClub = useCallback(
    (clubId: string) => {
      setTargetManagerClubId(clubId);
      navigate('manager');
    },
    [navigate]
  );

  const currentNav = NAV_ITEMS.find((n) => n.id === route) ?? NAV_ITEMS[0];

  const primaryCta =
    route === 'manager'
      ? { label: 'Player Career', action: () => navigate('player-career') }
      : { label: hasManagerSave ? 'Resume Manager' : 'Manager Mode', action: () => navigate('manager') };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#07080A] text-[#F3F4F6] flex">
        {/* Desktop Persistent Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-white/8 bg-[#0A0C10]">
          <div className="flex h-14 items-center px-6 border-b border-white/8">
            <button
              onClick={() => navigate('home')}
              className="font-display text-base font-extrabold tracking-wider text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors"
            >
              FOOTBALL UNIVERSE
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Primary Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = route === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/8 p-4 space-y-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-white/8 bg-[#10131A] px-3 py-2 text-xs text-zinc-400 hover:border-white/20 hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <span>Quick Search</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">⌘K</span>
            </button>
            <p className="px-1 text-[11px] text-zinc-500">
              2026/27 Season · World Football
            </p>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/75 backdrop-blur-sm flex"
            onClick={() => setMobileNavOpen(false)}
          >
            <aside
              className="w-64 bg-[#0A0C10] border-r border-white/10 h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-14 items-center justify-between px-5 border-b border-white/8">
                <span className="font-display text-sm font-extrabold tracking-wider text-white whitespace-nowrap">
                  FOOTBALL UNIVERSE
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = route === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Viewport Column */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Top Header Bar (56px compact) */}
          <header className="sticky top-0 z-30 h-14 border-b border-white/8 bg-[#07080A]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="lg:hidden rounded-lg p-1.5 text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                <span className="lg:hidden font-display font-bold tracking-wider text-white whitespace-nowrap">
                  FOOTBALL UNIVERSE
                </span>
                <span className="hidden lg:inline text-zinc-500 whitespace-nowrap">
                  Football Universe
                </span>
                <span className="hidden lg:inline text-zinc-600">/</span>
                <span className="hidden lg:inline font-medium text-white truncate">
                  {currentNav.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search football universe"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0E1116] px-3 py-1.5 text-xs text-zinc-400 hover:border-white/25 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Search className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Search players, clubs, news...</span>
                <span className="sm:hidden">Search</span>
              </button>

              <button
                onClick={primaryCta.action}
                className="hidden sm:inline-flex items-center rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                {primaryCta.label}
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1360px] w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={route}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                {route === 'home' && (
                  <HomeDashboard
                    onNavigate={navigate}
                    onOpenClub={openClub}
                    onOpenPlayer={openPlayer}
                    onOpenArticle={openArticle}
                    hasManagerSave={hasManagerSave}
                    hasPlayerSave={hasPlayerSave}
                  />
                )}
                {route === 'news' && (
                  <NewsPage
                    initialArticleId={targetArticleId}
                    onClearInitialArticle={() => setTargetArticleId(null)}
                    onOpenClub={openClub}
                    onOpenPlayer={openPlayer}
                  />
                )}
                {route === 'leagues' && (
                  <LeaguesClubsPage
                    initialLeagueId={targetLeagueId}
                    initialClubId={targetClubId}
                    onClearInitial={() => {
                      setTargetClubId(null);
                      setTargetLeagueId(null);
                    }}
                    onOpenPlayer={openPlayer}
                    onStartManagerWithClub={startManagerWithClub}
                  />
                )}
                {route === 'players' && (
                  <PlayersPage
                    initialPlayerId={targetPlayerId}
                    onClearInitial={() => setTargetPlayerId(null)}
                    onOpenClub={openClub}
                  />
                )}
                {route === 'quizzes' && (
                  <QuizzesPage
                    initialQuizId={targetQuizId}
                    onClearInitial={() => setTargetQuizId(null)}
                  />
                )}
                {route === 'manager' && (
                  <ManagerCareerPage
                    initialClubId={targetManagerClubId}
                    onClearInitial={() => setTargetManagerClubId(null)}
                    onSaveChange={setHasManagerSave}
                  />
                )}
                {route === 'player-career' && (
                  <PlayerCareerPage onSaveChange={setHasPlayerSave} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Quiet Editorial Footer */}
          <footer className="border-t border-white/8 px-4 sm:px-6 lg:px-8 py-5 text-xs text-zinc-500">
            <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span>FOOTBALL UNIVERSE · World Football Dashboard & Career Hub</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('leagues')}
                  className="hover:text-zinc-300 transition-colors"
                >
                  Leagues
                </button>
                <button
                  onClick={() => navigate('players')}
                  className="hover:text-zinc-300 transition-colors"
                >
                  Players
                </button>
                <button
                  onClick={() => navigate('quizzes')}
                  className="hover:text-zinc-300 transition-colors"
                >
                  Quizzes
                </button>
                <button
                  onClick={() => navigate('manager')}
                  className="hover:text-zinc-300 transition-colors"
                >
                  Manager Mode
                </button>
              </div>
            </div>
          </footer>
        </div>

        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectClub={openClub}
          onSelectPlayer={openPlayer}
          onSelectLeague={openLeague}
          onSelectArticle={openArticle}
          onSelectQuiz={openQuiz}
        />
      </div>
    </MotionConfig>
  );
}
