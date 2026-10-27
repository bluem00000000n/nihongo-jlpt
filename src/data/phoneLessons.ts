export interface PhoneTutorCharacter {
  id: string;
  name: string;
  japaneseName: string;
  gender: 'female' | 'male';
  ageGroup: string; // 20대, 30대, 50대
  role: string;
  tag: string;
  speechStyle: string;
  avatarIcon: string;
  accentNote: string;
  defaultOpeningGreeting: string;
  defaultOpeningGreetingKr: string;
}

export interface PhoneTopic {
  id: string;
  category: string;
  title: string;
  japaneseTitle: string;
  level: 'N5-N4' | 'N4-N3' | 'N3-N2' | 'N1';
  starterQuestionJp: string;
  starterQuestionKr: string;
}

export interface CallTranscriptMessage {
  id: string;
  speaker: 'ai' | 'user';
  speakerName: string;
  japanese: string;
  korean?: string;
  timestamp: string;
  correction?: {
    originalText: string;
    improvedJapanese: string;
    reading?: string;
    feedbackPoint: string;
  };
}

export interface CallSessionHistoryItem {
  id: string;
  date: string; // e.g. "2026.10.27"
  time: string; // e.g. "16:45"
  durationSeconds: number;
  characterName: string;
  characterGender: 'female' | 'male';
  characterRole: string;
  topicTitle: string;
  totalTurns: number;
  grammarScore: number;
  aiSummary: string;
  messages: CallTranscriptMessage[];
}

export const phoneTutorCharacters: PhoneTutorCharacter[] = [
  {
    id: 'yui',
    name: '유이 (結衣)',
    japaneseName: 'ゆい',
    gender: 'female',
    ageGroup: '20대',
    role: '대학생 튜터 · 일상/취미 회화',
    tag: '친절·상냥',
    speechStyle: '밝고 싹싹한 도쿄 표준어 (です/ます)',
    avatarIcon: '👩‍🎓',
    accentNote: '도쿄 야마노테 표준 억양 (여성 Kyoko 보이스)',
    defaultOpeningGreeting: 'もしもし！こんにちは、結衣です！今日はお電話ありがとうございます。お元気でしたか？',
    defaultOpeningGreetingKr: '여보세요! 안녕하세요, 유이입니다! 오늘 전화 감사해요. 잘 지내셨나요?',
  },
  {
    id: 'kenta',
    name: '켄타 (健太)',
    japaneseName: 'けんた',
    gender: 'male',
    ageGroup: '20대',
    role: '동료/친구 튜터 · 여행/스포츠/문화',
    tag: '편안·활기',
    speechStyle: '자연스럽고 캐주얼한 도쿄 표준 구어체',
    avatarIcon: '🧑‍💻',
    accentNote: '도쿄 표준 남성 억양 (남성 Keita/Otoya 보이스)',
    defaultOpeningGreeting: 'もしもし！健太です。お電話ありがとう！今日はお疲れ様でした。元気にしてた？',
    defaultOpeningGreetingKr: '여보세요! 켄타입니다. 전화 고마워! 오늘 수고 많았어요. 잘 지냈어?',
  },
  {
    id: 'sakura',
    name: '사쿠라 (さくら)',
    japaneseName: 'さくら',
    gender: 'female',
    ageGroup: '30대',
    role: '비즈니스 강사 · 매너/경어 교정',
    tag: '전문·정중',
    speechStyle: '교양 있고 정확한 비즈니스 표준어',
    avatarIcon: '👩‍💼',
    accentNote: 'NHK 아나운서 표준 억양 (여성 Nanami/Kyoko 보이스)',
    defaultOpeningGreeting: 'もしもし、お電話ありがとうございます。講師のさくらです。本日もよろしくお願いいたします。',
    defaultOpeningGreetingKr: '여보세요, 전화 감사드립니다. 강사 사쿠라입니다. 오늘도 잘 부탁드립니다.',
  },
  {
    id: 'takumi',
    name: '타쿠미 (拓海)',
    japaneseName: 'たくみ',
    gender: 'male',
    ageGroup: '30대',
    role: 'IT/비즈니스 멘토 · 시사/의견 토론',
    tag: '논리·차분',
    speechStyle: '신뢰감 있는 지적인 비즈니스 어조',
    avatarIcon: '👨‍💼',
    accentNote: '도쿄 도심 비즈니스 표준 억양 (남성 Otoya/Keita 보이스)',
    defaultOpeningGreeting: 'もしもし、拓海です。お忙しい中お電話ありがとうございます。本日のディスカッションを始めましょうか。',
    defaultOpeningGreetingKr: '여보세요, 타쿠미입니다. 바쁘신 중에 전화 감사드립니다. 오늘의 대화를 시작해 볼까요.',
  },
  {
    id: 'matsumoto',
    name: '마츠모토 센세 (松本先生)',
    japaneseName: 'まつもとせんせい',
    gender: 'male',
    ageGroup: '50대',
    role: '베테랑 지도 강사 · JLPT 1급 심층 지도',
    tag: '깊이·격려',
    speechStyle: '품격 있고 차분한 표준어와 따뜻한 피드백',
    avatarIcon: '🧑‍🏫',
    accentNote: '정통 도쿄 표준어 (안정적이고 중후한 톤)',
    defaultOpeningGreeting: 'もしもし、松本です。お電話繋がりましたね。今日も楽しく実りある日本語の時間を過ごしましょう。',
    defaultOpeningGreetingKr: '여보세요, 마츠모토입니다. 전화 잘 연결되었군요. 오늘도 즐겁고 알찬 일본어 시간을 가져봅시다.',
  },
];

