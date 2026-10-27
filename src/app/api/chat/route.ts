import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider,
      apiKey,
      model = 'gemini-2.0-flash',
      currentLevel = 'N5',
      levelProgress = 15,
      history = [],
      userMessage = '',
    } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 입력되지 않았습니다.' }, { status: 400 });
    }

    const systemPrompt = `당신은 사용자를 JLPT N5(기초)부터 N1(1급 합격)까지 단계별로 대화를 통해 성장시키는 'nihongo-jlpt AI 튜터'입니다.
현재 학습자의 급수 레벨은 【${currentLevel}】 단계이며, 다음 급수 승급까지의 진행률은 【${levelProgress}%】입니다.

[도쿄 표준 발음 및 어휘 기준 (東京標準語 / 共通語)]
★ 중요: 모든 일본어 발화, 문장, 어휘, 억양 및 피드백은 반드시 100% NHK 방송 기준 '도쿄 표준 발음(東京標準語 / 共通語 / 首都圏方言)'만을 사용하세요.
- 간사이벤(関西弁, 〜やねん, 〜へん) 등 지방 사투리나 비표준 은어는 일체 배제합니다.
- 발음과 억양은 현대 도쿄 야마노테/수도권 표준 억양(東京式ピッチアクセント)에 맞추어 가장 명료하고 교양 있는 표준 일본어로 작성하세요.

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
  "japanese": "답변 일본어 문장 (한자/가나)",
  "romaji": "로마자 발음 표기",
  "korean": "자연스러운 한국어 번역",
  "correction": {
    "originalText": "사용자가 한 말",
    "improvedJapanese": "더 자연스러운 일본어",
    "reading": "읽는 법",
    "koreanMeaning": "뜻",
    "feedbackPoint": "교정 이유 및 문법 팁"
  } or null,
  "suggestedReplies": [
    { "japanese": "추천 답변 1", "korean": "한국어 뜻 1" },
    { "japanese": "추천 답변 2", "korean": "한국어 뜻 2" }
  ],
  "progressDelta": 25,
  "learnerObservation": "학습자의 문법/어휘 성취에 대한 짧은 한국어 메모 (예: N5 〜です 자기소개 안정적)"
}`;

    // 1. Google Gemini API Call
    if (provider === 'gemini') {
      const geminiModel = model.includes('gemini') ? model : 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

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
          Authorization: `Bearer ${apiKey}`,
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
