import { AdaptiveLearnerState, AdaptiveMessage, JLPTLevel, AISettings } from '@/types';

const ADAPTIVE_STORAGE_KEY = 'nihongo_jlpt_adaptive_learner_v1';
const LEGACY_ADAPTIVE_KEY = 'nihongo_adaptive_learner_v1';

export const initialAdaptiveState: AdaptiveLearnerState = {
  currentLevel: 'N5',
  levelProgress: 15, // starts at 15% N5
  masteredGrammar: [],
  weakGrammar: [],
  vocabCount: 12,
  totalTurns: 0,
  lastEvaluatedDate: new Date().toISOString().split('T')[0],
  notes: ['학습 시작: N5 왕초보 단계. 기본 인사 및 쉬운 명사/조사 훈련 중입니다.'],
};

export function loadAdaptiveState(): AdaptiveLearnerState {
  if (typeof window === 'undefined') return initialAdaptiveState;
  try {
    const raw = localStorage.getItem(ADAPTIVE_STORAGE_KEY) || localStorage.getItem(LEGACY_ADAPTIVE_KEY);
    if (!raw) return initialAdaptiveState;
    return { ...initialAdaptiveState, ...JSON.parse(raw) };
  } catch {
    return initialAdaptiveState;
  }
}

export function saveAdaptiveState(state: AdaptiveLearnerState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save adaptive state:', e);
  }
}

const nextLevelMap: Record<JLPTLevel, JLPTLevel | null> = {
  N5: 'N4',
  N4: 'N3',
  N3: 'N2',
  N2: 'N1',
  N1: null,
};

// Common Korean-Japanese error check helper
function detectCommonMistake(text: string): AdaptiveMessage['correction'] | undefined {
  // 1. 을/를 좋아하다 -> 〜を好き (X) ➔ 〜が好き (O)
  if (text.includes('を好き') || text.includes('をすき') || text.includes('を大好')) {
    return {
      originalText: text,
      improvedJapanese: text.replace(/を(好き|すき|大好)/g, 'が$1'),
      reading: '...ga suki...',
      koreanMeaning: '...을/를 좋아합니다',
      feedbackPoint: '일본어의 好きだ(좋아하다)는 형용동사(나형용사)이므로 조사를 を가 아닌 が를 씁니다.',
    };
  }
  // 2. 친구를 만나다 -> 友達を会う (X) ➔ 友達に会う (O)
  if (text.includes('を会') || text.includes('をあう')) {
    return {
      originalText: text,
      improvedJapanese: text.replace(/を(会|あ)/g, 'に$1'),
      reading: '...ni au...',
      koreanMeaning: '...을/를 만나다',
      feedbackPoint: '만나다(会う) 앞에는 만나는 대상을 나타내는 조사 に를 씁니다.',
    };
  }
  // 3. 한국어 입력 시 일본어로 교정 제안
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
    if (text.includes('안녕')) {
      return {
        originalText: text,
        improvedJapanese: 'こんにちは！',
        reading: 'Konnichiwa!',
        koreanMeaning: '안녕하세요!',
        feedbackPoint: '낮에 하는 일본어 기본 인사는 こんにちは(콘니치와)입니다.',
      };
    }
    if (text.includes('감사') || text.includes('고마')) {
      return {
        originalText: text,
        improvedJapanese: 'ありがとうございます！',
        reading: 'Arigatou gozaimasu!',
        koreanMeaning: '감사합니다!',
        feedbackPoint: '감사 인사는 ありがとうございます(아리가토-고자이마스)라고 표현합니다.',
      };
    }
    if (text.includes('배고파') || text.includes('밥')) {
      return {
        originalText: text,
        improvedJapanese: 'お腹が空きました。(ご飯を食べたいです)',
        reading: 'Onaka ga sukimashita.',
        koreanMeaning: '배가 고픕니다.',
        feedbackPoint: '"배고프다"는 일본어로 お腹が空く(오나카가 스쿠)라고 합니다.',
      };
    }
  }
  return undefined;
}

