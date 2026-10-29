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
    initScenario(selectedScenario);
  }, [selectedScenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const initScenario = (scenario: CustomRoleplayScenario) => {
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
      {/* Top Mobile Card (LOFT Stationery Memo) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#DDD4C1] dark:border-stone-800 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="px-1 py-0.2 bg-[#FFE000] text-black font-black text-[9px] rounded-xs shadow-xs">LOFT ROLEPLAY</span>
            <span>REAL-LIFE SCENARIOS</span>
          </div>
          <span>TOTAL: 10 SCENARIOS</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-[#D93829] text-white flex items-center justify-center font-bold text-sm shadow-[1px_2px_0px_rgba(0,0,0,0.15)]">
              劇
            </span>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                실전 맞춤형 상황극 (Roleplay)
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                실제 일본에서 마주치는 10+ 리얼 상황
              </span>
            </div>
          </div>

          <button
            onClick={handlePickRandomScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 border border-stone-800/20 text-xs font-extrabold active:scale-95 transition-all shadow-[1px_2px_0px_rgba(0,0,0,0.1)]"
            title="실전 상황극 무작위 랜덤 뽑기"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>🎲 랜덤 뽑기</span>
          </button>
        </div>

        {/* Category Filter Pills (Stationery Index Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-[#DDD5C5] dark:border-stone-700 hover:bg-[#F4EFE4]'
              }`}
            >
              {cat === 'ALL' ? '전체 상황극' : cat}
            </button>
          ))}
        </div>

        {/* Horizontal Scenario Carousel */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {filteredScenarios.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`min-w-[190px] max-w-[210px] p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between shrink-0 ${
                  isSelected
                    ? 'bg-[#FFE000] text-stone-900 border-stone-900 shadow-[1px_2px_0px_rgba(0,0,0,0.15)]'
                    : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border-[#DDD5C5] dark:border-stone-750 hover:border-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs ${
                        isSelected
                          ? 'bg-stone-900 text-white'
                          : 'bg-[#F5EFE3] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-[#E5DEC9] dark:border-stone-700'
                      }`}
                    >
                      {sc.category} · {sc.level}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold line-clamp-1">{sc.title}</h4>
                  <p
                    className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-stone-800 font-medium' : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {sc.situation}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Roleplay Chat Box (LOFT Notebook Page) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Scenario Header Bar */}
        <div className="p-4 bg-[#35312C] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#25221E]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white/15 rounded-xs text-stone-200 font-mono">
                내 역할: {selectedScenario.userRole}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white/15 rounded-xs text-stone-200 font-mono">
                상대: {selectedScenario.aiRole}
              </span>
            </div>
            <h3 className="text-base font-extrabold tracking-tight">{selectedScenario.title}</h3>
            <p className="text-xs text-amber-300 mt-1 max-w-xl">
              🎯 <strong>미션 목표: </strong>{selectedScenario.missionGoal}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinishRoleplay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 text-xs font-black shadow-xs transition-all border border-stone-800/30"
            >
              <Award className="w-3.5 h-3.5" />
              완료 & 리포트
            </button>
            <button
              onClick={() => initScenario(selectedScenario)}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white"
              title="상황극 다시 시작"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto bg-[#FDFCF9] dark:bg-[#181715] loft-dot-bg">
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
                    ? 'bg-[#FFE000] text-stone-900 border border-stone-800/30'
                    : 'bg-[#D93829] text-white font-serif'
                }`}
              >
                {chat.sender === 'user' ? '私' : '相'}
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-xl space-y-1 shadow-xs ${
                  chat.sender === 'user'
                    ? 'bg-[#FEF9C3] dark:bg-[#2C2718] text-stone-900 dark:text-stone-100 border border-[#FDE047] dark:border-yellow-900/60 rounded-tr-xs'
                    : 'bg-white dark:bg-[#22201D] text-stone-900 dark:text-stone-100 border border-[#E2D9C8] dark:border-stone-750 border-l-4 border-l-[#D93829] rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-mono font-bold ${chat.sender === 'user' ? 'text-amber-800 dark:text-amber-300' : 'text-stone-500'}`}>
                    {chat.sender === 'user' ? selectedScenario.userRole : selectedScenario.aiRole}
                  </span>
                  {chat.sender === 'ai' && (
                    <button
                      onClick={() => speechService.speak(chat.japanese, 0.88)}
                      className="p-1 rounded text-stone-400 hover:text-stone-700"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold leading-relaxed">{chat.japanese}</p>
                <p className={`text-xs ${chat.sender === 'user' ? 'text-amber-900 dark:text-amber-200' : 'text-stone-500 dark:text-stone-400'}`}>
                  {chat.korean}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-stone-500 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#D93829] animate-ping" />
              <span>{selectedScenario.aiRole}가 답변을 작성하고 있습니다...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-white border-t border-gray-200">
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
                  : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border-[#DDD5C5] dark:border-stone-700 hover:bg-[#F2ECE1]'
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
              className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-[#DDD5C5] dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-800"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-3.5 py-2 bg-[#FFE000] hover:bg-[#FACC15] disabled:opacity-40 text-stone-900 font-extrabold rounded-lg shadow-xs transition-all active:scale-95 border border-stone-800/20 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

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