export const phoneLessonTopics: PhoneTopic[] = [
  {
    id: 'weekend_life',
    category: '일상 & 여가',
    title: '휴일을 보내는 방법과 힐링',
    japaneseTitle: '休日の過ごし方とリフレッシュ法',
    level: 'N5-N4',
    starterQuestionJp: '今日のトピックは【休日の過ごし方】です！普段の週末やお休みの日には、どのように過ごされることが多いですか？',
    starterQuestionKr: '오늘의 토픽은 【휴일을 보내는 법】입니다! 평소 주말이나 쉬는 날에는 주로 어떻게 시간을 보내시나요?',
  },
  {
    id: 'japan_gourmet',
    category: '여행 & 음식',
    title: '일본 로컬 여행과 좋아하는 맛집 음식',
    japaneseTitle: '日本旅行と好きなグルメ',
    level: 'N4-N3',
    starterQuestionJp: '今日のテーマは【日本の旅とグルメ】です！もし今すぐ日本へ行くなら、どの街に行って何を食べたいですか？',
    starterQuestionKr: '오늘의 테마는 【일본 여행과 맛집】입니다! 만약 지금 바로 일본에 가신다면, 어떤 도시에 가서 무엇을 먹고 싶으신가요?',
  },
  {
    id: 'work_lifestyle',
    category: '직장 & 라이프',
    title: '업무 보람과 최근 직장 생활',
    japaneseTitle: 'お仕事とワークライフバランス',
    level: 'N3-N2',
    starterQuestionJp: '本日のトピックは【お仕事とライフスタイル】です。最近お仕事で達成感を感じたことや、新しく挑戦されていることはありますか？',
    starterQuestionKr: '오늘의 토픽은 【직장과 라이프스타일】입니다. 최근 일에서 보람을 느끼신 일이나 새롭게 도전하고 계신 것이 있나요?',
  },
  {
    id: 'stress_health',
    category: '건강 & 힐링',
    title: '나만의 스트레스 해소법과 건강 관리',
    japaneseTitle: '健康管理とストレス解消法',
    level: 'N4-N3',
    starterQuestionJp: '今日は【健康とストレス解消法】をテーマにお話ししましょう！忙しい毎日の中で、どんな方法で気分転換をしていますか？',
    starterQuestionKr: '오늘은 【건강과 스트레스 해소법】을 주제로 이야기 나눠요! 바쁜 일상 속에서 어떤 방법으로 기분 전환을 하시나요?',
  },
  {
    id: 'movies_culture',
    category: '영화 & 문화',
    title: '최근 본 인상 깊은 영화나 드라마',
    japaneseTitle: '最近おすすめの映画やドラマ',
    level: 'N3-N2',
    starterQuestionJp: '今日のトピックは【おすすめの映画やエンタメ】です！最近観た作品やドラマの中で、特に印象に残っているものはありますか？',
    starterQuestionKr: '오늘의 토픽은 【추천 영화와 엔터테인먼트】입니다! 최근 보신 작품이나 드라마 중 특히 인상 깊었던 것이 있으신가요?',
  },
  {
    id: 'ai_society',
    category: '시사 & 트렌드',
    title: 'AI 기술의 발전과 앞으로의 사회 변화',
    japaneseTitle: 'AI技術の進化とこれからの社会',
    level: 'N1',
    starterQuestionJp: '本日の議題は【AI技術と社会変化】です。AIの急速な普及に伴い、私たちの生活や働き方は今後いかに変容していくとお考えですか？',
    starterQuestionKr: '오늘의 의제는 【AI 기술과 사회 변화】입니다. AI의 급속한 보급에 따라 우리의 생활과 일하는 방식이 앞으로 어떻게 변해갈 것으로 생각하시나요?',
  },
];
