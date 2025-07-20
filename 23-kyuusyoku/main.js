// 4年2組の生徒データ
const students = [
  { name: "タケダ タケシ", gender: "男", likes: "カレーライス", dislikes: "ピーマン炒め", comment: "おかわりしてもいいっすか？", face: "😊" },
  { name: "サトウ ミホ", gender: "女", likes: "ミルメーク牛乳", dislikes: "焼き魚", comment: "甘いのだけなら食べてもいいよ", face: "😌" },
  { name: "オオハシ シュン", gender: "男", likes: "冷凍みかん", dislikes: "牛乳", comment: "みかんがあるときは神だよな", face: "😄" },
  { name: "ナカジマ アキラ", gender: "男", likes: "ソフト麺ミートソース", dislikes: "酢の物", comment: "すっぱいのはちょっと……", face: "😅" },
  { name: "ヤマモト カナ", gender: "女", likes: "揚げパン", dislikes: "ひじきの煮物", comment: "手ベタベタだけど最高〜！", face: "😋" },
  { name: "フジイ マサト", gender: "男", likes: "牛乳", dislikes: "ゼリー", comment: "ゼリーはな、ぷるぷるしてて苦手", face: "🤔" },
  { name: "トミナガ ハルカ", gender: "女", likes: "きなこパン", dislikes: "カレーライス", comment: "辛いのはちょっとだけでいいの……", face: "😊" },
  { name: "クドウ ショウタ", gender: "男", likes: "ハムカツ", dislikes: "ミルク寒天", comment: "甘いの、男子はあんま食べんやろ", face: "😎" },
  { name: "イシイ エミ", gender: "女", likes: "ミルク寒天", dislikes: "野菜の煮付け", comment: "デザートって心のくすりよね", face: "😍" },
  { name: "ナガオカ タダシ", gender: "男", likes: "さばの味噌煮", dislikes: "コッペパン", comment: "パンより米がいいなぁ……", face: "😌" },
  { name: "ミヤザワ ユキ", gender: "女", likes: "サラダスパゲティ", dislikes: "牛乳", comment: "牛乳って、ちょっとお腹いたくなるの", face: "😅" },
  { name: "ホソカワ ヒロミ", gender: "女", likes: "コッペパン", dislikes: "わかめスープ", comment: "あの黒いの、海藻？ムリかも……", face: "😰" },
  { name: "キムラ リョウ", gender: "男", likes: "焼きそば", dislikes: "きのこソテー", comment: "ぐにゅっとするやつダメ！", face: "😤" },
  { name: "ハセガワ レイ", gender: "女", likes: "フルーツポンチ", dislikes: "野菜炒め", comment: "フルーツにシロップ、最強", face: "😋" },
  { name: "タカハシ ジロウ", gender: "男", likes: "カツカレー", dislikes: "サラダ", comment: "葉っぱより肉！", face: "😄" },
  { name: "イノウエ ミユキ", gender: "女", likes: "たまごスープ", dislikes: "焼き魚", comment: "骨、うまく取れないのよねぇ", face: "😅" },
  { name: "サエキ ケンジ", gender: "男", likes: "牛乳プリン", dislikes: "酢の物", comment: "すっぱいのは、なー……", face: "😕" },
  { name: "ヨシダ サクラ", gender: "女", likes: "おでん", dislikes: "焼きそば", comment: "おでんって味しみてて落ち着くの", face: "😊" },
  { name: "ヤマダ コウスケ", gender: "男", likes: "中華丼", dislikes: "冷凍みかん", comment: "歯にしみるんだよ……あれ", face: "😬" },
  { name: "ナガタ ユリ", gender: "女", likes: "白ごはん", dislikes: "カレー", comment: "カレーはにおいがキツいのよ……", face: "😅" },
  { name: "カネコ ケンタ", gender: "男", likes: "シチュー", dislikes: "パイナップル", comment: "すっぱい果物が入ってるとイヤ", face: "😒" },
  { name: "ウエハラ ノゾミ", gender: "女", likes: "スパゲティナポリタン", dislikes: "さばの味噌煮", comment: "魚はちょっとだけなら…", face: "😌" },
  { name: "モリ カズオ", gender: "男", likes: "焼きうどん", dislikes: "ひじき", comment: "ひじきってなんで黒いんや？", face: "🤔" },
  { name: "タニグチ マリ", gender: "女", likes: "チキンライス", dislikes: "野菜スープ", comment: "汁ものって、ちょっとにしてほしい", face: "😊" },
  { name: "ハマダ トモヒコ", gender: "男", likes: "フライドチキン", dislikes: "牛乳寒天", comment: "甘いのよりしょっぱい方がええ", face: "😎" },
  { name: "シバタ アユミ", gender: "女", likes: "コーンスープ", dislikes: "焼きなす", comment: "なすって見た目がこわいのよ……", face: "😰" },
  { name: "クラモト マサル", gender: "男", likes: "チャーハン", dislikes: "豆腐", comment: "ぷるんってしたやつ苦手や", face: "😤" },
  { name: "アンドウ リナ", gender: "女", likes: "フルーツヨーグルト", dislikes: "カボチャの煮物", comment: "甘いのと甘いのは違うのよね〜", face: "😋" },
  { name: "カワサキ ヒカル", gender: "男", likes: "カレーうどん", dislikes: "こんにゃく", comment: "なんかビヨンってのが気持ち悪い", face: "😵" },
  { name: "オクダ サチオ", gender: "男", likes: "ごはんとたくあん", dislikes: "ミネストローネ", comment: "なんか、洋風すぎるの苦手やわ", face: "😅" },
  { name: "ノナカ ミキ", gender: "女", likes: "ハンバーグ", dislikes: "トマト", comment: "赤いの、生じゃムリ……", face: "😰" },
  { name: "ツジモト リク", gender: "男", likes: "冷やし中華", dislikes: "しらたき", comment: "麺はいいけど、糸みたいのはやめてくれ", face: "😒" }
];

