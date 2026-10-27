import { ComprehensiveReport, DialogueCorrectionItem, JLPTLevel } from '@/types';

const REPORT_STORAGE_KEY = 'nihongo_jlpt_comprehensive_reports_v1';
const LEGACY_REPORT_KEY = 'nihongo_comprehensive_reports_v1';

export function loadReports(): ComprehensiveReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY) || localStorage.getItem(LEGACY_REPORT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReport(report: ComprehensiveReport) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadReports();
    const updated = [report, ...existing].slice(0, 30); // keep last 30 reports
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report', e);
  }
}

export function generateSessionReport(
  durationSeconds: number,
  totalTurns: number,
  level: JLPTLevel,
  corrections: DialogueCorrectionItem[],
  usedVocab: string[] = []
): ComprehensiveReport {
  // Score formula
  const baseScore = 95;
  const penalty = Math.min(30, corrections.length * 6);
  const grammarAccuracyScore = Math.max(65, baseScore - penalty);

  let aiSummary = '';
  let nextRecommendedStep = '';

  if (grammarAccuracyScore >= 90) {
    aiSummary = `훌륭한 일본어 구사력입니다! ${level} 레벨의 문형과 어휘를 대단히 자연스럽게 구사하셨습니다.`;
    nextRecommendedStep = `현재 레벨에 대한 이해가 깊으므로, 다음 단계 상위 급수 문형을 적극적으로 도전해 보세요.`;
  } else if (grammarAccuracyScore >= 80) {
    aiSummary = `안정적인 회화가 돋보였습니다. 일상적인 소통이 원활하며, 몇 가지 접속 규칙과 조사 쓰임새만 보완하면 상위 급수 승급이 가능합니다.`;
    nextRecommendedStep = `교정받은 피드백 문장을 소리 내어 3회 섀도잉하며 입에 익히는 것을 추천합니다.`;
  } else {
    aiSummary = `적극적인 발화 시도가 아주 좋습니다! 틀린 문장은 곧 가장 오래 기억될 학습 자산입니다.`;
    nextRecommendedStep = `기본 조사(は/が/に/で)와 어미 결합 형태를 중점적으로 복습해 보세요.`;
  }

  const newReport: ComprehensiveReport = {
    id: `rep-${Date.now()}`,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    durationSeconds,
    totalTurns,
    level,
    grammarAccuracyScore,
    corrections,
    usedVocab,
    aiSummary,
    nextRecommendedStep,
  };

  saveReport(newReport);
  return newReport;
}
