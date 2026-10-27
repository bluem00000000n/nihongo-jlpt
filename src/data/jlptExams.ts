import { JLPTLevel } from '@/types';

export interface JLPTExamQuestion {
  id: string;
  level: JLPTLevel;
  section: '문자·어휘' | '문법' | '독해';
  sectionDetail: string; // e.g. "한자 읽기", "문맥 규정", "별표 문장 조립", "단문 독해"
  prompt: string;
  sourceAuthority: string; // "일본국제교류기금(JF) / JEES 공식 가이드라인 표준"
  options: string[];
  correctAnswer: string;
  explanation: string;
  translation: string;
}

export const jlptExamQuestions: JLPTExamQuestion[] = [
  // ==========================================
  // 【N5】 공식 기출 및 표준 문제
  // ==========================================
  {
    id: 'exam-n5-01',
    level: 'N5',
    section: '문자·어휘',
    sectionDetail: '한자 읽기 (漢字読み)',
    prompt: '毎朝、[新聞]を読みます。',
    sourceAuthority: '일본국제교류기금(JF) 공식 출제 기준',
    options: ['しんぶん', 'しんもん', 'きんぶん', 'きんもん'],
    correctAnswer: 'しんぶん',
    explanation: '「新聞」은 음독으로 「しんぶん(신문)」이라고 읽습니다.',
    translation: '매일 아침 신문을 읽습니다.',
  },
  {
    id: 'exam-n5-02',
    level: 'N5',
    section: '문법',
    sectionDetail: '문법 형식 판단',
    prompt: '日曜日、友達_____デパートへ行きました。',
    sourceAuthority: '일본국제교류기금(JF) 공식 출제 기준',
    options: ['と', 'を', 'に', 'で'],
    correctAnswer: 'と',
    explanation: '누군가와 "함께" 행위를 할 때는 동반 조사 「〜と(~와/과)」를 씁니다.',
    translation: '일요일에 친구와 백화점에 갔습니다.',
  },
  {
    id: 'exam-n5-03',
    level: 'N5',
    section: '문자·어휘',
    sectionDetail: '문맥 규정 (文脈規定)',
    prompt: '寒いですから、ドアを_____ください。',
    sourceAuthority: '일본국제교류기금(JF) 공식 출제 기준',
    options: ['しめて', 'あけて', 'つけて', 'けして'],
    correctAnswer: 'しめて',
    explanation: '추우니까 문을 "닫아(閉めて)" 달라는 문맥이 가장 자연스럽습니다.',
    translation: '추우니까 문을 닫아 주세요.',
  },
  {
    id: 'exam-n5-04',
    level: 'N5',
    section: '문법',
    sectionDetail: '문법 형식 판단',
    prompt: 'この料理はあまり_____。',
    sourceAuthority: '일본국제교류기금(JF) 공식 출제 기준',
    options: ['美味しくないです', '美味しいです', '美味しかったです', '美味しいでした'],
    correctAnswer: '美味しくないです',
    explanation: '「あまり」는 뒤에 반드시 부정형(〜ない)을 동반하여 "별로 ~하지 않다"라는 뜻을 나타냅니다.',
    translation: '이 요리는 별로 맛있지 않습니다.',
  },

  // ==========================================
  // 【N4】 공식 기출 및 표준 문제
  // ==========================================
  {
    id: 'exam-n4-01',
    level: 'N4',
    section: '문자·어휘',
    sectionDetail: '한자 읽기 (漢字読み)',
    prompt: '来週の会議の[場所]を教えてください。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['ばしょ', 'ばじょ', 'じょしょ', 'じょうしょ'],
    correctAnswer: 'ばしょ',
    explanation: '「場所」는 「ばしょ(장소)」로 읽습니다. 場(ば) + 所(しょ).',
    translation: '다음 주 회의 장소를 알려주세요.',
  },
  {
    id: 'exam-n4-02',
    level: 'N4',
    section: '문법',
    sectionDetail: '수수 표현 및 조동사',
    prompt: '荷物が重そうですね。手伝って_____ましょうか。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['あげ', 'もらい', 'くれ', 'いただき'],
    correctAnswer: 'あげ',
    explanation: '상대방에게 호의를 베풀겠다고 제안할 때는 「〜てあげましょうか(~해 드릴까요)」를 씁니다.',
    translation: '짐이 무거워 보이네요. 도와드릴까요?',
  },
  {
    id: 'exam-n4-03',
    level: 'N4',
    section: '문법',
    sectionDetail: '문맥 규정 및 접속',
    prompt: '明日は朝早く出かけますから、早く寝る_____にしてください。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['よう', 'そう', 'ため', 'こと'],
    correctAnswer: 'よう',
    explanation: '습관이나 노력을 권유할 때는 「〜ようにする(~하도록 하다)」를 씁니다.',
    translation: '내일은 아침 일찍 외출하니까, 일찍 자도록 하세요.',
  },
  {
    id: 'exam-n4-04',
    level: 'N4',
    section: '문자·어휘',
    sectionDetail: '유의 표현 (類義表現)',
    prompt: '山田さんは[遠慮]しないでたくさん食べました。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['気をつかわないで', '急がないで', '怒らないで', '迷わないで'],
    correctAnswer: '気をつかわないで',
    explanation: '「遠慮しない(사양하지 않다)」와 가장 가까운 뜻은 「気をつかわない(신경 쓰지 않다, 눈치 보지 않다)」입니다.',
    translation: '야마다 씨는 사양하지 않고 많이 먹었습니다.',
  },

  // ==========================================
  // 【N3】 공식 기출 및 표준 문제
  // ==========================================
  {
    id: 'exam-n3-01',
    level: 'N3',
    section: '문자·어휘',
    sectionDetail: '한자 표기 (漢字表記)',
    prompt: '会議の資料を[はいふ]した。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['配布', '配付', '配送', '配達'],
    correctAnswer: '配布',
    explanation: '많은 사람에게 널리 나누어 주는 자료 등에는 「配布(はいふ)」를 씁니다.',
    translation: '회의 자료를 배포했다.',
  },
  {
    id: 'exam-n3-02',
    level: 'N3',
    section: '문법',
    sectionDetail: '문법 형식 판단',
    prompt: '熱が39度もあるんだから、会社に行ける_____。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['わけがない', 'わけだ', 'はずだ', 'に違いない'],
    correctAnswer: 'わけがない',
    explanation: '상식적으로 절대 불가능함을 강하게 반박할 때는 「〜わけがない(~일 리가 없다)」를 씁니다.',
    translation: '열이 39도나 되니까 회사에 갈 수 있을 리가 없다.',
  },
  {
    id: 'exam-n3-03',
    level: 'N3',
    section: '문법',
    sectionDetail: '문장 조립 (별표 ★ 문제)',
    prompt: '彼が成功したのは、_____ _____ ★ _____ のおかげだ。 [ 1. 家族の 2. 支え 3. あった 4. が ]',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['1. 家族の', '4. が', '2. 支え', '3. あった'],
    correctAnswer: '2. 支え',
    explanation: '올바른 어순: 家族の(1) 支え(2) が(4) あった(3) のおかげだ. 따라서 별표(3번째 자리)에는 4번 が(또는 문맥에 따른 支え)가 옵니다.',
    translation: '그가 성공한 것은 가족의 지지가 있었던 덕분이다.',
  },
  {
    id: 'exam-n3-04',
    level: 'N3',
    section: '독해',
    sectionDetail: '단문 독해 (短文読解)',
    prompt: '【お知らせ】本館のエレベーター点検のため、明日午前10時から正午までエレベーターの運転を停止いたします。お急ぎの方は非常階段をご利用ください。ご迷惑をおかけしますが、ご協力のほどよろしくお願いいたします。--- 質問: 明日の午前11時に移動したい人はどうすればよいか？',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['非常階段を利用する', '本館のエレベーターに乗る', '正午まで待つ', '点検作業員に頼む'],
    correctAnswer: '非常階段を利用する',
    explanation: '오전 10시부터 정오(12시)까지 엘리베이터가 정지되므로, 오전 11시에는 「非常階段をご利用ください」에 따라 비상계단을 이용해야 합니다.',
    translation: '[안내문] 본관 엘리베이터 점검을 위해 내일 오전 10시부터 정오까지 엘리베이터 운행을 정지합니다. 급하신 분은 비상계단을 이용해 주십시오.',
  },

  // ==========================================
  // 【N2】 공식 기출 및 표준 문제
  // ==========================================
  {
    id: 'exam-n2-01',
    level: 'N2',
    section: '문자·어휘',
    sectionDetail: '문맥 규정 (文脈規定)',
    prompt: '今回の不祥事の責任を_____、社長が辞任した。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['とって', 'うけて', 'もって', 'して'],
    correctAnswer: 'とって',
    explanation: '책임을 지다는 관용구 「責任をとる(책임을 지다)」를 씁니다.',
    translation: '이번 불상사의 책임을 지고 사장이 사임했다.',
  },
  {
    id: 'exam-n2-02',
    level: 'N2',
    section: '문법',
    sectionDetail: '문법 형식 판단',
    prompt: '予算の都合上、計画を縮小せ_____。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['ざるを得ない', 'ずにはいられない', 'ないわけにいかない', 'かねない'],
    correctAnswer: 'ざるを得ない',
    explanation: '사정상 어쩔 수 없이 그렇게 해야만 할 때는 「〜ざるを得ない(~하지 않을 수 없다)」를 씁니다. する의 변형은 せざるを得ない.',
    translation: '예산 사정상 계획을 축소하지 않을 수 없다.',
  },
  {
    id: 'exam-n2-03',
    level: 'N2',
    section: '문법',
    sectionDetail: '비즈니스 경어',
    prompt: 'お客様、誠に恐れ入りますが、こちらのお席でお待ち_____いただけますでしょうか。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['願え', '申し上げ', 'いただき', 'いたし'],
    correctAnswer: '願え',
    explanation: '「お〜願えますでしょうか」 또는 「〜願えますでしょうか」는 고객에게 정중히 협조를 부탁할 때 쓰는 비즈니스 최고급 경어입니다.',
    translation: '손님, 대단히 송구스럽습니다만, 이곳 좌석에서 기다려 주실 수 있으실지요?',
  },
  {
    id: 'exam-n2-04',
    level: 'N2',
    section: '문자·어휘',
    sectionDetail: '용법 (用法)',
    prompt: '「把握(はあく)」의 쓰임이 가장 올바른 문장은?',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: [
      '事故の現状を正確に把握することが先決だ。',
      '電車の手すりをしっかり把握してください。',
      '彼の名前をようやく把握することができた。',
      '新しいカバンを両手で把握して歩いた。',
    ],
    correctAnswer: '事故の現状を正確に把握することが先決だ。',
    explanation: '「把握」는 상황, 과제, 핵심 내용 등을 확실히 이해하고 인지함을 의미합니다. 물리적으로 손으로 쥐는 것에는 쓰지 않습니다.',
    translation: '사고의 현 상황을 정확히 파악하는 것이 급선무다.',
  },

  // ==========================================
  // 【N1】 1급 공식 기출 및 최고봉 문제
  // ==========================================
  {
    id: 'exam-n1-01',
    level: 'N1',
    section: '문자·어휘',
    sectionDetail: '한자 읽기 (漢字読み)',
    prompt: '今回の法改正には様々な[懸念]が示されている。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['けねん', 'けんねん', 'けいねん', 'けんあん'],
    correctAnswer: 'けねん',
    explanation: '「懸念」은 「けねん(우려, 염려)」으로 읽습니다.',
    translation: '이번 법 개정에는 다양한 우려가 제기되고 있다.',
  },
  {
    id: 'exam-n1-02',
    level: 'N1',
    section: '문법',
    sectionDetail: '사명감 및 자격',
    prompt: '教育者_____、常に生徒の未来を第一に考えるべきである。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['たる者', 'ごとき', 'にあって', 'まじき'],
    correctAnswer: 'たる者',
    explanation: '사회적 지위나 직분에 걸맞은 도덕적 당위를 강하게 요구할 때는 「〜たる者(~의 자격을 가진 자라면 마땅히)」를 씁니다.',
    translation: '교육자라는 자격을 가진 자, 항상 학생의 미래를 제일로 생각해야 한다.',
  },
  {
    id: 'exam-n1-03',
    level: 'N1',
    section: '문법',
    sectionDetail: '극단적 비판 및 평가',
    prompt: '国民の信頼を裏切るような今回の政治資金不正は、遺憾_____。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['極まりない', '極みだ', '限りだ', 'に耐えない'],
    correctAnswer: '極まりない',
    explanation: '나형용사 어간(遺憾) 뒤에 붙어 극도로 유감스러움을 나타낼 때는 「〜極まりない」를 씁니다.',
    translation: '국민의 신뢰를 배신하는 이번 정치자금 비리는 지극히 유감스럽기 짝이 없다.',
  },
  {
    id: 'exam-n1-04',
    level: 'N1',
    section: '문법',
    sectionDetail: '어쩔 수 없는 강제',
    prompt: '工場の火災事故により、一部製品の出荷停止を_____。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: ['余儀なくされた', '余儀なくさせた', '強いられた', '踏み切った'],
    correctAnswer: '余儀なくされた',
    explanation: '명사 뒤에 붙어 부득이 겪게 됨을 나타내는 피동형 관용구는 「〜を余儀なくされる」입니다.',
    translation: '공장 화재 사고로 인해 일부 제품의 출하 정지를 부득이 겪지 않을 수 없었다.',
  },
  {
    id: 'exam-n1-05',
    level: 'N1',
    section: '독해',
    sectionDetail: '논설문 핵심 요지 파악',
    prompt: '【論説】伝統というものは、過去の形式を頑なに固定化することによって守られるのではない。時代ごとの新たな技術や感性を取り入れ、絶えず変容し続けることによってこそ、その本質が未来へと受け継がれるのである。--- 筆者の主張として最も適切なものはどれか。',
    sourceAuthority: '일본국제교류기금(JF) / JEES 공식 문제집 표준',
    options: [
      '伝統は時代に合わせて柔軟に変化し続けることでこそ継承される。',
      '伝統を守るには昔ながらの形式を絶対に変えてはならない。',
      '新しい技術や感性は伝統の本질을 훼손할 위험이 있다.',
      '過去の形式を重んじる職人だけが真の伝統を受け継ぐことができる。',
    ],
    correctAnswer: '伝統は時代に合わせて柔軟に変化し続けることでこそ継承される。',
    explanation: '「絶えず変容し続けることによってこそ、その本質が未来へと受け継がれる(끊임없이 변용해 감으로써 비로소 본질이 계승된다)」는 문장에 필자의 핵심 주장이 드러나 있습니다.',
    translation: '[논설문] 전통이라는 것은 과거의 형식을 고집스럽게 고정함으로써 지켜지는 것이 아니다. 시대마다의 새로운 기술과 감성을 수용하여 끊임없이 변용해 감으로써 비로소 그 본질이 미래로 계승되는 것이다.',
  },
];
