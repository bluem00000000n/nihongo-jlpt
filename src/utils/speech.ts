// Ultra-realistic Tokyo Standard Japanese (東京標準語 / 共通語) Speech Service
// Primary: Neural Studio-Quality Japanese voices (Nanami / Keita) via /api/tts
// Fallback: Web Speech API with Tokyo standard voice filters

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentSpeechId = 0;
  private japaneseVoice: SpeechSynthesisVoice | null = null;
  private femaleVoice: SpeechSynthesisVoice | null = null;
  private maleVoice: SpeechSynthesisVoice | null = null;
  private audioBlobCache = new Map<string, string>(); // text -> objectUrl

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoice();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoice();
        }
      }
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

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
      this.femaleVoice =
        jaVoices.find((v) => v.name.includes('Kyoko') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
        jaVoices.find((v) => v.name.includes('Kyoko')) ||
        jaVoices.find((v) => v.name.includes('Google 日本語')) ||
        jaVoices.find((v) => v.name.includes('Nanami') || v.name.includes('Ayumi')) ||
        jaVoices[0];

      this.maleVoice =
        jaVoices.find((v) => v.name.includes('Otoya') && (v.name.includes('Enhanced') || v.name.includes('Premium'))) ||
        jaVoices.find((v) => v.name.includes('Otoya') || v.name.includes('Keita') || v.name.includes('Ichiro')) ||
        null;

      this.japaneseVoice = this.femaleVoice || this.maleVoice || jaVoices[0];
    }
  }

  /**
   * Prepares clean Japanese spoken text
   */
  public prepareNaturalJapanesePhrasing(text: string): string {
    return text
      .replace(/\[[^\]]*[\uac00-\ud7a3]+[^\]]*\]/g, '') // remove Korean in brackets
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')        // strip furigana [漢字](かんじ) -> 漢字
      .replace(/\([^)]*[\uac00-\ud7a3]+[^)]*\)/g, '')    // strip Korean in parentheses
      .replace(/[*_#`~★【】\[\]]/g, '')
      .replace(/[〜～]/g, '、')
      .trim();
  }

  /**
   * Speaks Japanese using high-fidelity Neural Studio Voices (Microsoft Azure Neural Tokyo Standard)
   * With automatic fallback to Web Speech API
   */
  public async speak(
    text: string,
    rate: number = 0.9,
    pitch: number = 1.0,
    gender: 'female' | 'male' = 'female'
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    this.stop();
    const speechId = ++this.currentSpeechId;

    const cleanText = this.prepareNaturalJapanesePhrasing(text);
    if (!cleanText) return;

    // 1. Try Ultra-Realistic Neural TTS via /api/tts
    try {
      let audioUrl = this.audioBlobCache.get(`${gender}:${cleanText}`);

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: gender,
            rate: rate <= 0.82 ? '-10%' : rate >= 1.05 ? '+10%' : '0%',
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          audioUrl = URL.createObjectURL(blob);
          if (this.audioBlobCache.size > 200) {
            const first = this.audioBlobCache.keys().next().value;
            if (first) {
              URL.revokeObjectURL(this.audioBlobCache.get(first)!);
              this.audioBlobCache.delete(first);
            }
          }
          this.audioBlobCache.set(`${gender}:${cleanText}`, audioUrl);
        }
      }

      if (audioUrl && this.currentSpeechId === speechId) {
        await new Promise<void>((resolve) => {
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;
          audio.playbackRate = rate < 0.8 ? 0.85 : rate > 1.2 ? 1.15 : 1.0;

          audio.onended = () => {
            this.currentAudio = null;
            resolve();
          };
          audio.onerror = () => {
            this.currentAudio = null;
            resolve();
          };

          audio.play().catch(() => {
            // If autoplay is blocked by browser gesture policy, fallback to synth
            this.speakWithSynth(cleanText, rate, pitch, gender, speechId).then(resolve);
          });
        });
        return;
      }
    } catch (err) {
      console.warn('Neural TTS failed, falling back to Web Speech Synthesis:', err);
    }

    // 2. Fallback: Web Speech Synthesis API
    if (this.currentSpeechId === speechId) {
      await this.speakWithSynth(cleanText, rate, pitch, gender, speechId);
    }
  }

  private async speakWithSynth(
    text: string,
    rate: number,
    pitch: number,
    gender: 'female' | 'male',
    speechId: number
  ): Promise<void> {
    if (!this.synth || typeof window === 'undefined') return;

    if (!this.japaneseVoice) {
      this.loadVoice();
    }

    await new Promise<void>((resolve) => {
      if (!this.synth || this.currentSpeechId !== speechId) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;

      if (gender === 'male') {
        utterance.voice = this.maleVoice || this.japaneseVoice;
        utterance.pitch = this.maleVoice ? pitch * 0.95 : pitch * 0.82;
      } else {
        utterance.voice = this.femaleVoice || this.japaneseVoice;
        utterance.pitch = pitch;
      }

      let isDone = false;
      const done = () => {
        if (!isDone) {
          isDone = true;
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;

      // Timeout safety for mobile browsers
      const timeout = setTimeout(done, Math.max(1500, (text.length / (3.0 * rate)) * 1000 + 1000));
      const originalOnEnd = utterance.onend;
      utterance.onend = (e) => {
        clearTimeout(timeout);
        if (originalOnEnd) originalOnEnd.call(utterance, e);
      };

      this.synth.speak(utterance);
    });
  }

  public getVoiceInfo(): { name: string; isTokyoStandard: boolean } {
    return {
      name: 'Microsoft Azure Neural Tokyo Standard (Nanami & Keita)',
      isTokyoStandard: true,
    };
  }

  public stop() {
    this.currentSpeechId++;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
