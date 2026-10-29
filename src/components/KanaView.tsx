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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setKanaType('hiragana');
              setIsQuizMode(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              kanaType === 'hiragana' && !isQuizMode
                ? 'bg-[#FFE000] text-gray-950 font-black border-gray-900/15 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            히라가나 (ひらがな)
          </button>
          <button
            onClick={() => {
              setKanaType('katakana');
              setIsQuizMode(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              kanaType === 'katakana' && !isQuizMode
                ? 'bg-[#FFE000] text-gray-950 font-black border-gray-900/15 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            가타카나 (カタカナ)
          </button>
        </div>

        <button
          onClick={startQuiz}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            isQuizMode
              ? 'bg-gray-950 text-white font-black border-gray-950 shadow-xs'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#D93829]" />
          <span>가나 암기 퀴즈 모드</span>
        </button>
      </div>

      {/* Quiz Mode Interface (Pure White) */}
      {isQuizMode && quizCard && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-fade-in text-gray-950">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider">
              {kanaType === 'hiragana' ? 'HIRAGANA QUIZ' : 'KATAKANA QUIZ'}
            </span>
            <button
              onClick={() => setIsQuizMode(false)}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium"
            >
              차트 보기로 돌아가기
            </button>
          </div>

          <div>
            <div className="text-7xl font-black text-gray-950 py-4 font-sans">
              {quizCard.kana}
            </div>
            <button
              onClick={() => speechService.speak(quizCard.kana)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold text-gray-800 hover:bg-gray-200 border border-gray-200"
            >
              <Volume2 className="w-3.5 h-3.5 text-gray-600" />
              발음 다시 듣기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {quizOptions.map((opt) => {
              const isSelected = userSelectedOpt === opt;
              const isCorrectOpt = opt.startsWith(quizCard.romaji);
              let btnClass =
                'bg-white border-gray-300 text-gray-900 hover:border-gray-900 font-bold';

              if (quizAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-emerald-600 border-emerald-700 text-white font-black';
                } else if (isSelected) {
                  btnClass = 'bg-rose-600 border-rose-700 text-white font-bold';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswerQuiz(opt)}
                  disabled={quizAnswered}
                  className={`p-3.5 rounded-xl border text-sm transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-600">
                예시 단어: <strong className="text-gray-950">{quizCard.exampleWord?.word}</strong> ({quizCard.exampleWord?.meaning})
              </p>
              <button
                onClick={pickNewQuizCard}
                className="w-full py-3.5 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 border border-gray-900/15 shadow-sm active:scale-98 transition-all"
              >
                <span>다음 가나 문제</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kana 50 Sounds Grid (Pure White Design) */}
      {!isQuizMode && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-[11px] text-gray-500 pb-2 border-b border-gray-100 font-mono font-medium">
            <span>글자를 클릭하면 원어민 음성을 들을 수 있습니다.</span>
            <span className="font-bold">TOTAL: {dataset.length}자</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {dataset.map((item) => {
              const isSelected = selectedChar?.kana === item.kana;

              return (
                <button
                  key={item.kana}
                  onClick={() => playKana(item)}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 group ${
                    isSelected
                      ? 'bg-[#FFE000] border-gray-950 shadow-sm text-gray-950'
                      : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
                  }`}
                >
                  <span className="text-2xl font-black transition-colors">
                    {item.kana}
                  </span>
                  <span className={`text-[11px] font-bold font-mono mt-0.5 ${isSelected ? 'text-gray-950' : 'text-red-600'}`}>
                    {item.romaji}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                    {item.koreanPronunciation}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Card Detail for selected character */}
          {selectedChar && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-gray-950">
                  {selectedChar.kana}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-950 text-sm">
                      [{selectedChar.romaji}] {selectedChar.koreanPronunciation}
                    </span>
                  </div>
                  {selectedChar.exampleWord && (
                    <p className="text-xs text-amber-900 mt-0.5 font-medium">
                      단어 예시: <strong className="text-amber-950 font-bold">{selectedChar.exampleWord.word}</strong> ({selectedChar.exampleWord.meaning})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => speechService.speak(selectedChar.kana)}
                className="p-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-white transition-colors"
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
