// ゲーム状態管理
class GameState {
    constructor() {
        this.currentScene = 'start';
        this.bgmVolume = 0.7;
        this.seVolume = 0.8;
        this.textSpeed = 5;
        this.isTyping = false;
        this.isAutoMode = false;
        this.readScenes = new Set();
        this.gameFlags = {};
    }
}

// グローバル変数
let gameState = new GameState();
let currentScenario = {};
let typeInterval = null;
let autoInterval = null;

// 使用可能なアセットのパス定数
const ASSETS = {
    BG_HOUKAGO: "images/houkago.png",
    BG_HIKARI: "images/hikari.png",
    BGM_MAIN: "audio/houkago.mp3"
};

// シナリオデータ（3倍拡張版）
const scenario = {
    // ---------------------------------------------------------
    // プロローグ：孤独な放課後
    // ---------------------------------------------------------
    "start": {
        "text": "茜色に染まる放課後の教室。\n古びた校舎特有の、埃とワックスの混じった匂いが鼻をくすぐる。\n\nクラスメイトたちの賑やかな声は校門の向こうへと遠ざかり、今はただ、時計の針が進む音だけが響いている。\n\n（今日もまた、一日が終わる...）\n\n帰り支度をしようと机の奥に手を伸ばすと、指先に硬いプラスチックの感触が触れた。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "se": null,
        "choices": {
            "引き出してみる": "inspect_tape",
            "無視して帰る": "scene_ignore_early"
        }
    },
    "scene_ignore_early": {
        "text": "気のせいだろう。\n私は鞄を掴むと、逃げるように教室を後にした。\n\nでも、背中で何かが落ちる音がしたような気がして、その日は一晩中眠れなかった。\n\n--- Bad End: 臆病な逃走 ---",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": null,
        "choices": {}
    },
    "inspect_tape": {
        "text": "出てきたのは、埃を被った古いカセットテープだった。\nラベルには色褪せたマジックで『親愛なる楓へ』と記されている。\n\n（楓...私の名前だ。でも、この筆跡は...）\n\n見覚えがあるような、ないような。胸の奥がざわつく不思議な感覚。\n教室の隅には、誰かが置き忘れたポータブルラジカセが置かれている。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "choices": {
            "再生する": "play_tape_intro",
            "躊躇する": "hesitate_tape"
        }
    },
    "hesitate_tape": {
        "text": "不気味な予感がして手が止まる。\nしかし、窓から差し込む夕日がテープを照らし、まるで「聞いて」と訴えかけているように見えた。\n\n好奇心が恐怖に勝る。私は意を決してラジカセにテープをセットした。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "choices": {
            "再生ボタンを押す": "play_tape_intro"
        }
    },

    // ---------------------------------------------------------
    // 第1章：謎の声と既視感
    // ---------------------------------------------------------
    "play_tape_intro": {
        "text": "『カチッ...ザザッ...ザーー...』\n\n激しいノイズ音。\n壊れているのかと思ったその時、ノイズの向こうから少女の声が浮かび上がってきた。\n\n『...あー、あー。聞こえてる？ 楓ちゃん』\n\n心臓が跳ねた。知らない声だ。それなのに、なぜこんなに懐かしい響きがするのだろう。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "テープの声",
        "choices": {
            "耳を澄ます": "scene_voice_1",
            "「誰？」と問いかける": "scene_voice_1_ask"
        }
    },
    "scene_voice_1_ask": {
        "text": "「誰なの...？」\n思わず独り言が漏れる。もちろん、テープからの返事はない。\nしかし、まるで会話が成立しているかのように、声は続いた。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "カエデ",
        "choices": {
            "続きを聞く": "scene_voice_1"
        }
    },
    "scene_voice_1": {
        "text": "『私はユリ。もう忘れちゃったかな？\n小学校の図書室。雨の日。赤いしおり。』\n\n単語が並べられるたびに、私の脳裏に白い霧が晴れるような感覚が走る。\n\n『私たちが初めて出会った日のこと、覚えてる？』",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "思い出す": "flashback_library",
            "思い出せない": "scene_amnesia"
        }
    },
    
    // ---------------------------------------------------------
    // 第2章：追体験（回想シーン）
    // ---------------------------------------------------------
    "flashback_library": {
        "text": "視界が白く滲む。\n気がつくと、私は夕暮れの教室ではなく、雨の日の薄暗い図書室にいた。\n\n（そうだ...私は本が好きで、いつも一人でここにいた）\n\n『ねえ、それ「銀河鉄道の夜」？』\n\n顔を上げると、ショートカットの女の子が屈託のない笑顔で覗き込んでいた。",
        "bg": ASSETS.BG_HIKARI, // 回想は明るい（あるいは幻想的な）イメージとして使用
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "記憶の中のユリ",
        "choices": {
            "「うん、そうだよ」": "flashback_library_2"
        }
    },
    "flashback_library_2": {
        "text": "『私も大好きなの！ カムパネルラって切ないよね』\n\nそれがユリだった。\nあの日から私たちは、まるで磁石が引き合うようにいつも一緒にいた。\n\n交換日記。秘密基地。屋上で食べた溶けたアイスクリーム。\n\n...どうして、こんな大切な友達のことを忘れていたんだろう？",
        "bg": ASSETS.BG_HIKARI,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "カエデ",
        "choices": {
            "現実に戻る": "scene_reality_return"
        }
    },
    "scene_amnesia": {
        "text": "頭が痛い。\n何か思い出そうとすると、黒いモヤがかかったように思考が遮断される。\nでも、涙だけが自然と溢れてくる。\n\n『無理しないで。でも、これだけは伝えたくて...』",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "先を聞く": "scene_reality_return"
        }
    },

    // ---------------------------------------------------------
    // 第3章：残酷な真実
    // ---------------------------------------------------------
    "scene_reality_return": {
        "text": "ふと我に返ると、教室の影はさらに長く伸びていた。\nラジカセのテープが回る音だけが、現実の音だ。\n\n『楓ちゃん。私ね、本当は転校したんじゃないの』\n\n声のトーンが少し落ちる。\n\n『あの日...約束した夏祭りの日。行く途中で、私...』",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "聞きたくない！": "scene_denial",
            "真実を受け入れる": "scene_truth_pre"
        }
    },
    "scene_denial": {
        "text": "嫌だ、聞きたくない。\n思い出したくない。\n激しいブレーキ音。サイレンの音。冷たい雨。\n\n私は耳を塞ごうとしたが、身体が金縛りにあったように動かない。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "choices": {
            "それでも聞く": "scene_truth_pre",
            "テープを止める": "bad_end_stop"
        }
    },
    "scene_truth_pre": {
        "text": "『事故だったの。あっという間だった。\n目が覚めたら、もう誰も私の声に気づいてくれなくて...』\n\nそうだ。\nユリは死んだんだ。\n小学5年生の夏。私はそのショックで、彼女に関する記憶をすべて封じ込めていたんだ。",
        "bg": ASSETS.BG_HIKARI, // 真実への気づき＝光
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "「ごめんね...」": "scene_conversation",
            "「どうして出てきたの？」": "scene_doubt"
        }
    },

    // ---------------------------------------------------------
    // 第4章：境界線での対話
    // ---------------------------------------------------------
    "scene_conversation": {
        "text": "「ごめんね、ユリちゃん。私、忘れてて...」\n涙声で謝る私に、テープの声は優しく答えた（ように聞こえた）。\n\n『いいの。楓ちゃんが笑って生きててくれれば、それだけで』\n\n教室が、夕日とは違う柔らかい光に包まれ始める。\n目の前に、半透明の誰かが立っているような気配がした。",
        "bg": ASSETS.BG_HIKARI,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "気配に手を伸ばす": "scene_climax_true",
            "ただ泣き崩れる": "scene_climax_bitter"
        }
    },
    "scene_doubt": {
        "text": "「死んだはずなのに、どうして...これは呪いなの？」\n\n『違うよ、楓ちゃん。私はただ、さよならが言いたかっただけ』\n\n声は悲しげに揺らぐ。\n教室の空気が冷たく張り詰める。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "信じる": "scene_climax_bitter",
            "拒絶する": "bad_end_reject"
        }
    },

    // ---------------------------------------------------------
    // クライマックス＆エンディング
    // ---------------------------------------------------------
    "scene_climax_true": {
        "text": "手を伸ばすと、温かい空気に触れた。\nそこには確かに、あの頃のままのユリが笑っていた。\n\n『やっと会えたね』\n\n言葉ではなく、心に直接響く声。\n私たちは言葉を交わさなくても、互いの想いが流れ込んでくるのを感じた。",
        "bg": ASSETS.BG_HIKARI,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "「ありがとう」と言う": "ending_true"
        }
    },
    "ending_true": {
        "text": "『ありがとう、楓ちゃん。これで私、本当に行けるよ』\n\n光が強くなり、やがて粒子となって空へと溶けていく。\nカセットテープの回転が「カチッ」と音を立てて止まった。\n\n私は涙を拭き、窓を開けた。\n入ってきた風は、もう冷たくなかった。\n\n--- True End: 銀河への旅立ち ---",
        "bg": ASSETS.BG_HIKARI,
        "bgm": ASSETS.BGM_MAIN,
        "choices": {}
    },

    "scene_climax_bitter": {
        "text": "『時間が来たみたい』\n\nテープの回転が遅くなる。\n\n『楓ちゃん、私の分まで生きてね。大人になって、恋をして、おばあちゃんになって...』\n\n最後の言葉は、ノイズに混じって消えていった。",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "speaker": "ユリ",
        "choices": {
            "カセットを取り出す": "ending_bittersweet"
        }
    },
    "ending_bittersweet": {
        "text": "静寂が戻った教室。\n手の中のカセットテープは、もうただのプラスチックの塊に戻っていた。\n\nでも、胸の痛みは消えていた。\n私はカセットをポケットにしまい、一歩を踏み出した。\n\n「さよなら、ユリちゃん」\n\n--- Normal End: ポケットの中の青春 ---",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": ASSETS.BGM_MAIN,
        "choices": {}
    },

    // ---------------------------------------------------------
    // バッドエンディング群
    // ---------------------------------------------------------
    "bad_end_stop": {
        "text": "ブチッ。\n私は強制的に再生を停止した。\n\nこれ以上聞いてはいけない気がした。\n教室を出ようとした時、背後のスピーカーから微かに声が漏れた。\n\n『...なんで...聞いてくれないの...？』\n\n電源は切れているはずなのに。\n\n--- Bad End: 残留思念 ---",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": null,
        "choices": {}
    },
    "bad_end_reject": {
        "text": "「来ないで！ あなたはもういないの！」\n\n私が叫ぶと、ラジカセからキーンという甲高い音が響き渡った。\n窓ガラスがビリビリと振動する。\n\n『ひどいよ...楓ちゃん...ずっと一緒だって言ったのに...』\n\n視界が暗転する。\n闇の中で、冷たい手が私の手首を掴んだ気がした。\n\n--- Bad End: 終わらない放課後 ---",
        "bg": ASSETS.BG_HOUKAGO,
        "bgm": null,
        "choices": {}
    }
};

