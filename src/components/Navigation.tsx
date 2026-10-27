'use client';

import React from 'react';
import {
  Crown,
  BookMarked,
  PhoneCall,
  Target,
  Headphones,
  Layers,
  Trophy,
  BookOpen,
  MessageSquareText,
  SpellCheck,
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
  // Main 4 Mobile Bottom Tabs
  const isStudyTab = ['grammar', 'shadowing', 'vocab', 'dialogue', 'quiz', 'kana'].includes(activeTab);

  const mainTabs = [
    {
      id: 'n1_adaptive' as NavTab,
      label: '1급 대화',
      sub: 'N5→N1 승급',
      icon: Crown,
    },
    {
      id: 'hands_free_call' as NavTab,
      label: '콜 모드',
      sub: '핸즈프리 통화',
      icon: PhoneCall,
    },
    {
      id: 'custom_roleplay' as NavTab,
      label: '상황극',
      sub: '롤플레잉',
      icon: Target,
    },
    {
      id: 'grammar' as NavTab,
      label: '학습실',
      sub: '문법·섀도잉·회화',
      icon: BookOpen,
      isActiveOverride: isStudyTab,
    },
  ];

  // Secondary sub-tabs for Study Mode (문법, 섀도잉, 단어장, 실전 회화, 퀴즈, 가나)
  const studySubTabs = [
    { id: 'grammar' as NavTab, label: '급수별 문법', icon: BookMarked },
    { id: 'shadowing' as NavTab, label: '3단계 섀도잉', icon: Headphones },
    { id: 'vocab' as NavTab, label: '단어장', icon: Layers },
    { id: 'dialogue' as NavTab, label: '실전 회화', icon: MessageSquareText },
    { id: 'quiz' as NavTab, label: '퀴즈 테스트', icon: Trophy },
    { id: 'kana' as NavTab, label: '가나 차트', icon: SpellCheck },
  ];

  return (
    <>
      {/* Sub-bar for Study Mode tabs if a study tab is currently active */}
      {isStudyTab && (
        <div className="bg-[#FAF9F5] dark:bg-[#18181B] border-b border-stone-200/80 dark:border-stone-800 px-3 py-2 sticky top-[57px] z-30 transition-colors">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-md mx-auto">
            {studySubTabs.map((sub) => {
              const SubIcon = sub.icon;
              const isSelected = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onChangeTab(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/70 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Tab Bar (App-like navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C1B19]/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 pb-[env(safe-area-inset-bottom,8px)] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto px-3 flex items-center justify-around">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isActiveOverride !== undefined ? tab.isActiveOverride : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[64px] transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
                }`}
              >
                <div
                  className={`w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 scale-105'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>

                {/* Subtle active pill indicator */}
                {isActive && (
                  <span className="absolute -top-0.5 w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
