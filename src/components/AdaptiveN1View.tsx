'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserStats, AdaptiveLearnerState, AdaptiveMessage, JLPTLevel } from '@/types';
import {
  initialAdaptiveState,
  loadAdaptiveState,
  saveAdaptiveState,
  processAdaptiveTurn,
} from '@/utils/adaptiveEngine';
import { speechService } from '@/utils/speech';
import { MicrophonePermissionModal } from '@/components/MicrophonePermissionModal';
import { PlacementTestModal } from '@/components/PlacementTestModal';
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
  Edit3,
  Sliders,
  RotateCcw,
  CheckCircle,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdaptiveN1ViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
}

export const AdaptiveN1View: React.FC<AdaptiveN1ViewProps> = ({ stats, onAddXP }) => {
  const [learnerState, setLearnerState] = useState<AdaptiveLearnerState>(initialAdaptiveState);
  const [messages, setMessages] = useState<AdaptiveMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState<boolean>(false);
  const [levelUpAlert, setLevelUpAlert] = useState<{ oldLevel: JLPTLevel; newLevel: JLPTLevel } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load adaptive learner state on mount & prompt placement test if first time
  useEffect(() => {
    const saved = loadAdaptiveState();
    setLearnerState(saved);
    initWelcomeChat(saved.currentLevel);

    if (!saved.hasCompletedPlacementTest) {
      setIsPlacementModalOpen(true);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initWelcomeChat = (level: JLPTLevel) => {
    let initialJp = 'こんにちは！はじめまして。お名前は何ですか？';
    let initialKr = '안녕하세요! 처음 뵙겠습니다. 성함이 어떻게 되시나요?';
    let initialRomaji = 'Konnichiwa! Hajimemashite. O-namae wa nan desu ka?';
    let replies = [
      { japanese: '私はミンホです。よろしくお願いします！', korean: '저는 민호입니다. 잘 부탁드립니다!' },
      { japanese: 'パクです。日本語を勉強しています。', korean: '박입니다. 일본어를 공부하고 있습니다.' },
    ];

    if (level === 'N4') {
      initialJp = 'こんにちは！今日は天気がいいですね。普段は何をして過ごすのが好きですか？';
      initialKr = '안녕하세요! 오늘은 날씨가 좋네요. 평소에는 무엇을 하며 시간을 보내는 것을 좋아하시나요?';
      initialRomaji = 'Konnichiwa! Kyou wa tenki ga ii desu ne. Fudan wa nani o shite sugosu no ga suki desu ka?';
      replies = [
        { japanese: '音楽を聴いたり、映画を見たりするのが好きです。', korean: '음악을 듣거나 영화를 보는 것을 좋아해요.' },
        { japanese: 'カフェに行って、ゆっくり本を読むのが好きです。', korean: '카페에 가서 느긋하게 책 읽는 걸 좋아해요.' },
      ];
    } else if (level === 'N3') {
      initialJp = '最近、関心を持っているニュースや趣味はありますか？あなたの考えを聞かせてください。';
      initialKr = '최근 관심을 갖고 계신 뉴스나 취미가 있으신가요? 당신의 생각을 들려주세요.';
      initialRomaji = 'Saikin, kanshin o motte iru nyuusu ya shumi wa arimasu ka? Anata no kangae o kikasete kudasai.';
    } else if (level === 'N2' || level === 'N1') {
      initialJp = 'いらっしゃいませ。本日はいかなる議題について意見を交わしましょうか？';
      initialKr = '어서 오십시오. 오늘은 어떤 안건에 대해 의견을 나눠볼까요?';
      initialRomaji = 'Irasshaimase. Honjitsu wa ikanaru gidai ni tsuite iken o kawashimashou ka?';
    }

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        japanese: initialJp,
        romaji: initialRomaji,
        korean: initialKr,
        level: level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: replies,
      },
    ]);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: AdaptiveMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      japanese: textToSend,
      korean: '내가 보낸 메시지',
      level: learnerState.currentLevel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call adaptive engine
    try {
      const { message: aiMsg, updatedState } = await processAdaptiveTurn(
        textToSend,
        learnerState,
        messages,
        stats.aiSettings
      );

      const isPromoted = updatedState.currentLevel !== learnerState.currentLevel;
      if (isPromoted) {
        setLevelUpAlert({ oldLevel: learnerState.currentLevel, newLevel: updatedState.currentLevel });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onAddXP(80);
      } else {
        onAddXP(25);
      }

      setLearnerState(updatedState);
      saveAdaptiveState(updatedState);
      setMessages((prev) => [...prev, aiMsg]);

      if (stats.soundEnabled) {
        speechService.speak(aiMsg.audioText || aiMsg.japanese, 0.88);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleManualLevelSelect = (lvl: JLPTLevel) => {
    const updated = {
      ...learnerState,
      currentLevel: lvl,
      levelProgress: 20,
      notes: [...learnerState.notes, `수동 변경: ${lvl} 단계로 조정되었습니다.`],
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

  const handlePlacementComplete = (lvl: JLPTLevel) => {
    const updated: AdaptiveLearnerState = {
      ...learnerState,
      currentLevel: lvl,
      levelProgress: 15,
      hasCompletedPlacementTest: true,
      notes: [
        ...learnerState.notes,
        `레벨 진단 테스트 완료: 【${lvl}】 단계로 맞춤 설정되었습니다.`,
      ],
    };
    setLearnerState(updated);
    saveAdaptiveState(updated);
    initWelcomeChat(lvl);
  };

  // Pre-flight mic permission check & toggle
  const toggleMic = async () => {
    if (typeof window === 'undefined') return;

    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsMicOn(false);
      return;
    }

    // Check media permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: any) {
        console.warn('Microphone permission required:', err);
        setIsPermissionModalOpen(true);
        return;
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsPermissionModalOpen(true);
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
      rec.onerror = (e: any) => {
        setIsMicOn(false);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setIsPermissionModalOpen(true);
        }
      };
      rec.onend = () => setIsMicOn(false);
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsMicOn(false);
      setIsPermissionModalOpen(true);
    }
  };

  const levels: { level: JLPTLevel; name: string }[] = [
    { level: 'N5', name: '왕초보' },
    { level: 'N4', name: '초급' },
    { level: 'N3', name: '중급' },
    { level: 'N2', name: '상급' },
    { level: 'N1', name: '1급' },
  ];

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setIsPermissionModalOpen(false);
          toggleMic();
        }}
        featureName="AI 튜터 음성 입력"
      />

      {/* Placement Level Test Modal */}
      <PlacementTestModal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        onComplete={handlePlacementComplete}
      />

      {/* Flagship Header: Mobile Adaptive Level Card */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
        {/* Level Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center font-serif font-black text-sm">
              日
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {learnerState.currentLevel} 단계 대화
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-200/60 dark:border-rose-900/40">
                  {learnerState.currentLevel === 'N5'
                    ? '왕초보'
                    : learnerState.currentLevel === 'N4'
                    ? '초급'
                    : learnerState.currentLevel === 'N3'
                    ? '중급'
                    : learnerState.currentLevel === 'N2'
                    ? '상급'
                    : '1급 마스터'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                실력에 맞춰 알아서 1급(N1)까지 자동 승급
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPlacementModalOpen(true)}
              className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 py-1 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100"
              title="5문항 빠른 레벨 진단 테스트"
            >
              <Target className="w-3 h-3" />
              <span>레벨 진단</span>
            </button>
            <button
              onClick={handleResetLevel}
              className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              title="N5 기초로 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>리셋</span>
            </button>
          </div>
        </div>

        {/* Level Progress Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium">다음 승급까지</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
              {learnerState.levelProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full transition-all duration-500"
              style={{ width: `${learnerState.levelProgress}%` }}
            />
          </div>
        </div>

        {/* 5-Step Stepper Selector */}
        <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800/80">
          {levels.map((item) => {
            const isCurrent = learnerState.currentLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => handleManualLevelSelect(item.level)}
                className={`py-1.5 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-rose-600 text-white font-bold shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{item.level}</div>
                <div className="text-[9px] opacity-80">{item.name}</div>
              </button>
            );
          })}
        </div>

        {/* AI Memory Awareness Note */}
        <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-400">
          <Brain className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-stone-800 dark:text-stone-200">AI 인지: </strong>
            {learnerState.notes[learnerState.notes.length - 1]}
          </div>
        </div>
      </div>

      {/* Level Up Banner Alert */}
      {levelUpAlert && (
        <div className="p-4 rounded-3xl bg-rose-600 text-white shadow-lg flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-200 shrink-0 animate-bounce" />
            <div>
              <h4 className="text-sm font-bold">
                🎉 급수 자동 승급: 【{levelUpAlert.oldLevel}】 ➔ 【{levelUpAlert.newLevel}】
              </h4>
              <p className="text-[11px] text-rose-100 mt-0.5">
                실력 향상이 확인되어 {levelUpAlert.newLevel} 단계로 자동 레벨업되었습니다!
              </p>
            </div>
          </div>
          <button
            onClick={() => setLevelUpAlert(null)}
            className="px-3 py-1.5 bg-white text-rose-600 font-bold text-xs rounded-xl shrink-0"
          >
            확인
          </button>
        </div>
      )}

      {/* Main Conversation Card */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF9F5]/50 dark:bg-[#18181B]/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-start ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                }`}
              >
                {msg.sender === 'user' ? '나' : '日'}
              </div>

              <div
                className={`max-w-[85%] space-y-2 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`rounded-2xl p-3.5 shadow-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-[#22211F] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold ${
                        msg.sender === 'user' ? 'text-rose-100' : 'text-stone-400'
                      }`}
                    >
                      {msg.sender === 'user' ? '내가 한 말' : `AI 튜터 [${msg.level}]`}
                    </span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speechService.speak(msg.audioText || msg.japanese)}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                        title="원어민 발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-semibold tracking-wide leading-relaxed">
                    {msg.japanese}
                  </p>
                  {stats.romajiEnabled && msg.romaji && (
                    <p className="text-[11px] font-mono text-stone-400">{msg.romaji}</p>
                  )}
                  <p
                    className={`text-[11px] ${
                      msg.sender === 'user' ? 'text-rose-100' : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {msg.korean}
                  </p>
                </div>

                {/* Real-time Inline Grammar Correction */}
                {msg.correction && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1 shadow-xs animate-slide-up">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>원어민 교정 피드백</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-stone-400 line-through mr-1.5">
                        {msg.correction.originalText}
                      </span>
                      <span className="text-amber-900 dark:text-amber-200 font-bold">
                        👉 {msg.correction.improvedJapanese}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                      💡 {msg.correction.feedbackPoint}
                    </p>
                  </div>
                )}

                {/* Suggested Quick Replies */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      터치해서 바로 답변:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {msg.suggestedReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply.japanese)}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left hover:border-rose-400 transition-all text-xs active:scale-98"
                        >
                          <span className="font-bold text-stone-800 dark:text-stone-100 block">
                            {reply.japanese}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
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
            <div className="flex gap-2 items-center text-xs text-stone-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>AI가 맞춤 답변을 작성하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#1E1D1B] border-t border-stone-200/80 dark:border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Mic Speech Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-xl transition-all ${
                isMicOn
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
              title={isMicOn ? '듣는 중... (터치 시 중단)' : '음성으로 말하기'}
            >
              {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`[${learnerState.currentLevel}] 일본어로 답변해 보세요`}
              className="flex-1 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
