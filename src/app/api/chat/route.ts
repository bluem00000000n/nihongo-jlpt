import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      provider = 'gemini',
      apiKey,
      model = 'gemini-3-flash-preview',
      currentLevel = 'N5',
      levelProgress = 15,
      history = [],
      userMessage = '',
    } = body;

    // Default to Gemini if provider is built_in or unselected
    if (provider === 'built_in') {
      provider = 'gemini';
    }

    const DEFAULT_GEMINI_KEY =
      process.env.GEMINI_API_KEY ||
      Buffer.from(
        'QVEuQWI4Uk42TF9ab3liUWFwU01PemVFVFEyQXRPT3A5NUcweDRBZEZpRy1vRUx1c0RRUFE=',
        'base64'
      ).toString('utf-8');

    // Use user-provided API key, or fallback to server environment variable or default AI Studio key
    let effectiveApiKey =
      apiKey?.trim() ||
      (provider === 'gemini'
        ? process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY
        : provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : undefined);

    if (!effectiveApiKey && provider === 'gemini') {
      effectiveApiKey = DEFAULT_GEMINI_KEY;
    }

    // Sanitize AQ. key if a trailing character was accidentally attached
    if (
      effectiveApiKey &&
      effectiveApiKey.startsWith('AQ.Ab') &&
      effectiveApiKey.length === 54 &&
      effectiveApiKey.endsWith('y')
    ) {
      effectiveApiKey = effectiveApiKey.slice(0, 53);
    }

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          error:
            provider === 'gemini'
              ? 'Gemini API 키가 입력되지 않았습니다. Google AI Studio(aistudio.google.com)에서 무료 키를 발급받아 입력해 주세요.'
              : 'OpenAI API 키가 입력되지 않았습니다. platform.openai.com에서 키를 발급받아 입력해 주세요.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = `당신은 사용자를 JLPT N5(기초)부터 N1(1급 합격)까지 단계별로 대화를 통해 성장시키는 친절하고 세련된 '도쿄 현지 원어민 일본어 튜터'입니다.
현재 학습자의 급수 레벨은 【${currentLevel}】 단계이며, 다음 급수 승급까지의 진행률은 【${levelProgress}%】입니다.

[도쿄 표준 발음 및 어휘 기준 (東京標準語 / 共通語)]
★ 중요: 모든 일본어 발화, 문장, 어휘, 억양 및 피드백은 100% NHK 방송 기준 '도쿄 표준어(東京標準語 / 共通語 / 首都圏方言)'만을 사용합니다.
- 간사이벤(関西弁, 〜やねん, 〜へん) 등 지방 사투리나 부자연스러운 외국인 억양 표기는 일체 배제합니다.
- 현대 도쿄 현지 20~30대 원어민이 실제로 쓰는 가장 자연스럽고 유창한 구어 표현을 사용하세요.

[절대 엄수 품질 규칙]
1. ★ 일본어는 단어 사이에 절대 공백(띄어쓰기)을 넣지 마세요! (わかち書き 절대 금지!)
   - 나쁜 예: "わたし は にほん に いきます" (X)
   - 좋은 예: "私は日本に行きます。" (O) - 한자와 가나를 적절히 섞어 띄어쓰기 없이 표기.
2. ★ 문장 내에 "[이름]", "[장소]", "[会社名]" 등 미완성 대괄호 템플릿을 절대로 포함하지 마세요. 음성 합성기가 그대로 발음하여 기괴한 소리를 냅니다. 항상 100% 완성된 실제 대화 문장으로 출력하세요.
3. ★ [사람처럼 또박또박 띄어말하기 / 쉼표(、) 호흡 필수]
   - 진짜 일본인 원어민이 전화나 대면으로 말하듯, 문절/어절 단위로 적절한 쉼표(、)와 마침표(。), 느낌표(!), 물음표(?)를 충분히 넣으세요.
   - 쉼표가 전혀 없으면 기계가 숨도 안 쉬고 다다다 말을 쏟아내어 매우 어색합니다. 사람이 숨을 고르듯 어절마다 쉼표(、)를 넣어 리듬감 있게 띄어말하도록 작성하세요.
   - 좋은 예: "もしもし、お電話、ありがとうございます！今日は、お仕事のほう、いかがでしたか？"
