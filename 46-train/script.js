// ゲームデータ
const gameData = {
    "start": {
        text: "ガタン——車輪が何かを乗り越えた衝撃で、わずかに体が揺れた。\n車内は非常灯だけが点き、色を失ったような灰色に沈んでいる。\n他の乗客は——いない。\n窓の外は、線路の外縁まで闇が張り付いている。\nただ、ガラス越しにかすかな震えを感じた。\n外から、異形の「何か」に観察されているような気配。",
        choices: [
            {text: "車両の奥を見る", next: "scene1"},
        ],
        hasNext: true
    },
    "scene1": {
        text: "座席の背に手を置き、車両の奥を見やる。\n非常灯の光は遠くなるほど薄れ、奥は闇に溶け込んでいた。\n耳を澄ますと、一定の間隔で金属が軋む音がする。\n汗が手のひらに滲み、息が少し早くなる。\nここに自分以外の何かがいる——そう確信せざるを得なかった。",
        choices: [
            {text: "車両奥へ進む", next: "scene2"},
            {text: "スマホで時間を確認する", next: "scene3a"},
            {text: "窓の外を覗く", next: "scene3b"}
        ]
    },
    "scene2": {
        text: "奥に進むごとに足音がやけに大きく響く。\n床の金属板がわずかに沈み、冷たさが靴底から伝わってくる。\n座席の間から、何かが滑るように動いた気がした。\n視線を向けたが、そこには何もいない。\nただ、肌の上を細い糸が這うような感覚だけが残った。",
        choices: [
            {text: "さらに奥へ進む", next: "scene4"},
            {text: "元の位置に戻る", next: "scene1"},
            {text: "座席下を覗く", next: "scene6"}
        ]
    },
    "scene3a": {
        text: "ポケットからスマホを取り出す。\n画面は真っ黒…と思った瞬間、勝手に点灯した。\nロック画面の時計は「25:61」。\nバッテリー表示は∞マークに置き換わっている。\n背中に冷たい汗がつっと伝った。",
        choices: [],
        hasNext: true,
        nextScene: "scene3common"
    },
    "scene3b": {
        text: "窓ガラスに手を当てる。分厚く、ひどく冷たい。\n闇の中に、自分と同じ形の影が立っている。\nその影はわずかに首を傾けた。\nまばたきすると、もういなかった。\n心臓が痛いほどに跳ねる。",
        choices: [],
        hasNext: true,
        nextScene: "scene3common"
    },
    "scene3common": {
        text: "その「何か」は、すっと闇に溶けた。\nだが、耳の奥で——かすかな呼吸音がした。\n空気が重くなり、胸が詰まるような感覚が広がっていく。\nこのままここにいるのは危険だと直感が告げていた。",
        choices: [
            {text: "車両奥へ進む", next: "scene4"},
            {text: "別の車両に移る", next: "scene5"},
            {text: "座席下を覗く", next: "scene6"}
        ]
    },
    "scene4": {
        text: "座席の間の通路の奥で、誰かが立っているのが見えた。\n非常灯の光に照らされたその影は、人の形をしている。\nしかし、動かない。\n近づくにつれて、影の輪郭が揺らぎ始めた。\nそして、それが壁に染み込むように消えていった。",
        choices: [
            {text: "影を追う", next: "scene7"},
            {text: "元の位置に戻る", next: "scene1"},
            {text: "座席下を覗く", next: "scene6"}
        ]
    },
    "scene5": {
        text: "隣の車両に移動するためドアに手をかけた。\n金属の冷たさが骨まで染みる。\n小さな窓越しに暗い通路が見える。\n幌がわずかにきしみ、かすかな風が頬を撫でた。\nその風が、生臭い匂いを運んできた。",
        choices: [
            {text: "隣の車両に入る", next: "scene7"},
            {text: "元の車両に戻る", next: "scene1"},
            {text: "ドアの外を覗く", next: "scene8"}
        ]
    },
    "scene6": {
        text: "座席の下に顔を近づける。\n暗闇の中、何かがじっとこちらを見ている。\n目が合った瞬間、それが笑った。\n体が反射的に後ずさる。\nただ、その視線は離れなかった。",
        choices: [
            {text: "逃げる", next: "badend1"},
            {text: "拾って持つ", next: "scene9a"},
            {text: "避けて進む", next: "scene9b"}
        ]
    },
    "scene7": {
        text: "貫通路を抜け、隣の車両に足を踏み入れた。\n暗い車両内で、かすかな人影が見える。\n立っているのか、吊られているのか判別できない。\n非常灯の明滅に合わせて、その影は揺れる。\n近づくと、足元に濡れた跡が広がっていた。\n鼻を刺すような鉄の匂いが充満している。",
        choices: [
            {text: "影に声をかける", next: "scene7voice"},
            {text: "そっと通り過ぎる", next: "scene11"},
            {text: "引き返す", next: "scene12"}
        ]
    },
    "scene7voice": {
        text: "「すみません、大丈夫ですか？」\n声をかけた瞬間、その影が微かに動いた。\n非常灯がちらつき、影の輪郭が歪む。\n空気が重くなり、喉が詰まるような感覚。\n影がゆっくりとこちらを向き始めた——。",
        choices: [],
        hasNext: true,
        nextScene: "badend2"
    },
    "scene8": {
        text: "ドアの外を覗くと、幌の向こうに何かが動いている。\nそれは人ではない。\n長い腕のようなものが、ゆっくりと這っている。\n気づかれる前に、そっと身を引いた。\n背後から、かすかな笑い声が聞こえた。",
        choices: [
            {text: "急いで別の場所へ", next: "scene13"},
            {text: "その場に隠れる", next: "badend5"},
            {text: "立ち向かう", next: "scene14"}
        ]
    },
    "scene9a": {
        text: "座席下から引きずり出したのは、古びた鉄パイプだった。\n冷たく湿っていて、手に嫌な感触が残る。\nどこかで使えるかもしれないが、妙な重さを感じる。\n握るたび、指先から心臓にかけて冷えが広がるようだ。\nそれでも武器になるはずだと、自分に言い聞かせた。",
        choices: [],
        hasNext: true,
        nextScene: "scene10",
        hasWeapon: true
    },
    "scene9b": {
        text: "座席下の闇を視界の端に押しやり、歩を進めた。\n背後から視線が追ってくる感覚があったが、振り返らなかった。\n踏みしめるたび、金属音が鈍く響く。\n少しでも早く、あの気配から離れたかった。\n胸の奥がじんじんと熱を帯び始める。",
        choices: [],
        hasNext: true,
        nextScene: "scene10"
    },
    "scene10": {
        text: "座席下の気配から離れ、車両の奥へと進んだ。\n貫通路の手前で、かすかな人影が見える。\n立っているのか、吊られているのか判別できない。\n非常灯の明滅に合わせて、その影は揺れる。\n近づくと、足元に濡れた跡が広がっていた。\n鼻を刺すような鉄の匂いが充満している。",
        choices: [
            {text: "影に声をかける", next: "scene10voice"},
            {text: "そっと通り過ぎる", next: "scene11"},
            {text: "引き返す", next: "scene12"}
        ]
    },
    "scene10voice": {
        text: "「すみません、大丈夫ですか？」\n声をかけた瞬間、その影が微かに動いた。\n非常灯がちらつき、影の輪郭が歪む。\n空気が重くなり、喉が詰まるような感覚。\n影がゆっくりとこちらを向き始めた——。",
        choices: [],
        hasNext: true,
        nextScene: "badend2"
    },
    "scene11": {
        text: "息を殺し、影の横を通り過ぎる。\n足音が響かないよう、慎重に歩を運ぶ。\nすれ違う瞬間、影が微かに動いた気がした。\n視線を逸らし、ただ前だけを見つめる。\nやがて、その気配は背後に遠ざかっていった。",
        choices: [],
        hasNext: true,
        nextScene: "scene13"
    },
    "scene12": {
        text: "引き返す途中、背後で何かが床を這う音がする。\n振り返ると、低くうねる影が迫ってきていた。\n心臓が激しく跳ね、息が荒くなる。\n影は確実にこちらに向かっている。\n逃げ場は限られていた。",
        choices: [
            {text: "全力で走る", next: "badend3"},
            {text: "別の車両へ向かう", next: "scene13"},
            {text: "立ちすくむ", next: "badend4"}
        ]
    },
    "scene13": {
        text: "別の車両へ向かうため、貫通路を進む。\n暗い車両内、ドアが半開きになっている。\nそこから淡い光が漏れていた。\n光の中には、ぼんやりとした人影が立っている。\nまるでこちらを待っているかのようだ。\nその場の空気が妙に澄んでいる。",
        choices: [
            {text: "光へ進む", next: "scene15"},
            {text: "立ち止まって様子を見る", next: "badend5"},
            {text: "後ろの車両へ戻る", next: "scene12"}
        ]
    },
    "scene14": {
        text: "貫通路を進むと、前方に非常灯が点いている車両が見える。\nしかし、その間にある車両は真っ暗だ。\n暗闇の奥からは低い唸り声が聞こえる。\n足元には何かが擦れる音。\n非常灯の明かりが心許なく揺れている。",
        choices: [
            {text: "明るい車両へ進む", next: "scene15"},
            {text: "暗い車両へ進む", next: "badend6"},
            {text: "後ろの車両へ戻る", next: "scene12"}
        ]
    },
    "scene15": {
        text: "光の先に足を踏み入れると、車両が急に明るくなった。\nだが、そこには座席が並んでいない。\n代わりに、真っ白な空間がどこまでも続いている。\n遠くで誰かがこちらを見ていた。\nその顔は、紛れもなく自分だった。\n次の瞬間、視界が白に塗り潰された——。",
        choices: [
            {text: "もう一度プレイする", next: "start"},
            {text: "メニューに戻る", next: "menu"}
        ],
        isEnding: true,
        endingType: "true"
    },
    // BAD ENDシーン
    "badend1": {
        text: "座席に座る人が、ゆっくりと口を閉じた。\n空気が固まり、息ができない。\n真っ黒な目が、まっすぐこちらを見ている。\n足元から黒い影が伸び、足をつかむ。\n影は腰、胸へと広がっていく。\n目をそらそうとしても動けない。\nその口が笑った瞬間、すべてが真っ暗になった。",
        isEnding: true,
        endingType: "bad"
    },
    "badend2": {
        text: "声をかけた瞬間、その影が振り向いた。\n顔の半分が欠け、黒い液体が滴っている。\n口が裂け、耳元まで届くほどに開いた。\n次の瞬間、胸に何かが突き刺さる感覚。\n視界が赤く染まる。\n呼吸ができない。\nその笑い声が耳の奥に残ったまま、意識が途切れた。",
        isEnding: true,
        endingType: "bad"
    },
    "badend3": {
        text: "避けようとした瞬間、足首を掴まれた。\n冷たい感触が骨まで伝わる。\n引きずり込まれ、床の下に落ちる感覚。\n暗闇の中で何かが耳元で囁いた。\n言葉の意味はわからない。\nただ、二度と戻れないと直感した。\nそして、世界は完全な闇に沈んだ。",
        isEnding: true,
        endingType: "bad"
    },
    "badend4": {
        text: "影を飛び越えた瞬間、背中を何かが撫でた。\n熱い液体が首筋を伝う。\n着地した時には足が動かなくなっていた。\n影が背後から覆いかぶさる。\n骨が軋み、呼吸が潰れる。\n意識が落ちる寸前、耳元で笑い声が響いた。\nその声が、自分のものに聞こえた。",
        isEnding: true,
        endingType: "bad"
    },
    "badend5": {
        text: "立ち止まった瞬間、光の中の人影が消えた。\n足元に冷たい感触が広がる。\n見下ろすと、自分の影が動いている。\nその影が足を掴み、引きずり込もうとする。\n体が地面に沈んでいく感覚。\n叫ぼうとしたが声が出ない。\n目を閉じた瞬間、全てが闇になった。",
        isEnding: true,
        endingType: "bad"
    },
    "badend6": {
        text: "暗い方へ踏み出した瞬間、空気が一変した。\n息が重く、視界が滲む。\n何かが背後にぴたりと張り付く感覚。\n耳元で低く笑う声が響く。\n足が勝手に前へ進み、止められない。\n視界の先は終わりのない暗闇。\nそのまま、すべてが消えた。",
        isEnding: true,
        endingType: "bad"
    }
};

