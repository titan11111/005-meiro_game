// QUIZ//NEON: 記憶都市の支配者
// ゲームロジック (Audio & Boss Update)

class QuizNeonGame {
    constructor() {
        this.questions = this.initializeQuestions();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.gameMode = 'standard';
        this.playerName = 'ANONYMOUS';
        this.timer = null;
        this.timeLeft = 15;
        this.totalQuestions = 10;
        this.selectedQuestions = [];
        this.wrongAnswers = 0;
        this.maxWrongAnswers = 3;
        
        // オーディオ要素
        this.bgmMenu = document.getElementById('bgm-menu');
        this.bgmGame = document.getElementById('bgm-game');
        this.audioEnabled = true;

        // ボス問題の設定（インデックスは0始まり）
        // 2=3問目, 6=7問目, 9=10問目
        this.bossStages = [2, 6, 9]; 

        this.initializeEventListeners();
        this.initializeAudio();
    }

    // クイズデータの初期化
    initializeQuestions() {
        return [
            {
                question: "日本人の血液型で一番多いのはA型。世界的に見ると何型が最も多い？",
                choices: ["A型", "B型", "O型", "AB型"],
                correct: 2,
                explanation: "世界ではO型が最も多く、約45%を占めます。"
            },
            {
                question: "コオロギの耳はどこにある？",
                choices: ["顔の横", "頭頂部", "お尻", "足"],
                correct: 3,
                explanation: "前足の脛の部分にあります。"
            },
            {
                question: "達筆な人が書いたメモを見て「汚い字だ」と言われた理由は？",
                choices: ["本当に汚かった", "「汚い字」と書いてあった", "別人が書いた", "達筆すぎた"],
                correct: 1,
                explanation: "書かれていた内容が「汚い字」だったため。"
            },
            {
                question: "アルファベットの最後の文字は？",
                choices: ["Z", "B", "T", "R"],
                correct: 2,
                explanation: "\"ALPHABET\"という単語の最後の文字がT。"
            },
            {
                question: "いちご狩りで10個をカゴに入れ、さらに5個を別に入れた。カゴの中はいくつ？",
                choices: ["0個", "5個", "10個", "15個"],
                correct: 2,
                explanation: "「さらに5個」は別の場所に入れたとされている。"
            },
            {
                question: "マラソンで2位の人を抜いたら何位？",
                choices: ["1位", "2位", "3位", "4位"],
                correct: 1,
                explanation: "2位の人を抜いたので、自分が2位になります。"
            },
            {
                question: "「かき氷」を漢字で正しく書くと？",
                choices: ["書き氷", "掻き氷", "欠き氷", "化き氷"],
                correct: 2,
                explanation: "氷を\"欠いて\"作ることが由来。"
            },
            {
                question: "うさぎの正しい数え方は？",
                choices: ["一匹", "一頭", "一羽", "一尾"],
                correct: 2,
                explanation: "鳥と同じように扱われ、一羽と数えます。"
            },
            {
                question: "高齢者が\"シルバー\"と呼ばれる理由は？",
                choices: ["髪の色", "敬意を込めて", "優先席の色", "銀婚式から"],
                correct: 2,
                explanation: "シルバーシートに由来。"
            },
            {
                question: "アスパラガスは1日に何cm伸びる？",
                choices: ["1cm", "3cm", "6cm", "10cm"],
                correct: 2,
                explanation: "条件が良いと6cm以上伸びることも。"
            },
            {
                question: "お寿司の「玉子」は元々何料理の流れ？",
                choices: ["和食", "洋食", "中華", "精進料理"],
                correct: 1,
                explanation: "オムレツに似た調理法がルーツ。"
            },
            {
                question: "日本で一番多い名字は？",
                choices: ["佐藤", "鈴木", "高橋", "田中"],
                correct: 0,
                explanation: "全国で最も多い姓は佐藤です。"
            },
            {
                question: "「海のミルク」と呼ばれる食品は？",
                choices: ["白子", "牡蠣", "牛乳寒天", "ウニ"],
                correct: 1,
                explanation: "栄養価が高いためこう呼ばれます。"
            },
            {
                question: "「魚へんに春」と書く魚は？",
                choices: ["鯛", "鮪", "鰆", "鰯"],
                correct: 2,
                explanation: "春が旬の魚であることから。"
            },
            {
                question: "にんにくの匂いの原因成分は？",
                choices: ["カプサイシン", "アリシン", "グルタミン酸", "クエン酸"],
                correct: 1,
                explanation: "切ったり潰した際に発生します。"
            },
            {
                question: "ポテトチップスの発明国は？",
                choices: ["イギリス", "ドイツ", "アメリカ", "フランス"],
                correct: 2,
                explanation: "1853年にアメリカで誕生しました。"
            },
            {
                question: "人間の骨の数は大人で何本？",
                choices: ["106本", "206本", "306本", "406本"],
                correct: 1,
                explanation: "子どもは300本以上あるが、成長とともに癒合します。"
            },
            {
                question: "地球で最も深い海は？",
                choices: ["日本海溝", "トンガ海溝", "マリアナ海溝", "カリフォルニア海溝"],
                correct: 2,
                explanation: "最深部は約11,000メートル。"
            },
            {
                question: "「月が綺麗ですね」の意味は？",
                choices: ["天気の話", "文学的表現", "愛の告白", "自然観察"],
                correct: 2,
                explanation: "夏目漱石が\"I love you\"をこのように訳したという逸話から。"
            },
            {
                question: "1万円札に描かれていないのは？",
                choices: ["鳳凰", "富士山", "桜", "署名"],
                correct: 1,
                explanation: "歴代の一万円札に富士山は描かれていません。"
            },
            {
                question: "マヨネーズの主材料は？",
                choices: ["卵と砂糖", "卵と酢", "牛乳と酢", "卵と塩"],
                correct: 1,
                explanation: "酢と油を卵黄で乳化させて作られます。"
            },
            {
                question: "コーヒーを飲むと眠れなくなる原因物質は？",
                choices: ["タンニン", "カフェイン", "ポリフェノール", "アルカロイド"],
                correct: 1,
                explanation: "中枢神経を刺激する作用があります。"
            },
            {
                question: "アサガオは何科の植物？",
                choices: ["ヒルガオ科", "ナス科", "マメ科", "アブラナ科"],
                correct: 0,
                explanation: "ヒルガオ科サツマイモ属の植物です。"
            },
            {
                question: "日本の国鳥は？",
                choices: ["スズメ", "キジ", "フクロウ", "ハト"],
                correct: 1,
                explanation: "古来より日本に親しまれ、国鳥とされています。"
            },
            {
                question: "天ぷらが日本に伝来した国は？",
                choices: ["中国", "朝鮮", "ポルトガル", "オランダ"],
                correct: 2,
                explanation: "16世紀に宣教師が持ち込んだとされます。"
            },
            {
                question: "カタカナの「シ」と「ツ」の違いは？",
                choices: ["点の数", "線の長さ", "点の角度", "書き順"],
                correct: 2,
                explanation: "「シ」は横向き、「ツ」は縦に点が打たれています。"
            },
            {
                question: "風呂敷の元々の用途は？",
                choices: ["野菜を包む", "衣服を包む", "風呂道具を包む", "弁当を包む"],
                correct: 2,
                explanation: "銭湯で衣服や道具を包む布として使われていました。"
            },
            {
                question: "アイスクリームの賞味期限は？",
                choices: ["1年", "3年", "無期限", "6ヶ月"],
                correct: 2,
                explanation: "法律上、冷凍食品には賞味期限の表示義務がありません。"
            },
            {
                question: "「鯨（くじら）」に心を加えるとできる漢字は？",
                choices: ["恵", "憂", "憩", "憬"],
                correct: 3,
                explanation: "憬（あこがれ）になります。"
            },
            {
                question: "世界初の郵便切手を発行した国は？",
                choices: ["日本", "中国", "アメリカ", "イギリス"],
                correct: 3,
                explanation: "1840年に「ペニー・ブラック」が発行されました。"
            },
            {
                question: "「鈴木さん」が日本に多い理由は？",
                choices: ["侍の家系だったため", "読みやすく書きやすい", "古代からの地名に由来", "天皇家と縁がある"],
                correct: 2,
                explanation: "熊野地方の神職「すすき」を起源とし、広まったとされています。"
            },
            {
                question: "雨上がりに虫が増える理由は？",
                choices: ["水に浮かんで移動する", "光が反射するから", "地中が柔らかくなるから", "気温が下がるから"],
                correct: 2,
                explanation: "雨で土が緩み、昆虫やミミズが地表に出てきやすくなります。"
            },
            {
                question: "猫の「修正」とは何を意味する？",
                choices: ["性格を穏やかにすること", "耳を洗うこと", "去勢・避妊手術のこと", "しつけ直しのこと"],
                correct: 2,
                explanation: "保護活動などで用いられる専門用語です。"
            },
            {
                question: "ポケモンカードで高額取引されたのは？",
                choices: ["ミュウ", "ピカチュウ イラストレーター", "リザードン 通常版", "カスミのお願い"],
                correct: 1,
                explanation: "非売品で世界に少数しか存在せず、1億円超の取引実績もあります。"
            },
            {
                question: "最も長く鳴くセミの仲間は？",
                choices: ["アブラゼミ（日本）", "ツクツクボウシ（日本）", "マジックイーダ（北米）", "アカエゾゼミ（ロシア）"],
                correct: 2,
                explanation: "13年または17年ごとに地中から大量発生します。"
            },
            {
                question: "新型コロナウイルスは何に分類される？",
                choices: ["細菌", "カビ", "ウイルス", "寄生虫"],
                correct: 2,
                explanation: "自己増殖できず、細胞に寄生して増える病原体です。"
            },
            {
                question: "ウイルスと細菌の違いとして正しいのは？",
                choices: ["細菌は寄生しないがウイルスは寄生する", "ウイルスには抗生物質が効く", "ウイルスは細胞を持つ", "細菌は宿主がいないと生きられない"],
                correct: 0,
                explanation: "細菌は独立して生存可能ですが、ウイルスは宿主細胞が必要です。"
            },
            {
                question: "空が青く見える理由は？",
                choices: ["海の色を反射しているから", "青いガスがあるから", "青い光が散乱されるから", "太陽の色が青いから"],
                correct: 2,
                explanation: "レイリー散乱により、青い波長の光が広がります。"
            },
            {
                question: "カラスの視力について正しいのは？",
                choices: ["人間より悪い", "色が見えない", "赤外線が見える", "紫外線が見える"],
                correct: 3,
                explanation: "鳥類は一般に紫外線を感知できます。"
            },
            {
                question: "1円玉の素材は？",
                choices: ["鉄", "銀", "アルミニウム", "スズ"],
                correct: 2,
                explanation: "非常に軽く、電気伝導性にも優れます。"
            },
            {
                question: "日本で最も小さい都道府県は？",
                choices: ["大阪府", "鳥取県", "香川県", "富山県"],
                correct: 2,
                explanation: "面積は約1,877㎢。全国最小です。"
            },
            {
                question: "「赤信号、みんなで渡れば…」の続きは？",
                choices: ["注意される", "安全", "怖くない", "怒られる"],
                correct: 2,
                explanation: "コント55号の萩本欽一のギャグから。"
            },
            {
                question: "体の中で最も力の強い筋肉は？",
                choices: ["大胸筋", "大腿四頭筋", "心臓", "咬筋"],
                correct: 3,
                explanation: "奥歯で噛む力は非常に強く、他の筋肉を上回ります。"
            },
            {
                question: "次のうち「植物」ではないのは？",
                choices: ["苔", "菌類", "シダ", "草"],
                correct: 1,
                explanation: "キノコやカビなどの菌類は植物ではなく独立した分類群です。"
            },
            {
                question: "富士山の山頂はどの都道府県？",
                choices: ["静岡県のみ", "山梨県のみ", "両方", "神奈川県"],
                correct: 2,
                explanation: "山頂部分は県境になっています。"
            },
            {
                question: "世界で最も話されている言語（母語）は？",
                choices: ["英語", "ヒンディー語", "スペイン語", "中国語"],
                correct: 3,
                explanation: "母語話者が10億人を超えます。"
            },
            {
                question: "日本の稲作は年に何回収穫される？",
                choices: ["1回", "2回", "3回", "月1回"],
                correct: 0,
                explanation: "年に一度、春に田植え・秋に収穫するのが基本です。"
            },
            {
                question: "ホタルが光る理由は？",
                choices: ["熱で反応する", "怒っている", "交尾のサイン", "敵を威嚇するため"],
                correct: 2,
                explanation: "光は異性へのアピール手段です。"
            },
            {
                question: "「土用の丑の日」に食べるものは？",
                choices: ["さば", "たい", "うなぎ", "あなご"],
                correct: 2,
                explanation: "平賀源内の提案が始まりと言われています。"
            },
            {
                question: "「0.999…」はどれと等しい？",
                choices: ["1より小さい", "1と等しい", "無限大", "0"],
                correct: 1,
                explanation: "数学的に極限値は1と一致します（0.999… = 1）。"
            },
            {
                question: "世界で最も深い湖は？",
                choices: ["バイカル湖", "カスピ海", "スペリオル湖", "琵琶湖"],
                correct: 0,
                explanation: "ロシアのバイカル湖で、最深部は約1,642メートルです。"
            },
            {
                question: "1年で最も昼が短い日は？",
                choices: ["春分の日", "夏至", "秋分の日", "冬至"],
                correct: 3,
                explanation: "冬至は北半球で昼が最も短くなる日です。"
            },
            {
                question: "血液の赤い色の原因は？",
                choices: ["赤血球", "ヘモグロビン", "血小板", "血漿"],
                correct: 1,
                explanation: "ヘモグロビンに含まれる鉄分が酸素と結合して赤くなります。"
            },
            {
                question: "虹は何色に見える？",
                choices: ["5色", "6色", "7色", "8色"],
                correct: 2,
                explanation: "赤・橙・黄・緑・青・藍・紫の7色とされています。"
            },
            {
                question: "地球の自転周期は？",
                choices: ["23時間56分", "24時間", "24時間4分", "25時間"],
                correct: 0,
                explanation: "恒星を基準とした自転周期は23時間56分4秒です。"
            }
        ];
    }