// DOM要素の取得
const elements = {
    titleScreen: null,
    gameScreen: null,
    configScreen: null,
    menuScreen: null,
    background: null,
    nameBox: null,
    gameText: null,
    nextIndicator: null,
    choicesContainer: null,
    bgmPlayer: null,
    sePlayer: null
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadSettings();
    showScreen('titleScreen');
    preloadImages();
});

// DOM要素を取得
function initializeElements() {
    elements.titleScreen = document.getElementById('titleScreen');
    elements.gameScreen = document.getElementById('gameScreen');
    elements.configScreen = document.getElementById('configScreen');
    elements.menuScreen = document.getElementById('menuScreen');
    elements.background = document.getElementById('background');
    elements.nameBox = document.getElementById('nameBox');
    elements.gameText = document.getElementById('gameText');
    elements.nextIndicator = document.getElementById('nextIndicator');
    elements.choicesContainer = document.getElementById('choicesContainer');
    elements.bgmPlayer = document.getElementById('bgmPlayer');
    elements.sePlayer = document.getElementById('sePlayer');
}

// イベントリスナーの設定
function setupEventListeners() {
    // タイトル画面
    document.getElementById('startBtn').addEventListener('click', () => startNewGame());
    document.getElementById('loadBtn').addEventListener('click', () => loadGame());
    document.getElementById('configBtn').addEventListener('click', () => showScreen('configScreen'));

    // ゲーム画面
    document.getElementById('menuBtn').addEventListener('click', () => showScreen('menuScreen'));
    document.getElementById('autoBtn').addEventListener('click', () => toggleAuto());
    document.getElementById('skipBtn').addEventListener('click', () => toggleSkip());
    document.getElementById('saveBtn').addEventListener('click', () => saveGame());

    // テキストボックスクリック
    document.getElementById('textBox').addEventListener('click', () => nextText());

    // 設定画面
    document.getElementById('configBackBtn').addEventListener('click', () => showScreen('titleScreen'));
    
    // 音量設定
    document.getElementById('bgmVolume').addEventListener('input', updateBgmVolume);
    document.getElementById('seVolume').addEventListener('input', updateSeVolume);
    document.getElementById('textSpeed').addEventListener('input', updateTextSpeed);

    // メニュー画面
    document.getElementById('resumeBtn').addEventListener('click', () => showScreen('gameScreen'));
    document.getElementById('saveGameBtn').addEventListener('click', () => saveGame());
    document.getElementById('loadGameBtn').addEventListener('click', () => loadGame());
    document.getElementById('configFromMenuBtn').addEventListener('click', () => showScreen('configScreen'));
    document.getElementById('titleFromMenuBtn').addEventListener('click', () => {
        if(confirm('タイトルに戻りますか？')) showScreen('titleScreen');
    });

    // キーボード操作
    document.addEventListener('keydown', handleKeyboard);
}

