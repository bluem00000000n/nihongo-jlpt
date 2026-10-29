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

      {/* Flagship Header: Mobile Adaptive Level Card (LOFT Stationery Memo Note) */}
      <div className="bg-[#FDFCF9] rounded-2xl p-4 border border-[#E2D9C8] shadow-sm space-y-3.5 relative overflow-hidden">
        {/* Top Stationery Tape Strip & Perforation */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D2] text-[10px] font-mono text-[#78716C] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">ADAPTIVE JLPT</span>
            <span className="text-gray-800">LEVEL MEMO</span>
          </div>
          <div className="flex items-center gap-2">
            <span>P.01</span>
          </div>
        </div>

        {/* Level Status Header */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5">
            {/* Hanko Stamp */}
            <span className="w-9 h-9 rounded-md bg-[#D93829] text-white flex items-center justify-center font-serif font-black text-base shadow-[1px_2px_0px_rgba(0,0,0,0.15)] border border-[#B92B1E]">
              日
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-gray-950 tracking-tight">
                  {learnerState.currentLevel} 단계 대화
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#FFE000] text-gray-950 font-black border border-gray-900/15 shadow-xs">
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
              <p className="text-[11px] text-gray-600 mt-0.5">
                실력에 맞춰 알아서 1급(N1)까지 자동 승급
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlacementModalOpen(true)}
              className="text-[11px] text-gray-800 font-bold flex items-center gap-1 py-1 px-2 rounded-md bg-white hover:bg-gray-50 border border-gray-300 shadow-xs"
              title="5문항 빠른 레벨 진단 테스트"
            >
              <Target className="w-3 h-3 text-[#D93829]" />
              <span>레벨 진단</span>
            </button>
            <button
              onClick={handleResetLevel}
              className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 py-1 px-1.5 rounded-md hover:bg-gray-100"
              title="N5 기초로 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>리셋</span>
            </button>
          </div>
        </div>

        {/* Level Progress Gauge (Stationery Ruler Style) */}
        <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium text-[11px]">
              📏 승급 게이지 (Ruler Gauge)
            </span>
            <span className="font-extrabold text-[#D93829] font-mono">
              {learnerState.levelProgress}%
            </span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 rounded-sm overflow-hidden border border-gray-300">
            {/* Ruler ticks */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
              <span className="border-r border-gray-600 h-full"></span>
              <span className="border-r border-gray-600 h-2"></span>
              <span className="border-r border-gray-600 h-full"></span>
              <span className="border-r border-gray-600 h-2"></span>
              <span className="border-r border-gray-600 h-full"></span>
            </div>
            <div
              className="h-full bg-gradient-to-r from-[#FFE000] to-[#F59E0B] transition-all duration-500"
              style={{ width: `${learnerState.levelProgress}%` }}
            />
          </div>
        </div>

        {/* 5-Step Stepper Selector (Stationery Index Tabs) */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {levels.map((item, idx) => {
            const isCurrent = learnerState.currentLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => handleManualLevelSelect(item.level)}
                className={`py-1.5 rounded-md text-center transition-all ${
                  isCurrent
                    ? 'bg-[#FFE000] text-gray-950 font-extrabold shadow-sm border border-gray-900/20'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-medium'
                }`}
              >
                <div className="text-xs font-bold leading-tight font-mono">{item.level}</div>
                <div className="text-[9px] opacity-80">{item.name}</div>
              </button>
            );
          })}
        </div>

        {/* AI Memory Awareness Note (Yellow Sticky Note Style) */}
        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-[11px] text-amber-950 shadow-xs">
          <Brain className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-extrabold text-amber-900">【AI 메모】 </span>
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

      {/* Main Conversation Card (Dot-Grid Notebook Page) */}
      <div className="bg-[#FDFCF9] rounded-2xl border border-[#E2D9C8] shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Notebook Page Header Strip */}
        <div className="px-4 py-2 bg-[#F5EFE3] border-b border-[#E5DEC9] flex items-center justify-between text-[10px] font-mono text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D93829]" />
            <span className="font-bold text-[#44403C]">CONVERSATION MEMO</span>
          </div>
          <span>GRID 5mm · N1 CHAT</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF7F0] loft-grid-bg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-start ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#FFE000] text-gray-950 border border-gray-900/30'
                    : 'bg-[#D93829] text-white font-serif'
                }`}
              >
                {msg.sender === 'user' ? '私' : '日'}
              </div>

              <div
                className={`max-w-[85%] space-y-2 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Bubble */}
                <div
                  className={`rounded-xl p-3.5 shadow-xs space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-amber-50 text-gray-950 border border-amber-300 rounded-tr-xs font-bold'
                      : 'bg-white text-gray-950 border border-gray-200 border-l-4 border-l-[#D93829] rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        msg.sender === 'user' ? 'text-amber-800' : 'text-gray-500'
                      }`}
                    >
                      {msg.sender === 'user' ? 'USER NOTE' : `AI TUTOR [${msg.level}]`}
                    </span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speechService.speak(msg.audioText || msg.japanese)}
                        className="p-1 rounded-sm text-gray-400 hover:text-gray-700"
                        title="원어민 발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-bold tracking-wide leading-relaxed break-keep break-words">
                    {msg.japanese}
                  </p>
                  {stats.romajiEnabled && msg.romaji && (
                    <p className="text-[11px] font-mono text-gray-500 break-all">{msg.romaji}</p>
                  )}
                  <p
                    className={`text-xs break-keep break-words mt-1 ${
                      msg.sender === 'user' ? 'text-amber-900 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {msg.korean}
                  </p>
                </div>

                {/* Real-time Inline Grammar Correction (Red-Pen Teacher Hanko Style) */}
                {msg.correction && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 shadow-xs animate-slide-up">
                    <div className="flex items-center gap-1.5 text-[#D93829] font-bold text-[11px]">
                      <span className="loft-hanko text-[9px] px-1 py-0.2">添削</span>
                      <span>원어민 첨삭 교정</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-gray-400 line-through mr-1.5">
                        {msg.correction.originalText}
                      </span>
                      <span className="text-[#D93829] font-bold loft-marker">
                        👉 {msg.correction.improvedJapanese}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 pt-1 border-t border-rose-200">
                      💡 {msg.correction.feedbackPoint}
                    </p>
                  </div>
                )}

                {/* Suggested Quick Replies (Perforated Sticky Stub Style) */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D93829]" />
                      QUICK RESPONSE:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {msg.suggestedReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply.japanese)}
                          className="px-3 py-2 rounded-xl bg-[#FDFCF9] border border-dashed border-[#DDD4C1] text-left hover:border-stone-800 transition-all text-xs active:scale-98 shadow-xs"
                        >
                          <span className="font-bold text-[#1C1917] block break-keep break-words">
                            {reply.japanese}
                          </span>
                          <span className="text-[11px] text-stone-500 block mt-0.5 break-keep break-words">
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
            <div className="flex gap-2 items-center text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#D93829] animate-ping" />
              <span>AI가 노트를 작성하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Stationery Pencil Box Style) */}
        <div className="p-2.5 bg-[#FDFCF9] border-t border-[#E2D9C8]">
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
              className={`p-2.5 rounded-lg transition-all border ${
                isMicOn
                  ? 'bg-[#D93829] text-white border-[#B92B1E] animate-pulse'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={isMicOn ? '듣는 중... (터치 시 중단)' : '음성으로 말하기'}
            >
              {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`[${learnerState.currentLevel}] 일본어로 메모 작성`}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-800"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-3.5 py-2 bg-[#FFE000] hover:bg-[#FACC15] disabled:opacity-40 text-gray-950 font-extrabold rounded-lg shadow-xs transition-all active:scale-95 border border-gray-900/20 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
