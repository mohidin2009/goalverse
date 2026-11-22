import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, Clock, X } from 'lucide-react';
import {
  NEWS_ARTICLES,
  TRANSFER_UPDATES,
  getClubById,
  getPlayerById,
} from '../data/footballData';
import { NewsArticle, NewsCategory, TransferStatus } from '../types/football';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ClubCrest } from '../components/ClubCrest';

interface NewsPageProps {
  initialArticleId?: string | null;
  onClearInitialArticle: () => void;
  onOpenClub: (clubId: string) => void;
  onOpenPlayer: (playerId: string) => void;
}

const CATEGORIES: ('All' | NewsCategory | 'Saved')[] = [
  'All',
  'Tactical Analysis',
  'Transfers',
  'Match Reports',
  'International',
  'Saved',
];

const BOOKMARKS_KEY = 'fu_saved_articles_v1';

export const NewsPage: React.FC<NewsPageProps> = ({
  initialArticleId,
  onClearInitialArticle,
  onOpenClub,
  onOpenPlayer,
}) => {
  const [category, setCategory] = useState<'All' | NewsCategory | 'Saved'>('All');
  const [transferFilter, setTransferFilter] = useState<'All' | TransferStatus>('All');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (initialArticleId) {
      const found = NEWS_ARTICLES.find((a) => a.id === initialArticleId);
      if (found) setActiveArticle(found);
      onClearInitialArticle();
    }
  }, [initialArticleId, onClearInitialArticle]);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = savedIds.includes(id)
      ? savedIds.filter((item) => item !== id)
      : [...savedIds, id];
    setSavedIds(next);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failure
    }
  };

  const filteredArticles = NEWS_ARTICLES.filter((article) => {
    if (category === 'All') return true;
    if (category === 'Saved') return savedIds.includes(article.id);
    return article.category === category;
  });

  const filteredTransfers = TRANSFER_UPDATES.filter((item) => {
    if (transferFilter === 'All') return true;
    return item.status === transferFilter;
  });

  const leadArticle = filteredArticles[0];
  const restArticles = filteredArticles.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            World Football Newsroom
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Independent match analysis, transfer intelligence, and global tournament coverage.
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'bg-[#0E1116] border border-white/8 text-zinc-300 hover:text-white hover:border-white/20'
              }`}
            >
              {cat === 'Saved' ? `Saved (${savedIds.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-12 text-center">
          <p className="text-sm font-medium text-zinc-200">No saved stories yet</p>
          <p className="mt-1 text-xs text-zinc-400">
            Bookmark any report or transfer dossier to read it here later.
          </p>
          <button
            onClick={() => setCategory('All')}
            className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Browse All Stories
          </button>
        </div>
      ) : (
        <>
          {leadArticle && (
            <article
              onClick={() => setActiveArticle(leadArticle)}
              className="group cursor-pointer rounded-xl border border-white/10 bg-[#0E1116] overflow-hidden hover:border-emerald-500/40 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-6 aspect-video lg:aspect-auto overflow-hidden">
                  <ImageWithFallback
                    src={leadArticle.imageUrl}
                    alt={leadArticle.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-emerald-400">
                        {leadArticle.category} · {leadArticle.publishedAgo} · {leadArticle.readTime}
                      </span>
                      <button
                        onClick={(e) => toggleSave(leadArticle.id, e)}
                        aria-label="Save article"
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {savedIds.includes(leadArticle.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <h2 className="mt-3 text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors [text-wrap:balance]">
                      {leadArticle.title}
                    </h2>
                    <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                      {leadArticle.subtitle}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-zinc-400">
                    <span>By {leadArticle.author}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                      Read Full Report <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )}

          {restArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {restArticles.map((article) => {
                const isSaved = savedIds.includes(article.id);
                return (
                  <article
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="group cursor-pointer rounded-xl border border-white/8 bg-[#0E1116] overflow-hidden hover:border-emerald-500/40 transition-colors flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <ImageWithFallback
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-emerald-400">
                            {article.category} · {article.publishedAgo}
                          </span>
                          <button
                            onClick={(e) => toggleSave(article.id, e)}
                            aria-label="Save article"
                            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {article.subtitle}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{article.author}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {article.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Dedicated Transfer Market Section */}
      <section className="pt-4 border-t border-white/8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Transfer Market
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Live transfer rumors, advanced club negotiations, and confirmed international signings.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#0E1116] p-1 border border-white/8 self-start sm:self-auto">
            {(
              [
                { key: 'All', label: 'All Deals' },
                { key: 'Confirmed', label: 'Confirmed Signings' },
                { key: 'Rumor', label: 'Transfer Rumors' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTransferFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  transferFilter === tab.key
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTransfers.map((item) => {
            const fromClub = getClubById(item.fromClubId);
            const toClub = getClubById(item.toClubId);
            const isConfirmed = item.status === 'Confirmed';

            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/8 bg-[#0E1116] p-5 flex flex-col justify-between gap-4 hover:border-white/20 transition-colors"
              >
                {/* Top Status & Timestamp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-medium ${
                        isConfirmed ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.status === 'Confirmed'
                        ? `Confirmed · ${item.stageLabel}`
                        : `Rumor · ${item.stageLabel} (${item.likelihoodPct}%)`}
                    </span>
                    <span className="text-zinc-500">{item.updatedAgo}</span>
                  </div>

                  {/* Player Headshot & Identity */}
                  <button
                    onClick={() => onOpenPlayer(item.playerId)}
                    className="flex items-center gap-3.5 text-left group w-full"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-[#12161D] shrink-0">
                      <ImageWithFallback
                        src={item.headshotUrl}
                        alt={item.playerName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {item.playerName}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {item.position} · Age {item.age}
                      </p>
                    </div>
                  </button>

                  {/* Club-to-Club Logo Transfer Route */}
                  {fromClub && toClub && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-[#12161D] px-3.5 py-2.5">
                      <button
                        onClick={() => onOpenClub(fromClub.id)}
                        className="flex items-center gap-2 min-w-0 hover:text-emerald-300 transition-colors text-left"
                      >
                        <ClubCrest club={fromClub} size="sm" />
                        <span className="text-xs font-medium text-zinc-200 truncate">
                          {fromClub.shortName}
                        </span>
                      </button>

                      <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />

                      <button
                        onClick={() => onOpenClub(toClub.id)}
                        className="flex items-center gap-2 min-w-0 hover:text-emerald-300 transition-colors text-right"
                      >
                        <span className="text-xs font-semibold text-white truncate">
                          {toClub.shortName}
                        </span>
                        <ClubCrest club={toClub} size="sm" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Fee & Contract Footer */}
                <div className="border-t border-white/8 pt-3 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-amber-400 tabular-nums">
                    {item.feeLabel}
                  </span>
                  <span className="text-zinc-500">{item.contractTerm}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveArticle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0E1116] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60 sm:h-72 overflow-hidden">
              <ImageWithFallback
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/40 to-transparent" />
              <button
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 rounded-lg bg-black/60 p-2 text-white hover:bg-black transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 -mt-8 relative z-10 space-y-6">
              <div>
                <p className="text-xs font-medium text-emerald-400">
                  {activeArticle.category} · {activeArticle.publishedAgo} · {activeArticle.readTime}
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white [text-wrap:balance]">
                  {activeArticle.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-300">{activeArticle.subtitle}</p>
                <p className="mt-3 text-xs text-zinc-500">By {activeArticle.author}</p>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-zinc-200 leading-relaxed border-t border-white/8 pt-5">
                {activeArticle.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="rounded-lg border border-white/8 bg-[#12161D] p-4">
                <h3 className="text-xs font-semibold text-emerald-400 mb-2">
                  Key Tactical Takeaways
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
                  {activeArticle.tacticalTakeaways.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>

              {(activeArticle.relatedClubIds.length > 0 ||
                activeArticle.relatedPlayerIds.length > 0) && (
                <div className="border-t border-white/8 pt-5 space-y-3">
                  <p className="text-xs font-semibold text-zinc-400">
                    Mentioned Clubs & Players
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeArticle.relatedClubIds.map((cid) => {
                      const c = getClubById(cid);
                      if (!c) return null;
                      return (
                        <button
                          key={cid}
                          onClick={() => {
                            setActiveArticle(null);
                            onOpenClub(cid);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#141820] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40 hover:text-white transition-colors"
                        >
                          <ClubCrest club={c} size="xs" />
                          <span>{c.shortName}</span>
                        </button>
                      );
                    })}
                    {activeArticle.relatedPlayerIds.map((pid) => {
                      const p = getPlayerById(pid);
                      if (!p) return null;
                      return (
                        <button
                          key={pid}
                          onClick={() => {
                            setActiveArticle(null);
                            onOpenPlayer(pid);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#141820] px-3 py-1.5 text-xs font-medium text-emerald-300 hover:border-emerald-500/40 transition-colors"
                        >
                          <span>{p.name}</span>
                          <span className="font-mono text-zinc-400">{p.rating}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
