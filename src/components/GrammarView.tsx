'use client';

import React, { useState, useMemo } from 'react';
import { GrammarItem, JLPTLevel, UserStats } from '@/types';
import { FuriganaText } from './FuriganaText';
import { speechService } from '@/utils/speech';
import {
  CheckCircle2,
  Circle,
  Volume2,
  Search,
  Bookmark,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrammarViewProps {
  grammarList: GrammarItem[];
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onAddXP: (amount: number) => void;
}

export const GrammarView: React.FC<GrammarViewProps> = ({
  grammarList,
  stats,
  onUpdateStats,
  onAddXP,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGrammar, setActiveGrammar] = useState<GrammarItem | null>(null);

  // Practice state inside modal
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<{ [qId: string]: boolean }>({});

  const levels: (JLPTLevel | 'ALL')[] = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

  const filteredGrammar = useMemo(() => {
    return grammarList.filter((item) => {
      const matchLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.connection.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [grammarList, selectedLevel, searchQuery]);

  const toggleComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCompleted = stats.completedGrammarIds.includes(id);
    let newCompleted: string[];
    if (isCompleted) {
      newCompleted = stats.completedGrammarIds.filter((item) => item !== id);
    } else {
      newCompleted = [...stats.completedGrammarIds, id];
      onAddXP(20);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onUpdateStats({ completedGrammarIds: newCompleted });
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isBookmarked = stats.bookmarkedGrammarIds.includes(id);
    let newBookmarks: string[];
    if (isBookmarked) {
      newBookmarks = stats.bookmarkedGrammarIds.filter((item) => item !== id);
    } else {
      newBookmarks = [...stats.bookmarkedGrammarIds, id];
    }
    onUpdateStats({ bookmarkedGrammarIds: newBookmarks });
  };

  const playAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (stats.soundEnabled) {
      speechService.speak(text);
    }
  };

  const handleSelectQuizOption = (quizId: string, option: string) => {
    if (quizSubmitted[quizId]) return;
    setSelectedQuizAnswers((prev) => ({ ...prev, [quizId]: option }));
  };

  const handleCheckQuiz = (quizId: string, correctAnswer: string | string[]) => {
    setQuizSubmitted((prev) => ({ ...prev, [quizId]: true }));
    const userAns = selectedQuizAnswers[quizId];
    const isCorrect = Array.isArray(correctAnswer)
      ? userAns === correctAnswer.join('')
      : userAns === correctAnswer;
    if (isCorrect) {
      onAddXP(15);
      confetti({
        particleCount: 30,
        spread: 50,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top filter and search bar (LOFT Stationery Header) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#FFE000] text-black font-black text-[9px] rounded-xs shadow-xs">LOFT GRAMMAR</span>
            <span>INDEX & NOTE</span>
          </div>
          <span>TOTAL: {grammarList.length} ITEMS</span>
        </div>

        {/* JLPT Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {levels.map((lvl) => {
            const count =
              lvl === 'ALL'
                ? grammarList.length
                : grammarList.filter((g) => g.level === lvl).length;
            const completedInLvl =
              lvl === 'ALL'
                ? stats.completedGrammarIds.length
                : grammarList
                    .filter((g) => g.level === lvl)
                    .filter((g) => stats.completedGrammarIds.includes(g.id)).length;
            const isActive = selectedLevel === lvl;

            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FFE000] text-stone-900 font-extrabold shadow-xs border border-stone-800/30'
                    : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-[#DDD5C5] dark:border-stone-750 hover:bg-[#F4EFE4]'
                }`}
              >
                <span>{lvl === 'ALL' ? '전체' : lvl}</span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded-xs ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-500'
                  }`}
                >
                  {completedInLvl}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="문법 검색 (예: ている, たら, 덕분에)"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-900 border border-[#DDD5C5] dark:border-stone-700 rounded-lg text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-800"
          />
        </div>
      </div>

      {/* Grammar Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredGrammar.map((item) => {
          const isCompleted = stats.completedGrammarIds.includes(item.id);
          const isBookmarked = stats.bookmarkedGrammarIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveGrammar(item);
                setSelectedQuizAnswers({});
                setQuizSubmitted({});
              }}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md relative group bg-white dark:bg-[#1E1D1B] ${
                isCompleted
                  ? 'border-emerald-300 dark:border-emerald-800 bg-[#F4FBF7] dark:bg-emerald-950/10'
                  : 'border-[#E2D9C8] dark:border-stone-800 hover:border-stone-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="loft-hanko text-[9px] px-1 py-0.2">
                    {item.level}
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">{item.category}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isBookmarked
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                    title="북마크"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => toggleComplete(item.id, e)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-300 hover:text-stone-600'
                    }`}
                    title={isCompleted ? '완료 취소' : '학습 완료 체크'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-100 dark:fill-emerald-900" />
                    ) : (
                      <Circle className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Meaning */}
              <div className="mt-2">
                <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="loft-marker">{item.title}</span>
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                  {item.meaning}
                </p>
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono">
                  접속: {item.connection}
                </div>
              </div>

              {/* Quick sample preview */}
              {item.examples[0] && (
                <div className="mt-2.5 pt-2 border-t border-dashed border-[#DDD5C5] dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span className="truncate pr-2 font-serif text-[11px]">{item.examples[0].japanese}</span>
                  <div className="flex items-center gap-1 text-stone-900 dark:text-stone-100 font-extrabold text-[11px] shrink-0">
                    <span>학습</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGrammar.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">검색된 문법이 없습니다</h4>
          <p className="text-sm text-slate-500 mt-1">다른 키워드나 JLPT 급수를 선택해 보세요.</p>
        </div>
      )}

      {/* Grammar Detail Modal */}
      {activeGrammar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {activeGrammar.level}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {activeGrammar.category}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeGrammar.title}
                </h2>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {activeGrammar.meaning}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleComplete(activeGrammar.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stats.completedGrammarIds.includes(activeGrammar.id)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {stats.completedGrammarIds.includes(activeGrammar.id) ? '학습 완료됨' : '완료 체크'}
                </button>
                <button
                  onClick={() => setActiveGrammar(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Connection formula rule */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                접속 방법 (Connection Rule)
              </span>
              <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-base">
                {activeGrammar.connection}
              </p>
            </div>

            {/* Detailed Explanation */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                상세 해설
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {activeGrammar.explanation}
              </p>
            </div>

            {/* Important Tip / Nuance */}
            {activeGrammar.importantTip && (
              <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    실전 뉘앙스 & 꿀팁
                  </h5>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    {activeGrammar.importantTip}
                  </p>
                </div>
              </div>
            )}

            {/* Example Sentences */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                실전 예문
              </h4>
              <div className="space-y-3">
                {activeGrammar.examples.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <FuriganaText
                        japanese={ex.japanese}
                        ruby={ex.ruby}
                        romaji={ex.romaji}
                        showFurigana={stats.furiganaEnabled}
                        showRomaji={stats.romajiEnabled}
                      />
                      <button
                        onClick={() => playAudio(ex.japanese)}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors"
                        title="원어민 발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {ex.korean}
                    </p>
                    {ex.nuance && (
                      <span className="inline-block text-[11px] text-slate-400 font-medium">
                        💡 {ex.nuance}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice Quiz */}
            {activeGrammar.quizzes.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  즉석 이해도 체크
                </h4>
                <div className="space-y-4">
                  {activeGrammar.quizzes.map((q) => {
                    const isSubmitted = quizSubmitted[q.id];
                    const selected = selectedQuizAnswers[q.id];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
                      >
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {q.prompt}
                        </p>

                        {/* Options */}
                        {q.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isThisSelected = selected === opt;
                              let btnClass =
                                'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                              if (isSubmitted) {
                                if (opt === q.correctAnswer) {
                                  btnClass =
                                    'bg-emerald-500 border-emerald-600 text-white font-bold';
                                } else if (isThisSelected) {
                                  btnClass = 'bg-rose-500 border-rose-600 text-white';
                                }
                              } else if (isThisSelected) {
                                btnClass =
                                  'bg-indigo-600 border-indigo-700 text-white font-bold';
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleSelectQuizOption(q.id, opt)}
                                  disabled={isSubmitted}
                                  className={`p-2.5 rounded-lg border text-xs text-center transition-all ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {!isSubmitted ? (
                          <button
                            onClick={() => handleCheckQuiz(q.id, q.correctAnswer)}
                            disabled={!selected}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            정답 확인
                          </button>
                        ) : (
                          <div
                            className={`p-3 rounded-lg text-xs leading-relaxed ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200'
                            }`}
                          >
                            <span className="font-bold block mb-1">
                              {isCorrect ? '🎉 정답입니다!' : '🤔 오답입니다!'}
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
