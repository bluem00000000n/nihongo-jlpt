'use client';

import React, { useState } from 'react';
import { UserStats } from '@/types';
import { Sparkles, Settings2, Eye, BookOpen, Volume2, VolumeX, X } from 'lucide-react';

interface HeaderProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  activeTab: string;
  onOpenAISettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onUpdateStats,
  onOpenAISettings,
}) => {
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  const aiProviderName =
    stats.aiSettings?.provider === 'openai'
      ? `ChatGPT (${stats.aiSettings.isConnected ? '연결됨' : '미연결'})`
      : stats.aiSettings?.provider === 'gemini'
      ? `Google Gemini (${stats.aiSettings.isConnected ? '기본 연결됨' : '연결됨'})`
      : '내장 AI';

  return (
    <>
      {/* Brand Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E2D9C8] transition-colors shadow-xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5">
            {/* Japanese Hanko Inkan Seal Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#D93829] text-white flex items-center justify-center font-serif font-black text-sm shadow-[1px_2px_0px_rgba(0,0,0,0.15)] border border-[#B92B1E]">
              日
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-gray-950 font-sans">
                  nihongo-jlpt
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#FFE000] text-gray-950 font-black border border-gray-900/15 shadow-[1px_1px_0px_rgba(0,0,0,0.1)]">
                  学習帳
                </span>
              </div>
              <p className="text-[10px] text-gray-600 font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                <span className="font-bold">도쿄 표준어 · 東京標準語</span>
                <span className="px-1 py-0.2 rounded-xs bg-[#D93829] text-white font-extrabold text-[8px] leading-tight shadow-xs">
                  NHK 共通語
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Settings Button */}
            <button
              onClick={() => setIsQuickSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-gray-950 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300 text-xs font-black shadow-xs"
              title="도쿄 표준 발음 및 학습 설정"
              aria-label="설정"
            >
              <Settings2 className="w-3.5 h-3.5 text-gray-700" />
              <span>설정</span>
            </button>
          </div>
        </div>
      </header>

      {/* Quick Settings Bottom Sheet / Modal (Pure White, Unified UI) */}
      {isQuickSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-gray-700" />
                <h3 className="font-black text-sm text-gray-950">학습 및 발음 설정</h3>
              </div>
              <button
                onClick={() => setIsQuickSettingsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-950 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tokyo Standard Voice Indicator */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-gray-600">
                    음성 발음 기준
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#FFE000] text-gray-950 font-black text-[10px] shadow-xs">
                  도쿄 표준 발음
                </span>
              </div>
              <p className="text-xs font-black text-gray-950">
                東京標準語 · NHK 共通語アクセント
              </p>
              <p className="text-xs text-gray-600 leading-normal font-medium">
                사투리 없는 도쿄 수도권 표준 억양(東京式ピッチアクセント)으로 원어민 발음 및 통화가 재생됩니다.
              </p>
            </div>

            {/* AI Engine Status & Configuration */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">AI 엔진</span>
                <span className="text-xs font-black text-gray-950 flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  {aiProviderName}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsQuickSettingsOpen(false);
                  onOpenAISettings();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FFE000] text-gray-950 text-xs font-black border border-gray-900/15 hover:bg-[#FACC15] transition-colors shadow-xs"
              >
                연동 관리
              </button>
            </div>

            {/* Reading Assistance Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block px-1">
                학습 보조 표기
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Furigana Toggle */}
                <button
                  onClick={() => onUpdateStats({ furiganaEnabled: !stats.furiganaEnabled })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    stats.furiganaEnabled
                      ? 'bg-red-50 border-red-300 text-red-950 font-bold'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-red-100 text-red-700">
                      {stats.furiganaEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-xs font-black">후리가나 (독음)</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 font-medium">한자 위에 히라가나 표시</div>
                </button>

                {/* Romaji Toggle */}
                <button
                  onClick={() => onUpdateStats({ romajiEnabled: !stats.romajiEnabled })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    stats.romajiEnabled
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">
                      {stats.romajiEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-xs font-black">로마자 발음</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 font-medium">알파벳 발음 가이드</div>
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {stats.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-800" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <div className="text-xs font-black text-gray-950">원어민 발음 효과음</div>
                  <div className="text-[10px] text-gray-500 font-medium">음성 터치 시 자동 재생</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateStats({ soundEnabled: !stats.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  stats.soundEnabled ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white block shadow-sm transform transition-transform ${
                    stats.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setIsQuickSettingsOpen(false)}
              className="w-full py-3 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 rounded-xl text-xs font-black border border-gray-900/15 shadow-sm active:scale-98 transition-all"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </>
  );
};
