import { GrammarItem } from '@/types';

export const grammarData: GrammarItem[] = [
  // ================= N5 =================
  {
    id: 'n5-01',
    level: 'N5',
    title: '〜です / 〜だ',
    meaning: '~입니다 / ~이다',
    connection: '명사 / 나형용사 어간 + です / だ',
    category: '기본 서술어',
    explanation: '가장 기본적인 정중형(입니다: です)과 보통형/반말(이다: だ) 서술 표현입니다. 질문할 때는 끝에 「か」를 붙여 「〜ですか」로 만듭니다.',
    importantTip: '회화에서는 친한 사이에서 「だ」를 생략하고 명사만 말하거나 억양을 올려 질문하기도 합니다.',
    examples: [
      {
        id: 'n5-01-ex1',
        japanese: '私は韓国人です。',
        ruby: [{ kanji: '私', furigana: 'わたし' }, { kanji: '韓国人', furigana: 'かんこくじん' }],
        romaji: 'Watashi wa kankokujin desu.',
        korean: '저는 한국인입니다.',
        nuance: '정중한 자기소개'
      },
      {
        id: 'n5-01-ex2',
        japanese: 'これは日本の本ですか。',
        ruby: [{ kanji: '日本', furigana: 'にほん' }, { kanji: '本', furigana: 'ほん' }],
        romaji: 'Kore wa nihon no hon desu ka.',
        korean: '이것은 일본 책입니까?',
        nuance: '의문형 표현'
      },
      {
        id: 'n5-01-ex3',
        japanese: '今日はいい天気だ。',
        ruby: [{ kanji: '今日', furigana: 'きょう' }, { kanji: '天気', furigana: 'てんき' }],
        romaji: 'Kyou wa ii tenki da.',
        korean: '오늘은 좋은 날씨다 (반말).',
        nuance: '친구/혼잣말 친근한 표현'
      }
    ],
    quizzes: [
      {
        id: 'n5-01-q1',
        type: 'word_order',
        prompt: '"저는 학생입니다" 를 올바른 순서로 완성하세요.',
        words: ['学生です', '私は'],
        correctAnswer: ['私は', '学生です'],
        explanation: '주어(私は) 뒤에 보어+서술어(学生です)가 옵니다.',
        audioText: '私は学生です。'
      },
      {
        id: 'n5-01-q2',
        type: 'fill_blank',
        prompt: 'これは私の傘（　　）。 (이것은 제 우산입니다.)',
        options: ['です', 'ます', 'でした', 'だっ'],
        correctAnswer: 'です',
        explanation: '명사(傘: 우산) 뒤에 정중한 긍정 서술어 「です」가 붙습니다.',
        audioText: 'これは私の傘です。'
      }
    ]
  },
  {
    id: 'n5-02',
    level: 'N5',
    title: '〜ています (진행 & 상태)',
    meaning: '~하고 있습니다 / ~해 있습니다',
    connection: '동사 て형 + います',
    category: '시제/상태',
    explanation: '1) 현재 진행 중인 동작(지금 밥을 먹고 있다) 2) 동작의 결과가 지속되는 상태(결혼해 있다, 도쿄에 살고 있다)를 나타냅니다.',
    importantTip: '한국어로 "살다", "결혼하다", "알다"는 일본어에서 순간동사이므로 지속 상태인 「住んでいます」, 「結婚しています」, 「知っています」로 써야 자연스럽습니다.',
    examples: [
      {
        id: 'n5-02-ex1',
        japanese: '今、日本語を勉強しています。',
        ruby: [{ kanji: '今', furigana: 'いま' }, { kanji: '日本語', furigana: 'にほんご' }, { kanji: '勉強', furigana: 'べんきょう' }],
        romaji: 'Ima, nihongo o benkyou shite imasu.',
        korean: '지금 일본어를 공부하고 있습니다.',
        nuance: '진행 중인 동작'
      },
      {
        id: 'n5-02-ex2',
        japanese: '東京に住んでいます。',
        ruby: [{ kanji: '東京', furigana: 'とうきょう' }, { kanji: '住', furigana: 'す' }],
        romaji: 'Toukyou ni sunde imasu.',
        korean: '도쿄에 살고 있습니다.',
        nuance: '거주 상태 지속'
      }
    ],
    quizzes: [
      {
        id: 'n5-02-q1',
        type: 'word_order',
        prompt: '"음악을 듣고 있습니다" 를 올바른 순서로 완성하세요.',
        words: ['聞いています', '音楽を'],
        correctAnswer: ['音楽を', '聞いています'],
        explanation: '목적어(音楽を) + 동사 て형 진행(聞いています)의 순서입니다.',
        audioText: '音楽を聞いています。'
      }
    ]
  },
  {
    id: 'n5-03',
    level: 'N5',
    title: '〜たい / 〜たくない',
    meaning: '~하고 싶다 / ~하고 싶지 않다',
    connection: '동사 ます형 어간 + たい / たくない',
    category: '희망/욕구',
    explanation: '화자(1인칭)의 직접적인 희망이나 소망을 나타냅니다. 2인칭에게 질문할 때는 「〜たいですか」(하고 싶습니까?)로 씁니다.',
    importantTip: '타인의 희망(3인칭)을 말할 때는 「〜たがっている」를 사용해야 합니다.',
    examples: [
      {
        id: 'n5-03-ex1',
        japanese: '日本に行きたいです。',
        ruby: [{ kanji: '日本', furigana: 'にほん' }, { kanji: '行', furigana: 'い' }],
        romaji: 'Nihon ni ikitai desu.',
        korean: '일본에 가고 싶습니다.',
        nuance: '나의 희망 표현'
      },
      {
        id: 'n5-03-ex2',
        japanese: 'ラーメンが食べたいです。',
        ruby: [{ kanji: '食', furigana: 'た' }],
        romaji: 'Raamen ga tabetai desu.',
        korean: '라면을 먹고 싶습니다.',
        nuance: '~たい 앞에서는 조사 を 대신 が를 자주 씁니다.'
      }
    ],
    quizzes: [
      {
        id: 'n5-03-q1',
        type: 'fill_blank',
        prompt: '冷たい水が（　　）たいです。 (시원한 물이 마시고 싶습니다.)',
        options: ['飲み', '飲む', '飲んで', '飲ま'],
        correctAnswer: '飲み',
        explanation: '동사 飲む의 ます형 어간인 「飲み」 뒤에 たい가 결합합니다.',
        audioText: '冷たい水が飲みたいです。'
      }
    ]
  },
  {
    id: 'n5-04',
    level: 'N5',
    title: '〜てください',
    meaning: '~해 주세요 (정중한 부탁/지시)',
    connection: '동사 て형 + ください',
    category: '요청/부탁',
    explanation: '상대방에게 무언가를 요청하거나 권유할 때 사용하는 가장 표준적인 공손한 표현입니다.',
    importantTip: '더 정중하게 부탁할 때는 「〜ていただけますか」나 「〜てくださいませんか」를 씁니다.',
    examples: [
      {
        id: 'n5-04-ex1',
        japanese: 'ここに名前を書いてください。',
        ruby: [{ kanji: '名前', furigana: 'なまえ' }, { kanji: '書', furigana: 'か' }],
        romaji: 'Koko ni namae o kaite kudasai.',
        korean: '여기에 이름을 써 주세요.',
        nuance: '정중한 기입 안내'
      },
      {
        id: 'n5-04-ex2',
        japanese: 'もう一度言ってください。',
        ruby: [{ kanji: '一度', furigana: 'いちど' }, { kanji: '言', furigana: 'い' }],
        romaji: 'Mou ichido itte kudasai.',
        korean: '다시 한 번 말씀해 주세요.',
        nuance: '회화 필수 표현'
      }
    ],
    quizzes: [
      {
        id: 'n5-04-q1',
        type: 'word_order',
        prompt: '"잠시 기다려 주세요" 문장을 바르게 조립하세요.',
        words: ['待って', '少々', 'ください'],
        correctAnswer: ['少々', '待って', 'ください'],
        explanation: '부사(少々: 잠시) + 동사 て형(待って) + ください의 순서입니다.',
        audioText: '少々待ってください。'
      }
    ]
  },

  // ================= N4 =================
  {
    id: 'n4-01',
    level: 'N4',
    title: '〜たら (조건 & 발견)',
    meaning: '~하면 / ~했더니',
    connection: '동사/형용사 た형 + ら',
    category: '조건문',
    explanation: '가장 널리 쓰이는 가정/조건 표현입니다. 1) 앞의 일이 일어나면 뒤의 일을 함 2) 과거형과 쓰여 "~했더니 새로운 사실을 발견함"을 나타냅니다.',
    importantTip: '뒷문장에 의지, 명령, 희망(〜てください, 〜たい)이 올 때 아주 자연스럽습니다.',
    examples: [
      {
        id: 'n4-01-ex1',
        japanese: '駅に着いたら電話してください。',
        ruby: [{ kanji: '駅', furigana: 'えき' }, { kanji: '着', furigana: 'つ' }, { kanji: '電話', furigana: 'でんわ' }],
        romaji: 'Eki ni tsuitara denwa shite kudasai.',
        korean: '역에 도착하면 전화해 주세요.',
        nuance: '도착 완료 후의 행동 요청'
      },
      {
        id: 'n4-01-ex2',
        japanese: '窓を開けたら、雪が降っていた。',
        ruby: [{ kanji: '窓', furigana: 'まど' }, { kanji: '開', furigana: 'あ' }, { kanji: '雪', furigana: 'ゆき' }, { kanji: '降', furigana: 'ふ' }],
        romaji: 'Mado o aketara, yuki ga futte ita.',
        korean: '창문을 열었더니 눈이 내리고 있었다.',
        nuance: '과거 발견/계기'
      }
    ],
    quizzes: [
      {
        id: 'n4-01-q1',
        type: 'fill_blank',
        prompt: '雨が（　　）、試合は中止になります。 (비가 내리면 시합은 중지됩니다.)',
        options: ['降ったら', '降るなら', '降って', '降れば'],
        correctAnswer: '降ったら',
        explanation: '동사 降る(비가 내리다)의 과거형 降った + ら 형태입니다.',
        audioText: '雨が降ったら、試合は中止になります。'
      }
    ]
  },
  {
    id: 'n4-02',
    level: 'N4',
    title: '〜てあげる / 〜てもらう / 〜てくれる',
    meaning: '~해 주다 / ~해 받다 / (남이 나에게)~해 주다',
    connection: '동사 て형 + あげる / もらう / くれる',
    category: '수수동사 (은혜 표현)',
    explanation: '일본어의 독특한 호의 교환 표현입니다. 1) あげる: 내가 남에게 해줌 2) くれる: 남이 나에게 해줌 3) もらう: 남에게 부탁해서 ~해 받음.',
    importantTip: '윗사람에게 부탁할 때는 いただく(もらう의 겸양), 드리는 표현은 さしあげる를 씁니다.',
    examples: [
      {
        id: 'n4-02-ex1',
        japanese: '友達が道を教えてくれました。',
        ruby: [{ kanji: '友達', furigana: 'ともだち' }, { kanji: '道', furigana: 'みち' }, { kanji: '教', furigana: 'おし' }],
        romaji: 'Tomodachi ga michi o oshiete kuremashita.',
        korean: '친구가 길을 가르쳐 주었습니다 (나에게 호의를 베풂).',
        nuance: '고마움의 뉘앙스 내포'
      },
      {
        id: 'n4-02-ex2',
        japanese: '先生に日本語を直してもらいました。',
        ruby: [{ kanji: '先生', furigana: 'せんせい' }, { kanji: '日本語', furigana: 'にほんご' }, { kanji: '直', furigana: 'なお' }],
        romaji: 'Sensei ni nihongo o naoshite moraimashita.',
        korean: '선생님께 일본어를 교정받았습니다.',
        nuance: '선생님의 도움을 받음'
      }
    ],
    quizzes: [
      {
        id: 'n4-02-q1',
        type: 'fill_blank',
        prompt: '母がケーキを作って（　　）ました。 (어머니가 케이크를 만들어 주셨습니다.)',
        options: ['くれ', 'あげ', 'もらい', 'やり'],
        correctAnswer: 'くれ',
        explanation: '타인(어머니)이 화자(나)를 위해 해준 일이므로 「くれる」를 씁니다.',
        audioText: '母がケーキを作ってくれました。'
      }
    ]
  },
  {
    id: 'n4-03',
    level: 'N4',
    title: '〜なければならない',
    meaning: '~하지 않으면 안 된다 (~해야만 한다)',
    connection: '동사 ない형 어간 + なければならない',
    category: '의무/필요',
    explanation: '강한 의무나 사회적 규범, 반드시 해야 하는 일을 표현합니다.',
    importantTip: '일상 회화 줄임말: 「〜なきゃ」「〜なくちゃ」(예: 行かなきゃ! 가야 해!)',
    examples: [
      {
        id: 'n4-03-ex1',
        japanese: '明日までに宿題を出さなければなりません。',
        ruby: [{ kanji: '明日', furigana: 'あした' }, { kanji: '宿題', furigana: 'しゅくだい' }, { kanji: '出', furigana: 'だ' }],
        romaji: 'Ashita made ni shukudai o dasanakereba narimasen.',
        korean: '내일까지 숙제를 제출해야 합니다.',
        nuance: '기한 엄수 의무'
      }
    ],
    quizzes: [
      {
        id: 'n4-03-q1',
        type: 'word_order',
        prompt: '"약을 먹어야 합니다" 문장을 조립하세요.',
        words: ['薬を', '飲まなければ', 'なりません'],
        correctAnswer: ['薬を', '飲まなければ', 'なりません'],
        explanation: '약을 먹다(薬を飲む) -> 飲まなければなりません.',
        audioText: '薬を飲まなければなりません。'
      }
    ]
  },

  // ================= N3 =================
  {
    id: 'n3-01',
    level: 'N3',
    title: '〜わけだ / 〜わけではない',
    meaning: '~한 셈이다(당연하다) / ~인 것은 아니다(부분부정)',
    connection: '보통형 + わけだ / わけではない (나형용사 な, 명사 な/である)',
    category: '이유/논리',
    explanation: '1) わけだ: 전후 맥락을 따져볼 때 "그렇기 때문에 당연히 ~인 결과가 되는군!" 하고 납득할 때 씁니다. 2) わけではない: "모두가 다 그런 것은 아니다"는 부분 부정입니다.',
    importantTip: '"한국에서 10년 살았으니 매운 걸 잘 먹는 わけだ(당연한 이유)"',
    examples: [
      {
        id: 'n3-01-ex1',
        japanese: '日本に５年も住んでいたから、日本語が上手なわけですね。',
        ruby: [{ kanji: '日本', furigana: 'にほん' }, { kanji: '年', furigana: 'ねん' }, { kanji: '住', furigana: 'す' }, { kanji: '日本語', furigana: 'にほんご' }, { kanji: '上手', furigana: 'じょうず' }],
        romaji: 'Nihon ni go-nen mo sunde ita kara, nihongo ga jouzu na wake desu ne.',
        korean: '일본에 5년이나 살았으니 일본어를 잘하는 것이 당연하군요.',
        nuance: '상황에 대한 납득'
      },
      {
        id: 'n3-01-ex2',
        japanese: '嫌いなわけではないが、あまり食べない。',
        ruby: [{ kanji: '嫌', furigana: 'きら' }, { kanji: '食', furigana: 'た' }],
        romaji: 'Kirai na wake dewa nai ga, amari tabenai.',
        korean: '싫어하는 것은 아니지만, 그다지 먹지 않는다.',
        nuance: '완전 거절이 아닌 완곡한 부분 부정'
      }
    ],
    quizzes: [
      {
        id: 'n3-01-q1',
        type: 'fill_blank',
        prompt: 'お金があれば幸せという（　　）。 (돈이 있다고 해서 행복하다는 것은 아니다.)',
        options: ['わけではない', 'わけがある', 'はずがない', 'ことではない'],
        correctAnswer: 'わけではない',
        explanation: '부분 부정으로 완곡하게 반론할 때 「わけではない」를 씁니다.',
        audioText: 'お金があれば幸せというわけではない。'
      }
    ]
  },
  {
    id: 'n3-02',
    level: 'N3',
    title: '〜おかげで / 〜せいで',
    meaning: '~덕분에 (긍정) / ~탓에 (부정/원망)',
    connection: '보통형 / 명사 + の + おかげで / せいで',
    category: '원인/이유',
    explanation: '원인으로 인해 초래된 결과가 좋은 결과일 때는 「おかげで(덕택에)」, 나쁜 결과나 원망일 때는 「せいで(탓에)」를 사용합니다.',
    importantTip: '비꼬는 뉘앙스로 반어법처럼 おかげで를 쓰는 경우도 드물게 있습니다.',
    examples: [
      {
        id: 'n3-02-ex1',
        japanese: '先生のおかげで、試験に合格できました。',
        ruby: [{ kanji: '先生', furigana: 'せんせい' }, { kanji: '試験', furigana: 'しけん' }, { kanji: '合格', furigana: 'ごうかく' }],
        romaji: 'Sensei no okage de, shiken ni goukaku dekimashita.',
        korean: '선생님 덕분에 시험에 합격할 수 있었습니다.',
        nuance: '감사의 마음'
      },
      {
        id: 'n3-02-ex2',
        japanese: '台風のせいで、飛行機が欠航になった。',
        ruby: [{ kanji: '台風', furigana: 'たいふう' }, { kanji: '飛行機', furigana: 'ひこうき' }, { kanji: '欠航', furigana: 'けっこう' }],
        romaji: 'Taifuu no sei de, hikouki ga kekkou ni natta.',
        korean: '태풍 탓에 비행기가 결항되었다.',
        nuance: '피해 및 원망'
      }
    ],
    quizzes: [
      {
        id: 'n3-02-q1',
        type: 'fill_blank',
        prompt: 'あなたの（　　）、助かりました！ありがとうございます。',
        options: ['おかげで', 'せいで', 'ばかりで', 'ために'],
        correctAnswer: 'おかげで',
        explanation: '도움이 되어 감사하는 긍정적 결과이므로 「おかげで」가 정답입니다.',
        audioText: 'あなたのおかげで、助かりました！ありがとうございます。'
      }
    ]
  },
  {
    id: 'n3-03',
    level: 'N3',
    title: '〜に対して (たいして)',
    meaning: '~에 대해서 (대상) / ~에 반해서 (대비)',
    connection: '명사 + に対して / にたいする + 명사',
    category: '대상/대비',
    explanation: '1) 어떤 대상에 대한 태도나 행위의 방향성 (~에게/에 대해) 2) 두 사물의 뚜렷한 차이와 대조 (~에 반해).',
    importantTip: '경의나 불만을 특정 대상에게 표출할 때 많이 씁니다.',
    examples: [
      {
        id: 'n3-03-ex1',
        japanese: 'お客様に対して、失礼な言葉遣いをしてはいけない。',
        ruby: [{ kanji: '客', furigana: 'きゃく' }, { kanji: '様', furigana: 'さま' }, { kanji: '失礼', furigana: 'しつれい' }, { kanji: '言葉遣', furigana: 'ことばづか' }],
        romaji: 'Okyakusama ni taishite, shitsurei na kotobazukai o shite wa ikenai.',
        korean: '손님에 대해서 실례되는 말투를 써서는 안 된다.',
        nuance: '비즈니스 태도'
      }
    ],
    quizzes: [
      {
        id: 'n3-03-q1',
        type: 'word_order',
        prompt: '"동생은 밝은 데 반해 형은 조용하다" 문장을 조립하세요.',
        words: ['兄は静かだ', '弟が明るいのに対して、'],
        correctAnswer: ['弟が明るいのに対して、', '兄は静かだ'],
        explanation: '대조의 연결 표현입니다.',
        audioText: '弟が明るいのに対して、兄は静かだ。'
      }
    ]
  },

  // ================= N2 =================
  {
    id: 'n2-01',
    level: 'N2',
    title: '〜に際して (にさいして)',
    meaning: '~함에 즈음하여 / ~할 때에',
    connection: '동사 사전형 / 명사 + に際して / に際し',
    category: '시기/경사',
    explanation: '격식 있는 자리나 중요한 특별한 행사, 시작의 순간에 "~함에 즈음하여"라는 정중하고 공식적인 표현입니다.',
    importantTip: '일상 사소한 일(아침밥 먹을 때 등)에는 쓰지 않고, 졸업식, 신규 프로젝트 개시, 계약 등에 씁니다.',
    examples: [
      {
        id: 'n2-01-ex1',
        japanese: '新しい事業の開始に際して、一言ご挨拶申し上げます。',
        ruby: [{ kanji: '新', furigana: 'あたら' }, { kanji: '事業', furigana: 'じぎょう' }, { kanji: '開始', furigana: 'かいし' }, { kanji: '際', furigana: 'さい' }, { kanji: '一言', furigana: 'ひとこと' }, { kanji: '挨拶', furigana: 'あいさつ' }, { kanji: '申', furigana: 'もう' }],
        romaji: 'Atarashii jigyou no kaishi ni saishite, hitokoto goaisatsu moushiagemasu.',
        korean: '새 사업 시작에 즈음하여 한 말씀 인사 올리겠습니다.',
        nuance: '공식 비즈니스 연설'
      }
    ],
    quizzes: [
      {
        id: 'n2-01-q1',
        type: 'fill_blank',
        prompt: '留学（　　）、パスポートやビザの準備を念入りに行った。',
        options: ['に際して', 'にしたがって', 'にとどまらず', 'をはじめ'],
        correctAnswer: 'に際して',
        explanation: '유학이라는 인생의 큰 이벤트에 즈음하여 행한 조치이므로 「に際して」가 적절합니다.',
        audioText: '留学に際して、パスポートやビザの準備を念入りに行った。'
      }
    ]
  },
  {
    id: 'n2-02',
    level: 'N2',
    title: '〜ざるを得ない (ざるをえない)',
    meaning: '~하지 않을 수 없다 (어쩔 수 없이 ~하다)',
    connection: '동사 ない형 어간 + ざるを得ない (※する -> せざるを得ない)',
    category: '불가피/체념',
    explanation: '본인의 의지와 상관없이 주위 상황이나 이유 때문에 어쩔 수 없이 그 행동을 할 수밖에 없는 체념/불가피함을 나타냅니다.',
    importantTip: '하는 행동은 화자 본인이 원해서 하는 것이 아님을 명확히 풍깁니다.',
    examples: [
      {
        id: 'n2-02-ex1',
        japanese: '証拠が揃っている以上、彼の主張を認めざるを得ない。',
        ruby: [{ kanji: '証拠', furigana: 'しょうこ' }, { kanji: '揃', furigana: 'そろ' }, { kanji: '以上', furigana: 'いじょう' }, { kanji: '彼', furigana: 'かれ' }, { kanji: '主張', furigana: 'しゅちょう' }, { kanji: '認', furigana: 'みとめ' }, { kanji: '得', furigana: 'え' }],
        romaji: 'Shouko ga sorotte iru ijou, kare no shuchou o mitomezaru o enai.',
        korean: '증거가 갖추어진 이상, 그의 주장을 인정하지 않을 수 없다.',
        nuance: '상황상 불가피한 판단'
      }
    ],
    quizzes: [
      {
        id: 'n2-02-q1',
        type: 'word_order',
        prompt: '"계획을 변경하지 않을 수 없다" 문장을 조립하세요.',
        words: ['せざるを得ない', '計画を', '変更'],
        correctAnswer: ['計画を', '変更', 'せざるを得ない'],
        explanation: 'する의 ざるを得ない 형은 「せざるを得ない」입니다.',
        audioText: '計画を変更せざるを得ない。'
      }
    ]
  },

  // ================= N1 =================
  {
    id: 'n1-01',
    level: 'N1',
    title: '〜や否や (やいなや)',
    meaning: '~하자마자 / ~하기가 무섭게',
    connection: '동사 사전형 + や否や',
    category: '동시발생',
    explanation: '어떤 사건이 일어난 직후 곧바로 다음 순간적인 사건이 일어남을 드라마틱하고 박진감 있게 서술하는 문어적 표현입니다.',
    importantTip: '뒤에는 화자의 의지나 희망이 올 수 없고, 실제로 순간적으로 일어난 과거 사실이 옵니다.',
    examples: [
      {
        id: 'n1-01-ex1',
        japanese: 'ベルが鳴るや否や、生徒たちは一斉に教室を飛び出した。',
        ruby: [{ kanji: '鳴', furigana: 'な' }, { kanji: '否', furigana: 'いな' }, { kanji: '生徒', furigana: 'せいと' }, { kanji: '一斉', furigana: 'いっせい' }, { kanji: '教室', furigana: 'きょうしつ' }, { kanji: '飛', furigana: 'と' }, { kanji: '出', furigana: 'だ' }],
        romaji: 'Beru ga naru ya inaya, seitotachi wa issei ni kyoushitsu o tobidashita.',
        korean: '종이 울리자마자 학생들은 일제히 교실을 뛰쳐나갔다.',
        nuance: '순간적 연쇄 동작의 생동감 있는 묘사'
      }
    ],
    quizzes: [
      {
        id: 'n1-01-q1',
        type: 'fill_blank',
        prompt: '彼は私の顔を見る（　　）、何も言わずに逃げていった。',
        options: ['や否や', 'が最後', 'なりに', 'とあって'],
        correctAnswer: 'や否や',
        explanation: '보자마자 순간적으로 달아난 동작의 직후성을 나타내는 「や否や」가 정답입니다.',
        audioText: '彼は私の顔を見るや否や、何も言わずに逃げていった。'
      }
    ]
  },
  {
    id: 'n1-02',
    level: 'N1',
    title: '〜たる者 (たるもの)',
    meaning: '~의 신분/위치에 있는 자라면',
    connection: '명사 + たる者',
    category: '자격/도리',
    explanation: '"~라는 높은 지위나 책임을 가진 자라면 당연히 그에 걸맞게 행동해야 한다"는 높은 윤리적 기대치를 서술합니다.',
    importantTip: '사회적 지위나 직책(지도자, 교육자, 공무원, 의사 등) 뒤에 결합합니다.',
    examples: [
      {
        id: 'n1-02-ex1',
        japanese: '指導者たる者は、常に公平な判断を下さなければならない。',
        ruby: [{ kanji: '指導者', furigana: 'しどうしゃ' }, { kanji: '者', furigana: 'もの' }, { kanji: '常', furigana: 'つね' }, { kanji: '公平', furigana: 'こうへい' }, { kanji: '判断', furigana: 'はんだん' }, { kanji: '下', furigana: 'くだ' }],
        romaji: 'Shidousha taru mono wa, tsuneni kouhei na handan o kudasanakereba naranai.',
        korean: '지도자의 위치에 있는 자라면, 항상 공평한 판단을 내려야만 한다.',
        nuance: '높은 품격과 책임 요구'
      }
    ],
    quizzes: [
      {
        id: 'n1-02-q1',
        type: 'fill_blank',
        prompt: '医者（　　）、患者の命を最優先に考えるべきだ。',
        options: ['たる者', 'にあって', 'ともなると', 'にかこつけて'],
        correctAnswer: 'たる者',
        explanation: '의사라는 직분에 걸맞은 사명감을 나타내므로 「たる者」가 적합합니다.',
        audioText: '医者たる者、患者の命を最優先に考えるべきだ。'
      }
    ]
  }
];
