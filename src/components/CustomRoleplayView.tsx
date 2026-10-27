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
    if (aiConfig && aiConfig.provider !== 'built_in' && aiConfig.apiKey) {
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
      {/* Top Mobile Card */}
      <div className="bg-white dark:bg-[#1E1D1B] rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                실전 맞춤형 상황극 (Roleplay)
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                실제 일본에서 마주치는 15+ 다양한 리얼 상황
              </span>
            </div>
          </div>

          <button
            onClick={handlePickRandomScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold active:scale-95 transition-all shadow-xs"
            title="실전 상황극 무작위 랜덤 뽑기"
          >
            <Shuffle className="w-3 h-3 text-rose-600" />
            <span>랜덤 뽑기</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-stone-100 dark:border-stone-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
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
                className={`min-w-[190px] max-w-[210px] p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between shrink-0 ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-rose-700 text-white'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700'
                      }`}
                    >
                      {sc.category} · {sc.level}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{sc.title}</h4>
                  <p
                    className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-rose-100' : 'text-stone-500 dark:text-stone-400'
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

      {/* Main Roleplay Chat Box */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col">
        {/* Scenario Header Bar */}
        <div className="p-5 bg-gradient-to-r from-teal-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
                내 역할: {selectedScenario.userRole}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
                상대: {selectedScenario.aiRole}
              </span>
            </div>
            <h3 className="text-lg font-black">{selectedScenario.title}</h3>
            <p className="text-xs text-teal-100 mt-1 max-w-xl">
              🎯 <strong>미션 목표: </strong>{selectedScenario.missionGoal}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinishRoleplay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-md transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              상황극 완료 & 종합 리포트
            </button>
            <button
              onClick={() => initScenario(selectedScenario)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="상황극 다시 시작"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40">
          {chatLog.map((chat, idx) => (
            <div
              key={idx}
              className={`flex gap-3 items-start animate-in fade-in duration-200 ${
                chat.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  chat.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'
                }`}
              >
                {chat.sender === 'user' ? '나' : '상대'}
              </div>

              <div
                className={`max-w-lg p-4 rounded-2xl space-y-1 shadow-sm ${
                  chat.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-bold ${chat.sender === 'user' ? 'text-indigo-200' : 'text-teal-600 dark:text-teal-400'}`}>
                    {chat.sender === 'user' ? selectedScenario.userRole : selectedScenario.aiRole}
                  </span>
                  {chat.sender === 'ai' && (
                    <button
                      onClick={() => speechService.speak(chat.japanese, 0.88)}
                      className="p-1 rounded text-slate-400 hover:text-teal-600"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm font-bold leading-relaxed">{chat.japanese}</p>
                <p className={`text-xs ${chat.sender === 'user' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {chat.korean}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>{selectedScenario.aiRole}가 답변을 생각하고 있습니다...</span>
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
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-2xl transition-all ${
                isMicOn
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="음성으로 말하기"
            >
              {isMicOn ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`[${selectedScenario.userRole}] 역할로 일본어로 답변하세요...`}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-2xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Comprehensive Report Modal */}
      {finalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase">
                  맞춤형 상황극 종합 평가 결과
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedScenario.title}
                </h3>
              </div>
              <button
                onClick={() => setFinalReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
              <span className="text-xs text-stone-400 block">문법 정확도 점수</span>
              <strong className="text-2xl font-black text-rose-600">
                {finalReport.grammarAccuracyScore}점
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
              <strong className="block font-bold mb-1">AI 롤플레잉 총평:</strong>
              {finalReport.aiSummary}
            </div>

            {finalReport.corrections.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  상황극 중 교정받은 표현 ({finalReport.corrections.length}건):
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {finalReport.corrections.map((cor) => (
                    <div
                      key={cor.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400 line-through">{cor.originalText}</span>
                        <span className="text-teal-600 font-bold">👉 {cor.improvedJapanese}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{cor.feedbackPoint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setFinalReport(null)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              확인 및 상황극 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
