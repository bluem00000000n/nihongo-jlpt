'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { NavTab } from '@/types';
import { AdaptiveN1View } from '@/components/AdaptiveN1View';
import { HandsFreeCallView } from '@/components/HandsFreeCallView';
import { CustomRoleplayView } from '@/components/CustomRoleplayView';
import { GrammarView } from '@/components/GrammarView';
import { ShadowingView } from '@/components/ShadowingView';
import { VocabView } from '@/components/VocabView';
import { KanaView } from '@/components/KanaView';
import { QuizChallengeView } from '@/components/QuizChallengeView';
import { AISettingsModal } from '@/components/AISettingsModal';
import { grammarData } from '@/data/grammar';
import { vocabData } from '@/data/vocab';
import { loadUserStats, saveUserStats, defaultStats } from '@/utils/storage';
import { UserStats } from '@/types';

export default function Home() {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [activeTab, setActiveTab] = useState<NavTab>('n1_adaptive');
  const [mounted, setMounted] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  useEffect(() => {
    const loaded = loadUserStats();
    setStats(loaded);
    setMounted(true);
  }, []);

  const handleUpdateStats = (newPartial: Partial<UserStats>) => {
    const updated = { ...stats, ...newPartial };
    setStats(updated);
    saveUserStats(updated);
  };

  const handleAddXP = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = stats.streak;

    if (stats.lastStudyDate !== today) {
      const lastDate = new Date(stats.lastStudyDate);
      const currentDate = new Date(today);
      const diffDays = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const updated: UserStats = {
      ...stats,
      xp: stats.xp + amount,
      streak: newStreak,
      lastStudyDate: today,
    };

    setStats(updated);
    saveUserStats(updated);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Global Header */}
      <Header
        stats={stats}
        onUpdateStats={handleUpdateStats}
        activeTab={activeTab}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
      />

      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        completedGrammarCount={stats.completedGrammarIds.length}
        totalGrammarCount={grammarData.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'n1_adaptive' && (
          <AdaptiveN1View stats={stats} onAddXP={handleAddXP} />
        )}

        {activeTab === 'hands_free_call' && (
          <HandsFreeCallView
            stats={stats}
            onAddXP={handleAddXP}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
          />
        )}

        {activeTab === 'custom_roleplay' && (
          <CustomRoleplayView
            stats={stats}
            onAddXP={handleAddXP}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
          />
        )}

        {activeTab === 'grammar' && (
          <GrammarView
            grammarList={grammarData}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'shadowing' && (
          <ShadowingView stats={stats} onAddXP={handleAddXP} />
        )}

        {activeTab === 'vocab' && (
          <VocabView
            vocabList={vocabData}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'kana' && (
          <KanaView stats={stats} onAddXP={handleAddXP} />
        )}

        {activeTab === 'quiz' && (
          <QuizChallengeView
            grammarList={grammarData}
            stats={stats}
            onAddXP={handleAddXP}
          />
        )}
      </main>

      {/* AI Settings Modal */}
      {isAISettingsOpen && (
        <AISettingsModal
          stats={stats}
          onUpdateStats={handleUpdateStats}
          onClose={() => setIsAISettingsOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 nihongo-jlpt (日本語) - 대화하며 JLPT 1급(N1) 합격까지</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>JLPT N5 ~ N1 대화 미션</span>
            <span>·</span>
            <span>코토모 실시간 보이스 통화</span>
            <span>·</span>
            <span>3단계 AI 섀도잉</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
