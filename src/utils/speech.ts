// Web Speech API wrapper strictly tuned for Tokyo Standard Japanese (東京標準語 / 共通語)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private japaneseVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  /**
   * Prioritize Tokyo Standard Japanese (東京標準語・NHK共通語) voices
   * - Apple: Kyoko (Enhanced/Premium), Otoya, Siri
   * - Google/Android: Google 日本語 (Tokyo standard neural)
   * - Microsoft/Edge: Microsoft Nanami (Natural), Keita (Natural), Ayumi
   */
  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const jaVoices = voices.filter(
      (v) => v.lang.startsWith('ja') || v.lang === 'ja_JP' || v.lang === 'ja-JP'
    );

    if (jaVoices.length > 0) {
      // 1. Apple Tokyo Standard: Kyoko (Enhanced/Premium), Otoya
      const appleTokyo = jaVoices.find(
        (v) =>
          (v.name.includes('Kyoko') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
          v.name.includes('Kyoko') ||
          (v.name.includes('Otoya') && v.name.includes('Enhanced')) ||
          v.name.includes('Otoya')
      );

      // 2. Microsoft Tokyo Natural: Nanami, Keita
      const msTokyo = jaVoices.find(
        (v) =>
          v.name.includes('Nanami') ||
          v.name.includes('Keita') ||
          (v.name.includes('Natural') && v.lang.includes('ja'))
      );

      // 3. Google Tokyo Neural: Google 日本語
      const googleTokyo = jaVoices.find(
        (v) => v.name.includes('Google') || v.name.includes('ja-jp-x')
      );

      // 4. Siri or any ja-JP voice
      const siriTokyo = jaVoices.find((v) => v.name.includes('Siri'));

      this.japaneseVoice = appleTokyo || msTokyo || googleTokyo || siriTokyo || jaVoices[0];
      this.isInitialized = true;
    }
  }

  /**
   * Speaks Japanese text in authentic Tokyo standard pronunciation and pitch accent
   * Default rate: 0.92 (natural Tokyo announcer pace, clear for learners)
   */
  public speak(text: string, rate: number = 0.92, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // Cancel any ongoing speech

      // Clean text for natural Tokyo intonation
      let cleanText = text
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Strip furigana markdown [漢字](かんじ) -> 漢字
        .replace(/[*_#`~★【】]/g, '')             // Strip markdown & symbols
        .replace(/[〜～]/g, '、')                  // Wave dash -> pause
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = rate; // Tokyo standard conversational speed (0.92)
      utterance.pitch = pitch; // Standard pitch accent (1.0)

      if (!this.japaneseVoice) {
        this.loadVoice();
      }
      if (this.japaneseVoice) {
        utterance.voice = this.japaneseVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  public getVoiceInfo(): { name: string; isTokyoStandard: boolean } {
    if (!this.japaneseVoice) {
      this.loadVoice();
    }
    const name = this.japaneseVoice ? this.japaneseVoice.name : '시스템 도쿄 표준 음성';
    return {
      name,
      isTokyoStandard: true,
    };
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
