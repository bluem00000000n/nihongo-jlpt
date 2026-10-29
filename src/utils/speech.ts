// Web Speech API wrapper strictly tuned for Tokyo Standard Japanese (東京標準語 / 共通語)
// Features human-like spoken phrasing (文節・句切れ・息継ぎ) with natural breath pauses

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private japaneseVoice: SpeechSynthesisVoice | null = null;
  private femaleVoice: SpeechSynthesisVoice | null = null;
  private maleVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;
  private currentSpeechId = 0;

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
   * Prioritize authentic Tokyo Standard Japanese (東京標準語・NHK共通語) voices
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
   * Transforms raw Japanese text into naturally phrased speech with human breathing pauses (息継ぎ・句切れ).
   * Inserts commas (、) at major phrase/bunsetsu boundaries so TTS pauses word-by-word like a real person.
   */
  public prepareNaturalJapanesePhrasing(text: string): string {
    // 1. Strip Korean templates [이름], [장소], markdown, furigana syntax
    let clean = text
      .replace(/\[[^\]]*[\uac00-\ud7a3]+[^\]]*\]/g, '') // Remove bracketed Korean
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')        // Strip furigana markdown [漢字](かんじ) -> 漢字
      .replace(/\([^)]*[\uac00-\ud7a3]+[^)]*\)/g, '')    // Strip Korean in parentheses
      .replace(/[*_#`~★【】\[\]]/g, '')                // Strip markdown & brackets
      .replace(/[〜～]/g, '、')                         // Wave dash -> pause
      .trim();

    if (!clean) return '';

    // 2. Greetings and conversational openers: ensure followed by comma
    const openers = [
      'もしもし', 'こんにちは', 'こんばんは', 'おはようございます', 'はじめまして',
      'ありがとうございます', 'ありがとうございました', 'お疲れ様でした', 'お疲れ様です', 'おつかれさまです',
      'なるほど', 'そうですね', 'そうですか', 'たしかに', '実は', 'ところで', 'ちなみに',
      'それでは', 'じゃあ', 'はい', 'いいえ', 'ええと', 'あのう', 'どうぞ'
    ];
    for (const op of openers) {
      const regex = new RegExp(`(${op})(?=[^、。！？!?…\\s])`, 'g');
      clean = clean.replace(regex, '$1、');
    }

    // 3. Common topic subjects followed by content: insert comma to give breathing pause
    // e.g. 私は、 今日は、 最近は、 普段は、 週末は、 日本語は、 お仕事は、
    const topics = [
      '私は', '僕も', '僕の', '俺も', '今日は', '今週は', '最近は', '普段は', '週末は',
      '日本語は', 'お仕事は', '仕事は', '旅行は', '天気は', '趣味は'
    ];
    for (const top of topics) {
      const regex = new RegExp(`(${top})(?=[^、。！？!?…\\s]{2,})`, 'g');
      clean = clean.replace(regex, '$1、');
    }

    // 4. Conjunctions & clause transitions:
    clean = clean.replace(/(ですが|なので|ですから|けれども|けれど)(?=[^、。！？!?…\s])/g, '$1、');

    // 5. Clean up duplicate punctuation
    clean = clean
      .replace(/、+/g, '、')
      .replace(/、([。！？!?])/g, '$1')
      .replace(/([。！？!?])、/g, '$1')
      .trim();

    return clean;
  }

  /**
   * Splits phrased text into spoken chunks (clauses/sentences) for natural human-like cadence.
   */
  private splitIntoSpokenChunks(text: string): { chunk: string; pauseMs: number }[] {
    const tokens = text.match(/[^。！？!?\n]+[。！？!?\n]*|[。！？!?\n]+/g) || [text];
    const results: { chunk: string; pauseMs: number }[] = [];

    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;

      // If token is long (more than 24 chars) and contains commas, split into sub-clauses for word-by-word breathing
      if (token.length > 24 && token.includes('、')) {
        const subClauses = token.split('、');
        subClauses.forEach((sc, idx) => {
          const trimmed = sc.trim();
          if (!trimmed) return;
          const isLast = idx === subClauses.length - 1;
          results.push({
            chunk: isLast ? trimmed : trimmed + '、',
            pauseMs: isLast ? 180 : 120, // 120ms clause pause, 180ms sentence pause
          });
        });
      } else {
        const isExclamationOrQuestion = /[！？!?]/.test(token);
        const pauseMs = isExclamationOrQuestion ? 230 : 180;
        results.push({ chunk: token, pauseMs });
      }
    }

    return results;
  }

  /**
   * Speaks Japanese text in authentic Tokyo standard pronunciation and human-like breathing phrasing
   * Supports character gender voice selection and sequential breath pauses
   */
  public async speak(
    text: string,
    rate: number = 0.86, // Natural human conversational rate (deliberate & clear, not rushed)
    pitch: number = 1.0,
    gender?: 'female' | 'male'
  ): Promise<void> {
    if (typeof window === 'undefined' || !this.synth) {
      return;
    }

    this.stop(); // Stop any ongoing speech & cancel pending chunks
    const speechId = ++this.currentSpeechId;

    const phrasedText = this.prepareNaturalJapanesePhrasing(text);
    if (!phrasedText) return;

    if (!this.japaneseVoice) {
      this.loadVoice();
    }

    const chunks = this.splitIntoSpokenChunks(phrasedText);

    for (const item of chunks) {
      if (this.currentSpeechId !== speechId) break;

      await new Promise<void>((resolve) => {
        if (!this.synth || this.currentSpeechId !== speechId) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(item.chunk);
        utterance.lang = 'ja-JP';
        utterance.rate = rate; // Tokyo standard natural conversational speed (0.86)

        if (gender === 'male') {
          // If male voice (Otoya/Keita) is present, use it. Otherwise use authentic Kyoko with lowered pitch
          utterance.voice = this.maleVoice || this.japaneseVoice;
          utterance.pitch = this.maleVoice ? pitch * 0.95 : pitch * 0.82;
        } else if (gender === 'female') {
          utterance.voice = this.femaleVoice || this.japaneseVoice;
          utterance.pitch = pitch * 1.02;
        } else {
          utterance.voice = this.japaneseVoice;
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

        // Safety fallback for mobile browsers where onend might not fire
        const charCount = item.chunk.length;
        const estimatedDurationMs = Math.max(1200, (charCount / (3.2 * rate)) * 1000 + 1500);
        const timeout = setTimeout(done, estimatedDurationMs);

        const originalOnEnd = utterance.onend;
        utterance.onend = (e) => {
          clearTimeout(timeout);
          if (originalOnEnd) originalOnEnd.call(utterance, e);
        };

        this.synth.speak(utterance);
      });

      // Human breathing gap between chunks
      if (this.currentSpeechId === speechId && item.pauseMs > 0) {
        await new Promise((r) => setTimeout(r, item.pauseMs));
      }
    }
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
    this.currentSpeechId++;
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