// ゲーム状態管理
class GameState {
    constructor() {
        this.currentScene = 'start';
        this.history = [];
        this.hasWeapon = false;
        this.textIndex = 0;
        this.isShowingChoices = false;
    }

    reset() {
        this.currentScene = 'start';
        this.history = [];
        this.hasWeapon = false;
        this.textIndex = 0;
        this.isShowingChoices = false;
    }

    saveState() {
        this.history.push({
            scene: this.currentScene,
            hasWeapon: this.hasWeapon,
            textIndex: this.textIndex
        });
    }

    goBack() {
        if (this.history.length > 0) {
            const prevState = this.history.pop();
            this.currentScene = prevState.scene;
            this.hasWeapon = prevState.hasWeapon;
            this.textIndex = prevState.textIndex;
            return true;
        }
        return false;
    }
}

// ゲームクラス
class SoundNovelGame {
    constructor() {
        this.gameState = new GameState();
        this.currentText = '';
        this.textSpeed = 50; // ミリ秒
        this.isTyping = false;
        this.typingTimer = null;
        
        // 音声・振動設定
        this.audioContext = null;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        
        this.initializeAudio();
        this.initializeElements();
        this.bindEvents();
        this.showScreen('menu');
    }

    // 音声システムの初期化
    initializeAudio() {
        // AudioContextはユーザーインタラクション後に初期化される
        // 最初のクリック時に初期化する
    }

