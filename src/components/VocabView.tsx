'use client';

import React, { useState } from 'react';
import { VocabItem, UserStats } from '@/types';
import { speechService } from '@/utils/speech';
import { Volume2, Bookmark, Rotate3d, Layers, Search, Sparkles } from 'lucide-react';

interface VocabViewProps {
  vocabList: VocabItem[];
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onAddXP: (amount: number) => void;
}

export const VocabView: React.FC<VocabViewProps> = ({
  vocabList,
  stats,
  onUpdateStats,
  onAddXP,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchWord, setSearchWord] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const categories = ['ALL', '식당/쇼핑', '교통/여행', '비즈니스/일상'];

  const filtered = vocabList.filter((v) => {
    const matchCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchSearch =
      v.kanji.includes(searchWord) ||
      v.kana.includes(searchWord) ||
      v.korean.includes(searchWord);
    return matchCat && matchSearch;
  });

  const currentCard = filtered[cardIndex % (filtered.length || 1)];

  const playSpeech = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (stats.soundEnabled) {
      speechService.speak(text);
    }
  };

  const toggleSaveWord = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = stats.savedVocabIds.includes(id);
    let newSaved: string[];
    if (isSaved) {
      newSaved = stats.savedVocabIds.filter((item) => item !== id);
    } else {
      newSaved = [...stats.savedVocabIds, id];
    }
    onUpdateStats({ savedVocabIds: newSaved });
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filtered.length);
    onAddXP(5);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  return (
    <div className="space-y-6">
      {/* Category & Mode Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? '전체 카테고리' : cat}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'card'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            플래시카드 모드
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            리스트 모드
          </button>
        </div>
      </div>

      {/* Card Mode */}
      {viewMode === 'card' && currentCard && (
        <div className="max-w-md mx-auto space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-200/80 dark:border-amber-900/40 p-8 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-2xl relative select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {currentCard.level} · {currentCard.partOfSpeech}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleSaveWord(currentCard.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      stats.savedVocabIds.includes(currentCard.id)
                        ? 'fill-amber-500 text-amber-500'
                        : ''
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => playSpeech(currentCard.kanji, e)}
                  className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Front or Back */}
            <div className="text-center my-auto space-y-2">
              {!isFlipped ? (
                <>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                    {currentCard.kanji}
                  </h3>
                  <p className="text-lg font-medium text-amber-600 dark:text-amber-400">
                    {currentCard.kana}
                  </p>
                  {stats.romajiEnabled && (
                    <p className="text-xs font-mono text-slate-400">{currentCard.romaji}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-4">카드를 클릭하면 뜻이 보입니다</p>
                </>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {currentCard.korean}
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs text-left space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentCard.exampleJp}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{currentCard.exampleKr}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-slate-400">
              {cardIndex + 1} / {filtered.length}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevCard}
              className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50"
            >
              이전 단어
            </button>
            <button
              onClick={nextCard}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25"
            >
              알고 있음! 다음 단어
            </button>
          </div>
        </div>
      )}

      {/* List Mode */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="단어 및 뜻 검색 (예: 생맥주, 予約, 어서오세요)"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
            />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {item.kanji}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ({item.kana})
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                      {item.level}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {item.korean}
                  </p>
                  <p className="text-[11px] text-slate-400">{item.exampleJp} - {item.exampleKr}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playSpeech(item.kanji)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => toggleSaveWord(item.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-500"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        stats.savedVocabIds.includes(item.id)
                          ? 'fill-amber-500 text-amber-500'
                          : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
