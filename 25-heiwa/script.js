// 🎮 魔王を倒した勇者の魔法RPG - メインプログラム

// 🏠 村の各エリアの情報
const villageAreas = {
    square: {
        name: "村の広場",
        icon: "🏛️",
        npc: "村長さん",
        npcIcon: "👨‍💼",
        npc2: "村の子供",
        npc2Icon: "👶"
    },
    well: {
        name: "井戸",
        icon: "🚰",
        npc: "おじいさん",
        npcIcon: "👴",
        npc2: "おばあさん",
        npc2Icon: "👵"
    },
    bakery: {
        name: "パン屋",
        icon: "🍞",
        npc: "パン屋さん",
        npcIcon: "👩‍🍳",
        npc2: "パン屋の息子",
        npc2Icon: "👦"
    },
    elder: {
        name: "長老の家",
        icon: "🏠",
        npc: "長老",
        npcIcon: "🧙‍♂️",
        npc2: "長老の奥さん",
        npc2Icon: "🧙‍♀️"
    },
    school: {
        name: "学校",
        icon: "⛪",
        npc: "先生",
        npcIcon: "👩‍🏫",
        npc2: "生徒代表",
        npc2Icon: "👧"
    },
    field: {
        name: "畑",
        icon: "🌾",
        npc: "農家さん",
        npcIcon: "👨‍🌾",
        npc2: "農家の娘",
        npc2Icon: "👩‍🌾"
    },
    forest: {
        name: "森の入り口",
        icon: "🌲",
        npc: "猟師さん",
        npcIcon: "🏹",
        npc2: "森の番人",
        npc2Icon: "🧝‍♂️"
    },
    blacksmith: {
        name: "鍛冶屋",
        icon: "⚒️",
        npc: "鍛冶屋さん",
        npcIcon: "👨‍🏭",
        npc2: "見習い鍛冶屋",
        npc2Icon: "🧑‍🏭"
    },
    inn: {
        name: "宿屋",
        icon: "🏨",
        npc: "宿屋の主人",
        npcIcon: "🧑‍🍳",
        npc2: "宿屋の娘",
        npc2Icon: "👩‍🍳"
    }
};

// 🔮 30種類の魔法のリスト
const spells = [
    { name: "みずだし", effect: "井戸から水を出す", icon: "💧" },
    { name: "からすん", effect: "カラスを追い払う", icon: "🐦" },
    { name: "かぜきる", effect: "強い風を止める", icon: "🌪️" },
    { name: "けむはれ", effect: "霧を晴らす", icon: "🌫️" },
    { name: "はしのべ", effect: "仮の橋を作る", icon: "🌉" },
    { name: "らいなお", effect: "雷で壊れた物を直す", icon: "⚡" },
    { name: "いぬしず", effect: "吠える犬を静める", icon: "🐕" },
    { name: "うしよび", effect: "逃げた牛を呼び戻す", icon: "🐄" },
    { name: "とりだし", effect: "建物に入った鳥を出す", icon: "🕊️" },
    { name: "よなきま", effect: "夜の騒音を止める", icon: "🌙" },
    { name: "かゆけし", effect: "虫刺されのかゆみを治す", icon: "🦟" },
    { name: "みみでる", effect: "土から虫を追い出す", icon: "🪱" },
    { name: "なかなお", effect: "けんかを仲直りさせる", icon: "🤝" },
    { name: "みちしる", effect: "道に迷った人を光で案内", icon: "💡" },
    { name: "もどぱん", effect: "こぼれた材料を元に戻す", icon: "🍞" },
    { name: "ひろたる", effect: "失くした物の場所を教える", icon: "🔍" },
    { name: "ひげしゅ", effect: "乱れた髪やひげを整える", icon: "✂️" },
    { name: "ひかりと", effect: "眩しい光を暗くする", icon: "🔆" },
    { name: "だまきき", effect: "しゃべる木や物を静める", icon: "🌳" },
    { name: "うきとめ", effect: "浮いた家具を地面に戻す", icon: "🪑" },
    { name: "もじゃも", effect: "髪をもじゃもじゃにする", icon: "🦱" },
    { name: "もちだし", effect: "どこからかお餅を出す", icon: "🍡" },
    { name: "ふんわり", effect: "ふわふわ浮く", icon: "☁️" },
    { name: "ぺたんこ", effect: "体を平たくして隙間を通る", icon: "📏" },
    { name: "くすぐり", effect: "相手をくすぐる", icon: "😆" },
    { name: "ふえふき", effect: "変な音楽を奏でる", icon: "🎵" },
    { name: "わすれろ", effect: "何かを忘れさせる", icon: "💭" },
    { name: "ねむたれ", effect: "眠くなる", icon: "😴" },
    { name: "ぬのばさ", effect: "洗濯物を風で飛ばす", icon: "👕" },
    { name: "こえまね", effect: "他の人の声を真似る", icon: "🎭" }
];

