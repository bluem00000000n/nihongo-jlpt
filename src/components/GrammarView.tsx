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
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-[10px] font-mono text-gray-500 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">JLPT GRAMMAR</span>
            <span className="text-gray-800">INDEX & NOTE</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FFE000] text-gray-950 font-black shadow-xs border border-gray-900/20'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{lvl === 'ALL' ? '전체' : lvl}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-gray-950 text-white font-bold'
                      : 'bg-gray-100 text-gray-600'
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
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="문법 검색 (예: ている, たら, 덕분에)"
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800"
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
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md relative group bg-white ${
                isCompleted
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="loft-hanko text-[9px] px-1.5 py-0.5 font-bold">
                    {item.level}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono font-medium">{item.category}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isBookmarked
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="북마크"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => toggleComplete(item.id, e)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isCompleted
                        ? 'text-emerald-600'
                        : 'text-gray-300 hover:text-gray-600'
                    }`}
                    title={isCompleted ? '완료 취소' : '학습 완료 체크'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 fill-emerald-100" />
                    ) : (
                      <Circle className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Meaning */}
              <div className="mt-2">
                <h4 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
                  <span className="loft-marker">{item.title}</span>
                </h4>
                <p className="text-xs text-gray-700 font-medium mt-1 leading-snug">
                  {item.meaning}
                </p>
                <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono font-medium">
                  접속: {item.connection}
                </div>
              </div>

              {/* Quick sample preview */}
              {item.examples[0] && (
                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate pr-2 font-serif text-[11px]">{item.examples[0].japanese}</span>
                  <div className="flex items-center gap-1 text-gray-950 font-black text-[11px] shrink-0">
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
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900">검색된 문법이 없습니다</h4>
          <p className="text-sm text-gray-500 mt-1">다른 키워드나 JLPT 급수를 선택해 보세요.</p>
        </div>
      )}

      {/* Grammar Detail Modal (Pure White LOFT Notebook Design) */}
      {activeGrammar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 text-gray-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FFE000] text-gray-950 border border-gray-900/15">
                    {activeGrammar.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    {activeGrammar.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-950">
                  {activeGrammar.title}
                </h2>
                <p className="text-sm font-bold text-red-600 mt-1">
                  {activeGrammar.meaning}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleComplete(activeGrammar.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    stats.completedGrammarIds.includes(activeGrammar.id)
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {stats.completedGrammarIds.includes(activeGrammar.id) ? '학습 완료됨' : '완료 체크'}
                </button>
                <button
                  onClick={() => setActiveGrammar(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Connection formula rule */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block mb-1">
                접속 방법 (Connection Rule)
              </span>
              <p className="font-mono font-bold text-gray-950 text-sm">
                {activeGrammar.connection}
              </p>
            </div>

            {/* Detailed Explanation */}
            <div>
              <h4 className="text-xs font-black text-gray-950 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-700" />
                상세 해설
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-800">
                {activeGrammar.explanation}
              </p>
            </div>

            {/* Important Tip / Nuance */}
            {activeGrammar.importantTip && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider">
                    실전 뉘앙스 & 꿀팁
                  </h5>
                  <p className="text-xs text-amber-950 mt-1 leading-relaxed font-medium">
                    {activeGrammar.importantTip}
                  </p>
                </div>
              </div>
            )}

            {/* Example Sentences */}
            <div>
              <h4 className="text-xs font-black text-gray-950 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D93829]" />
                실전 예문
              </h4>
              <div className="space-y-2.5">
                {activeGrammar.examples.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1.5"
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
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shrink-0 transition-colors"
                        title="원어민 발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">
                      {ex.korean}
                    </p>
                    {ex.nuance && (
                      <span className="inline-block text-[11px] text-gray-500 font-medium">
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
                <h4 className="text-xs font-black text-gray-950 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#D93829]" />
                  즉석 이해도 체크
                </h4>
                <div className="space-y-3">
                  {activeGrammar.quizzes.map((q) => {
                    const isSubmitted = quizSubmitted[q.id];
                    const selected = selectedQuizAnswers[q.id];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5"
                      >
                        <p className="text-xs sm:text-sm font-bold text-gray-950">
                          {q.prompt}
                        </p>

                        {/* Options */}
                        {q.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isThisSelected = selected === opt;
                              let btnClass =
                                'bg-white border-gray-300 text-gray-900 font-bold hover:bg-gray-50';
                              if (isSubmitted) {
                                if (opt === q.correctAnswer) {
                                  btnClass =
                                    'bg-emerald-600 border-emerald-700 text-white font-black';
                                } else if (isThisSelected) {
                                  btnClass = 'bg-rose-600 border-rose-700 text-white font-bold';
                                }
                              } else if (isThisSelected) {
                                btnClass =
                                  'bg-gray-950 border-gray-950 text-white font-black';
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
                            className="w-full py-2.5 bg-[#FFE000] hover:bg-[#FACC15] disabled:opacity-40 text-gray-950 text-xs font-black rounded-lg transition-colors border border-gray-900/15"
                          >
                            정답 확인
                          </button>
                        ) : (
                          <div
                            className={`p-3 rounded-lg text-xs leading-relaxed ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                                : 'bg-rose-50 text-rose-950 border border-rose-200'
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
