import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { QUIZ_PACKS } from '../data/footballData';
import { QuizPack, QuizQuestion } from '../types/football';

interface QuizzesPageProps {
  initialQuizId?: string | null;
  onClearInitial: () => void;
}

const QUIZ_SCORES_KEY = 'fu_quiz_scores_v1';

interface SavedQuizRecord {
  bestScore: number;
  bestAccuracy: number;
  attempts: number;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({
  initialQuizId,
  onClearInitial,
}) => {
  const [scoresMap, setScoresMap] = useState<Record<string, SavedQuizRecord>>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_SCORES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [activePack, setActivePack] = useState<{
    id: string;
    title: string;
    questions: QuizQuestion[];
  } | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [finished, setFinished] = useState(false);

  const startPack = (pack: QuizPack | 'mixed') => {
    if (pack === 'mixed') {
      const allQs = QUIZ_PACKS.flatMap((p) => p.questions);
      const shuffled = [...allQs].sort(() => Math.random() - 0.5).slice(0, 10);
      setActivePack({
        id: 'mixed-challenge',
        title: 'All-Star Mixed Challenge',
        questions: shuffled,
      });
    } else {
      setActivePack({
        id: pack.id,
        title: pack.title,
        questions: pack.questions,
      });
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(20);
    setFinished(false);
  };

  useEffect(() => {
    if (initialQuizId) {
      const pack = QUIZ_PACKS.find((p) => p.id === initialQuizId);
      if (pack) startPack(pack);
      onClearInitial();
    }
  }, [initialQuizId, onClearInitial]);

  // Countdown timer
  useEffect(() => {
    if (!activePack || finished || selectedOption !== null || !timerEnabled) {
      return;
    }
    if (timeLeft <= 0) {
      setSelectedOption(-1); // Timed out
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [activePack, finished, selectedOption, timerEnabled, timeLeft]);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !activePack) return;
    const q = activePack.questions[currentIndex];
    setSelectedOption(idx);

    if (idx === q.correctIndex) {
      const nextStreak = streak + 1;
      const speedBonus = timerEnabled ? timeLeft * 4 : 0;
      const earned = 100 + (nextStreak - 1) * 25 + speedBonus;
      setScore((prev) => prev + earned);
      setCorrectCount((prev) => prev + 1);
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (!activePack) return;
    if (currentIndex + 1 >= activePack.questions.length) {
      const accuracy = Math.round((correctCount / activePack.questions.length) * 100);
      const prev = scoresMap[activePack.id];
      const updated: Record<string, SavedQuizRecord> = {
        ...scoresMap,
        [activePack.id]: {
          bestScore: Math.max(prev?.bestScore ?? 0, score),
          bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
          attempts: (prev?.attempts ?? 0) + 1,
        },
      };
      setScoresMap(updated);
      try {
        localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(20);
    }
  };

  if (activePack && finished) {
    const accuracy = Math.round((correctCount / activePack.questions.length) * 100);
    const grade =
      accuracy >= 90
        ? 'World-Class Tactician'
        : accuracy >= 70
        ? 'First-Team Analyst'
        : accuracy >= 50
        ? 'Academy Graduate'
        : 'Needs Extra Training';

    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-white/10 bg-[#0E1116] p-6 sm:p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-400">{activePack.title} · Complete</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">{grade}</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-white/8 py-5">
          <div>
            <p className="text-xs text-zinc-500">Total Score</p>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {score}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Accuracy</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
              {correctCount}/{activePack.questions.length} ({accuracy}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Best Streak</p>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
              {maxStreak}x
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              const found = QUIZ_PACKS.find((p) => p.id === activePack.id);
              startPack(found ?? 'mixed');
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Play Again</span>
          </button>
          <button
            onClick={() => setActivePack(null)}
            className="rounded-lg border border-white/10 bg-[#141820] px-5 py-2.5 text-xs font-semibold text-white hover:border-white/25 transition-colors"
          >
            Choose Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (activePack) {
    const q = activePack.questions[currentIndex];
    const progressPct = ((currentIndex + (selectedOption !== null ? 1 : 0)) / activePack.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setActivePack(null)}
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            ← Exit Quiz
          </button>
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="text-zinc-400">
              Q {currentIndex + 1}/{activePack.questions.length}
            </span>
            <span className="text-amber-400">Streak {streak}x</span>
            <span className="text-emerald-400 font-bold">Score {score}</span>
            {timerEnabled && (
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  timeLeft <= 5 ? 'text-red-400' : 'text-zinc-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {timeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="rounded-xl border border-white/10 bg-[#0E1116] p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs text-emerald-400">
              {activePack.title} · Difficulty: {q.difficulty}
            </p>
            <h2 className="mt-2 text-lg sm:text-xl font-semibold text-white leading-snug">
              {q.question}
            </h2>
          </div>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = q.correctIndex === idx;
              const answered = selectedOption !== null;

              let btnStyle =
                'border-white/10 bg-[#12161D] text-zinc-200 hover:border-emerald-500/40 hover:bg-white/5';
              if (answered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-red-500 bg-red-500/15 text-red-200';
                } else {
                  btnStyle = 'border-white/5 bg-[#0B0E13] text-zinc-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-colors ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 w-4">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {answered && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  {answered && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="rounded-lg border border-white/10 bg-[#12161D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-semibold text-white mr-1.5">
                  {selectedOption === q.correctIndex
                    ? 'Correct!'
                    : selectedOption === -1
                    ? 'Time expired.'
                    : 'Incorrect.'}
                </span>
                {q.explanation}
              </div>
              <button
                onClick={handleNext}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                {currentIndex + 1 >= activePack.questions.length
                  ? 'Finish Quiz'
                  : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalAttempts = Object.values(scoresMap).reduce((sum, r) => sum + r.attempts, 0);
  const topHighScore = Math.max(0, ...Object.values(scoresMap).map((r) => r.bestScore));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Football Quiz Arena
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Challenge your tactical, historical, and statistical football knowledge with persistent high scores.
          </p>
        </div>

        <label className="inline-flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#0E1116] px-3.5 py-2 text-xs text-zinc-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
            className="accent-emerald-500 h-3.5 w-3.5"
          />
          <span>20s Shot Clock (+Speed Bonus)</span>
        </label>
      </div>

      {/* Personal Quiz Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-4">
          <p className="text-xs text-zinc-400">Personal Best Score</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {topHighScore}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-4">
          <p className="text-xs text-zinc-400">Quizzes Completed</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
            {totalAttempts}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-[#0E1116] p-4">
          <p className="text-xs text-zinc-400">Question Bank</p>
          <p className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
            {QUIZ_PACKS.reduce((s, p) => s + p.questions.length, 0)} Questions
          </p>
        </div>
      </div>

      {/* Quiz Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {QUIZ_PACKS.map((pack) => {
          const rec = scoresMap[pack.id];
          return (
            <div
              key={pack.id}
              className="rounded-xl border border-white/8 bg-[#0E1116] p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>{pack.topic} · {pack.questions.length} Questions</span>
                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                </div>
                <h2 className="mt-2 text-lg font-semibold text-white">{pack.title}</h2>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  {pack.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/8 pt-4">
                <div className="text-xs text-zinc-400 font-mono tabular-nums">
                  {rec ? (
                    <span>
                      Best: <strong className="text-white">{rec.bestScore}</strong> ({rec.bestAccuracy}%)
                    </span>
                  ) : (
                    <span>Not played yet</span>
                  )}
                </div>
                <button
                  onClick={() => startPack(pack)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors whitespace-nowrap"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          );
        })}

        {/* Mixed Challenge Card */}
        <div className="rounded-xl border border-amber-500/25 bg-[#12151C] p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>Randomized Gauntlet · 10 Questions</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">
              All-Star Mixed Challenge
            </h2>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Ten randomized questions pulled across European history, modern analytics, and player records.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <div className="text-xs text-zinc-400 font-mono tabular-nums">
              {scoresMap['mixed-challenge'] ? (
                <span>
                  Best:{' '}
                  <strong className="text-amber-400">
                    {scoresMap['mixed-challenge'].bestScore}
                  </strong>{' '}
                  ({scoresMap['mixed-challenge'].bestAccuracy}%)
                </span>
              ) : (
                <span>High-stakes mode</span>
              )}
            </div>
            <button
              onClick={() => startPack('mixed')}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              Launch Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
