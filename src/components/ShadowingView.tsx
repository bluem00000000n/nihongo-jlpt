'use client';

import React, { useState, useEffect } from 'react';
import { ShadowingSentence, RoadmapGoal, UserStats } from '@/types';
import { initialRoadmapGoals, minedSentencesData } from '@/data/roadmap';
import { speechService } from '@/utils/speech';
import { FuriganaText } from './FuriganaText';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Volume2,
  Headphones,
  Mic,
  MicOff,
  Plus,
  ExternalLink,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Flame,
  Award,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShadowingViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const ShadowingView: React.FC<ShadowingViewProps> = ({ stats, onAddXP }) => {
  const [subTab, setSubTab] = useState<'player' | 'roadmap' | 'vault'>('player');
  const [sentences, setSentences] = useState<ShadowingSentence[]>(minedSentencesData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goals, setGoals] = useState<RoadmapGoal[]>(initialRoadmapGoals);

  // 3-step Shadowing State
  const [shadowStep, setShadowStep] = useState<1 | 2 | 3>(1);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [userSpeechResult, setUserSpeechResult] = useState<string | null>(null);
  const [shadowScore, setShadowScore] = useState<number | null>(null);

  // New sentence modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJp, setNewJp] = useState('');
  const [newKr, setNewKr] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newTip, setNewTip] = useState('');

  const currentSentence = sentences[currentIndex % (sentences.length || 1)];

  // Audio Play
  const playAudio = (text: string, rate: number = 0.85) => {
    if (stats.soundEnabled) {
      speechService.speak(text, rate);
    }
  };

  // Toggle Goal Completed
  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextState = !g.completed;
          if (nextState) {
            onAddXP(30);
            confetti({
              particleCount: 35,
              spread: 50,
            });
          }
          return { ...g, completed: nextState };
        }
        return g;
      })
    );
  };

  // Web Speech recognition for Shadowing evaluation
  const handleStartShadowing = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다.');
      return;
    }

    if (isRecognizing) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecognizing(true);
        setUserSpeechResult(null);
        setShadowScore(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserSpeechResult(transcript);
        setIsRecognizing(false);

        // Simple accuracy comparison
        const targetClean = currentSentence.japanese.replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
        const spokenClean = transcript.replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');

        let score = 70;
        if (targetClean.includes(spokenClean) || spokenClean.includes(targetClean)) {
          score = 95;
        } else if (spokenClean.length > 2) {
          score = 85;
        }

        setShadowScore(score);
        onAddXP(20);
        confetti({
          particleCount: 40,
          spread: 60,
        });
      };

      recognition.onerror = () => {
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecognizing(false);
    }
  };

  const handleAddNewSentence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJp.trim() || !newKr.trim()) return;

    const newItem: ShadowingSentence = {
      id: `custom-${Date.now()}`,
      source: newSource.trim() || '나만의 채집 노트',
      japanese: newJp.trim(),
      romaji: '',
      korean: newKr.trim(),
      nuanceTip: newTip.trim() || '내가 직접 채집한 생생한 실전 표현입니다.',
      month: 2,
    };

    setSentences((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setNewJp('');
    setNewKr('');
    setNewSource('');
    setNewTip('');
    onAddXP(25);
    confetti({
      particleCount: 40,
      spread: 60,
    });
  };

  const nextSentence = () => {
    setShadowStep(1);
    setUserSpeechResult(null);
    setShadowScore(null);
    setCurrentIndex((prev) => (prev + 1) % sentences.length);
  };

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const progressPercent = Math.round((completedGoalsCount / goals.length) * 100);

  return (
    <div className="space-y-4">
      {/* Top Banner for 3-Month Shadowing (Pure White Design) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-[10px] font-mono text-gray-500 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">SHADOWING</span>
            <span className="text-gray-800">3-STEP TRAINING</span>
          </div>
          <span>PROGRESS: {progressPercent}%</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#D93829] text-white flex items-center justify-center font-serif font-black text-sm shadow-xs border border-[#B92B1E]">
                影
              </span>
              <h2 className="text-lg font-black tracking-tight text-gray-950">
                3개월 마스터 로드맵 & 3단계 섀도잉
              </h2>
            </div>
            <p className="text-xs text-gray-600 max-w-xl">
              원어민 소리 집중 ➔ 자막 이해 ➔ 0.5초 섀도잉으로 3개월 만에 일본어 귀와 입을 틔우세요!
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-gray-700">
            <span>3개월 독학 로드맵 달성률</span>
            <span className="font-mono text-red-600 font-black">{progressPercent}% ({completedGoalsCount}/{goals.length} 완료)</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-[#FFE000] to-[#F59E0B] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs (Responsive 3-Column Grid) */}
      <div className="grid grid-cols-3 gap-1.5 border-b border-[#E2D9C8] pb-2.5">
        <button
          onClick={() => setSubTab('player')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all truncate ${
            subTab === 'player'
              ? 'bg-[#1C1917] text-white shadow-xs font-black'
              : 'bg-[#FDFCF9] text-[#57534E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3단계 섀도잉</span>
        </button>
        <button
          onClick={() => setSubTab('vault')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all truncate ${
            subTab === 'vault'
              ? 'bg-[#1C1917] text-white shadow-xs font-black'
              : 'bg-[#FDFCF9] text-[#57534E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">문장 채집장 ({sentences.length})</span>
        </button>
        <button
          onClick={() => setSubTab('roadmap')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all truncate ${
            subTab === 'roadmap'
              ? 'bg-[#1C1917] text-white shadow-xs font-black'
              : 'bg-[#FDFCF9] text-[#57534E] border border-[#DDD5C5] hover:bg-[#F2ECE1]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3개월 로드맵</span>
        </button>
      </div>

      {/* 1. 3-Step Shadowing Player */}
      {subTab === 'player' && currentSentence && (
        <div className="bg-[#FDFCF9] rounded-2xl border border-[#E2D9C8] shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-200 font-bold text-[10px]">
              출처: {currentSentence.source}
            </span>
            <span className="font-mono font-bold">
              {currentIndex + 1} / {sentences.length}
            </span>
          </div>

          {/* 3 Step Indicator Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setShadowStep(1)}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 1
                  ? 'bg-white text-gray-950 font-black shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>1단계</span>
              <span className="hidden sm:inline">귀로만 듣기</span>
            </button>
            <button
              onClick={() => setShadowStep(2)}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 2
                  ? 'bg-white text-gray-950 font-black shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>2단계</span>
              <span className="hidden sm:inline">자막 보며 이해</span>
            </button>
            <button
              onClick={() => setShadowStep(3)}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 3
                  ? 'bg-white text-gray-950 font-black shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>3단계</span>
              <span className="hidden sm:inline">따라 말하기</span>
            </button>
          </div>

          {/* Content Box */}
          <div className="min-h-48 p-6 sm:p-8 rounded-2xl bg-[#FAF7F0] loft-grid-bg border border-[#E2D9C8] flex flex-col items-center justify-center text-center space-y-4">
            {/* Step 1: Blind Listening */}
            {shadowStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-950">
                    글자를 보지 말고 소리에만 집중하세요
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    원어민의 음절 박자와 억양(인토네이션)을 귀로 먼저 각인시키는 단계입니다.
                  </p>
                </div>
                <button
                  onClick={() => playAudio(currentSentence.japanese)}
                  className="px-5 py-2.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs shadow-xs border border-gray-900/15 flex items-center gap-2 mx-auto transition-all active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  원어민 음성 듣기
                </button>
              </div>
            )}

            {/* Step 2: Reading with Meaning */}
            {shadowStep === 2 && (
              <div className="space-y-3 animate-in fade-in duration-200 max-w-lg">
                <FuriganaText
                  japanese={currentSentence.japanese}
                  ruby={currentSentence.ruby}
                  romaji={currentSentence.romaji}
                  showFurigana={stats.furiganaEnabled}
                  showRomaji={stats.romajiEnabled}
                />
                <h4 className="text-base font-bold text-gray-950 mt-2">
                  {currentSentence.korean}
                </h4>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 text-left flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="font-medium">{currentSentence.nuanceTip}</p>
                </div>
                <button
                  onClick={() => playAudio(currentSentence.japanese)}
                  className="p-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors mx-auto inline-flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" /> 다시 듣기
                </button>
              </div>
            )}

            {/* Step 3: Shadowing with Mic */}
            {shadowStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200 max-w-lg">
                <p className="text-xs font-black text-red-600">
                  원어민이 말한 직후 0.5초 뒤에 그림자처럼 똑같이 따라 말하세요!
                </p>
                <h3 className="text-xl font-black text-gray-950">
                  {currentSentence.japanese}
                </h3>
                <p className="text-xs text-gray-600">{currentSentence.korean}</p>

                <div className="flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => playAudio(currentSentence.japanese, 0.8)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 font-bold text-xs flex items-center gap-1.5 hover:bg-gray-100"
                  >
                    <Volume2 className="w-4 h-4" /> 가이드 음성
                  </button>

                  <button
                    onClick={handleStartShadowing}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-xs transition-all border ${
                      isRecognizing
                        ? 'bg-[#D93829] text-white border-[#B92B1E] animate-pulse'
                        : 'bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 border-gray-900/15'
                    }`}
                  >
                    {isRecognizing ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecognizing ? '음성 분석 중...' : '마이크 켜고 따라 말하기'}</span>
                  </button>
                </div>

                {/* Score & Speech Feedback */}
                {shadowScore !== null && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-950">
                        🎉 섀도잉 일치도: {shadowScore}점
                      </span>
                    </div>
                    {userSpeechResult && (
                      <p className="text-gray-700 text-left">
                        내 발음 인식: <strong className="text-gray-950">{userSpeechResult}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controller Next Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 font-medium">
              {shadowStep < 3 ? '단계를 순서대로 진행해 보세요' : '섀도잉 완료 후 다음 문장으로'}
            </span>
            <button
              onClick={nextSentence}
              className="px-5 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs flex items-center gap-1.5 shadow-sm border border-gray-900/15 active:scale-98 transition-all"
            >
              <span>다음 문장 섀도잉</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Sentence Mining Vault */}
      {subTab === 'vault' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-950">
                나만의 실전 문장 채집장 (Sentence Mining)
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                드라마, 브이로그, 유튜브에서 현지인이 진짜 쓰는 알짜배기 표현만 골라 모아두세요.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs shadow-xs border border-gray-900/15 transition-all"
            >
              <Plus className="w-4 h-4" />
              새 문장 채집하기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sentences.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2 hover:border-gray-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-200">
                    {st.source}
                  </span>
                  <button
                    onClick={() => playAudio(st.japanese)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-black text-gray-950">
                  {st.japanese}
                </h4>
                <p className="text-xs font-semibold text-gray-700">
                  {st.korean}
                </p>
                <p className="text-[11px] text-amber-950 bg-amber-50 border border-amber-200 p-2 rounded-lg font-medium">
                  💡 {st.nuanceTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 3-Month Weekly Checklist */}
      {subTab === 'roadmap' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-lg font-black text-gray-950">
              방구석 3개월 일본어 마스터 로드맵
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              주차별 학습 목표를 하나씩 클리어하며 3개월 만에 일본어를 정복하세요!
            </p>
          </div>

          {/* Grouped by month */}
          {[1, 2, 3].map((month) => {
            const monthGoals = goals.filter((g) => g.month === month);
            const monthTitle =
              month === 1
                ? '1개월 차: 기초 귀 뚫기 & 핵심 문형'
                : month === 2
                ? '2개월 차: 실전 문장 채집 & 3단계 섀도잉'
                : '3개월 차: AI 프리토킹 & 입 트이기';

            return (
              <div key={month} className="space-y-3">
                <h4 className="text-xs font-black text-gray-950 border-l-4 border-[#D93829] pl-2.5">
                  {monthTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {monthGoals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        g.completed
                          ? 'bg-emerald-50/60 border-emerald-300 text-gray-700'
                          : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5">
                        {g.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          {g.month}개월 차 · {g.week}주차
                        </span>
                        <h5
                          className={`text-xs font-black ${
                            g.completed ? 'line-through text-gray-400' : 'text-gray-950'
                          }`}
                        >
                          {g.title}
                        </h5>
                        <p className="text-[11px] text-gray-600">{g.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sentence Modal (Pure White) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 text-gray-950">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-black text-gray-950">
                새 일본어 표현 채집
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSentence} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  일본어 문장 (한자/가나) *
                </label>
                <input
                  type="text"
                  required
                  value={newJp}
                  onChange={(e) => setNewJp(e.target.value)}
                  placeholder="예: まじで美味しかった！"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  한국어 의미 *
                </label>
                <input
                  type="text"
                  required
                  value={newKr}
                  onChange={(e) => setNewKr(e.target.value)}
                  placeholder="예: 진짜 맛있었어!"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  출처 (드라마/유튜브/브이로그)
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="예: 넷플릭스 일드, 도쿄 카페 브이로그"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  뉘앙스 & 나만의 메모
                </label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="예: 친구들끼리 감탄할 때 자주 쓰는 구어체"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs shadow-xs border border-gray-900/15"
                >
                  채집장에 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
