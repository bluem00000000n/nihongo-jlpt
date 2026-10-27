'use client';

import React from 'react';
import {
  Crown,
  BookMarked,
  MessageSquareText,
  Layers,
  SpellCheck,
  Trophy,
  Headphones,
  PhoneCall,
  Target,
} from 'lucide-react';
import { NavTab } from '@/types';

export type { NavTab };

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  completedGrammarCount: number;
  totalGrammarCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  completedGrammarCount,
  totalGrammarCount,
}) => {
  const tabs = [
    {
      id: 'n1_adaptive' as NavTab,
      label: 'AI 1급 합격 대화',
      sub: 'N5부터 상태 인지 승급',
      icon: Crown,
      color: 'text-amber-500 dark:text-amber-400',
      badge: 'N5 ➔ N1',
    },
    {
      id: 'hands_free_call' as NavTab,
      label: '콜 모드 (Hands-Free)',
      sub: '운전/산책 중 음성 통화',
      icon: PhoneCall,
      color: 'text-emerald-500 dark:text-emerald-400',
      badge: '핸즈프리',
    },
    {
      id: 'custom_roleplay' as NavTab,
      label: '맞춤형 상황극',
      sub: '비즈니스 · 여행 · 토론',
      icon: Target,
      color: 'text-teal-600 dark:text-teal-400',
    },
    {
      id: 'grammar' as NavTab,
      label: '급수별 문법',
      sub: `${completedGrammarCount}/${totalGrammarCount} 완료`,
      icon: BookMarked,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'shadowing' as NavTab,
      label: '3단계 섀도잉',
      sub: '실전 문장 채집 & 리스닝',
      icon: Headphones,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'vocab' as NavTab,
      label: '필수 어휘',
      sub: '테마별 플래시카드',
      icon: Layers,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'quiz' as NavTab,
      label: '퀴즈 테스트',
      sub: '어순 배열 & 빈칸',
      icon: Trophy,
      color: 'text-cyan-600 dark:text-cyan-400',
    },
  ];

  return (
    <nav className="w-full bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white font-bold rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    {tab.sub}
                  </div>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