// 画面切り替え
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

// 新しいゲームを開始
function startNewGame() {
    gameState = new GameState();
    showScreen('gameScreen');
    loadScene('start');
}

// シーンをロード
function loadScene(sceneId) {
    if (!scenario[sceneId]) {
        console.error('Scenario not found:', sceneId);
        return;
    }
    
    gameState.currentScene = sceneId;
    gameState.readScenes.add(sceneId);
    currentScenario = scenario[sceneId];
    
    // 背景変更
    if (currentScenario.bg) {
        changeBackground(currentScenario.bg);
    }
    
    // BGM変更
    if (currentScenario.bgm) {
        playBgm(currentScenario.bgm);
    } else if (currentScenario.bgm === null) {
        // BGM停止指示の場合
        elements.bgmPlayer.pause();
    }
    
    // 効果音再生
    if (currentScenario.se) {
        playSe(currentScenario.se);
    }
    
    // 話者名表示
    if (currentScenario.speaker) {
        elements.nameBox.textContent = currentScenario.speaker;
        elements.nameBox.style.display = 'block';
    } else {
        elements.nameBox.style.display = 'none';
    }
    
    // テキスト表示
    typeText(currentScenario.text, () => {
        showChoices();
    });
}

// 背景変更
function changeBackground(imagePath) {
    if (elements.background.getAttribute('src') === imagePath && !elements.background.classList.contains('fade-out')) {
        return;
    }

    elements.background.classList.add('fade-out');
    setTimeout(() => {
        elements.background.src = imagePath;
        elements.background.classList.remove('fade-out');
        elements.background.classList.add('fade-in');
    }, 500);
}

