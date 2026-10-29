'use client';

import React, { useState } from 'react';
import { hiraganaData, katakanaData } from '@/data/kana';
import { KanaCharacter, UserStats } from '@/types';
import { speechService } from '@/utils/speech';
import { Volume2, Sparkles, HelpCircle, Check, Shuffle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface KanaViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const KanaView: React.FC<KanaViewProps> = ({ stats, onAddXP }) => {
  const [kanaType, setKanaType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [selectedChar, setSelectedChar] = useState<KanaCharacter | null>(null);

  // Practice Flashcard State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizCard, setQuizCard] = useState<KanaCharacter | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [userSelectedOpt, setUserSelectedOpt] = useState<string | null>(null);

  const dataset = kanaType === 'hiragana' ? hiraganaData : katakanaData;

  const playKana = (char: KanaCharacter) => {
    setSelectedChar(char);
    if (stats.soundEnabled) {
      speechService.speak(char.kana, 0.85);
    }
  };

  const startQuiz = () => {
    setIsQuizMode(true);
    pickNewQuizCard();
  };

  const pickNewQuizCard = () => {
    const randomCard = dataset[Math.floor(Math.random() * dataset.length)];
    // Pick 3 wrong options
    const wrongOptions = dataset
      .filter((d) => d.romaji !== randomCard.romaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((d) => `${d.romaji} (${d.koreanPronunciation})`);

    const correct = `${randomCard.romaji} (${randomCard.koreanPronunciation})`;
    const allOptions = [...wrongOptions, correct].sort(() => 0.5 - Math.random());

    setQuizCard(randomCard);
    setQuizOptions(allOptions);
    setQuizAnswered(false);
    setUserSelectedOpt(null);

    if (stats.soundEnabled) {
      speechService.speak(randomCard.kana);
    }
  };

  const handleAnswerQuiz = (opt: string) => {
    if (quizAnswered || !quizCard) return;
    setUserSelectedOpt(opt);
    setQuizAnswered(true);

    const isCorrect = opt.startsWith(quizCard.romaji);
    if (isCorrect) {
      onAddXP(10);
      confetti({
        particleCount: 25,
        spread: 40,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FDFCF9] p-3.5 sm:p-4 rounded-2xl border border-[#E2D9C8] shadow-xs">
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setKanaType('hiragana');
              setIsQuizMode(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center whitespace-nowrap ${
              kanaType === 'hiragana' && !isQuizMode
                ? 'bg-[#FFE000] text-gray-950 font-black border-gray-900/15 shadow-xs'
                : 'bg-[#FAF7F0] text-[#5A5047] border-[#E2D9C8] hover:bg-[#F3ECE0]'
            }`}
          >
            <span className="whitespace-nowrap">히라가나 (ひらがな)</span>
          </button>
          <button
            onClick={() => {
              setKanaType('katakana');
              setIsQuizMode(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center whitespace-nowrap ${
              kanaType === 'katakana' && !isQuizMode
                ? 'bg-[#FFE000] text-gray-950 font-black border-gray-900/15 shadow-xs'
                : 'bg-[#FAF7F0] text-[#5A5047] border-[#E2D9C8] hover:bg-[#F3ECE0]'
            }`}
          >
            <span className="whitespace-nowrap">가타카나 (カタカナ)</span>
          </button>
        </div>

        <button
          onClick={startQuiz}
          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
            isQuizMode
              ? 'bg-[#2B2725] text-[#FAF7F0] font-black border-[#2B2725] shadow-xs'
              : 'bg-[#FAF7F0] text-[#2B2725] border-[#E2D9C8] hover:bg-[#F3ECE0]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#D93829] shrink-0" />
          <span className="whitespace-nowrap">가나 암기 퀴즈 모드</span>
        </button>
      </div>

      {/* Quiz Mode Interface (Notebook Card) */}
      {isQuizMode && quizCard && (
        <div className="bg-[#FDFCF9] rounded-2xl p-5 sm:p-8 border border-[#E2D9C8] shadow-md max-w-lg mx-auto text-center space-y-6 animate-fade-in text-[#2B2725]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D2]">
            <span className="text-[10px] font-mono font-bold text-[#D93829] uppercase tracking-wider">
              {kanaType === 'hiragana' ? 'HIRAGANA QUIZ' : 'KATAKANA QUIZ'}
            </span>
            <button
              onClick={() => setIsQuizMode(false)}
              className="text-xs text-[#7A6E63] hover:text-[#2B2725] font-semibold"
            >
              차트 보기로 돌아가기
            </button>
          </div>

          <div>
            <div className="text-7xl font-black text-[#2B2725] py-4 font-sans select-none">
              {quizCard.kana}
            </div>
            <button
              onClick={() => speechService.speak(quizCard.kana)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F0] text-xs font-bold text-[#2B2725] hover:bg-[#F3ECE0] border border-[#E2D9C8]"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#7A6E63]" />
              발음 다시 듣기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {quizOptions.map((opt) => {
              const isSelected = userSelectedOpt === opt;
              const isCorrectOpt = opt.startsWith(quizCard.romaji);
              let btnClass =
                'bg-[#FAF7F0] border-[#E2D9C8] text-[#2B2725] hover:border-[#2B2725] font-bold';

              if (quizAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-[#2E7D32] border-[#2E7D32] text-white font-black';
                } else if (isSelected) {
                  btnClass = 'bg-[#D93829] border-[#D93829] text-white font-bold';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswerQuiz(opt)}
                  disabled={quizAnswered}
                  className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm transition-all break-keep break-words ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-[#5A5047] break-keep">
                예시 단어: <strong className="text-[#2B2725]">{quizCard.exampleWord?.word}</strong> ({quizCard.exampleWord?.meaning})
              </p>
              <button
                onClick={pickNewQuizCard}
                className="w-full py-3.5 bg-[#FFE000] hover:bg-[#FACC15] text-[#2B2725] font-black text-sm rounded-xl flex items-center justify-center gap-2 border border-gray-900/15 shadow-sm active:scale-98 transition-all"
              >
                <span>다음 가나 문제</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kana 50 Sounds Grid (Notebook Theme) */}
      {!isQuizMode && (
        <div className="bg-[#FDFCF9] rounded-2xl p-3.5 sm:p-5 border border-[#E2D9C8] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#7A6E63] pb-2 border-b border-[#E8E0D2] font-mono font-medium gap-1">
            <span className="break-keep">글자를 클릭하면 원어민 음성을 들을 수 있습니다.</span>
            <span className="font-bold shrink-0">TOTAL: {dataset.length}자</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
            {dataset.map((item) => {
              const isSelected = selectedChar?.kana === item.kana;

              return (
                <button
                  key={item.kana}
                  onClick={() => playKana(item)}
                  className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 group ${
                    isSelected
                      ? 'bg-[#FFE000] border-[#2B2725] shadow-xs text-[#2B2725]'
                      : 'bg-[#FAF7F0] border-[#E8E0D2] hover:border-[#C8BCAB] text-[#2B2725]'
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-black transition-colors">
                    {item.kana}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] font-bold font-mono mt-0.5 ${isSelected ? 'text-[#2B2725]' : 'text-[#D93829]'}`}>
                    {item.romaji}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-[#2B2725] font-bold' : 'text-[#7A6E63]'}`}>
                    {item.koreanPronunciation}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Card Detail for selected character */}
          {selectedChar && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-[#F5EFE3] border border-[#E2D9C8] flex items-center justify-between text-[#2B2725]">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#2B2725]">
                  {selectedChar.kana}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2B2725] text-xs sm:text-sm">
                      [{selectedChar.romaji}] {selectedChar.koreanPronunciation}
                    </span>
                  </div>
                  {selectedChar.exampleWord && (
                    <p className="text-xs text-[#5A5047] font-medium break-keep">
                      단어 예시: <strong className="text-[#2B2725] font-bold">{selectedChar.exampleWord.word}</strong> ({selectedChar.exampleWord.meaning})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => speechService.speak(selectedChar.kana)}
                className="p-2 sm:p-2.5 rounded-lg bg-[#2B2725] hover:bg-[#3E3835] text-white transition-colors shrink-0 ml-2"
                title="소리 재생"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
