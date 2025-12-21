import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, DollarSign, Package, XCircle, Sun, Cloud, CloudRain, TrendingUp, TrendingDown, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

const LemonadeStandGame = () => {
  // ゲーム状態
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(1000);
  const [initialCash] = useState(1000);
  const [inventory, setInventory] = useState({ lemon: 20, sugar: 10 });
  const [price, setPrice] = useState(100);
  const [sales, setSales] = useState(0);
  const [cost, setCost] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const [satisfactionCount, setSatisfactionCount] = useState(0);
  const [time, setTime] = useState(9);
  const [weather, setWeather] = useState('sunny');
  const [temperature, setTemperature] = useState(28);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [customerStats, setCustomerStats] = useState({});
  const [reputation, setReputation] = useState(3);
  const [showDetail, setShowDetail] = useState(false);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showGlossary, setShowGlossary] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [todayLearning, setTodayLearning] = useState('');
  const nextCustomerId = useRef(0);
  const synthRef = useRef(null);

  // 音声合成の初期化
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // 音声読み上げ関数
  const speak = (text) => {
    if (!soundEnabled || !synthRef.current) return;
    
    synthRef.current.cancel(); // 前の音声をキャンセル
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    synthRef.current.speak(utterance);
  };

  // 効果音関数
  const playSoundEffect = (type) => {
    if (!soundEnabled) return;
    
    try {
      const synth = new Tone.Synth().toDestination();
      
      switch(type) {
        case 'sell':
          // チャリーン（売れた音）
          synth.triggerAttackRelease('C5', '0.1');
          setTimeout(() => synth.triggerAttackRelease('E5', '0.1'), 100);
          break;
        case 'vip':
          // キラキラ（VIP音）
          synth.triggerAttackRelease('C6', '0.1');
          setTimeout(() => synth.triggerAttackRelease('E6', '0.1'), 100);
          setTimeout(() => synth.triggerAttackRelease('G6', '0.1'), 200);
          break;
        case 'angry':
          // ブー（クレーマー音）
          synth.triggerAttackRelease('A2', '0.3');
          break;
        case 'button':
          // ピコン（ボタン音）
          synth.triggerAttackRelease('C5', '0.05');
          break;
        case 'purchase':
          // ポロン（仕入れ音）
          synth.triggerAttackRelease('G4', '0.1');
          setTimeout(() => synth.triggerAttackRelease('C5', '0.1'), 100);
          break;
        case 'close':
          // 終了音
          synth.triggerAttackRelease('C5', '0.2');
          setTimeout(() => synth.triggerAttackRelease('G4', '0.2'), 200);
          setTimeout(() => synth.triggerAttackRelease('C4', '0.3'), 400);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('Sound effect error:', error);
    }
  };

  // 用語集データ
  const glossary = {
    '売上': {
      title: '💰 売上（うりあげ）',
      description: '商品を売って得たお金のこと。レモネードを売った金額の合計だよ！',
      example: '例：100円のレモネードを10個売ったら、売上は1,000円'
    },
    '費用': {
      title: '💸 費用（ひよう）',
      description: '商品を作るのに使ったお金のこと。レモンや砂糖の仕入れ代だよ！',
      example: '例：レモン10個400円、砂糖5袋200円で、費用は600円'
    },
    '利益': {
      title: '✨ 利益（りえき）',
      description: '売上から費用を引いた、実際に儲かったお金。これが増えると嬉しい！',
      example: '例：売上1,500円 - 費用600円 = 利益900円'
    },
    '現金': {
      title: '💵 現金（げんきん）',
      description: '今、手元にある使えるお金。これがないと仕入れができないよ！',
      example: '例：最初は1,000円持ってスタート'
    },
    '在庫': {
      title: '📦 在庫（ざいこ）',
      description: 'まだ売ってない材料のこと。レモンと砂糖の価値をお金に換算したもの',
      example: '例：レモン10個（400円分）+ 砂糖5袋（200円分）= 在庫600円'
    },
    '資産': {
      title: '🏦 資産（しさん）',
      description: 'お店が持っているもの全部。現金と在庫を合わせたものだよ！',
      example: '例：現金2,400円 + 在庫300円 = 資産2,700円'
    },
    '純資産': {
      title: '🏆 純資産（じゅんしさん）',
      description: 'お店の本当の価値。借金がない場合は資産と同じだよ！',
      example: '例：資産2,700円 - 借金0円 = 純資産2,700円'
    },
    'PL': {
      title: '📊 PL（損益計算書）',
      description: 'プロフィット・アンド・ロス。1日でどれだけ儲かったかを見る表だよ！',
      example: '売上 - 費用 = 利益 を計算する'
    },
    'BS': {
      title: '⚖️ BS（貸借対照表）',
      description: 'バランスシート。今、お店が何を持っているかを見る表だよ！',
      example: '資産（現金+在庫）と純資産のバランスを見る'
    }
  };

  // チュートリアルステップ
  const tutorialSteps = [
    {
      title: 'ようこそ！🏪',
      text: 'レモネードスタンドへようこそ！ねこ店長だよ。一緒に経営を学ぼう！',
      voice: 'ようこそ！レモネードスタンドへようこそ！ねこ店長だよ。一緒に経営を学ぼう！'
    },
    {
      title: 'お店の仕組み 🍋',
      text: 'お客さんが来たら、レモンと砂糖を使ってレモネードを作って売るよ！',
      voice: 'お客さんが来たら、レモンと砂糖を使ってレモネードを作って売るよ！'
    },
    {
      title: '大事な計算式 📝',
      text: '売上 から 費用 を引くと 利益 になるよ！これが経営の基本だ！',
      voice: '売上 から 費用 を引くと 利益 になるよ！これが経営の基本だ！'
    },
    {
      title: 'お金の管理 💰',
      text: '現金が減ったら仕入れができない。在庫が減ったら売れない。バランスが大事！',
      voice: '現金が減ったら仕入れができない。在庫が減ったら売れない。バランスが大事！'
    },
    {
      title: 'さあ、始めよう！ 🎉',
      text: '困ったら「？」マークを押して用語を確認してね。頑張ろう！',
      voice: '困ったら、はてなマークを押して用語を確認してね。頑張ろう！'
    }
  ];

  // チュートリアル自動読み上げ
  useEffect(() => {
    if (showTutorial && tutorialStep < tutorialSteps.length) {
      speak(tutorialSteps[tutorialStep].voice);
    }
  }, [tutorialStep, showTutorial]);

  // お客さんのタイプ
  const customerTypes = {
    basic: [
      { emoji: '👨', name: 'サラリーマン', speed: 1.8, buyRate: 0.8, count: 1, speech: ['ください！', '急いでるんで！', '1つ！'], timePreference: 'morning' },
      { emoji: '👩', name: 'OL', speed: 1.2, buyRate: 0.6, count: 1, speech: ['おいしそう', 'これください', '迷うな...'], timePreference: 'noon' },
      { emoji: '👦', name: '子ども', speed: 0.9, buyRate: 0.9, count: 1, speech: ['わーい！', 'おいしそう！', 'やったー！'], timePreference: 'afternoon' },
      { emoji: '👵', name: 'おばあちゃん', speed: 0.6, buyRate: 0.5, count: 1, speech: ['どれどれ...', '高いわねぇ', 'まあまあ'], timePreference: 'all', tip: true }
    ],
    special: [
      { emoji: '👨‍💼', name: '社長', speed: 1.2, buyRate: 0.7, count: 3, speech: ['3つ！', 'みんなの分も！', '全部で3つね'], timePreference: 'all', priceIgnore: true },
      { emoji: '🏃', name: 'ランナー', speed: 2.4, buyRate: 0.95, count: 2, speech: ['水分！', '助かった！', 'のどカラカラ！'], timePreference: 'all', needHot: true },
      { emoji: '👨‍👩‍👧‍👦', name: '家族', speed: 0.9, buyRate: 0.8, count: 4, speech: ['家族の分ね', 'みんなで乾杯！', '4つください'], timePreference: 'afternoon', weekend: true }
    ],
    rare: [
      { emoji: '⭐️', name: 'VIP客', speed: 1.2, buyRate: 1.0, count: 5, speech: ['全部ちょうだい！', '最高！', '素晴らしい！'], timePreference: 'all', sparkle: true, tip: 50 },
      { emoji: '😤', name: 'クレーマー', speed: 0.8, buyRate: 0.3, count: 1, speech: ['まずい！', '高すぎ！', '二度と来ない！'], timePreference: 'all', negative: true }
    ],
    superRare: [
      { emoji: '👑', name: '王様', speed: 1.0, buyRate: 1.0, count: 10, speech: ['余が買い占める！', '全部だ！', '金なら腐るほどある'], timePreference: 'all', sparkle: true, tip: 500, priceIgnore: true },
      { emoji: '🎭', name: 'インフルエンサー', speed: 1.3, buyRate: 0.8, count: 3, speech: ['SNSに載せよ！', 'バズる予感！', 'フォロワーに紹介！'], timePreference: 'all', reputationBoost: 2 },
      { emoji: '🧙‍♂️', name: '魔法使い', speed: 0.7, buyRate: 0.9, count: 2, speech: ['魔力が回復する！', '魔法の味じゃ！', 'レシピを教えよ'], timePreference: 'all', mystical: true, tip: 100 },
      { emoji: '👽', name: '宇宙人', speed: 2.0, buyRate: 0.7, count: 7, speech: ['地球の飲み物！', 'ピピピ！', '母星に持ち帰る'], timePreference: 'all', alien: true, priceIgnore: true },
      { emoji: '🐉', name: 'ドラゴン', speed: 0.5, buyRate: 1.0, count: 15, speech: ['喉が渇いた！', '火を吹きそうだ', '全部よこせ！'], timePreference: 'all', sparkle: true, tip: 1000, priceIgnore: true, rare: 0.001 }
    ]
  };

  useEffect(() => {
    const weathers = ['sunny', 'sunny', 'cloudy', 'rainy'];
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    setTemperature(Math.floor(Math.random() * 10) + 23);
    setDayOfWeek(((day - 1) % 7) + 1);
    
    // 今日の学びを設定
    const learnings = [
      '売上が増えても、費用が多いと利益は少なくなるよ',
      '在庫は資産だけど、売らないとお金にならないよ',
      '現金が減ると仕入れができないから、お金の管理が大事！',
      '天気が良いとお客さんが増えるよ',
      '値段を下げるとお客さんは増えるけど、利益は減るかも',
      '口コミ評価が高いと、次の日のお客さんが増えるよ'
    ];
    setTodayLearning(learnings[Math.floor(Math.random() * learnings.length)]);
  }, [day]);

  useEffect(() => {
    if (!isOpen || showResult) return;
    const timeInterval = setInterval(() => {
      setTime(prev => {
        if (prev >= 18) {
          handleClose();
          return 18;
        }
        return prev + 0.5;
      });
    }, 3000);
    return () => clearInterval(timeInterval);
  }, [isOpen, showResult]);

  useEffect(() => {
    if (!isOpen || showResult) return;

    const getCustomerInterval = () => {
      let baseInterval = 1000; // 200から1000に（1/5に減速）
      if (reputation >= 4) baseInterval *= 0.8;
      if (reputation <= 2) baseInterval *= 1.2;
      if (weather === 'rainy') return baseInterval * 2.5;
      if (weather === 'cloudy') return baseInterval * 1.5;
      return baseInterval;
    };

    const interval = setInterval(() => {
      const timeOfDay = time < 12 ? 'morning' : time < 16 ? 'noon' : 'afternoon';
      const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
      
      let availableTypes = [...customerTypes.basic];
      
      if (temperature >= 28) availableTypes.push(customerTypes.special[1]);
      if (isWeekend) availableTypes.push(customerTypes.special[2]);
      availableTypes.push(customerTypes.special[0]);

      if (Math.random() < 0.05 && reputation >= 4) {
        availableTypes.push(customerTypes.rare[0]);
      }
      if (Math.random() < 0.03) {
        availableTypes.push(customerTypes.rare[1]);
      }

      if (Math.random() < 0.1 && regularCustomers.length > 0) {
        const regular = regularCustomers[Math.floor(Math.random() * regularCustomers.length)];
        const newCustomer = {
          id: nextCustomerId.current++,
          ...regular,
          position: 100,
          scale: 0.5,
          showBubble: false,
          bought: false,
          bubbleTimer: 0,
          isRegular: true,
          speech: ['いつもの！', '今日もよろしく！', 'また来たよ！']
        };
        setCustomers(prev => [...prev, newCustomer]);
        return;
      }

      availableTypes = availableTypes.filter(type => 
        type.timePreference === 'all' || 
        type.timePreference === timeOfDay ||
        (type.weekend && isWeekend)
      );

      if (weather === 'rainy' && Math.random() > 0.3) return;
      if (weather === 'cloudy' && Math.random() > 0.7) return;

      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const newCustomer = {
        id: nextCustomerId.current++,
        ...randomType,
        position: 100,
        scale: 0.5,
        showBubble: false,
        bought: false,
        bubbleTimer: 0,
        isRegular: false
      };
      setCustomers(prev => [...prev, newCustomer]);
    }, getCustomerInterval());

    return () => clearInterval(interval);
  }, [isOpen, showResult, time, weather, temperature, dayOfWeek, reputation, regularCustomers]);

  useEffect(() => {
    if (!isOpen || showResult) return;

    const moveInterval = setInterval(() => {
      setCustomers(prev => {
        return prev.map(customer => {
          if (customer.bought) {
            const newPos = customer.position - customer.speed * 1.5;
            const newScale = customer.scale + 0.015;
            if (newPos < -20) return null;
            return { ...customer, position: newPos, scale: newScale };
          } else {
            const newPos = customer.position - customer.speed;
            const newScale = Math.min(1, customer.scale + 0.008);
            
            if (newPos <= 35 && newPos > 28 && !customer.showBubble) {
              let buyRate = customer.buyRate;
              
              if (customer.isRegular) buyRate = 1.0;
              
              if (!customer.priceIgnore) {
                if (price >= 300) buyRate -= 0.5; // 300円以上は激減
                else if (price >= 250) buyRate -= 0.4; // 250円は大幅減
                else if (price >= 200) buyRate -= 0.3; // 200円は結構減
                else if (price >= 150) buyRate -= 0.2; // 150円は少し減
                if (price <= 50 && customer.name === '子ども') buyRate = 1.0; // 50円なら子どもは必ず買う
                if (price >= 1000) buyRate -= 0.8; // 1000円はほぼ買わない
              }
              
              buyRate += (reputation - 3) * 0.1;
              
              const willBuy = Math.random() < buyRate;
              const hasStock = inventory.lemon >= customer.count && inventory.sugar >= customer.count;
              
              if (willBuy && hasStock) {
                const totalPrice = price * customer.count;
                const tip = customer.tip ? (typeof customer.tip === 'number' ? customer.tip : (Math.random() > 0.7 ? 10 : 0)) : 0;
                
                // 効果音
                if (customer.name === 'VIP客') {
                  playSoundEffect('vip');
                } else {
                  playSoundEffect('sell');
                }
                
                setInventory(prev => ({ 
                  lemon: prev.lemon - customer.count, 
                  sugar: prev.sugar - customer.count 
                }));
                setCash(prev => prev + totalPrice + tip);
                setSales(prev => prev + totalPrice + tip);
                setCustomerCount(prev => prev + 1);
                setSatisfactionCount(prev => prev + 1);
                setCustomerStats(prev => ({
                  ...prev,
                  [customer.name]: (prev[customer.name] || 0) + 1
                }));
                
                if (!customer.isRegular && Math.random() < 0.15) {
                  setRegularCustomers(prev => {
                    if (prev.length < 5) {
                      return [...prev, { ...customerTypes.basic[Math.floor(Math.random() * customerTypes.basic.length)] }];
                    }
                    return prev;
                  });
                }
                
                if (customer.name === 'VIP客') {
                  setReputation(prev => Math.min(5, prev + 1));
                }
                
                if (customer.name === 'クレーマー' && customer.negative) {
                  setReputation(prev => Math.max(1, prev - 1));
                  playSoundEffect('angry');
                }
                
                const randomSpeech = customer.speech[Math.floor(Math.random() * customer.speech.length)];
                return { 
                  ...customer, 
                  position: newPos, 
                  scale: newScale, 
                  showBubble: true, 
                  bought: true, 
                  speech: tip ? randomSpeech + ` (+${tip}円)` : randomSpeech,
                  bubbleTimer: 60 
                };
              } else if (!hasStock) {
                setCustomerCount(prev => prev + 1);
                setReputation(prev => Math.max(1, prev - 0.5));
                return { 
                  ...customer, 
                  position: newPos, 
                  scale: newScale, 
                  showBubble: true, 
                  bought: true, 
                  speech: '売り切れ？',
                  bubbleTimer: 60 
                };
              } else {
                setCustomerCount(prev => prev + 1);
                return { 
                  ...customer, 
                  position: newPos, 
                  scale: newScale, 
                  showBubble: true, 
                  bought: true, 
                  speech: '今日はいいや',
                  bubbleTimer: 60 
                };
              }
            }
            
            if (customer.showBubble && customer.bubbleTimer > 0) {
              return { ...customer, position: newPos, scale: newScale, bubbleTimer: customer.bubbleTimer - 1 };
            } else if (customer.bubbleTimer === 0 && customer.showBubble) {
              return { ...customer, position: newPos, scale: newScale, showBubble: false };
            }
            
            if (newPos < -20) return null;
            return { ...customer, position: newPos, scale: newScale };
          }
        }).filter(Boolean);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isOpen, showResult, inventory, price, reputation]);

  const handlePurchase = () => {
    const lemonCost = 400;
    const sugarCost = 200;
    const totalCost = lemonCost + sugarCost;
    
    if (cash >= totalCost) {
      playSoundEffect('purchase');
      setCash(prev => prev - totalCost);
      setCost(prev => prev + totalCost);
      setInventory(prev => ({ lemon: prev.lemon + 10, sugar: prev.sugar + 5 }));
      alert('🍋 レモン10個と砂糖5袋を仕入れました！');
    } else {
      alert('💸 お金が足りません！');
    }
  };

  const handleClose = () => {
    playSoundEffect('close');
    setIsOpen(false);
    setShowResult(true);
    setDailyHistory(prev => [...prev, {
      day,
      sales,
      cost,
      profit: sales - cost,
      customers: customerCount
    }]);
  };

  const handleNextDay = () => {
    playSoundEffect('button');
    setDay(prev => prev + 1);
    setSales(0);
    setCost(0);
    setCustomers([]);
    setCustomerCount(0);
    setSatisfactionCount(0);
    setCustomerStats({});
    setTime(9);
    setIsOpen(true);
    setShowResult(false);
    setShowDetail(false);
  };

  const handleTutorialNext = () => {
    playSoundEffect('button');
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleTutorialSkip = () => {
    playSoundEffect('button');
    setShowTutorial(false);
  };

  const openGlossary = (term) => {
    playSoundEffect('button');
    setSelectedTerm(term);
    setShowGlossary(true);
    if (glossary[term]) {
      speak(glossary[term].description);
    }
  };

  const profit = sales - cost;
  const totalAssets = cash + (inventory.lemon * 40 + inventory.sugar * 40);
  const netAssets = totalAssets - 0;
  const satisfaction = customerCount > 0 ? Math.round((satisfactionCount / customerCount) * 5) : 0;

  const getWeatherIcon = () => {
    if (weather === 'sunny') return { icon: <Sun className="text-yellow-400" size={24} />, text: '晴れ', emoji: '☀️' };
    if (weather === 'cloudy') return { icon: <Cloud className="text-gray-400" size={24} />, text: '曇り', emoji: '☁️' };
    return { icon: <CloudRain className="text-blue-400" size={24} />, text: '雨', emoji: '☔' };
  };

  const weatherInfo = getWeatherIcon();
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 p-4 font-sans">
      {/* チュートリアル */}
      {showTutorial && day === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <div className="text-6xl text-center mb-4">🐱</div>
            <h2 className="text-2xl font-bold text-center mb-4">
              {tutorialSteps[tutorialStep].title}
            </h2>
            <p className="text-lg text-center mb-6 text-gray-700">
              {tutorialSteps[tutorialStep].text}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleTutorialSkip}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                スキップ
              </button>
              <button
                onClick={handleTutorialNext}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {tutorialStep < tutorialSteps.length - 1 ? '次へ' : '始める！'}
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === tutorialStep ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 用語集モーダル */}
      {showGlossary && selectedTerm && glossary[selectedTerm] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {glossary[selectedTerm].title}
            </h2>
            <p className="text-lg mb-4 text-gray-700">
              {glossary[selectedTerm].description}
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                {glossary[selectedTerm].example}
              </p>
            </div>
            <button
              onClick={() => {
                playSoundEffect('button');
                setShowGlossary(false);
                if (synthRef.current) synthRef.current.cancel();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 音声ON/OFFボタン */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (synthRef.current) synthRef.current.cancel();
          }}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition"
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {!showResult ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">Day {day} ({dayNames[dayOfWeek - 1]})</div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
                  {weatherInfo.icon}
                  <span className="font-bold">{weatherInfo.text}</span>
                  <span className="text-sm">🌡️{temperature}°C</span>
                </div>
                <div className="bg-amber-50 px-3 py-1 rounded font-bold">
                  ⏰ {Math.floor(time)}:{(time % 1) * 60 === 0 ? '00' : '30'}
                </div>
                <div className="bg-purple-50 px-3 py-1 rounded font-bold flex items-center gap-1">
                  <span>口コミ</span>
                  <span className="text-yellow-500">{'★'.repeat(Math.round(reputation))}{'☆'.repeat(5 - Math.round(reputation))}</span>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => openGlossary('現金')}
                  className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition"
                >
                  <HelpCircle size={16} className="text-blue-500" />
                  <span className="text-xl">💰</span>
                  <span className="font-bold">{cash}円</span>
                </button>
                <button
                  onClick={() => openGlossary('在庫')}
                  className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition"
                >
                  <HelpCircle size={16} className="text-blue-500" />
                  <span className="text-xl">🍋</span>
                  <span className="font-bold">{inventory.lemon}個</span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xl">🧂</span>
                  <span className="font-bold">{inventory.sugar}袋</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-lg p-4 mb-4 relative overflow-hidden" 
            style={{ 
              height: '500px',
              background: weather === 'rainy' 
                ? 'linear-gradient(to bottom, #6b7280, #9ca3af)' 
                : weather === 'cloudy'
                ? 'linear-gradient(to bottom, #93c5fd, #bfdbfe)'
                : 'linear-gradient(to bottom, #7dd3fc, #86efac)'
            }}
          >
            <div className="absolute top-4 left-10 text-4xl opacity-80 animate-pulse">☁️</div>
            <div className="absolute top-8 right-20 text-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}>☁️</div>

            {weather === 'rainy' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-blue-400 opacity-50"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * -20}%`,
                      width: '2px',
                      height: '20px',
                      animation: `fall ${Math.random() * 1 + 0.5}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}

            {customers.map(customer => (
              <div
                key={customer.id}
                className="absolute transition-all"
                style={{
                  top: `${customer.position}%`,
                  left: '50%',
                  transform: `translateX(-50%) scale(${customer.scale})`,
                  fontSize: '48px'
                }}
              >
                <div className="relative">
                  {customer.sparkle && <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>}
                  {customer.emoji}
                  {customer.isRegular && <span className="absolute -top-2 -left-2 text-xl">💚</span>}
                  {customer.showBubble && customer.bubbleTimer > 0 && (
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 rounded-lg px-3 py-1 text-sm whitespace-nowrap shadow-lg border-2 ${customer.negative ? 'bg-red-100 border-red-300' : 'bg-white border-gray-300'}`}>
                      {customer.speech}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="bg-amber-600 rounded-t-lg px-12 py-2 text-center shadow-lg transform perspective-500" style={{ transform: 'perspective(500px) rotateX(10deg)' }}>
                  <div className="text-white font-bold text-xl">🏪 LEMONADE</div>
                </div>
                <div className="bg-amber-700 px-8 py-4 rounded-b-lg shadow-lg">
                  <div className="flex justify-center gap-2 mb-2">
                    {[...Array(Math.min(5, inventory.lemon))].map((_, i) => (
                      <span key={i} className="text-2xl">🍋</span>
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-400 rounded px-4 py-1 inline-block font-bold text-lg">
                      💵 {price}円
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
              </div>
            </div>

            {(inventory.lemon < 3 || inventory.sugar < 2) && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-xl animate-pulse">
                ⚠️ 在庫が少ないです！
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handlePurchase}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={24} />
                <div>
                  <div>💰 仕入れる</div>
                  <div className="text-sm">(600円)</div>
                </div>
              </button>
              
              <div className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg flex flex-col items-center justify-center">
                <div className="mb-2">💵 値段設定</div>
                <select
                  value={price}
                  onChange={(e) => {
                    playSoundEffect('button');
                    setPrice(Number(e.target.value));
                  }}
                  className="bg-white text-black px-4 py-2 rounded font-bold text-lg"
                >
                  <option value={50}>50円（激安）</option>
                  <option value={100}>100円（普通）</option>
                  <option value={150}>150円（やや高）</option>
                  <option value={200}>200円（高級）</option>
                  <option value={250}>250円（超高級）</option>
                  <option value={300}>300円（プレミアム）</option>
                  <option value={1000}>1000円（ぼったくり）</option>
                </select>
              </div>
              
              <button
                onClick={handleClose}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <XCircle size={24} />
                <div>🚪 閉店する</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-6">
              🏪 Day {day} の結果
            </h1>

            {!showDetail ? (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-gray-300 pb-2">
                    <h2 className="text-xl font-bold">⚡️ 今日のバトル結果</h2>
                    <button
                      onClick={() => openGlossary('PL')}
                      className="text-blue-500 hover:text-blue-600 transition"
                    >
                      <HelpCircle size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => openGlossary('売上')}
                        className="text-lg hover:text-blue-500 transition flex items-center gap-1"
                      >
                        💰 売上 <HelpCircle size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-green-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (sales / 2000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-green-600 w-24 text-right">{sales}円</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => openGlossary('費用')}
                        className="text-lg hover:text-blue-500 transition flex items-center gap-1"
                      >
                        💸 費用 <HelpCircle size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-red-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (cost / 2000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-red-600 w-24 text-right">{cost}円</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-yellow-100 p-3 rounded-lg">
                      <button
                        onClick={() => openGlossary('利益')}
                        className="text-xl font-bold hover:text-blue-500 transition flex items-center gap-1"
                      >
                        ✨ 利益 <HelpCircle size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-yellow-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (Math.abs(profit) / 2000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold text-xl w-24 text-right ${profit >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {profit >= 0 ? '+' : ''}{profit}円
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-gray-300 pb-2">
                    <h2 className="text-xl font-bold">🎒 持ち物リスト</h2>
                    <button
                      onClick={() => openGlossary('BS')}
                      className="text-blue-500 hover:text-blue-600 transition"
                    >
                      <HelpCircle size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => openGlossary('現金')}
                        className="text-lg hover:text-blue-500 transition flex items-center gap-1"
                      >
                        💵 現金 <HelpCircle size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-blue-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (cash / 3000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-blue-600 w-24 text-right">{cash}円</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => openGlossary('在庫')}
                        className="text-lg hover:text-blue-500 transition flex items-center gap-1"
                      >
                        📦 在庫 <HelpCircle size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-purple-500 h-6 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, ((inventory.lemon * 40 + inventory.sugar * 40) / 1000) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-purple-600 w-24 text-right">
                          {inventory.lemon * 40 + inventory.sugar * 40}円
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                      <button
                        onClick={() => openGlossary('純資産')}
                        className="text-xl font-bold hover:text-blue-700 transition flex items-center gap-1"
                      >
                        🏆 お店の価値 <HelpCircle size={16} />
                      </button>
                      <span className="font-bold text-xl text-blue-600">{netAssets}円</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8 bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3 text-lg">📊 本日の客層分析</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(customerStats).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center bg-white px-3 py-2 rounded">
                        <span>{name}</span>
                        <span className="font-bold text-purple-600">{count}人</span>
                      </div>
                    ))}
                  </div>
                  {regularCustomers.length > 0 && (
                    <div className="mt-3 bg-green-50 p-2 rounded">
                      <span className="text-sm">💚 常連客: {regularCustomers.length}人</span>
                    </div>
                  )}
                </div>

                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">👥</div>
                      <div className="text-sm text-gray-600">来客数</div>
                      <div className="text-2xl font-bold">{customerCount}人</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">⭐️</div>
                      <div className="text-sm text-gray-600">満足度</div>
                      <div className="text-2xl font-bold">{'★'.repeat(satisfaction)}{'☆'.repeat(5 - satisfaction)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{weatherInfo.emoji}</div>
                      <div className="text-sm text-gray-600">天気</div>
                      <div className="text-lg font-bold">{weatherInfo.text}</div>
                    </div>
                  </div>
                </div>

                {/* 今日の学び */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">📝</div>
                    <div>
                      <div className="font-bold mb-1 text-lg">今日の学び</div>
                      <div className="text-gray-700">
                        ✅ {todayLearning}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    onClick={() => {
                      playSoundEffect('button');
                      setShowDetail(true);
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    📊 詳しい決算書を見る
                  </button>
                </div>

                <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🐱</div>
                    <div>
                      <div className="font-bold mb-1">ねこ店長のコメント：</div>
                      <div className="text-gray-700">
                        {(() => {
                          // 利益によるコメント
                          if (profit > 3000) return '🎉 すごい！大成功だね！この調子で億万長者を目指そう！';
                          if (profit > 2000) return '✨ 素晴らしい！今日は最高の日だったね！';
                          if (profit > 1000) return '👍 完璧な経営だ！PLもBSもバッチリだね！';
                          if (profit > 500) return '😊 いい感じ！順調に成長してるよ！';
                          if (profit > 0) return '🙂 今日もよく頑張ったね！少しずつ積み重ねが大事だよ。';
                          if (profit === 0) return '😐 今日はトントンだね。明日は利益を出そう！';
                          if (profit > -500) return '😥 ちょっと赤字だけど、明日は頑張ろう！';
                          if (profit <= -500) return '😰 大赤字...！値段や仕入れのタイミングを見直そう！';
                          
                          // 追加の状況別コメント
                          if (weather === 'rainy' && profit > 300) return '☔ 雨なのによく売れたね！すごい！';
                          if (temperature >= 28 && sales > 2000) return '🌡️ 暑い日は大チャンス！ランナーも来てるね！';
                          if (reputation >= 4) return '⭐️ 口コミ評価が最高！みんなが君のお店を応援してるよ！';
                          if (reputation <= 2) return '📉 口コミが下がってる...在庫切れに注意だよ。';
                          if (regularCustomers.length >= 3) return '💚 常連さんが増えてきたね！リピーターは宝物だよ！';
                          if (price >= 300 && profit > 500) return '💎 高級路線で成功！ブランド価値が高いね！';
                          if (price <= 50 && customerCount > 30) return '🎯 薄利多売戦略！お客さんがたくさん来てるね！';
                          
                          return '😺 また明日も一緒に頑張ろうね！';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextDay}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition text-xl"
                >
                  ➡️ 次の日へ進む
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => {
                      playSoundEffect('button');
                      setShowDetail(false);
                    }}
                    className="mb-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    ← 戻る
                  </button>

                  <h2 className="text-2xl font-bold mb-4 text-center">📊 詳しい決算書</h2>

                  {/* 水の流れ（PL） */}
                  <div className="mb-8 bg-gradient-to-b from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-center">💧 お金の流れ（PL）</h3>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-center">
                        <div className="text-5xl mb-2">💧</div>
                        <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
                          売上 {sales}円
                        </div>
                        <div className="text-sm text-gray-600 mt-1">水が入ってくる</div>
                      </div>

                      <div className="text-4xl animate-bounce">↓</div>

                      <div className="text-center">
                        <div className="text-5xl mb-2">🪣</div>
                        <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold">
                          会社（バケツ）
                        </div>
                      </div>

                      <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>↓</div>

                      <div className="text-center">
                        <div className="text-5xl mb-2">💸</div>
                        <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
                          費用 {cost}円
                        </div>
                        <div className="text-sm text-gray-600 mt-1">水が出ていく</div>
                      </div>

                      <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>↓</div>

                      <div className="text-center">
                        <div className="text-5xl mb-2">💰</div>
                        <div className={`px-6 py-3 rounded-lg font-bold text-2xl ${profit >= 0 ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
                          残った水 = 利益 {profit}円
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 天秤（BS） */}
                  <div className="mb-8 bg-gradient-to-b from-purple-50 to-purple-100 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-center">⚖️ バランスシート（BS）</h3>
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">⚖️</div>
                      
                      <div className="w-full grid grid-cols-2 gap-4 max-w-lg">
                        {/* 左側：資産 */}
                        <div className="bg-blue-200 p-4 rounded-lg">
                          <h4 className="font-bold text-center mb-3 text-lg">資産側</h4>
                          <div className="space-y-2">
                            <div className="bg-white p-2 rounded flex justify-between">
                              <span>💵 現金</span>
                              <span className="font-bold">{cash}円</span>
                            </div>
                            <div className="bg-white p-2 rounded flex justify-between">
                              <span>📦 在庫</span>
                              <span className="font-bold">{inventory.lemon * 40 + inventory.sugar * 40}円</span>
                            </div>
                            <div className="bg-blue-400 text-white p-2 rounded flex justify-between font-bold">
                              <span>合計</span>
                              <span>{totalAssets}円</span>
                            </div>
                          </div>
                        </div>

                        {/* 右側：負債・純資産 */}
                        <div className="bg-orange-200 p-4 rounded-lg">
                          <h4 className="font-bold text-center mb-3 text-lg">負債・純資産側</h4>
                          <div className="space-y-2">
                            <div className="bg-white p-2 rounded flex justify-between">
                              <span>💳 借金</span>
                              <span className="font-bold">0円</span>
                            </div>
                            <div className="bg-white p-2 rounded flex justify-between">
                              <span>🏆 元手</span>
                              <span className="font-bold">{initialCash}円</span>
                            </div>
                            <div className="bg-white p-2 rounded flex justify-between">
                              <span>📈 利益累計</span>
                              <span className="font-bold">{totalAssets - initialCash}円</span>
                            </div>
                            <div className="bg-orange-400 text-white p-2 rounded flex justify-between font-bold">
                              <span>合計</span>
                              <span>{totalAssets}円</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          ⚖️ 左右のバランスが取れています！
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 推移グラフ */}
                  {dailyHistory.length > 0 && (
                    <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4 text-center">📈 日別推移</h3>
                      <div className="space-y-3">
                        {dailyHistory.map((record, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold">Day {record.day}</span>
                              <span className={`font-bold ${record.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {record.profit >= 0 ? '+' : ''}{record.profit}円
                              </span>
                            </div>
                            <div className="flex gap-2 text-sm text-gray-600">
                              <span>売上: {record.sales}円</span>
                              <span>費用: {record.cost}円</span>
                              <span>客数: {record.customers}人</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextDay}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition text-xl"
                >
                  ➡️ 次の日へ進む
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(500px);
          }
        }
      `}</style>
    </div>
  );
};

export default LemonadeStandGame;