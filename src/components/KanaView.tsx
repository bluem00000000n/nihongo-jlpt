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
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setKanaType('hiragana');
              setIsQuizMode(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              kanaType === 'hiragana' && !isQuizMode
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            히라가나 (ひらがな)
          </button>
          <button
            onClick={() => {
              setKanaType('katakana');
              setIsQuizMode(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              kanaType === 'katakana' && !isQuizMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            가타카나 (カタカナ)
          </button>
        </div>

        <button
          onClick={startQuiz}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            isQuizMode
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'bg-slate-100 dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          가나 암기 퀴즈 모드
        </button>
      </div>

      {/* Quiz Mode Interface */}
      {isQuizMode && quizCard && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-amber-200 dark:border-amber-900/60 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {kanaType === 'hiragana' ? '히라가나 퀴즈' : '가타카나 퀴즈'}
            </span>
            <button
              onClick={() => setIsQuizMode(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              차트 보기로 돌아가기
            </button>
          </div>

          <div>
            <div className="text-7xl font-black text-slate-900 dark:text-white py-4 font-sans">
              {quizCard.kana}
            </div>
            <button
              onClick={() => speechService.speak(quizCard.kana)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              <Volume2 className="w-3.5 h-3.5" />
              발음 다시 듣기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quizOptions.map((opt) => {
              const isSelected = userSelectedOpt === opt;
              const isCorrectOpt = opt.startsWith(quizCard.romaji);
              let btnClass =
                'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

              if (quizAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500 border-rose-600 text-white font-bold';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswerQuiz(opt)}
                  disabled={quizAnswered}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500">
                예시 단어: <strong className="text-slate-700 dark:text-slate-300">{quizCard.exampleWord?.word}</strong> ({quizCard.exampleWord?.meaning})
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

      {/* Kana 50 Sounds Grid */}
      {!isQuizMode && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700">
            <span>글자를 클릭하면 원어민 음성을 들을 수 있습니다.</span>
            <span>총 {dataset.length}자</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
            {dataset.map((item) => {
              const isSelected = selectedChar?.kana === item.kana;

              return (
                <button
                  key={item.kana}
                  onClick={() => playKana(item)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 group ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 dark:bg-indigo-950/60 dark:border-indigo-600 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-50/70 dark:bg-slate-700/40 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.kana}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {item.romaji}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {item.koreanPronunciation}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Card Detail for selected character */}
          {selectedChar && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {selectedChar.kana}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      [{selectedChar.romaji}] {selectedChar.koreanPronunciation}
                    </span>
                  </div>
                  {selectedChar.exampleWord && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      단어 예시: <strong>{selectedChar.exampleWord.word}</strong> ({selectedChar.exampleWord.meaning})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => speechService.speak(selectedChar.kana)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
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
