import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Newspaper,
  Search,
  Shield,
  Trophy,
  User,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  CLUBS,
  LEAGUES,
  NEWS_ARTICLES,
  PLAYERS,
  QUIZ_PACKS,
  getClubById,
  getLeagueById,
} from '../data/footballData';
import { ClubCrest } from './ClubCrest';

interface GlobalSearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectClub: (clubId: string) => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectLeague: (leagueId: string) => void;
  onSelectArticle: (articleId: string) => void;
  onSelectQuiz: (quizId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectClub,
  onSelectPlayer,
  onSelectLeague,
  onSelectArticle,
  onSelectQuiz,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) {
      return {
        players: PLAYERS.slice(0, 4),
        clubs: CLUBS.slice(0, 4),
        leagues: LEAGUES.slice(0, 3),
        articles: NEWS_ARTICLES.slice(0, 3),
        quizzes: QUIZ_PACKS,
      };
    }
    return {
      players: PLAYERS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q)
      ).slice(0, 6),
      clubs: CLUBS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.manager.toLowerCase().includes(q)
      ).slice(0, 6),
      leagues: LEAGUES.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q)
      ),
      articles: NEWS_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q)
      ).slice(0, 4),
      quizzes: QUIZ_PACKS.filter(
        (pack) =>
          pack.title.toLowerCase().includes(q) ||
          pack.topic.toLowerCase().includes(q)
      ),
    };
  }, [q]);

  if (!isOpen) return null;

  const totalMatches =
    results.players.length +
    results.clubs.length +
    results.leagues.length +
    results.articles.length +
    results.quizzes.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 pt-16 sm:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Football Search"
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0E1116] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-4 w-4 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players, clubs, leagues, managers, news, or quizzes..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {totalMatches === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-zinc-300">
                No matches found for “{query}”
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try searching for clubs like Arsenal, Real Madrid, players like Haaland, Yamal, or topics like Tactics.
              </p>
            </div>
          ) : (
            <>
              {results.players.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{q ? 'Players' : 'Top Rated Players'}</span>
                  </div>
                  <div className="divide-y divide-white/5 rounded-lg border border-white/8 bg-[#12161D]">
                    {results.players.map((player) => {
                      const club = getClubById(player.clubId);
                      return (
                        <button
                          key={player.id}
                          onClick={() => {
                            onSelectPlayer(player.id);
                            onClose();
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {club && <ClubCrest club={club} size="xs" />}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {player.name}
                              </p>
                              <p className="text-xs text-zinc-400 truncate">
                                {player.position} · {club?.shortName} · {player.nationality}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                              OVR {player.rating}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.clubs.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{q ? 'Clubs' : 'Featured Clubs'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.clubs.map((club) => {
                      const league = getLeagueById(club.leagueId);
                      return (
                        <button
                          key={club.id}
                          onClick={() => {
                            onSelectClub(club.id);
                            onClose();
                          }}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-[#12161D] px-3.5 py-2.5 text-left hover:border-emerald-500/40 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ClubCrest club={club} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {club.name}
                              </p>
                              <p className="text-xs text-zinc-400 truncate">
                                {league?.name} · {club.manager}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-zinc-300 tabular-nums shrink-0">
                            {club.overall}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.leagues.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span>Leagues</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.leagues.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => {
                          onSelectLeague(league.id);
                          onClose();
                        }}
                        className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#12161D] px-3 py-2 text-xs font-medium text-zinc-200 hover:border-emerald-500/40 hover:text-white transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>{league.name}</span>
                        <span className="text-zinc-500">· {league.country}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.articles.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <Newspaper className="h-3.5 w-3.5 text-emerald-400" />
                    <span>World News</span>
                  </div>
                  <div className="divide-y divide-white/5 rounded-lg border border-white/8 bg-[#12161D]">
                    {results.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => {
                          onSelectArticle(article.id);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {article.category} · {article.publishedAgo}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.quizzes.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Football Quizzes</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {results.quizzes.map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => {
                          onSelectQuiz(pack.id);
                          onClose();
                        }}
                        className="rounded-lg border border-white/8 bg-[#12161D] px-3 py-2.5 text-left hover:border-amber-500/40 hover:bg-white/5 transition-colors"
                      >
                        <p className="text-xs font-semibold text-white truncate">
                          {pack.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          {pack.questions.length} Questions
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
