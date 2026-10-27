'use client';

import React, { useState } from 'react';
import { GrammarItem, JLPTLevel, UserStats } from '@/types';
import { jlptExamQuestions, JLPTExamQuestion } from '@/data/jlptExams';
import { speechService } from '@/utils/speech';
import { Trophy, CheckCircle2, RotateCcw, Volume2, Sparkles, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizChallengeViewProps {
  grammarList: GrammarItem[];
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const QuizChallengeView: React.FC<QuizChallengeViewProps> = ({
  stats,
  onAddXP,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const filteredQuestions = jlptExamQuestions.filter(
    (q) => selectedLevel === 'ALL' || q.level === selectedLevel
  );

  const currentQ: JLPTExamQuestion | undefined =
    filteredQuestions[currentIndex % (filteredQuestions.length || 1)];

  const handleOptionClick = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerChecked || !selectedOption) return;

    const correct = selectedOption === currentQ.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore((prev) => prev + 1);
      onAddXP(25);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (stats.soundEnabled) {
        speechService.speak(currentQ.correctAnswer);
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setCurrentIndex(0);
    setScore(0);
  };

  if (!currentQ) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 text-center">
        선택한 조건의 기출문제가 없습니다.
      </div>
    );
  }

  const levels: (JLPTLevel | 'ALL')[] = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-10">
      {/* Top Mobile Banner */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  JLPT 공식 기출 테스트
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold border border-emerald-200/60">
                  공식 출제 기준
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                문자·어휘, 문법 형식, 단문 독해 실전 문제풀이
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-rose-600 dark:text-rose-400 font-sans">
              {score}개 정답
            </span>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-stone-100 dark:border-stone-800">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswerChecked(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === lvl
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
            >
              {lvl === 'ALL' ? '전체 급수' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm p-5 space-y-4">
        {/* Question Header & Authority Source */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
              {currentQ.level}
            </span>
            <span className="font-semibold text-stone-600 dark:text-stone-300 text-xs">
              {currentQ.section} · {currentQ.sectionDetail}
            </span>
          </div>

          <span className="text-stone-400 text-[11px] font-mono">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-1 text-[10px] text-stone-400">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>출처: {currentQ.sourceAuthority}</span>
        </div>

        {/* Question Prompt */}
        <div className="py-2">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-relaxed font-sans">
            {currentQ.prompt}
          </h3>
          {currentQ.translation && isAnswerChecked && (
            <p className="text-xs text-stone-500 mt-1.5 leading-snug">
              해석: {currentQ.translation}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((opt, idx) => {
            const isThisSelected = selectedOption === opt;
            let optClass = 'bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-rose-400';

            if (isAnswerChecked) {
              if (opt === currentQ.correctAnswer) {
                optClass = 'bg-emerald-500 border-emerald-600 text-white font-bold';
              } else if (isThisSelected) {
                optClass = 'bg-rose-500 border-rose-600 text-white';
              }
            } else if (isThisSelected) {
              optClass = 'bg-rose-600 border-rose-600 text-white font-bold shadow-xs';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                disabled={isAnswerChecked}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all active:scale-98 flex items-center justify-between ${optClass}`}
              >
                <span>{opt}</span>
                {isAnswerChecked && opt === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Check Answer or Next Question */}
        <div className="pt-2">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
            >
              정답 제출하기
            </button>
          ) : (
            <div className="space-y-3 animate-slide-up">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200'
                }`}
              >
                <span className="font-bold block mb-1">
                  {isCorrect ? '🎉 정답입니다!' : '🤔 오답입니다!'}
                </span>
                <p className="text-[11px] leading-relaxed">
                  💡 {currentQ.explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
              >
                <span>다음 기출문제 풀기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
