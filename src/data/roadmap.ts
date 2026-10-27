import { ShadowingSentence, RoadmapGoal } from '@/types';

export const initialRoadmapGoals: RoadmapGoal[] = [
  // 1개월 차: 기초 귀 뚫기 & 핵심 문형
  {
    id: 'g-m1-w1',
    month: 1,
    week: 1,
    title: '가나 50음도 완벽 마스터',
    description: '히라가나와 가타카나 읽기 & 소리 완벽하게 외우기',
    completed: true,
    targetCount: 1,
    currentCount: 1
  },
  {
    id: 'g-m1-w2',
    month: 1,
    week: 2,
    title: '기초 핵심 조사 & 기본 문형 완성',
    description: 'は/が/を/に/で 조사 및 〜です/だ 기본형 익히기',
    completed: true,
    targetCount: 5,
    currentCount: 5
  },
  {
    id: 'g-m1-w3',
    month: 1,
    week: 3,
    title: '동사 ます형 & て형 변화 정복',
    description: '모든 회화의 뼈대가 되는 동사 활용 규칙 마스터',
    completed: false,
    targetCount: 10,
    currentCount: 4
  },
  {
    id: 'g-m1-w4',
    month: 1,
    week: 4,
    title: '기초 회화 10턴 주고받기',
    description: 'AI 튜터와 함께 쉬운 일본어 인사 및 자기소개 대화',
    completed: false,
    targetCount: 10,
    currentCount: 3
  },

  // 2개월 차: 실전 문장 채집 & 섀도잉
  {
    id: 'g-m2-w1',
    month: 2,
    week: 1,
    title: '실전 현지 표현 20개 채집',
    description: '드라마/브이로그에서 자주 나오는 원어민 표현 저장',
    completed: false,
    targetCount: 20,
    currentCount: 8
  },
  {
    id: 'g-m2-w2',
    month: 2,
    week: 2,
    title: '3단계 섀도잉 매일 15분',
    description: '귀로 듣고 -> 자막 보고 -> 무자막으로 따라 말하기',
    completed: false,
    targetCount: 15,
    currentCount: 5
  },
  {
    id: 'g-m2-w3',
    month: 2,
    week: 3,
    title: '상황별 롤플레잉(식당/호텔) 정복',
    description: '이자카야 주문, 호텔 체크인 시나리오 막힘없이 완주',
    completed: false,
    targetCount: 5,
    currentCount: 2
  },
  {
    id: 'g-m2-w4',
    month: 2,
    week: 4,
    title: '한국어 개입 없이 일본어로만 생각하기',
    description: '눈에 보이는 사물과 감정을 일본어 혼잣말로 표현하기',
    completed: false,
    targetCount: 7,
    currentCount: 1
  },

  // 3개월 차: AI 프리토킹 & 입 트이기
  {
    id: 'g-m3-w1',
    month: 3,
    week: 1,
    title: 'ChatGPT Voice 모드로 15분 연속 대화',
    description: '음성 모드로 일본인 친구와 일상 프리토킹 진행',
    completed: false,
    targetCount: 5,
    currentCount: 0
  },
  {
    id: 'g-m3-w2',
    month: 3,
    week: 2,
    title: '연애 시뮬레이션 & 친구 반말(タメ口) 마스터',
    description: '감정 표현과 리액션을 곁들인 자연스러운 대화 나누기',
    completed: false,
    targetCount: 5,
    currentCount: 0
  },
  {
    id: 'g-m3-w3',
    month: 3,
    week: 3,
    title: '돌발 질문에 3초 내로 일본어로 반응하기',
    description: '머뭇거림 없이 즉각 자연스러운 맞장구(相槌) 치기',
    completed: false,
    targetCount: 10,
    currentCount: 0
  },
  {
    id: 'g-m3-w4',
    month: 3,
    week: 4,
    title: '3개월 독학 완성! 일본 현지인과 자유 대화',
    description: '자신감 있게 일본어 원어민과 대화할 수 있는 레벨 달성',
    completed: false,
    targetCount: 1,
    currentCount: 0
  }
];

