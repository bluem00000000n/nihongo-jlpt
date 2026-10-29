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
                  ? 'bg-[#FFE000] text-gray-950 font-black shadow-sm border-gray-900'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-gray-950 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {sc.category}
                  </span>
                  {isCompleted && (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 fill-emerald-100"
                    />
                  )}
                </div>
                <h4 className="text-xs font-black line-clamp-2 leading-snug">{sc.title}</h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] opacity-80 font-mono">
                <span>{sc.level}</span>
                <span>{sc.lines.length}턴</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Roleplay Arena (Warm LOFT Notebook Design) */}
      <div className="bg-[#FDFCF9] rounded-2xl border border-[#E2D9C8] shadow-sm overflow-hidden">
        {/* Scenario Header */}
        <div className="p-4 sm:p-5 bg-[#F5EFE3] text-[#1C1917] border-b border-[#E5DEC9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/80 border border-[#E2D9C8] text-gray-800">
                  {selectedScenario.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FFE000] text-gray-950 border border-gray-900/15">
                  {selectedScenario.level}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-950">{selectedScenario.title}</h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">{selectedScenario.situation}</p>
            </div>

            <button
              onClick={handleResetScenario}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-[#E2D9C8] text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              처음부터 다시하기
            </button>
          </div>
        </div>

        {/* Culture tip bar */}
        {selectedScenario.cultureTip && (
          <div className="px-4 sm:px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong className="font-bold">일본 문화 꿀팁: </strong>
              {selectedScenario.cultureTip}
            </p>
          </div>
        )}

        {/* Chat Stream History */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[480px] overflow-y-auto bg-[#FAF7F0] loft-grid-bg">
          {selectedScenario.lines.slice(0, currentStepIndex + 1).map((line, idx) => {
            const isLatest = idx === currentStepIndex;

            return (
              <div
                key={line.id}
                className={`flex gap-2.5 items-start animate-fade-in ${
                  line.isUser ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow-xs border ${
                    line.isUser
                      ? 'bg-[#FFE000] text-gray-950 border-gray-900/20 font-black'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {line.avatar}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-md rounded-2xl p-3.5 shadow-xs space-y-1.5 ${
                    line.isUser
                      ? 'bg-amber-50 text-gray-950 border border-amber-300 rounded-tr-xs font-bold'
                      : 'bg-white text-gray-950 border border-gray-200 border-l-4 border-l-blue-600 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        line.isUser ? 'text-amber-800' : 'text-gray-500'
                      }`}
                    >
                      {line.speaker}
                    </span>
                    <button
                      onClick={() => playSpeech(line.japanese)}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"
                      title="소리 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>

                  <p className="text-sm font-bold tracking-wide leading-relaxed break-keep break-words">{line.japanese}</p>
                  {stats.romajiEnabled && (
                    <p className="text-[11px] font-mono text-gray-500 break-all">
                      {line.romaji}
                    </p>
                  )}
                  <p
                    className={`text-xs break-keep break-words mt-1 ${
                      line.isUser ? 'text-amber-900 font-medium' : 'text-gray-600'
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
            <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
              <Award className="w-12 h-12 text-[#D93829] mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-black text-gray-950">
                  🎉 실전 회화 완료!
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  모든 대화 턴을 성공적으로 끝마쳤습니다!
                </p>
              </div>
              <button
                onClick={handleResetScenario}
                className="px-6 py-2.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs shadow-xs border border-gray-900/15 transition-all"
              >
                다시 연습하기
              </button>
            </div>
          )}
        </div>

        {/* Action Panel for Current Step */}
        {!isFinished && (
          <div className="p-4 sm:p-5 border-t border-[#E2D9C8] bg-[#FDFCF9]">
            {currentLine.isUser ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D93829] animate-ping" />
                    <span className="text-xs font-black text-gray-950">
                      내 차례 (상황에 맞는 가장 자연스러운 일본어를 선택하세요)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    진행률: {currentStepIndex + 1} / {selectedScenario.lines.length}
                  </span>
                </div>

                {/* Multiple choice roleplay options */}
                <div className="grid grid-cols-1 gap-2">
                  {currentLine.roleplayOptions?.map((opt, i) => {
                    const isSelected = userSelectedOption === i;
                    let style =
                      'bg-white hover:bg-gray-50 border-gray-200 text-gray-950';

                    if (isOptionEvaluated) {
                      if (opt.isCorrect) {
                        style =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                      } else if (isSelected) {
                        style =
                          'bg-rose-50 border-rose-500 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        disabled={isOptionEvaluated}
                        className={`p-3.5 rounded-xl border text-left transition-all ${style}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold break-keep break-words">{opt.text}</p>
                            <p className="text-xs text-gray-600 mt-0.5 break-keep break-words">
                              {opt.korean}
                            </p>
                          </div>
                          {isOptionEvaluated && (
                            <span className="text-xs font-black">
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
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                          : 'bg-rose-50 text-rose-950 border border-rose-200'
                      }`}
                    >
                      <strong className="block font-black mb-0.5">
                        {currentLine.roleplayOptions?.[userSelectedOption]?.isCorrect
                          ? '👏 훌륭합니다!'
                          : '💡 팁:'}
                      </strong>
                      {currentLine.roleplayOptions?.[userSelectedOption]?.explanation}
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3.5 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 border border-gray-900/15 shadow-sm active:scale-98 transition-all"
                    >
                      <span>다음 대화로 계속하기</span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-user line: Click to continue */
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  상대방의 말을 듣고 이해한 후 다음으로 넘어가세요.
                </span>
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs border border-gray-900/15 shadow-sm active:scale-98 transition-all"
                >
                  <span>내 턴으로 넘어가기</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
