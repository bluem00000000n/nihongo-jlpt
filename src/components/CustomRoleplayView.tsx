'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomRoleplayScenario, UserStats, ComprehensiveReport, DialogueCorrectionItem } from '@/types';
import { defaultRoleplayScenarios } from '@/data/roleplay';
import { speechService } from '@/utils/speech';
import { generateSessionReport } from '@/utils/reportManager';
import { MicrophonePermissionModal } from '@/components/MicrophonePermissionModal';
import {
  Briefcase,
  Plane,
  MessageSquare,
  ShoppingBag,
  Target,
  Send,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Award,
  Sparkles,
  Edit3,
  RotateCcw,
  Zap,
  Shuffle,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomRoleplayViewProps {
  stats: UserStats;
  onAddXP: (amount: number) => void;
  onOpenAISettings: () => void;
}

export const CustomRoleplayView: React.FC<CustomRoleplayViewProps> = ({
  stats,
  onAddXP,
  onOpenAISettings,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<CustomRoleplayScenario>(
    defaultRoleplayScenarios[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [chatLog, setChatLog] = useState<{ sender: 'ai' | 'user'; japanese: string; korean: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [corrections, setCorrections] = useState<DialogueCorrectionItem[]>([]);
  const [finalReport, setFinalReport] = useState<ComprehensiveReport | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const startScenario = (scenario: CustomRoleplayScenario) => {
    setSelectedScenario(scenario);
    setIsPlaying(true);
    setChatLog([
      {
        sender: 'ai',
        japanese: scenario.openingJapanese,
        korean: scenario.openingKorean,
      },
    ]);
    setCorrections([]);
    setFinalReport(null);
    setInputText('');

    if (stats.soundEnabled) {
      setTimeout(() => speechService.speak(scenario.openingJapanese, 0.88), 300);
    }
  };

  const restartScenario = () => {
    if (!selectedScenario) return;
    startScenario(selectedScenario);
  };

  const exitToScenarioList = () => {
    speechService.stop();
    setIsPlaying(false);
  };

  const categories = ['ALL', '비즈니스 회의', '여행/호텔', '심층 토론', '일상/쇼핑'];

  const filteredScenarios = defaultRoleplayScenarios.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  const handlePickRandomScenario = () => {
    const pool = filteredScenarios.length > 0 ? filteredScenarios : defaultRoleplayScenarios;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    setSelectedScenario(randomItem);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');
    setChatLog((prev) => [
      ...prev,
      { sender: 'user', japanese: text, korean: '나의 롤플레잉 답변' },
    ]);
    setIsTyping(true);

    let replyJp = '';
    let replyKr = '';
    let itemCorrection: DialogueCorrectionItem | null = null;

    // Call ChatGPT or Gemini if configured
    const aiConfig = stats.aiSettings;
    if (aiConfig && aiConfig.provider !== 'built_in' && (aiConfig.apiKey || aiConfig.provider === 'gemini')) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            model: aiConfig.model,
            currentLevel: selectedScenario.level,
            levelProgress: 50,
            history: chatLog.slice(-6).map((c) => ({ sender: c.sender, japanese: c.japanese })),
            userMessage: `[상황극: ${selectedScenario.title} | 내 역할: ${selectedScenario.userRole} | AI 역할: ${selectedScenario.aiRole}]\n\n${text}`,
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
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
        }
      } catch (e) {
        console.warn('API error in roleplay, falling back:', e);
      }
    }

    // Smart fallback
    if (!replyJp) {
      await new Promise((r) => setTimeout(r, 700));

      if (selectedScenario.category === '비즈니스 회의') {
        replyJp = 'なるほど、貴方のご提案の趣旨をよく理解いたしました。開発品質を担保する観点からも、段階的なリリース案は非常に合理的ですね。社内でも承認を進めます。';
        replyKr = '그렇군요, 귀하의 제안 취지를 잘 이해했습니다. 개발 품질을 담보하는 관점에서도 단계적 릴리스 방안은 대단히 합리적이네요. 사내에서도 승인을 진행하겠습니다.';
      } else if (selectedScenario.category === '여행/호텔') {
        replyJp = 'かしこまりました。お客様のご要望通り、12階の角部屋・禁煙室へ変更の手続きが完了いたしました。ごゆっくりお寛ぎくださいませ。';
        replyKr = '알겠습니다. 고객님의 요청대로 12층 코너 룸 금연실로 변경 절차가 완료되었습니다. 편안한 시간 되십시오.';
      } else if (selectedScenario.category === '심층 토론') {
        replyJp = '非常に鋭いご指摘です。技術革新のスピードに制度設計が追いつかない現状を鑑みても、倫理的ガ이드라인の策定は急務と言わざるを得ませんね。';
        replyKr = '대단히 날카로운 지적입니다. 기술 혁신의 속도에 제도 설계가 따라가지 못하는 현 상황을 감안하더라도 윤리적 가이드라인 책정은 시급한 과제라고 하지 않을 수 없겠군요.';
      } else {
        replyJp = 'とてもお似合いですよ！免税（Tax-Free）の手続きもレジにて承りますので、パスポートをご提示くださいね。';
        replyKr = '정말 잘 어울리세요! 면세 절차도 계산대에서 진행해 드리니 여권을 제시해 주세요.';
      }
    }

    if (itemCorrection) {
      setCorrections((prev) => [...prev, itemCorrection!]);
    }

    setChatLog((prev) => [...prev, { sender: 'ai', japanese: replyJp, korean: replyKr }]);
    setIsTyping(false);
    onAddXP(25);

    if (stats.soundEnabled) {
      speechService.speak(replyJp, 0.88);
    }
  };

  // Complete Roleplay Mission & Generate Report
  const handleFinishRoleplay = () => {
    const report = generateSessionReport(
      180,
      chatLog.length,
      selectedScenario.level,
      corrections,
      ['契約', '確認', '日程', '相談', '感謝']
    );
    setFinalReport(report);
    onAddXP(60);
    confetti({
      particleCount: 70,
      spread: 75,
    });
  };

  // Mic Toggle with Permission Check
  const toggleMic = async () => {
    if (typeof window === 'undefined') return;

    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsMicOn(false);
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: any) {
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
        const text = e.results[0][0].transcript;
        setInputText(text);
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

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      <MicrophonePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGranted={() => {
          setIsPermissionModalOpen(false);
          toggleMic();
        }}
        featureName="맞춤형 상황극 음성 대화"
      />

      {/* 1. SCENARIO SELECTION & BRIEFING (When not playing) */}
      {!isPlaying && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Control Header */}
          <div className="bg-[#FDFCF9] rounded-2xl p-4 border border-[#E2D9C8] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D2] text-[10px] font-mono text-[#7A6E63] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-[#FFE000] text-gray-950 font-black text-[9px] rounded-md shadow-xs">ROLEPLAY</span>
                <span className="text-[#2B2725]">REAL-LIFE SCENARIOS</span>
              </div>
              <span>TOTAL: {defaultRoleplayScenarios.length} SCENARIOS</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-md bg-[#D93829] text-white flex items-center justify-center font-bold text-sm shadow-[1px_2px_0px_rgba(0,0,0,0.15)] shrink-0">
                  劇
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-black text-[#2B2725] leading-tight truncate">
                    실전 맞춤형 상황극 (Roleplay)
                  </h2>
                  <span className="text-[10px] sm:text-[11px] text-[#7A6E63] font-medium truncate block">
                    원하는 상황을 선택하여 대화를 시작하세요
                  </span>
                </div>
              </div>

              <button
                onClick={handlePickRandomScenario}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 border border-gray-900/15 text-xs font-black active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0"
                title="실전 상황극 무작위 랜덤 추천"
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">🎲 랜덤 추천</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap truncate ${
                    selectedCategory === cat
                      ? 'bg-[#2B2725] text-[#FAF7F0] shadow-xs'
                      : 'bg-[#FAF7F0] text-[#5A5047] border border-[#E2D9C8] hover:bg-[#F3ECE0]'
                  }`}
                >
                  {cat === 'ALL' ? '전체 상황' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Scenario Briefing & Start Card */}
          <div className="bg-[#FDFCF9] rounded-2xl border-2 border-[#E2D9C8] shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D2]">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#2B2725] text-[#FFE000]">
                {selectedScenario.category} · {selectedScenario.level}
              </span>
              <span className="text-xs font-bold text-[#7A6E63]">
                선택된 상황극
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#2B2725]">
                {selectedScenario.title}
              </h3>
              <p className="text-xs text-[#5A5047] mt-1.5 leading-relaxed break-keep">
                {selectedScenario.situation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E2D9C8] text-xs">
                <span className="text-[10px] font-bold text-[#7A6E63] block">나의 역할</span>
                <strong className="text-[#2B2725] font-black">{selectedScenario.userRole}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E2D9C8] text-xs">
                <span className="text-[10px] font-bold text-[#7A6E63] block">대화 상대</span>
                <strong className="text-[#D93829] font-black">{selectedScenario.aiRole}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 leading-relaxed break-keep">
              🎯 <strong className="font-bold text-amber-950">미션 목표: </strong>{selectedScenario.missionGoal}
            </div>

            <button
              onClick={() => startScenario(selectedScenario)}
              className="w-full py-4 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-sm shadow-md border border-gray-900/15 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>🎭 상황극 대화 시작하기</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Scenario Catalog Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7A6E63] font-bold px-1">
              <span>상황극 목록 ({filteredScenarios.length}개)</span>
              <span className="text-[11px]">카드를 터치하여 변경</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredScenarios.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#F5EFE3] text-[#2B2725] border-2 border-[#2B2725] shadow-xs'
                        : 'bg-[#FDFCF9] text-[#2B2725] border-[#E2D9C8] hover:border-[#C8BCAB]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#7A6E63] border border-[#E2D9C8]">
                          {sc.category} · {sc.level}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black text-[#D93829]">
                            ✓ 선택됨
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black line-clamp-1 text-[#2B2725] mt-1">{sc.title}</h4>
                      <p className="text-[11px] text-[#5A5047] line-clamp-2 mt-1 break-keep">
                        {sc.situation}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN ROLEPLAY CHAT BOX (Only when playing) */}
      {isPlaying && (
        <div className="bg-[#FDFCF9] rounded-2xl border border-[#E2D9C8] shadow-sm overflow-hidden flex flex-col animate-fade-in">
          {/* Scenario Header Bar */}
          <div className="p-3.5 sm:p-4 bg-[#F5EFE3] text-[#2B2725] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E2D9C8]">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={exitToScenarioList}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F3ECE0] text-[#2B2725] border border-[#E2D9C8] text-xs font-bold transition-colors shadow-2xs whitespace-nowrap shrink-0"
                >
                  ← 상황극 목록
                </button>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF7F0] rounded-md text-[#5A5047] font-mono border border-[#E2D9C8] whitespace-nowrap shrink-0">
                  내 역할: {selectedScenario.userRole}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF7F0] rounded-md text-[#D93829] font-mono border border-[#E2D9C8] whitespace-nowrap shrink-0">
                  상대: {selectedScenario.aiRole}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-[#2B2725] truncate">{selectedScenario.title}</h3>
              <p className="text-xs text-amber-950 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 max-w-xl font-medium break-keep">
                🎯 <strong className="font-bold text-amber-950">미션 목표: </strong>{selectedScenario.missionGoal}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={handleFinishRoleplay}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 text-xs font-black shadow-xs transition-all border border-gray-900/15 whitespace-nowrap shrink-0"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">완료 & 리포트</span>
              </button>
              <button
                onClick={restartScenario}
                className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3ECE0] text-[#2B2725] border border-[#E2D9C8] transition-colors shrink-0"
                title="상황극 다시 시작"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto bg-[#FAF7F0] loft-grid-bg">
            {chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 items-start animate-fade-in ${
                  chat.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                    chat.sender === 'user'
                      ? 'bg-[#FFE000] text-gray-950 border border-gray-900/30'
                      : 'bg-[#D93829] text-white font-serif'
                  }`}
                >
                  {chat.sender === 'user' ? '私' : '相'}
                </div>

                <div
                  className={`max-w-[85%] p-3.5 rounded-xl space-y-1 shadow-xs ${
                    chat.sender === 'user'
                      ? 'bg-amber-50 text-gray-950 border border-amber-300 rounded-tr-xs font-bold'
                      : 'bg-white text-gray-950 border border-gray-200 border-l-4 border-l-[#D93829] rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[10px] font-mono font-bold ${chat.sender === 'user' ? 'text-amber-800' : 'text-gray-500'}`}>
                      {chat.sender === 'user' ? selectedScenario.userRole : selectedScenario.aiRole}
                    </span>
                    {chat.sender === 'ai' && (
                      <button
                        onClick={() => speechService.speak(chat.japanese, 0.88)}
                        className="p-1 rounded text-gray-400 hover:text-gray-700"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold leading-relaxed break-keep break-words text-[#1C1917]">{chat.japanese}</p>
                  <p className={`text-xs break-keep break-words mt-1 ${chat.sender === 'user' ? 'text-amber-900 font-medium' : 'text-gray-600'}`}>
                    {chat.korean}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-gray-500 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#D93829] animate-ping" />
                <span>{selectedScenario.aiRole}가 답변을 작성하고 있습니다...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-[#FDFCF9] border-t border-[#E2D9C8]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-lg transition-all border ${
                  isMicOn
                    ? 'bg-[#D93829] text-white border-[#B92B1E] animate-pulse'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="음성으로 말하기"
              >
                {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`[${selectedScenario.userRole}] 역할로 일본어로 답변`}
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
      )}

      {/* Comprehensive Report Modal (LOFT Stationery Evaluation Sheet - Pure White) */}
      {finalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto relative text-gray-900">
            <div className="flex items-start justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider block">
                  EVALUATION NOTE · 評価シート
                </span>
                <h3 className="text-base font-black text-gray-950 mt-0.5">
                  {selectedScenario.title}
                </h3>
              </div>
              <button
                onClick={() => setFinalReport(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center shadow-xs">
              <span className="text-xs text-gray-500 block font-mono font-bold">ACCURACY SCORE</span>
              <strong className="text-2xl font-black text-red-600">
                {finalReport.grammarAccuracyScore}점
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed shadow-xs">
              <strong className="block font-black text-amber-950 mb-1">【AI 총평 메모】</strong>
              {finalReport.aiSummary}
            </div>

            {finalReport.corrections.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-gray-950 block">
                  교정 피드백 ({finalReport.corrections.length}건):
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {finalReport.corrections.map((cor) => (
                    <div
                      key={cor.id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1 shadow-xs"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 line-through font-medium">{cor.originalText}</span>
                        <span className="text-red-600 font-black">👉 {cor.improvedJapanese}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium">{cor.feedbackPoint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setFinalReport(null)}
              className="w-full py-3.5 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs rounded-xl shadow-sm border border-gray-900/15 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>확인 및 리포트 닫기</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
