'use client';

import React, { useState, useMemo } from 'react';
import { VocabItem, UserStats, JLPTLevel, KanjiMasterItem } from '@/types';
import { kanjiMasterData } from '@/data/kanji';
import { speechService } from '@/utils/speech';
import {
  Volume2,
  Bookmark,
  Rotate3d,
  Layers,
  Search,
  Sparkles,
  BookOpen,
  Lightbulb,
  Tag,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from 'lucide-react';

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
  // Top-level study mode: Vocab vs Kanji Master
  const [studySection, setStudySection] = useState<'vocab' | 'kanji'>('kanji');

  // Vocab states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVocabLevel, setSelectedVocabLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabCardIndex, setVocabCardIndex] = useState(0);
  const [vocabFlipped, setVocabFlipped] = useState(false);
  const [vocabViewMode, setVocabViewMode] = useState<'card' | 'list'>('card');

  // Kanji Master states
  const [selectedKanjiLevel, setSelectedKanjiLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [kanjiSearch, setKanjiSearch] = useState('');
  const [kanjiCardIndex, setKanjiCardIndex] = useState(0);
  const [kanjiFlipped, setKanjiFlipped] = useState(false);
  const [kanjiViewMode, setKanjiViewMode] = useState<'card' | 'list'>('card');

  const categories = ['ALL', '식당/쇼핑', '교통/여행', '비즈니스/일상'];
  const levels: (JLPTLevel | 'ALL')[] = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

  // Filtered Vocab
  const filteredVocab = useMemo(() => {
    return vocabList.filter((v) => {
      const matchCat = selectedCategory === 'ALL' || v.category === selectedCategory;
      const matchLevel = selectedVocabLevel === 'ALL' || v.level === selectedVocabLevel;
      const matchSearch =
        v.kanji.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        v.kana.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        v.korean.toLowerCase().includes(vocabSearch.toLowerCase());
      return matchCat && matchLevel && matchSearch;
    });
  }, [vocabList, selectedCategory, selectedVocabLevel, vocabSearch]);

  // Filtered Kanji
  const filteredKanji = useMemo(() => {
    return kanjiMasterData.filter((k) => {
      const matchLevel = selectedKanjiLevel === 'ALL' || k.level === selectedKanjiLevel;
      const matchSearch =
        k.kanji.includes(kanjiSearch) ||
        k.hanjaSound.includes(kanjiSearch) ||
        k.radical.includes(kanjiSearch) ||
        k.onyomi.toLowerCase().includes(kanjiSearch.toLowerCase()) ||
        k.kunyomi.toLowerCase().includes(kanjiSearch.toLowerCase()) ||
        k.story.toLowerCase().includes(kanjiSearch.toLowerCase()) ||
        k.compounds.some(
          (c) =>
            c.word.includes(kanjiSearch) ||
            c.reading.includes(kanjiSearch) ||
            c.korean.includes(kanjiSearch)
        );
      return matchLevel && matchSearch;
    });
  }, [selectedKanjiLevel, kanjiSearch]);

  const currentVocabCard = filteredVocab[vocabCardIndex % (filteredVocab.length || 1)];
  const currentKanjiCard = filteredKanji[kanjiCardIndex % (filteredKanji.length || 1)];

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Main Section Switcher - LOFT Stationery Aesthetic */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 relative">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStudySection('kanji')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              studySection === 'kanji'
                ? 'bg-[#FFE000] text-gray-950 shadow-xs border border-gray-900/15'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            한자 암기박사 (스토리텔링)
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white font-mono">
              {kanjiMasterData.length}
            </span>
          </button>

          <button
            onClick={() => setStudySection('vocab')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              studySection === 'vocab'
                ? 'bg-[#FFE000] text-gray-950 shadow-xs border border-gray-900/15'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            JLPT 필수 어휘장
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800 font-mono">
              {vocabList.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 font-bold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            도쿄 표준 발음 지원
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: 한자 암기박사 (상용한자 연상 스토리텔링 비법) */}
      {/* ========================================================= */}
      {studySection === 'kanji' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Level Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                <span className="text-xs font-bold text-[#8C826D] mr-1 flex items-center gap-1 shrink-0">
                  <Tag className="w-3 h-3" /> 급수:
                </span>
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedKanjiLevel(lvl);
                      setKanjiCardIndex(0);
                      setKanjiFlipped(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedKanjiLevel === lvl
                        ? 'bg-[#1C1C1E] text-[#F5A623] shadow-sm'
                        : 'bg-white text-[#5C5645] hover:bg-[#F2ECE1] border border-[#DDD5BF]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setKanjiViewMode('card')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    kanjiViewMode === 'card'
                      ? 'bg-[#1C1C1E] text-white'
                      : 'bg-white text-[#555] border border-[#DDD5BF] hover:bg-[#F0ECE1]'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  카드 모드
                </button>
                <button
                  onClick={() => setKanjiViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    kanjiViewMode === 'list'
                      ? 'bg-[#1C1C1E] text-white'
                      : 'bg-white text-[#555] border border-[#DDD5BF] hover:bg-[#F0ECE1]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  목록 모드
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C826D]" />
              <input
                type="text"
                value={kanjiSearch}
                onChange={(e) => {
                  setKanjiSearch(e.target.value);
                  setKanjiCardIndex(0);
                  setKanjiFlipped(false);
                }}
                placeholder="한자, 훈음(예: 목욕할 욕, 골 곡), 부수, 음독/훈독 검색..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#DED7C2] rounded-xl text-xs sm:text-sm text-[#1C1C1E] placeholder:text-[#9A9380] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
          </div>

          {/* Kanji Card Mode */}
          {kanjiViewMode === 'card' && currentKanjiCard && (
            <div className="max-w-lg mx-auto space-y-4">
              {/* Card Container */}
              <div
                onClick={() => setKanjiFlipped(!kanjiFlipped)}
                className="w-full min-h-[380px] bg-[#FFFDF8] border-2 border-[#D9D0B8] rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden select-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Washi tape visual accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-[#F5E6B3]/80 border-b border-[#D8C78B] shadow-sm transform -rotate-1 rounded-sm"></div>

                {/* Card Header */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-[#F5A623]">
                      {currentKanjiCard.level}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F2ECE1] text-[#665F4C] border border-[#DDD5BF]">
                      부수: {currentKanjiCard.radical}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F2ECE1] text-[#665F4C] border border-[#DDD5BF]">
                      {currentKanjiCard.strokes}획
                    </span>
                  </div>

                  <button
                    onClick={(e) => playSpeech(currentKanjiCard.kanji, e)}
                    className="p-2 rounded-xl bg-[#F5A623]/15 text-[#9A6208] hover:bg-[#F5A623]/25 transition-all"
                    title="도쿄 표준 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Main Body */}
                <div className="my-auto py-4 text-center">
                  {!kanjiFlipped ? (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="inline-block p-4 rounded-2xl bg-white/90 border border-[#E6DEC7] shadow-inner">
                        <span className="text-7xl font-serif font-black text-[#1C1C1E] tracking-tight">
                          {currentKanjiCard.kanji}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-[#2C2923]">
                        {currentKanjiCard.hanjaSound}
                      </h4>
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#F4EDE0] text-xs text-[#6B6350] border border-[#DDD4BD]">
                        <span>음독: <strong>{currentKanjiCard.onyomi || '-'}</strong></span>
                        <span>·</span>
                        <span>훈독: <strong>{currentKanjiCard.kunyomi || '-'}</strong></span>
                      </div>
                      <p className="text-[11px] text-[#A69E89] mt-2">
                        💡 카드를 클릭하면 <span className="text-[#9A6208] font-bold">암기박사 연상 비법</span>과 대표 단어가 나타납니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left animate-in fade-in duration-200">
                      {/* 암기박사 공식 스토리 */}
                      <div className="p-3.5 rounded-2xl bg-[#FFF6D6] border-2 border-[#E8D18C] shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6000] mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          한자 암기박사 비법 공식
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A3800] leading-relaxed font-medium">
                          {currentKanjiCard.story}
                        </p>
                      </div>

                      {/* 대표 복합어 */}
                      <div>
                        <div className="text-[11px] font-bold text-[#7A725D] uppercase tracking-wider mb-1.5">
                          📚 대표 어휘 & 파생어
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {currentKanjiCard.compounds.map((c, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => playSpeech(c.word, e)}
                              className="p-2 rounded-xl bg-white border border-[#E2D9C2] hover:border-[#F5A623] cursor-pointer transition-all"
                            >
                              <div className="flex items-baseline justify-between">
                                <span className="font-bold text-xs sm:text-sm text-[#1C1C1E]">
                                  {c.word}
                                </span>
                                <span className="text-[10px] text-[#9A6208] font-mono">
                                  {c.reading}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6E6754] truncate mt-0.5">
                                {c.korean}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 실전 예문 */}
                      <div className="p-2.5 rounded-xl bg-white/80 border border-[#E4DEC6] text-xs">
                        <div className="flex items-center justify-between text-[#1C1C1E] font-medium">
                          <span>{currentKanjiCard.exampleSentence.japanese}</span>
                          <button
                            onClick={(e) =>
                              playSpeech(currentKanjiCard.exampleSentence.japanese, e)
                            }
                            className="text-[#9A6208] hover:text-black shrink-0 ml-2"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#7A725D] mt-0.5">
                          {currentKanjiCard.exampleSentence.korean}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E1CD] text-xs font-mono text-[#8C836E]">
                  <span>
                    카드 {kanjiCardIndex + 1} / {filteredKanji.length}
                  </span>
                  <span className="text-[11px] text-[#A69E89]">
                    {kanjiFlipped ? '클릭 시 한자 앞면으로' : '클릭 시 해설 뒷면으로'}
                  </span>
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setKanjiFlipped(false);
                    setKanjiCardIndex(
                      (prev) => (prev - 1 + filteredKanji.length) % filteredKanji.length
                    );
                  }}
                  className="flex-1 py-3 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  이전 한자
                </button>

                <button
                  onClick={() => {
                    setKanjiFlipped(false);
                    const rand = Math.floor(Math.random() * filteredKanji.length);
                    setKanjiCardIndex(rand);
                  }}
                  className="px-4 py-3 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 rounded-xl transition-all shadow-xs"
                  title="랜덤 셔플"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setKanjiFlipped(false);
                    setKanjiCardIndex((prev) => (prev + 1) % filteredKanji.length);
                    onAddXP(5);
                  }}
                  className="flex-1 py-3 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-900/15 transition-all shadow-sm active:scale-98"
                >
                  다음 한자
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Kanji List Mode */}
          {kanjiViewMode === 'list' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="text-xs text-[#7A725D] font-mono px-1">
                총 {filteredKanji.length}개의 한자가 검색되었습니다.
              </div>

              <div className="divide-y divide-[#EADFC7]">
                {filteredKanji.map((k) => (
                  <div
                    key={k.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/50 px-2 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-serif font-black text-[#1C1C1E]">
                          {k.kanji}
                        </span>
                        <span className="text-sm font-bold text-[#9A6208]">
                          {k.hanjaSound}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[#F5A623]">
                          {k.level}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EFE8D6] text-[#68604C] border border-[#DDD4BD]">
                          {k.radical} · {k.strokes}획
                        </span>
                      </div>

                      {/* 암기 비법 요약 */}
                      <p className="text-xs text-[#524B3B] leading-relaxed">
                        <span className="text-[#9A6208] font-bold mr-1">💡 비법:</span>
                        {k.story}
                      </p>

                      {/* 복합어 미리보기 */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {k.compounds.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            onClick={() => playSpeech(c.word)}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#DDD5BF] text-[#333] cursor-pointer hover:border-[#F5A623]"
                          >
                            <strong>{c.word}</strong> ({c.reading}): {c.korean}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => playSpeech(k.kanji)}
                        className="p-2 rounded-xl bg-white border border-[#DDD5BF] hover:bg-[#F5A623]/20 text-[#6B6350] hover:text-black transition-all"
                        title="발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: JLPT 필수 어휘장 (단어 플래시카드 & 리스트) */}
      {/* ========================================================= */}
      {studySection === 'vocab' && (
        <div className="space-y-6">
          {/* Vocab Controls */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setVocabCardIndex(0);
                      setVocabFlipped(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#1C1C1E] text-[#FFFBE8] shadow-sm'
                        : 'bg-white text-[#5C5645] border border-[#DDD5BF] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {cat === 'ALL' ? '전체 카테고리' : cat}
                  </button>
                ))}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVocabViewMode('card')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    vocabViewMode === 'card'
                      ? 'bg-[#1C1C1E] text-white'
                      : 'bg-white text-[#5C5645] border border-[#DDD5BF] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  플래시카드
                </button>
                <button
                  onClick={() => setVocabViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    vocabViewMode === 'list'
                      ? 'bg-[#1C1C1E] text-white'
                      : 'bg-white text-[#5C5645] border border-[#DDD5BF] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  단어 목록
                </button>
              </div>
            </div>

            {/* Level Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-1 w-full sm:w-auto">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedVocabLevel(lvl);
                      setVocabCardIndex(0);
                      setVocabFlipped(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                      selectedVocabLevel === lvl
                        ? 'bg-[#1C1C1E] text-[#F5A623]'
                        : 'bg-white text-[#6B6350] border border-[#DDD5BF] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C826D]" />
                <input
                  type="text"
                  value={vocabSearch}
                  onChange={(e) => {
                    setVocabSearch(e.target.value);
                    setVocabCardIndex(0);
                    setVocabFlipped(false);
                  }}
                  placeholder="단어, 발음, 한국어 뜻 검색..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#DED7C2] rounded-xl text-xs sm:text-sm text-[#1C1C1E] placeholder:text-[#9A9380] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                />
              </div>
            </div>
          </div>

          {/* Vocab Card Mode */}
          {vocabViewMode === 'card' && currentVocabCard && (
            <div className="max-w-md mx-auto space-y-4">
              <div
                onClick={() => setVocabFlipped(!vocabFlipped)}
                className="w-full min-h-[320px] rounded-3xl bg-[#FFFDF8] border-2 border-[#D9D0B8] p-7 shadow-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl relative select-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-[#F5A623]">
                      {currentVocabCard.level}
                    </span>
                    <span className="text-[11px] font-medium text-[#7A725D] bg-[#F2ECE1] px-2 py-0.5 rounded-md border border-[#DDD5BF]">
                      {currentVocabCard.partOfSpeech}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleSaveWord(currentVocabCard.id, e)}
                      className="p-1.5 rounded-lg text-[#8C826D] hover:text-[#F5A623]"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          stats.savedVocabIds.includes(currentVocabCard.id)
                            ? 'fill-[#F5A623] text-[#F5A623]'
                            : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => playSpeech(currentVocabCard.kanji, e)}
                      className="p-1.5 rounded-lg bg-[#FAF0D4] text-[#9A6208] hover:bg-[#F5A623]/25"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Center */}
                <div className="text-center my-auto space-y-2 py-4">
                  {!vocabFlipped ? (
                    <>
                      <h3 className="text-4xl font-serif font-black text-[#1C1C1E]">
                        {currentVocabCard.kanji}
                      </h3>
                      <p className="text-lg font-medium text-[#9A6208]">
                        {currentVocabCard.kana}
                      </p>
                      {stats.romajiEnabled && (
                        <p className="text-xs font-mono text-[#8C836E]">
                          {currentVocabCard.romaji}
                        </p>
                      )}
                      <p className="text-[11px] text-[#A69E89] mt-3">
                        카드를 클릭하면 한국어 뜻과 예문이 보입니다
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <h3 className="text-2xl font-black text-[#1C1C1E]">
                        {currentVocabCard.korean}
                      </h3>
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E2D9C2] text-xs text-left space-y-1">
                        <div className="flex items-center justify-between font-semibold text-[#1C1C1E]">
                          <span>{currentVocabCard.exampleJp}</span>
                          <button
                            onClick={(e) => playSpeech(currentVocabCard.exampleJp, e)}
                            className="text-[#9A6208] hover:text-black shrink-0 ml-2"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[#7A725D]">{currentVocabCard.exampleKr}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs font-mono text-[#8C836E]">
                  {vocabCardIndex + 1} / {filteredVocab.length}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setVocabFlipped(false);
                    setVocabCardIndex(
                      (prev) => (prev - 1 + filteredVocab.length) % filteredVocab.length
                    );
                  }}
                  className="flex-1 py-3 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  이전 단어
                </button>
                <button
                  onClick={() => {
                    setVocabFlipped(false);
                    setVocabCardIndex((prev) => (prev + 1) % filteredVocab.length);
                    onAddXP(5);
                  }}
                  className="flex-1 py-3 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs rounded-xl shadow-sm border border-gray-900/15 transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  다음 단어
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Vocab List Mode */}
          {vocabViewMode === 'list' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="divide-y divide-[#EADFC7]">
                {filteredVocab.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-4 group hover:bg-white/50 px-2 rounded-xl transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#1C1C1E]">
                          {item.kanji}
                        </span>
                        <span className="text-xs text-[#9A6208] font-medium">
                          ({item.kana})
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#1C1C1E] text-[#F5A623]">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#4A4435]">
                        {item.korean}
                      </p>
                      <p className="text-[11px] text-[#7A725D]">
                        {item.exampleJp} · {item.exampleKr}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => playSpeech(item.kanji)}
                        className="p-2 rounded-xl bg-white border border-[#DDD5BF] hover:bg-[#F2ECE1] text-[#4A4435]"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => toggleSaveWord(item.id, e)}
                        className="p-2 rounded-xl text-[#8C826D] hover:text-[#F5A623]"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            stats.savedVocabIds.includes(item.id)
                              ? 'fill-[#F5A623] text-[#F5A623]'
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
      )}
    </div>
  );
};
