'use client';

import React, { useState } from 'react';
import { DialogueScenario, UserStats } from '@/types';
import { speechService } from '@/utils/speech';
import {
  MessageSquareText,
  Volume2,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
  RotateCcw,
  Play,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DialogueViewProps {
  scenarios: DialogueScenario[];
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onAddXP: (amount: number) => void;
}

export const DialogueView: React.FC<DialogueViewProps> = ({
  scenarios,
  stats,
  onUpdateStats,
  onAddXP,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DialogueScenario>(scenarios[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [isOptionEvaluated, setIsOptionEvaluated] = useState<boolean>(false);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);

  const currentLine = selectedScenario.lines[currentStepIndex];
  const isFinished = currentStepIndex >= selectedScenario.lines.length;

  const playSpeech = (text: string) => {
    if (stats.soundEnabled) {
      speechService.speak(text);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (isOptionEvaluated) return;
    setUserSelectedOption(optIndex);
    setIsOptionEvaluated(true);

    const option = currentLine?.roleplayOptions?.[optIndex];
    if (option) {
      playSpeech(option.text);
      if (option.isCorrect) {
        onAddXP(20);
        confetti({
          particleCount: 40,
          spread: 60,
        });
      }
    }
  };

  const handleNextStep = () => {
    setUserSelectedOption(null);
    setIsOptionEvaluated(false);
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    if (nextIndex < selectedScenario.lines.length) {
      const nextLine = selectedScenario.lines[nextIndex];
      // Automatically read non-user lines
      if (!nextLine.isUser && stats.soundEnabled) {
        setTimeout(() => {
          playSpeech(nextLine.japanese);
        }, 300);
      }
    } else {
      // Completed scenario
      if (!stats.completedDialogueIds.includes(selectedScenario.id)) {
        onUpdateStats({
          completedDialogueIds: [...stats.completedDialogueIds, selectedScenario.id],
        });
        onAddXP(50);
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleResetScenario = () => {
    setCurrentStepIndex(0);
    setUserSelectedOption(null);
    setIsOptionEvaluated(false);
    setIsPlayingAuto(false);
    speechService.stop();
  };

  const handleSelectScenario = (sc: DialogueScenario) => {
    setSelectedScenario(sc);
    setCurrentStepIndex(0);
    setUserSelectedOption(null);
    setIsOptionEvaluated(false);
    setIsPlayingAuto(false);
    speechService.stop();
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Scenario Category / Selector Cards (Horizontal swipe for mobile) */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          const isCompleted = stats.completedDialogueIds.includes(sc.id);

          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`min-w-[160px] p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between shrink-0 ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20 border-rose-600'
                  : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-rose-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sc.category}
                  </span>
                  {isCompleted && (
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-emerald-500'
                      }`}
                    />
                  )}
                </div>
                <h4 className="text-xs font-bold line-clamp-2 leading-snug">{sc.title}</h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] opacity-80">
                <span>{sc.level}</span>
                <span>{sc.lines.length}턴</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Roleplay Arena */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Scenario Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
                  {selectedScenario.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
                  {selectedScenario.level}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{selectedScenario.title}</h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl">{selectedScenario.situation}</p>
            </div>

            <button
              onClick={handleResetScenario}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              처음부터 다시하기
            </button>
          </div>
        </div>

        {/* Culture tip bar */}
        {selectedScenario.cultureTip && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-bold">일본 문화 꿀팁: </strong>
              {selectedScenario.cultureTip}
            </p>
          </div>
        )}

        {/* Chat Stream History */}
        <div className="p-6 space-y-5 max-h-[480px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
          {selectedScenario.lines.slice(0, currentStepIndex + 1).map((line, idx) => {
            const isLatest = idx === currentStepIndex;

            return (
              <div
                key={line.id}
                className={`flex gap-3 items-start animate-in fade-in duration-300 ${
                  line.isUser ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                    line.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {line.avatar}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-md rounded-2xl p-4 shadow-sm space-y-1.5 ${
                    line.isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-bold ${
                        line.isUser ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <button
                      onClick={() => playSpeech(line.japanese)}
                      className={`p-1 rounded-lg transition-colors ${
                        line.isUser
                          ? 'hover:bg-indigo-700 text-indigo-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                      }`}
                      title="소리 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-base font-bold tracking-wide">{line.japanese}</p>
                  {stats.romajiEnabled && (
                    <p
                      className={`text-xs font-mono ${
                        line.isUser ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {line.romaji}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      line.isUser ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {line.korean}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Finished Celebration Banner */}
          {isFinished && (
            <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in zoom-in-95 duration-300">
              <Award className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <div>
                <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                  🎉 실전 회화 완료!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  모든 대화 턴을 성공적으로 끝마쳤습니다!
                </p>
              </div>
              <button
                onClick={handleResetScenario}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                다시 연습하기
              </button>
            </div>
          )}
        </div>

        {/* Action Panel for Current Step */}
        {!isFinished && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {currentLine.isUser ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      내 차례 (상황에 맞는 가장 자연스러운 일본어를 선택하세요)
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    진행률: {currentStepIndex + 1} / {selectedScenario.lines.length}
                  </span>
                </div>

                {/* Multiple choice roleplay options */}
                <div className="grid grid-cols-1 gap-2.5">
                  {currentLine.roleplayOptions?.map((opt, i) => {
                    const isSelected = userSelectedOption === i;
                    let style =
                      'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100';

                    if (isOptionEvaluated) {
                      if (opt.isCorrect) {
                        style =
                          'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200';
                      } else if (isSelected) {
                        style =
                          'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        disabled={isOptionEvaluated}
                        className={`p-4 rounded-xl border text-left transition-all ${style}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold">{opt.text}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {opt.korean}
                            </p>
                          </div>
                          {isOptionEvaluated && (
                            <span className="text-sm font-bold">
                              {opt.isCorrect ? '✅ 정답' : '❌ 오답'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback box */}
                {isOptionEvaluated && userSelectedOption !== null && (
                  <div className="space-y-3 pt-2">
                    <div
                      className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                        currentLine.roleplayOptions?.[userSelectedOption]?.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200'
                      }`}
                    >
                      <strong className="block font-bold mb-0.5">
                        {currentLine.roleplayOptions?.[userSelectedOption]?.isCorrect
                          ? '👏 훌륭합니다!'
                          : '💡 팁:'}
                      </strong>
                      {currentLine.roleplayOptions?.[userSelectedOption]?.explanation}
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      <span>다음 대화로 계속하기</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-user line: Click to continue */
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  상대방의 말을 듣고 이해한 후 다음으로 넘어가세요.
                </span>
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
                >
                  <span>내 턴으로 넘어가기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
