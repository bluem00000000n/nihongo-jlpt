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
  Send,
  Languages,
  ChevronRight,
  AlertCircle,
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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);

  // Microphone & Speech input state
  const [inputLang, setInputLang] = useState<'ja-JP' | 'ko-KR'>('ja-JP');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [micStatusMsg, setMicStatusMsg] = useState<string>('');

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
  const isAiSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const callStateRef = useRef<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const silenceDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const inputLangRef = useRef<'ja-JP' | 'ko-KR'>('ja-JP');
  const transcriptsEndRef = useRef<HTMLDivElement | null>(null);

  callStateRef.current = callState;
  isAiSpeakingRef.current = isAiSpeaking;
  isMutedRef.current = isMuted;
  inputLangRef.current = inputLang;

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

  // Auto scroll transcript to bottom
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [callTranscripts, currentSubtitle, interimTranscript]);

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
    callStateRef.current = 'calling';
    setCallDuration(0);
    setSessionTurns(0);
    setSessionCorrections([]);
    setLatestCorrection(null);
    setFinalReport(null);
    setCallTranscripts([]);
    setInterimTranscript('');
    lastTranscriptRef.current = '';
    setMicStatusMsg('전화 연결 중...');

    setTimeout(async () => {
      setCallState('connected');
      callStateRef.current = 'connected';

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

      // Start listening loop
      setTimeout(() => {
        if (callStateRef.current === 'connected' && !isMutedRef.current) {
          startRecognitionSafely();
        }
      }, 300);
    }, 1200);
  };

  // Speak AI via Tokyo standard voice matching character's gender
  const speakAI = async (jp: string, kr: string) => {
    // Pause recognition while AI is speaking so AI does not hear itself
    stopRecognitionSafely();
    setCurrentSubtitle({ speaker: selectedCharacter.name, text: jp, kr });
    setIsAiSpeaking(true);
    isAiSpeakingRef.current = true;
    setMicStatusMsg('강사 발화 중...');

    await speechService.speak(jp, 0.86, 1.0, selectedCharacter.gender);

    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setMicStatusMsg('말씀해 주세요 (마이크 대기 중)');
  };

  // Stop recognition safely without errors
  const stopRecognitionSafely = () => {
    setIsListening(false);
    if (silenceDebounceRef.current) {
      clearTimeout(silenceDebounceRef.current);
      silenceDebounceRef.current = null;
    }
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
      autoRestartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  // Start recognition safely with continuous feedback and auto-loop for hands-free call
  const startRecognitionSafely = () => {
    if (typeof window === 'undefined') return;
    if (callStateRef.current !== 'connected' || isMutedRef.current || isAiSpeakingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatusMsg('음성 인식을 지원하지 않는 브라우저입니다. 아래 텍스트 입력창을 사용해 주세요.');
      return;
    }

    // Stop existing instance first
    stopRecognitionSafely();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = inputLangRef.current;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Continuous mode
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '');
      recognition.continuous = !isIOS;

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg(
          inputLangRef.current === 'ja-JP'
            ? '🎙️ 실시간 청취 중 (일본어로 말씀해 주세요)...'
            : '🎙️ 실시간 청취 중 (한국어로 말씀해 주세요)...'
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const candidate = (final || interim).trim();
        if (candidate) {
          lastTranscriptRef.current = candidate;
          setInterimTranscript(candidate);
        }

        // If browser provided final text immediately
        if (final.trim() && !isMutedRef.current) {
          if (silenceDebounceRef.current) clearTimeout(silenceDebounceRef.current);
          const textToSend = final.trim();
          lastTranscriptRef.current = '';
          setInterimTranscript('');
          stopRecognitionSafely();
          handleIncomingUserSpeech(textToSend);
          return;
        }

        // For interim speech: debounce 450ms of silence to automatically commit with ultra-fast responsiveness
        if (interim.trim() && !isMutedRef.current) {
          if (silenceDebounceRef.current) clearTimeout(silenceDebounceRef.current);
          silenceDebounceRef.current = setTimeout(() => {
            if (
              lastTranscriptRef.current.trim() &&
              callStateRef.current === 'connected' &&
              !isMutedRef.current &&
              !isAiSpeakingRef.current
            ) {
              const textToSend = lastTranscriptRef.current.trim();
              lastTranscriptRef.current = '';
              setInterimTranscript('');
              stopRecognitionSafely();
              handleIncomingUserSpeech(textToSend);
            }
          }, 450);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatusMsg('마이크 권한이 차단되었습니다. 권한을 허용해 주세요.');
          setIsPermissionModalOpen(true);
          stopRecognitionSafely();
        } else if (event.error === 'no-speech') {
          // Expected on pauses; will auto-continue in onend
          setMicStatusMsg('🎙️ 마이크 대기 중 (편하게 말씀하세요)...');
        } else if (event.error === 'network') {
          setMicStatusMsg('음성 네트워크 재연결 시도 중...');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If there was pending transcript that user finished saying
        if (
          lastTranscriptRef.current.trim() &&
          callStateRef.current === 'connected' &&
          !isMutedRef.current &&
          !isAiSpeakingRef.current
        ) {
          const textToSend = lastTranscriptRef.current.trim();
          lastTranscriptRef.current = '';
          setInterimTranscript('');
          stopRecognitionSafely();
          handleIncomingUserSpeech(textToSend);
          return;
        }

        // Auto-restart loop in hands-free mode
        if (callStateRef.current === 'connected' && !isMutedRef.current && !isAiSpeakingRef.current) {
          if (autoRestartTimeoutRef.current) clearTimeout(autoRestartTimeoutRef.current);
          autoRestartTimeoutRef.current = setTimeout(() => {
            if (callStateRef.current === 'connected' && !isMutedRef.current && !isAiSpeakingRef.current) {
              startRecognitionSafely();
            }
          }, 350);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('Recognition start exception:', e);
      setIsListening(false);
      setMicStatusMsg('마이크 대기 중...');
    }
  };

  // Push-to-Talk or Tap-to-Talk toggle
  const toggleListening = () => {
    if (callStateRef.current !== 'connected') return;
    if (isListening) {
      stopRecognitionSafely();
      setMicStatusMsg('음성 인식을 일시 정지했습니다.');
    } else {
      if (isAiSpeakingRef.current) {
        speechService.stop();
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
      }
      startRecognitionSafely();
    }
  };

  // Process incoming user speech (or manual text fallback)
  const handleIncomingUserSpeech = async (userText: string) => {
    if (!userText.trim()) return;

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
    setMicStatusMsg('⚡ AI 강사가 실시간 답변 중...');

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
            mode: 'call',
            currentLevel: 'N3',
            levelProgress: 50,
            history: callTranscripts.slice(-4).map((c) => ({
              sender: c.speaker,
              japanese: c.japanese,
            })),
            userMessage: `[전화 강사: ${selectedCharacter.name} (${selectedCharacter.gender === 'female' ? '여성' : '남성'}, ${selectedCharacter.speechStyle}) | 토픽: ${selectedTopic.title}]\n\n수강생 발화: ${userText}`,
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

    // Smart persona fallback response if LLM was unavailable
    if (!replyJp) {
      const lower = userText.toLowerCase();
      if (lower.includes('元気') || lower.includes('げんき') || lower.includes('おつかれ') || lower.includes('좋아') || lower.includes('안녕')) {
        replyJp = `それは良かったです！${selectedTopic.title}について、普段どんなことをされていますか？`;
        replyKr = `다행이네요! ${selectedTopic.title}에 대해 평소 어떤 걸 하고 계신가요?`;
      } else if (lower.includes('仕事') || lower.includes('つかれた') || lower.includes('힘들') || lower.includes('바빠')) {
        replyJp = 'お仕事本当にお疲れ様です！お忙しい中日本語の通話練習、素晴らしい熱意ですね。';
        replyKr = '일하시느라 정말 고생 많으셨어요! 바쁘신 와중에 일본어 전화 연습이라니 훌륭한 열정입니다.';
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
        replyJp = `なるほど！${selectedCharacter.name.includes('켄타') ? 'それすごく面白いね！' : '大変わかりやすいご説明ですね。'} ちなみに、もっと詳しく教えていただけますか？`;
        replyKr = `그렇군요! 알기 쉽게 잘 설명해 주셨어요. 덧붙여 조금 더 자세히 들려주실 수 있나요?`;
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

    // After AI finishes speaking, resume listening
    setTimeout(() => {
      if (callStateRef.current === 'connected' && !isMutedRef.current) {
        startRecognitionSafely();
      }
    }, 400);
  };

  // Submit manual text fallback
  const handleSendManualText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || callStateRef.current !== 'connected') return;
    const text = manualText.trim();
    setManualText('');
    stopRecognitionSafely();
    handleIncomingUserSpeech(text);
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (nextMuted) {
      stopRecognitionSafely();
      setMicStatusMsg('음소거 되었습니다.');
    } else {
      if (callStateRef.current === 'connected' && !isAiSpeakingRef.current) {
        startRecognitionSafely();
      }
    }
  };

  // End Call, Generate Report & Persist to Storage
  const handleEndCall = () => {
    speechService.stop();
    stopRecognitionSafely();

    setCallState('ended');
    callStateRef.current = 'ended';
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setMicStatusMsg('통화가 종료되었습니다.');

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
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setIsPermissionModalOpen(false);
          if (callState === 'connected') {
            startRecognitionSafely();
          } else {
            handleStartCall();
          }
        }}
        featureName="전화일본어 실시간 통화"
      />

      {/* Character Selector Modal (Pure White, Unified UI) */}
      {isCharacterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4 max-h-[88vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FFE000] text-gray-950 text-[10px] font-black border border-gray-900/10">
                  TUTOR PERSONA
                </span>
                <h3 className="text-sm font-black text-gray-950">
                  전화 강사 캐릭터 지정
                </h3>
              </div>
              <button
                onClick={() => setIsCharacterModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {phoneTutorCharacters.map((char) => {
                const isSelected = selectedCharacter.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedCharacter(char);
                      setIsCharacterModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-50 border-2 border-[#FFE000] text-gray-950 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
                    }`}
                  >
                    <span className="text-3xl shrink-0 p-1.5 bg-gray-50 rounded-xl border border-gray-200">
                      {char.avatarIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-gray-950">{char.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {char.ageGroup} · {char.gender === 'female' ? '여성' : '남성'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 mt-1">{char.role}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{char.speechStyle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topic Selector Modal (Pure White, Unified UI) */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4 max-h-[88vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FFE000] text-gray-950 text-[10px] font-black border border-gray-900/10">
                  CALL TOPIC
                </span>
                <h3 className="text-sm font-black text-gray-950">
                  통화 대화 주제 선택
                </h3>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {phoneLessonTopics.map((top) => {
                const isSelected = selectedTopic.id === top.id;
                return (
                  <button
                    key={top.id}
                    onClick={() => {
                      setSelectedTopic(top);
                      setIsTopicModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-2 border-[#FFE000] text-gray-950 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {top.category} · {top.level}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-gray-950">{top.title}</h4>
                    <p className="text-xs text-gray-600 font-medium mt-1">{top.japaneseTitle}</p>
                    <p className="text-[11px] text-amber-700 font-bold mt-1">
                      첫 질문: &ldquo;{top.starterQuestionKr}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Mobile Card: Tutor Persona & Today's Topic Setup (Pure White Card) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs text-gray-500 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">
              TELEPHONE JAPANESE
            </span>
            <span className="text-gray-900 font-black">電話レッスン</span>
          </div>
          <button
            onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
            className="flex items-center gap-1 font-bold text-red-600 hover:underline"
          >
            <History className="w-3.5 h-3.5" />
            <span>기록부 ({callHistory.length}건)</span>
          </button>
        </div>

        {/* Selected Tutor Character Strip */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 bg-white rounded-xl border border-gray-200 shadow-xs">
              {selectedCharacter.avatarIcon}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-gray-950">
                  {selectedCharacter.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#FFE000] text-gray-950 font-black">
                  {selectedCharacter.ageGroup} · {selectedCharacter.gender === 'female' ? '여성' : '남성'}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-600 mt-0.5 line-clamp-1">
                {selectedCharacter.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCharacterModalOpen(true)}
            disabled={callState === 'connected'}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-xs font-bold text-gray-800 transition-colors shrink-0 shadow-xs disabled:opacity-50"
          >
            강사 변경
          </button>
        </div>

        {/* Selected Topic & AI Question Preview Strip */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-gray-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-red-600" />
              오늘의 대화 소재 (AI가 먼저 질문)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePickRandomTopic}
                disabled={callState === 'connected'}
                className="text-xs font-bold text-gray-600 hover:text-gray-950 flex items-center gap-0.5 disabled:opacity-50"
                title="랜덤 소재 뽑기"
              >
                <Shuffle className="w-3 h-3" />
                <span>랜덤</span>
              </button>
              <button
                onClick={() => setIsTopicModalOpen(true)}
                disabled={callState === 'connected'}
                className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
              >
                변경
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <span className="font-black text-amber-950 block text-xs">
              📌 {selectedTopic.title}
            </span>
            <p className="text-xs text-amber-900 mt-1 leading-snug font-medium">
              첫 질문: &ldquo;{selectedTopic.starterQuestionKr}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Main Calling Card (Warm Stationery Notebook Paper Design) */}
      <div className="bg-[#FDFCF9] rounded-2xl border-2 border-[#E2D9C8] shadow-md p-5 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-gray-600 pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${callState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-mono font-bold text-gray-900 text-xs">
              {selectedCharacter.japaneseName} · {selectedCharacter.accentNote}
            </span>
          </div>

          <div className="px-3 py-1 rounded-md bg-gray-900 text-[#FFE000] font-mono font-black text-xs shadow-xs">
            {formatTimer(callDuration)}
          </div>
        </div>

        {/* Central Avatar & Call Status */}
        <div className={`text-center flex flex-col items-center justify-center transition-all ${
          callState === 'connected' ? 'py-2' : 'py-5'
        }`}>
          <div className="relative mb-2">
            <div
              className={`rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                callState === 'connected' ? 'w-16 h-16' : 'w-24 h-24'
              } ${
                isAiSpeaking
                  ? 'bg-amber-100 border-[#FFE000] scale-105 shadow-xl ring-4 ring-[#FFE000]/40'
                  : isListening
                  ? 'bg-red-50 border-red-500 scale-105 ring-4 ring-red-500/20 shadow-md'
                  : callState === 'connected'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <span className={callState === 'connected' ? 'text-2xl' : 'text-4xl'}>
                {selectedCharacter.avatarIcon}
              </span>
            </div>

            {/* Speaking audio wave indicator */}
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-[#FFE000] text-[9px] font-black text-gray-950 shadow-md border border-gray-900 animate-bounce">
                강사 발화 중 🔊
              </span>
            )}
            {isListening && !isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-red-600 text-[9px] font-black text-white shadow-md animate-pulse">
                🎙️ 듣는 중...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-black text-gray-950">{selectedCharacter.name}</h3>
            {callState === 'connected' && (
              <span className="text-[10px] text-gray-500 font-bold">
                ({selectedCharacter.ageGroup} · {selectedCharacter.speechStyle})
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-gray-600 mt-0.5">
            {callState === 'calling'
              ? '강사님께 전화 연결 중 (Ringing)...'
              : callState === 'connected'
              ? isAiSpeaking
                ? '강사님이 말씀하고 계십니다...'
                : isListening
                ? '🎙️ 지금 말씀하세요! (목소리를 실시간 감지 중입니다)'
                : '말씀하시거나 아래 [말하기] 버튼을 터치해 주세요'
              : callState === 'ended'
              ? '수업이 종료되었습니다. 아래 리포트를 확인하세요.'
              : '수업 준비 완료! 아래 [전화일본어 시작]을 누르세요.'}
          </p>

          {/* Microphone Live Status & Language Switcher */}
          {callState === 'connected' && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const next = inputLang === 'ja-JP' ? 'ko-KR' : 'ja-JP';
                  setInputLang(next);
                  inputLangRef.current = next;
                  if (callStateRef.current === 'connected' && !isAiSpeakingRef.current && !isMutedRef.current) {
                    stopRecognitionSafely();
                    setTimeout(() => startRecognitionSafely(), 150);
                  }
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-[#E2D9C8] text-[11px] font-black text-[#2B2725] flex items-center gap-1 transition-colors"
                title="음성 인식 언어 변경"
              >
                <Languages className="w-3.5 h-3.5 text-[#D93829]" />
                <span>{inputLang === 'ja-JP' ? '🇯🇵 일본어 인식' : '🇰🇷 한국어 인식'}</span>
                <span className="text-[9px] text-[#7A6E63] font-normal">(전환)</span>
              </button>

              <div className="px-2.5 py-1 rounded-md bg-[#FAF7F0] border border-[#E2D9C8] text-[11px] font-bold text-[#5A5047] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-gray-400'}`} />
                <span className="line-clamp-1">{micStatusMsg || (isListening ? '음성 수신 중' : '대기')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Call Transcript & Live Speech Stream (Scrollable inside the card directly above controls) */}
        <div className="my-2 flex-1 flex flex-col min-h-[180px] max-h-[300px] border border-[#E2D9C8] rounded-xl bg-[#FAF7F0] loft-grid-bg p-2.5 overflow-hidden">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#E5DEC9] text-[#78716C] font-bold mb-2">
            <span className="flex items-center gap-1.5 font-black text-gray-950">
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              실시간 대화 녹취 ({callTranscripts.length}건)
            </span>
            <span className="font-mono text-[9px] font-bold text-[#78716C]">REALTIME SPEECH</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {callTranscripts.length === 0 ? (
              <div className="text-center py-10 text-xs font-bold text-gray-400">
                {callState === 'connected' ? '강사님의 첫 질문을 듣고 답변해 보세요...' : '전화 연결 후 대화 내용이 실시간 표시됩니다.'}
              </div>
            ) : (
              callTranscripts.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl text-xs space-y-1 animate-fade-in ${
                    msg.speaker === 'user'
                      ? 'bg-amber-50 border border-amber-300 ml-4 text-gray-950 font-bold'
                      : 'bg-white border border-gray-200 mr-4 border-l-4 border-l-red-600 text-gray-950 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                    <span className="text-gray-900 font-black">{msg.speakerName}</span>
                    <span className="font-mono text-[9px] text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="font-black text-sm text-gray-950 leading-snug break-keep break-words">{msg.japanese}</p>
                  {msg.korean && (
                    <p className="text-xs text-gray-600 leading-snug font-medium break-keep break-words">{msg.korean}</p>
                  )}
                  {msg.correction && (
                    <div className="mt-1 pt-1 border-t border-dashed border-red-200 text-xs text-red-700 font-bold break-keep break-words">
                      👉 원어민 교정: {msg.correction.improvedJapanese} ({msg.correction.feedbackPoint})
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Live interim preview when user is currently speaking */}
            {interimTranscript && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-2.5 animate-pulse shadow-sm ml-4 text-xs">
                <div className="flex items-center justify-between text-[10px] font-black text-amber-900 mb-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    실시간 인식 중...
                  </span>
                  <span className="font-mono text-[9px] text-amber-700">LIVE PREVIEW</span>
                </div>
                <p className="text-xs font-black text-gray-950">&ldquo;{interimTranscript}&rdquo;</p>
              </div>
            )}

            <div ref={transcriptsEndRef} />
          </div>
        </div>

        {/* In-Call Text Input Fallback (Guaranteeing 100% voice/text response) */}
        {callState === 'connected' && (
          <form onSubmit={handleSendManualText} className="pt-2 pb-1 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="마이크가 안될 때 직접 입력 (일본어/한국어)..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="px-3.5 py-2 bg-[#FFE000] hover:bg-[#FACC15] disabled:opacity-40 text-gray-950 font-black text-xs rounded-xl border border-gray-900/10 shadow-xs flex items-center gap-1 transition-all whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">전송</span>
              </button>
            </div>
          </form>
        )}

        {/* Bottom Call Action Buttons */}
        <div className="pt-3 border-t border-gray-200">
          {callState === 'idle' || callState === 'ended' ? (
            <button
              onClick={checkMicAndStartCall}
              className="w-full py-3.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm border border-gray-900/15 active:scale-98 transition-all whitespace-nowrap"
            >
              <Phone className="w-5 h-5 fill-current shrink-0" />
              <span className="whitespace-nowrap">전화일본어 시작 ({selectedCharacter.name})</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              {/* Push to talk / Tap to talk main button */}
              <button
                onClick={toggleListening}
                className={`flex-2 py-3 px-2 rounded-xl flex items-center justify-center gap-1 text-xs font-black shadow-sm transition-all border whitespace-nowrap shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white border-red-700 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                }`}
              >
                <Mic className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">{isListening ? '말씀 중 (종료)' : '🎙️ 지금 말하기'}</span>
              </button>

              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`flex-1 py-3 px-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
                  isMuted
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-amber-600 shrink-0" /> : <MicOff className="w-4 h-4 text-gray-500 shrink-0" />}
                <span className="whitespace-nowrap">{isMuted ? '음소거됨' : '음소거'}</span>
              </button>

              {/* End call button */}
              <button
                onClick={handleEndCall}
                className="flex-1 py-3 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-98 transition-all border border-red-700 whitespace-nowrap shrink-0"
              >
                <PhoneOff className="w-4 h-4 fill-white shrink-0" />
                <span className="whitespace-nowrap">종료</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Session Report (Displayed after call ends - Pure White Card) */}
      {finalReport && (
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-md space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#FFE000] text-gray-950 border border-gray-900/10 flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-950">
                  전화일본어 종합 분석 리포트
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  강사: {selectedCharacter.name} · 주제: {selectedTopic.title}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-red-600 font-mono">
                {finalReport.grammarAccuracyScore}점
              </div>
              <span className="text-[10px] font-black text-gray-500 font-mono">ACCURACY</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-gray-900 leading-relaxed shadow-xs">
            <span className="font-black block text-amber-950 mb-1 text-sm">
              【{selectedCharacter.name} 강사 피드백 메모】
            </span>
            {finalReport.aiSummary}
          </div>

          {finalReport.corrections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-bold">添削</span>
                <span>수업 중 교정 피드백 ({finalReport.corrections.length}건)</span>
              </h4>
              <div className="space-y-2">
                {finalReport.corrections.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 shadow-xs"
                  >
                    <div className="text-gray-400 line-through font-medium">
                      수강생 발화: {item.originalText}
                    </div>
                    <div className="font-black text-red-600 text-sm">
                      👉 원어민 추천: {item.improvedJapanese}
                    </div>
                    <div className="text-xs text-gray-700 font-medium">
                      이유: {item.feedbackPoint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unified Next Action Button */}
          <button
            onClick={checkMicAndStartCall}
            className="w-full py-3.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm border border-gray-900/15 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다음 통화 수업 시작하기</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Persistent Call History Modal (Pure White, Unified UI) */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4 max-h-[88vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FFE000] text-gray-950 text-[10px] font-black border border-gray-900/10">
                  CALL ARCHIVE
                </span>
                <h3 className="text-sm font-black text-gray-950">
                  지난 전화일본어 통화 기록부
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {callHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 font-medium">
                아직 저장된 통화 기록이 없습니다. 통화를 진행하면 이곳에 자동 저장됩니다!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-bold">
                  <span>총 {callHistory.length}회의 통화 녹취 보관 중</span>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>전체 삭제</span>
                  </button>
                </div>

                {callHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-gray-200">
                      <div>
                        <span className="font-black text-gray-950 text-sm">{rec.characterName}</span>
                        <span className="text-[11px] text-gray-500 font-mono ml-2">
                          {rec.date} {rec.time}
                        </span>
                      </div>
                      <span className="font-mono font-black text-sm text-red-600">
                        {rec.grammarScore}점
                      </span>
                    </div>

                    <div className="text-xs">
                      <div className="text-xs font-bold text-gray-800">
                        주제: {rec.topicTitle} ({Math.floor(rec.durationSeconds / 60)}분 {rec.durationSeconds % 60}초)
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {rec.aiSummary}
                      </p>
                    </div>

                    {rec.messages && rec.messages.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs">
                        <span className="text-[11px] font-bold text-gray-700 block mb-1">
                          녹취 하이라이트:
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {rec.messages.slice(0, 4).map((m, mIdx) => (
                            <div key={mIdx} className="text-xs flex items-start gap-1">
                              <span className="font-bold shrink-0 text-gray-700">{m.speakerName}:</span>
                              <span className="text-gray-950 font-medium line-clamp-1">{m.japanese}</span>
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
