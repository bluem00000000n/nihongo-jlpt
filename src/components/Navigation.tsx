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
      {/* Sub-bar for Study Mode tabs (Stationery Index Flag Stickers) */}
      {isStudyTab && (
        <div className="bg-[#FAF7F0] dark:bg-[#1C1B19] border-b border-[#E5DEC9] dark:border-stone-800 px-3 py-2 sticky top-[82px] z-30 transition-colors">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-md mx-auto">
            {studySubTabs.map((sub, idx) => {
              const SubIcon = sub.icon;
              const isSelected = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onChangeTab(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs whitespace-nowrap transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-[#FFE000] text-stone-900 font-extrabold shadow-[1px_2px_0px_rgba(0,0,0,0.12)] border border-stone-800/30'
                      : 'bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-[#E0D8C6] dark:border-stone-700 hover:bg-[#F4EFE4] font-medium shadow-[0_1px_1px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-stone-400 font-normal">0{idx + 1}</span>
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D93829] inline-block -ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Tab Bar (LOFT Stationery Index Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F0]/98 dark:bg-[#1C1B19]/98 backdrop-blur-md border-t border-[#E5DEC9] dark:border-stone-800 pb-[env(safe-area-inset-bottom,8px)] pt-1.5 shadow-[0_-3px_12px_rgba(30,25,20,0.05)]">
        <div className="max-w-md mx-auto px-3 flex items-center justify-around">
          {mainTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = tab.isActiveOverride !== undefined ? tab.isActiveOverride : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[64px] transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-stone-900 dark:text-white font-extrabold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
                }`}
              >
                <div
                  className={`w-10 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FFE000] text-stone-900 shadow-[1px_2px_0px_rgba(0,0,0,0.12)] border border-stone-800/20'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>

                {/* Hanko red stamp active dot */}
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#D93829]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
