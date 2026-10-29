'use client';

import React, { useState } from 'react';
import { JLPTLevel } from '@/types';
import { CheckCircle2, ChevronRight, RotateCcw, Sparkles, X, Target, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (level: JLPTLevel) => void;
}

interface TestQuestion {
  level: JLPTLevel;
  prompt: string;
  subPrompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const placementQuestions: TestQuestion[] = [
  {
    level: 'N5',
    prompt: '私_____会社員です。毎朝7時に起きます。',
    subPrompt: '빈칸에 들어갈 가장 알맞은 기초 조사는?',
    options: ['は', 'を', 'に', 'で'],
    correctAnswer: 'は',
    explanation: '주제를 나타내는 조사 「〜は(~은/는)」가 가장 알맞습니다.',
  },
  {
    level: 'N4',
    prompt: '日本語が分からなかったので、友達が教えて_____。',
    subPrompt: '남이 "나에게" 무언가를 베풀어줄 때 쓰는 수수동사는?',
    options: ['くれました', 'あげました', 'もらいました', 'しました'],
    correctAnswer: 'くれました',
    explanation: '남이 화자(나)에게 친절을 베풀 때는 「〜てくれる」를 사용합니다.',
  },
  {
    level: 'N3',
    prompt: '毎日コツコツ勉強した_____、JLPTに合格できました。',
    subPrompt: '긍정적인 감사 원인(~덕분에)을 나타내는 문형은?',
    options: ['おかげで', 'せいで', 'ために', 'ことに'],
    correctAnswer: 'おかげで',
    explanation: '좋은 결과의 원인을 나타낼 때는 「〜おかげで(~덕분에)」를 씁니다.',
  },
  {
    level: 'N2',
    prompt: '悪天候が続いており、今回のイベントは延期_____。',
    subPrompt: '사정상 어쩔 수 없이 그렇게 해야 함(~하지 않을 수 없다)을 나타내는 표현은?',
    options: ['せざるを得ない', 'わけにはいかない', 'かねない', 'っこない'],
    correctAnswer: 'せざるを得ない',
    explanation: '불가피한 결정을 나타내는 상급 문형은 「〜せざるを得ない」입니다.',
  },
  {
    level: 'N1',
    prompt: '一国の指導者_____、国民の生活と安全を最優先に考えるべきだ。',
    subPrompt: '~의 자격과 신분을 가진 자라면 마땅히 책임을 다해야 함을 나타내는 1급 문형은?',
    options: ['たる者', 'に際して', 'ごとき', 'と相まって'],
    correctAnswer: 'たる者',
    explanation: '높은 지위나 자격에 따르는 도덕적 당위를 표현할 때는 「〜たる者」를 씁니다.',
  },
];

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [diagnosedLevel, setDiagnosedLevel] = useState<JLPTLevel>('N5');
  const [correctCount, setCorrectCount] = useState<number>(0);

  if (!isOpen) return null;

  const currentQ = placementQuestions[currentIdx];

  const handleStartTest = () => {
    setStep('testing');
    setCurrentIdx(0);
    setSelectedAnswers([]);
  };

  const handleSkipToN5 = () => {
    onComplete('N5');
    onClose();
  };