// BGM再生
function playBgm(audioPath) {
    const currentSrc = elements.bgmPlayer.getAttribute('src');
    // パスが異なる場合のみ再読み込み・再生
    if (!currentSrc || currentSrc.indexOf(audioPath) === -1) {
        elements.bgmPlayer.src = audioPath;
        elements.bgmPlayer.volume = gameState.bgmVolume;
        elements.bgmPlayer.play().catch(e => console.log('BGM再生エラー:', e));
    } else if (elements.bgmPlayer.paused) {
        elements.bgmPlayer.play().catch(e => console.log('BGM再開エラー:', e));
    }
}

// 効果音再生
function playSe(audioPath) {
    if (!audioPath) return;
    elements.sePlayer.src = audioPath;
    elements.sePlayer.volume = gameState.seVolume;
    elements.sePlayer.play().catch(e => console.log('SE再生エラー:', e));
}

// テキストをタイピング風に表示
function typeText(text, callback) {
    if (typeInterval) {
        clearInterval(typeInterval);
        typeInterval = null;
    }
    
    gameState.isTyping = true;
    elements.gameText.textContent = '';
    elements.nextIndicator.style.display = 'none';
    
    let index = 0;
    const speed = Math.max(10, 100 - (gameState.textSpeed * 10)); 
    
    typeInterval = setInterval(() => {
        if (index <= text.length) {
            elements.gameText.textContent = text.substring(0, index);
            index++;
        } else {
            clearInterval(typeInterval);
            typeInterval = null;
            gameState.isTyping = false;
            elements.nextIndicator.style.display = 'block';
            if (callback) callback();
        }
    }, speed);
}