// 給食メニューリスト
const menuItems = [
  "カレーライス", "ミルメーク牛乳", "冷凍みかん", "ソフト麺ミートソース", "揚げパン",
  "牛乳", "きなこパン", "ハムカツ", "ミルク寒天", "さばの味噌煮",
  "コッペパン", "サラダスパゲティ", "わかめスープ", "焼きそば", "きのこソテー",
  "フルーツポンチ", "カツカレー", "サラダ", "たまごスープ", "焼き魚",
  "牛乳プリン", "酢の物", "おでん", "中華丼", "パイナップル",
  "白ごはん", "カレー", "シチュー", "スパゲティナポリタン", "焼きうどん",
  "ひじき", "チキンライス", "野菜スープ", "フライドチキン", "コーンスープ",
  "焼きなす", "チャーハン", "豆腐", "フルーツヨーグルト", "カボチャの煮物",
  "カレーうどん", "こんにゃく", "ごはんとたくあん", "ミネストローネ", "ハンバーグ",
  "トマト", "冷やし中華", "しらたき", "野菜炒め", "ひじきの煮物",
  "野菜の煮付け", "ゼリー", "ピーマン炒め"
];

// 給食メニューの類似性定義
// キー：ある給食（生徒の好き嫌いになりうるもの）、値：その給食に似ていると判断される給食の配列
const similarFoods = {
    "カレーライス": ["カツカレー", "カレーうどん"],
    "牛乳": ["ミルメーク牛乳", "牛乳プリン"],
    "揚げパン": ["きなこパン", "コッペパン"],
    "焼き魚": ["さばの味噌煮"], 
    "サラダ": ["サラダスパゲティ", "野菜炒め"],
    "白ごはん": ["チャーハン", "中華丼", "チキンライス"], 
    "パン": ["コッペパン", "きなこパン", "揚げパン"], 
    "麺": ["ソフト麺ミートソース", "スパゲティナポリタン", "焼きそば", "焼きうどん", "冷やし中華", "カレーうどん"],
    "汁物": ["たまごスープ", "わかめスープ", "コーンスープ", "シチュー", "ミネストローネ"],
    "煮物": ["おでん", "ひじきの煮物", "野菜の煮付け", "カボチャの煮物"],
    "デザート": ["冷凍みかん", "ミルク寒天", "牛乳プリン", "フルーツポンチ", "ゼリー", "フルーツヨーグルト"],
    "ハンバーグ": ["フライドチキン", "ハムカツ"],
    // 嫌いな給食の類似品についても定義しておくと良い
    "酢の物": ["サラダ"], 
    "ピーマン炒め": ["野菜炒め"],
    "きのこソテー": ["野菜炒め"],
    "トマト": ["野菜炒め", "サラダスパゲティ"],
    "こんにゃく": ["しらたき"],
    "豆腐": ["ミルク寒天", "牛乳プリン"], 
    "ゼリー": ["ミルク寒天", "牛乳プリン", "フルーツヨーグルト"]
};