// 🎯 各エリアのイベント（困りごと）
const events = {
    square: [
        {
            problem: "村の旗が風で飛んでしまいました！",
            correctSpell: "かぜきる",
            success: "風が止まって、旗が元の場所に戻りました！みんな喜んでいます。",
            failure: "「あれ？勇者様、その魔法は...旗をくすぐってるだけじゃないですか？😅 風を止める魔法をお願いします！」"
        },
        {
            problem: "村の鐘が鳴りっぱなしで、みんな困っています！",
            correctSpell: "よなきま",
            success: "鐘の音が静かになりました。村に平和が戻りました！",
            failure: "「勇者様、その魔法だと鐘がもっと元気に鳴っちゃいますよ〜😰 音を止める魔法をお願いします！」"
        },
        {
            problem: "村の子供がおもちゃを失くしてしまいました！",
            correctSpell: "ひろたる",
            success: "おもちゃが見つかりました！子供が大喜びです。",
            failure: "「うわ〜！勇者様、その魔法だとおもちゃがもっと隠れちゃうよ〜😭 探す魔法をお願いします！」"
        }
    ],
    well: [
        {
            problem: "井戸が凍って水が出ません！",
            correctSpell: "みずだし",
            success: "氷が溶けて、きれいな水が出てきました！",
            failure: "「あの〜勇者様、その魔法だと井戸がもっと寒くなっちゃいます😅 水を出す魔法をお願いします！」"
        },
        {
            problem: "井戸に落ちた猫が出られません！",
            correctSpell: "ふんわり",
            success: "猫がふわふわ浮いて、安全に井戸から出ました！",
            failure: "「勇者様、その魔法だと猫がもっと深く落ちちゃいますよ〜😱 浮かせる魔法をお願いします！」"
        },
        {
            problem: "おばあさんの洗濯物が井戸に落ちてしまいました！",
            correctSpell: "ぬのばさ",
            success: "洗濯物が風で飛んで、きれいに乾きました！",
            failure: "「あらまあ、勇者様。その魔法だと洗濯物がもっと井戸の底に沈んじゃいますわ😰 洗濯物を飛ばす魔法をお願いします！」"
        }
    ],
    bakery: [
        {
            problem: "パンの材料をこぼしてしまいました！",
            correctSpell: "もどぱん",
            success: "こぼれた材料が元に戻りました！美味しいパンが作れます。",
            failure: "「あら勇者様、その魔法だと材料がもっと散らばっちゃいますよ〜😅 元に戻す魔法をお願いします！」"
        },
        {
            problem: "カラスがパンを盗みに来ます！",
            correctSpell: "からすん",
            success: "カラスが逃げていきました！パンが作られました。",
            failure: "「勇者様、その魔法だとカラスがもっとパンを欲しがっちゃいます😰 追い払う魔法をお願いします！」"
        },
        {
            problem: "パン屋の息子がお餅を食べたいと言っています！",
            correctSpell: "もちだし",
            success: "どこからかお餅が出てきました！息子が大喜びです。",
            failure: "「お母さん〜！勇者様が変な魔法使ってるよ〜😭 お餅を出す魔法をお願いします！」"
        }
    ],
    elder: [
        {
            problem: "長老の大切な本が見つかりません！",
            correctSpell: "ひろたる",
            success: "本が本棚の後ろから見つかりました！長老が喜んでいます。",
            failure: "「むむ、勇者様。その魔法では本がもっと隠れちゃいますよ😅 探す魔法をお願いします！」"
        },
        {
            problem: "長老の髪がぼさぼさになってしまいました！",
            correctSpell: "ひげしゅ",
            success: "長老の髪がきれいに整いました！とても立派です。",
            failure: "「あの〜勇者様、その魔法だと髪がもっとぼさぼさになっちゃいます😅 整える魔法をお願いします！」"
        },
        {
            problem: "長老の奥さんが何かを忘れてしまいました！",
            correctSpell: "わすれろ",
            success: "忘れていたことを思い出しました！奥さんが安心しています。",
            failure: "「あら、勇者様。その魔法だと私がもっと忘れちゃいますわ😰 忘れ物を思い出す魔法をお願いします！」"
        }
    ],
    school: [
        {
            problem: "生徒たちがけんかをしています！",
            correctSpell: "なかなお",
            success: "みんな仲直りしました！また一緒に遊んでいます。",
            failure: "「先生、その魔法だと生徒たちがもっとけんかしちゃいます😰 仲直りさせる魔法をお願いします！」"
        },
        {
            problem: "教室の電気が眩しすぎて、勉強できません！",
            correctSpell: "ひかりと",
            success: "光が優しくなりました！勉強に集中できます。",
            failure: "「勇者様、その魔法だと電気がもっと眩しくなっちゃいます😅 光を調整する魔法をお願いします！」"
        },
        {
            problem: "生徒代表が虫刺されでかゆがっています！",
            correctSpell: "かゆけし",
            success: "かゆみが治りました！生徒代表が喜んでいます。",
            failure: "「うわ〜！勇者様、その魔法だと私がもっとかゆくなっちゃうよ〜😭 かゆみを治す魔法をお願いします！」"
        }
    ],
    field: [
        {
            problem: "畑から牛が逃げてしまいました！",
            correctSpell: "うしよび",
            success: "牛が戻ってきました！畑仕事が続けられます。",
            failure: "「あの〜勇者様、その魔法だと牛がもっと遠くに逃げちゃいます😅 呼び戻す魔法をお願いします！」"
        },
        {
            problem: "土の中の虫が作物を食べています！",
            correctSpell: "みみでる",
            success: "虫が土から出て行きました！作物が守られました。",
            failure: "「勇者様、その魔法だと虫がもっと作物を食べちゃいます😰 虫を追い出す魔法をお願いします！」"
        },
        {
            problem: "農家の娘が犬に吠えられて困っています！",
            correctSpell: "いぬしず",
            success: "犬が静かになりました！娘が安心しています。",
            failure: "「きゃ〜！勇者様、その魔法だと犬がもっと吠えちゃいます😱 犬を静める魔法をお願いします！」"
        }
    ],
    forest: [
        {
            problem: "森で道に迷った人がいます！",
            correctSpell: "みちしる",
            success: "光の道ができて、迷子の人が村に帰れました！",
            failure: "「あの〜勇者様、その魔法だと迷子の人がもっと迷っちゃいます😅 案内する魔法をお願いします！」"
        },
        {
            problem: "森の木がしゃべりすぎて、うるさいです！",
            correctSpell: "だまきき",
            success: "木が静かになりました！森に平和が戻りました。",
            failure: "「勇者様、その魔法だと木がもっとしゃべっちゃいます😅 静める魔法をお願いします！」"
        },
        {
            problem: "森の番人が霧で前が見えません！",
            correctSpell: "けむはれ",
            success: "霧が晴れて、森の景色がよく見えるようになりました！",
            failure: "「...勇者様、その魔法だと霧がもっと濃くなっちゃいます😑 霧を晴らす魔法をお願いします。」"
        }
    ],
    blacksmith: [
        {
            problem: "鍛冶屋の火が消えてしまいました！",
            correctSpell: "らいなお",
            success: "雷の力で火が再び燃え上がりました！武器作りが続けられます。",
            failure: "「あの〜勇者様、その魔法だと火がもっと消えちゃいます😅 火を起こす魔法をお願いします！」"
        },
        {
            problem: "作った武器が錆びてしまいました！",
            correctSpell: "ひかりと",
            success: "光の力で錆が落ちて、武器がピカピカになりました！",
            failure: "「勇者様、その魔法だと武器がもっと錆びちゃいます😰 錆を落とす魔法をお願いします！」"
        },
        {
            problem: "見習い鍛冶屋が疲れて眠くなっています！",
            correctSpell: "ねむたれ",
            success: "魔法で眠くなって、休憩できました！",
            failure: "「あの〜勇者様、その魔法だと私がもっと目が覚めちゃいます😅 眠くする魔法をお願いします！」"
        }
    ],
    inn: [
        {
            problem: "宿屋の布団が湿ってしまいました！",
            correctSpell: "かぜきる",
            success: "風で布団が乾いて、ふかふかになりました！",
            failure: "「あの〜勇者様、その魔法だと布団がもっと湿っちゃいます😅 乾かす魔法をお願いします！」"
        },
        {
            problem: "宿泊客が眠れなくて困っています！",
            correctSpell: "ねむたれ",
            success: "魔法で眠くなって、ぐっすり眠れました！",
            failure: "「勇者様、その魔法だとお客さんがもっと目が覚めちゃいます😰 眠くする魔法をお願いします！」"
        },
        {
            problem: "宿屋の娘が変な音楽を奏でたいと言っています！",
            correctSpell: "ふえふき",
            success: "変な音楽が奏でられました！娘が楽しそうです。",
            failure: "「あら、勇者様。その魔法だと私がもっと静かになっちゃいますわ😰 音楽を奏でる魔法をお願いします！」"
        }
    ]
};

