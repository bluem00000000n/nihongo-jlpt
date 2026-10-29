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
import { DialogueView } from '@/components/DialogueView';
import { AISettingsModal } from '@/components/AISettingsModal';
import { grammarData } from '@/data/grammar';
import { vocabData } from '@/data/vocab';
import { dialogueScenarios } from '@/data/dialogues';
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
        <div className="w-9 h-9 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE7DC] flex justify-center font-sans antialiased text-[#1C1917]">
      {/* Mobile-First Centered Container (Japanese Stationery Notebook Paper with 5mm grid) */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF7F0] border-x border-[#E2D9C8] flex flex-col relative shadow-[0_4px_30px_rgba(40,30,20,0.12)] loft-grid-bg">
        {/* Global Mobile Header */}
        <Header
          stats={stats}
          onUpdateStats={handleUpdateStats}
          activeTab={activeTab}
          onOpenAISettings={() => setIsAISettingsOpen(true)}
        />

        {/* Navigation (Sub-tabs for study mode + fixed mobile bottom bar) */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          completedGrammarCount={stats.completedGrammarIds.length}
          totalGrammarCount={grammarData.length}
        />

        {/* Main Body (Mobile optimized padding with safe bottom area & 5mm grid texture) */}
        <main className="flex-1 w-full px-3.5 pt-3 pb-24">
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

          {activeTab === 'dialogue' && (
            <DialogueView
              scenarios={dialogueScenarios}
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

        {/* Footer info inside mobile frame */}
        <footer className="border-t border-[#E2D9C8] bg-[#FAF7F0]/80 py-4 px-4 text-center text-[11px] text-[#78716C] mb-16">
          <p className="font-bold">© 2026 nihongo-jlpt (日本語) · 1급 합격 AI 회화</p>
        </footer>
      </div>
    </div>
  );
}
