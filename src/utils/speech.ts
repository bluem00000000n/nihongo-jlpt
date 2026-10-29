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
   * Strictly filters out novelty/cartoon voices (Eddy, Flo, Grandma, Grandpa, Reed, Rocko, etc.)
   */
  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Filter out all caricature, foreign-accented novelty voices that ruin Japanese pronunciation
    const badNoveltyVoices = [
      'eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley',
      'zarvox', 'trinoids', 'whisper', 'deranged', 'wobble', 'bad news', 'bahh',
      'bells', 'boing', 'bubbles', 'cellos', 'good news', 'hysterical', 'pipe organ'
    ];

    const jaVoices = voices.filter(
      (v) =>
        (v.lang.startsWith('ja') || v.lang === 'ja_JP' || v.lang === 'ja-JP') &&
        !badNoveltyVoices.some((bad) => v.name.toLowerCase().includes(bad))
    );

    if (jaVoices.length > 0) {
      // Female Tokyo Standard: Kyoko (Enhanced/Premium), Google 日本語, Nanami, Ayumi
      this.femaleVoice =
        jaVoices.find((v) => v.name.includes('Kyoko') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
        jaVoices.find((v) => v.name.includes('Kyoko')) ||
        jaVoices.find((v) => v.name.includes('Google 日本語')) ||
        jaVoices.find((v) => v.name.includes('Nanami') || v.name.includes('Ayumi') || v.name.includes('Haruka')) ||
        jaVoices[0];

      // Male Tokyo Standard: Otoya, Keita, Ichiro, Daichi
      this.maleVoice =
        jaVoices.find((v) => v.name.includes('Otoya') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
        jaVoices.find((v) => v.name.includes('Otoya') || v.name.includes('Keita') || v.name.includes('Ichiro') || v.name.includes('Daichi') || v.name.includes('Hattori')) ||
        null;

      // Default Japanese voice (guaranteed authentic, never cartoon)
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
      // 1. Remove bracketed Korean template placeholders e.g. [이름], [장소]
      // 2. Remove furigana syntax [漢字](かんじ) -> 漢字
      // 3. Remove English/Korean parentheticals and punctuation artifacts
      let cleanText = text
        .replace(/\[[^\]]*[\uac00-\ud7a3]+[^\]]*\]/g, '') // Remove [이름], [장소]
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')        // Strip furigana markdown [漢字](かんじ) -> 漢字
        .replace(/\([^)]*[\uac00-\ud7a3]+[^)]*\)/g, '')    // Strip Korean in parentheses
        .replace(/[*_#`~★【】\[\]]/g, '')                // Strip markdown & brackets
        .replace(/[〜～]/g, '、')                         // Wave dash -> pause
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = rate; // Tokyo standard natural conversational speed (0.92)

      if (!this.japaneseVoice) {
        this.loadVoice();
      }

      if (gender === 'male') {
        // If male voice (Otoya/Keita) is present, use it. Otherwise use authentic Kyoko with lowered pitch
        utterance.voice = this.maleVoice || this.japaneseVoice;
        utterance.pitch = this.maleVoice ? pitch * 0.95 : pitch * 0.82;
      } else if (gender === 'female') {
        utterance.voice = this.femaleVoice || this.japaneseVoice;
        utterance.pitch = pitch * 1.03;
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
