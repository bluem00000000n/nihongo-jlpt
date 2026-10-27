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
      {/* Top Mobile Banner (LOFT Test Booklet Header) */}
      <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#FFE000] text-black font-black text-[9px] rounded-xs shadow-xs">LOFT EXAM</span>
            <span>OFFICIAL JLPT STANDARD</span>
          </div>
          <span>QUESTION SHEET</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-[#D93829] text-white flex items-center justify-center font-serif font-black text-sm shadow-[1px_2px_0px_rgba(0,0,0,0.15)]">
              試
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  JLPT 공식 기출 테스트
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 font-extrabold border border-stone-800/20 shadow-xs">
                  공식 기준
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                문자·어휘, 문법 형식, 단문 독해 실전 문제풀이
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-[#D93829] font-mono">
              {score}개 정답
            </span>
          </div>
        </div>

        {/* Level Filters (Stationery Index Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswerChecked(false);
              }}
              className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === lvl
                  ? 'bg-[#FFE000] text-stone-900 font-extrabold shadow-xs border border-stone-800/30'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-[#DDD5C5] dark:border-stone-700 hover:bg-[#F4EFE4]'
              }`}
            >
              {lvl === 'ALL' ? '전체 급수' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card (LOFT Notebook Exam Page) */}
      <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] p-4 sm:p-5 space-y-4">
        {/* Question Header & Authority Source */}
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[#E5DEC9] dark:border-stone-800">
          <div className="flex items-center gap-1.5">
            <span className="loft-hanko text-[9px] px-1 py-0.2">
              {currentQ.level}
            </span>
            <span className="font-bold text-stone-700 dark:text-stone-300 text-xs font-sans">
              {currentQ.section} · {currentQ.sectionDetail}
            </span>
          </div>

          <span className="text-stone-500 text-[11px] font-mono">
            NO. {currentIndex + 1} / {filteredQuestions.length}
          </span>
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-1 text-[10px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>공식 출처: {currentQ.sourceAuthority}</span>
        </div>

        {/* Question Prompt */}
        <div className="p-3 bg-white dark:bg-[#22201D] rounded-xl border border-[#E5DEC9] dark:border-stone-750 border-l-4 border-l-[#D93829] shadow-xs">
          <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 leading-relaxed font-sans">
            {currentQ.prompt}
          </h3>
          {currentQ.translation && isAnswerChecked && (
            <p className="text-xs text-stone-500 mt-2 leading-snug pt-2 border-t border-dashed border-stone-200 dark:border-stone-700">
              해석: {currentQ.translation}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((opt, idx) => {
            const isThisSelected = selectedOption === opt;
            let optClass = 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-[#DDD5C5] dark:border-stone-700 hover:border-stone-800';

            if (isAnswerChecked) {
              if (opt === currentQ.correctAnswer) {
                optClass = 'bg-[#10B981] border-emerald-600 text-white font-bold shadow-xs';
              } else if (isThisSelected) {
                optClass = 'bg-[#D93829] border-[#B92B1E] text-white';
              }
            } else if (isThisSelected) {
              optClass = 'bg-[#FFE000] border-stone-900 text-stone-900 font-extrabold shadow-[1px_2px_0px_rgba(0,0,0,0.15)]';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                disabled={isAnswerChecked}
                className={`w-full p-3 rounded-lg border text-left text-xs font-medium transition-all active:scale-98 flex items-center justify-between shadow-xs ${optClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-sm bg-black/5 dark:bg-white/10 flex items-center justify-center font-mono font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>
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
              className="w-full py-2.5 rounded-lg bg-[#FFE000] hover:bg-[#FACC15] disabled:opacity-40 text-stone-900 font-extrabold text-xs shadow-xs transition-all active:scale-98 border border-stone-800/20"
            >
              정답 제출하기
            </button>
          ) : (
            <div className="space-y-3 animate-slide-up">
              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed shadow-xs ${
                  isCorrect
                    ? 'bg-[#ECFDF5] dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200'
                    : 'bg-[#FFF1F2] dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="loft-hanko text-[9px] px-1 py-0.2">
                    {isCorrect ? '正解' : '解説'}
                  </span>
                  <span className="font-extrabold">
                    {isCorrect ? '🎉 정답입니다!' : '🤔 오답입니다!'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  💡 {currentQ.explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-extrabold text-xs flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
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
