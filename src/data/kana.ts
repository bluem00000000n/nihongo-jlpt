import { KanaCharacter } from '@/types';

export const hiraganaData: KanaCharacter[] = [
  // A row
  { kana: 'あ', romaji: 'a', type: 'hiragana', group: 'basic', row: 'a', koreanPronunciation: '아', exampleWord: { word: 'あさ (아침)', meaning: '아침' } },
  { kana: 'い', romaji: 'i', type: 'hiragana', group: 'basic', row: 'a', koreanPronunciation: '이', exampleWord: { word: 'いぬ (개)', meaning: '강아지' } },
  { kana: 'う', romaji: 'u', type: 'hiragana', group: 'basic', row: 'a', koreanPronunciation: '우', exampleWord: { word: 'うみ (바다)', meaning: '바다' } },
  { kana: 'え', romaji: 'e', type: 'hiragana', group: 'basic', row: 'a', koreanPronunciation: '에', exampleWord: { word: 'えき (역)', meaning: '기차역' } },
  { kana: 'お', romaji: 'o', type: 'hiragana', group: 'basic', row: 'a', koreanPronunciation: '오', exampleWord: { word: 'お茶 (차)', meaning: '녹차/차' } },

  // Ka row
  { kana: 'か', romaji: 'ka', type: 'hiragana', group: 'basic', row: 'ka', koreanPronunciation: '카', exampleWord: { word: 'かさ (우산)', meaning: '우산' } },
  { kana: 'き', romaji: 'ki', type: 'hiragana', group: 'basic', row: 'ka', koreanPronunciation: '키', exampleWord: { word: 'き (나무)', meaning: '나무' } },
  { kana: 'く', romaji: 'ku', type: 'hiragana', group: 'basic', row: 'ka', koreanPronunciation: '쿠', exampleWord: { word: 'くるま (자동차)', meaning: '차' } },
  { kana: 'け', romaji: 'ke', type: 'hiragana', group: 'basic', row: 'ka', koreanPronunciation: '케', exampleWord: { word: 'けさ (오늘아침)', meaning: '오늘 아침' } },
  { kana: 'こ', romaji: 'ko', type: 'hiragana', group: 'basic', row: 'ka', koreanPronunciation: '코', exampleWord: { word: 'こども (아이)', meaning: '어린이' } },

  // Sa row
  { kana: 'さ', romaji: 'sa', type: 'hiragana', group: 'basic', row: 'sa', koreanPronunciation: '사', exampleWord: { word: 'さかな (생선)', meaning: '물고기' } },
  { kana: 'し', romaji: 'shi', type: 'hiragana', group: 'basic', row: 'sa', koreanPronunciation: '시', exampleWord: { word: 'しんぶん (신문)', meaning: '신문' } },
  { kana: 'す', romaji: 'su', type: 'hiragana', group: 'basic', row: 'sa', koreanPronunciation: '스', exampleWord: { word: 'すし (스시)', meaning: '초밥' } },
  { kana: 'せ', romaji: 'se', type: 'hiragana', group: 'basic', row: 'sa', koreanPronunciation: '세', exampleWord: { word: 'せんせい (선생님)', meaning: '교사' } },
  { kana: 'そ', romaji: 'so', type: 'hiragana', group: 'basic', row: 'sa', koreanPronunciation: '소', exampleWord: { word: 'そら (하늘)', meaning: '하늘' } },

  // Ta row
  { kana: 'た', romaji: 'ta', type: 'hiragana', group: 'basic', row: 'ta', koreanPronunciation: '타', exampleWord: { word: 'たまご (계란)', meaning: '달걀' } },
  { kana: 'ち', romaji: 'chi', type: 'hiragana', group: 'basic', row: 'ta', koreanPronunciation: '치', exampleWord: { word: 'ちず (지도)', meaning: '지도' } },
  { kana: 'つ', romaji: 'tsu', type: 'hiragana', group: 'basic', row: 'ta', koreanPronunciation: '츠', exampleWord: { word: 'つくえ (책상)', meaning: '책상' } },
  { kana: 'て', romaji: 'te', type: 'hiragana', group: 'basic', row: 'ta', koreanPronunciation: '테', exampleWord: { word: 'てがみ (편지)', meaning: '편지' } },
  { kana: 'と', romaji: 'to', type: 'hiragana', group: 'basic', row: 'ta', koreanPronunciation: '토', exampleWord: { word: 'ともだち (친구)', meaning: '친구' } },

  // Na row
  { kana: 'な', romaji: 'na', type: 'hiragana', group: 'basic', row: 'na', koreanPronunciation: '나', exampleWord: { word: 'なつ (여름)', meaning: '여름' } },
  { kana: 'に', romaji: 'ni', type: 'hiragana', group: 'basic', row: 'na', koreanPronunciation: '니', exampleWord: { word: 'にく (고기)', meaning: '육류' } },
  { kana: 'ぬ', romaji: 'nu', type: 'hiragana', group: 'basic', row: 'na', koreanPronunciation: '누', exampleWord: { word: 'ぬいぐるみ (인형)', meaning: '봉제인형' } },
  { kana: 'ね', romaji: 'ne', type: 'hiragana', group: 'basic', row: 'na', koreanPronunciation: '네', exampleWord: { word: 'ねこ (고양이)', meaning: '고양이' } },
  { kana: 'の', romaji: 'no', type: 'hiragana', group: 'basic', row: 'na', koreanPronunciation: '노', exampleWord: { word: 'のみもの (음료)', meaning: '마실 것' } },

  // Ha row
  { kana: 'は', romaji: 'ha', type: 'hiragana', group: 'basic', row: 'ha', koreanPronunciation: '하', exampleWord: { word: 'はな (꽃)', meaning: '꽃' } },
  { kana: 'ひ', romaji: 'hi', type: 'hiragana', group: 'basic', row: 'ha', koreanPronunciation: '히', exampleWord: { word: 'ひかり (빛)', meaning: '빛' } },
  { kana: 'ふ', romaji: 'fu', type: 'hiragana', group: 'basic', row: 'ha', koreanPronunciation: '후', exampleWord: { word: 'ふね (배)', meaning: '선박' } },
  { kana: 'へ', romaji: 'he', type: 'hiragana', group: 'basic', row: 'ha', koreanPronunciation: '헤', exampleWord: { word: 'へや (방)', meaning: '방' } },
  { kana: 'ほ', romaji: 'ho', type: 'hiragana', group: 'basic', row: 'ha', koreanPronunciation: '호', exampleWord: { word: 'ほし (별)', meaning: '별' } },

  // Ma row
  { kana: 'ま', romaji: 'ma', type: 'hiragana', group: 'basic', row: 'ma', koreanPronunciation: '마', exampleWord: { word: 'まち (도시)', meaning: '마을/거리' } },
  { kana: 'み', romaji: 'mi', type: 'hiragana', group: 'basic', row: 'ma', koreanPronunciation: '미', exampleWord: { word: 'みず (물)', meaning: '물' } },
  { kana: 'む', romaji: 'mu', type: 'hiragana', group: 'basic', row: 'ma', koreanPronunciation: '무', exampleWord: { word: 'むし (벌레)', meaning: '곤충' } },
  { kana: 'め', romaji: 'me', type: 'hiragana', group: 'basic', row: 'ma', koreanPronunciation: '메', exampleWord: { word: 'めがね (안경)', meaning: '안경' } },
  { kana: 'も', romaji: 'mo', type: 'hiragana', group: 'basic', row: 'ma', koreanPronunciation: '모', exampleWord: { word: 'もり (숲)', meaning: '숲' } },

  // Ya row
  { kana: 'や', romaji: 'ya', type: 'hiragana', group: 'basic', row: 'ya', koreanPronunciation: '야', exampleWord: { word: 'やま (산)', meaning: '산' } },
  { kana: 'ゆ', romaji: 'yu', type: 'hiragana', group: 'basic', row: 'ya', koreanPronunciation: '유', exampleWord: { word: 'ゆき (눈)', meaning: '내리는 눈' } },
  { kana: 'よ', romaji: 'yo', type: 'hiragana', group: 'basic', row: 'ya', koreanPronunciation: '요', exampleWord: { word: 'よる (밤)', meaning: '밤' } },

  // Ra row
  { kana: 'ら', romaji: 'ra', type: 'hiragana', group: 'basic', row: 'ra', koreanPronunciation: '라', exampleWord: { word: 'らいおん (사자)', meaning: '사자' } },
  { kana: 'り', romaji: 'ri', type: 'hiragana', group: 'basic', row: 'ra', koreanPronunciation: '리', exampleWord: { word: 'りんご (사과)', meaning: '사과' } },
  { kana: 'る', romaji: 'ru', type: 'hiragana', group: 'basic', row: 'ra', koreanPronunciation: '루', exampleWord: { word: 'るす (부재중)', meaning: '집을 비움' } },
  { kana: 'れ', romaji: 're', type: 'hiragana', group: 'basic', row: 'ra', koreanPronunciation: '레', exampleWord: { word: 'れきし (역사)', meaning: '역사' } },
  { kana: 'ろ', romaji: 'ro', type: 'hiragana', group: 'basic', row: 'ra', koreanPronunciation: '로', exampleWord: { word: 'ろうそく (양초)', meaning: '촛불' } },

  // Wa & N
  { kana: 'わ', romaji: 'wa', type: 'hiragana', group: 'basic', row: 'wa', koreanPronunciation: '와', exampleWord: { word: 'わたし (나)', meaning: '저, 나' } },
  { kana: 'を', romaji: 'wo', type: 'hiragana', group: 'basic', row: 'wa', koreanPronunciation: '오/워', exampleWord: { word: 'お茶を飲む', meaning: '~을/를 (목적격 조사)' } },
  { kana: 'ん', romaji: 'n', type: 'hiragana', group: 'basic', row: 'wa', koreanPronunciation: '응(받침)', exampleWord: { word: 'ほん (책)', meaning: '책' } },
];

