'use client';

import React, { useState } from 'react';
import { UserStats } from '@/types';
import { Flame, Sparkles, Settings2, Eye, BookOpen, Volume2, VolumeX, X } from 'lucide-react';

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
      ? 'ChatGPT'
      : stats.aiSettings?.provider === 'gemini'
      ? 'Gemini'
      : '내장 AI';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1C1B19]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5">
            {/* Traditional Shu-iro Vermilion Mark */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white font-serif font-black text-base shadow-sm shadow-rose-900/10">
              日
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 font-sans">
                  nihongo-jlpt
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-semibold border border-rose-200/60 dark:border-rose-900/40">
                  日本語
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50 rounded-full text-xs font-bold"
              title={`${stats.streak}일 연속 학습 중`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{stats.streak}일</span>
            </div>

            {/* Quick Settings & AI Drawer Button */}
            <button
              onClick={() => setIsQuickSettingsOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200/70 dark:border-stone-700"
              title="학습 설정 및 AI 엔진 선택"
              aria-label="설정"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Settings Bottom Sheet / Modal (Human designed, warm & clean) */}
      {isQuickSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#FAF9F5] dark:bg-[#1C1B19] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">학습 및 AI 설정</h3>
              </div>
              <button
                onClick={() => setIsQuickSettingsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Engine Status & Configuration */}
            <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">AI 엔진</span>
                <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  {aiProviderName}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsQuickSettingsOpen(false);
                  onOpenAISettings();
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                연동 관리
              </button>
            </div>

            {/* Reading Assistance Toggles */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block px-1">
                학습 보조 표기
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Furigana Toggle */}
                <button
                  onClick={() => onUpdateStats({ furiganaEnabled: !stats.furiganaEnabled })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    stats.furiganaEnabled
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                      {stats.furiganaEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-xs font-bold">후리가나 (독음)</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">한자 위에 히라가나 표시</div>
                </button>

                {/* Romaji Toggle */}
                <button
                  onClick={() => onUpdateStats({ romajiEnabled: !stats.romajiEnabled })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    stats.romajiEnabled
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                      {stats.romajiEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-xs font-bold">로마자 발음</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">알파벳 발음 가이드</div>
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {stats.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">원어민 발음 효과음</div>
                  <div className="text-[10px] text-stone-400">음성 터치 시 자동 재생</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateStats({ soundEnabled: !stats.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  stats.soundEnabled ? 'bg-rose-600' : 'bg-stone-300 dark:bg-stone-700'
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
              className="w-full py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-xl text-xs font-bold"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </>
  );
};