    // AudioContextを初期化（ユーザーインタラクション後）
    ensureAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not supported:', e);
                this.soundEnabled = false;
            }
        }
        
        // サスペンド状態の場合は再開
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // クリック音を生成（カチリ音）
    playClickSound() {
        if (!this.soundEnabled) return;
        
        this.ensureAudioContext();
        
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 短いクリック音（高音→低音）
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    // 触覚フィードバック（振動）
    playVibration() {
        if (!this.vibrationEnabled || !navigator.vibrate) return;

        try {
            // 短い振動パターン（10ms）
            navigator.vibrate(10);
        } catch (e) {
            console.warn('Vibration not supported:', e);
        }
    }

    // ボタンクリック時のフィードバック（音 + 振動）
    playButtonFeedback() {
        this.playClickSound();
        this.playVibration();
    }

    initializeElements() {
        // 画面要素
        this.screens = {
            menu: document.getElementById('menu'),
            game: document.getElementById('game'),
            about: document.getElementById('about'),
            gameOver: document.getElementById('gameOver')
        };

        // ゲーム要素
        this.storyText = document.getElementById('storyText');
        this.choicesArea = document.getElementById('choicesArea');
        this.nextBtn = document.getElementById('nextBtn');
        this.backBtn = document.getElementById('backBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.textArea = document.getElementById('textArea');
        this.statusItems = document.getElementById('statusItems');
        this.textHint = document.getElementById('textHint');

        // その他のボタン
        this.startBtn = document.getElementById('startBtn');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        this.backToMenuBtn2 = document.getElementById('backToMenuBtn2');
        this.retryBtn = document.getElementById('retryBtn');
        this.gameOverText = document.getElementById('gameOverText');
    }

    bindEvents() {
        // メニューボタン
        this.startBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.startGame();
        });
        this.aboutBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.showScreen('about');
        });
        this.backToMenuBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.showScreen('menu');
        });
        this.backToMenuBtn2.addEventListener('click', () => {
            this.playButtonFeedback();
            this.showScreen('menu');
        });
        this.retryBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.startGame();
        });

        // ゲームコントロール
        this.nextBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.nextText();
        });
        this.backBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.goBack();
        });
        this.menuBtn.addEventListener('click', () => {
            this.playButtonFeedback();
            this.showScreen('menu');
        });

        // キーボード操作（PC用）
        document.addEventListener('keydown', (e) => {
            if (this.screens.game.classList.contains('active')) {
                switch(e.key) {
                    case ' ':
                    case 'Enter':
                        e.preventDefault();
                        this.playButtonFeedback();
                        if (this.isTyping) {
                            this.skipTyping();
                        } else {
                            this.nextText();
                        }
                        break;
                    case 'Backspace':
                        e.preventDefault();
                        this.playButtonFeedback();
                        this.goBack();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.playButtonFeedback();
                        this.showScreen('menu');
                        break;
                }
            }
        });

        // タッチ操作対応
        this.storyText.addEventListener('click', () => {
            this.playButtonFeedback();
            if (this.isTyping) {
                this.skipTyping();
            } else if (!this.isShowingChoices) {
                this.nextText();
            }
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 即座に表示（アニメーションはCSS transitionで処理）
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.gameState.reset();
        this.showScreen('game');
        // 状態表示を初期化
        this.updateStatusDisplay();
        this.loadScene('start');
    }

    loadScene(sceneId) {
        const scene = gameData[sceneId];
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return;
        }

        this.gameState.currentScene = sceneId;
        this.gameState.textIndex = 0;
        
        // 武器の状態を更新
        if (scene.hasWeapon) {
            this.gameState.hasWeapon = true;
        }

        // 状態表示を更新
        this.updateStatusDisplay();

        // エンディング判定
        if (scene.isEnding) {
            if (scene.endingType === 'bad') {
                this.showGameOver(scene.text);
                return;
            } else if (scene.endingType === 'true') {
                this.showTrueEnding(scene.text);
                return;
            }
        }

        this.displayText(scene.text);
        this.setupScene(scene);
    }

    displayText(text) {
        this.currentText = text.replace(/\\n/g, '\n');
        this.storyText.innerHTML = '';
        this.isTyping = true;
        this.isShowingChoices = false;
        
        // テキストエリアのヒントを表示
        if (this.textArea) {
            this.textArea.classList.remove('has-choices');
        }
        if (this.textHint) {
            this.textHint.style.opacity = '0.7';
        }
        
        this.updateControls();
        
        this.typeText(0);
    }

    typeText(index) {
        if (index < this.currentText.length) {
            const char = this.currentText[index];
            if (char === '\n') {
                this.storyText.innerHTML += '<br>';
            } else {
                this.storyText.innerHTML += char;
            }
            
            this.typingTimer = setTimeout(() => {
                this.typeText(index + 1);
            }, this.textSpeed);
        } else {
            this.isTyping = false;
            this.onTextComplete();
        }
    }

    skipTyping() {
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
        }
        
        this.storyText.innerHTML = this.currentText.replace(/\n/g, '<br>');
        this.isTyping = false;
        this.onTextComplete();
    }

    onTextComplete() {
        const scene = gameData[this.gameState.currentScene];
        
        if (scene.hasNext && !scene.choices.length) {
            // 次へボタンで進む
            this.updateControls();
        } else if (scene.choices && scene.choices.length > 0) {
            // 選択肢を表示
            this.showChoices(scene.choices);
        }
    }

    setupScene(scene) {
        this.choicesArea.innerHTML = '';
        
        if (scene.choices && scene.choices.length > 0 && !this.isTyping) {
            this.showChoices(scene.choices);
        }
    }

    showChoices(choices) {
        this.isShowingChoices = true;
        this.choicesArea.innerHTML = '';
        
        // 選択肢表示時はテキストエリアのヒントを非表示
        if (this.textArea) {
            this.textArea.classList.add('has-choices');
        }
        if (this.textHint) {
            this.textHint.style.opacity = '0.3';
        }
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', () => {
                this.playButtonFeedback();
                this.selectChoice(choice);
            });
            
            // アニメーション遅延
            setTimeout(() => {
                this.choicesArea.appendChild(button);
            }, index * 100);
        });
        
        this.updateControls();
    }

    selectChoice(choice) {
        if (choice.next) {
            this.gameState.saveState();
            this.loadScene(choice.next);
        }
    }

    nextText() {
        if (this.isTyping) {
            this.skipTyping();
            return;
        }

        const scene = gameData[this.gameState.currentScene];
        
        if (scene.hasNext && scene.nextScene) {
            this.gameState.saveState();
            this.loadScene(scene.nextScene);
        } else if (scene.hasNext && scene.choices && scene.choices.length > 0) {
            this.showChoices(scene.choices);
        }
    }

    goBack() {
        if (this.gameState.goBack()) {
            this.loadScene(this.gameState.currentScene);
        }
    }

    updateControls() {
        const scene = gameData[this.gameState.currentScene];
        
        // Next ボタンの表示制御
        if (this.isTyping) {
            this.nextBtn.textContent = 'スキップ';
            this.nextBtn.style.display = 'block';
        } else if (scene.hasNext && !this.isShowingChoices) {
            this.nextBtn.textContent = '次へ';
            this.nextBtn.style.display = 'block';
        } else {
            this.nextBtn.style.display = 'none';
        }
        
        // Back ボタンの表示制御
        this.backBtn.style.display = this.gameState.history.length > 0 ? 'block' : 'none';
        
        // テキストヒントの表示制御
        if (this.textHint && this.textArea) {
            if (this.isShowingChoices) {
                this.textHint.style.opacity = '0.3';
                this.textArea.classList.add('has-choices');
            } else {
                this.textHint.style.opacity = '0.7';
                this.textArea.classList.remove('has-choices');
            }
        }
    }

    // 状態表示を更新
    updateStatusDisplay() {
        if (!this.statusItems) return;
        
        this.statusItems.innerHTML = '';
        
        // 武器所持状態の表示
        if (this.gameState.hasWeapon) {
            const weaponItem = document.createElement('div');
            weaponItem.className = 'status-item';
            weaponItem.innerHTML = '<span class="status-item-icon">⚔</span><span>武器所持</span>';
            this.statusItems.appendChild(weaponItem);
        }
    }

    showGameOver(text) {
        this.gameOverText.innerHTML = text.replace(/\\n/g, '<br>');
        this.showScreen('gameOver');
    }

    showTrueEnding(text) {
        // トゥルーエンディングの特別演出
        this.storyText.innerHTML = text.replace(/\\n/g, '<br>') + '<br><br>ゲームクリア　2章へ続く';
        this.isShowingChoices = true;
        
        // 特別な選択肢を表示
        const endingChoices = [
            {text: 'もう一度最初から', next: 'start'},
            {text: 'メニューに戻る', action: 'menu'}
        ];
        
        this.choicesArea.innerHTML = '';
        endingChoices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.style.background = 'linear-gradient(145deg, #4a4a4a, #3a3a3a)';
            button.style.borderColor = '#66ff66';
            
            button.addEventListener('click', () => {
                this.playButtonFeedback();
                if (choice.next) {
                    this.gameState.saveState();
                    this.loadScene(choice.next);
                } else if (choice.action === 'menu') {
                    this.showScreen('menu');
                }
            });
            
            setTimeout(() => {
                this.choicesArea.appendChild(button);
            }, index * 200);
        });
        
        this.updateControls();
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new SoundNovelGame();
    
    // エラーハンドリング
    window.addEventListener('error', (e) => {
        console.error('Game Error:', e.error);
    });
});