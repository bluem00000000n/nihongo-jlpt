import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      provider = 'gemini',
      apiKey,
      model = 'gemini-3.5-flash-lite',
      mode = 'adaptive', // 'call' | 'roleplay' | 'adaptive'
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

    // Fast & compact system prompts tailored by dialogue mode
    let systemPrompt = '';
    let maxOutputTokens = 260;

    if (mode === 'call') {
      maxOutputTokens = 160;
      systemPrompt = `당신은 도쿄 현지 원어민 일본어 전화 회화 강사입니다.
진짜 일본인과 전화 통화하듯 문절마다 쉼표(、)를 넣어 자연스러운 호흡으로 대답하세요.

[규칙]
1. 100% 도쿄 표준어(東京共通語) 구어체로 1~2문장의 간결한 답변을 하세요.
2. 일본어 단어 띄어쓰기 금지(わかち書き 절대 금지). 한자/가나 조합 사용.
3. [이름] 등 미완성 대괄호 템플릿 절대 금지.
4. 사용자의 문장에 어색함이나 오류가 있다면 correction에 도쿄 표준어로 교정하고, 없으면 null로 하세요.
5. 마크다운 없이 순수 JSON만 응답:
{
  "japanese": "1~2문장 일본어 응답 (띄어쓰기 없이 쉼표 포함)",
  "korean": "자연스러운 한국어 번역",
  "correction": {
    "originalText": "학습자 발화",
    "improvedJapanese": "더 자연스러운 도쿄 표준어",
    "reading": "읽는 법",
    "koreanMeaning": "한국어 뜻",
    "feedbackPoint": "간결한 교정 팁"
  } or null
}`;
    } else if (mode === 'roleplay') {
      maxOutputTokens = 160;
      systemPrompt = `당신은 상황극 상대 역할을 맡은 도쿄 현지 일본인입니다.
상황에 몰입하여 1~2문장의 자연스러운 대화체로 답변하세요.

[규칙]
1. 100% 도쿄 표준어(東京共通語), 단어 띄어쓰기 금지(わかち書き 금지).
2. 문절 쉼표(、)를 넣어 원어민 대화 리듬 유지.
3. 미완성 대괄호 템플릿 금지.
4. 교정 사항이 있으면 correction 제공, 없으면 null.
5. 마크다운 없이 순수 JSON만 응답:
{
  "japanese": "역할에 맞는 1~2문장 일본어 대답",
  "korean": "한국어 번역",
  "correction": {
    "originalText": "학습자 발화",
    "improvedJapanese": "더 자연스러운 도쿄 표준어",
    "reading": "읽는 법",
    "koreanMeaning": "한국어 뜻",
    "feedbackPoint": "간결한 교정 팁"
  } or null
}`;
    } else {
      // adaptive (1급 대화 및 튜터 모드)
      maxOutputTokens = 260;
      systemPrompt = `당신은 JLPT N5부터 N1까지 맞춤 지도하는 도쿄 현지 원어민 일본어 튜터입니다.
현재 학습자 레벨: 【${currentLevel}】

[핵심 규칙]
1. 100% NHK 도쿄 표준어(東京共通語), 단어 사이 띄어쓰기 절대 금지(わかち書き 금지).
2. 문절마다 쉼표(、)를 넣어 실제 사람처럼 또박또박 띄어말하는 호흡 유지.
3. [이름] 등 미완성 템플릿 절대 금지.
4. 현재 레벨(${currentLevel})에 어울리는 1~2문장의 간결하고 명확한 대답.
5. 학습자가 다음 턴에 선택해 말할 수 있는 도쿄 표준 추천 답변 2개 제공.
6. 마크다운 없이 순수 JSON만 응답:
{
  "japanese": "답변 일본어 문장 (띄어쓰기 없는 도쿄 표준어)",
  "romaji": "로마자 발음",
  "korean": "자연스러운 한국어 번역",
  "correction": {
    "originalText": "학습자 말",
    "improvedJapanese": "교정 일본어",
    "reading": "읽는 법",
    "koreanMeaning": "뜻",
    "feedbackPoint": "교정 팁"
  } or null,
  "suggestedReplies": [
    { "japanese": "추천 답변 1", "korean": "뜻 1" },
    { "japanese": "추천 답변 2", "korean": "뜻 2" }
  ],
  "progressDelta": 25
}`;
    }



    // 1. Google Gemini API Call
    if (provider === 'gemini') {
      let geminiModel = model;
      if (
        !geminiModel ||
        geminiModel.includes('2.0') ||
        geminiModel.includes('1.5') ||
        geminiModel.includes('2.5')
      ) {
        geminiModel = 'gemini-3.5-flash-lite';
      }

      // Format multi-turn conversation
      const conversationTurns = history.slice(-4).map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.japanese }],
      }));

      // Add current turn
      conversationTurns.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const callGeminiWithModel = async (targetModel: string) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${effectiveApiKey}`;
        const generationConfig: Record<string, any> = {
          responseMimeType: 'application/json',
          temperature: 0.5,
          maxOutputTokens,
        };

        // Only models with reasoning capability support thinkingConfig
        if (targetModel.includes('gemini-3-') || targetModel.includes('gemini-3.1-')) {
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        return await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: conversationTurns,
            generationConfig,
          }),
        });
      };

      let response = await callGeminiWithModel(geminiModel);

      // Fast fallback to gemini-3-flash-preview or gemini-3.5-flash-lite if initial request failed
      if (!response.ok) {
        const fallbackModel =
          geminiModel === 'gemini-3.5-flash-lite'
            ? 'gemini-3-flash-preview'
            : 'gemini-3.5-flash-lite';
        console.warn(`Gemini model ${geminiModel} failed (${response.status}), retrying with ${fallbackModel}`);
        const fallbackRes = await callGeminiWithModel(fallbackModel);
        if (fallbackRes.ok) {
          response = fallbackRes;
        }
      }

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
          temperature: 0.5,
          max_tokens: maxOutputTokens,
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