// 🎲 現在の状態を記録する変数
let currentArea = null;
let currentEvent = null;
let solvedEvents = new Set(); // 解決したイベントを記録

// 村の発展度バーを更新
function updateVillageProgress() {
    const progress = getGameProgress();
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    if (progressBar && progressPercent) {
        progressBar.value = progress.percentage;
        progressPercent.textContent = progress.percentage + '%';
    }
}

// 🎮 ゲーム開始時の処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 魔王を倒した勇者の魔法RPG - ゲーム開始！');
    initializeGame();
    updateVillageProgress(); // 初期化時も進捗バー更新
});

// 🚀 ゲームの初期化
function initializeGame() {
    // 村の地図のボタンにイベントリスナーを追加
    const mapButtons = document.querySelectorAll('.map-area');
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const area = this.dataset.area;
            showEvent(area);
        });
    });

    // 戻るボタンのイベントリスナー
    document.getElementById('backButton').addEventListener('click', showVillageMap);
    document.getElementById('backToMapButton').addEventListener('click', showVillageMap);
    
    // 続けるボタンのイベントリスナー
    document.getElementById('continueButton').addEventListener('click', function() {
        showEvent(currentArea);
    });
}

// 🗺️ 村の地図を表示
function showVillageMap() {
    document.getElementById('villageMap').classList.remove('hidden');
    document.getElementById('eventScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    
    currentArea = null;
    currentEvent = null;
    updateVillageProgress(); // 進捗バー更新
    
    console.log('🗺️ 村の地図を表示');
}

// 🎯 イベントを表示
function showEvent(area) {
    console.log(`🎯 ${area}エリアのイベントを表示`);
    
    currentArea = area;
    
    // そのエリアで利用可能なイベントを取得
    const availableEvents = events[area] || [];
    
    if (availableEvents.length === 0) {
        // イベントがない場合
        showResult("このエリアには今は何も起こっていません。", false);
        return;
    }
    
    // ランダムにイベントを選択
    currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    // 画面を切り替え
    document.getElementById('villageMap').classList.add('hidden');
    document.getElementById('eventScreen').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    
    // NPCの情報を表示（ランダムに選択）
    const areaInfo = villageAreas[area];
    const isSecondNPC = Math.random() < 0.5; // 50%の確率で2番目のNPC
    
    if (isSecondNPC && areaInfo.npc2) {
        document.getElementById('npcAvatar').textContent = areaInfo.npc2Icon;
        document.getElementById('npcName').textContent = areaInfo.npc2;
    } else {
        document.getElementById('npcAvatar').textContent = areaInfo.npcIcon;
        document.getElementById('npcName').textContent = areaInfo.npc;
    }
    
    // イベントの内容を表示
    document.getElementById('eventText').textContent = currentEvent.problem;
    
    // 魔法選択肢を生成
    createSpellButtons();
}

// 🔮 魔法ボタンを作成
function createSpellButtons() {
    const spellGrid = document.getElementById('spellGrid');
    spellGrid.innerHTML = ''; // 既存のボタンをクリア
    
    // 魔法ボタンを作成
    spells.forEach(spell => {
        const button = document.createElement('button');
        button.className = 'spell-button';
        button.innerHTML = `${spell.icon}<br>${spell.name}`;
        button.title = spell.effect; // ツールチップで効果を表示
        
        // クリック時の処理
        button.addEventListener('click', function() {
            castSpell(spell.name);
        });
        
        spellGrid.appendChild(button);
    });
}

// ✨ 魔法を唱える
function castSpell(spellName) {
    console.log(`✨ 魔法「${spellName}」を使用`);
    
    if (!currentEvent) {
        console.error('❌ 現在のイベントがありません');
        return;
    }
    
    // 正解の魔法かチェック
    const isCorrect = spellName === currentEvent.correctSpell;
    
    if (isCorrect) {
        // 正解の場合
        console.log('🎉 正解！');
        const eventKey = `${currentArea}-${currentEvent.problem}`;
        solvedEvents.add(eventKey);
        showResult(currentEvent.success, true);
    } else {
        // 不正解の場合
        console.log('💭 不正解...');
        showResult(currentEvent.failure, false);
    }
}

// 📋 結果を表示
function showResult(message, isSuccess) {
    console.log(`📋 結果表示: ${isSuccess ? '成功' : '失敗'}`);
    
    // 画面を切り替え
    document.getElementById('eventScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    // 結果メッセージを表示
    document.getElementById('resultText').textContent = message;
    
    // 成功の場合は続けるボタンを表示、失敗の場合は隠す
    const continueButton = document.getElementById('continueButton');
    if (isSuccess) {
        continueButton.classList.remove('hidden');
        updateVillageProgress(); // 成功時も進捗バー更新
    } else {
        continueButton.classList.add('hidden');
    }
}

// 🎊 ゲームの進行状況を確認
function getGameProgress() {
    const totalEvents = Object.values(events).flat().length;
    const solvedCount = solvedEvents.size;
    
    return {
        solved: solvedCount,
        total: totalEvents,
        percentage: Math.round((solvedCount / totalEvents) * 100)
    };
}

// 🎯 特定のエリアの進行状況を確認
function getAreaProgress(area) {
    const areaEvents = events[area] || [];
    const solvedInArea = Array.from(solvedEvents).filter(eventKey => 
        eventKey.startsWith(area + '-')
    ).length;
    
    return {
        solved: solvedInArea,
        total: areaEvents.length,
        percentage: areaEvents.length > 0 ? Math.round((solvedInArea / areaEvents.length) * 100) : 0
    };
}

// 🔧 デバッグ用の関数
function debugGame() {
    console.log('🔧 デバッグ情報:');
    console.log('現在のエリア:', currentArea);
    console.log('現在のイベント:', currentEvent);
    console.log('解決したイベント:', Array.from(solvedEvents));
    console.log('全体の進行状況:', getGameProgress());
}

// 🎮 チートコマンド（開発用）
function resetGame() {
    solvedEvents.clear();
    showVillageMap();
    console.log('🎮 ゲームをリセットしました');
}

// グローバルスコープに関数を追加（デバッグ用）
window.debugGame = debugGame;
window.resetGame = resetGame;
window.getGameProgress = getGameProgress;
window.getAreaProgress = getAreaProgress;

console.log('🎮 魔王を倒した勇者の魔法RPG - 準備完了！');
console.log('💡 デバッグコマンド: debugGame(), resetGame(), getGameProgress()');