  const handleSelectOption = (opt: string) => {
    const updated = [...selectedAnswers, opt];
    setSelectedAnswers(updated);

    if (currentIdx + 1 < placementQuestions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Evaluate results
      let score = 0;
      placementQuestions.forEach((q, idx) => {
        if (updated[idx] === q.correctAnswer) {
          score += 1;
        }
      });

      setCorrectCount(score);

      // Determine starting level
      let resultLvl: JLPTLevel = 'N5';
      if (score === 5) resultLvl = 'N1';
      else if (score === 4) resultLvl = 'N2';
      else if (score === 3) resultLvl = 'N3';
      else if (score === 2) resultLvl = 'N4';
      else resultLvl = 'N5';

      setDiagnosedLevel(resultLvl);
      setStep('result');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFinish = () => {
    onComplete(diagnosedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col max-h-[90vh] overflow-hidden text-gray-900">
        {/* Top Header Strip */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-[10px] font-mono text-gray-500 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">LEVEL TEST</span>
            <span className="font-bold text-gray-800">DIAGNOSIS SHEET</span>
          </div>
          <span className="font-bold">NO. 001</span>
        </div>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-lg bg-[#D93829] text-white flex items-center justify-center mx-auto text-xl font-serif font-black shadow-[1px_2px_0px_rgba(0,0,0,0.15)] border border-[#B92B1E]">
              日
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-gray-950">
                AI 일본어 맞춤 레벨 진단
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                현재 실력에 꼭 맞는 단계(N5~N1)에서 시작할 수 있도록 <strong className="loft-marker">빠른 5문항 진단</strong>을 진행합니다.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D93829]" />
                <span className="font-extrabold text-gray-950">진단 방식</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-normal">
                기초(N5)부터 1급(N1)까지 핵심 문장 5개를 풀고, 진단된 레벨부터 AI가 자동으로 어휘와 급수를 높여갑니다.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartTest}
                className="w-full py-3 rounded-lg bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-gray-900/20 active:scale-98 transition-all"
              >
                <span>5문항 레벨 진단 시작하기 (1분 소요)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSkipToN5}
                className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-950 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                진단 없이 N5 (왕초보)부터 바로 시작하기
              </button>
            </div>
          </div>
        )}

        {/* Testing Step (Questions 1 to 5) */}
        {step === 'testing' && currentQ && (
          <div className="space-y-4 py-1">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-extrabold text-[#D93829] font-mono">QUESTION {currentIdx + 1} / 5</span>
              <span className="loft-hanko text-[9px] px-1 py-0.2">{currentQ.level}</span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-sm overflow-hidden border border-gray-300">
              <div
                className="h-full bg-gradient-to-r from-[#FFE000] to-[#F59E0B] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / 5) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-[#D93829] space-y-1.5 shadow-xs">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-gray-100 text-gray-700">
                Q{currentIdx + 1}
              </span>
              <h4 className="text-base font-extrabold text-gray-950 leading-snug">
                {currentQ.prompt}
              </h4>
              <p className="text-xs text-gray-600">
                {currentQ.subPrompt}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="p-3 rounded-lg border border-gray-300 bg-white text-gray-950 hover:border-gray-950 hover:bg-gray-50 text-sm font-semibold transition-all active:scale-98 text-center shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleSkipToN5}
                className="text-[11px] text-gray-500 hover:text-gray-800 underline"
              >
                테스트 건너뛰고 N5 기초로 시작
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-lg bg-[#FFE000] text-gray-950 border border-gray-900/30 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-bold block font-mono">DIAGNOSIS COMPLETE ({correctCount} / 5)</span>
              <h3 className="text-2xl font-black text-gray-950">
                【{diagnosedLevel}】 레벨로 시작합니다!
              </h3>
              <p className="text-xs text-gray-600 pt-1 max-w-xs mx-auto leading-relaxed">
                {diagnosedLevel === 'N5'
                  ? '기초 문법과 쉬운 일상 인사부터 차근차근 시작하여 자연스럽게 급수를 높여갑니다.'
                  : diagnosedLevel === 'N4'
                  ? '일상 희망, 조건, 수수동사 등 실전 대화 표현부터 본격적으로 다룹니다.'
                  : diagnosedLevel === 'N3'
                  ? '원인과 인과관계, 상황 설명 등 중급 실전 논리 회화로 바로 진입합니다.'
                  : diagnosedLevel === 'N2'
                  ? '상급 비즈니스 경어와 공식 표현으로 고난도 대화를 나눕니다.'
                  : '최고급 1급(N1) 합격 논설 및 전문 시사 주제로 정상 대화를 진행합니다.'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs text-gray-700 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-gray-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>스마트 상태 영구 저장 완료</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-normal">
                진단된 레벨은 브라우저(LocalStorage)에 안전하게 영구 보존되며, 실력 향상 시 AI가 알아서 다음 급수로 자동 승급합니다.
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-lg bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-extrabold text-xs shadow-xs border border-gray-900/20 active:scale-98 transition-all"
              >
                {diagnosedLevel} 단계로 AI 튜터와 대화 시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
