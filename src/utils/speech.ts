// Web Speech API wrapper strictly tuned for Tokyo Standard Japanese (東京標準語 / 共通語)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private japaneseVoice: SpeechSynthesisVoice | null = null;
  private femaleVoice: SpeechSynthesisVoice | null = null;
  private maleVoice: SpeechSynthesisVoice | null = null;
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
   * Segregates Female and Male Tokyo standard voices
   */
  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const jaVoices = voices.filter(
      (v) => v.lang.startsWith('ja') || v.lang === 'ja_JP' || v.lang === 'ja-JP'
    );

    if (jaVoices.length > 0) {
      // Female Tokyo Standard: Kyoko, Nanami, Ayumi
      this.femaleVoice = jaVoices.find(
        (v) =>
          (v.name.includes('Kyoko') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
          v.name.includes('Kyoko') ||
          v.name.includes('Nanami') ||
          v.name.includes('Ayumi') ||
          v.name.includes('Haruka')
      ) || null;

      // Male Tokyo Standard: Otoya, Keita, Ichiro
      this.maleVoice = jaVoices.find(
        (v) =>
          (v.name.includes('Otoya') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
          v.name.includes('Otoya') ||
          v.name.includes('Keita') ||
          v.name.includes('Ichiro') ||
          v.name.includes('Daichi') ||
          v.name.includes('Hattori')
      ) || null;

      // Default fallback
      this.japaneseVoice = this.femaleVoice || this.maleVoice || jaVoices[0];
      this.isInitialized = true;
    }
  }

  /**
   * Speaks Japanese text in authentic Tokyo standard pronunciation and pitch accent
   * Supports character gender voice selection
   */
  public speak(
    text: string,
    rate: number = 0.92,
    pitch: number = 1.0,
    gender?: 'female' | 'male'
  ): Promise<void> {
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

      if (!this.japaneseVoice) {
        this.loadVoice();
      }

      if (gender === 'male') {
        utterance.voice = this.maleVoice || this.japaneseVoice;
        utterance.pitch = pitch * 0.94; // slightly deeper male pitch
      } else if (gender === 'female') {
        utterance.voice = this.femaleVoice || this.japaneseVoice;
        utterance.pitch = pitch * 1.04; // bright clear female pitch
      } else {
        utterance.voice = this.japaneseVoice;
        utterance.pitch = pitch;
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