// ゲーム状態
let gameState = {
  currentStudent: null,
  currentStudentIndex: 0,
  score: 0,
  timer: 60,
  served: 0,
  totalStudents: 32,
  isGameRunning: false,
  todayMenu: [],
  correctAnswers: 0,
  wrongAnswers: 0,
  usedStudents: []
};

// DOM要素
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const titleBtn = document.getElementById('title-btn');

// ゲーム要素
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const servedElement = document.getElementById('served');
// menuListElement は HTML から削除されたため、もう参照する必要はありません。
// const menuListElement = document.getElementById('menu-list'); 
const currentStudentElement = document.getElementById('current-student');
const menuButtonsElement = document.getElementById('menu-buttons');
const reactionMessageElement = document.getElementById('reaction-message');

// 結果画面要素
const finalScoreElement = document.getElementById('final-score');
const finalServedElement = document.getElementById('final-served');
const accuracyElement = document.getElementById('accuracy');
const resultMessageElement = document.getElementById('result-message');

let gameInterval; // タイマーをクリアするためにグローバルスコープで宣言

// イベントリスナー
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
titleBtn.addEventListener('click', showTitleScreen);

// ゲーム開始
function startGame() {
  resetGameState();
  generateTodayMenu(); // メニューボタン生成のために呼び出しは維持
  showGameScreen();
  startTimer();
  nextStudent();
}

// ゲーム状態リセット
function resetGameState() {
  gameState = {
      currentStudent: null,
      currentStudentIndex: 0,
      score: 0,
      timer: 60, // 制限時間を60秒に設定
      served: 0,
      totalStudents: students.length, // 生徒の総数を動的に取得
      isGameRunning: true,
      todayMenu: [],
      correctAnswers: 0,
      wrongAnswers: 0,
      usedStudents: []
  };
  updateUI();
  reactionMessageElement.textContent = ''; // リアクションメッセージをクリア
  reactionMessageElement.className = 'reaction-message'; // クラスもリセット
}

// 今日のメニュー生成（ランダムに12個選択）
function generateTodayMenu() {
  const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
  gameState.todayMenu = shuffled.slice(0, 12);
  
  // menuListElementへの表示ロジックは削除されました
  
  // メニューボタン作成は引き続き必要
  createMenuButtons();
}

// メニューボタン作成
function createMenuButtons() {
  menuButtonsElement.innerHTML = '';
  gameState.todayMenu.forEach(menu => {
      const button = document.createElement('button');
      button.className = 'menu-button';
      button.textContent = menu;
      button.addEventListener('click', () => selectMenu(menu));
      menuButtonsElement.appendChild(button);
  });
}

// 次の生徒を選択
function nextStudent() {
  if (!gameState.isGameRunning) return;
  
  // すでにすべての生徒に対応し終わった場合、ゲームを終了
  if (gameState.usedStudents.length >= gameState.totalStudents) {
      endGame();
      return;
  }

  // 未使用の生徒のインデックスをフィルタリング
  const availableStudentIndices = students.map((_, index) => index)
                                        .filter(index => !gameState.usedStudents.includes(index));

  // 未使用の生徒からランダムに1人選択
  const randomIndex = availableStudentIndices[Math.floor(Math.random() * availableStudentIndices.length)];
  gameState.currentStudent = students[randomIndex];
  gameState.usedStudents.push(randomIndex); // 使用済み生徒として追加

  // 生徒情報の表示を更新
  currentStudentElement.innerHTML = `
      <div class="student-face">${gameState.currentStudent.face}</div>
      <div class="student-name">${gameState.currentStudent.name}</div>
      <div class="student-comment">「${gameState.currentStudent.comment}」</div>
      <div class="student-preferences">
          <div class="likes">好き：${gameState.currentStudent.likes}</div>
          <div class="dislikes">嫌い：${gameState.currentStudent.dislikes}</div>
      </div>
  `;

  // リアクションメッセージをクリア
  reactionMessageElement.textContent = '';
  reactionMessageElement.className = 'reaction-message'; // スタイルもリセット
}

