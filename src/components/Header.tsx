'use client';

import React from 'react';
import { UserStats } from '@/types';
import { Flame, Sparkles, Volume2, VolumeX, Eye, BookOpen } from 'lucide-react';

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
  const aiProviderName =
    stats.aiSettings?.provider === 'openai'
      ? 'ChatGPT'
      : stats.aiSettings?.provider === 'gemini'
      ? 'Gemini'
      : '내장 AI';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl tracking-tighter">
            日
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                nihongo-jlpt <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold">日本語</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              대화하며 JLPT 1급(N1) 합격까지 이끄는 AI 학습 도구
            </p>
          </div>
        </div>

        {/* Global toggles and user streak / stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Provider Settings Button */}
          <button
            onClick={onOpenAISettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="ChatGPT / Gemini AI API 연동 설정"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span className="hidden sm:inline">AI 엔진:</span>
            <span className="font-extrabold">{aiProviderName}</span>
          </button>

          {/* Furigana Toggle */}
          <button
            onClick={() => onUpdateStats({ furiganaEnabled: !stats.furiganaEnabled })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              stats.furiganaEnabled
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
            title="한자 위에 히라가나 독음 표시 켜기/끄기"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">후리가나</span>
            <span className="font-bold">{stats.furiganaEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Romaji Toggle */}
          <button
            onClick={() => onUpdateStats({ romajiEnabled: !stats.romajiEnabled })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              stats.romajiEnabled
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
            title="로마자 발음 표기 켜기/끄기"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로마자</span>
            <span className="font-bold">{stats.romajiEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={() => onUpdateStats({ soundEnabled: !stats.soundEnabled })}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              stats.soundEnabled
                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-400 line-through hover:bg-slate-100'
            }`}
            title="음성 효과 켜기/끄기"
          >
            {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Streak */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900 rounded-xl font-bold text-xs shadow-sm">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{stats.streak}일 연속</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-900 rounded-xl font-bold text-xs shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{stats.xp} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
