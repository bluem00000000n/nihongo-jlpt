import { DialogueScenario } from '@/types';

export const dialogueScenarios: DialogueScenario[] = [
  {
    id: 'conv-izakaya',
    title: '도쿄 이자카야에서 주문하기 & 추천 메뉴 묻기',
    level: '초급',
    situation: '일본 현지 이자카야에 들어와 자리에 앉고, 나마비루와 점원 추천 안주를 주문하는 실전 상황입니다.',
    category: '식당/이자카야',
    cultureTip: '이자카야에서는 직원을 부를 때 손을 가볍게 들며 큰 소리로 「すみません！ (스미마센!)」이라고 부르는 것이 기본 매너입니다. 기본 안주로 나오는 오토시(お通し)는 자릿세 개념입니다.',
    lines: [
      {
        id: 'izk-1',
        speaker: '점원',
        isUser: false,
        avatar: '👨‍🍳',
        japanese: 'いらっしゃいませ！何名様でしょうか？',
        romaji: 'Irasshaimase! Nan-mei-sama deshou ka?',
        korean: '어서오세요! 몇 분이신가요?'
      },
      {
        id: 'izk-2',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: '二人です。席は空いていますか？',
        romaji: 'Futari desu. Seki wa aite imasu ka?',
        korean: '두 명입니다. 자리 비어 있나요?',
        roleplayOptions: [
          {
            text: '二人です。席は空いていますか？',
            korean: '두 명입니다. 자리 비어 있나요? (자연스러운 표현)',
            isCorrect: true,
            explanation: '인원수를 묻는 질문에 명확하게 인원(二人: 후타리)을 전달하고 공석 여부를 물어보는 완벽한 표현입니다.'
          },
          {
            text: '一人です、よろしく。',
            korean: '혼자입니다, 잘 부탁해 (어색한 반말)',
            isCorrect: false,
            explanation: '가게 점원에게 처음부터 반말투로 말하는 것은 실례가 될 수 있습니다.'
          }
        ]
      },
      {
        id: 'izk-3',
        speaker: '점원',
        isUser: false,
        avatar: '👨‍🍳',
        japanese: 'はい、こちらのテーブル席へどうぞ。ご注文が決まりましたらお呼びください。',
        romaji: 'Hai, kochira no teeburu-seki e douzo. Gochuumon ga kimarimashitara oyobi kudasai.',
        korean: '네, 이쪽 테이블석으로 오세요. 주문 결정되시면 불러주세요.'
      },
      {
        id: 'izk-4',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'すみません！とりあえず生ビール二つと、おすすめの焼き鳥をお願いします。',
        romaji: 'Sumimasen! Toriaezu nama biiru futatsu to, osusume no yakitori o onegaishimasu.',
        korean: '저기요! 우선 생맥주 두 잔이랑 추천 야키토리 부탁드립니다.',
        roleplayOptions: [
          {
            text: 'すみません！とりあえず生ビール二つと、おすすめの焼き鳥をお願いします。',
            korean: '저기요! 우선 생맥주 두 잔이랑 추천 꼬치 부탁드립니다.',
            isCorrect: true,
            explanation: '「とりあえず(우선은)」와 「おすすめ(추천)」는 일본 이자카야의 핵심 실전 관용구입니다.'
          },
          {
            text: 'ビールをください、それだけ。',
            korean: '맥주 주세요, 그것뿐.',
            isCorrect: false,
            explanation: '너무 단답형이라 다소 차가운 인상을 줍니다.'
          }
        ]
      },
      {
        id: 'izk-5',
        speaker: '점원',
        isUser: false,
        avatar: '👨‍🍳',
        japanese: 'かしこまりました！生ビール二つと、ねぎま・つくねの盛り合わせをご用意いたします。',
        romaji: 'Kashikomarimashita! Nama biiru futatsu to, negima, tsukune no moriawase o go-youi itashimasu.',
        korean: '알겠습니다! 생맥주 두 잔과 파닭꼬치/츠쿠네 모둠으로 준비해 드리겠습니다.'
      },
      {
        id: 'izk-6',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'お会計をお願いします。別々で払えますか？',
        romaji: 'O-kaikei o onegaishimasu. Betsubetsu de haraemasu ka?',
        korean: '계산 부탁드립니다. 각자 따로 계산할 수 있나요?',
        roleplayOptions: [
          {
            text: 'お会計をお願いします。別々で払えますか？',
            korean: '계산 부탁드립니다. 각자 결제 가능한가요?',
            isCorrect: true,
            explanation: '계산할 때 「お会計(오카이케이)」 혹은 「お勘定(오칸죠)」라고 말하며, 더치페이는 「別々(베츠베츠)」라고 합니다.'
          },
          {
            text: 'お金をあげます。',
            korean: '돈을 주겠습니다 (부자연스러운 표현)',
            isCorrect: false,
            explanation: '한국어 직역 느낌으로, 계산 시에는 사용하지 않는 어색한 표현입니다.'
          }
        ]
      }
    ]
  },
  {
    id: 'conv-conbini',
    title: '일본 편의점(로손/세븐/훼미리) 결제 완전 정복',
    level: '초급',
    situation: '일본 편의점에서 도시락과 음료를 사고 봉투 유무, 데우기, 결제 수단을 소통하는 일상 표현입니다.',
    category: '쇼핑/편의점',
    cultureTip: '일본 편의점 비닐봉투는 유료화(약 3~5엔)되었으므로 점원이 반드시 봉투 필요 여부를 묻습니다. 봉투가 필요 없으면 「大丈夫です(다이죠부데스)」라고 하시면 됩니다.',
    lines: [
      {
        id: 'cnb-1',
        speaker: '점원',
        isUser: false,
        avatar: '🏪',
        japanese: 'お次でお待ちのお客様どうぞ！ポイントカードはお持ちですか？',
        romaji: 'Otsugi de omachi no okyaku-sama douzo! Pointo kaado wa omochi desu ka?',
        korean: '다음 기다리시는 손님 오세요! 포인트 카드 가지고 계신가요?'
      },
      {
        id: 'cnb-2',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'ないです。お弁当を温めてもらえますか？',
        romaji: 'Nai desu. Obentou o atatamete moraemasu ka?',
        korean: '없습니다. 도시락 좀 데워 주실 수 있나요?',
        roleplayOptions: [
          {
            text: 'ないです。お弁当を温めてもらえますか？',
            korean: '없습니다. 도시락 좀 데워 주실 수 있나요?',
            isCorrect: true,
            explanation: '도시락 데우기는 「温める(아타타메루)」 동사를 써서 「温めてください」 또는 「温めてもらえますか」라고 정중하게 요청합니다.'
          },
          {
            text: '熱くしてください。',
            korean: '뜨겁게 해주세요 (약간 어색함)',
            isCorrect: false,
            explanation: '전자레인지에 데우는 것은 「温める」가 정확한 동사입니다.'
          }
        ]
      },
      {
        id: 'cnb-3',
        speaker: '점원',
        isUser: false,
        avatar: '🏪',
        japanese: 'かしこまりました。レジ袋はご利用になりますか？',
        romaji: 'Kashikomarimashita. Rejibukuro wa go-riyou ni narimasu ka?',
        korean: '알겠습니다. 비닐봉투 사용하시나요?'
      },
      {
        id: 'cnb-4',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: '袋は大丈夫です。クレジットカードで払います。',
        romaji: 'Fukuro wa daijoubu desu. Kurejitto kaado de haraimasu.',
        korean: '봉투는 괜찮습니다. 신용카드로 결제할게요.',
        roleplayOptions: [
          {
            text: '袋は大丈夫です。クレジットカードで払います。',
            korean: '봉투는 괜찮습니다. 신용카드로 결제할게요.',
            isCorrect: true,
            explanation: '「大丈夫です(다이죠부데스)」는 거절의 뜻으로도 아주 많이 쓰이며, 결제 수단을 명확히 밝힙니다.'
          },
          {
            text: '袋はいらない！',
            korean: '봉투 필요 없어! (너무 공격적 반말)',
            isCorrect: false,
            explanation: '점원에게 반말로 거절하면 무례하게 들릴 수 있습니다.'
          }
        ]
      },
      {
        id: 'cnb-5',
        speaker: '점원',
        isUser: false,
        avatar: '🏪',
        japanese: 'こちらにタッチしてください。レシートご利用ですか？ありがとうございました！',
        romaji: 'Kochira ni tacchi shite kudasai. Reshiito go-riyou desu ka? Arigatou gozaimashita!',
        korean: '여기에 터치해 주세요. 영수증 필요하신가요? 감사합니다!'
      }
    ]
  },
  {
    id: 'conv-hotel',
    title: '호텔 체크인 & 룸 관련 요청하기',
    level: '중급',
    situation: '일본 호텔 프런트에서 예약 확인 후 체크인하고, 짐 보관 및 고층/금연실을 요청하는 실전 상황입니다.',
    category: '호텔',
    cultureTip: '일본 호텔은 흡연실(喫煙室)과 금연실(禁煙室) 구분이 엄격합니다. 비흡연자라면 반드시 「禁煙ルーム(킨엔 루-무)」인지 확인하세요.',
    lines: [
      {
        id: 'htl-1',
        speaker: '프런트 직원',
        isUser: false,
        avatar: '🏨',
        japanese: 'いらっしゃいませ。チェックインでございますね。ご予約のお名前をお願いいたします。',
        romaji: 'Irasshaimase. Chekku-in de gozaimasu ne. Goyoyaku no onamae o onegai itashimasu.',
        korean: '어서오십시오. 체크인이시군요. 예약자 성함을 부탁드립니다.'
      },
      {
        id: 'htl-2',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'パクと申します。アゴダで予約しました。パスポートはこちらです。',
        romaji: 'Paku to moushimasu. Agoda de yoyaku shimashita. Pasupooto wa kochira desu.',
        korean: '박이라고 합니다. 아고다에서 예약했습니다. 여권은 여기 있습니다.',
        roleplayOptions: [
          {
            text: 'パクと申します。アゴダで予約しました。パスポートはこちらです。',
            korean: '박이라고 합니다(겸양). 여권은 여기 있습니다.',
            isCorrect: true,
            explanation: '자신의 이름을 낮추어 말하는 겸양어 「〜と申します(토 모우시마스)」가 매우 교양 있고 자연스럽습니다.'
          },
          {
            text: '私の名前はパクです。部屋をくれ。',
            korean: '내 이름은 박이다. 방을 줘라.',
            isCorrect: false,
            explanation: '어색하고 명령조의 문장입니다.'
          }
        ]
      },
      {
        id: 'htl-3',
        speaker: '프런트 직원',
        isUser: false,
        avatar: '🏨',
        japanese: 'パク様、確認できました。禁煙のスタンダードダブルルームで2泊でございますね。',
        romaji: 'Paku-sama, kakunin dekimashita. Kin-en no sutaandaado daburu ruumu de nihaku de gozaimasu ne.',
        korean: '박 고객님, 확인되었습니다. 금연 스탠다드 더블룸으로 2박 맞으시죠?'
      },
      {
        id: 'htl-4',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'はい、そうです。もし可能なら、景色のいい高層階の部屋にできますか？',
        romaji: 'Hai, sou desu. Moshi kanou nara, keshiki no ii kousoukai no heya ni dekimasu ka?',
        korean: '네, 맞습니다. 혹시 가능하다면 경치 좋은 고층 방으로 변경 가능할까요?',
        roleplayOptions: [
          {
            text: 'はい、そうです。もし可能なら、景色のいい高層階の部屋にできますか？',
            korean: '혹시 가능하다면 전망 좋은 고층 방으로 배정받을 수 있을까요?',
            isCorrect: true,
            explanation: '「もし可能なら(혹시 가능하다면)」라는 완곡한 배려 표현을 앞에 두면 훨씬 정중하게 부탁할 수 있습니다.'
          },
          {
            text: '高い部屋に絶対変えてください。',
            korean: '높은 방으로 무조건 바꿔주세요.',
            isCorrect: false,
            explanation: '무리한 요구처럼 들릴 수 있습니다.'
          }
        ]
      },
      {
        id: 'htl-5',
        speaker: '프런트 직원',
        isUser: false,
        avatar: '🏨',
        japanese: '12階の角部屋をご用意できました。こちらがルームキーと朝食券でございます。',
        romaji: 'Juuni-kai no kadobeya o go-youi dekimashita. Kochira ga ruumu kii to choushoku-ken de gozaimasu.',
        korean: '12층 코너 룸으로 준비해 드렸습니다. 여기 룸 카드키와 조식 쿠폰입니다.'
      }
    ]
  },
  {
    id: 'conv-transit',
    title: '나리타 공항에서 도쿄 도심행 티켓 발권 & 길 묻기',
    level: '중급',
    situation: '공항 티켓 카운터에서 스카이라이너 티켓을 사고 승강장 위치를 물어보는 상황입니다.',
    category: '공항/교통',
    cultureTip: '일본의 전철은 노선이 매우 복잡하므로 개찰구(改札口, 카이사츠구)와 승강장 번호(番線, 반센)를 명확히 묻는 것이 좋습니다.',
    lines: [
      {
        id: 'trn-1',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'すみません、上野までのスカイライナーの指定席を一枚買いたいのですが。',
        romaji: 'Sumimasen, Ueno made no sukairainaa no shiteiseki o ichimai kaitai no desu ga.',
        korean: '실례합니다, 우에노까지 가는 스카이라이너 지정석 1장을 사고 싶은데요.',
        roleplayOptions: [
          {
            text: 'すみません、上野までのスカイライナーの指定席を一枚買いたいのですが。',
            korean: '우에노행 스카이라이너 지정석 1장 구매하고 싶습니다.',
            isCorrect: true,
            explanation: '목적지 + まで(까지) + 〜たいのですが(~하고 싶은데요) 구문은 역에서 티켓 끊을 때의 표준 템플릿입니다.'
          },
          {
            text: '上野に行きたい、チケットを出せ。',
            korean: '우에노 가고 싶다, 표 내놔.',
            isCorrect: false,
            explanation: '명령조의 비문입니다.'
          }
        ]
      },
      {
        id: 'trn-2',
        speaker: '역무원',
        isUser: false,
        avatar: '🧑‍✈️',
        japanese: '14時20分発の列車がございます。窓側と通路側、どちらがよろしいですか？',
        romaji: 'Juuyon-ji nijuu-pun hatsu no ressha ga gozaimasu. Madogawa to tsuurogawa, dochira ga yoroshii desu ka?',
        korean: '14시 20분 출발 열차가 있습니다. 창가 쪽과 통로 쪽 중 어느 쪽이 좋으신가요?'
      },
      {
        id: 'trn-3',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: '窓側でお願いします。乗り場は何番線ですか？',
        romaji: 'Madogawa de onegaishimasu. Noriba wa nan-ban-sen desu ka?',
        korean: '창가 쪽으로 부탁드립니다. 타는 곳은 몇 번 승강장인가요?',
        roleplayOptions: [
          {
            text: '窓側でお願いします。乗り場は何番線ですか？',
            korean: '창가 쪽으로 부탁드립니다. 승강장은 몇 번선인가요?',
            isCorrect: true,
            explanation: '창가(窓側: 마도가와), 타는 곳(乗り場: 노리바), 몇 번선(何番線: 난반센) 필수 어휘의 조합입니다.'
          },
          {
            text: 'どこでもいい。電車はどこ？',
            korean: '어디든 상관없음. 전철은 어디?',
            isCorrect: false,
            explanation: '표현이 너무 거칠고 불친절합니다.'
          }
        ]
      },
      {
        id: 'trn-4',
        speaker: '역무원',
        isUser: false,
        avatar: '🧑‍✈️',
        japanese: 'エスカレーターを降りて右側の1番線です。良いご旅行を！',
        romaji: 'Esukareetaa o orite migigawa no ichi-ban-sen desu. Yoi go-ryokou o!',
        korean: '에스컬레이터를 내려가서 우측 1번 승강장입니다. 즐거운 여행 되세요!'
      }
    ]
  },
  {
    id: 'conv-business',
    title: '비즈니스 첫 미팅 명함 교환 & 인사 (경어 실전)',
    level: '실전',
    situation: '일본 거래처와의 첫 대면 미팅에서 명함을 정중히 건네며 인사하는 비즈니스 일본어 실전입니다.',
    category: '비즈니스',
    cultureTip: '일본에서는 명함을 두 손으로 가슴 높이에서 주고받으며, 상대방 이름의 한자 발음을 확인하는 것이 예의입니다. 명함을 테이블에 올려둘 때는 명함 지갑 위에 올려놓습니다.',
    lines: [
      {
        id: 'biz-1',
        speaker: '거래처 다나카 팀장',
        isUser: false,
        avatar: '💼',
        japanese: '本日はお忙しい中、弊社まで足をお運びいただき誠にありがとうございます。',
        romaji: 'Honjitsu wa o-isogashii naka, heisha made ashi o ohakobi itadaki makoto ni arigatou gozaimasu.',
        korean: '오늘 바쁘신 와중에 당사까지 발걸음해 주셔서 진심으로 감사드립니다.'
      },
      {
        id: 'biz-2',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: 'とんでもございません。こちらこそ、お時間をいただき感謝申し上げます。名刺交換をよろしいでしょうか？',
        romaji: 'Tondemo gozaimasen. Kochira koso, ojikan o itadaki kansha moushiagemasu. Meishi koukan o yoroshii deshou ka?',
        korean: '천만의 말씀입니다. 저야말로 시간을 내어주셔서 감사드립니다. 명함 교환 괜찮으실까요?',
        roleplayOptions: [
          {
            text: 'とんでもございません。こちらこそ、お時間をいただき感謝申し上げます。名刺交換をよろしいでしょうか？',
            korean: '천만의 말씀입니다. 저야말로 시간 내주셔서 감사드립니다. 명함 교환 가능할까요?',
            isCorrect: true,
            explanation: '비즈니스 최상급 완곡 경어 표현입니다.'
          },
          {
            text: 'どういたしまして。名刺を交換しよう！',
            korean: '천만에요. 명함 교환하자! (반말/부적절)',
            isCorrect: false,
            explanation: '비즈니스 파트너에게 반말을 쓰는 것은 중대한 결례입니다.'
          }
        ]
      },
      {
        id: 'biz-3',
        speaker: '거래처 다나카 팀장',
        isUser: false,
        avatar: '💼',
        japanese: '頂戴いたします。グローバル商事の田中と申します。どうぞよろしくお願い申し上げます。',
        romaji: 'Choudai itashimasu. Guroobaru Shouji no Tanaka to moushimasu. Douzo yoroshiku onegai moushiagemasu.',
        korean: '받겠습니다. 글로벌 상사의 다나카라고 합니다. 모쪼록 잘 부탁드리겠습니다.'
      },
      {
        id: 'biz-4',
        speaker: '나 (학습자)',
        isUser: true,
        avatar: '🙋‍♂️',
        japanese: '頂戴いたします。ABCテックのパクと申します。今後ともよろしくお願い申し上げます。',
        romaji: 'Choudai itashimasu. ABC Tekku no Paku to moushimasu. Kongo tomo yoroshiku onegai moushiagemasu.',
        korean: '받겠습니다. ABC테크의 박이라고 합니다. 앞으로도 모쪼록 잘 부탁드립니다.',
        roleplayOptions: [
          {
            text: '頂戴いたします。ABCテックのパクと申します。今後ともよろしくお願い申し上げます。',
            korean: '받겠습니다. ABC테크의 박이라고 합니다. 앞으로도 잘 부탁드립니다.',
            isCorrect: true,
            explanation: '명함을 받을 때는 「頂戴いたします(쵸-다이 이타시마스)」라고 말하며 두 손으로 공손히 받습니다.'
          },
          {
            text: 'サンキュー、よろしく。',
            korean: '땡큐, 잘 부탁해.',
            isCorrect: false,
            explanation: '비즈니스 자리에서는 격식 있는 경어를 써야 합니다.'
          }
        ]
      }
    ]
  }
];
