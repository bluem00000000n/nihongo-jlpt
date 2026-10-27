'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserStats, ComprehensiveReport, DialogueCorrectionItem } from '@/types';
import { speechService } from '@/utils/speech';
import { generateSessionReport } from '@/utils/reportManager';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  FileText,
  Award,
  CheckCircle2,
  Edit3,
  Car,
  Headphones,
  Footprints,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HandsFreeCallViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
  onOpenAISettings: () => void;
}

export const HandsFreeCallView: React.FC<HandsFreeCallViewProps> = ({
  stats,
  onAddXP,
  onOpenAISettings,
}) => {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  // Call history and real-time corrections collected for report
  const [sessionTurns, setSessionTurns] = useState<number>(0);
  const [sessionCorrections, setSessionCorrections] = useState<DialogueCorrectionItem[]>([]);
  const [latestCorrection, setLatestCorrection] = useState<DialogueCorrectionItem | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<{ speaker: string; text: string; kr: string } | null>(null);
  const [finalReport, setFinalReport] = useState<ComprehensiveReport | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Hands-free Call
  const handleStartCall = () => {
    setCallState('calling');
    setCallDuration(0);
    setSessionTurns(0);
    setSessionCorrections([]);
    setLatestCorrection(null);
    setFinalReport(null);

    setTimeout(() => {
      setCallState('connected');
      const greetingJp = 'もしもし！こんにちは。お話しできて嬉しいです！今日はどんな一日でしたか？';
      const greetingKr = '여보세요! 안녕하세요. 이야기 나눌 수 있어 기뻐요! 오늘은 어떤 하루였나요?';

      speakAI(greetingJp, greetingKr);
      startHandsFreeRecognition();
    }, 1600);
  };

  // Speak AI
  const speakAI = async (jp: string, kr: string) => {
    setCurrentSubtitle({ speaker: 'AI 튜터', text: jp, kr });
    setIsAiSpeaking(true);
    await speechService.speak(jp, 0.88);
    setIsAiSpeaking(false);
  };

  // Start continuous Hands-Free recognition
  const startHandsFreeRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsUserSpeaking(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.trim() && !isMuted) {
          handleIncomingUserSpeech(transcript.trim());
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (callState === 'connected' && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Process user speech in hands-free mode
  const handleIncomingUserSpeech = async (userText: string) => {
    setSessionTurns((prev) => prev + 1);
    setCurrentSubtitle({ speaker: '나 (음성)', text: userText, kr: '핸즈프리 발화' });

    // Check if user has connected real ChatGPT or Gemini
    const aiConfig = stats.aiSettings;
    let replyJp = '';
    let replyKr = '';
    let itemCorrection: DialogueCorrectionItem | null = null;

    if (aiConfig && aiConfig.provider !== 'built_in' && aiConfig.apiKey) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            model: aiConfig.model,
            currentLevel: 'N4',
            levelProgress: 50,
            history: [],
            userMessage: userText,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyJp = data.japanese;
          replyKr = data.korean;

          if (data.correction) {
            itemCorrection = {
              id: `cor-${Date.now()}`,
              originalText: data.correction.originalText,
              improvedJapanese: data.correction.improvedJapanese,
              reading: data.correction.reading,
              koreanMeaning: data.correction.koreanMeaning,
              feedbackPoint: data.correction.feedbackPoint,
              timestamp: formatTimer(callDuration),
            };
          }
        }
      } catch (e) {
        console.warn('API error in hands-free, using fallback:', e);
      }
    }

    // Smart fallback if no API or error
    if (!replyJp) {
      const lower = userText.toLowerCase();

      // Check for common learner mistakes to give instant verbal correction
      if (userText.includes('ご飯を食べました') || userText.includes('食べた')) {
        replyJp = 'いいですね！美味しいものを食べると元気が出ますよね。何を食べたんですか？';
        replyKr = '좋네요! 맛있는 걸 먹으면 힘이 나죠. 무엇을 드셨나요?';
      } else if (lower.includes('힘들') || userText.includes('疲れた') || userText.includes('忙しい')) {
        replyJp = 'そうなんですね…本当にお疲れ様でした！無理しないで、休める時はゆっくり休んでくださいね。';
        replyKr = '그렇군요… 정말 수고 많으셨어요! 무리하지 마시고 쉴 수 있을 땐 푹 쉬세요.';
      } else if (userText.length < 5) {
        replyJp = 'なるほど！もっと詳しく教えてくれますか？ドライブや散歩中ですか？';
        replyKr = '그렇군요! 조금 더 자세히 이야기해 주실 수 있나요? 지금 드라이브나 산책 중이신가요?';
        itemCorrection = {
          id: `cor-${Date.now()}`,
          originalText: userText,
          improvedJapanese: `${userText}と思います。`,
          reading: '...to omoimasu.',
          koreanMeaning: '...라고 생각합니다.',
          feedbackPoint: '짧게 끊어 말하기보다 문장 끝에 「〜と思います(~라고 생각해요)」를 붙이면 훨씬 자연스러운 원어민 억양이 됩니다.',
          timestamp: formatTimer(callDuration),
        };
      } else {
        replyJp = 'うんうん、よく分かりました！とても自然な話し方ですね。他にはどんなことに興味がありますか？';
        replyKr = '응응, 잘 이해했어요! 아주 자연스러운 말투네요. 그 밖에는 어떤 것에 관심이 있으신가요?';
      }
    }

    if (itemCorrection) {
      setSessionCorrections((prev) => [...prev, itemCorrection!]);
      setLatestCorrection(itemCorrection);
    }

    await speakAI(replyJp, replyKr);
  };

  // End Hands-free Call & Generate Report
  const handleEndCall = () => {
    speechService.stop();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setCallState('ended');
    setIsAiSpeaking(false);

    // Generate comprehensive session report
    const report = generateSessionReport(
      callDuration,
      sessionTurns,
      'N4',
      sessionCorrections,
      ['もしもし', 'お疲れ様', '元気', '散歩', '美味しい']
    );

    setFinalReport(report);
    onAddXP(50);
    confetti({
      particleCount: 80,
      spread: 80,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Hands-Free Voice Call */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                콜 모드 (Hands-Free)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                화면 터치 0회 · 100% 음성 통화
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              운전이나 산책하며 실제 전화하듯 말로만 주고받는 모드
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              스마트폰을 주머니에 넣고 이어폰만 꽂으세요. 말을 멈추면 AI가 자동으로 인지하여 원어민 목소리로 대답하며, 통화가 끝나면 <strong>종합 교정 리포트</strong>를 제공합니다.
            </p>
          </div>

          <button
            onClick={onOpenAISettings}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 엔진 설정 ({stats.aiSettings?.provider === 'built_in' ? '내장' : stats.aiSettings?.provider})</span>
          </button>
        </div>

        {/* Feature Icons Bar */}
        <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs font-bold text-emerald-100">
          <div className="flex items-center justify-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-300" />
            <span>차량 운전 중 회화</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Footprints className="w-4 h-4 text-emerald-300" />
            <span>출퇴근 산책 중 통화</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>종료 후 종합 피드백</span>
          </div>
        </div>
      </div>

      {/* Main Hands-Free Calling Interface */}
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-900 text-white rounded-[40px] border-4 border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[580px] relative overflow-hidden">
          {/* Top Phone Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
            <span className="font-semibold">Hands-Free Call</span>
            <div className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${callState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{callState === 'connected' ? '음성 감지 중' : '대기 중'}</span>
            </div>
          </div>

          {/* Central Call Visualizer Orb */}
          <div className="text-center my-auto space-y-5">
            <div className="relative inline-block">
              {/* Pulsing Visualizer Waves when AI or User talks */}
              {callState === 'connected' && (
                <div
                  className={`w-40 h-40 rounded-full blur-2xl absolute -inset-6 transition-all duration-300 ${
                    isAiSpeaking
                      ? 'bg-emerald-500/30 animate-pulse scale-125'
                      : 'bg-indigo-500/20 animate-ping opacity-40'
                  }`}
                />
              )}

              {/* Calling Orb Avatar */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl border-4 relative z-10 transition-all duration-300 ${
                  callState === 'connected'
                    ? isAiSpeaking
                      ? 'border-emerald-400 bg-slate-800 ring-8 ring-emerald-500/30 scale-105'
                      : 'border-indigo-400 bg-slate-800 ring-8 ring-indigo-500/20'
                    : 'border-slate-700 bg-slate-800'
                }`}
              >
                {callState === 'connected' ? '🎙️' : '🎧'}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">nihongo AI 원어민 튜터</h3>
              <p className="text-xs text-slate-400 mt-1">24시간 언제든 대화하는 실시간 음성 통화</p>

              {callState === 'calling' && (
                <p className="text-xs text-amber-400 font-bold mt-3 animate-pulse">
                  전화 연결 중... (따르릉~)
                </p>
              )}

              {callState === 'connected' && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded-full text-xs font-mono font-bold shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{formatTimer(callDuration)} 통화 중</span>
                </div>
              )}
            </div>

            {/* Real-time Subtitles */}
            {callState === 'connected' && currentSubtitle && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-1 max-h-32 overflow-y-auto animate-in fade-in">
                <span className="text-[10px] font-bold text-emerald-400 block">
                  {currentSubtitle.speaker}:
                </span>
                <p className="font-bold text-white text-sm leading-relaxed">
                  {currentSubtitle.text}
                </p>
                <p className="text-slate-400 text-[11px]">{currentSubtitle.kr}</p>
              </div>
            )}

            {/* Live Verbal Correction Popup during Call */}
            {callState === 'connected' && latestCorrection && (
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-left text-xs space-y-1 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>실시간 교정 제안</span>
                </div>
                <p className="text-amber-200">
                  👉 <strong className="text-white">{latestCorrection.improvedJapanese}</strong>
                </p>
                <p className="text-[11px] text-amber-300/80">{latestCorrection.feedbackPoint}</p>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-4 border-t border-slate-800">
            {callState === 'connected' ? (
              <div className="flex items-center justify-around px-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full text-xs font-bold transition-all ${
                    isMuted ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'
                  }`}
                  title={isMuted ? '음소거 해제' : '마이크 음소거'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Big Red End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 transition-all active:scale-95"
                  title="통화 종료 및 종합 리포트 생성"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
            ) : callState === 'calling' ? (
              <div className="flex justify-center">
                <button
                  onClick={() => setCallState('idle')}
                  className="p-4 rounded-full bg-rose-600 text-white shadow-lg"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            ) : callState === 'ended' && finalReport ? (
              /* Comprehensive Session Report After Call */
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-black text-emerald-400 text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> 통화 종합 피드백 리포트
                    </span>
                    <span className="font-extrabold text-purple-400 text-sm">+50 XP 획득</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900/60">
                      <span className="text-[10px] text-slate-400 block">통화 시간</span>
                      <strong className="text-sm text-white">{formatTimer(finalReport.durationSeconds)}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60">
                      <span className="text-[10px] text-slate-400 block">문법 정확도 점수</span>
                      <strong className="text-sm text-emerald-400">{finalReport.grammarAccuracyScore}점</strong>
                    </div>
                  </div>

                  {/* Corrections List */}
                  {finalReport.corrections.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        오늘의 문장 교정 리스트 ({finalReport.corrections.length}건):
                      </span>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {finalReport.corrections.map((cor) => (
                          <div
                            key={cor.id}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] space-y-1"
                          >
                            <div className="flex items-start gap-1.5">
                              <span className="text-slate-400 line-through shrink-0">{cor.originalText}</span>
                              <span className="text-emerald-400 font-bold">👉 {cor.improvedJapanese}</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">💡 {cor.feedbackPoint}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-semibold">
                      👏 문법 오류 없이 대단히 매끄럽고 유창하게 대화를 완료하셨습니다!
                    </p>
                  )}

                  {/* AI Summary */}
                  <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-900 text-indigo-200 text-[11px] leading-relaxed">
                    <strong>AI 총평: </strong> {finalReport.aiSummary}
                  </div>
                </div>

                <button
                  onClick={() => setCallState('idle')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
                >
                  새 통화 시작하기
                </button>
              </div>
            ) : (
              /* Idle: Big Green Start Call Button */
              <div className="flex items-center justify-center">
                <button
                  onClick={handleStartCall}
                  className="flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Phone className="w-5 h-5 animate-bounce" />
                  <span>핸즈프리 통화 시작</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