    // イベントリスナーの初期化
    initializeEventListeners() {
        // モード選択
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameMode = e.target.dataset.mode;
                this.playButtonSound();
            });
        });

        // ゲーム開始
        document.getElementById('start-game').addEventListener('click', () => {
            this.tryPlayMenuBgm(); // ユーザー操作をトリガーにBGM再生試行
            this.startGame();
        });

        // 選択肢クリック
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectAnswer(parseInt(e.currentTarget.dataset.choice));
            });
        });

        // リトライボタン
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.resetGame();
            this.stopBgm();
            this.tryPlayMenuBgm();
            this.showScreen('start-screen');
        });

        // シェアボタン
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareResult();
        });

        // エンターキーでゲーム開始
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });

        // ページクリックでBGM初期化（ブラウザポリシー対策）
        document.addEventListener('click', () => {
            if (this.bgmMenu.paused && document.getElementById('start-screen').classList.contains('active')) {
                this.tryPlayMenuBgm();
            }
        }, { once: true });
    }

    // 音声効果の初期化
    initializeAudio() {
        if(this.bgmMenu) this.bgmMenu.volume = 0.4;
        if(this.bgmGame) this.bgmGame.volume = 0.3;
    }

    tryPlayMenuBgm() {
        if (this.bgmMenu) {
            this.bgmMenu.play().catch(e => console.log('Audio autoplay prevented'));
        }
    }

    stopBgm() {
        if(this.bgmMenu) {
            this.bgmMenu.pause();
            this.bgmMenu.currentTime = 0;
        }
        if(this.bgmGame) {
            this.bgmGame.pause();
            this.bgmGame.currentTime = 0;
        }
    }

    // ゲーム開始
    startGame() {
        this.playerName = document.getElementById('player-name').value.trim() || 'ANONYMOUS';
        this.resetGame();
        this.selectRandomQuestions();
        this.showScreen('game-screen');
        
        // BGM切り替え
        if (this.bgmMenu) this.bgmMenu.pause();
        if (this.bgmGame) {
            this.bgmGame.currentTime = 0;
            this.bgmGame.play().catch(e => console.log('Game BGM play failed'));
        }

        this.displayQuestion();
        this.playButtonSound();
    }

    // ゲーム状態リセット
    resetGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.wrongAnswers = 0;
        this.selectedQuestions = [];
        this.clearTimer();
        document.body.classList.remove('boss-active'); // ボスモード解除
    }

    // ランダムな問題を選択
    selectRandomQuestions() {
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
        this.selectedQuestions = shuffled.slice(0, this.totalQuestions);
    }

    // 画面表示切り替え
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        document.getElementById(screenId).classList.add('screen-transition');
        
        setTimeout(() => {
            document.getElementById(screenId).classList.remove('screen-transition');
        }, 500);
    }

    // 問題表示
    displayQuestion() {
        const question = this.selectedQuestions[this.currentQuestionIndex];
        
        // ボスモード判定 (インデックスが含まれていればオン)
        const isBossStage = this.bossStages.includes(this.currentQuestionIndex);
        
        if (isBossStage) {
            document.body.classList.add('boss-active');
            const warningEl = document.getElementById('boss-warning');
            warningEl.classList.remove('hidden');
            setTimeout(() => warningEl.classList.add('hidden'), 2000);
        } else {
            document.body.classList.remove('boss-active');
            document.getElementById('boss-warning').classList.add('hidden');
        }

        // 問題番号更新
        document.getElementById('question-number').textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        
        // 問題文表示
        document.getElementById('question-text').textContent = question.question;
        
        // 選択肢表示
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach((btn, index) => {
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
            btn.querySelector('.choice-text').textContent = question.choices[index];
        });
        
        // タイマー開始
        this.startTimer();
        
        // 統計更新
        this.updateStats();
    }

    // タイマー開始
    startTimer() {
        this.timeLeft = 15;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    // タイマー表示更新
    updateTimer() {
        const timerFill = document.getElementById('timer-fill');
        const timerText = document.getElementById('timer-text');
        
        const percentage = (this.timeLeft / 15) * 100;
        timerFill.style.width = `${percentage}%`;
        timerText.textContent = this.timeLeft;
        
        // 時間が少なくなったら色を変更
        if (this.timeLeft <= 5) {
            timerText.style.color = '#ff0088';
            timerFill.style.background = 'linear-gradient(90deg, #ff0088, #ff4444)';
        } else {
            timerText.style.color = '#00ff88';
            timerFill.style.background = 'linear-gradient(90deg, #00ff88, #ffaa00, #ff0088)';
        }
    }

    // タイマー停止
    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 時間切れ処理
    timeUp() {
        this.clearTimer();
        this.selectAnswer(-1); // 時間切れは間違い扱い
    }

    // 回答選択
    selectAnswer(selectedIndex) {
        this.clearTimer();
        
        const question = this.selectedQuestions[this.currentQuestionIndex];
        const choiceBtns = document.querySelectorAll('.choice-btn');
        
        // ボタンを無効化
        choiceBtns.forEach(btn => btn.disabled = true);
        
        const isCorrect = selectedIndex === question.correct;
        const speedBonus = Math.max(0, this.timeLeft * 5); // 残り時間によるボーナス
        
        if (isCorrect) {
            // 正解処理
            this.correctAnswers++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            this.score += 100 + speedBonus + (this.streak * 10); // 連続ボーナス
            
            // 正解ボタンを光らせる
            if (selectedIndex >= 0) {
                choiceBtns[selectedIndex].classList.add('correct');
            }
            choiceBtns[question.correct].classList.add('correct');
            
            this.playCorrectSound();
            this.showFeedback(true, question.explanation);
        } else {
            // 不正解処理
            this.streak = 0;
            this.wrongAnswers++;
            
            // 間違ったボタンを赤く
            if (selectedIndex >= 0) {
                choiceBtns[selectedIndex].classList.add('wrong');
            }
            // 正解ボタンを光らせる
            choiceBtns[question.correct].classList.add('correct');
            
            this.playWrongSound();
            this.showFeedback(false, question.explanation);
            
            // SURVIVEモードでゲームオーバー判定
            if (this.gameMode === 'survive' && this.wrongAnswers >= this.maxWrongAnswers) {
                setTimeout(() => {
                    this.showResult();
                }, 2000);
                return;
            }
        }
        
        this.updateStats();
        
        // 次の問題または結果画面へ
        setTimeout(() => {
            this.hideFeedback();
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex >= this.totalQuestions) {
                this.showResult();
            } else {
                this.displayQuestion();
            }
        }, 2000);
    }

    // フィードバック表示
    showFeedback(isCorrect, explanation) {
        const feedback = document.getElementById('feedback');
        const result = feedback.querySelector('.feedback-result');
        const explanationEl = feedback.querySelector('.feedback-explanation');
        
        result.textContent = isCorrect ? '記憶復元成功!' : '記憶破損...';
        result.style.color = isCorrect ? '#00ff88' : '#ff0088';
        explanationEl.textContent = explanation;
        
        feedback.classList.remove('hidden');
    }

    // フィードバック非表示
    hideFeedback() {
        document.getElementById('feedback').classList.add('hidden');
    }

    // 統計表示更新
    updateStats() {
        document.getElementById('memory-points').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
    }

    // 結果表示
    showResult() {
        // BGM停止
        this.stopBgm();
        document.body.classList.remove('boss-active'); // ボスモード解除

        // 記憶コード生成
        const memoryCode = this.generateMemoryCode();
        document.getElementById('memory-code').textContent = memoryCode;
        
        // スコア表示
        document.getElementById('correct-count').textContent = `${this.correctAnswers}/${this.totalQuestions}`;
        document.getElementById('max-streak').textContent = this.maxStreak;
        document.getElementById('total-points').textContent = this.score;
        
        // ランク算出
        const rank = this.calculateRank();
        const rankEl = document.getElementById('rank');
        rankEl.textContent = rank;
        rankEl.className = `result-value rank rank-${rank.toLowerCase()}`;
        
        // 記憶の断片（ストーリー）表示
        const memoryStory = this.generateMemoryStory(rank);
        document.getElementById('memory-text').textContent = memoryStory;
        
        // 結果を保存
        this.saveResult();
        
        this.showScreen('result-screen');
    }

    // 記憶コード生成
    generateMemoryCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `NEO-${code}`;
    }

    // ランク算出
    calculateRank() {
        const accuracy = this.correctAnswers / this.totalQuestions;
        const scorePerQuestion = this.score / this.totalQuestions;
        
        if (accuracy >= 0.9 && scorePerQuestion >= 150) return 'S';
        if (accuracy >= 0.8 && scorePerQuestion >= 120) return 'A';
        if (accuracy >= 0.7 && scorePerQuestion >= 100) return 'B';
        if (accuracy >= 0.5) return 'C';
        return 'D';
    }

    // 記憶ストーリー生成
    generateMemoryStory(rank) {
        const stories = {
            'S': '都市の記憶が完全に復元されました。あなたは真の記憶の支配者として、ネオ＝テセウスの全データベースにアクセス可能となりました。光の回路が脈動し、知識の海があなたを迎え入れます。',
            'A': '優秀な記憶復元能力を示しました。都市のコアシステムがあなたの知識レベルを認識し、上位層データへのアクセス権を付与します。電脳の階層を駆け上がる資格を得ました。',
            'B': '標準的な記憶復元を達成しました。都市はあなたを一般管理者として認識し、基本データベースへのアクセスを許可します。継続的な学習により、さらなる高みを目指すことができます。',
            'C': '部分的な記憶復元にとどまりました。都市システムはあなたの潜在能力を感知していますが、まだ限定的なアクセスのみが許可されています。研鑽を積むことで進歩の道が開けるでしょう。',
            'D': '記憶復元に困難を抱えています。都市の警告システムが作動し、基礎知識の再学習を推奨しています。しかし、諦めることはありません。再挑戦により必ず道は開けます。'
        };
        
        return stories[rank] || stories['C'];
    }

    // 結果保存
    saveResult() {
        const result = {
            playerName: this.playerName,
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.totalQuestions,
            maxStreak: this.maxStreak,
            gameMode: this.gameMode,
            rank: this.calculateRank(),
            timestamp: new Date().toISOString()
        };
        
        // ローカルストレージに保存（最新10件）
        try {
            const savedResults = JSON.parse(localStorage.getItem('quizNeonResults') || '[]');
            savedResults.unshift(result);
            if (savedResults.length > 10) {
                savedResults.pop();
            }
            localStorage.setItem('quizNeonResults', JSON.stringify(savedResults));
        } catch (e) {
            console.log('結果の保存に失敗しました');
        }
    }

    // 結果共有
    shareResult() {
        const rank = this.calculateRank();
        const shareText = `QUIZ//NEON：記憶都市の支配者\n` +
                         `管理者: ${this.playerName}\n` +
                         `正解率: ${this.correctAnswers}/${this.totalQuestions}\n` +
                         `最高連続: ${this.maxStreak}\n` +
                         `総記憶P: ${this.score}\n` +
                         `評価: ${rank}ランク\n` +
                         `記憶の断片を復元しました...\n` +
                         `#QuizNeon #記憶都市`;

        if (navigator.share) {
            // ネイティブ共有API使用
            navigator.share({
                title: 'QUIZ//NEON：記憶都市の支配者',
                text: shareText
            }).catch(err => {
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    // 共有フォールバック
    fallbackShare(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('結果をクリップボードにコピーしました！');
            }).catch(() => {
                this.showShareModal(text);
            });
        } else {
            this.showShareModal(text);
        }
    }

    // 共有モーダル表示
    showShareModal(text) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-content">
                <h3>結果を共有</h3>
                <textarea readonly>${text}</textarea>
                <div class="share-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">閉じる</button>
                </div>
            </div>
        `;
        
        // スタイル追加
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 1000;
        `;
        
        const content = modal.querySelector('.share-content');
        content.style.cssText = `
            background: #000; border: 2px solid #00ff88; border-radius: 10px;
            padding: 20px; max-width: 90%; max-height: 80%; overflow: auto;
            color: #00ff88; font-family: 'Orbitron', monospace;
        `;
        
        const textarea = modal.querySelector('textarea');
        textarea.style.cssText = `
            width: 100%; height: 200px; background: rgba(0,255,136,0.1);
            border: 1px solid #00ff88; color: #00ff88; padding: 10px;
            font-family: 'Orbitron', monospace; resize: none; margin: 10px 0;
        `;
        
        const button = modal.querySelector('button');
        button.style.cssText = `
            background: linear-gradient(45deg, #00ff88, #88ffaa); border: none;
            color: #000; padding: 10px 20px; border-radius: 5px; cursor: pointer;
            font-family: 'Orbitron', monospace; font-weight: 700;
        `;
        
        document.body.appendChild(modal);
        textarea.select();
    }

    // 音響効果（CSS Animationベース + シェイク追加）
    playButtonSound() {
        if (!this.audioEnabled) return;
        
        // ボタンクリック演出
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed; top: 50%; left: 50%; width: 10px; height: 10px;
            background: #00ff88; border-radius: 50%; transform: translate(-50%, -50%);
            animation: soundWave 0.3s ease-out forwards; pointer-events: none; z-index: 9999;
        `;
        
        // CSS Animation定義
        if (!document.getElementById('sound-styles')) {
            const style = document.createElement('style');
            style.id = 'sound-styles';
            style.textContent = `
                @keyframes soundWave {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(10); opacity: 0; }
                }
                @keyframes correctFlash {
                    0% { background-color: rgba(0, 255, 136, 0.2); }
                    50% { background-color: rgba(0, 255, 136, 0.6); }
                    100% { background-color: rgba(0, 255, 136, 0.2); }
                }
                @keyframes wrongFlash {
                    0% { background-color: rgba(255, 0, 136, 0.2); }
                    50% { background-color: rgba(255, 0, 136, 0.6); }
                    100% { background-color: rgba(255, 0, 136, 0.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 300);
    }

    playCorrectSound() {
        if (!this.audioEnabled) return;
        
        // 正解演出（画面フラッシュ）
        document.body.style.animation = 'correctFlash 0.5s ease';
        
        // シェイク演出（メインコンテナを揺らす）
        const container = document.querySelector('.main-container');
        container.classList.remove('shake-effect');
        void container.offsetWidth; // リフロー強制でアニメーションリセット
        container.classList.add('shake-effect');

        // CRT風スキャンライン演出
        const scanLine = document.createElement('div');
        scanLine.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, #00ff88, transparent);
            animation: correctScan 0.8s ease-out; pointer-events: none; z-index: 9999;
        `;
        
        // スキャンアニメーション追加
        if (!document.getElementById('scan-style')) {
            const style = document.createElement('style');
            style.id = 'scan-style';
            style.textContent = `
                @keyframes correctScan {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(scanLine);
        setTimeout(() => {
            scanLine.remove();
            document.body.style.animation = '';
        }, 800);
    }

    playWrongSound() {
        if (!this.audioEnabled) return;
        
        // 不正解演出
        document.body.style.animation = 'wrongFlash 0.5s ease';
        
        // ノイズ演出
        const noise = document.createElement('div');
        noise.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 0, 136, 0.1) 2px,
                rgba(255, 0, 136, 0.1) 4px
            );
            animation: noiseFlicker 0.6s ease-out; pointer-events: none; z-index: 9999;
        `;
        
        // ノイズアニメーション追加
        if (!document.getElementById('noise-style')) {
            const style = document.createElement('style');
            style.id = 'noise-style';
            style.textContent = `
                @keyframes noiseFlicker {
                    0%, 100% { opacity: 0; }
                    10%, 30%, 50%, 70%, 90% { opacity: 1; }
                    20%, 40%, 60%, 80% { opacity: 0.3; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(noise);
        setTimeout(() => {
            noise.remove();
            document.body.style.animation = '';
        }, 600);
    }

    // ユーティリティ: ランダム要素取得
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // ユーティリティ: 配列シャッフル
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ユーティリティ: 数値フォーマット
    formatNumber(num) {
        return num.toLocaleString();
    }

    // デバッグ用: 全問題正解
    debugWinAll() {
        if (confirm('デバッグモード: 全問正解にしますか？')) {
            this.correctAnswers = this.totalQuestions;
            this.score = this.totalQuestions * 200;
            this.maxStreak = this.totalQuestions;
            this.showResult();
        }
    }

    // ゲーム統計取得
    getGameStats() {
        try {
            const results = JSON.parse(localStorage.getItem('quizNeonResults') || '[]');
            return {
                totalGames: results.length,
                averageScore: results.length > 0 ? 
                    results.reduce((sum, r) => sum + r.score, 0) / results.length : 0,
                bestScore: results.length > 0 ? 
                    Math.max(...results.map(r => r.score)) : 0,
                bestStreak: results.length > 0 ? 
                    Math.max(...results.map(r => r.maxStreak)) : 0
            };
        } catch (e) {
            return {
                totalGames: 0,
                averageScore: 0,
                bestScore: 0,
                bestStreak: 0
            };
        }
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuizNeonGame();
    window.quizNeonGame = game;
    
    // タッチデバイス対応など既存のコードは維持
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        if (diff < -50 && window.scrollY === 0) {
            e.preventDefault();
        }
    });
    
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    
    console.log('🎮 QUIZ//NEON: Audio & Visual Update Online');
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('QUIZ//NEON Error:', e.error);
});