export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface FuriganaWord {
  kanji: string;
  furigana?: string;
}

export interface ExampleSentence {
  id?: string;
  japanese: string; // Plain Japanese or segmented
  ruby?: { kanji: string; furigana: string }[]; // For ruby rendering
  romaji: string;
  korean: string;
  nuance?: string;
  audioText?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'fill_blank' | 'word_order' | 'translation_choice';
  prompt: string; // The question or English/Korean prompt
  options?: string[]; // Multiple choice options
  words?: string[]; // For word order / scramble
  correctAnswer: string | string[]; // Target string or ordered words
  explanation: string;
  audioText?: string;
}

export interface GrammarItem {
  id: string;
  level: JLPTLevel;
  title: string; // e.g. "~ている", "~わけにはいかない"
  meaning: string; // e.g. "~하고 있다 / ~상태이다"
  connection: string; // e.g. "동사 て형 + いる"
  category: string; // e.g. "시제/상태", "조건", "의무/금지", "추측"
  explanation: string; // Detailed Korean explanation
  importantTip?: string; // Nuance tips or common mistakes
  examples: ExampleSentence[];
  quizzes: QuizQuestion[];
}

export interface DialogueLine {
  id: string;
  speaker: string; // e.g. "점원", "나(여행객)", "호스트"
  isUser?: boolean;
  avatar: string; // Emoji or avatar icon
  japanese: string;
  romaji: string;
  korean: string;
  roleplayOptions?: {
    text: string;
    korean: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface DialogueScenario {
  id: string;
  title: string;
  level: '초급' | '중급' | '실전';
  situation: string;
  category: '식당/이자카야' | '공항/교통' | '호텔' | '쇼핑/편의점' | '비즈니스' | '친구/일상';
  cultureTip?: string;
  lines: DialogueLine[];
}

export interface VocabItem {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  korean: string;
  level: JLPTLevel;
  partOfSpeech: string;
  exampleJp: string;
  exampleKr: string;
  category: string;
}

export interface KanaCharacter {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  group: 'basic' | 'dakuon' | 'handakuon' | 'yoon';
  row: string; // a, ka, sa, ta, na...
  koreanPronunciation: string;
  exampleWord?: {
    word: string;
    meaning: string;
  };
}

export type NavTab = 'n1_adaptive' | 'hands_free_call' | 'custom_roleplay' | 'grammar' | 'shadowing' | 'vocab' | 'kana' | 'quiz' | 'dialogue';

export interface AdaptiveLearnerState {
  currentLevel: JLPTLevel;
  levelProgress: number; // 0 to 100%
  masteredGrammar: string[];
  weakGrammar: string[];
  vocabCount: number;
  totalTurns: number;
  lastEvaluatedDate?: string;
  notes: string[];
  hasCompletedPlacementTest?: boolean;
}

export interface AISettings {
  provider: 'built_in' | 'gemini' | 'openai';
  apiKey: string;
  model: string;
  isConnected: boolean;
  voiceTone?: 'natural_female' | 'natural_male' | 'friendly' | 'professional';
  speechRate?: number; // 0.7 to 1.1
}

export interface DialogueCorrectionItem {
  id: string;
  originalText: string;
  improvedJapanese: string;
  reading: string;
  koreanMeaning: string;
  feedbackPoint: string;
  timestamp: string;
}

export interface ComprehensiveReport {
  id: string;
  date: string;
  durationSeconds: number;
  totalTurns: number;
  level: JLPTLevel;
  grammarAccuracyScore: number; // 0 to 100
  corrections: DialogueCorrectionItem[];
  usedVocab: string[];
  aiSummary: string;
  nextRecommendedStep: string;
}

export interface CustomRoleplayScenario {
  id: string;
  title: string;
  category: '비즈니스 회의' | '여행/호텔' | '심층 토론' | '일상/쇼핑';
  level: JLPTLevel;
  userRole: string;
  aiRole: string;
  situation: string;
  missionGoal: string;
  openingJapanese: string;
  openingKorean: string;
}


export interface AdaptiveMessage {
  id: string;
  sender: 'ai' | 'user';
  japanese: string;
  romaji?: string;
  korean: string;
  level: JLPTLevel;
  audioText?: string;
  targetGrammar?: string;
  correction?: {
    originalText: string;
    improvedJapanese: string;
    reading: string;
    koreanMeaning: string;
    feedbackPoint: string;
  };
  suggestedReplies?: {
    japanese: string;
    korean: string;
  }[];
  levelProgressDelta?: number;
  didLevelUp?: boolean;
  newLevel?: JLPTLevel;
  timestamp: string;
}

export interface ShadowingSentence {
  id: string;
  source: string; // e.g., "도쿄 브이로그", "일본 드라마", "일상 생활"
  japanese: string;
  ruby?: { kanji: string; furigana: string }[];
  romaji: string;
  korean: string;
  nuanceTip: string;
  month: 1 | 2 | 3;
}

export interface RoadmapGoal {
  id: string;
  month: 1 | 2 | 3;
  week: number;
  title: string;
  description: string;
  completed: boolean;
  targetCount: number;
  currentCount: number;
}

export interface AISettings {
  provider: 'built_in' | 'gemini' | 'openai';
  apiKey: string;
  model: string;
  isConnected: boolean;
}

export interface UserStats {
  xp: number;
  streak: number;
  lastStudyDate: string;
  completedGrammarIds: string[];
  bookmarkedGrammarIds: string[];
  completedDialogueIds: string[];
  savedVocabIds: string[];
  furiganaEnabled: boolean;
  romajiEnabled: boolean;
  soundEnabled: boolean;
  aiSettings?: AISettings;
}
