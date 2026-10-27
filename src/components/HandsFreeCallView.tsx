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

      {/* Top Mobile Card: Introduction & Context */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                콜 모드 (Hands-Free)
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                운전 · 산책 중 100% 음성 전화 통화
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAISettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{stats.aiSettings?.provider === 'built_in' ? '내장 AI' : stats.aiSettings?.provider}</span>
          </button>
        </div>

        {/* 3 Practical situations */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/80 text-center">
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
            <Car className="w-3.5 h-3.5 mx-auto text-stone-600 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 block">차량 운전</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
            <Footprints className="w-3.5 h-3.5 mx-auto text-stone-600 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 block">산책 · 조깅</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
            <FileText className="w-3.5 h-3.5 mx-auto text-stone-600 dark:text-stone-300 mb-1" />
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 block">종합 리포트</span>
          </div>
        </div>
      </div>

      {/* Main Calling Card (Crafted with phone-like elegance) */}
      <div className="bg-[#1C1B19] text-white rounded-3xl border border-stone-800 shadow-xl p-5 flex flex-col justify-between min-h-[480px] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-stone-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="font-mono font-medium tracking-tight">VOICE CALL</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-[11px] font-mono text-stone-300 font-bold">
            {formatTimer(callDuration)}
          </div>
        </div>

        {/* Central Avatar & Call Status */}
        <div className="text-center py-6 relative z-10 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isAiSpeaking
                  ? 'bg-gradient-to-tr from-rose-700 to-rose-600 ring-8 ring-rose-500/20 scale-105 shadow-lg shadow-rose-900/30'
                  : callState === 'connected'
                  ? 'bg-gradient-to-tr from-emerald-800 to-teal-700 ring-6 ring-emerald-500/20'
                  : 'bg-stone-800 border-2 border-stone-700'
              }`}
            >
              <span className="text-3xl font-serif font-black text-white">日</span>
            </div>

            {/* Speaking audio wave indicator */}
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-bounce">
                말하는 중...
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white">nihongo-jlpt AI 원어민 튜터</h3>
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
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-full text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE CALLING</span>
            </div>
          )}
        </div>

        {/* Real-time Subtitles / Latest Speech */}
        <div className="relative z-10 my-2 min-h-[90px] flex flex-col justify-end">
          {currentSubtitle ? (
            <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-3.5 backdrop-blur-sm animate-fade-in space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-bold text-rose-400">{currentSubtitle.speaker}</span>
                <span>실시간 발화</span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">{currentSubtitle.text}</p>
              {currentSubtitle.kr && (
                <p className="text-xs text-stone-400 leading-snug">{currentSubtitle.kr}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-stone-500">
              {callState === 'connected' ? '말씀을 듣고 있습니다...' : '전화 연결 후 대화가 여기에 표시됩니다.'}
            </div>
          )}
        </div>

        {/* Real-time Inline Feedback Pill */}
        {latestCorrection && callState === 'connected' && (
          <div className="relative z-10 mb-3 bg-amber-950/50 border border-amber-800/60 rounded-2xl p-3 text-xs animate-slide-up">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>실시간 표현 교정</span>
            </div>
            <div className="text-stone-300">
              👉 <span className="text-amber-200 font-bold">{latestCorrection.improvedJapanese}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">{latestCorrection.feedbackPoint}</div>
          </div>
        )}

        {/* Bottom Call Action Buttons */}
        <div className="relative z-10 pt-3 border-t border-stone-800/80">
          {callState === 'idle' || callState === 'ended' ? (
            <button
              onClick={checkMicAndStartCall}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition-all"
            >
              <Phone className="w-5 h-5 fill-white" />
              <span>통화 시작하기 (마이크 자동 연결)</span>
            </button>
          ) : (
            <div className="flex items-center justify-around gap-3">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  isMuted
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500'
                    : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? '음소거 됨' : '음소거'}</span>
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 active:scale-98 transition-all"
              >
                <PhoneOff className="w-4 h-4 fill-white" />
                <span>통화 종료 및 리포트</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Session Report (Displayed after call ends) */}
      {finalReport && (
        <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-md space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  통화 종합 분석 리포트
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  통화 시간: {Math.floor(finalReport.durationSeconds / 60)}분 {finalReport.durationSeconds % 60}초 · 총 {finalReport.totalTurns}회 발화
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-sans">
                {finalReport.grammarAccuracyScore}점
              </div>
              <span className="text-[10px] text-stone-400">문법 정확도</span>
            </div>
          </div>

          {/* AI Overall Assessment */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <span className="font-bold block text-stone-900 dark:text-stone-100 mb-1">
              💬 AI 튜터 총평
            </span>
            {finalReport.aiSummary}
          </div>

          {/* Corrections List */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>맞춤 교정 내역 ({finalReport.corrections.length}건)</span>
            </h4>

            {finalReport.corrections.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                🎉 문법 오류 없이 훌륭하고 유창하게 대화를 이끌었습니다!
              </div>
            ) : (
              <div className="space-y-2">
                {finalReport.corrections.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs space-y-1"
                  >
                    <div className="text-stone-400 line-through">
                      내가 한 말: {item.originalText}
                    </div>
                    <div className="font-bold text-rose-600 dark:text-rose-400">
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
            className="w-full py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>새로운 통화 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