// 次のテキストへ
function nextText() {
    if (gameState.isTyping) {
        // タイピング中なら強制的に全表示
        if (typeInterval) {
            clearInterval(typeInterval);
            typeInterval = null;
        }
        elements.gameText.textContent = currentScenario.text;
        gameState.isTyping = false;
        elements.nextIndicator.style.display = 'block';
        showChoices();
    }
}

// 選択肢を表示
function showChoices() {
    elements.choicesContainer.innerHTML = '';
    
    if (currentScenario.choices && Object.keys(currentScenario.choices).length > 0) {
        Object.entries(currentScenario.choices).forEach(([choiceText, nextScene]) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choiceText;
            button.addEventListener('click', () => selectChoice(nextScene));
            elements.choicesContainer.appendChild(button);
        });
    } else {
        // エンディングの場合
        setTimeout(() => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = 'タイトルに戻る';
            button.addEventListener('click', () => {
                elements.bgmPlayer.pause();
                elements.bgmPlayer.currentTime = 0;
                showScreen('titleScreen');
            });
            elements.choicesContainer.appendChild(button);
        }, 2000);
    }
}

// 選択肢を選択
function selectChoice(nextScene) {
    elements.choicesContainer.innerHTML = '';
    setTimeout(() => {
        loadScene(nextScene);
    }, 500);
}

// オートモード切り替え
function toggleAuto() {
    gameState.isAutoMode = !gameState.isAutoMode;
    const btn = document.getElementById('autoBtn');
    
    if (gameState.isAutoMode) {
        btn.style.backgroundColor = 'rgba(135, 206, 235, 0.5)';
        btn.textContent = 'オート中';
        startAutoMode();
    } else {
        btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        btn.textContent = 'オート';
        stopAutoMode();
    }
}

// オートモード開始
function startAutoMode() {
    if (!gameState.isAutoMode) return;
    
    autoInterval = setInterval(() => {
        if (!gameState.isTyping && Object.keys(currentScenario.choices || {}).length === 0) {
            nextText();
        }
    }, 3000);
}

// オートモード停止
function stopAutoMode() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// スキップ機能
function toggleSkip() {
    if (gameState.readScenes.has(gameState.currentScene)) {
        gameState.textSpeed = 10;
        setTimeout(() => {
            gameState.textSpeed = 5;
        }, 1000);
    }
}

