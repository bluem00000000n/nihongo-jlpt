'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserStats, ComprehensiveReport, DialogueCorrectionItem } from '@/types';
import { speechService } from '@/utils/speech';
import { generateSessionReport } from '@/utils/reportManager';
import { MicrophonePermissionModal } from '@/components/MicrophonePermissionModal';
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
  ShieldAlert,
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
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);

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

  // Pre-flight microphone permission check for Apple & Android
  const checkMicAndStartCall = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop audio tracks so hardware mic indicator resets
        stream.getTracks().forEach((track) => track.stop());

        // Audio Context unlock for iOS Safari
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              await ctx.resume();
            }
          }
        } catch {}

        // Permission is clean, start call
        handleStartCall();
      } catch (err: any) {
        console.warn('Microphone permission check failed:', err);
        setIsPermissionModalOpen(true);
      }
    } else {
      setIsPermissionModalOpen(true);
    }
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
    }, 1500);
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

    if (!SpeechRecognition) {
      setIsPermissionModalOpen(true);
      return;
    }

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

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsPermissionModalOpen(true);
        }
      };

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
      setIsPermissionModalOpen(true);
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
              reading: data.correction.reading || '',
              koreanMeaning: data.correction.koreanMeaning || '',
              feedbackPoint: data.correction.explanation || data.correction.feedbackPoint || '원어민 뉘앙스 교정',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
        }
      } catch (e) {
        console.error('LLM API error during call:', e);
      }
    }

    // Fallback response generator if API empty
    if (!replyJp) {
      const lower = userText.toLowerCase();
      if (lower.includes('元気') || lower.includes('げんき') || lower.includes('おつかれ') || lower.includes('좋아')) {
        replyJp = 'それは良かったです！散歩中ですか？それとも運転中ですか？気をつけてお話ししましょうね。';
        replyKr = '다행이네요! 산책 중이신가요, 아니면 운전 중이신가요? 안전에 유의하며 이야기 나눠요.';
      } else if (lower.includes('仕事') || lower.includes('つかれた') || lower.includes('힘들')) {
        replyJp = '今日もお仕事大変お疲れ様でした。温かいお茶でも飲んで、ゆっくり休んでくださいね。';
        replyKr = '오늘도 일하시느라 정말 고생 많으셨어요. 따뜻한 차라도 드시면서 편히 쉬세요.';
        itemCorrection = {
          id: `cor-${Date.now()}`,
          originalText: userText,
          improvedJapanese: '仕事で少し疲れました。',
          reading: 'しごとですこしつかれました。',
          koreanMeaning: '일 때문에 조금 피곤했습니다.',
          feedbackPoint: '피곤함을 표현할 때는 〜で疲れました 또는 〜て大変でした 형식을 쓰면 자연스럽습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        replyJp = 'なるほど！とても自然な日本語ですね。次は今週末のご予定について教えていただけますか？';
        replyKr = '그렇군요! 매우 자연스러운 일본어예요. 다음은 이번 주말 계획에 대해 말씀해 주시겠어요?';
      }
    }

    if (itemCorrection) {
      setLatestCorrection(itemCorrection);
      setSessionCorrections((prev) => [...prev, itemCorrection!]);
    }

    // AI replies via voice
    await speakAI(replyJp, replyKr);
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    } else if (isMuted && callState === 'connected') {
      startHandsFreeRecognition();
    }
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
      particleCount: 60,
      spread: 70,
    });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setIsPermissionModalOpen(false);
          handleStartCall();
        }}
        featureName="핸즈프리 보이스 통화"
      />

      {/* Top Mobile Card: Introduction & Context (LOFT Stationery Call Note) */}
      <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#FFE000] text-black font-black text-[9px] rounded-xs shadow-xs">LOFT CALL</span>
            <span>HANDS-FREE AUDIO</span>
          </div>
          <span>REALTIME SPEECH</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-[#D93829] text-white flex items-center justify-center font-bold text-sm shadow-[1px_2px_0px_rgba(0,0,0,0.15)]">
              話
            </span>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                콜 모드 (Hands-Free)
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                운전 · 산책 중 100% 음성 전화 통화
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAISettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-stone-800 border border-[#DDD5C5] dark:border-stone-700 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-[#F2ECE1] shadow-xs"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{stats.aiSettings?.provider === 'built_in' ? '내장 AI' : stats.aiSettings?.provider}</span>
          </button>
        </div>

        {/* 3 Practical situations */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-200/80 dark:border-stone-800/80 text-center">
          <div className="p-2 rounded-lg bg-white dark:bg-stone-850 border border-[#DDD5C5] dark:border-stone-800 shadow-xs">
            <Car className="w-3.5 h-3.5 mx-auto text-stone-700 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 block">차량 운전</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-stone-850 border border-[#DDD5C5] dark:border-stone-800 shadow-xs">
            <Footprints className="w-3.5 h-3.5 mx-auto text-stone-700 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 block">산책 · 조깅</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-stone-850 border border-[#DDD5C5] dark:border-stone-800 shadow-xs">
            <FileText className="w-3.5 h-3.5 mx-auto text-stone-700 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 block">종합 리포트</span>
          </div>
        </div>
      </div>

      {/* Main Calling Card (Sumi Ink Notebook Slate) */}
      <div className="bg-[#24221F] text-stone-100 rounded-2xl border border-[#3A3631] shadow-xl p-5 flex flex-col justify-between min-h-[480px] relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-stone-400 relative z-10 border-b border-stone-700/60 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFE000] animate-pulse" />
            <span className="font-mono font-bold text-stone-200 tracking-wider text-[11px]">VOICE CALL · 通話</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-sm bg-stone-800 border border-stone-600/70 text-[11px] font-mono text-[#FFE000] font-bold">
            {formatTimer(callDuration)}
          </div>
        </div>

        {/* Central Avatar & Call Status */}
        <div className="text-center py-6 relative z-10 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div
              className={`w-24 h-24 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                isAiSpeaking
                  ? 'bg-[#D93829] border-[#FFE000] scale-105 shadow-lg shadow-black/40 ring-4 ring-[#FFE000]/30'
                  : callState === 'connected'
                  ? 'bg-stone-800 border-emerald-500'
                  : 'bg-stone-850 border-stone-700'
              }`}
            >
              <span className="text-3xl font-serif font-black text-white">日</span>
            </div>

            {/* Speaking audio wave indicator */}
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-xs bg-[#FFE000] text-[10px] font-black text-black shadow-md border border-stone-900 animate-bounce">
                発話中
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-white">nihongo-jlpt AI 튜터</h3>
          <p className="text-xs text-stone-400 mt-1">
            {callState === 'calling'
              ? '전화 연결 중...'
              : callState === 'connected'
              ? '통화 중 (말씀하시면 자동으로 감지합니다)'
              : callState === 'ended'
              ? '통화가 종료되었습니다'
              : '준비되시면 아래 통화 시작 버튼을 누르세요'}
          </p>

          {callState === 'connected' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-stone-800/90 text-[#FFE000] border border-stone-700 rounded-md text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FFE000] animate-pulse" />
              <span>LIVE CALLING</span>
            </div>
          )}
        </div>

        {/* Real-time Subtitles / Latest Speech */}
        <div className="relative z-10 my-2 min-h-[90px] flex flex-col justify-end">
          {currentSubtitle ? (
            <div className="bg-[#1C1A18]/90 border border-stone-700/80 rounded-xl p-3.5 backdrop-blur-sm animate-fade-in space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-bold text-[#FFE000]">{currentSubtitle.speaker}</span>
                <span className="font-mono text-[10px]">REALTIME</span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">{currentSubtitle.text}</p>
              {currentSubtitle.kr && (
                <p className="text-xs text-stone-400 leading-snug">{currentSubtitle.kr}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-stone-500">
              {callState === 'connected' ? '말씀을 듣고 있습니다...' : '전화 연결 후 대화 내용이 여기에 표시됩니다.'}
            </div>
          )}
        </div>

        {/* Real-time Inline Feedback Pill */}
        {latestCorrection && callState === 'connected' && (
          <div className="relative z-10 mb-3 bg-[#2D1B1B] border border-rose-900/60 rounded-xl p-3 text-xs animate-slide-up shadow-xs">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>실시간 표현 교정</span>
            </div>
            <div className="text-stone-300">
              👉 <span className="text-[#FFE000] font-bold">{latestCorrection.improvedJapanese}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">{latestCorrection.feedbackPoint}</div>
          </div>
        )}

        {/* Bottom Call Action Buttons */}
        <div className="relative z-10 pt-3 border-t border-stone-800">
          {callState === 'idle' || callState === 'ended' ? (
            <button
              onClick={checkMicAndStartCall}
              className="w-full py-3 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md border border-stone-800/30 active:scale-98 transition-all"
            >
              <Phone className="w-4.5 h-4.5 fill-current" />
              <span>통화 시작하기 (마이크 자동 연결)</span>
            </button>
          ) : (
            <div className="flex items-center justify-around gap-2.5">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all border ${
                  isMuted
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? '음소거 됨' : '음소거'}</span>
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex-1 py-2.5 rounded-lg bg-[#D93829] hover:bg-[#B92B1E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all border border-[#B92B1E]"
              >
                <PhoneOff className="w-4 h-4 fill-white" />
                <span>통화 종료 및 리포트</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Session Report (LOFT Stationery Evaluation Sheet) */}
      {finalReport && (
        <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 sm:p-5 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-md bg-[#FFE000] text-stone-900 border border-stone-800/30 flex items-center justify-center font-bold shadow-xs">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  통화 종합 분석 리포트
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  DURATION: {Math.floor(finalReport.durationSeconds / 60)}분 {finalReport.durationSeconds % 60}초 · {finalReport.totalTurns} TURNS
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-[#D93829] font-mono">
                {finalReport.grammarAccuracyScore}점
              </div>
              <span className="text-[10px] text-stone-500 font-mono">ACCURACY</span>
            </div>
          </div>

          {/* AI Overall Assessment */}
          <div className="p-3.5 bg-[#FEF9C3] dark:bg-[#2C2718] rounded-xl border border-[#FDE047] dark:border-yellow-900/60 text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-xs">
            <span className="font-extrabold block text-amber-900 dark:text-amber-300 mb-1">
              【AI 튜터 총평 메모】
            </span>
            {finalReport.aiSummary}
          </div>

          {/* Corrections List */}
          <div>
            <h4 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
              <span className="loft-hanko text-[9px] px-1 py-0.2">添削</span>
              <span>맞춤 교정 내역 ({finalReport.corrections.length}건)</span>
            </h4>

            {finalReport.corrections.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/30 border border-emerald-200/80 text-xs text-emerald-900 dark:text-emerald-300 font-bold shadow-xs">
                🎉 문법 오류 없이 훌륭하고 유창하게 통화를 완료했습니다!
              </div>
            ) : (
              <div className="space-y-2">
                {finalReport.corrections.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white dark:bg-stone-850 rounded-lg border border-[#DDD5C5] dark:border-stone-700 text-xs space-y-1 shadow-xs"
                  >
                    <div className="text-stone-400 line-through">
                      내가 한 말: {item.originalText}
                    </div>
                    <div className="font-extrabold text-[#D93829] dark:text-rose-400">
                      👉 원어민 추천: {item.improvedJapanese}
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300">
                      이유: {item.feedbackPoint}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restart Call button */}
          <button
            onClick={checkMicAndStartCall}
            className="w-full py-2.5 rounded-lg bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-stone-800/20 active:scale-98 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>새로운 통화 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
