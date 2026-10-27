'use client';

import React, { useState } from 'react';
import { GrammarItem, QuizQuestion, UserStats } from '@/types';
import { speechService } from '@/utils/speech';
import { Trophy, CheckCircle2, RotateCcw, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizChallengeViewProps {
  grammarList: GrammarItem[];
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const QuizChallengeView: React.FC<QuizChallengeViewProps> = ({
  grammarList,
  stats,
  onAddXP,
}) => {
  // Aggregate all quizzes from grammar
  const allQuizzes: { quiz: QuizQuestion; grammarTitle: string }[] = grammarList.flatMap((g) =>
    g.quizzes.map((q) => ({ quiz: q, grammarTitle: g.title }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = allQuizzes[currentIndex % (allQuizzes.length || 1)];
  const quiz = currentItem?.quiz;

  const handleWordClick = (word: string) => {
    if (isAnswerChecked) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleOptionClick = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!quiz || isAnswerChecked) return;

    let correct = false;
    if (quiz.type === 'word_order') {
      const correctArr = quiz.correctAnswer as string[];
      correct =
        selectedWords.length === correctArr.length &&
        selectedWords.every((val, index) => val === correctArr[index]);
    } else {
      correct = selectedOption === quiz.correctAnswer;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore((prev) => prev + 1);
      onAddXP(25);
      confetti({
        particleCount: 45,
        spread: 60,
      });
      if (stats.soundEnabled && quiz.audioText) {
        speechService.speak(quiz.audioText);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedWords([]);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedWords([]);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScore(0);
  };

  if (!quiz) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
              nihongo-jlpt 문장 조립 & 문법 챌린지
            </span>
          </div>
          <h2 className="text-2xl font-black">실전 퀴즈 테스트</h2>
          <p className="text-xs text-cyan-100 mt-1">
            단어를 순서대로 터치하거나 올바른 어휘를 완성해 보세요.
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-amber-300">{score}</div>
          <span className="text-xs text-cyan-100">맞춘 개수</span>
        </div>
      </div>

      {/* Quiz Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            관련 문법: {currentItem.grammarTitle}
          </span>
          <span>
            문제 {currentIndex + 1} / {allQuizzes.length}
          </span>
        </div>

        {/* Prompt */}
        <div className="py-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {quiz.prompt}
          </h3>
        </div>

        {/* Word Scramble Mode */}
        {quiz.type === 'word_order' && quiz.words && (
          <div className="space-y-4">
            {/* Answer Display Box */}
            <div className="min-h-16 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-dashed border-indigo-200 dark:border-indigo-900 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic mx-auto">
                  아래 단어들을 순서대로 터치하여 문장을 완성하세요
                </span>
              ) : (
                selectedWords.map((w, idx) => (
                  <button
                    key={`${w}-${idx}`}
                    onClick={() => handleWordClick(w)}
                    disabled={isAnswerChecked}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            {/* Word choices */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {quiz.words.map((w) => {
                const isUsed = selectedWords.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => handleWordClick(w)}
                    disabled={isUsed || isAnswerChecked}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      isUsed
                        ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-400 shadow-sm active:scale-95'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fill Blank Mode */}
        {quiz.type === 'fill_blank' && quiz.options && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {quiz.options.map((opt) => {
              const isSelected = selectedOption === opt;
              let style =
                'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200';

              if (isAnswerChecked) {
                if (opt === quiz.correctAnswer) {
                  style = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                } else if (isSelected) {
                  style = 'bg-rose-500 border-rose-600 text-white font-bold';
                }
              } else if (isSelected) {
                style = 'bg-indigo-600 border-indigo-700 text-white font-bold';
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAnswerChecked}
                  className={`p-4 rounded-xl border text-sm font-bold text-center transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Check or Next Action */}
        {!isAnswerChecked ? (
          <button
            onClick={handleCheckAnswer}
            disabled={
              quiz.type === 'word_order'
                ? selectedWords.length === 0
                : selectedOption === null
            }
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            정답 제출하기 (+25 XP)
          </button>
        ) : (
          <div className="space-y-4 pt-2">
            <div
              className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
                <strong className="font-bold">
                  {isCorrect ? '정답입니다! 완벽해요!' : '아쉽네요! 다시 확인해 보세요.'}
                </strong>
              </div>
              <p className="text-xs mt-1">{quiz.explanation}</p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              다음 문제로 이동하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