export const katakanaData: KanaCharacter[] = [
  { kana: 'ア', romaji: 'a', type: 'katakana', group: 'basic', row: 'a', koreanPronunciation: '아', exampleWord: { word: 'アイス (아이스)', meaning: '아이스크림' } },
  { kana: 'イ', romaji: 'i', type: 'katakana', group: 'basic', row: 'a', koreanPronunciation: '이', exampleWord: { word: 'インク (잉크)', meaning: '잉크' } },
  { kana: 'ウ', romaji: 'u', type: 'katakana', group: 'basic', row: 'a', koreanPronunciation: '우', exampleWord: { word: 'ウール (울)', meaning: '양모' } },
  { kana: 'エ', romaji: 'e', type: 'katakana', group: 'basic', row: 'a', koreanPronunciation: '에', exampleWord: { word: 'エアコン (에어컨)', meaning: '에어컨' } },
  { kana: 'オ', romaji: 'o', type: 'katakana', group: 'basic', row: 'a', koreanPronunciation: '오', exampleWord: { word: 'オレンジ (오렌지)', meaning: '오렌지' } },

  { kana: 'カ', romaji: 'ka', type: 'katakana', group: 'basic', row: 'ka', koreanPronunciation: '카', exampleWord: { word: 'カメラ (카메라)', meaning: '카메라' } },
  { kana: 'キ', romaji: 'ki', type: 'katakana', group: 'basic', row: 'ka', koreanPronunciation: '키', exampleWord: { word: 'キーボード', meaning: '키보드' } },
  { kana: 'ク', romaji: 'ku', type: 'katakana', group: 'basic', row: 'ka', koreanPronunciation: '쿠', exampleWord: { word: 'クラス (클래스)', meaning: '학급/반' } },
  { kana: 'ケ', romaji: 'ke', type: 'katakana', group: 'basic', row: 'ka', koreanPronunciation: '케', exampleWord: { word: 'ケーキ (케이크)', meaning: '케이크' } },
  { kana: 'コ', romaji: 'ko', type: 'katakana', group: 'basic', row: 'ka', koreanPronunciation: '코', exampleWord: { word: 'コーヒー (커피)', meaning: '커피' } },

  { kana: 'サ', romaji: 'sa', type: 'katakana', group: 'basic', row: 'sa', koreanPronunciation: '사', exampleWord: { word: 'サラダ (샐러드)', meaning: '샐러드' } },
  { kana: 'シ', romaji: 'shi', type: 'katakana', group: 'basic', row: 'sa', koreanPronunciation: '시', exampleWord: { word: 'シャツ (셔츠)', meaning: '셔츠' } },
  { kana: 'ス', romaji: 'su', type: 'katakana', group: 'basic', row: 'sa', koreanPronunciation: '스', exampleWord: { word: 'スポーツ', meaning: '스포츠' } },
  { kana: 'セ', romaji: 'se', type: 'katakana', group: 'basic', row: 'sa', koreanPronunciation: '세', exampleWord: { word: 'センター', meaning: '센터' } },
  { kana: 'ソ', romaji: 'so', type: 'katakana', group: 'basic', row: 'sa', koreanPronunciation: '소', exampleWord: { word: 'ソファ (소파)', meaning: '소파' } },

  { kana: 'タ', romaji: 'ta', type: 'katakana', group: 'basic', row: 'ta', koreanPronunciation: '타', exampleWord: { word: 'タクシー', meaning: '택시' } },
  { kana: 'チ', romaji: 'chi', type: 'katakana', group: 'basic', row: 'ta', koreanPronunciation: '치', exampleWord: { word: 'チーズ (치즈)', meaning: '치즈' } },
  { kana: 'ツ', romaji: 'tsu', type: 'katakana', group: 'basic', row: 'ta', koreanPronunciation: '츠', exampleWord: { word: 'ツアー (투어)', meaning: '여행' } },
  { kana: 'テ', romaji: 'te', type: 'katakana', group: 'basic', row: 'ta', koreanPronunciation: '테', exampleWord: { word: 'テレビ (테레비)', meaning: 'TV' } },
  { kana: 'ト', romaji: 'to', type: 'katakana', group: 'basic', row: 'ta', koreanPronunciation: '토', exampleWord: { word: 'トイレ (토이레)', meaning: '화장실' } },

  { kana: 'ナ', romaji: 'na', type: 'katakana', group: 'basic', row: 'na', koreanPronunciation: '나', exampleWord: { word: 'ナイフ (나이프)', meaning: '칼' } },
  { kana: 'ニ', romaji: 'ni', type: 'katakana', group: 'basic', row: 'na', koreanPronunciation: '니', exampleWord: { word: 'ニュース', meaning: '뉴스' } },
  { kana: 'ヌ', romaji: 'nu', type: 'katakana', group: 'basic', row: 'na', koreanPronunciation: '누', exampleWord: { word: 'ヌードル', meaning: '면요리' } },
  { kana: 'ネ', romaji: 'ne', type: 'katakana', group: 'basic', row: 'na', koreanPronunciation: '네', exampleWord: { word: 'ネクタイ', meaning: '넥타이' } },
  { kana: 'ノ', romaji: 'no', type: 'katakana', group: 'basic', row: 'na', koreanPronunciation: '노', exampleWord: { word: 'ノート (노트)', meaning: '공책' } },

  { kana: 'ハ', romaji: 'ha', type: 'katakana', group: 'basic', row: 'ha', koreanPronunciation: '하', exampleWord: { word: 'ハンバーガー', meaning: '햄버거' } },
  { kana: 'ヒ', romaji: 'hi', type: 'katakana', group: 'basic', row: 'ha', koreanPronunciation: '히', exampleWord: { word: 'ホテル (호텔)', meaning: '호텔' } },
  { kana: 'フ', romaji: 'fu', type: 'katakana', group: 'basic', row: 'ha', koreanPronunciation: '후', exampleWord: { word: 'フォーク', meaning: '포크' } },
  { kana: 'ヘ', romaji: 'he', type: 'katakana', group: 'basic', row: 'ha', koreanPronunciation: '헤', exampleWord: { word: 'ヘルメット', meaning: '헬멧' } },
  { kana: 'ホ', romaji: 'ho', type: 'katakana', group: 'basic', row: 'ha', koreanPronunciation: '호', exampleWord: { word: 'ホット (핫)', meaning: '따뜻한' } },

  { kana: 'マ', romaji: 'ma', type: 'katakana', group: 'basic', row: 'ma', koreanPronunciation: '마', exampleWord: { word: 'マスク (마스크)', meaning: '마스크' } },
  { kana: 'ミ', romaji: 'mi', type: 'katakana', group: 'basic', row: 'ma', koreanPronunciation: '미', exampleWord: { word: 'ミルク (밀크)', meaning: '우유' } },
  { kana: 'ム', romaji: 'mu', type: 'katakana', group: 'basic', row: 'ma', koreanPronunciation: '무', exampleWord: { word: 'ムービー', meaning: '영화' } },
  { kana: 'メ', romaji: 'me', type: 'katakana', group: 'basic', row: 'ma', koreanPronunciation: '메', exampleWord: { word: 'メニュー', meaning: '메뉴판' } },
  { kana: 'モ', romaji: 'mo', type: 'katakana', group: 'basic', row: 'ma', koreanPronunciation: '모', exampleWord: { word: 'モデル (모델)', meaning: '모델' } },

  { kana: 'ヤ', romaji: 'ya', type: 'katakana', group: 'basic', row: 'ya', koreanPronunciation: '야', exampleWord: { word: 'ヤード', meaning: '야드' } },
  { kana: 'ユ', romaji: 'yu', type: 'katakana', group: 'basic', row: 'ya', koreanPronunciation: '유', exampleWord: { word: 'ユーモア', meaning: '유머' } },
  { kana: 'ヨ', romaji: 'yo', type: 'katakana', group: 'basic', row: 'ya', koreanPronunciation: '요', exampleWord: { word: 'ヨーグルト', meaning: '요거트' } },

  { kana: 'ラ', romaji: 'ra', type: 'katakana', group: 'basic', row: 'ra', koreanPronunciation: '라', exampleWord: { word: 'ラジオ (라디오)', meaning: '라디오' } },
  { kana: 'リ', romaji: 'ri', type: 'katakana', group: 'basic', row: 'ra', koreanPronunciation: '리', exampleWord: { word: 'リーダー', meaning: '리더' } },
  { kana: 'ル', romaji: 'ru', type: 'katakana', group: 'basic', row: 'ra', koreanPronunciation: '루', exampleWord: { word: 'ルール (룰)', meaning: '규칙' } },
  { kana: 'レ', romaji: 're', type: 'katakana', group: 'basic', row: 'ra', koreanPronunciation: '레', exampleWord: { word: 'レストラン', meaning: '레스토랑' } },
  { kana: 'ロ', romaji: 'ro', type: 'katakana', group: 'basic', row: 'ra', koreanPronunciation: '로', exampleWord: { word: 'ロッカー', meaning: '사물함' } },

  { kana: 'ワ', romaji: 'wa', type: 'katakana', group: 'basic', row: 'wa', koreanPronunciation: '와', exampleWord: { word: 'ワイン (와인)', meaning: '포도주' } },
  { kana: 'ヲ', romaji: 'wo', type: 'katakana', group: 'basic', row: 'wa', koreanPronunciation: '오', exampleWord: { word: 'ヲ (표기용)', meaning: '조사 ヲ' } },
  { kana: 'ン', romaji: 'n', type: 'katakana', group: 'basic', row: 'wa', koreanPronunciation: '응', exampleWord: { word: 'パン (빵)', meaning: '빵' } },
];