export const minedSentencesData: ShadowingSentence[] = [
  {
    id: 'mine-01',
    source: '도쿄 카페 브이로그',
    japanese: 'とりあえず、アイスカフェラテでお願いします。',
    ruby: [{ kanji: '願', furigana: 'ねが' }],
    romaji: 'Toriaezu, aisu kafe rate de onegaishimasu.',
    korean: '우선은 아이스 카페라떼로 부탁드립니다.',
    nuanceTip: '「とりあえず(우선은)」는 일본인들이 주문할 때 무의식적으로 가장 많이 쓰는 마법의 부사입니다.',
    month: 1
  },
  {
    id: 'mine-02',
    source: '일본 일상 드라마',
    japanese: 'それな！めっちゃ共感できる！',
    ruby: [{ kanji: '共感', furigana: 'きょうかん' }],
    romaji: 'Sore na! Meccha kyoukan dekiru!',
    korean: '내 말이! 진짜 공감된다!',
    nuanceTip: '「それな」는 상대방의 말에 100% 공감할 때 쓰는 요즘 일본의 대표 맞장구 표현입니다.',
    month: 1
  },
  {
    id: 'mine-03',
    source: '도쿄 현지 쇼핑 영상',
    japanese: 'これ、他の色はありますか？試着してもいいですか？',
    ruby: [{ kanji: '他', furigana: 'ほか' }, { kanji: '色', furigana: 'いろ' }, { kanji: '試着', furigana: 'しちゃく' }],
    romaji: 'Kore, hoka no iro wa arimasu ka? Shichaku shitemo ii desu ka?',
    korean: '이거 다른 색상도 있나요? 입어봐도 될까요?',
    nuanceTip: '옷 가게에서 점원에게 질문할 때 완벽한 표준 조합입니다.',
    month: 2
  },
  {
    id: 'mine-04',
    source: '친구와의 일상 대화',
    japanese: '無理しないで、ゆっくり休んでね。お大事に！',
    ruby: [{ kanji: '無理', furigana: 'むり' }, { kanji: '休', furigana: 'やす' }, { kanji: '大事', furigana: 'だいじ' }],
    romaji: 'Muri shinaide, yukkuri yasunde ne. Odaiji ni!',
    korean: '무리하지 말고 푹 쉬어. 몸조리 잘해!',
    nuanceTip: '상대방이 피곤하거나 아플 때 따뜻하게 건네는 진심 어린 배려 표현입니다.',
    month: 2
  },
  {
    id: 'mine-05',
    source: '일본 넷플릭스 예능',
    japanese: 'まじでやばい！想像以上に美味しかったんだけど！',
    ruby: [{ kanji: '想像以上', furigana: 'そうぞういじょう' }, { kanji: '美味', furigana: 'おい' }],
    romaji: 'Maji de yabai! Souzou ijou ni oishikatta n dakedo!',
    korean: '진짜 대박! 상상 이상으로 맛있었는데?!',
    nuanceTip: '「やばい」와 「〜んだけど(여운 남기기)」를 조합하면 감탄하는 감정을 생생하게 전할 수 있습니다.',
    month: 2
  },
  {
    id: 'mine-06',
    source: '이자카야 퇴근길 영상',
    japanese: '今日もお疲れ様でした！乾杯しましょう！',
    ruby: [{ kanji: '今日', furigana: 'きょう' }, { kanji: '疲', furigana: 'つか' }, { kanji: '様', furigana: 'さま' }, { kanji: '乾杯', furigana: 'かんぱい' }],
    romaji: 'Kyou mo otsukaresama deshita! Kanpai shimashou!',
    korean: '오늘도 수고 많으셨습니다! 건배해요!',
    nuanceTip: '하루 일과를 마치고 술잔을 부딪힐 때의 국민 인사말입니다.',
    month: 1
  },
  {
    id: 'mine-07',
    source: '친구와의 데이트 대화',
    japanese: '何かあったら、いつでも連絡してね。応援してるから！',
    ruby: [{ kanji: '何', furigana: 'なに' }, { kanji: '連絡', furigana: 'れんらく' }, { kanji: '応援', furigana: 'おうえん' }],
    romaji: 'Nani ka attara, itsudemo renraku shite ne. Ouen shiteru kara!',
    korean: '무슨 일 있으면 언제든 연락해. 응원하고 있을 테니까!',
    nuanceTip: '친구 사이에 든든한 신뢰와 애정을 표현하는 자연스러운 구어체입니다.',
    month: 3
  }
];