// セーブ機能
function saveGame() {
    const saveData = {
        currentScene: gameState.currentScene,
        readScenes: Array.from(gameState.readScenes),
        gameFlags: gameState.gameFlags,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem('soundnovel_save', JSON.stringify(saveData));
    alert('セーブしました！');
}

// ロード機能
function loadGame() {
    const saveData = localStorage.getItem('soundnovel_save');
    
    if (saveData) {
        const data = JSON.parse(saveData);
        gameState.currentScene = data.currentScene;
        gameState.readScenes = new Set(data.readScenes);
        gameState.gameFlags = data.gameFlags || {};
        
        showScreen('gameScreen');
        loadScene(gameState.currentScene);
        alert('ロードしました！');
    } else {
        alert('セーブデータがありません。');
    }
}

// 設定の保存
function saveSettings() {
    const settings = {
        bgmVolume: gameState.bgmVolume,
        seVolume: gameState.seVolume,
        textSpeed: gameState.textSpeed
    };
    localStorage.setItem('soundnovel_settings', JSON.stringify(settings));
}

// 設定の読み込み
function loadSettings() {
    const settings = localStorage.getItem('soundnovel_settings');
    
    if (settings) {
        const data = JSON.parse(settings);
        gameState.bgmVolume = data.bgmVolume || 0.7;
        gameState.seVolume = data.seVolume || 0.8;
        gameState.textSpeed = data.textSpeed || 5;
        
        document.getElementById('bgmVolume').value = gameState.bgmVolume * 100;
        document.getElementById('seVolume').value = gameState.seVolume * 100;
        document.getElementById('textSpeed').value = gameState.textSpeed;
        document.getElementById('bgmVolumeValue').textContent = Math.round(gameState.bgmVolume * 100);
        document.getElementById('seVolumeValue').textContent = Math.round(gameState.seVolume * 100);
        document.getElementById('textSpeedValue').textContent = gameState.textSpeed;
    }
}

// 音量設定更新
function updateBgmVolume(e) {
    gameState.bgmVolume = e.target.value / 100;
    elements.bgmPlayer.volume = gameState.bgmVolume;
    document.getElementById('bgmVolumeValue').textContent = e.target.value;
    saveSettings();
}

function updateSeVolume(e) {
    gameState.seVolume = e.target.value / 100;
    elements.sePlayer.volume = gameState.seVolume;
    document.getElementById('seVolumeValue').textContent = e.target.value;
    saveSettings();
}

function updateTextSpeed(e) {
    gameState.textSpeed = parseInt(e.target.value);
    document.getElementById('textSpeedValue').textContent = e.target.value;
    saveSettings();
}

// キーボード操作
function handleKeyboard(e) {
    switch(e.key) {
        case 'Enter':
        case ' ':
            nextText();
            break;
        case 'Escape':
            if (document.getElementById('gameScreen').classList.contains('active')) {
                showScreen('menuScreen');
            }
            break;
        case 's':
        case 'S':
            if (e.ctrlKey) {
                e.preventDefault();
                saveGame();
            }
            break;
        case 'l':
        case 'L':
            if (e.ctrlKey) {
                e.preventDefault();
                loadGame();
            }
            break;
    }
}

// タッチ操作対応
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            if (document.getElementById('gameScreen').classList.contains('active')) {
                showScreen('menuScreen');
            }
        } else {
            nextText();
        }
    }
}

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('エラーが発生しました:', e.error);
});

function handleAudioError(audioElement, audioType) {
    audioElement.addEventListener('error', function() {
        console.warn(`${audioType}ファイルが見つかりません: ${audioElement.src}`);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    handleAudioError(elements.bgmPlayer, 'BGM');
    handleAudioError(elements.sePlayer, '効果音');
});

// 画像プリロード
function preloadImages() {
    const imageUrls = [
        ASSETS.BG_HOUKAGO,
        ASSETS.BG_HIKARI,
        'images/kasetto.png'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}