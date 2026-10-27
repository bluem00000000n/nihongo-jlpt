'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomRoleplayScenario, UserStats, ComprehensiveReport, DialogueCorrectionItem } from '@/types';
import { defaultRoleplayScenarios } from '@/data/roleplay';
import { speechService } from '@/utils/speech';
import { generateSessionReport } from '@/utils/reportManager';
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

  // Mic Toggle
  const toggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다.');
      return;
    }

    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsMicOn(false);
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
      rec.onerror = () => setIsMicOn(false);
      rec.onend = () => setIsMicOn(false);
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsMicOn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                맞춤형 상황극 (Roleplay)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950 text-xs font-bold">
                비즈니스 · 여행 · 심층 토론
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              주제와 난이도를 선택해 실전처럼 대화하는 롤플레잉
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
              신입사원, 바이어, 호텔 투숙객 등 원하는 역할을 맡아 AI와 미션을 달성하세요. 대화 중 실시간 교정과 종료 후 <strong>종합 피드백 리포트</strong>가 제공됩니다.
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
      </div>

      {/* Category Filter & Scenario Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat === 'ALL' ? '전체 상황극' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredScenarios.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg scale-[1.01]'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sc.category} · {sc.level}
                    </span>
                  </div>
                  <h4 className="text-sm font-black line-clamp-1">{sc.title}</h4>
                  <p
                    className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
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

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">문법 정확도 점수</span>
                <strong className="text-2xl font-black text-teal-600">
                  {finalReport.grammarAccuracyScore}점
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">달성 보상</span>
                <strong className="text-2xl font-black text-purple-600">+60 XP</strong>
              </div>
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