// 選択されたメニューに対する処理
function selectMenu(selectedMenu) {
    if (!gameState.isGameRunning || !gameState.currentStudent) return;

    let reactionText = '';
    let reactionClass = '';

    const studentLikes = gameState.currentStudent.likes;
    const studentDislikes = gameState.currentStudent.dislikes;

    // 1. 完全一致 (好きな給食)
    if (selectedMenu === studentLikes) {
        gameState.score += 100; // 正解で100点
        gameState.correctAnswers++;
        reactionText = `「${selectedMenu}！やったー！ありがとう！」😊`;
        reactionClass = 'good';
    }
    // 2. 完全一致 (嫌いな給食)
    else if (selectedMenu === studentDislikes) {
        gameState.score -= 50; // 不正解で50点減点
        gameState.wrongAnswers++;
        reactionText = `「えー…${selectedMenu}は苦手なんだよねぇ…」😟`;
        reactionClass = 'bad';
    }
    // 3. 類似食品 (好きな給食の類似品)
    else {
        // 生徒の好きな給食が similarFoods のキーに存在し、
        // 選択したメニューがその類似品リストに含まれているかチェック
        const likedFoodSimilarities = similarFoods[studentLikes] || [];
        
        // 嫌いな給食の類似品チェック
        const dislikedFoodSimilarities = similarFoods[studentDislikes] || [];

        let handled = false; // すでにリアクションが決まったかどうかのフラグ

        if (likedFoodSimilarities.includes(selectedMenu)) {
            gameState.score += 30; // 類似品で30点加点 (調整可能)
            gameState.correctAnswers++; // 類似品も正解としてカウント
            reactionText = `「おっ！${selectedMenu}！${studentLikes}に似てる！ありがとう！」😄`;
            reactionClass = 'medium'; // 新しいリアクションクラス
            handled = true;
        } 
        // 嫌いな給食の類似品だった場合（好きな給食の類似品ではない場合のみチェック）
        else if (dislikedFoodSimilarities.includes(selectedMenu) && !handled) {
             // 嫌いなものに似たものを出した場合のペナルティ（調整可能）
            gameState.score -= 30; 
            gameState.wrongAnswers++;
            reactionText = `「うわっ、${selectedMenu}かあ…${studentDislikes}に似てるからちょっと…」😒`;
            reactionClass = 'bad';
            handled = true;
        }
        
        // 5. どちらでもない (普通の不正解)
        if (!handled) {
            gameState.score -= 20; // どちらでもない場合は20点減点
            gameState.wrongAnswers++;
            reactionText = `「うーん、これは今日じゃない気分かな…」🤔`;
            reactionClass = 'bad';
        }
    }

    gameState.served++; // 対応した生徒の数を増やす
    updateUI(); // UIを更新

    reactionMessageElement.textContent = reactionText;
    reactionMessageElement.className = 'reaction-message'; // スタイルをリセットしてから追加
    reactionMessageElement.classList.add(reactionClass);

    // 短時間リアクションを表示した後、次の生徒へ
    setTimeout(() => {
        nextStudent();
    }, 1000); // 1秒後に次の生徒を表示
}


// タイマー開始
function startTimer() {
  clearInterval(gameInterval); // 既存のタイマーがあればクリア
  gameInterval = setInterval(() => {
      gameState.timer--;
      updateUI();
      if (gameState.timer <= 0) {
          clearInterval(gameInterval); // タイマーを停止
          endGame(); // ゲーム終了
      }
  }, 1000); // 1秒ごとに実行
}

// ゲーム終了
function endGame() {
  gameState.isGameRunning = false;
  clearInterval(gameInterval); // タイマーを停止

  // 最終スコアの計算
  const finalScore = gameState.score;
  const totalAttempts = gameState.correctAnswers + gameState.wrongAnswers;
  const accuracy = totalAttempts > 0 ? (gameState.correctAnswers / totalAttempts * 100).toFixed(1) : 0;

  // 結果画面の表示を更新
  finalScoreElement.textContent = finalScore;
  finalServedElement.textContent = gameState.served;
  accuracyElement.textContent = `${accuracy}%`;

  // 結果メッセージの生成
  let resultMessage = '';
  if (accuracy >= 80) {
      resultMessage = "素晴らしい給食当番でした！みんな大満足です！";
  } else if (accuracy >= 50) {
      resultMessage = "まずまずの腕前でしたね。もう少しでみんなを笑顔にできます！";
  } else {
      resultMessage = "ちょっと苦手な生徒が多かったかな？次は頑張ろう！";
  }
  resultMessageElement.textContent = resultMessage;

  showResultScreen(); // 結果画面に切り替え
}

// UI更新
function updateUI() {
  scoreElement.textContent = gameState.score;
  timerElement.textContent = gameState.timer;
  servedElement.textContent = `${gameState.served}/${gameState.totalStudents}`;
}

// 画面表示制御
function showTitleScreen() {
  titleScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
}

function showGameScreen() {
  titleScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
}

function showResultScreen() {
  titleScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
}

// 初期表示
showTitleScreen();