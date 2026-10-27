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
    <div className="space-y-6">
      {/* Top Banner for 3-Month Shadowing */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                실전 리스닝 트레이닝
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950 text-xs font-black">
                ✨ 3단계 AI 섀도잉
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              3개월 마스터 로드맵 & 3단계 섀도잉
            </h2>
            <p className="text-xs text-orange-100 max-w-xl">
              무작정 두꺼운 문법책 대신, 실전 문장 채집과 3단계 섀도잉으로 3개월 만에 일본어 귀와 입을 틔우세요!
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span>3개월 독학 로드맵 달성률</span>
            <span>{progressPercent}% ({completedGoalsCount}/{goals.length} 완료)</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('player')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'player'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Headphones className="w-4 h-4" />
          3단계 AI 섀도잉 플레이어
        </button>
        <button
          onClick={() => setSubTab('vault')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'vault'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          실전 문장 채집장 ({sentences.length})
        </button>
        <button
          onClick={() => setSubTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'roadmap'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          3개월 주차별 체크리스트
        </button>
      </div>

      {/* 1. 3-Step Shadowing Player */}
      {subTab === 'player' && currentSentence && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold">
              출처: {currentSentence.source}
            </span>
            <span>
              {currentIndex + 1} / {sentences.length}
            </span>
          </div>

          {/* 3 Step Indicator Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
            <button
              onClick={() => setShadowStep(1)}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 1
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span>1단계</span>
              <span className="hidden sm:inline">귀로만 듣기</span>
            </button>
            <button
              onClick={() => setShadowStep(2)}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 2
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span>2단계</span>
              <span className="hidden sm:inline">자막 보며 이해</span>
            </button>
            <button
              onClick={() => setShadowStep(3)}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                shadowStep === 3
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span>3단계</span>
              <span className="hidden sm:inline">따라 말하기</span>
            </button>
          </div>

          {/* Content Box */}
          <div className="min-h-48 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
            {/* Step 1: Blind Listening */}
            {shadowStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                  <Headphones className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
                    글자를 보지 말고 소리에만 집중하세요
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    원어민의 음절 박자와 억양(인토네이션)을 귀로 먼저 각인시키는 단계입니다.
                  </p>
                </div>
                <button
                  onClick={() => playAudio(currentSentence.japanese)}
                  className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 mx-auto transition-all"
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
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {currentSentence.korean}
                </h4>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 text-left flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{currentSentence.nuanceTip}</p>
                </div>
                <button
                  onClick={() => playAudio(currentSentence.japanese)}
                  className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors mx-auto inline-flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" /> 다시 듣기
                </button>
              </div>
            )}

            {/* Step 3: Shadowing with Mic */}
            {shadowStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200 max-w-lg">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  원어민이 말한 직후 0.5초 뒤에 그림자처럼 똑같이 따라 말하세요!
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentSentence.japanese}
                </h3>
                <p className="text-xs text-slate-500">{currentSentence.korean}</p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => playAudio(currentSentence.japanese, 0.8)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" /> 가이드 음성
                  </button>

                  <button
                    onClick={handleStartShadowing}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                      isRecognizing
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
                    }`}
                  >
                    {isRecognizing ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecognizing ? '음성 분석 중...' : '마이크 켜고 따라 말하기'}</span>
                  </button>
                </div>

                {/* Score & Speech Feedback */}
                {shadowScore !== null && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs space-y-1 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        🎉 섀도잉 일치도: {shadowScore}점
                      </span>
                      <span className="font-extrabold text-purple-600">+20 XP</span>
                    </div>
                    {userSpeechResult && (
                      <p className="text-slate-600 dark:text-slate-400 text-left">
                        내 발음 인식: <strong className="text-slate-900 dark:text-slate-100">{userSpeechResult}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controller Next Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {shadowStep < 3 ? '단계를 순서대로 진행해 보세요' : '섀도잉 완료 후 다음 문장으로'}
            </span>
            <button
              onClick={nextSentence}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>다음 문장 섀도잉</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Sentence Mining Vault */}
      {subTab === 'vault' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                나만의 실전 문장 채집장 (Sentence Mining)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                드라마, 브이로그, 유튜브에서 현지인이 진짜 쓰는 알짜배기 표현만 골라 모아두세요.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              새 문장 채집하기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sentences.map((st) => (
              <div
                key={st.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-600/60 space-y-2 hover:border-orange-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                    {st.source}
                  </span>
                  <button
                    onClick={() => playAudio(st.japanese)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {st.japanese}
                </h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {st.korean}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                  💡 {st.nuanceTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 3-Month Weekly Checklist */}
      {subTab === 'roadmap' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              방구석 3개월 일본어 마스터 로드맵
            </h3>
            <p className="text-xs text-slate-400 mt-1">
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
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 border-l-4 border-orange-500 pl-3">
                  {monthTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {monthGoals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        g.completed
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-700'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-orange-400'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5">
                        {g.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400">
                          {g.month}개월 차 · {g.week}주차
                        </span>
                        <h5
                          className={`text-xs font-bold ${
                            g.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {g.title}
                        </h5>
                        <p className="text-[11px] text-slate-500">{g.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sentence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                새 일본어 표현 채집
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSentence} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  일본어 문장 (한자/가나) *
                </label>
                <input
                  type="text"
                  required
                  value={newJp}
                  onChange={(e) => setNewJp(e.target.value)}
                  placeholder="예: まじで美味しかった！"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  한국어 의미 *
                </label>
                <input
                  type="text"
                  required
                  value={newKr}
                  onChange={(e) => setNewKr(e.target.value)}
                  placeholder="예: 진짜 맛있었어!"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  출처 (드라마/유튜브/브이로그)
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="예: 넷플릭스 일드, 도쿄 카페 브이로그"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  뉘앙스 & 나만의 메모
                </label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="예: 친구들끼리 감탄할 때 자주 쓰는 구어체"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  채집장에 저장 (+25 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
