'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdaptiveLearnerState, AdaptiveMessage, JLPTLevel, UserStats } from '@/types';
import {
  loadAdaptiveState,
  saveAdaptiveState,
  initialAdaptiveState,
  processAdaptiveTurn,
} from '@/utils/adaptiveEngine';
import { speechService } from '@/utils/speech';
import {
  Crown,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Sliders,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdaptiveN1ViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const AdaptiveN1View: React.FC<AdaptiveN1ViewProps> = ({ stats, onAddXP }) => {
  const [learnerState, setLearnerState] = useState<AdaptiveLearnerState>(initialAdaptiveState);
  const [messages, setMessages] = useState<AdaptiveMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [levelUpAlert, setLevelUpAlert] = useState<{ oldLevel: JLPTLevel; newLevel: JLPTLevel } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loaded = loadAdaptiveState();
    setLearnerState(loaded);
    initWelcomeChat(loaded.currentLevel);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initWelcomeChat = (level: JLPTLevel) => {
    let welcomeJp = '';
    let welcomeKr = '';
    let replies: { japanese: string; korean: string }[] = [];

    if (level === 'N5') {
      welcomeJp = 'こんにちは！私はあなたの日本語AIチューターです。まずは基礎のN5から、簡単な会話を始めましょう！お名前は何ですか？';
      welcomeKr = '안녕하세요! 저는 당신의 일본어 AI 튜터예요. 우선 기초 N5부터 쉬운 대화를 시작해봐요! 이름이 어떻게 되시나요?';
      replies = [
        { japanese: '私はミンホです。よろしくお願いします！', korean: '저는 민호입니다. 잘 부탁드립니다!' },
        { japanese: 'こんにちは！日本語の勉強を始めました。', korean: '안녕하세요! 일본어 공부를 시작했어요.' },
        { japanese: '初級からゆっくり教えてください。', korean: '초급부터 천천히 가르쳐 주세요.' }
      ];
    } else if (level === 'N4') {
      welcomeJp = 'N4レベルへようこそ！日常会話の表現をどんどん使っていきましょう。最近、何か楽しいことはありましたか？';
      welcomeKr = 'N4 레벨에 오신 것을 환영해요! 일상 회화 표현을 적극적으로 써봐요. 최근 즐거운 일이 있었나요?';
      replies = [
        { japanese: '週末に友達と美味しいものを食べに行きました。', korean: '주말에 친구와 맛있는 것을 먹으러 갔어요.' },
        { japanese: '日本のアニメを見て楽しく過ごしました。', korean: '일본 애니메이션을 보며 즐겁게 보냈어요.' }
      ];
    } else {
      welcomeJp = `こんにちは！現在【${level}】レベルで学習を進めています。今日も一緒に実力を伸ばしていきましょう！`;
      welcomeKr = `안녕하세요! 현재 【${level}】 레벨로 학습을 진행 중입니다. 오늘도 함께 실력을 높여봐요!`;
      replies = [
        { japanese: '今日もよろしくお願いします！', korean: '오늘도 잘 부탁드립니다!' },
        { japanese: 'もっと高度な表現を教えてください。', korean: '더 높은 수준의 표현을 알려주세요.' }
      ];
    }

    const initMsg: AdaptiveMessage = {
      id: `adp-init-${Date.now()}`,
      sender: 'ai',
      japanese: welcomeJp,
      korean: welcomeKr,
      level: level,
      audioText: welcomeJp,
      suggestedReplies: replies,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([initMsg]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');

    const userMsg: AdaptiveMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      japanese: text,
      korean: '내가 입력한 말',
      level: learnerState.currentLevel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { message, updatedState } = await processAdaptiveTurn(
        text,
        learnerState,
        messages,
        stats.aiSettings
      );
      setMessages((prev) => [...prev, message]);
      setLearnerState(updatedState);
      onAddXP(20);

      // Check Level Up!
      if (message.didLevelUp && message.newLevel) {
        setLevelUpAlert({ oldLevel: learnerState.currentLevel, newLevel: message.newLevel });
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      if (stats.soundEnabled && message.audioText) {
        speechService.speak(message.audioText);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleManualLevelSelect = (lvl: JLPTLevel) => {
    const updated: AdaptiveLearnerState = {
      ...learnerState,
      currentLevel: lvl,
      levelProgress: 10,
      notes: [...learnerState.notes, `수동으로 레벨을 [${lvl}] 단계로 조정했습니다.`]
    };
    setLearnerState(updated);
    saveAdaptiveState(updated);
    initWelcomeChat(lvl);
  };

  const handleResetLevel = () => {
    setLearnerState(initialAdaptiveState);
    saveAdaptiveState(initialAdaptiveState);
    initWelcomeChat('N5');
  };

  // Toggle Mic
  const toggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다.');
      return;
    }

    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsMicOn(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.interimResults = false;
      rec.onstart = () => setIsMicOn(true);
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText(transcript);
        setIsMicOn(false);
      };
      rec.onerror = () => setIsMicOn(false);
      rec.onend = () => setIsMicOn(false);
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsMicOn(false);
    }
  };

  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="space-y-6">
      {/* Flagship Header: Adaptive Level Growth System */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                👑 AI 맞춤 1급(N1) 합격 대화
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                나의 상태 실시간 인지 중
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              N5 기초부터 알아서 급수를 높여 1급까지
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              처음부터 어려운 1급 문장을 강요하지 않습니다. <strong>N5 기초부터 시작하여 사용자의 어휘와 문법을 AI가 실시간으로 기억하고 인지</strong>하여, 실력이 쌓이면 자동으로 급수를 높여 1급(N1) 합격까지 이끌어줍니다.
            </p>
          </div>

          {/* Current Level Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl flex flex-col items-center shrink-0 min-w-52 shadow-xl">
            <span className="text-xs font-bold text-slate-300 uppercase">현재 내 급수 단계</span>
            <div className="text-4xl font-black text-amber-300 mt-1 flex items-center gap-1">
              <span>{learnerState.currentLevel}</span>
              <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-200 rounded-full font-bold">
                {learnerState.currentLevel === 'N5' ? '왕초보' : learnerState.currentLevel === 'N4' ? '초급' : learnerState.currentLevel === 'N3' ? '중급' : learnerState.currentLevel === 'N2' ? '상급' : '최고급 1급'}
              </span>
            </div>

            {/* Level progress bar */}
            <div className="w-full mt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>다음 급수 승급까지</span>
                <span>{learnerState.levelProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${learnerState.levelProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Level Pathway Selector */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              급수 단계:
            </span>
            {levels.map((lvl) => {
              const isCurrent = learnerState.currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => handleManualLevelSelect(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-black shadow-lg scale-105 ring-2 ring-white/40'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                  title={`${lvl} 레벨로 즉시 변경`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleResetLevel}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            N5 기초부터 다시 시작
          </button>
        </div>
      </div>

      {/* AI Memory Insights: What AI knows about me */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <strong className="font-bold">AI 인지 상태: </strong>
            <span className="text-slate-600 dark:text-slate-300">
              {learnerState.notes[learnerState.notes.length - 1]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold shrink-0">
          <span>마스터 문법: {learnerState.masteredGrammar.length}개</span>
          <span>·</span>
          <span>누적 회화: {learnerState.totalTurns}턴</span>
        </div>
      </div>

      {/* Level Up Celebration Banner Modal */}
      {levelUpAlert && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <Award className="w-10 h-10 text-amber-300 animate-bounce" />
            <div>
              <h4 className="text-lg font-black">
                🎉 급수 자동 승급 완료! 【{levelUpAlert.oldLevel}】 ➔ 【{levelUpAlert.newLevel}】
              </h4>
              <p className="text-xs text-amber-100">
                실시간 대화에서 높은 정확도를 보여주셔서 다음 단계로 자동 승급되었습니다! 앞으로 {levelUpAlert.newLevel} 레벨 문법과 어휘로 대화합니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLevelUpAlert(null)}
            className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md"
          >
            확인
          </button>
        </div>
      )}

      {/* Main Adaptive Conversation Stream */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-[580px]">
        {/* Chat Stream Header */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
              日
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  nihongo-jlpt 맞춤 AI 튜터
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                  {learnerState.currentLevel} 맞춤 모드
                </span>
              </div>
              <span className="text-xs text-slate-400">말씀하시는 내용에 맞춰 자동으로 어휘와 급수를 높여갑니다</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/40 dark:bg-slate-900/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-start animate-in fade-in duration-200 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white'
                }`}
              >
                {msg.sender === 'user' ? '나' : 'AI'}
              </div>

              <div
                className={`max-w-xl space-y-2.5 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Speech Bubble */}
                <div
                  className={`rounded-2xl p-4 shadow-sm space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-bold ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {msg.sender === 'user' ? '나의 답변' : `AI 튜터 [${msg.level} 단계]`}
                    </span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speechService.speak(msg.audioText || msg.japanese)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="원어민 발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-base font-bold tracking-wide leading-relaxed">
                    {msg.japanese}
                  </p>
                  {stats.romajiEnabled && msg.romaji && (
                    <p className="text-xs font-mono text-slate-400">{msg.romaji}</p>
                  )}
                  <p
                    className={`text-xs ${
                      msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {msg.korean}
                  </p>
                </div>

                {/* Friendly Real-time Sentence Correction */}
                {msg.correction && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5 animate-in slide-in-from-top-1 duration-200 shadow-sm">
                    <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold">
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>원어민다운 자연스러운 교정 피드백</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 line-through">{msg.correction.originalText}</span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">
                        👉 {msg.correction.improvedJapanese}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 pt-1 border-t border-amber-200/60">
                      💡 {msg.correction.feedbackPoint}
                    </p>
                  </div>
                )}

                {/* Suggested Replies */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      터치해서 바로 말해보기 ({msg.level} 표현):
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {msg.suggestedReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply.japanese)}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700/80 border border-indigo-200 dark:border-indigo-800 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-400 transition-all text-xs group shadow-sm"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                            {reply.japanese}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {reply.korean}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>AI가 사용자의 발화를 분석하고 맞춤 급수 답변을 준비하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Speech Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-2xl transition-all ${
                isMicOn
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title={isMicOn ? '듣는 중... (클릭 시 중단)' : '음성으로 말하기 (일본어 음성 인식)'}
            >
              {isMicOn ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isMicOn
                  ? '음성을 인식 중입니다. 일본어로 말씀하세요...'
                  : `[${learnerState.currentLevel} 단계] 일본어로 말해보세요 (한국어 입력도 교정해 드려요)`
              }
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
