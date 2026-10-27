import { GrammarItem } from '@/types';

export const grammarData: GrammarItem[] = [
  // ==========================================
  // 【JLPT N5】 기초 입문 문법
  // ==========================================
  {
    id: 'n5-01',
    title: '〜です / 〜ます',
    level: 'N5',
    category: '정중형 종결',
    meaning: '~입니다 / ~합니다',
    connection: '명사/나형용사 + です | 동사 ます형 + ます',
    explanation: '명사나 형용사 뒤에 붙어 정중한 단정을 나타내는 〜です와, 동사 연용형에 붙어 정중한 서술을 나타내는 〜ます입니다. 일본어 회화의 가장 기본이 되는 정중체 표현입니다.',
    examples: [
      {
        id: 'ex-n5-01-1',
        japanese: '私は[韓国](かんこく)의 [大学生](だいがくせい)입니다.',
        romaji: 'Watashi wa kankoku no daigakusei desu.',
        korean: '저는 한국의 대학생입니다.',
        audioText: 'わたしはかんこくのだいがくせいです。',
      },
      {
        id: 'ex-n5-01-2',
        japanese: '毎朝[七時](しちじ)に[起](お)きます。',
        romaji: 'Maiasa shichiji ni okimasu.',
        korean: '매일 아침 7시에 일어납니다.',
        audioText: 'まいあさしちじにおきます。',
      },
      {
        id: 'ex-n5-01-3',
        japanese: '日本語の勉強はとても面白いです。',
        romaji: 'Nihongo no benkyou wa totemo omoshiroi desu.',
        korean: '일본어 공부는 매우 재미있습니다.',
        audioText: 'にほんごのべんきょうはとてもおもしろいです。',
      },
    ],
    quizzes: [
      {
        id: 'q-n5-01-1',
        type: 'fill_blank',
        prompt: '다음 빈칸에 들어갈 가장 알맞은 말은? "私は会社員____。"',
        options: ['です', 'ます', 'でした', 'ません'],
        correctAnswer: 'です',
        explanation: '명사(会社員) 뒤에서 정중한 단정을 나타낼 때는 です를 사용합니다.',
      },
      {
        id: 'q-n5-01-2',
        type: 'fill_blank',
        prompt: '"매일 커피를 마십니다."의 올바른 일본어 표현은?',
        options: ['毎日コーヒーを飲みます。', '毎日コーヒーを飲むです。', '毎日コーヒーを飲んで。', '毎日コーヒーを飲みでした。'],
        correctAnswer: '毎日コーヒーを飲みます。',
        explanation: '동사 飲む의 정중형은 연용형 飲み에 ます가 붙은 飲みます입니다.',
      },
    ],
  },
  {
    id: 'n5-02',
    title: '〜てください',
    level: 'N5',
    category: '부탁 / 요청',
    meaning: '~해 주세요',
    connection: '동사 て형 + ください',
    explanation: '상대방에게 정중하게 행동이나 동작을 부탁하거나 권유할 때 사용합니다. 동사의 て형에 접속합니다.',
    examples: [
      {
        id: 'ex-n5-02-1',
        japanese: 'ここに[名前](なまえ)を[書](か)いてください。',
        romaji: 'Koko ni namae o kaite kudasai.',
        korean: '여기에 이름을 적어 주세요.',
        audioText: 'ここになまえをかいてください。',
      },
      {
        id: 'ex-n5-02-2',
        japanese: 'もう[一度](いちど)[言](い)ってください。',
        romaji: 'Mou ichido itte kudasai.',
        korean: '다시 한 번 말씀해 주세요.',
        audioText: 'もういちどいってください。',
      },
    ],
    quizzes: [
      {
        id: 'q-n5-02-1',
        type: 'fill_blank',
        prompt: '"조금 기다려 주세요"를 일본어로 바르게 나타낸 것은?',
        options: ['ちょっと待ってください。', 'ちょっと待ちてください。', 'ちょっと待つください。', 'ちょっと待たないで。'],
        correctAnswer: 'ちょっと待ってください。',
        explanation: '待つ(기다리다)의 て형은 待って이므로 待ってください가 맞습니다.',
      },
    ],
  },
  {
    id: 'n5-03',
    title: '〜ています',
    level: 'N5',
    category: '진행 및 상태',
    meaning: '~하고 있습니다 / ~해 있습니다',
    connection: '동사 て형 + います',
    explanation: '현재 진행 중인 동작이나, 어떤 동작의 결과가 지속되고 있는 상태를 나타냅니다.',
    examples: [
      {
        id: 'ex-n5-03-1',
        japanese: '今、[日本語](にほんご)を[勉強](べんきょう)しています。',
        romaji: 'Ima, nihongo o benkyou shite imasu.',
        korean: '지금 일본어를 공부하고 있습니다.',
        audioText: 'いま、にほんごをべんきょうしています。',
      },
      {
        id: 'ex-n5-03-2',
        japanese: '私は[東京](とうきょう)に[住](す)んでいます。',
        romaji: 'Watashi wa Toukyou ni sunde imasu.',
        korean: '저는 도쿄에 살고 있습니다.',
        audioText: 'わたしはとうきょうにすんでいます。',
      },
    ],
    quizzes: [
      {
        id: 'q-n5-03-1',
        type: 'fill_blank',
        prompt: '住む(살다)를 이용해 "서울에 살고 있습니다"를 완성하세요.',
        options: ['ソウルに住んでいます。', 'ソウルに住みます。', 'ソウルに住んであります。', 'ソウルに住むです。'],
        correctAnswer: 'ソウルに住んでいます。',
        explanation: '거주 상태를 나타낼 때는 住んでいます를 씁니다.',
      },
    ],
  },
  {
    id: 'n5-04',
    title: '〜たい / 〜たくない',
    level: 'N5',
    category: '희망 및 욕구',
    meaning: '~하고 싶다 / ~하고 싶지 않다',
    connection: '동사 ます형 어간 + たい / たくない',
    explanation: '화자(자신)의 희망이나 욕구를 나타내는 핵심 문형입니다. 목적어 조사로 を 대신 が를 쓸 수도 있습니다.',
    examples: [
      {
        id: 'ex-n5-04-1',
        japanese: '日本へ旅行に行きたいです。',
        romaji: 'Nihon e ryokou ni ikitai desu.',
        korean: '일본으로 여행을 가고 싶습니다.',
        audioText: 'にほんへりょこうにいきたいです。',
      },
      {
        id: 'ex-n5-04-2',
        japanese: '美味しいラーメンが食べたいです。',
        romaji: 'Oishii raamen ga tabetai desu.',
        korean: '맛있는 라면을 먹고 싶어요.',
        audioText: 'おいしいらーめんがたべたいです。',
      },
    ],
    quizzes: [
      {
        id: 'q-n5-04-1',
        type: 'fill_blank',
        prompt: '"영화를 보고 싶습니다"의 알맞은 일본어는?',
        options: ['映画を見たいです。', '映画を見るたいです。', '映画を見てたいです。', '映画が見るたい。'],
        correctAnswer: '映画を見たいです。',
        explanation: '見る의 ます형 어간은 見이므로 見たいです가 됩니다.',
      },
    ],
  },

  // ==========================================
  // 【JLPT N4】 초급 핵심 문법
  // ==========================================
  {
    id: 'n4-01',
    title: '〜てくれる / 〜てもらう / 〜てあげる',
    level: 'N4',
    category: '수수동사 (주고받기)',
    meaning: '~해 주다 / ~받다 / ~해 주다',
    connection: '동사 て형 + くれる / もらう / あげる',
    explanation: '행위의 주고받음을 나타내는 일본어의 가장 대표적인 정중 표현입니다. 특히 남이 나에게 베풀어 줄 때는 〜てくれる를 사용합니다.',
    examples: [
      {
        id: 'ex-n4-01-1',
        japanese: '先生が発音を直してくれました。',
        romaji: 'Sensei ga hatsuon o naoshite kuremashita.',
        korean: '선생님께서 발음을 고쳐 주셨습니다.',
        audioText: 'せんせいがはつおんをなおしてくれました。',
      },
      {
        id: 'ex-n4-01-2',
        japanese: '友人に荷物を持ってもらいました。',
        romaji: 'Yuujin ni nimotsu o motte moraimashita.',
        korean: '친구에게 짐을 들어달라고 했습니다.',
        audioText: 'ゆうじんににもつをもってもらいました。',
      },
    ],
    quizzes: [
      {
        id: 'q-n4-01-1',
        type: 'fill_blank',
        prompt: '"친구가 나에게 선물을 사주었다"에 어울리는 수수동사는?',
        options: ['買ってくれました', '買ってあげました', '買ってもらいました', '買いました'],
        correctAnswer: '買ってくれました',
        explanation: '남이 "나"에게 어떤 친절한 행동을 해줄 때는 くれる를 씁니다.',
      },
    ],
  },
  {
    id: 'n4-02',
    title: '〜なければならない',
    level: 'N4',
    category: '의무 / 필요',
    meaning: '~해야만 한다',
    connection: '동사 ない형 어간 + なければならない',
    explanation: '어떤 일을 마땅히 해야 하거나 법적/도덕적 의무가 있을 때 나타냅니다.',
    examples: [
      {
        id: 'ex-n4-02-1',
        japanese: '明日は朝早く起きなければなりません。',
        romaji: 'Ashita wa asa hayaku okinakereba narimasen.',
        korean: '내일은 아침 일찍 일어나야만 합니다.',
        audioText: 'あしたはあさはやくおきなければなりません。',
      },
    ],
    quizzes: [
      {
        id: 'q-n4-02-1',
        type: 'fill_blank',
        prompt: '行く(가다)를 이용해 "가야만 합니다"를 완성하세요.',
        options: ['行かなければなりません。', '行かないでなりません。', '行かなくてなりません。', '行くなければなりません。'],
        correctAnswer: '行かなければなりません。',
        explanation: '行く의 ない형은 行かない이므로 い를 떼고 ければならない를 붙입니다.',
      },
    ],
  },
  {
    id: 'n4-03',
    title: '〜たら (조건 / 가정)',
    level: 'N4',
    category: '가정 및 조건',
    meaning: '~하면 / ~했더니',
    connection: '동사/형용사 た형 + ら',
    explanation: '미래의 조건이 실현되었을 때(~하면) 또는 과거의 어떤 행동을 한 결과 새로운 사실을 알게 되었을 때(~했더니) 폭넓게 쓰입니다.',
    examples: [
      {
        id: 'ex-n4-03-1',
        japanese: '雨が降ったら、家にいましょう。',
        romaji: 'Ame ga futtara, ie ni imashou.',
        korean: '비가 오면 집에 있읍시다.',
        audioText: 'あめがふったら、いえにいましょう。',
      },
    ],
    quizzes: [
      {
        id: 'q-n4-03-1',
        type: 'fill_blank',
        prompt: '"시간이 있으면 영화 보러 가요"를 바르게 표현한 것은?',
        options: ['時間があったら、映画に行きましょう。', '時間があれば、映画に行きましょう。', '時間があると、映画に行きましょう。', '時間なら、映画に行きましょう。'],
        correctAnswer: '時間があったら、映画に行きましょう。',
        explanation: '상대방에게 권유(〜ましょう)를 뒤에 붙일 수 있는 가장 유연하고 자연스러운 가정문은 〜たら입니다.',
      },
    ],
  },

  // ==========================================
  // 【JLPT N3】 중급 핵심 문법
  // ==========================================
  {
    id: 'n3-01',
    title: '〜わけだ / 〜わけがない',
    level: 'N3',
    category: '당위성 / 논리적 납득',
    meaning: '~한 셈이다(당연하다) / ~일 리가 없다',
    connection: '보통형 + わけだ (나형용사 な/명사 な)',
    explanation: '어떤 원인이나 배경을 듣고 당연하게 납득할 때 〜わけだ를 쓰고, 절대 그럴 리가 없음을 강하게 부정할 때 〜わけがない를 씁니다.',
    examples: [
      {
        id: 'ex-n3-01-1',
        japanese: '日本に五年も住んでいたから、日本語が上手なわけですね。',
        romaji: 'Nihon ni gonen mo sunde ita kara, nihongo ga jouzu na wake desu ne.',
        korean: '일본에 5년이나 살았으니, 일본어를 잘하는 게 당연하군요.',
        audioText: 'にほんにごねんもすんでいたから、にほんごがじょうずなわけですね。',
      },
    ],
    quizzes: [
      {
        id: 'q-n3-01-1',
        type: 'fill_blank',
        prompt: '"어쩐지 춥더라니, 창문이 열려 있었군요"에 알맞은 표현은?',
        options: ['寒いわけだ', '寒いほどだ', '寒いせいだ', '寒いことだ'],
        correctAnswer: '寒いわけだ',
        explanation: '이유를 듣고 납득할 때 "~한 셈이다, 당연하다"는 뜻의 わけだ가 적절합니다.',
      },
    ],
  },
  {
    id: 'n3-02',
    title: '〜おかげで / 〜せいで',
    level: 'N3',
    category: '원인 및 결과',
    meaning: '~덕분에 (긍정) / ~탓에 (부정)',
    connection: '명사 の / 동사 보통형 + おかげで / せいで',
    explanation: '원인으로 인해 좋은 결과가 나왔을 때는 おかげで를, 나쁜 결과나 피해가 생겼을 때는 せいで를 구분해서 씁니다.',
    examples: [
      {
        id: 'ex-n3-02-1',
        japanese: '先生のご指導のおかげで、試験に合格できました。',
        romaji: 'Sensei no goshidou no okage de, shiken ni goukaku dekimashita.',
        korean: '선생님의 지도 덕분에 시험에 합격할 수 있었습니다.',
        audioText: 'せんせいのごしどうのおかげで、しけんにごうかくできました。',
      },
    ],
    quizzes: [
      {
        id: 'q-n3-02-1',
        type: 'fill_blank',
        prompt: '"친구 덕분에 즐거운 여행이 되었습니다"를 바르게 나타낸 것은?',
        options: ['友達のおかげで', '友達のせいで', '友達のために', '友達によって'],
        correctAnswer: '友達のおかげで',
        explanation: '긍정적인 감사 결과이므로 おかげで가 정답입니다.',
      },
    ],
  },

  // ==========================================
  // 【JLPT N2】 상급 비즈니스 문법
  // ==========================================
  {
    id: 'n2-01',
    title: '〜ざるを得ない (ざるをえない)',
    level: 'N2',
    category: '불가피성',
    meaning: '~하지 않을 수 없다 / 어쩔 수 없이 ~하다',
    connection: '동사 ない형 어간 + ざるを得ない (※する ➔ せざるを得ない)',
    explanation: '본인의 진심이나 희망과는 상관없이, 외부 사정이나 상황으로 볼 때 그렇게 할 수밖에 없음을 나타내는 고급 문어체 표현입니다.',
    examples: [
      {
        id: 'ex-n2-01-1',
        japanese: 'これ以上の赤字が続くなら、事業を撤退せざるを得ない。',
        romaji: 'Kore ijou no akaji ga tsuduku nara, jigyou o tettai sezaru o enai.',
        korean: '이 이상의 적자가 계속된다면 사업을 철수하지 않을 수 없다.',
        audioText: 'これいじょうのあかじがつづくなら、じぎょうをてったいせざるをえない。',
      },
    ],
    quizzes: [
      {
        id: 'q-n2-01-1',
        type: 'fill_blank',
        prompt: 'する(하다)를 "하지 않을 수 없다"로 변형한 올바른 형태는?',
        options: ['せざるを得ない', 'しざるを得ない', 'さざるを得ない', 'すざるを得ない'],
        correctAnswer: 'せざるを得ない',
        explanation: 'する의 ざるを得ない 형태는 불규칙으로 せざるを得ない가 됩니다.',
      },
    ],
  },
  {
    id: 'n2-02',
    title: '〜に際して / 〜にあたって',
    level: 'N2',
    category: '공식 행사 및 특별한 시점',
    meaning: '~함에 즈음하여 / ~를 맞이하여',
    connection: '명사 / 동사 사전형 + に際して',
    explanation: '입학, 개업, 계약 등 중요한 특별한 행위나 사건을 시작할 때 사용하는 격식 있는 비즈니스 공식 표현입니다.',
    examples: [
      {
        id: 'ex-n2-02-1',
        japanese: '新サービスの開始に際して、皆様のご意見を伺いたく存じます。',
        romaji: 'Shin saabisu no kaishi ni saishite, minasama no goiken o ukagaitaku zonjimasu.',
        korean: '새 서비스 개시에 즈음하여, 여러분의 의견을 여쭙고자 합니다.',
        audioText: 'しんサービスのかいしにさいして、みなさまのごいけんをうかがいたくぞんじます。',
      },
    ],
    quizzes: [
      {
        id: 'q-n2-02-1',
        type: 'fill_blank',
        prompt: '비즈니스에서 "계약 체결에 즈음하여"를 가장 정중하게 나타낸 것은?',
        options: ['契約の締結に際して', '契約の締結について', '契約の締結によって', '契約の締結にとって'],
        correctAnswer: '契約の締結に際して',
        explanation: '격식 있는 특별한 시점은 に際して를 사용합니다.',
      },
    ],
  },

  // ==========================================
  // 【JLPT N1】 1급 최고급 논설 문법
  // ==========================================
  {
    id: 'n1-01',
    title: '〜たる者 (たるもの)',
    level: 'N1',
    category: '자격 및 사명감',
    meaning: '~답게 / ~의 자격을 가진 자라면 마땅히',
    connection: '명사 + たる者',
    explanation: '사회적 지위, 신분, 전문직 등 높은 책임감이 요구되는 명사 뒤에 붙어 도덕적 당위를 강하게 표현합니다.',
    examples: [
      {
        id: 'ex-n1-01-1',
        japanese: '一国の指導者たる者は、私利私欲を捨てて国民のために尽くすべきだ。',
        romaji: 'Ikkoku no shidousha taru mono wa, shirishiyoku o sutete kokumin no tame ni tsukusubeki da.',
        korean: '한 나라의 지도자라면 마땅히 사리사욕을 버리고 국민을 위해 헌신해야 한다.',
        audioText: 'いっこくのしどうしゃたるものは、しりしよくをすててこくみんのためにつくすべきだ。',
      },
    ],
    quizzes: [
      {
        id: 'q-n1-01-1',
        type: 'fill_blank',
        prompt: '"교육자라면 마땅히 학생들의 모범이 되어야 한다"에 어울리는 N1 문형은?',
        options: ['教育者たる者', '教育者にとって', '教育者として', '教育者なりに'],
        correctAnswer: '教育者たる者',
        explanation: '도덕적 책무와 지위의 사명감을 엄격하게 요구할 때는 N1 문형 〜たる者를 씁니다.',
      },
    ],
  },
  {
    id: 'n1-02',
    title: '〜や否や (やいなや)',
    level: 'N1',
    category: '동시성 / 급격한 동작',
    meaning: '~하자마자 곧바로',
    connection: '동사 사전형 + や否や',
    explanation: '앞의 동작이 일어나자마자 거의 동시에 뒤의 상황이 급격하게 발생함을 나타내는 고난도 문어체 표현입니다.',
    examples: [
      {
        id: 'ex-n1-02-1',
        japanese: 'ベルが鳴るや否や、生徒たちは一斉に教室を飛び出した。',
        romaji: 'Beru ga naru ya ina ya, seitotachi wa issei ni kyoushitsu o tobidashita.',
        korean: '종이 울리자마자 학생들은 일제히 교실을 뛰쳐나갔다.',
        audioText: 'ベルがなるやいなや、せいとたちはいっせいにきょうしつをとびだした。',
      },
    ],
    quizzes: [
      {
        id: 'q-n1-02-1',
        type: 'fill_blank',
        prompt: '"비행기가 착륙하자마자 승객들이 일어섰다"에 알맞은 결합은?',
        options: ['着陸するや否や', '着陸したとたん', '着陸しながら', '着陸次第'],
        correctAnswer: '着陸するや否や',
        explanation: '격식 있는 문어체에서 즉시 발생한 사건은 〜や否や를 사용합니다.',
      },
    ],
  },
  {
    id: 'n1-03',
    title: '〜極まりない (きわまりない)',
    level: 'N1',
    category: '극단적 감정 / 비판',
    meaning: '더할 나위 없이 ~하다 / 극도로 ~하다',
    connection: '나형용사 어간 + 極まりない | 이형용사 사전형 + こと極まりない',
    explanation: '어떤 태도나 사태의 상태가 한계에 달해 극에 달했음을 강조하는 문어적 표현입니다.',
    examples: [
      {
        id: 'ex-n1-03-1',
        japanese: '公の場でそのような無責任な発言をするとは、遺憾極まりない。',
        romaji: 'Ooyake no ba de sono you na musekinin na hatsugen o suru to wa, ikan kiwamarinai.',
        korean: '공적인 자리에서 그런 무책임한 발언을 하다니 유감스럽기 짝이 없다.',
        audioText: 'おおやけのばでそのようなむせきにんなはつげんをするとは、いかんきわまりない。',
      },
    ],
    quizzes: [
      {
        id: 'q-n1-03-1',
        type: 'fill_blank',
        prompt: '불성실함이 극에 달했음을 나타낼 때 올바른 표현은?',
        options: ['不誠実極まりない', '不誠実きわまり', '不誠実だらけ', '不誠実ぎみ'],
        correctAnswer: '不誠実極まりない',
        explanation: '나형용사 어간 뒤에 極まりない가 바로 연결됩니다.',
      },
    ],
  },
  {
    id: 'n1-04',
    title: '〜を余儀なくされる (をよぎなくされる)',
    level: 'N1',
    category: '어쩔 수 없는 강제 상황',
    meaning: '어쩔 수 없이 ~하게 되다 / 부득이 ~하지 않을 수 없게 되다',
    connection: '명사 + を余儀なくされる',
    explanation: '타의나 천재지변 등에 의해 본인의 의사와 무관하게 힘든 선택이나 변경을 강요당함을 나타냅니다.',
    examples: [
      {
        id: 'ex-n1-04-1',
        japanese: '長引く不況の影響で、老舗ホテルの閉館を余儀なくされた。',
        romaji: 'Nagabiku fukyou no eikyou de, shinise hoteru no heikan o yogi naku sareta.',
        korean: '장기화된 불황의 영향으로 유서 깊은 호텔의 폐관을 부득이 겪지 않을 수 없었다.',
        audioText: 'ながびくふきょうのえいきょうで、しにせホテルのへいかんをよぎなくされた。',
      },
    ],
    quizzes: [
      {
        id: 'q-n1-04-1',
        type: 'fill_blank',
        prompt: '"계획의 대폭적인 변경을 피할 수 없게 되었다"의 올바른 표현은?',
        options: ['計画の変更を余儀なくされた', '計画の変更を強いられた', '計画の変更になった', '計画の変更をせざるを得ない'],
        correctAnswer: '計画の変更を余儀なくされた',
        explanation: '명사 뒤에 붙어 부득이 겪게 됨을 나타내는 N1 핵심 숙어는 を余儀なくされる입니다.',
      },
    ],
  },
];