// Adaptive generation based on current level and memory, supporting Gemini / ChatGPT
export async function processAdaptiveTurn(
  userUtterance: string,
  currentState: AdaptiveLearnerState,
  history: AdaptiveMessage[],
  aiSettings?: AISettings
): Promise<{ message: AdaptiveMessage; updatedState: AdaptiveLearnerState }> {
  const text = userUtterance.trim();
  const lower = text.toLowerCase();
  const level = currentState.currentLevel;

  let progressDelta = 25;
  let didLevelUp = false;
  let newLevel = level;
  let targetGrammar = '';
  let responseJp = '';
  let responseRomaji = '';
  let responseKr = '';
  let correction: AdaptiveMessage['correction'] = detectCommonMistake(text);
  let suggestedReplies: AdaptiveMessage['suggestedReplies'] = [];
  const newNotes = [...currentState.notes];

  // Try real ChatGPT or Gemini if user configured it or default Gemini is active
  if (aiSettings && aiSettings.provider !== 'built_in' && (aiSettings.apiKey || aiSettings.provider === 'gemini')) {
    try {
      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
          model: aiSettings.model,
          currentLevel: currentState.currentLevel,
          levelProgress: currentState.levelProgress,
          history: history.slice(-6).map((h) => ({ sender: h.sender, japanese: h.japanese })),
          userMessage: text,
        }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        responseJp = data.japanese || '';
        responseRomaji = data.romaji || '';
        responseKr = data.korean || '';
        correction = data.correction || correction;
        suggestedReplies = data.suggestedReplies || [];
        progressDelta = data.progressDelta || 25;

        if (data.learnerObservation) {
          newNotes.push(data.learnerObservation);
        }

        // Calculate Level Up
        let nextProgress = currentState.levelProgress + progressDelta;
        if (nextProgress >= 100) {
          const nextLvl = nextLevelMap[level];
          if (nextLvl) {
            didLevelUp = true;
            newLevel = nextLvl;
            nextProgress = 15;
            newNotes.push(`🎉 레벨 자동 승급! [${level}] 수료 ➔ [${nextLvl}] 단계로 자동 진급했습니다.`);
          } else {
            nextProgress = 100;
            newNotes.push('👑 JLPT N1 최고 레벨 도달! 1급 합격 실력 인증 완료.');
          }
        }

        const updatedState: AdaptiveLearnerState = {
          ...currentState,
          currentLevel: newLevel,
          levelProgress: nextProgress,
          totalTurns: currentState.totalTurns + 1,
          vocabCount: currentState.vocabCount + 3,
          notes: newNotes,
          lastEvaluatedDate: new Date().toISOString().split('T')[0],
        };

        saveAdaptiveState(updatedState);

        const message: AdaptiveMessage = {
          id: `adp-${Date.now()}`,
          sender: 'ai',
          japanese: responseJp,
          romaji: responseRomaji,
          korean: responseKr,
          level: newLevel,
          audioText: responseJp,
          correction,
          suggestedReplies,
          levelProgressDelta: progressDelta,
          didLevelUp,
          newLevel: didLevelUp ? newLevel : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        return { message, updatedState };
      }
    } catch (e) {
      console.warn('API error, falling back to built-in simulated engine:', e);
    }
  }

  // Fallback to built-in offline smart simulator
  await new Promise((r) => setTimeout(r, 650));

  // ==========================================
  // Level N5 (Beginner: 〜です/ます, 인사, 음식, 소개)
  // ==========================================
  if (level === 'N5') {
    targetGrammar = '〜です / 〜ます';

    if (lower.includes('안녕') || text.includes('こんにちは') || text.includes('はじめまして')) {
      responseJp = 'こんにちは！はじめまして。お名前は何ですか？';
      responseRomaji = 'Konnichiwa! Hajimemashite. O-namae wa nan desu ka?';
      responseKr = '안녕하세요! 처음 뵙겠습니다. 성함이 어떻게 되시나요?';
      suggestedReplies = [
        { japanese: '私はミンホです。よろしくお願いします！', korean: '저는 민호입니다. 잘 부탁드립니다!' },
        { japanese: 'パクです。日本語を勉強しています。', korean: '박입니다. 일본어를 공부하고 있습니다.' },
        { japanese: 'キムです。初級から教えてください！', korean: '김입니다. 초급부터 가르쳐 주세요!' },
      ];
    } else if (text.includes('ラーメン') || text.includes('寿司') || text.includes('肉') || text.includes('食べ') || lower.includes('라면') || lower.includes('초밥')) {
      progressDelta = 30;
      responseJp = '美味しそうですね！私も大好きです。週末によく料理をしますか？';
      responseRomaji = 'Oishisou desu ne! Watashi mo daisuki desu. Shuumatsu ni yoku ryouri o shimasu ka?';
      responseKr = '맛있겠네요! 저도 정말 좋아해요. 주말에 요리를 자주 하시나요?';
      newNotes.push('N5 음식 및 기호 표현(〜が好きです) 마스터');
      suggestedReplies = [
        { japanese: 'はい、時々家で作ります。', korean: '네, 가끔 집에서 만듭니다.' },
        { japanese: 'いいえ、外食が多いです。', korean: '아니요, 외식이 많아요.' },
      ];
    } else if (text.includes('です') || text.includes('ます') || text.includes('名前') || lower.includes('입니다')) {
      progressDelta = 25;
      responseJp = '上手ですね！名前を教えてくれてありがとうございます。好きな日本の食べ物は何ですか？';
      responseRomaji = 'Jouzu desu ne! Namae o oshiete kurete arigatou gozaimasu. Suki na nihon no tabemono wa nan desu ka?';
      responseKr = '잘하시네요! 이름을 알려주셔서 감사합니다. 좋아하는 일본 음식은 무엇인가요?';
      newNotes.push('N5 기본 자기소개(〜です) 마스터 완료');
      suggestedReplies = [
        { japanese: 'ラーメンが大好きです！', korean: '라면을 정말 좋아해요!' },
        { japanese: '寿司をよく食べます。', korean: '초밥을 자주 먹습니다.' },
        { japanese: 'すき焼きが食べたいです。', korean: '스키야키를 먹고 싶습니다.' },
      ];
    } else {
      responseJp = 'なるほど！よく分かりました。「〜です」を使って、好きなものを教えてください。';
      responseRomaji = 'Naruhodo! Yoku wakarimashita. "~desu" o tsukatte, suki na mono o oshiete kudasai.';
      responseKr = '그렇군요! 잘 이해했어요. "~입니다(〜です)"를 써서 좋아하는 것을 알려주세요.';
      if (!correction) {
        correction = {
          originalText: text,
          improvedJapanese: `${text}です。`,
          reading: '...desu.',
          koreanMeaning: '...입니다.',
          feedbackPoint: 'N5 기초에서는 문장 끝을 「〜です(입니다)」나 「〜ます(합니다)」로 마무리하는 연습이 중요해요!',
        };
      }
      suggestedReplies = [
        { japanese: '日本のアニメが好きです。', korean: '일본 애니메이션을 좋아해요.' },
        { japanese: '旅行に行きたいです。', korean: '여행을 가고 싶어요.' },
      ];
    }
  }

  // ==========================================
  // Level N4 (Elementary: 〜たら, 〜たい, 〜てくれる, 〜なければならない)
  // ==========================================
  else if (level === 'N4') {
    targetGrammar = '〜たら (조건) / 〜たい (희망)';

    if (text.includes('たら') || text.includes('たい') || text.includes('行きたい') || text.includes('旅行')) {
      progressDelta = 30;
      responseJp = '素晴らしい表現です！条件の「〜たら」と希望の「〜たい」がとても上手に使えていますね。日本に行ったら、どこへ行きたいですか？';
      responseRomaji = 'Subarashii hyougen desu! Jouken no "~tara" to kibou no "~tai" ga totemo jouzu ni tsukaete imasu ne. Nihon ni ittara, doko e ikitai desu ka?';
      responseKr = '훌륭한 표현이에요! 조건의 "~하면(〜たら)"과 희망의 "~하고 싶다(〜たい)"를 아주 잘 쓰셨네요. 일본에 가면 어디에 가고 싶으신가요?';
      newNotes.push('N4 조건형(〜たら) 및 희망형(〜たい) 자연스럽게 구사');
      suggestedReplies = [
        { japanese: '東京に着いたら、まず浅草に行きたいです。', korean: '도쿄에 도착하면 먼저 아사쿠사에 가고 싶어요.' },
        { japanese: '時間ができたら、京都の温泉に入りたいです。', korean: '시간이 생기면 교토 온천에 들어가고 싶어요.' },
        { japanese: '友達に美味しいお土産を買ってあげたいです。', korean: '친구에게 맛있는 선물을 사주고 싶어요.' },
      ];
    } else {
      responseJp = 'いいですね！もし機会があれば、日本でどんな体験をしてみたいですか？「〜たい」を使って答えてみてください。';
      responseRomaji = 'Ii desu ne! Moshi kikai ga areba, nihon de donna taiken o shite mitai desu ka? "~tai" o tsukatte kotaete mite kudasai.';
      responseKr = '좋네요! 혹시 기회가 된다면 일본에서 어떤 체험을 해보고 싶으신가요? "~하고 싶다(〜たい)"를 써서 답해보세요.';
      suggestedReplies = [
        { japanese: '富士山に登ってみたいです。', korean: '후지산에 등반해보고 싶어요.' },
        { japanese: '本場のラーメンを食べてみたいです。', korean: '본고장 라멘을 먹어보고 싶어요.' },
      ];
    }
  }

  // ==========================================
  // Level N3 (Intermediate: 〜わけだ, 〜おかげで/せいで, 논리적 연결)
  // ==========================================
  else if (level === 'N3') {
    targetGrammar = '〜わけだ / 〜おかげで (원인과 납득)';

    if (text.includes('わけ') || text.includes('おかげ') || text.includes('せい') || text.includes('対して')) {
      progressDelta = 35;
      responseJp = '論理的な構成がとても見事です！「〜おかげで」や「〜わけですね」といったN3必須表現が自然に出てきています。最近、何か感謝している出来事はありますか？';
      responseRomaji = 'Ronriteki na kousei ga totemo migoto desu! N3 hissu hyougen ga shizen ni dete kite imasu ne. Saikin, nani ka kansha shite iru dekigoto wa arimasu ka?';
      responseKr = '논리적인 구성이 참 훌륭해요! N3 필수 표현을 자연스럽게 구사하셨네요. 최근 무언가 감사한 일이 있으신가요?';
      newNotes.push('N3 논리적 인과관계(おかげで/わけだ) 안정적 활용');
      suggestedReplies = [
        { japanese: '毎日勉強を続けているおかげで、日本語が少しずつ聞き取れるようになりました。', korean: '매일 공부를 계속한 덕분에, 일본어가 조금씩 들리기 시작했어요.' },
        { japanese: '努力したからこそ、自信がついてきたわけですね。', korean: '노력했기 때문에 자신감이 붙게 된 셈이네요.' },
      ];
    } else {
      responseJp = 'なるほど。理由や原因を述べる時は、「〜のおかげで（良い結果）」や「〜のせいで（悪い結果）」を使うと、ぐっと中級らしい表現になりますよ！';
      responseRomaji = 'Naruhodo. Riyuu ya gen-in o noberu toki wa, "~no okage de" ya "~no sei de" o tsukau to, gutto chuukyuu-rashii hyougen ni narimasu yo!';
      responseKr = '그렇군요. 이유나 원인을 서술할 때는 "~덕분에(〜のおかげで)"나 "~탓에(〜のせいで)"를 쓰면 훨씬 중급다운 표현이 됩니다!';
      suggestedReplies = [
        { japanese: '先生のおかげで、楽しく勉強できています。', korean: '선생님 덕분에 즐겁게 공부하고 있어요.' },
        { japanese: '雨のせいで、予定が変わってしまいました。', korean: '비 탓에 일정이 바뀌어 버렸어요.' },
      ];
    }
  }

  // ==========================================
  // Level N2 (Upper Intermediate: 〜ざるを得ない, 〜に際して)
  // ==========================================
  else if (level === 'N2') {
    targetGrammar = '〜ざるを得ない / 〜に際して (불가피성과 공식 격식)';

    if (text.includes('ざるを得な') || text.includes('に際して') || text.includes('にすぎない') || text.includes('契機')) {
      progressDelta = 35;
      responseJp = '素晴らしい語彙力です！「〜ざるを得ない」を的確に使いこなせていますね。ビジネスの現場でも高く評価されるレベルです。環境の変化に対して、企業はどう対応すべきだと思いますか？';
      responseRomaji = 'Subarashii goiryoku desu! "~zaru o enai" o tekikaku ni tsukai-konasete imasu ne. Bijinesu no genba demo takaku hyouka sareru reberu desu.';
      responseKr = '훌륭한 어휘력입니다! "~하지 않을 수 없다(〜ざるを得ない)"를 정확하게 구사하셨네요. 비즈니스 현장에서도 높은 평가를 받을 수준입니다. 환경 변화에 대해 기업은 어떻게 대응해야 할까요?';
      newNotes.push('N2 상급 문법(〜ざるを得ない/に際해서) 완전 체득');
      suggestedReplies = [
        { japanese: '時代の変化に伴い、従来の経営方針を見直さざるを得ないと考えます。', korean: '시대의 변화에 수반하여, 기존 경영 방침을 재검토하지 않을 수 없다고 생각합니다.' },
        { japanese: '新しいプロジェクトの開始に際して、綿密な計画を立てるべきです。', korean: '새 프로젝트 시작에 즈음하여 면밀한 계획을 세워야 합니다.' },
      ];
    } else {
      responseJp = 'とても流暢です！さらにN2レベルへ磨きをかけるなら、「〜せざるを得ない（やむを得ず〜する）」という表現を会話に織り交ぜてみましょう。';
      responseRomaji = 'Totemo ryuuchou desu! Sara ni N2 reberu e migaki o kakeru nara, "~sezaru o enai" to iu hyougen o orimazete mimashou.';
      responseKr = '매우 유창합니다! N2 레벨로 더욱 완성도를 높이려면, "~하지 않을 수 없다(〜せざるを得ない)" 표현을 대화에 섞어보세요.';
      suggestedReplies = [
        { japanese: '状況が厳しいため、計画を変更せざるを得ません。', korean: '상황이 엄중하기 때문에, 계획을 변경하지 않을 수 없습니다.' },
      ];
    }
  }

  // ==========================================
  // Level N1 (Advanced 1급: 〜たる者, 〜や否や, 〜極まりない, 〜ことなしに)
  // ==========================================
  else {
    targetGrammar = '〜たる者 / 〜ことなしに (최고급 1급 논설·철학)';

    if (text.includes('たる者') || text.includes('ことなしに') || text.includes('極まりない') || text.includes('余儀なく')) {
      progressDelta = 25;
      responseJp = '見事というほかありません！JLPT N1の最高峰文法を完全に自分の言葉として昇華させています。これほど高度な議論ができる学習者は稀です。合格は間違いありません！';
      responseRomaji = 'Migoto to iu hoka arimasen! JLPT N1 no saikouhou bunpou o kanzen ni jibun no kotoba toshite shouka sasete imasu.';
      responseKr = '훌륭하다는 말 외에는 표현할 길이 없습니다! JLPT N1 최고봉 문법을 온전히 자신의 언어로 승화시키셨네요. 이 정도의 고도 토론이 가능한 학습자는 드뭅니다. 1급 합격은 확실합니다!';
      newNotes.push('JLPT N1 최고급 문법 및 시사 논설 완벽 마스터');
      suggestedReplies = [
        { japanese: '指導者たる者は、困難な状況においても公平な決断を下すべきです。', korean: '지도자의 위치에 있는 자라면, 곤란한 상황에서도 공평한 결단을 내려야 합니다.' },
        { japanese: '徹底した検証ということなしには、真の成功は掴めません。', korean: '철저한 검증이라는 것 없이는, 진정한 성공을 잡을 수 없습니다.' },
      ];
    } else {
      responseJp = '高度な日本語能力をお持ちですね！N1合格を盤石にするため、「〜たる者（〜의 신분이라면）」や「〜ことなしに（〜함이 없이）」を論述に組み込んでみましょう。';
      responseRomaji = 'Koudo na nihongo nouryoku o omochi desu ne! N1 goukaku o banjaku ni suru tame, N1 bunpou o ronjutsu ni kumi-konde mimashou.';
      responseKr = '대단히 높은 일본어 능력을 지니고 계시네요! N1 합격을 확고히 하기 위해, "~의 위치에 있는 자라면(〜たる者)"이나 "~함이 없이(〜ことなしに)"를 논술에 조합해 보세요.';
      suggestedReplies = [
        { japanese: 'プロたる者は、常に最高の成果を追求する義務があります。', korean: '프로의 위치에 있는 자라면, 항상 최고의 성과를 추구할 의무가 있습니다.' },
      ];
    }
  }

  // Calculate New Level Progress
  let nextProgress = currentState.levelProgress + progressDelta;

  if (nextProgress >= 100) {
    const nextLvl = nextLevelMap[level];
    if (nextLvl) {
      didLevelUp = true;
      newLevel = nextLvl;
      nextProgress = 15; // start at 15% of next level
      newNotes.push(`🎉 레벨 자동 승급! [${level}] 수료 ➔ [${nextLvl}] 단계로 자동 진급했습니다.`);
    } else {
      // Already N1!
      nextProgress = 100;
      newNotes.push('👑 JLPT N1 최고 레벨 도달! 1급 합격 실력 인증 완료.');
    }
  }

  const updatedState: AdaptiveLearnerState = {
    ...currentState,
    currentLevel: newLevel,
    levelProgress: nextProgress,
    totalTurns: currentState.totalTurns + 1,
    vocabCount: currentState.vocabCount + 3,
    masteredGrammar: targetGrammar
      ? Array.from(new Set([...currentState.masteredGrammar, targetGrammar]))
      : currentState.masteredGrammar,
    notes: newNotes,
    lastEvaluatedDate: new Date().toISOString().split('T')[0],
  };

  saveAdaptiveState(updatedState);

  const message: AdaptiveMessage = {
    id: `adp-${Date.now()}`,
    sender: 'ai',
    japanese: responseJp,
    romaji: responseRomaji,
    korean: responseKr,
    level: newLevel,
    audioText: responseJp,
    targetGrammar,
    correction,
    suggestedReplies,
    levelProgressDelta: progressDelta,
    didLevelUp,
    newLevel: didLevelUp ? newLevel : undefined,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  return { message, updatedState };
}
