import { UserStats } from '@/types';

const STORAGE_KEY = 'nihongo_jlpt_user_stats_v1';
const LEGACY_STORAGE_KEYS = ['nihongo_user_stats_v1', 'bunpo_user_stats_v1'];

export const defaultStats: UserStats = {
  xp: 120,
  streak: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedGrammarIds: ['n5-01', 'n5-02'],
  bookmarkedGrammarIds: [],
  completedDialogueIds: [],
  savedVocabIds: [],
  furiganaEnabled: true,
  romajiEnabled: false,
  soundEnabled: true,
  aiSettings: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview',
    isConnected: true,
  },
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacy of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(legacy);
        if (raw) break;
      }
    }
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    const stats: UserStats = { ...defaultStats, ...parsed };

    // Upgrade existing users to the active default Gemini AI engine
    if (
      !stats.aiSettings ||
      !stats.aiSettings.apiKey ||
      stats.aiSettings.provider === 'built_in' ||
      !stats.aiSettings.isConnected
    ) {
      stats.aiSettings = {
        ...defaultStats.aiSettings,
        provider: 'gemini',
        apiKey: defaultStats.aiSettings?.apiKey || '',
        model: 'gemini-3-flash-preview',
        isConnected: true,
      };
    } else if (
      stats.aiSettings.model?.includes('2.0') ||
      stats.aiSettings.model?.includes('1.5') ||
      stats.aiSettings.model?.includes('2.5')
    ) {
      stats.aiSettings.model = 'gemini-3-flash-preview';
    }

    return stats;
  } catch {
    return defaultStats;
  }
}

export function saveUserStats(stats: UserStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function addXP(amount: number): UserStats {
  const current = loadUserStats();
  const today = new Date().toISOString().split('T')[0];
  let newStreak = current.streak;

  if (current.lastStudyDate !== today) {
    const lastDate = new Date(current.lastStudyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updated: UserStats = {
    ...current,
    xp: current.xp + amount,
    streak: newStreak,
    lastStudyDate: today,
  };

  saveUserStats(updated);
  return updated;
}
