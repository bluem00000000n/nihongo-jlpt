'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserStats, ComprehensiveReport, DialogueCorrectionItem } from '@/types';
import { speechService } from '@/utils/speech';
import { generateSessionReport } from '@/utils/reportManager';
import { MicrophonePermissionModal } from '@/components/MicrophonePermissionModal';
import {
  phoneTutorCharacters,
  phoneLessonTopics,
  PhoneTutorCharacter,
  PhoneTopic,
  CallTranscriptMessage,
  CallSessionHistoryItem,
} from '@/data/phoneLessons';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Radio,
  FileText,
  Award,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Zap,
  UserCheck,
  BookOpen,
  Shuffle,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  X,
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
  // Tutor & Topic State
  const [selectedCharacter, setSelectedCharacter] = useState<PhoneTutorCharacter>(phoneTutorCharacters[0]);
  const [selectedTopic, setSelectedTopic] = useState<PhoneTopic>(phoneLessonTopics[0]);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Call status
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);

  // Call Transcripts & History
  const [sessionTurns, setSessionTurns] = useState<number>(0);
  const [sessionCorrections, setSessionCorrections] = useState<DialogueCorrectionItem[]>([]);
  const [latestCorrection, setLatestCorrection] = useState<DialogueCorrectionItem | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<{ speaker: string; text: string; kr: string } | null>(null);
  const [callTranscripts, setCallTranscripts] = useState<CallTranscriptMessage[]>([]);
  const [callHistory, setCallHistory] = useState<CallSessionHistoryItem[]>([]);
  const [finalReport, setFinalReport] = useState<ComprehensiveReport | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load persistent call history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nihongo_jlpt_call_history_v1');
        if (saved) {
          setCallHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Failed to load call history:', e);
      }
    }
  }, []);

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

  // Pre-flight microphone permission check
  const checkMicAndStartCall = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());

        // Audio Context unlock for iOS
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
              await ctx.resume();
            }
          }
        } catch {}

        handleStartCall();
      } catch (err: any) {
        console.warn('Microphone permission check failed:', err);
        setIsPermissionModalOpen(true);
      }
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  // Start Real Telephone Japanese Call Pattern
  const handleStartCall = () => {
    setCallState('calling');
    setCallDuration(0);
    setSessionTurns(0);
    setSessionCorrections([]);
    setLatestCorrection(null);
    setFinalReport(null);
    setCallTranscripts([]);

    setTimeout(async () => {
      setCallState('connected');

      // Authentic telephone Japanese:
      // 1단계: 전화 안부 인사 + 2단계: 오늘의 토픽 소재 제시 및 첫 질문
      const openingGreeting = selectedCharacter.defaultOpeningGreeting;
      const topicQuestion = selectedTopic.starterQuestionJp;
      const fullOpeningJp = `${openingGreeting} ${topicQuestion}`;
      const fullOpeningKr = `${selectedCharacter.defaultOpeningGreetingKr} ${selectedTopic.starterQuestionKr}`;

      const initialMessage: CallTranscriptMessage = {
        id: `msg-${Date.now()}`,
        speaker: 'ai',
        speakerName: selectedCharacter.name,
        japanese: fullOpeningJp,
        korean: fullOpeningKr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCallTranscripts([initialMessage]);
      await speakAI(fullOpeningJp, fullOpeningKr);
      startHandsFreeRecognition();
    }, 1400);
  };

  // Speak AI via Tokyo standard voice matching character's gender
  const speakAI = async (jp: string, kr: string) => {
    setCurrentSubtitle({ speaker: selectedCharacter.name, text: jp, kr });
    setIsAiSpeaking(true);
    await speechService.speak(jp, 0.92, 1.0, selectedCharacter.gender);
    setIsAiSpeaking(false);
  };

  // Start continuous recognition
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

  // Process incoming user speech
  const handleIncomingUserSpeech = async (userText: string) => {
    setSessionTurns((prev) => prev + 1);
    setCurrentSubtitle({ speaker: '나 (수강생)', text: userText, kr: '실시간 음성 발화' });

    // Record user message
    const userMsg: CallTranscriptMessage = {
      id: `usr-${Date.now()}`,
      speaker: 'user',
      speakerName: '나 (수강생)',
      japanese: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCallTranscripts((prev) => [...prev, userMsg]);

    const aiConfig = stats.aiSettings;
    let replyJp = '';
    let replyKr = '';
    let itemCorrection: DialogueCorrectionItem | null = null;

    if (aiConfig && aiConfig.provider !== 'built_in' && (aiConfig.apiKey || aiConfig.provider === 'gemini')) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            model: aiConfig.model,
            currentLevel: 'N3',
            levelProgress: 50,
            history: callTranscripts.slice(-6).map((c) => ({
              sender: c.speaker,
              japanese: c.japanese,
            })),
            userMessage: `[전화일본어 수업 진행 중]\n강사 캐릭터: ${selectedCharacter.name} (${selectedCharacter.gender === 'female' ? '여성' : '남성'}, ${selectedCharacter.ageGroup}, ${selectedCharacter.speechStyle})\n오늘의 대화 소재: ${selectedTopic.title} (${selectedTopic.japaneseTitle})\n\n수강생 발화: ${userText}`,
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
              feedbackPoint: data.correction.feedbackPoint || '도쿄 표준어 뉘앙스 교정',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
        }
      } catch (e) {
        console.error('LLM API error during call:', e);
      }
    }

    // Smart persona fallback response
    if (!replyJp) {
      const lower = userText.toLowerCase();
      if (lower.includes('元気') || lower.includes('げんき') || lower.includes('おつかれ') || lower.includes('좋아')) {
        replyJp = `それは良かったです！${selectedTopic.title}について、他にも普段気になっていることはありますか？`;
        replyKr = `다행이네요! ${selectedTopic.title}에 대해 평소 다른 궁금한 점도 있으신가요?`;
      } else if (lower.includes('仕事') || lower.includes('つかれた') || lower.includes('힘들')) {
        replyJp = 'お仕事本当にお疲れ様です。お忙しい中日本語の通話練習、素晴らしい熱意ですね！';
        replyKr = '일하시느라 정말 고생 많으셨어요. 바쁘신 와중에 일본어 전화 연습이라니 훌륭한 열정입니다!';
        itemCorrection = {
          id: `cor-${Date.now()}`,
          originalText: userText,
          improvedJapanese: '仕事で少し疲れました。',
          reading: 'しごとですこしつかれました。',
          koreanMeaning: '일 때문에 조금 피곤했습니다.',
          feedbackPoint: '도쿄 표준어에서는 〜で疲れました 또는 〜て大変でした 형식을 사용하면 더 자연스럽습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        replyJp = `なるほど！${selectedCharacter.name.includes('켄타') ? 'それすごく面白いね！' : '大変わかりやすいご説明ですね。'} ちなみに、週末はどんなご予定がありますか？`;
        replyKr = `그렇군요! 알기 쉽게 잘 설명해 주셨어요. 덧붙여 이번 주말에는 어떤 계획이 있으신가요?`;
      }
    }

    if (itemCorrection) {
      setLatestCorrection(itemCorrection);
      setSessionCorrections((prev) => [...prev, itemCorrection!]);
    }

    // Record AI reply in transcripts
    const aiMsg: CallTranscriptMessage = {
      id: `ai-${Date.now()}`,
      speaker: 'ai',
      speakerName: selectedCharacter.name,
      japanese: replyJp,
      korean: replyKr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      correction: itemCorrection || undefined,
    };

    setCallTranscripts((prev) => [...prev, aiMsg]);
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

  // End Call, Generate Report & Persist to Storage
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
      'N3',
      sessionCorrections,
      ['もしもし', 'お疲れ様', '元気', '話題', '日本語']
    );

    setFinalReport(report);
    onAddXP(50);
    confetti({
      particleCount: 60,
      spread: 70,
    });

    // Save Call Session Record to LocalStorage
    if (typeof window !== 'undefined') {
      const newSession: CallSessionHistoryItem = {
        id: `call-${Date.now()}`,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        durationSeconds: callDuration,
        characterName: selectedCharacter.name,
        characterGender: selectedCharacter.gender,
        characterRole: selectedCharacter.role,
        topicTitle: selectedTopic.title,
        totalTurns: sessionTurns,
        grammarScore: report.grammarAccuracyScore,
        aiSummary: report.aiSummary,
        messages: callTranscripts,
      };

      const updatedHistory = [newSession, ...callHistory.slice(0, 19)];
      setCallHistory(updatedHistory);
      try {
        localStorage.setItem('nihongo_jlpt_call_history_v1', JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    }
  };

  // Randomize Topic
  const handlePickRandomTopic = () => {
    const others = phoneLessonTopics.filter((t) => t.id !== selectedTopic.id);
    const randomPick = others[Math.floor(Math.random() * others.length)];
    setSelectedTopic(randomPick);
  };

  // Clear Call History
  const handleClearHistory = () => {
    if (confirm('통화 기록을 모두 삭제하시겠습니까?')) {
      setCallHistory([]);
      localStorage.removeItem('nihongo_jlpt_call_history_v1');
    }
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
        featureName="전화일본어 통화"
      />

      {/* Character Selector Modal */}
      {isCharacterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl shadow-2xl border border-[#E2D9C8] dark:border-stone-800 max-w-md w-full p-5 space-y-3.5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 text-[9px] font-extrabold shadow-xs">
                  TUTOR PERSONA
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  전화 강사 캐릭터 지정
                </h3>
              </div>
              <button
                onClick={() => setIsCharacterModalOpen(false)}
                className="w-7 h-7 rounded-md bg-stone-200/70 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {phoneTutorCharacters.map((char) => {
                const isSelected = selectedCharacter.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedCharacter(char);
                      setIsCharacterModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#FFE000] text-stone-900 border-stone-900 shadow-sm'
                        : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-[#DDD5C5] dark:border-stone-750 hover:border-stone-800'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-white/70 rounded-lg border border-black/10">
                      {char.avatarIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{char.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${
                          isSelected ? 'bg-stone-900 text-white' : 'bg-[#FAF7F0] text-stone-700 border border-[#DDD5C5]'
                        }`}>
                          {char.ageGroup} · {char.gender === 'female' ? '여성' : '남성'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium opacity-90 mt-0.5">{char.role}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{char.speechStyle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topic Selector Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl shadow-2xl border border-[#E2D9C8] dark:border-stone-800 max-w-md w-full p-5 space-y-3.5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 text-[9px] font-extrabold shadow-xs">
                  CALL TOPIC
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  통화 대화 주제 선택
                </h3>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="w-7 h-7 rounded-md bg-stone-200/70 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {phoneLessonTopics.map((top) => {
                const isSelected = selectedTopic.id === top.id;
                return (
                  <button
                    key={top.id}
                    onClick={() => {
                      setSelectedTopic(top);
                      setIsTopicModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFE000] text-stone-900 border-stone-900 shadow-sm'
                        : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-[#DDD5C5] dark:border-stone-750 hover:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-black/5 font-bold">
                        {top.category} · {top.level}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold">{top.title}</h4>
                    <p className="text-[10px] opacity-80 font-serif mt-0.5">{top.japaneseTitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Mobile Card: Tutor Persona & Today's Topic Setup (LOFT Note) */}
      <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#FFE000] text-black font-black text-[9px] rounded-xs shadow-xs">TELEPHONE JAPANESE</span>
            <span>電話レッスン</span>
          </div>
          <button
            onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
            className="flex items-center gap-1 font-extrabold text-[#D93829] hover:underline"
          >
            <History className="w-3 h-3" />
            <span>기록부 ({callHistory.length}건)</span>
          </button>
        </div>

        {/* Selected Tutor Character Strip */}
        <div className="flex items-center justify-between bg-white dark:bg-stone-850 p-2.5 rounded-xl border border-[#DDD5C5] dark:border-stone-750 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-[#FAF7F0] rounded-md border border-stone-200">
              {selectedCharacter.avatarIcon}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                  {selectedCharacter.name}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 font-extrabold">
                  {selectedCharacter.ageGroup} · {selectedCharacter.gender === 'female' ? '여성' : '남성'}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                {selectedCharacter.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCharacterModalOpen(true)}
            disabled={callState === 'connected'}
            className="px-2.5 py-1 rounded-md bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-[#DDD5C5] text-[11px] font-bold text-stone-700 transition-colors shrink-0"
          >
            강사 변경
          </button>
        </div>

        {/* Selected Topic & AI Question Preview Strip */}
        <div className="bg-white dark:bg-stone-850 p-2.5 rounded-xl border border-[#DDD5C5] dark:border-stone-750 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#D93829]" />
              오늘의 대화 소재 (AI가 먼저 질문)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePickRandomTopic}
                disabled={callState === 'connected'}
                className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-0.5"
                title="랜덤 소재 뽑기"
              >
                <Shuffle className="w-2.5 h-2.5" />
                <span>랜덤</span>
              </button>
              <button
                onClick={() => setIsTopicModalOpen(true)}
                disabled={callState === 'connected'}
                className="text-[10px] font-bold text-[#D93829] hover:underline"
              >
                변경
              </button>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#FEF9C3] dark:bg-[#2C2718] border border-[#FDE047] dark:border-yellow-900/60 text-xs">
            <span className="font-extrabold text-amber-900 dark:text-amber-200 block">
              📌 {selectedTopic.title}
            </span>
            <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">
              첫 질문: &ldquo;{selectedTopic.starterQuestionKr}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Main Calling Card (Sumi Ink Telephone Slate) */}
      <div className="bg-[#24221F] text-stone-100 rounded-2xl border border-[#3A3631] shadow-xl p-5 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-stone-400 relative z-10 border-b border-stone-700/60 pb-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-[#FFE000] animate-pulse' : 'bg-stone-500'}`} />
            <span className="font-mono font-bold text-stone-200 tracking-wider text-[11px]">
              {selectedCharacter.japaneseName} · {selectedCharacter.accentNote}
            </span>
          </div>

          <div className="px-2.5 py-0.5 rounded-sm bg-stone-800 border border-stone-600/70 text-[11px] font-mono text-[#FFE000] font-bold">
            {formatTimer(callDuration)}
          </div>
        </div>

        {/* Central Avatar & Call Status */}
        <div className="text-center py-5 relative z-10 flex flex-col items-center justify-center">
          <div className="relative mb-3">
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                isAiSpeaking
                  ? 'bg-[#D93829] border-[#FFE000] scale-105 shadow-xl shadow-black/50 ring-4 ring-[#FFE000]/30'
                  : callState === 'connected'
                  ? 'bg-stone-800 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-stone-850 border-stone-700'
              }`}
            >
              <span className="text-4xl">{selectedCharacter.avatarIcon}</span>
            </div>

            {/* Speaking audio wave indicator */}
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-xs bg-[#FFE000] text-[9px] font-black text-black shadow-md border border-stone-900 animate-bounce">
                강사 발화 중
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-white">{selectedCharacter.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {callState === 'calling'
              ? '강사님께 전화 연결 중 (Ringing)...'
              : callState === 'connected'
              ? '전화일본어 통화 중 (말씀하시면 강사가 답변합니다)'
              : callState === 'ended'
              ? '수업이 종료되었습니다. 아래 리포트를 확인하세요.'
              : '수업 준비가 완료되었습니다. 아래 통화 버튼을 누르세요.'}
          </p>

          {callState === 'connected' && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-800/90 text-[#FFE000] border border-stone-700 rounded-md text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE000] animate-pulse" />
              <span>LIVE LESSON CALL</span>
            </div>
          )}
        </div>

        {/* Real-time Subtitles / Latest Speech */}
        <div className="relative z-10 my-2 min-h-[90px] flex flex-col justify-end">
          {currentSubtitle ? (
            <div className="bg-[#1C1A18]/90 border border-stone-700/80 rounded-xl p-3.5 backdrop-blur-sm animate-fade-in space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-bold text-[#FFE000]">{currentSubtitle.speaker}</span>
                <span className="font-mono text-[9px] text-stone-500">REALTIME SPEECH</span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">{currentSubtitle.text}</p>
              {currentSubtitle.kr && (
                <p className="text-xs text-stone-400 leading-snug">{currentSubtitle.kr}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-3 text-xs text-stone-500">
              {callState === 'connected' ? '강사님의 첫 질문을 듣고 답변해 보세요...' : '전화 연결 후 대화 내용이 실시간 표시됩니다.'}
            </div>
          )}
        </div>

        {/* Real-time Inline Feedback Pill */}
        {latestCorrection && callState === 'connected' && (
          <div className="relative z-10 mb-2 bg-[#2D1B1B] border border-rose-900/60 rounded-xl p-2.5 text-xs animate-slide-up shadow-xs">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-0.5 text-[11px]">
              <Edit3 className="w-3 h-3" />
              <span>실시간 원어민 뉘앙스 교정</span>
            </div>
            <div className="text-stone-300 text-[11px]">
              👉 <span className="text-[#FFE000] font-bold">{latestCorrection.improvedJapanese}</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">{latestCorrection.feedbackPoint}</div>
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
              <span>전화일본어 시작 ({selectedCharacter.name})</span>
            </button>
          ) : (
            <div className="flex items-center justify-around gap-2.5">
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

      {/* Real-time Call Transcript Log (Live Notebook) */}
      {callTranscripts.length > 0 && (
        <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
            <span className="font-extrabold text-stone-700 dark:text-stone-300">
              📜 실시간 통화 녹취록 ({callTranscripts.length}건)
            </span>
            <span>LIVE TRANSCRIPT</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {callTranscripts.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl text-xs space-y-1 ${
                  msg.speaker === 'user'
                    ? 'bg-[#FEF9C3] dark:bg-[#2C2718] border border-[#FDE047] ml-4'
                    : 'bg-white dark:bg-stone-850 border border-[#DDD5C5] mr-4 border-l-4 border-l-[#D93829]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span className="font-bold text-stone-800 dark:text-stone-200">{msg.speakerName}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="font-semibold text-stone-900 dark:text-stone-100 leading-snug">{msg.japanese}</p>
                {msg.korean && (
                  <p className="text-[11px] text-stone-500 leading-snug">{msg.korean}</p>
                )}
                {msg.correction && (
                  <div className="mt-1 pt-1 border-t border-dashed border-rose-300 text-[11px] text-[#D93829]">
                    👉 교정: {msg.correction.improvedJapanese} ({msg.correction.feedbackPoint})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Session Report (Displayed after call ends) */}
      {finalReport && (
        <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl p-4 sm:p-5 border border-[#E2D9C8] dark:border-stone-800 shadow-[0_2px_8px_rgba(35,30,25,0.05)] space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-md bg-[#FFE000] text-stone-900 border border-stone-800/30 flex items-center justify-center font-bold shadow-xs">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  전화일본어 종합 분석 리포트
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  강사: {selectedCharacter.name} · 주제: {selectedTopic.title}
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

          <div className="p-3.5 bg-[#FEF9C3] dark:bg-[#2C2718] rounded-xl border border-[#FDE047] dark:border-yellow-900/60 text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-xs">
            <span className="font-extrabold block text-amber-900 dark:text-amber-300 mb-1">
              【{selectedCharacter.name} 강사 피드백 메모】
            </span>
            {finalReport.aiSummary}
          </div>

          {finalReport.corrections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <span className="loft-hanko text-[9px] px-1 py-0.2">添削</span>
                <span>수업 중 교정 피드백 ({finalReport.corrections.length}건)</span>
              </h4>
              <div className="space-y-1.5">
                {finalReport.corrections.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white dark:bg-stone-850 rounded-lg border border-[#DDD5C5] dark:border-stone-700 text-xs space-y-1 shadow-xs"
                  >
                    <div className="text-stone-400 line-through">
                      수강생 발화: {item.originalText}
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
            </div>
          )}

          <button
            onClick={checkMicAndStartCall}
            className="w-full py-2.5 rounded-lg bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-stone-800/20 active:scale-98 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다음 통화 수업 시작하기</span>
          </button>
        </div>
      )}

      {/* Persistent Call History Drawer / Note Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl shadow-2xl border border-[#E2D9C8] dark:border-stone-800 max-w-md w-full p-5 space-y-3.5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 text-[9px] font-extrabold shadow-xs">
                  CALL ARCHIVE
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  지난 전화일본어 통화 기록부
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-7 h-7 rounded-md bg-stone-200/70 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {callHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                아직 저장된 통화 기록이 없습니다. 통화를 진행하면 이곳에 자동 저장됩니다!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>총 {callHistory.length}회의 통화 녹취 보관 중</span>
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-stone-400 hover:text-[#D93829] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>전체 삭제</span>
                  </button>
                </div>

                {callHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-stone-850 border border-[#DDD5C5] dark:border-stone-750 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-100 dark:border-stone-800">
                      <div>
                        <span className="font-extrabold text-stone-900 dark:text-stone-100">{rec.characterName}</span>
                        <span className="text-[10px] text-stone-500 font-mono ml-2">
                          {rec.date} {rec.time}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-xs text-[#D93829]">
                        {rec.grammarScore}점
                      </span>
                    </div>

                    <div className="text-xs">
                      <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        주제: {rec.topicTitle} ({Math.floor(rec.durationSeconds / 60)}분 {rec.durationSeconds % 60}초)
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                        {rec.aiSummary}
                      </p>
                    </div>

                    {rec.messages && rec.messages.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-stone-200 text-xs">
                        <span className="text-[10px] font-bold text-stone-600 block mb-1">
                          녹취 하이라이트:
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {rec.messages.slice(0, 4).map((m, mIdx) => (
                            <div key={mIdx} className="text-[11px] flex items-start gap-1">
                              <span className="font-bold shrink-0 text-stone-600">{m.speakerName}:</span>
                              <span className="text-stone-800 dark:text-stone-200 line-clamp-1">{m.japanese}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