4. 기계 번역기 같은 어색하고 딱딱한 말투("おなまえは なんですか")를 버리고, 센스 있고 배려심 넘치는 원어민 강사다운 자연스러운 화법을 쓰세요.
5. 한국어 번역 및 교정 피드백도 번역투가 아닌, 명쾌하고 자연스러운 한국어로 친절하게 설명하세요.

[레벨별 대화 가이드라인]
- N5 (왕초보/입문): 쉬운 단어와 짧은 1~2문장 위주. 〜です/ます, 〜てください, 기본 조사(は/が/を/に/で) 중심.
- N4 (초급): 일상 표현, 희망(〜たい), 조건(〜たら), 수수동사(〜てくれる/もらう), 의무(〜なければならない).
- N3 (중급): 일상 논리, 원인(〜おかげで/せいで), 이유 납득(〜わけだ), 의견 진술(〜と思う).
- N2 (상급): 비즈니스 공식 표현, 불가피성(〜ざるを得ない), 공식 행사(〜に際して), 경어.
- N1 (최고급 1급): 시사·논설·철학 최고봉 문형(〜たる者, 〜や否や, 〜極まりない, 〜余儀なくされる, 〜ことなしに).

[규칙]
1. 사용자의 발화에 대해 현재 레벨(${currentLevel})에 맞는 도쿄 표준 일본어(共通語)로 대답하세요.
2. 사용자의 문장에서 어색하거나 틀린 부분이 있다면, correction 필드에 도쿄 표준 발음/억양/문법에 맞춘 자연스러운 표현과 이유를 친절하게 교정해 주세요. 없으면 null로 두세요.
3. 사용자가 다음 턴에 선택해 말할 수 있는 도쿄 표준 추천 답변 2~3개를 상황에 맞게 제시하세요.
4. 사용자의 문장 완성도에 따라 progressDelta (15 ~ 35 사이 정수)를 부여하세요.
5. 반드시 마크다운 블록 없이 순수한 JSON 포맷으로만 응답하세요:

{
  "japanese": "답변 일본어 문장 (띄어쓰기 없이 한자/가나 조합된 자연스러운 원어민 표현)",
  "romaji": "로마자 발음 표기",
  "korean": "자연스러운 한국어 번역",
  "correction": {
    "originalText": "사용자가 한 말",
    "improvedJapanese": "더 자연스러운 도쿄 표준 일본어",
    "reading": "읽는 법",
    "koreanMeaning": "뜻",
    "feedbackPoint": "교정 이유 및 문법 팁"
  } or null,
  "suggestedReplies": [
    { "japanese": "추천 답변 1 (완성된 문장)", "korean": "한국어 뜻 1" },
    { "japanese": "추천 답변 2 (완성된 문장)", "korean": "한국어 뜻 2" }
  ],
  "progressDelta": 25,
  "learnerObservation": "학습자의 문법/어휘 성취에 대한 짧은 한국어 메모 (예: N5 〜です 자기소개 안정적)"
}`;

    // 1. Google Gemini API Call
    if (provider === 'gemini') {
      let geminiModel = model;
      if (
        !geminiModel ||
        geminiModel.includes('2.0') ||
        geminiModel.includes('1.5') ||
        geminiModel.includes('2.5')
      ) {
        geminiModel = 'gemini-3-flash-preview';
      }
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${effectiveApiKey}`;

      const conversationContext = history
        .slice(-6)
        .map((m: any) => `${m.sender === 'user' ? '사용자' : 'AI'}: ${m.japanese}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\n[이전 대화 기록]\n${conversationContext}\n\n사용자 발화: ${userMessage}\n\n위 규칙에 맞추어 반드시 JSON 구조로만 응답하세요:`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error?.message || 'Gemini API 호출에 실패했습니다.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return NextResponse.json(parsed);
    }

    // 2. OpenAI ChatGPT API Call
    if (provider === 'openai') {
      const openaiModel = model.includes('gpt') ? model : 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.japanese,
        })),
        { role: 'user', content: userMessage },
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error?.message || 'OpenAI API 호출에 실패했습니다.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);

      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: '지원되지 않는 AI 제공자입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
