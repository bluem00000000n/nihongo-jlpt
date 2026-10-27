// Web Speech API wrapper for natural Japanese text-to-speech

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

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural Japanese voices (e.g., Kyoko, Otoya, Google 日本語)
    const jaVoices = voices.filter(
      (v) => v.lang.startsWith('ja') || v.lang === 'ja_JP' || v.lang === 'ja-JP'
    );
    if (jaVoices.length > 0) {
      // Pick best voice if available
      this.japaneseVoice =
        jaVoices.find((v) => v.name.includes('Google') || v.name.includes('Kyoko') || v.name.includes('Siri') || v.name.includes('Natural')) ||
        jaVoices[0];
      this.isInitialized = true;
    }
  }

  public speak(text: string, rate: number = 0.88, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // Cancel any ongoing speech

      // Clean text from furigana markings if needed
      const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = rate; // slightly slower for language learners
      utterance.pitch = pitch;

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

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
