// ===============================
// 白磁の匙 — クリック進行 / エンドはクリックでリスタート
// 選択肢 after 対応（直後の短いやりとり）/ 会話自然化
// ===============================

// 画像パス
const BG = {
  title:      'images/ch1_title.png',
  gate:       'images/house_gate.png',
  genkan:     'images/genkan_dark.png',
  living:     'images/living_room_traditional.png',
  kitchen:    'images/kitchen_old.png',
  hallway:    'images/ch1_shoji_eavesdrop.png',
  silhouette: 'images/ch1_shoji_silhouette.png',
  spoon:      'images/ch1_porcelain_spoon.png',
  study:      'images/ch1_study_peek.png',
  dining:     'images/ch1_family_gathering.png',
  storage:    'images/ch1_storage_dryplate.png',
  mirror:     'images/ch1_mirror_crack.png',
  shrine:     'images/ch1_shrine_small.png',
  footprints: 'images/ch1_wet_footprints.png'
};

// ===== BGM管理（重複防止システム） =====
const BGM = {
  WALTZ_SOFT:   'audio/bgm_taisho_waltz_soft.mp3',    // 優雅な日常、大正時代の雰囲気
  EXPLORE:      'audio/bgm_explore_ambient.mp3',      // 探索、調査シーン
  SUSPENSE_LOW: 'audio/bgm_suspense_low.mp3',        // 恐怖、サスペンスシーン
  END_REPRISE:  'audio/bgm_end_reprise.mp3'          // エンディング
};

// 単一Audioオブジェクトで重複再生を完全防止
const bgmEl = new Audio();
bgmEl.loop = true;
bgmEl.preload = 'auto';
bgmEl.volume = 0.5; // 適切な音量に設定

let currentBGMKey = null;  // 現在再生中のBGMキー
let isBGMChanging = false; // BGM切り替え処理中フラグ

// BGM再生（重複防止付き）
function playBGM(key) {
  if (!key || !BGM[key]) return;
  
  // 同じBGMが既に再生中で、切り替え処理中でない場合は何もしない
  if (currentBGMKey === key && !bgmEl.paused && !isBGMChanging) {
    return;
  }
  
  // 切り替え処理中の場合は処理をスキップ（安全のため）
  if (isBGMChanging) {
    return;
  }
  
  isBGMChanging = true;
  
  // 既存のBGMを停止
  try {
    bgmEl.pause();
    bgmEl.currentTime = 0;
  } catch(_) {}
  
  // 新しいBGMを設定して再生
  setTimeout(() => {
    try {
      bgmEl.src = BGM[key];
      bgmEl.volume = 0.5;
      bgmEl.play().catch(() => {
        // 自動再生がブロックされた場合は無視
        isBGMChanging = false;
      });
      currentBGMKey = key;
      isBGMChanging = false;
    } catch(_) {
      isBGMChanging = false;
    }
  }, 50); // 短い待機で確実に停止
}

// BGM停止（リスタート時など）
function stopBGM() {
  try {
    bgmEl.pause();
    bgmEl.currentTime = 0;
    bgmEl.src = '';
  } catch(_) {}
  currentBGMKey = null;
  isBGMChanging = false;
}


// ===== DOM =====
const bgEl        = document.getElementById('background');
const speakerEl   = document.getElementById('speakerName');
const mainTextEl  = document.getElementById('mainText');
const choiceArea  = document.getElementById('choiceArea');
const darkOverlay = document.getElementById('darkOverlay');
const gameContainer = document.getElementById('gameContainer');

const btnLog      = document.getElementById('btnLog');
const btnDebug    = document.getElementById('btnDebug');
const btnReset    = document.getElementById('btnReset');

const logPanel    = document.getElementById('logPanel');
const logContent  = document.getElementById('logContent');
const btnCloseLog = document.getElementById('btnCloseLog');

const dbgEvid   = document.getElementById('dbgEvid');
const dbgTrust  = document.getElementById('dbgTrust');
const dbgShadow = document.getElementById('dbgShadow');
const dbgScenes = document.getElementById('dbgScenes');
const dbgMax    = document.getElementById('dbgMax');

// パラメータ表示パネル
const paramPanel = document.getElementById('paramPanel');
const paramEvid  = document.getElementById('paramEvid');
const paramTrust = document.getElementById('paramTrust');
const paramShadow = document.getElementById('paramShadow');

// ===== 状態 =====
let state, isRunning=false;
let inOpening=true, opIndex=0;
let sceneIndex=-1, lineIndex=0;
let isEnding=false;

// 選択後の短いやりとりキュー
let _afterQueue = null;
let _afterNext  = null;

// 選択履歴（後悔要素用）
let choicesHistory = [];

// ===== 初期化 =====
function init(){
  // リスタート時は必ずBGMを停止
  stopBGM();
  
  state = {
    evid:0, trust:0, shadow:0,
    scenesSeen:0, maxScenes:17,
    visited:new Set(), log:[]
  };
  isRunning=false; inOpening=true; opIndex=-1; sceneIndex=-1; lineIndex=0;
  isEnding=false; _afterQueue=null; _afterNext=null;
  choicesHistory=[];

  changeBackground(BG.title);
  setText('', 'クリック（タップ）で開始');
  choiceArea.innerHTML='';
  if (logPanel) logPanel.classList.remove('show');
  if (paramPanel) paramPanel.classList.add('hidden');
  updateDebug();
}
init();

// ===== クリック（進行） =====
document.getElementById('gameContainer').addEventListener('click', (e)=>{
  if (e.target.closest('button')) return;

  // エンド中：クリックでタイトルへ（BGMはinit内で停止される）
  if (isEnding){
    isEnding = false;
    init();             // タイトルへ（stopBGM含む）
    return;
  }

  if (logPanel && logPanel.classList.contains('show')) { toggleLog(false); return; }
  if (!isRunning) { start(); return; }
  if (choiceArea.children.length > 0) return;

  advanceLine();
});

// ===== ボタン =====
if (btnLog)      btnLog.onclick      = (e)=>{ e.stopPropagation(); toggleLog(); };
if (btnCloseLog) btnCloseLog.onclick = (e)=>{ e.stopPropagation(); toggleLog(false); };
if (btnReset)    btnReset.onclick    = (e)=>{ e.stopPropagation(); if(confirm('最初からはじめます。')){ init(); } };
if (btnDebug && dbgEvid){
  btnDebug.onclick = (e)=>{ e.stopPropagation(); document.getElementById('debugPanel').classList.toggle('hidden'); };
}

// ===== 表示 =====
function changeBackground(path){
  bgEl.style.opacity = 0;
  setTimeout(()=>{ bgEl.style.backgroundImage = `url(${path})`; bgEl.style.opacity = 1; }, 100);
}
function setText(speaker,text){
  speakerEl.textContent = speaker || '';
  mainTextEl.classList.remove('fade'); void mainTextEl.offsetWidth; mainTextEl.classList.add('fade');
  mainTextEl.textContent = text || '';
  
  // 恐怖キーワードが含まれるテキストの場合、軽い恐怖演出と効果音
  if(text && shouldTriggerFear({shadow:0}, text)){
      setTimeout(()=>{
        triggerFearEffect('normal');
      }, 200);
  }
}
function say(s,t){ setText(s,t); addLog(s||'ナレーション',t); }
function addLog(speaker,text){ state.log.push({speaker,text}); }

// ===== 恐怖演出（フラッシュ点滅なし） =====
function triggerFearEffect(level='normal', playSound=true){
  // level: 'normal', 'medium', 'intense'
  // playSound: 効果音を再生するか（デフォルトtrue）
  
  if(level === 'intense'){
    // 強烈な恐怖：画面揺れ + 暗転 + テキスト揺れ + 色変化
    gameContainer.classList.add('shake-screen');
    if(darkOverlay) darkOverlay.classList.add('intense');
    mainTextEl.classList.add('text-shake', 'intense-fear');
    bgEl.classList.remove('normal', 'desaturate');
    bgEl.classList.add('intense-desaturate');
    
    setTimeout(()=>{
      gameContainer.classList.remove('shake-screen');
      mainTextEl.classList.remove('text-shake');
    }, 600);
    
    setTimeout(()=>{
      if(darkOverlay) darkOverlay.classList.remove('intense');
      mainTextEl.classList.remove('intense-fear');
      bgEl.classList.remove('intense-desaturate');
      bgEl.classList.add('normal');
    }, 2000);
    
  } else if(level === 'medium'){
    // 中程度の恐怖：軽い揺れ + 暗転 + テキスト色変化
    gameContainer.classList.add('shake-screen');
    if(darkOverlay) darkOverlay.classList.add('active');
    mainTextEl.classList.add('fear-text');
    bgEl.classList.remove('normal', 'intense-desaturate');
    bgEl.classList.add('desaturate');
    
    setTimeout(()=>{
      gameContainer.classList.remove('shake-screen');
    }, 600);
    
    setTimeout(()=>{
      if(darkOverlay) darkOverlay.classList.remove('active');
      mainTextEl.classList.remove('fear-text');
      bgEl.classList.remove('desaturate');
      bgEl.classList.add('normal');
    }, 1500);
    
  } else {
    // 軽い恐怖：テキスト揺れ + 色調変化（効果音は控えめ）
    mainTextEl.classList.add('text-shake', 'slow-reveal');
    bgEl.classList.remove('normal', 'intense-desaturate');
    bgEl.classList.add('desaturate');
    
    setTimeout(()=>{
      mainTextEl.classList.remove('text-shake');
    }, 500);
    
    setTimeout(()=>{
      mainTextEl.classList.remove('slow-reveal');
      bgEl.classList.remove('desaturate');
      bgEl.classList.add('normal');
    }, 1200);
  }
}

// 恐怖シーンの判定（shadow値や選択肢の内容から）
function shouldTriggerFear(delta, text=''){
  if(!delta) return false;
  
  // shadowが増加する選択肢は恐怖シーン
  if(delta.shadow && delta.shadow > 0) return true;
  
  // テキストに恐怖キーワードが含まれる場合
  const fearKeywords = ['影', '足音', '鏡', '声', '誰か', '見る', '確かめる', '覗く', '触る', '音', '戸', '灯', '井戸', '屋根裏'];
  if(fearKeywords.some(kw => text.includes(kw))) return true;
  
  return false;
}
function toggleLog(force){
  if (!logPanel) return;
  const on = (typeof force==='boolean')? force : !logPanel.classList.contains('show');
  if (on){ renderLog(); logPanel.classList.add('show'); }
  else   { logPanel.classList.remove('show'); }
}
function renderLog(){
  if (!logContent) return;
  logContent.innerHTML='';
  state.log.forEach(ent=>{
    const d=document.createElement('div'); d.className='log-entry';
    d.innerHTML = `<div class="log-speaker">${ent.speaker}</div><div>${ent.text}</div>`;
    logContent.appendChild(d);
  });
}
function updateDebug(){
  if (!dbgEvid) return;
  dbgEvid.textContent   = state.evid;
  dbgTrust.textContent  = state.trust;
  dbgShadow.textContent = state.shadow;
  dbgScenes.textContent = state.scenesSeen;
  dbgMax.textContent    = state.maxScenes;
  
  // パラメータ表示パネルも更新
  if (paramEvid) paramEvid.textContent = state.evid;
  if (paramTrust) paramTrust.textContent = state.trust;
  if (paramShadow) paramShadow.textContent = state.shadow;
}

// ===== スタート =====
function start(){
  isRunning = true;
  changeBackground(BG.gate);
  if (paramPanel) paramPanel.classList.remove('hidden');
  // オープニングの最初の行から開始
  opIndex = -1; // advanceOpening()で0になるように-1に設定
  advanceOpening();
}

// ===== 進行 =====
function advanceLine(){
  // after キューがあればそれを優先表示
  if (_afterQueue && _afterQueue.length){
    const ln = _afterQueue.shift();
    say(ln.speaker||'', ln.text||'');
    if (_afterQueue.length===0){
      const cb = _afterNext; _afterNext=null; _afterQueue=null;
      cb && cb();
    }
    return;
  }

  if (inOpening) { advanceOpening(); return; }

  const sc = scenes[sceneIndex]; if (!sc) return;
  
  // linesが関数の場合は実行して動的に生成
  const sceneLines = typeof sc.lines === 'function' 
    ? sc.lines(choicesHistory, state) 
    : sc.lines;
  
  lineIndex++;
  if (lineIndex < sceneLines.length){
    const ln = sceneLines[lineIndex]; say(ln.speaker||'', ln.text||''); return;
  }
  // choicesが関数の場合は実行して動的に生成
  const sceneChoices = typeof sc.choices === 'function'
    ? sc.choices(choicesHistory, state)
    : sc.choices;
  
  if (sceneChoices && sceneChoices.length){
    showChoices(sc, sceneChoices);
  } else {
    if (endByFormula('即時判定')) return;
    gotoNextScene();
  }
}

function showChoices(sc, list){
  choiceArea.innerHTML='';
  list.forEach(c=>{
    const b=document.createElement('button');
    b.className='choice-button';
    b.textContent=c.label;
    b.onclick=(e)=>{
      e.stopPropagation();
      choiceArea.innerHTML='';

      applyDelta(c.delta||{});
      addLog(sc.lines[Math.max(0, sc.lines.length-1)].speaker||'', `[選択] ${c.label}`);
      choicesHistory.push(c.label); // 選択履歴を記録

      // 恐怖演出の判定と実行
      const delta = c.delta || {};
      const fearLevel = delta.shadow >= 2 ? 'intense' : (delta.shadow >= 1 ? 'medium' : 'normal');
      if(shouldTriggerFear(delta, c.label)){
        setTimeout(()=>{
          triggerFearEffect(fearLevel, false);
        }, 100);
      }

      const proceed = ()=>{
        if (endByFormula('即時判定')) return;
        gotoNextScene();
      };

      // afterを処理（条件分岐対応）
      let afterLines = c.after || [];
      if (typeof c.after === 'function') {
        afterLines = c.after(choicesHistory, state) || [];
      }

      if (afterLines && afterLines.length){
        _afterQueue = afterLines.slice();
        _afterNext  = proceed;
        const first = _afterQueue.shift();
        say(first.speaker||'', first.text||'');
        return;
      }
      proceed();
    };
    choiceArea.appendChild(b);
  });
}

// ===== オープニング（会話自然化＋時代背景の厚み） =====
const openingLines = [
  { bg: BG.gate,    bgm:'WALTZ_SOFT', s:'',    t:'背の高い土塀が、夕暮れの光に影を落としている。\n湿った土と古い畳の匂いが混じり合い、大正の田舎、地主の屋敷の重厚な空気を漂わせる。' },
  {                 s:'私',            t:'……こちらで間違いないはず。\n手にした紹介状の文字を、もう一度確かめる。' },
  {                 s:'',              t:'門柱には家紋が刻まれている。\nこの家は、代々続く名家だ。その重みが、石の柱から伝わってくる。' },
  { bg: BG.genkan,  s:'奥様',          t:'ようこそ。あなたが新しく来てくださる方ですね。\nどうぞ、お上がりください。' },
  {                 s:'私',            t:'本日からお世話になります。\n深く頭を下げ、式台に上がる。' },
  {                 s:'',              t:'式台の上、履物が整然と並んでいる。\n一つだけ、向きが違う。誰かが、さっきまでここにいた。' },
  {                 s:'奥様',          t:'長く続く方は少ないの。\nけれど——あなたなら大丈夫でしょう。' },
  {                 s:'私',            t:'……承知しました。\nその言葉の裏に、何かが隠されている気がする。' },
  { bg: BG.living,  s:'',              t:'広い座敷。床の間には掛け軸、その前に白磁の花入れ。\n薄暗い灯りが、部屋の隅々まで届いている。' },
  {                 s:'奥様',          t:'こちらが当主です。\nどうぞ、こちらへ。' },
  {                 s:'私',            t:'初めまして。炊事・洗濯・掃除は——\n私が担当させていただきます。' },
  {                 s:'当主',          t:'……荷物のことだ。\nそこに置け。' },
  {                 s:'私',            t:'……失礼しました。\n荷物を置き、姿勢を正す。' },
  {                 s:'',              t:'座布団が五枚。\nしかし、座っているのは三人だけ。余った二枚が、空気を重くする。' },
  {                 s:'当主',          t:'夜は起きるな。\n起きると、誰かと目が合う。' },
  {                 s:'私',            t:'誰か、ですか。\nその言葉の意味を、まだ理解できていない。' },
  {                 s:'当主',          t:'気のせいだと思っておけ。\nそれ以上、聞くな。' },
  { bg: BG.kitchen, bgm:'EXPLORE',     s:'',   t:'土間の台所。かまど、流し、大きなたらい。\n炭の匂いが残る。まだ温かい。' },
  {                 s:'奥様',          t:'静茶。この方が家政婦さん。\nよろしくお願いします。' },
  {                 s:'静茶',          t:'……静茶です。\nよろしく。' },
  {                 s:'私',            t:'よろしくお願いします。\n静茶の目が、一瞬、何かを探るように動いた。' },
  {                 s:'',              t:'流しの横、白磁の匙が置かれている。\n向きは、私が知っている向きと違う。誰かが、動かしたのだろうか。' },
  {                 s:'静茶',          t:'部屋は奥です。\n荷物は軽い方が……いいですよ。' },
  {                 s:'私',            t:'なぜですか。\nその理由を、聞き返す。' },
  {                 s:'静茶',          t:'……夜、移動することになるかもしれないので。\nその言葉に、重みがある。' },
  { bg: BG.hallway, bgm:'SUSPENSE_LOW', s:'',   t:'長い廊下。障子の向こう、灯りが揺れる。\n私以外は誰も動いていないはず。なのに、影が動く。' },
  {                 s:'私',            t:'……どなたか、いらっしゃいますか？\n声をかけるが、返事はない。' },
  {                 s:'奥様',          t:'気にしなくていいのよ。\nその声は、どこから聞こえてきたのだろう。' },
  {                 s:'静茶',          t:'そこ、よく"薄くなる"んです。\n壁が、じゃなくて……空気が。' },
  {                 s:'私',            t:'……空気が？\nその意味を、理解しようとする。' },
  {                 s:'静茶',          t:'向こうと混ざるんですよ。\nその言葉に、冷たい風が吹き抜ける。' },
  {                 s:'',              t:'空気が張り詰めた。私は息を浅くする。\nこの家には、見えない"客"がいる。その存在が、背筋を這い上がる。' }
];
function advanceOpening(){
  opIndex++;
  if (opIndex < openingLines.length){
    const ln = openingLines[opIndex];
    if (ln.bg) changeBackground(ln.bg);
    // BGMは異なる場合のみ再生（重複防止）
    if (ln.bgm && ln.bgm !== currentBGMKey) {
      playBGM(ln.bgm);
    }
    say(ln.s||'', ln.t||''); return;
  }
  inOpening=false; gotoNextScene();
}

// ===== 遷移 =====
function gotoNextScene(){
  if (state.scenesSeen >= state.maxScenes){ endByFormula('規定到達'); return; }

  // シーンを段階的に分類
  // 導入（必須シーン、最初の4シーン）
  // 展開（シーン5-12、中盤）
  // クライマックス（シーン13以降、終盤）
  
  const required = scenes
    .map((sc, i) => ({scene: sc, idx: i}))
    .filter(({scene, idx}) => scene.required && !state.visited.has(idx));
  
  let idx;
  
  // 段階1: 導入（必須シーンを最初に）
  if (required.length > 0 && state.scenesSeen < 4) {
    idx = required[Math.floor(Math.random() * required.length)].idx;
  }
  // 段階2: 展開（シーン5-12、中盤）
  else if (state.scenesSeen < 10) {
    const developmentPool = scenes
      .map((sc, i) => ({scene: sc, idx: i}))
      .filter(({scene, idx}) => 
        !state.visited.has(idx) && 
        !scene.required && 
        idx >= 4 && idx < 13
      );
    
    if (developmentPool.length > 0) {
      idx = developmentPool[Math.floor(Math.random() * developmentPool.length)].idx;
    } else {
      // 展開シーンがなくなったら、未訪問のシーンから選択
      const pool = scenes.map((_,i)=>i).filter(i=>!state.visited.has(i) && !scenes[i].required);
      idx = (pool.length>0) ? pool[Math.floor(Math.random()*pool.length)]
                            : Math.floor(Math.random()*scenes.length);
    }
  }
  // 段階3: クライマックス（シーン13以降、終盤）
  else {
    const climaxPool = scenes
      .map((sc, i) => ({scene: sc, idx: i}))
      .filter(({scene, idx}) => 
        !state.visited.has(idx) && 
        idx >= 13
      );
    
    if (climaxPool.length > 0) {
      idx = climaxPool[Math.floor(Math.random() * climaxPool.length)].idx;
    } else {
      // クライマックスシーンがなくなったら、未訪問のシーンから選択
      const pool = scenes.map((_,i)=>i).filter(i=>!state.visited.has(i));
      idx = (pool.length>0) ? pool[Math.floor(Math.random()*pool.length)]
                            : Math.floor(Math.random()*scenes.length);
    }
  }

  state.visited.add(idx); state.scenesSeen++;
  sceneIndex = idx; lineIndex = -1; // -1に設定して、advanceLine()で0になるように

  const sc = scenes[sceneIndex];
  if (sc.bg)  changeBackground(sc.bg);
  // BGMは異なる場合のみ再生（重複防止）
  if (sc.bgm && sc.bgm !== currentBGMKey) {
    playBGM(sc.bgm);
  }
  
  // linesが関数の場合は実行して動的に生成
  const sceneLines = typeof sc.lines === 'function' 
    ? sc.lines(choicesHistory, state) 
    : sc.lines;
  
  // 最初の行を表示（lineIndexは-1のまま、advanceLine()で0になる）
  if (sceneLines && sceneLines.length > 0) {
    const ln = sceneLines[0]; 
    say(ln.speaker||'', ln.text||'');
    lineIndex = 0; // 表示後に0に設定
  }
  updateDebug();
}

// ===== パラメータ =====
function applyDelta(d){
  if('evid'   in d) state.evid   = Math.max(0, state.evid + d.evid);
  if('trust'  in d) state.trust  = state.trust + d.trust;
  if('shadow' in d) state.shadow = Math.max(0, state.shadow + d.shadow);
  updateDebug();
}
const getE = ()=>state.evid, getT=()=>state.trust, getS=()=>state.shadow;

// ===== 7エンド判定（各エンド+2行＋クリック誘導） =====
function endByFormula(reason){
  const E=getE(), T=getT(), S=getS();

  if(E>=5 && S>=3 && T>=1) return showEnding(1, [
    '来客のための応接。銀のスプーン、写真立て、紙切れ。全員の顔色が変わった。私は湯を沸かしに戻る。',
    '湯気の向こうで、当主は目を細める。静茶は机の下、何かを足で押し止めた。',
    '白磁の匙がテーブルの上に置かれている。向きは、さっき私が確認した時と違う。',
    '誰かが動かした。それとも、匙が自分で動いたのか。',
    '夜が更けても、庭の灯は一本だけ消えない。その灯の下、白い磁器の欠片が光っている。',
    '——明日、その灯の根元を見に行く。匙の向きが、全てを教えてくれるはずだ。'
  ], true);

  if(E>=4 && T<=-1) return showEnding(4, [
    '応接の空気は冷え切った。「あなたには、もうお願いできません」玄関で靴紐が震える。',
    '戸の向こうで小さな笑い声。私の声に似ていた。',
    'ポケットの中で、白磁の匙が冷たく震えている。証拠として持ち出した匙が、今は重く感じられる。',
    '奥様は匙の向きに気づいていた。だから、私を信頼できなくなったのだ。',
    '鍵の音が遠のく。ここで私の役目は終わった。',
    '玄関を出る前に、ポケットから匙を取り出し、門柱の下に置いた。誰かが拾うだろう。'
  ], false);

  if(S>=5 && E<3) return showEnding(5, [
    '廊下の端に背の高い影。灯りが揺れ、息が詰まる。冷たい気配が近づいた。',
    '足の裏が畳に吸い付く。声が出ない。',
    '台所から、白磁の匙が落ちる音がした。誰かが使っている。いや、匙が自分で動いている。',
    '影が伸びて、私の足元に届く。その影の先に、白い磁器の欠片が散らばっている。',
    '灯が落ちた。そこで記憶は途切れた。',
    '最後に聞こえたのは、匙が床を擦る音だった。向きを変える音。'
  ], false);

  if(T>=3 && E>=2 && S<=2) return showEnding(6, [
    '証拠は片づけた。来客は笑顔で帰る。奥様と目が合い、静かな重みだけが残る。',
    '卓上に一枚の座布団だけ余ったまま。その横に、白磁の匙が正しい向きで置かれている。',
    '私は匙を手に取り、光を確かめた。艶が戻り、茶渋も落ちている。',
    '「この匙、大切にしてくださいね」奥様が小さく言った。私は頷き、匙を棚に戻した。',
    '——誰の席だったのか。次の朝、私は井戸端から確かめる。',
    'その時、匙の向きがまた変わっているかもしれない。それでも、私はここにいる。'
  ], true);

  if(T>=2 && S>=3 && E<4) return showEnding(3, [
    '当主の低い声。「お前はよく見ているな」私はただ頷き、茶を注ぐ。',
    '茶柱が立った。誰も口にしないが、それだけで十分だった。',
    '茶碗の横に、白磁の匙が置かれている。当主が私の視線に気づき、匙を手に取った。',
    '「この匙は、前任者が残していったものだ。向きを変えると、何かが変わる」',
    '扉の隙間、影が一つ増えた気がする。次に確かめるのは、納戸の棚だ。',
    '匙の向きが、その答えを教えてくれるかもしれない。'
  ], true);

  if(T>=1 && S>=4 && E>=1) return showEnding(2, [
    '静茶の囁き。「ここだけの話にしましょう」私は小さく礼をして台所へ戻る。',
    '彼女の袖口は濡れていた。誰かの手を、さっきまで引いていたように。',
    '台所の流しに、白磁の匙が置かれている。静茶が私を見て、小さく頷いた。',
    '「あの匙、向きを変えると、見えないものが見えるようになるの」',
    '短い合図を決めた。——次、灯が三度消えたら、裏門へ。',
    'その時、匙の向きも確認する。静茶が教えてくれた、この家の秘密の鍵を。'
  ], true);

  if(S>=6) return showEnding(7, [
    '暗がりに裸足の人影。「幽霊だ！」気づけば外にいた。後で分かった。あれは人だった。',
    '門の外で笑い声が背に張り付く。',
    '逃げる途中、ポケットから白磁の匙が落ちた。拾おうとしたが、手が震えて届かない。',
    '匙が地面に落ち、向きが変わる。その瞬間、影が増えた。',
    '遠くで風鈴だけが鳴っている。',
    '匙は門の内側に残された。向きを変えられた匙が、次に誰を呼び寄せるのか。'
  ], false);

  if(reason==='規定到達'){
    return showEnding(6, [
      '来客は何事もなく帰った。私は道具を拭き直し、戸を静かに閉めた。',
      '余った箸が一本。誰も口にしないが、それだけで十分だった。',
      '台所に戻ると、白磁の匙が流しに置かれている。向きは、私が最後に見た時と同じだ。',
      'しかし、よく見ると、ほんの少し角度が違う。誰かが動かしたのか、それとも——',
      '明日、箸袋の数を合わせる。——そこで何かが欠けるはず。',
      '匙の向きも、もう一度確認する。この家の秘密は、匙が全てを知っている。'
    ], true);
  }
  return false;
}

function showEnding(no, linesArr, hasHook){
  // エンディングBGMに切り替え（重複防止のため、現在のBGMと異なる場合のみ）
  if (currentBGMKey !== 'END_REPRISE') {
    stopBGM();
    setTimeout(() => {
      playBGM('END_REPRISE');
    }, 100);
  }
  
  const body = linesArr.join('\n');
  const tail = hasHook ? '（続きの気配がある）' : '（ここで終わり）';
  const fullText = `${body}\n\n— END ${no} —\n\n${tail}\n\n《 クリックでタイトルに戻る 》`;

  changeBackground(BG.silhouette);
  setText('', fullText);
  choiceArea.innerHTML='';

  // 恐怖エンディング（shadowが高い、または恐怖的な内容）の場合、演出を追加
  const fearEndings = [5, 7]; // shadowが高いエンディング
  if(fearEndings.includes(no)){
    setTimeout(()=>{
      triggerFearEffect('intense', true);
    }, 500);
  } else if(no === 2 || no === 3){
    // 中程度の恐怖エンディング
    setTimeout(()=>{
      triggerFearEffect('medium', true);
    }, 500);
  }

  isRunning=false;
  isEnding=true;     // クリックで init()
  return true;
}

// ===== シーン（会話自然化＋ after 追加） =====
const scenes = [
  // 1 応接：匙の向き
  {
    required: true, // 必須シーン
    bg: BG.living,
    bgm:'WALTZ_SOFT', // 優雅な日常の雰囲気
    lines:[
      {speaker:'',     text:'応接の間。\n\n来客用の銀のスプーンが、白磁の匙と並べて置かれている。\n光が、二つの金属を照らし出している。'},
{speaker:'',     text:'テーブルの上、光が反射して揺らめく。\n\nその揺らめきが、何かを示唆しているようだ。'},
{speaker:'私',   text:'白磁の匙の向きが、さっきと違う。\n\n確かに、向きが変わっている。'},
{speaker:'私',   text:'誰かが、動かしたのだろうか。\n\nそれとも、匙が自分で動いたのか。'},
{speaker:'奥様', text:'それは後で私が。\n\n向きを変えたのは、私です。'},
{speaker:'奥様', text:'向きを変えると、見えないものが見えるようになるの。\n\nその言葉に、重みがある。'},
{speaker:'',     text:'座布団が一枚、余っている。\n\n誰の席だろう。その空席が、気になる。'},
{speaker:'',     text:'来客用の座布団が、一つだけ余っている。\n\nその余りが、部屋の空気を重くする。'},
{speaker:'私',   text:'……磨いておきます。\n\n匙を手に取り、布で拭く。'},
{speaker:'私',   text:'匙を磨いて、正しい向きに戻しておく。\n\n光が、正しい角度で反射する。'}
],
choices:[
{
        label:'磨いて棚に戻す',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'艶が戻りました。\n\n\n白磁の表面が、再び光を反射し始める。'},
{speaker:'私',   text:'光が、正しい向きに反射する。\n\nその光が、部屋を明るく照らす。'},
{speaker:'奥様', text:'助かるわ。\n光る物は"数"が目立つの。\nその言葉に、何かが隠されている。'},
{speaker:'奥様', text:'向きを変えると、見えないものが見えるようになる。\n\nその意味を、私はまだ理解できていない。'}
]
},
{
        label:'ポケットにしまう',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私',   text:'一時的に預かります。\n\n\nポケットにしまい、向きを確認する。'},
{speaker:'私',   text:'匙の向きを記録しておく。\n\n頭の中に、その角度を刻み込む。'},
{speaker:'奥様', text:'預かるのは結構。\nでも、戻す場所は同じに。\nその言葉に、警告が含まれている。'},
{speaker:'',     text:'（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。\n（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。'}
]
},
{
        label:'向きを変えて置く',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'向きを変えて置いてみる。\n\n\n匙を、違う角度に回す。'},
{speaker:'私',   text:'瞬間、空気が揺れた。\n\n部屋の空気が、微かに動いた。'},
{speaker:'奥様', text:'……向きを変えたのね。\n\nその声に、何かが混じっている。'},
{speaker:'',     text:'（何かが、動いた気がする）\n背後の空気が、重くなった。\n（何かが、動いた気がする）\n背後の空気が、重くなった。'}
]
}
]
},

// 2 廊下：足音
{
required: true, // 必須シーン
bg: BG.hallway,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'',     text:'コツ……コツ……。\n\n廊下の向こうから、足音が聞こえる。'},
{speaker:'静茶', text:'……今、向こうで足音がしました。\n\nその声が、震えている。'},
{speaker:'私',   text:'（反響にしては近い）\n足音が、すぐ近くに聞こえる。\n（反響にしては近い）\n足音が、すぐ近くに聞こえる。'}
],
choices:[
{
        label:'音の方へ行く\n（確かめる）',
        delta:{ shadow:+1 },
        after:[
          {speaker:'私',   text:'角で途切れています。\n\n\n廊下の角を曲がると、誰もいない。'},
{speaker:'私',   text:'足音の主は、もういない。\n\nしかし、空気だけが残っている。'},
{speaker:'静茶', text:'そこ、よく"薄くなる"んです。\n空気が。\nその言葉に、冷たい風が混じる。'},
{speaker:'私',   text:'向こうと混ざる、ということ？\nその意味を、理解しようとする。\n向こうと混ざる、ということ？\nその意味を、理解しようとする。'},
{speaker:'静茶', text:'はい。\n\n短い返事に、重みがある。'},
{speaker:'',     text:'（影は増え続ける。\n気づかないふりも、時には必要）\n背後の影が、一つ増えた気がする。'}
]
},
{
        label:'作業に戻る\n（無視する）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'一旦戻ります。\n\n\n足音の方を向かず、作業場へ戻る。'},
{speaker:'私',   text:'音は、気のせいかもしれない。\n\nそう信じようとする。'},
{speaker:'静茶', text:'判断、早いですね。\n\nその声に、安堵が混じっている。'},
{speaker:'',     text:'作業を続けながら、私はこの家の空気を感じ取る。\n\nその空気が、重く、冷たく感じられる。'}
]
},
{
        label:'静茶に尋ねる\n（相談する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'静茶さん、あの音は……。\n\n\nその音の正体を、尋ねる。'},
{speaker:'静茶', text:'……気にしない方がいいです。\n\nその声が、震えている。'},
{speaker:'静茶', text:'聞こえる音と、聞こえない音があるんです。\n\nその言葉に、深い意味が隠されている。'},
{speaker:'',     text:'（静茶の言葉に、何か隠されている）\nその表情が、何かを語りかけている。\n（静茶の言葉に、何か隠されている）\nその表情が、何かを語りかけている。'}
]
}
]
},

// 3 台所：濡れた紙切れ
{
required: true, // 必須シーン
bg: BG.kitchen,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',      text:'朝の台所。\nかまどの火は消えているが、まだ温かい。\nその温かさが、何かを示唆している。'},
{speaker:'私',    text:'花瓶の底に……「見ている」の文字。\n\nその文字が、冷たく光っている。'},
{speaker:'静茶',  text:'さっきは、ありませんでした。\n\nその声が、震えている。'},
{speaker:'',      text:'墨の滲みは新しい。\n昨夜、誰かが書いた。\nその文字が、まだ乾いていない。'},
{speaker:'私',    text:'誰が、いつ置いた？\nその疑問が、頭を巡る。\n誰が、いつ置いた？\nその疑問が、頭を巡る。'},
{speaker:'静茶',  text:'台所にいたのは、私と……あなた、だけ。\n\nその言葉に、何かが隠されている。'},
{speaker:'',      text:'流しの横、白磁の匙が置かれている。\n\n向きが、さっきと違う。誰かが、動かしたのだろうか。'},
{speaker:'',      text:'たらいの水が、微かに揺れている。\n\n誰かが、さっきまで手を浸していた。その痕跡が、残っている。'}
],
choices:[
{
        label:'紙を読む\n（証拠を集める）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'筆圧が浅い。\n\n急いで書いた跡。\nその文字が、震えている。'},
{speaker:'私',   text:'文字の向きも、不自然だ。\n\n右から左へ、不規則に書かれている。'},
{speaker:'静茶', text:'滲みも新しい。\n今夜のもの。\nその言葉に、重みがある。'},
{speaker:'',     text:'（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。\n（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。'}
]
},
{
        label:'捨てる\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'濡れは拭きます。\n\n\n布で、文字を消す。'},
{speaker:'私',   text:'見なかったことにしておく。\n\nその文字を、記憶から消そうとする。'},
{speaker:'静茶', text:'……跡は残りますよ。\n跡から辿られることも。——それでも？\nその言葉に、警告が含まれている。'},
{speaker:'私',   text:'ええ。\n\n短い返事に、決意が込められている。'},
{speaker:'',     text:'（信頼は刃にもなる。\nしかし、見ないふりも時には必要）\nその選択が、正しいのか、まだ分からない。'}
]
},
{
        label:'静茶に見せる\n（相談する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'静茶さん、これを見てください。\n\n\n紙切れを、静茶に差し出す。'},
{speaker:'静茶', text:'……これは、昨夜のものですね。\n\nその声が、震えている。'},
{speaker:'静茶', text:'書いたのは、私じゃない。\n\nその言葉に、恐怖が混じっている。'},
          {speaker:'',     text:'（静茶の表情が、一瞬変わった）\nその変化が、何かを示唆している。'}
        ]
      }
    ]
  },

  // 4 書斎：二つの筆跡
  {
    required: true, // 必須シーン
    bg: BG.study,
    bgm:'EXPLORE', // 探索・調査
    lines:[
      {speaker:'',       text:'書斎。机の上には古い帳簿と、新しい買い物リスト。\nその二つが、並べて置かれている。'},
      {speaker:'私',     text:'買い物リスト……墨が二種類。筆跡も違う。\nその違いが、目に付く。'},
      {speaker:'',       text:'一つは当主の字。もう一つは、誰の？\nその疑問が、頭を巡る。'},
      {speaker:'当主',   text:'……それは、誰に見せるつもりだ。\nその声が、低く響く。'},
      {speaker:'私',     text:'見せる相手は、まだ決めていません。\nその返事に、迷いが混じっている。'},
      {speaker:'',       text:'机の上、白磁の匙が置かれている。\n向きは、私が知っている向きと違う。誰かが、動かしたのだろうか。'}
    ],
choices:[
{
        label:'当主に渡す\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'当主', text:'置いていけ。\nその言葉に、命令が含まれている。'},
          {speaker:'私',   text:'記録は私が控えます。\nその返事に、従順さが表れている。'},
          {speaker:'私',   text:'二つの筆跡を、頭に刻む。\nその違いを、記憶に焼き付ける。'},
          {speaker:'当主', text:'……忘れるな。\nその言葉に、警告が込められている。'},
          {speaker:'',     text:'（信頼は刃にもなる。しかし、見ないふりも時には必要）\nその選択が、正しいのか、まだ分からない。'}
        ]
},
{
        label:'黙って仕舞う\n（証拠を隠す）',
        delta:{ evid:+1, trust:-1, shadow:+1 },
        after:[
          {speaker:'',     text:'障子がわずかに鳴る。\n\n\nその音が、不気味に響く。'},
{speaker:'私',   text:'（視線が増えた）\n背後の空気が、重くなった。\n（視線が増えた）\n背後の空気が、重くなった。'},
{speaker:'私',   text:'誰かが、見ている。\n\nその視線が、背中を這い上がる。'},
{speaker:'',     text:'（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。\n（証拠を集めすぎると、誰かが気づくかもしれない）\n背筋に、冷たいものが這い上がる。'}
]
},
{
        label:'コピーを取る\n（証拠を残す）',
        delta:{ evid:+2, trust:-1 },
        after:[
          {speaker:'私',   text:'紙を写し取る。\n\n\nその文字を、別の紙に写す。'},
{speaker:'私',   text:'二つの筆跡を、記録しておく。\n\nその違いを、頭に刻み込む。'},
{speaker:'',     text:'机の引き出しが、微かに動いた。\n\nその音が、不気味に響く。'},
{speaker:'',     text:'（誰かが、気づいている）\n背後の空気が、重くなった。\n（誰かが、気づいている）\n背後の空気が、重くなった。'}
]
}
]
},

// 5 台所：古い客の噂
{
bg: BG.kitchen,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'静茶', text:'古い客、知ってます？　声をまねます。\n古い客、知ってます？　声をまねます。'},
{speaker:'',     text:'廊下から、私の声で「おいで」。\n廊下から、私の声で「おいで」。'},
{speaker:'私',   text:'（私の声、\nなのに違う）'}
],
choices:[
{
        label:'確かめに行く\n（調査する）',
        delta:{ shadow:+1 },
        after:[
          {speaker:'私',   text:'誰もいない。\n\n誰もいない。'},
{speaker:'私',   text:'声の主は、消えていた。\n声の主は、消えていた。'},
{speaker:'静茶', text:'声だけ置いていくんですよ、あれ。\n声だけ置いていくんですよ、あれ。'},
{speaker:'',     text:'声の残響を感じながら、私は次の作業へと向かう。\n声の残響を感じながら、私は次の作業へと向かう。'}
]
},
{
        label:'無視する\n（作業を続ける）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'先に配膳を。\n\n先に配膳を。'},
{speaker:'私',   text:'声は、気のせいかもしれない。\n声は、気のせいかもしれない。'},
{speaker:'静茶', text:'助かります。\n逃げ道は確保しておきます。'},
{speaker:'',     text:'配膳を進めながら、私はこの家の空気を感じ取る。\n配膳を進めながら、私はこの家の空気を感じ取る。'}
]
},
{
        label:'静茶に尋ねる\n（相談する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'静茶さん、あの声は……。\n\n静茶さん、あの声は……。'},
{speaker:'静茶', text:'……古い客の声です。\n……古い客の声です。'},
{speaker:'静茶', text:'声をまねるんです。\n声をまねるんです。'},
{speaker:'',     text:'（静茶の言葉に、\n何か隠されている）'}
]
}
]
},

// 6 庭：灯が消える
{
bg: BG.dining,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'',   text:'夜。\n庭の灯が奥から手前へ、順に消える。'},
{speaker:'',   text:'行灯の灯りが、一つ、また一つと消えていく。\n行灯の灯りが、一つ、また一つと消えていく。'},
{speaker:'私', text:'（消す人が近づく順）\n（消す人が近づく順）'},
{speaker:'',   text:'最後の灯の横に背の高い影。\n灯芯はまだ温かい。'},
{speaker:'',   text:'誰かが、さっきまでここにいた。\n誰かが、さっきまでここにいた。'}
],
choices:[
{
        label:'外へ出る\n（確かめる）',
        delta:{ shadow:+1 },
        after:[
          {speaker:'私',   text:'芯の煤が新しい。\n\n芯の煤が新しい。'},
{speaker:'私',   text:'誰かが、さっきまでここにいた。\n誰かが、さっきまでここにいた。'},
{speaker:'奥様', text:'今は追わないで。\n入る口は一つじゃないの。'},
{speaker:'',     text:'外の気配を感じながら、私は家の中へ戻る。\n外の気配を感じながら、私は家の中へ戻る。'}
]
},
{
        label:'窓を閉めて戻る\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'奥様', text:'判断が早いわ。\n\n判断が早いわ。'},
{speaker:'私',   text:'音を減らします。\n音を減らします。'},
{speaker:'私',   text:'外の気配は、内に入れない。\n外の気配は、内に入れない。'},
{speaker:'',     text:'窓を閉めながら、私は次の作業へと向かう。\n窓を閉めながら、私は次の作業へと向かう。'}
]
},
{
        label:'灯を消す順番を記録\n（証拠を集める）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'消えた順番を控えます。\n\n消えた順番を控えます。'},
{speaker:'私',   text:'奥から手前へ。\n誰かが近づいてきた。'},
{speaker:'奥様', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 7 廊下：反響（afterで「証拠を見せる」の直後会話）
{
bg: BG.hallway,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'奥様', text:'顔色が悪いわね。\n顔色が悪いわね。'},
{speaker:'',     text:'柱と障子の間で、声が二度返る廊下。\n柱と障子の間で、声が二度返る廊下。'},
{speaker:'',     text:'耳元で、私の声で「逃げなさい」。\n耳元で、私の声で「逃げなさい」。'},
{speaker:'私',   text:'（近すぎる）\n（近すぎる）'}
],
choices:[
{
        label:'証拠を見せる\n（信頼を得る）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'足跡は角で途切れます。\n\n灯も順に消えた。'},
{speaker:'私',   text:'それと、白磁の匙の向きも変わっています。\nそれと、白磁の匙の向きも変わっています。'},
{speaker:'奥様', text:'……わかりました。\n今夜は私が見張ります。あなたは戸を。'},
{speaker:'',     text:'（証拠を整理して見せることで、\n新たな手がかりが見えてきた）'}
]
},
{
        label:'無言で通る\n（無視する）',
        delta:{ trust:-1, shadow:+1 },
        after:[
          {speaker:'',     text:'誰も追ってこない。\n\nけれど足音だけは増えた。'},
{speaker:'私',   text:'（足音が、\n後ろからついてくる）'},
{speaker:'',     text:'足音を感じながら、私は次の場所へと向かう。\n足音を感じながら、私は次の場所へと向かう。'}
]
},
{
        label:'静茶に相談する\n（情報を得る）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'静茶さん、この足跡は……。\n\n静茶さん、この足跡は……。'},
{speaker:'静茶', text:'……それは、古い客の足跡です。\n……それは、古い客の足跡です。'},
{speaker:'静茶', text:'夜になると、現れるんです。\n夜になると、現れるんです。'},
{speaker:'',     text:'（静茶の言葉に、\n何か隠されている）'}
]
}
]
},

// 8 玄関：靴の数
{
bg: BG.genkan,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',     text:'玄関の式台。\n履物が整然と並んでいる。'},
{speaker:'私',   text:'靴が、一足多い。\n靴が、一足多い。'},
{speaker:'',     text:'草履、下駄、そして見知らぬ革靴。\n泥がまだ湿っている。'},
{speaker:'奥様', text:'……（見ないふりで通る）\n……（見ないふりで通る）'}
],
choices:[
{
        label:'揃えて奥へ\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'泥は乾いていません。\n\n泥は乾いていません。'},
{speaker:'私',   text:'靴を整然と並べる。\n靴を整然と並べる。'},
{speaker:'奥様', text:'では、今夜の客ですね。\nでは、今夜の客ですね。'},
{speaker:'',     text:'靴を揃えながら、私は次の作業へと向かう。\n靴を揃えながら、私は次の作業へと向かう。'}
]
},
{
        label:'誰のか確かめる\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'踵がすり減っている。\n\n背の高い歩幅。'},
{speaker:'私',   text:'この靴の主は、背が高い。\nこの靴の主は、背が高い。'},
{speaker:'奥様', text:'……覚えが、ないわ。\n……覚えが、ないわ。'},
{speaker:'',     text:'靴の痕跡を確認しながら、私は次の場所へと向かう。\n靴の痕跡を確認しながら、私は次の場所へと向かう。'}
]
},
{
        label:'靴に印を付ける\n（証拠を残す）',
        delta:{ evid:+2, trust:-1 },
        after:[
          {speaker:'私',   text:'靴に小さな印を付ける。\n\n靴に小さな印を付ける。'},
{speaker:'私',   text:'動いたら、分かるように。\n動いたら、分かるように。'},
{speaker:'奥様', text:'……印は、見られないように。\n……印は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 10 窓締め（自然化）
{
bg: BG.living,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'',     text:'夕方。\n日が落ちる前に、窓を閉めなければならない。'},
{speaker:'静茶', text:'空気が逃げますから。\n冷えると足音が響きやすくなる。'},
{speaker:'',     text:'障子が次々と閉まる。\n外の気配が、内に入りやすくなる時間。'},
{speaker:'',     text:'灯りを点ける前に、戸締まりを確認する。\n灯りを点ける前に、戸締まりを確認する。'}
],
choices:[
{
        label:'従う\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'静茶', text:'今夜は窓の音でわかります。\n\n今夜は窓の音でわかります。'},
{speaker:'私',   text:'合図を決めましょう。\n合図を決めましょう。'},
{speaker:'私',   text:'窓を閉める順番も、確認しておく。\n窓を閉める順番も、確認しておく。'},
{speaker:'',     text:'合図を決めながら、私は次の作業へと向かう。\n合図を決めながら、私は次の作業へと向かう。'}
]
},
{
        label:'窓を開ける\n（反発する）',
        delta:{ trust:-1, shadow:+1 },
        after:[
          {speaker:'私',   text:'湿気が落ち着きます。\n\n湿気が落ち着きます。'},
{speaker:'私',   text:'空気を入れ替える。\n空気を入れ替える。'},
{speaker:'静茶', text:'足音も、入りやすくなりますけど。\n足音も、入りやすくなりますけど。'},
{speaker:'',     text:'（窓を開けることで、外からの気配が入りやすくなった。\n静茶の信頼は失われた）'},
{speaker:'',     text:'窓を開けながら、私は次の作業へと向かう。\n窓を開けながら、私は次の作業へと向かう。'}
]
},
{
        label:'一部だけ開ける\n（折衷案）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'一部だけ開けておきます。\n\n一部だけ開けておきます。'},
{speaker:'私',   text:'空気は入れ替えつつ、安全も確保。\n空気は入れ替えつつ、安全も確保。'},
{speaker:'静茶', text:'……賢い判断ですね。\n……賢い判断ですね。'},
{speaker:'',     text:'（静茶の表情が、\n少し和らいだ）'}
]
}
]
},

// 11 鏡：もう一つの肩（自然化）
{
bg: BG.mirror,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私',   text:'曇りを拭く。\n拭いたところに、角度の違う“もう一つの肩”。'},
{speaker:'',     text:'振り返る。\n畳の上には誰もいない。'},
{speaker:'当主', text:'……見えてしまったか。\n……見えてしまったか。'},
{speaker:'当主', text:'あれはこの家の「重さ」だ。\nおまえには、まだ重い。忘れろ。'}
],
choices:[
{
        label:'鏡を覆う\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'布を掛けます。\n\n布を掛けます。'},
{speaker:'私',   text:'見えないものは、見えないままに。\n見えないものは、見えないままに。'},
{speaker:'当主', text:'賢い。\n賢い。'},
{speaker:'',     text:'鏡の横、洗面台に白磁の匙が置かれている。\n向きは、私が知っている向きと違う。'},
{speaker:'',     text:'鏡を覆いながら、私は次の作業へと向かう。\n鏡を覆いながら、私は次の作業へと向かう。'}
]
},
{
        label:'映り込みを記録\n（証拠を集める）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'肩幅、角度、柱の線——記録。\n\n肩幅、角度、柱の線——記録。'},
{speaker:'私',   text:'もう一つの肩の主を、頭に刻む。\nもう一つの肩の主を、頭に刻む。'},
{speaker:'当主', text:'……覚えておけ。\nただし、口にはするな。忘れたふりをしろ。'},
{speaker:'',     text:'記録を頭に刻みながら、私は次の場所へと向かう。\n記録を頭に刻みながら、私は次の場所へと向かう。'}
]
},
{
        label:'鏡を割る\n（危険な選択）',
        delta:{ shadow:+2, evid:+1 },
        after:[
          {speaker:'',     text:'鏡が割れる音。\n\n鏡が割れる音。'},
{speaker:'私',   text:'……すみません。\n……すみません。'},
{speaker:'当主', text:'……割れた鏡には、何も映らない。\n……割れた鏡には、何も映らない。'},
{speaker:'',     text:'（何かが、\n解放された気がする）'}
]
}
]
},

// 12 配膳：余分な椀
{
bg: BG.dining,
bgm:'WALTZ_SOFT', // 優雅だが不気味な雰囲気
lines:[
{speaker:'',     text:'夕食の準備。\n膳が並ぶ。箸は五膳分。'},
{speaker:'奥様', text:'念のため、もう一人分を。\n——昔と同じように。'},
{speaker:'',     text:'椀が静かに増える。\n箸も、もう一膳。'},
{speaker:'',     text:'テーブルの上、白磁の匙が正しい向きで置かれている。\nテーブルの上、白磁の匙が正しい向きで置かれている。'},
{speaker:'',     text:'座布団が一枚、余っている。\n誰の席だろう。'}
],
choices:[
{
        label:'黙って揃える\n（受け入れる）',
        delta:{ trust:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'箸は二度数えます。\n\n箸は二度数えます。'},
{speaker:'私',   text:'余分な一膳を、そのままにしておく。\n余分な一膳を、そのままにしておく。'},
{speaker:'奥様', text:'ええ。\n数は、嘘をつくから。'},
{speaker:'',     text:'（余分な椀を受け入れることで、見えない存在を認めた。\n影が濃くなった）'}
]
},
{
        label:'数を直す\n（否定する）',
        delta:{ trust:-1, evid:+1 },
        after:[
          {speaker:'私',   text:'一つ下げます。\n\n一つ下げます。'},
{speaker:'私',   text:'余分な一膳を、取り除く。\n余分な一膳を、取り除く。'},
{speaker:'奥様', text:'では、来客は裏から入るでしょうね。\nでは、来客は裏から入るでしょうね。'},
{speaker:'',     text:'数を直しながら、私は次の作業へと向かう。\n数を直しながら、私は次の作業へと向かう。'}
]
},
{
        label:'余分な箸を記録\n（証拠を残す）',
        delta:{ evid:+2, shadow:+1 },
        after:[
          {speaker:'私',   text:'余分な箸の位置を、記録しておく。\n\n余分な箸の位置を、記録しておく。'},
{speaker:'私',   text:'動いたら、分かるように。\n動いたら、分かるように。'},
{speaker:'奥様', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 13 便所：叩く音（自然化）
{
bg: BG.hallway,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私',   text:'戸を閉める。\n壁の向こうで三度、乾いた音。'},
{speaker:'当主', text:'返してはいけない。\n返してはいけない。'},
{speaker:'私',   text:'合図、なのですか。\n合図、なのですか。'},
{speaker:'当主', text:'音は糸より早い。\n合図は先に届く。だから返すなと言った。'}
],
choices:[
{
        label:'同じ回数だけ叩く\n（返事をする）',
        delta:{ shadow:+2 },
        after:[
          {speaker:'',     text:'コン、コン、コン。\n\nコン、コン、コン。'},
{speaker:'私',   text:'……返ってきません。\n……返ってきません。'},
{speaker:'私',   text:'向こうから、何も聞こえない。\n向こうから、何も聞こえない。'},
{speaker:'当主', text:'今は、な。\n今は、な。'},
{speaker:'',     text:'音の余韻を感じながら、私は次の場所へと向かう。\n音の余韻を感じながら、私は次の場所へと向かう。'}
]
},
{
        label:'静かに念入りに掃除\n（無視する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'床溝に糸。\n\n誰かが引いた跡。'},
{speaker:'私',   text:'糸の向きを、記録しておく。\n糸の向きを、記録しておく。'},
{speaker:'当主', text:'向こうにも、こちらの数が聞こえている。\n向こうにも、こちらの数が聞こえている。'},
{speaker:'',     text:'掃除を続けながら、私は次の作業へと向かう。\n掃除を続けながら、私は次の作業へと向かう。'}
]
},
{
        label:'音の数を数える\n（記録する）',
        delta:{ evid:+2, shadow:+1 },
        after:[
          {speaker:'私',   text:'三度。\n\n正確に三度。'},
{speaker:'私',   text:'音の間隔も、記録しておく。\n音の間隔も、記録しておく。'},
{speaker:'当主', text:'……数を数えるな。\n数は、嘘をつく。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 14 納戸：棚の奥（自然化）
{
bg: BG.storage,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'私',   text:'棚の奥、濡れている。\n棚の奥、濡れている。'},
{speaker:'当主', text:'触るな。\n触るな。'},
{speaker:'私',   text:'なぜ。\nなぜ。'},
{speaker:'当主', text:'乾かない水は、動く。\n乾かない水は、動く。'}
],
choices:[
{
        label:'一緒に確認\n（協力する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'染みの縁だけ乾いている……動いた跡。\n\n染みの縁だけ乾いている……動いた跡。'},
{speaker:'私',   text:'水が、自分で動いた。\n水が、自分で動いた。'},
{speaker:'当主', text:'見たなら、拭け。\n気づかれないように。'},
{speaker:'',     text:'拭きながら、私は次の場所へと向かう。\n拭きながら、私は次の場所へと向かう。'}
]
},
{
        label:'放っておく\n（無視する）',
        delta:{},
        after:[
          {speaker:'',     text:'濡れた線は、少しずつ棚の外へ。\n\n濡れた線は、少しずつ棚の外へ。'},
{speaker:'私',   text:'（水が、\n動き続けている）'},
{speaker:'',     text:'濡れた線を見ながら、私は次の場所へと向かう。\n濡れた線を見ながら、私は次の場所へと向かう。'}
]
},
{
        label:'染みの形を記録\n（証拠を残す）',
        delta:{ evid:+2, shadow:+1 },
        after:[
          {speaker:'私',   text:'染みの形を、記録しておく。\n\n染みの形を、記録しておく。'},
{speaker:'私',   text:'動いた跡を、頭に刻む。\n動いた跡を、頭に刻む。'},
{speaker:'当主', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 15 門：古い鍵
{
bg: BG.gate,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'静茶', text:'鍵が出ました。\n古いものです。'},
{speaker:'',     text:'渡すべきか、彼女は迷っている。\n渡すべきか、彼女は迷っている。'}
],
choices:[
{
        label:'受け取る\n（証拠を集める）',
        delta:{ evid:+1 },
        after:[
          {speaker:'私',   text:'預かります。\n\n裏門の方ですね。'},
{speaker:'私',   text:'鍵の形を、頭に刻む。\n鍵の形を、頭に刻む。'},
{speaker:'静茶', text:'ええ。\n開く音は、あちらを呼びますから。'},
{speaker:'',     text:'鍵を預かりながら、私は次の場所へと向かう。\n鍵を預かりながら、私は次の場所へと向かう。'}
]
},
{
        label:'戻させる\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'静茶', text:'賛成です。\n\n無音の方が、夜は安全。'},
{speaker:'私',   text:'鍵は、元の場所に戻しておく。\n鍵は、元の場所に戻しておく。'},
{speaker:'',     text:'鍵を戻させながら、私は次の作業へと向かう。\n鍵を戻させながら、私は次の作業へと向かう。'}
]
},
{
        label:'鍵の形を記録\n（証拠を残す）',
        delta:{ evid:+2, trust:-1 },
        after:[
          {speaker:'私',   text:'鍵の形を、記録しておく。\n\n鍵の形を、記録しておく。'},
{speaker:'私',   text:'動いたら、分かるように。\n動いたら、分かるように。'},
{speaker:'静茶', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 16 庭：井戸の底（自然化）
{
bg: BG.gate,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'',     text:'庭の奥、古い井戸。\n石の縁は苔で覆われている。'},
{speaker:'私',   text:'風のない水面が波打つ。\n風のない水面が波打つ。'},
{speaker:'',     text:'桶を下ろす音が、深く響く。\n桶を下ろす音が、深く響く。'},
{speaker:'静茶', text:'夜は見ない方がいいですよ。\n深いので。'},
{speaker:'',     text:'水面に、私の顔が映る。\nそして、もう一つ。'}
],
choices:[
{
        label:'桶を下ろして確かめる\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'底に触れる前に、引っ張られた感覚。\n\n底に触れる前に、引っ張られた感覚。'},
{speaker:'私',   text:'何かが、桶を引っ張っている。\n何かが、桶を引っ張っている。'},
{speaker:'静茶', text:'上がってくる物と、こちらが上げる物は別です。\n間違えると、戻れなくなります。'},
{speaker:'',     text:'井戸の底を感じながら、私は次の場所へと向かう。\n井戸の底を感じながら、私は次の場所へと向かう。'}
]
},
{
        label:'蓋をして離れる\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私',   text:'蓋に小石を置きます。\n\n蓋に小石を置きます。'},
{speaker:'私',   text:'動いたら、音で分かる。\n動いたら、音で分かる。'},
{speaker:'静茶', text:'いいですね。\n音で分かる。'},
{speaker:'',     text:'蓋を閉めながら、私は次の作業へと向かう。\n蓋を閉めながら、私は次の作業へと向かう。'}
]
},
{
        label:'水面を覗き込む\n（危険な選択）',
        delta:{ shadow:+2, evid:+1 },
        after:[
          {speaker:'私',   text:'水面に、私の顔が映る。\n\n水面に、私の顔が映る。'},
{speaker:'私',   text:'そして、もう一つ。\nそして、もう一つ。'},
{speaker:'静茶', text:'……見てしまったのね。\n……見てしまったのね。'},
{speaker:'',     text:'（何かが、\n近づいてきた）'}
]
}
]
},

// 17 玄関：夜半の来客（自然化）
{
bg: BG.genkan,
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'',     text:'真夜中。\n玄関の戸が二度だけ、遠慮がちに鳴る。'},
{speaker:'',     text:'トン、トン。\nまるで、誰かが訪ねてきたように。'},
{speaker:'奥様', text:'開けないで。\n開けると、次はもっと強く来ます。'},
{speaker:'',     text:'戸の向こう、足音が聞こえる。\nしかし、誰もいない。'}
],
choices:[
{
        label:'内鍵を増やし戸を拭く\n（安全を選ぶ）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'蝶番の音は消えました。\n\n蝶番の音は消えました。'},
{speaker:'私',   text:'戸を、二重に固く閉める。\n戸を、二重に固く閉める。'},
{speaker:'奥様', text:'なら、朝まで静かに。\nなら、朝まで静かに。'},
{speaker:'',     text:'戸を固く閉めながら、私は次の場所へと向かう。\n戸を固く閉めながら、私は次の場所へと向かう。'}
]
},
{
        label:'隙間から外を覗く\n（危険な選択）',
        delta:{ shadow:+2 },
        after:[
          {speaker:'私',   text:'……裸足の踵が一つ、戸に寄り添っている。\n\n……裸足の踵が一つ、戸に寄り添っている。'},
{speaker:'私',   text:'誰かが、外で待っている。\n誰かが、外で待っている。'},
{speaker:'奥様', text:'見ると、寄って来ます。\n見ると、寄って来ます。'},
{speaker:'',     text:'外の気配を感じながら、私は家の中へ戻る。\n外の気配を感じながら、私は家の中へ戻る。'}
]
},
{
        label:'戸の音を記録\n（証拠を残す）',
        delta:{ evid:+2, shadow:+1 },
        after:[
          {speaker:'私',   text:'戸を叩く音の回数を、記録しておく。\n\n戸を叩く音の回数を、記録しておく。'},
{speaker:'私',   text:'二度。\n正確に二度。'},
{speaker:'奥様', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 18 廊下：影絵の正体（軽いギャグ）
{
bg: BG.hallway,
bgm:'WALTZ_SOFT', // 軽い雰囲気
lines:[
{speaker:'',     text:'障子に影が三つ。\n歩幅も高さもバラバラ。'},
{speaker:'私',   text:'（……また“あの人”か）\n（……また“あの人”か）'},
{speaker:'静茶', text:'……えい。\n……えい。'}
],
choices:[
{
        label:'静かに注意する\n（控えめに）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'',     text:'手拭いを広げる静茶。\n\n器用に影絵を畳む。'},
{speaker:'私',   text:'……ほどほどに。\n……ほどほどに。'},
{speaker:'私',   text:'影絵は、楽しみながらも控えめに。\n影絵は、楽しみながらも控えめに。'},
{speaker:'静茶', text:'練習です。\n夜の悪い影に負けないように。'},
{speaker:'',     text:'影絵を見ながら、私は次の作業へと向かう。\n影絵を見ながら、私は次の作業へと向かう。'}
]
},
{
        label:'影絵に一つ加える\n（参加する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'',     text:'私も手で狐を作る。\n\n影が四つ、笑う。'},
{speaker:'私',   text:'影が、一つ増えた。\n影が、一つ増えた。'},
{speaker:'静茶', text:'……負けません。\n……負けません。'},
{speaker:'',     text:'影絵を楽しみながら、私は次の場所へと向かう。\n影絵を楽しみながら、私は次の場所へと向かう。'}
]
},
{
        label:'影の数を記録\n（証拠を残す）',
        delta:{ evid:+2, shadow:+1 },
        after:[
          {speaker:'私',   text:'影の数を、記録しておく。\n\n影の数を、記録しておく。'},
{speaker:'私',   text:'三つ。\n正確に三つ。'},
{speaker:'静茶', text:'……記録は、見られないように。\n……記録は、見られないように。'},
{speaker:'',     text:'（誰かが、\n気づいている）'}
]
}
]
},

// 19 台所：白磁の艶（豆知識）
{
bg: BG.kitchen,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',     text:'朝の台所。\nかまどの火が、静かに燃えている。'},
{speaker:'',     text:'白磁の匙に薄い茶渋。\n光が鈍い。'},
{speaker:'奥様', text:'磨き粉は切らしていてね……。\n磨き粉は切らしていてね……。'},
{speaker:'',     text:'たらいの水は冷たい。\n洗濯板が、流しの横に置かれている。'}
],
choices:[
{
        label:'米のとぎ汁で優しく磨く\n（伝統的な方法）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私',   text:'艶が戻りました。\n\n古い脂も浮きます。'},
{speaker:'私',   text:'白磁の光が、正しい向きに反射する。\n白磁の光が、正しい向きに反射する。'},
{speaker:'奥様', text:'まあ……次からそれでいきましょう。\nまあ……次からそれでいきましょう。'},
{speaker:'',     text:'匙を磨きながら、私は次の作業へと向かう。\n匙を磨きながら、私は次の作業へと向かう。'}
]
},
{
        label:'柑橘の皮で油膜を取る\n（香りを残す）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'私',   text:'皮の油で薄く拭きます。\n\n皮の油で薄く拭きます。'},
{speaker:'私',   text:'香りが、匙に残る。\n香りが、匙に残る。'},
{speaker:'奥様', text:'香りが残るのも、悪くないわね。\n香りが残るのも、悪くないわね。'},
{speaker:'',     text:'匙を拭きながら、私は次の場所へと向かう。\n匙を拭きながら、私は次の場所へと向かう。'}
]
},
{
        label:'向きを変えて磨く\n（試してみる）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私',   text:'向きを変えて磨いてみる。\n\n向きを変えて磨いてみる。'},
{speaker:'私',   text:'瞬間、光の反射が変わった。\n瞬間、光の反射が変わった。'},
{speaker:'奥様', text:'……向きを変えたのね。\n……向きを変えたのね。'},
{speaker:'',     text:'（何かが、\n動いた気がする）'}
]
}
]
}
, // ===== ここから追加シーン（append-only） =====

// 井戸：映り込みに触れない
{
bg: BG.gate, // 注釈：洗濯桶を持ち井戸へ。水面は見ないで。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'ここで水を汲めばいいんですね。\nここで水を汲めばいいんですね。'},
{speaker:'静茶', text:'はい……水面は見ないで。\nはい……水面は見ないで。'},
{speaker:'私', text:'どうして。\nどうして。'},
{speaker:'静茶', text:'映るのは、今いる人だけじゃないので。\n映るのは、今いる人だけじゃないので。'}
],
choices:[
{
        label:'黙って水を汲む\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'桶、満たしました。\n\n桶、満たしました。'},
{speaker:'私', text:'水面は見ない。\n音だけを頼りに。'},
{speaker:'静茶', text:'音で十分です。\n音で十分です。'},
{speaker:'', text:'水を汲みながら、私は次の作業へと向かう。\n水を汲みながら、私は次の作業へと向かう。'}
]
},
{
        label:'水面を覗き込む\n（危険な選択）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'……微かな笑い声。\n\n……微かな笑い声。'},
{speaker:'私', text:'水面に、私の顔が映る。\nそして、もう一つ。'},
{speaker:'静茶', text:'聞こえましたか。\n聞こえましたか。'},
{speaker:'', text:'水面から目を離しながら、私は次の場所へと向かう。\n水面から目を離しながら、私は次の場所へと向かう。'}
]
},
{
        label:'蓋をして小石で目印を置く\n（証拠を残す）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私', text:'次に動いたら分かります。\n\n次に動いたら分かります。'},
{speaker:'私', text:'小石の位置を、記録しておく。\n小石の位置を、記録しておく。'},
{speaker:'静茶', text:'いい工夫です。\nいい工夫です。'},
{speaker:'', text:'蓋を閉めながら、私は次の作業へと向かう。\n蓋を閉めながら、私は次の作業へと向かう。'}
]
}
]
},

// 風呂場：鏡の呼び声
{
bg: BG.mirror, // 注釈：湯気。曇った鏡。返事禁止。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'鏡が曇ってますね。\n鏡が曇ってますね。'},
{speaker:'静茶', text:'湯気の奥、覗かない方がいいです。\n湯気の奥、覗かない方がいいです。'},
{speaker:'私', text:'ただの鏡でしょう。\nただの鏡でしょう。'},
{speaker:'静茶', text:'名前を呼ばれたら、返さないで。\n名前を呼ばれたら、返さないで。'}
],
choices:[
{
        label:'鏡を布で覆う\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'布、掛けました。\n\n布、掛けました。'},
{speaker:'私', text:'見えないものは、見えないままに。\n見えないものは、見えないままに。'},
{speaker:'静茶', text:'賢いです。\n賢いです。'},
{speaker:'', text:'鏡を覆いながら、私は次の場所へと向かう。\n鏡を覆いながら、私は次の場所へと向かう。'}
]
},
{
        label:'名を呼ばれても黙る訓練をする\n（準備する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'', text:'……（呼ぶ声）\n\n……（呼ぶ声）'},
{speaker:'私', text:'返しません。\n返しません。'},
{speaker:'私', text:'声を無視する訓練。\n声を無視する訓練。'},
{speaker:'', text:'声を無視しながら、私は次の作業へと向かう。\n声を無視しながら、私は次の作業へと向かう。'}
]
},
{
        label:'曇りを拭き切って確かめる\n（危険な選択）',
        delta:{ shadow:+2 },
        after:[
          {speaker:'私', text:'もう一つの"肩"が、角度違いで。\n\nもう一つの"肩"が、角度違いで。'},
{speaker:'私', text:'鏡に、誰かが映っている。\n鏡に、誰かが映っている。'},
{speaker:'静茶', text:'重いので、忘れてください。\n重いので、忘れてください。'},
{speaker:'', text:'鏡から目を離しながら、私は次の場所へと向かう。\n鏡から目を離しながら、私は次の場所へと向かう。'}
]
}
]
},

// 便所：紙は左右どちら
{
bg: BG.hallway, // 注釈：和式。棚に紙が二つ。外で二度ノック。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'紙、左に置きますね。\n紙、左に置きますね。'},
{speaker:'静茶', text:'左は……夜に足音が来ます。\n左は……夜に足音が来ます。'},
{speaker:'私', text:'右だと。\n右だと。'},
{speaker:'静茶', text:'沈黙です。\n沈黙です。'}
],
choices:[
{
        label:'左に置く（足音を囮にする）\n（誘導する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'', text:'とん、とん。\n\nとん、とん。'},
{speaker:'私', text:'誘導できます。\n誘導できます。'},
{speaker:'私', text:'足音を、左に誘導する。\n足音を、左に誘導する。'},
{speaker:'', text:'紙を置きながら、私は次の場所へと向かう。\n紙を置きながら、私は次の場所へと向かう。'}
]
},
{
        label:'右に置く（静けさを選ぶ）\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'静茶', text:'静かな方が落ち着きます。\n\n静かな方が落ち着きます。'},
{speaker:'私', text:'注意を増やします。\n注意を増やします。'},
{speaker:'私', text:'右に置くことで、静けさを選ぶ。\n右に置くことで、静けさを選ぶ。'},
{speaker:'', text:'紙を置きながら、私は次の作業へと向かう。\n紙を置きながら、私は次の作業へと向かう。'}
]
},
{
        label:'中央に置き印を付ける\n（証拠を残す）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私', text:'動いたら分かるように。\n\n動いたら分かるように。'},
{speaker:'私', text:'印の位置を、記録しておく。\n印の位置を、記録しておく。'},
{speaker:'静茶', text:'……気づかれやすくもなります。\n……気づかれやすくもなります。'},
{speaker:'', text:'印を付けながら、私は次の場所へと向かう。\n印を付けながら、私は次の場所へと向かう。'}
]
}
]
},

// 納戸：手が出る板
{
bg: BG.storage, // 注釈：布団の山。奥の板は触らない。
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'私', text:'布団を奥に詰めます。\n布団を奥に詰めます。'},
{speaker:'静茶', text:'その奥の板、触らないで。\nその奥の板、触らないで。'},
{speaker:'私', text:'なぜ。\nなぜ。'},
{speaker:'静茶', text:'去年まで、そこから手が出て家事を。\n去年まで、そこから手が出て家事を。'}
],
choices:[
{
        label:'二人で確認し最小限だけ動かす\n（協力する）',
        delta:{ trust:+1, evid:+1 },
        after:[
          {speaker:'私', text:'縁だけ乾き……動いた跡。\n\n縁だけ乾き……動いた跡。'},
{speaker:'私', text:'板が、自分で動いた。\n板が、自分で動いた。'},
{speaker:'静茶', text:'見たなら、拭きます。\n見たなら、拭きます。'},
{speaker:'', text:'拭きながら、私は次の場所へと向かう。\n拭きながら、私は次の場所へと向かう。'}
]
},
{
        label:'封をして札を貼る\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'私', text:'札を。\n\n札を。'},
{speaker:'私', text:'板を封じる。\n板を封じる。'},
{speaker:'静茶', text:'音が減ります。\n音が減ります。'},
{speaker:'', text:'封をしながら、私は次の場所へと向かう。\n封をしながら、私は次の場所へと向かう。'}
]
},
{
        label:'板の裏を覗く\n（危険な選択）',
        delta:{ shadow:+2 },
        after:[
          {speaker:'', text:'かすかな爪の音。\n\nかすかな爪の音。'},
{speaker:'私', text:'……今日は出たい日。\n……今日は出たい日。'},
{speaker:'私', text:'板の向こう、何かが動いている。\n板の向こう、何かが動いている。'},
{speaker:'', text:'（何かが、\n近づいてきた）'}
]
}
]
},

// 玄関：一足多い靴（別案）
{
bg: BG.genkan, // 注釈：数が多い。迎えが近い。
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'私', text:'靴が一足、多いですね。\n靴が一足、多いですね。'},
{speaker:'当主', text:'触るな。\n持ち主は迎えに来る。'},
{speaker:'私', text:'いつです。\nいつです。'},
{speaker:'当主', text:'近いうちに。\n近いうちに。'}
],
choices:[
{
        label:'並べ直して土を払う\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'泥はまだ湿っている。\n\n泥はまだ湿っている。'},
{speaker:'私', text:'靴を整然と並べる。\n靴を整然と並べる。'},
{speaker:'当主', text:'今夜の客だ。\n今夜の客だ。'},
{speaker:'', text:'靴を並べながら、私は次の場所へと向かう。\n靴を並べながら、私は次の場所へと向かう。'}
]
},
{
        label:'白墨で印を付けて様子を見る\n（証拠を残す）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私', text:'動けば分かります。\n\n動けば分かります。'},
{speaker:'私', text:'印の位置を、記録しておく。\n印の位置を、記録しておく。'},
{speaker:'当主', text:'覚えられるぞ。\n覚えられるぞ。'},
{speaker:'', text:'印を付けながら、私は次の場所へと向かう。\n印を付けながら、私は次の場所へと向かう。'}
]
},
{
        label:'戸を二重に施錠して下がる\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:+1 },
        after:[
          {speaker:'', text:'外で砂利が一歩。\n\n外で砂利が一歩。'},
{speaker:'私', text:'戸を、二重に固く閉める。\n戸を、二重に固く閉める。'},
{speaker:'当主', text:'迎えが近い。\n迎えが近い。'},
{speaker:'', text:'戸を閉めながら、私は次の場所へと向かう。\n戸を閉めながら、私は次の場所へと向かう。'}
]
}
]
},

// 台所：夜に切れる包丁
{
bg: BG.kitchen, // 注釈：研ぎ音。戸が少し開く。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'包丁、よく切れますね。\n包丁、よく切れますね。'},
{speaker:'静茶', text:'夜の方が切れ味がいいです。\n夜の方が切れ味がいいです。'},
{speaker:'私', text:'なぜ夜。\nなぜ夜。'},
{speaker:'静茶', text:'研いでいるのは私じゃなく、もう一人。\n研いでいるのは私じゃなく、もう一人。'}
],
choices:[
{
        label:'鞘に収め布で巻く\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'私', text:'音は止めました。\n\n音は止めました。'},
{speaker:'私', text:'包丁を、安全に収める。\n包丁を、安全に収める。'},
{speaker:'静茶', text:'安全です。\n安全です。'},
{speaker:'', text:'包丁を収めながら、私は次の場所へと向かう。\n包丁を収めながら、私は次の場所へと向かう。'}
]
},
{
        label:'研ぎ音の主を確かめに行く\n（危険な選択）',
        delta:{ shadow:+2, evid:+1 },
        after:[
          {speaker:'', text:'金属音が戸の隙間を擦る。\n\n金属音が戸の隙間を擦る。'},
{speaker:'私', text:'人を研いでる音……。\n人を研いでる音……。'},
{speaker:'私', text:'誰かが、包丁を研いでいる。\n誰かが、包丁を研いでいる。'},
{speaker:'', text:'（何かが、\n近づいてきた）'}
]
},
{
        label:'刃先を紙で試し記録する\n（証拠を残す）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私', text:'切断痕、異常に滑らか。\n\n切断痕、異常に滑らか。'},
{speaker:'私', text:'切断痕の形を、記録しておく。\n切断痕の形を、記録しておく。'},
{speaker:'静茶', text:'口にはしないでください。\n口にはしないでください。'},
{speaker:'', text:'記録を頭に刻みながら、私は次の場所へと向かう。\n記録を頭に刻みながら、私は次の場所へと向かう。'}
]
}
]
},

// 書斎：日記が日を作る
{
bg: BG.study, // 注釈：古い日記が山。針が一瞬逆回転。
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'私', text:'日記がたくさん……。\n日記がたくさん……。'},
{speaker:'当主', text:'一日分ずつ、この家が書かせる。\n一日分ずつ、この家が書かせる。'},
{speaker:'私', text:'書き忘れると。\n書き忘れると。'},
{speaker:'当主', text:'次の日が来ない。\n次の日が来ない。'}
],
choices:[
{
        label:'今日の空欄を埋めるのを手伝う\n（協力する）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'最低限の事実だけ。\n\n最低限の事実だけ。'},
{speaker:'私', text:'日記に、今日の出来事を記す。\n日記に、今日の出来事を記す。'},
{speaker:'当主', text:'それでいい。\nそれでいい。'},
{speaker:'', text:'日記を書きながら、私は次の場所へと向かう。\n日記を書きながら、私は次の場所へと向かう。'}
]
},
{
        label:'前任の最終頁を読む\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'昨日に閉じ込められた記述。\n\n昨日に閉じ込められた記述。'},
{speaker:'私', text:'前任者の最後の言葉を、頭に刻む。\n前任者の最後の言葉を、頭に刻む。'},
{speaker:'当主', text:'確認はしない方がいい。\n確認はしない方がいい。'},
{speaker:'', text:'日記を読みながら、私は次の場所へと向かう。\n日記を読みながら、私は次の場所へと向かう。'}
]
},
{
        label:'時計を布で覆う\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'', text:'針の音が遠のく。\n\n針の音が遠のく。'},
{speaker:'私', text:'揺れは収まりました。\n揺れは収まりました。'},
{speaker:'私', text:'時計の音が、静かになった。\n時計の音が、静かになった。'},
{speaker:'', text:'時計を覆いながら、私は次の場所へと向かう。\n時計を覆いながら、私は次の場所へと向かう。'}
]
}
]
},

// 屋根裏：昨日と明日
{
bg: BG.hallway, // 注釈：埃。時間が重なる。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'物音がしたので。\n物音がしたので。'},
{speaker:'静茶', text:'屋根裏は、昼でも夜です。\n屋根裏は、昼でも夜です。'},
{speaker:'私', text:'暗いだけじゃ。\n暗いだけじゃ。'},
{speaker:'静茶', text:'時間がないんです、ここ。\n時間がないんです、ここ。'}
],
choices:[
{
        label:'梯子を上げて入口を閉じる\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'今は閉じておきます。\n\n今は閉じておきます。'},
{speaker:'私', text:'屋根裏への入口を、塞ぐ。\n屋根裏への入口を、塞ぐ。'},
{speaker:'静茶', text:'戻れなくなるよりは。\n戻れなくなるよりは。'},
{speaker:'', text:'入口を閉じながら、私は次の場所へと向かう。\n入口を閉じながら、私は次の場所へと向かう。'}
]
},
{
        label:'短時間だけ覗き影を数える\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'……影が一つ増えました。\n\n……影が一つ増えました。'},
{speaker:'私', text:'影の数を、頭に刻む。\n影の数を、頭に刻む。'},
{speaker:'静茶', text:'昨日の人か、明日の人。\n昨日の人か、明日の人。'},
{speaker:'', text:'影を数えながら、私は次の場所へと向かう。\n影を数えながら、私は次の場所へと向かう。'}
]
},
{
        label:'糸電話のように糸を垂らす\n（証拠を残す）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'', text:'糸がぴんと張る。\n\n糸がぴんと張る。'},
{speaker:'私', text:'誰かが触っています。\n誰かが触っています。'},
{speaker:'私', text:'糸の動きを、記録しておく。\n糸の動きを、記録しておく。'},
{speaker:'', text:'糸を垂らしながら、私は次の場所へと向かう。\n糸を垂らしながら、私は次の場所へと向かう。'}
]
}
]
},

// 廊下：外とつながる
{
bg: BG.hallway, // 注釈：冷たい風。床が空になる向こう。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'窓は全部閉まってますよね。\n窓は全部閉まってますよね。'},
{speaker:'静茶', text:'ええ。\nでも廊下は外とつながってます。'},
{speaker:'私', text:'庭ではなく。\n庭ではなく。'},
{speaker:'静茶', text:'“外”です。\n“外”です。'}
],
choices:[
{
        label:'敷居に塩線を引く\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'', text:'風が弱まる。\n\n風が弱まる。'},
{speaker:'私', text:'足音が減りました。\n足音が減りました。'},
{speaker:'私', text:'塩線が、外の気配を遮る。\n塩線が、外の気配を遮る。'},
{speaker:'', text:'塩線を引きながら、私は次の場所へと向かう。\n塩線を引きながら、私は次の場所へと向かう。'}
]
},
{
        label:'足音の数を刻みで記録する\n（証拠を残す）',
        delta:{ evid:+1 },
        after:[
          {speaker:'私', text:'一歩、二歩……増えました。\n\n一歩、二歩……増えました。'},
{speaker:'私', text:'足音の数を、記録しておく。\n足音の数を、記録しておく。'},
{speaker:'静茶', text:'廊下が歩いてるんです。\n廊下が歩いてるんです。'},
{speaker:'', text:'記録を頭に刻みながら、私は次の場所へと向かう。\n記録を頭に刻みながら、私は次の場所へと向かう。'}
]
},
{
        label:'開口部を一つだけ開け囮にする\n（誘導する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'', text:'冷気が一点に集まる。\n\n冷気が一点に集まる。'},
{speaker:'私', text:'誘導はできています。\n誘導はできています。'},
{speaker:'私', text:'外の気配を、一点に集める。\n外の気配を、一点に集める。'},
{speaker:'', text:'開口部を開けながら、私は次の場所へと向かう。\n開口部を開けながら、私は次の場所へと向かう。'}
]
}
]
},

// 地下室："置き場所"
{
bg: BG.storage, // 注釈：湿った階段。奥にランプ。
bgm:'SUSPENSE_LOW', // 恐怖・サスペンス
lines:[
{speaker:'私', text:'誰かいますか。\n誰かいますか。'},
{speaker:'当主', text:'ここは“置き場所”だ。\nここは“置き場所”だ。'},
{speaker:'私', text:'見つけた物と……見つかった人。\n見つけた物と……見つかった人。'},
{speaker:'当主', text:'元に戻すときもある。\n元に戻すときもある。'}
],
choices:[
{
        label:'上に戻る（今は触れない）\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'当主', text:'正解だ。\n\n正解だ。'},
{speaker:'私', text:'息が軽くなりました。\n息が軽くなりました。'},
{speaker:'私', text:'地下室から、上へ戻る。\n地下室から、上へ戻る。'},
{speaker:'', text:'上へ戻りながら、私は次の場所へと向かう。\n上へ戻りながら、私は次の場所へと向かう。'}
]
},
{
        label:'棚の配置を控える\n（証拠を残す）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私', text:'戻せるように記録。\n\n戻せるように記録。'},
{speaker:'私', text:'棚の配置を、頭に刻む。\n棚の配置を、頭に刻む。'},
{speaker:'当主', text:'覚えられるぞ。\n覚えられるぞ。'},
{speaker:'', text:'記録を頭に刻みながら、私は次の場所へと向かう。\n記録を頭に刻みながら、私は次の場所へと向かう。'}
]
},
{
        label:'ランプの奥を覗く\n（危険な選択）',
        delta:{ shadow:+2 },
        after:[
          {speaker:'', text:'誰かの息。\n\n誰かの息。'},
{speaker:'私', text:'ランプの奥、誰かがいる。\nランプの奥、誰かがいる。'},
{speaker:'当主', text:'置かれたくないなら、上がれ。\n置かれたくないなら、上がれ。'},
{speaker:'', text:'（何かが、\n近づいてきた）'}
]
}
]
},

// 洗面所：曇り取り（軽い緩和）
{
bg: BG.mirror, // 注釈：朝。洗面器に水。じゃんけんの冗談。
bgm:'WALTZ_SOFT', // 軽い雰囲気
lines:[
{speaker:'私', text:'鏡がまた曇ってますね。\n鏡がまた曇ってますね。'},
{speaker:'静茶', text:'じゃんけんで曇りを取ります。\nじゃんけんで曇りを取ります。'},
{speaker:'私', text:'負けたら。\n負けたら。'},
{speaker:'静茶', text:'曇り役です。\n鏡の向こうで。'}
],
choices:[
{
        label:'普通に拭く\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'手早く終わらせます。\n\n手早く終わらせます。'},
{speaker:'私', text:'鏡を、普通に拭く。\n鏡を、普通に拭く。'},
{speaker:'静茶', text:'助かります。\n助かります。'},
{speaker:'', text:'鏡を拭きながら、私は次の場所へと向かう。\n鏡を拭きながら、私は次の場所へと向かう。'}
]
},
{
        label:'曇り役の合図を決める\n（協力する）',
        delta:{ evid:+1 },
        after:[
          {speaker:'私', text:'三度叩いたら交代。\n\n三度叩いたら交代。'},
{speaker:'私', text:'合図を、頭に刻む。\n合図を、頭に刻む。'},
{speaker:'静茶', text:'了解です。\n了解です。'},
{speaker:'', text:'合図を決めながら、私は次の場所へと向かう。\n合図を決めながら、私は次の場所へと向かう。'}
]
},
{
        label:'冗談は断り距離を取る\n（控えめに）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'私', text:'私はそういうのは得意ではありません。\n\n私はそういうのは得意ではありません。'},
{speaker:'私', text:'距離を、保つ。\n距離を、保つ。'},
{speaker:'静茶', text:'……では現実的に。\n……では現実的に。'},
{speaker:'', text:'距離を取りながら、私は次の場所へと向かう。\n距離を取りながら、私は次の場所へと向かう。'}
]
}
]
},

// 豆知識1：台所（昆布と夜の濃さ）
{
bg: BG.kitchen, // 注釈：夕食の下ごしらえ
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',     text:'夕食の下ごしらえ。\nかまどの火が、静かに燃えている。'},
{speaker:'私', text:'この昆布、やけに黒いですね。\nこの昆布、やけに黒いですね。'},
{speaker:'静茶', text:'夜が濃いと、昆布も黒くなるんです。\n夜が濃いと、昆布も黒くなるんです。'},
{speaker:'',     text:'出汁を取る昆布。\n通常は茶色いが、これは黒い。'},
{speaker:'私', text:'夜が……濃い？\n夜が……濃い？'},
{speaker:'静茶', text:'夜食を探す"客"が多い時は特に。\n夜食を探す"客"が多い時は特に。'},
{speaker:'私', text:'……客？\n……客？'},
{speaker:'',     text:'流しの横、白磁の匙が置かれている。\n向きが、さっきと違う気がする。'},
{speaker:'',     text:'かまどの火が、微かに揺れる。\n誰かが、さっきまで火を見ていた。'}
],
choices:[
{
        label:'料理を続ける\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'静茶', text:'味は濃いほど持ちます。\n\n味は濃いほど持ちます。'},
{speaker:'私', text:'夜も、ですか。\n夜も、ですか。'},
{speaker:'私', text:'料理を、続ける。\n料理を、続ける。'},
{speaker:'', text:'料理を続けながら、私は次の場所へと向かう。\n料理を続けながら、私は次の場所へと向かう。'}
]
},
{
        label:'火を弱めて様子を見る\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'……外の足音が増えました。\n\n……外の足音が増えました。'},
{speaker:'私', text:'足音の数を、記録しておく。\n足音の数を、記録しておく。'},
{speaker:'静茶', text:'匂いは呼びますから。\n匂いは呼びますから。'},
{speaker:'', text:'様子を見ながら、私は次の場所へと向かう。\n様子を見ながら、私は次の場所へと向かう。'}
]
},
{
        label:'調理を中止して戸を閉める\n（安全を選ぶ）',
        delta:{ trust:+1, shadow:-1 },
        after:[
          {speaker:'私', text:'戸は押さえておきます。\n\n戸は押さえておきます。'},
{speaker:'私', text:'調理を、中止する。\n調理を、中止する。'},
{speaker:'静茶', text:'冷めると味は落ちますけど。\n冷めると味は落ちますけど。'},
{speaker:'', text:'戸を閉めながら、私は次の場所へと向かう。\n戸を閉めながら、私は次の場所へと向かう。'}
]
}
]
},

// 豆知識2：庭（山田）
{
bg: BG.dining, // 注釈：植木の手入れ（庭BGは流用）
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'私', text:'この鉢、\n“山田”って札が……苗の名前ですか？'},
{speaker:'静茶', text:'人の名前です。\n元・家政夫の。'},
{speaker:'私', text:'どうしてここに？\nどうしてここに？'},
{speaker:'静茶', text:'植木と一緒に、土に混ざってますから。\n植木と一緒に、土に混ざってますから。'}
],
choices:[
{
        label:'札を外して拭う\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'静茶', text:'山田さん、怒りますよ。\n\n山田さん、怒りますよ。'},
{speaker:'私', text:'……風が止みました。\n……風が止みました。'},
{speaker:'私', text:'札を外すことで、何かが変わる。\n札を外すことで、何かが変わる。'},
{speaker:'', text:'札を外しながら、私は次の場所へと向かう。\n札を外しながら、私は次の場所へと向かう。'}
]
},
{
        label:'そのままにして水をやる\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'静茶', text:'植物は喜びますから。\n\n植物は喜びますから。'},
{speaker:'私', text:'……喜んでいるのは植物だけですね。\n……喜んでいるのは植物だけですね。'},
{speaker:'私', text:'水を、やる。\n水を、やる。'},
{speaker:'', text:'水をやりながら、私は次の場所へと向かう。\n水をやりながら、私は次の場所へと向かう。'}
]
},
{
        label:'土を少し掘って確かめる\n（危険な選択）',
        delta:{ evid:+1, shadow:+2 },
        after:[
          {speaker:'私', text:'白い欠片。\n\n……骨？'},
{speaker:'私', text:'土の中、何かが埋まっている。\n土の中、何かが埋まっている。'},
{speaker:'静茶', text:'見たなら、戻してください。\n見なかった数に。'},
{speaker:'', text:'（何かが、\n近づいてきた）'}
]
}
]
},

// 豆知識3：居間（家政婦の歴史）
{
bg: BG.living, // 注釈：古い写真帳をめくる
bgm:'WALTZ_SOFT', // 優雅な雰囲気
lines:[
{speaker:'',     text:'応接の間。\n古い写真帳が開かれている。'},
{speaker:'私', text:'この写真、\n昔の家政婦さん？'},
{speaker:'当主', text:'百年前から顔は変わらない。\n百年前から顔は変わらない。'},
{speaker:'',     text:'大正、明治、江戸……どの時代の写真も、同じ顔。\n大正、明治、江戸……どの時代の写真も、同じ顔。'},
{speaker:'私', text:'……同じ人？\n……同じ人？'},
{speaker:'当主', text:'名前を消せば、前任の仕事を引き継ぐ。\n名前を消せば、前任の仕事を引き継ぐ。'},
{speaker:'',     text:'応接のテーブルに、白磁の匙が置かれている。\n写真の中の家政婦も、同じ匙を持っている。'},
{speaker:'',     text:'名簿には、前任者の名が二重線で消されている。\n私の名も、そこに書かれている。'}
],
choices:[
{
        label:'名簿を開く\n（調査する）',
        delta:{ evid:+1, trust:-1 },
        after:[
          {speaker:'私', text:'私の名前も……ありますね。\n\n私の名前も……ありますね。'},
{speaker:'私', text:'名簿の内容を、頭に刻む。\n名簿の内容を、頭に刻む。'},
{speaker:'当主', text:'消されなければ、長く務まる。\n消されなければ、長く務まる。'},
{speaker:'', text:'名簿を読みながら、私は次の場所へと向かう。\n名簿を読みながら、私は次の場所へと向かう。'}
]
},
{
        label:'写真帳を閉じる\n（安全を選ぶ）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'知ってしまうと、重そうですから。\n\n知ってしまうと、重そうですから。'},
{speaker:'私', text:'写真帳を、閉じる。\n写真帳を、閉じる。'},
{speaker:'当主', text:'賢明だ。\n賢明だ。'},
{speaker:'', text:'写真帳を閉じながら、私は次の場所へと向かう。\n写真帳を閉じながら、私は次の場所へと向かう。'}
]
},
{
        label:'前任者の欄を探す\n（証拠を残す）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'前任の印が二重線……消し損ね。\n\n前任の印が二重線……消し損ね。'},
{speaker:'私', text:'消し損ねた跡を、記録しておく。\n消し損ねた跡を、記録しておく。'},
{speaker:'当主', text:'線は消えても、跡は残る。\n線は消えても、跡は残る。'},
{speaker:'', text:'記録を頭に刻みながら、私は次の場所へと向かう。\n記録を頭に刻みながら、私は次の場所へと向かう。'}
]
}
]
},

// 朝の支度：灯りの管理
{
bg: BG.hallway,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',     text:'早朝。\nまだ暗い廊下を、行灯を手に歩く。'},
{speaker:'静茶', text:'朝は、灯りを消す順番が決まっています。\n朝は、灯りを消す順番が決まっています。'},
{speaker:'私',   text:'順番？\n順番？'},
{speaker:'静茶', text:'奥から手前へ。\n消す順番を間違えると、影が増えます。'},
{speaker:'',     text:'行灯の灯りが、廊下の影を揺らす。\n一つ、二つ……数が合わない。'}
],
choices:[
{
        label:'静茶に従って順番通りに消す\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'奥から手前へ。\n\n奥から手前へ。'},
{speaker:'私', text:'順番通りに、灯りを消す。\n順番通りに、灯りを消す。'},
{speaker:'静茶', text:'正解です。\n正解です。'},
{speaker:'', text:'灯りを消しながら、私は次の作業へと向かう。\n灯りを消しながら、私は次の作業へと向かう。'}
]
},
{
        label:'手前から消してみる\n（試してみる）',
        delta:{ shadow:+1 },
        after:[
          {speaker:'', text:'影が一つ、増えた。\n\n影が一つ、増えた。'},
{speaker:'私', text:'手前から消すと、影が増える。\n手前から消すと、影が増える。'},
{speaker:'静茶', text:'……次からは、順番を守ってください。\n……次からは、順番を守ってください。'},
{speaker:'', text:'影を感じながら、私は次の場所へと向かう。\n影を感じながら、私は次の場所へと向かう。'}
]
},
{
        label:'消す順番を記録する\n（証拠を残す）',
        delta:{ evid:+1 },
        after:[
          {speaker:'私', text:'順番を控えます。\n\n順番を控えます。'},
{speaker:'私', text:'消す順番を、頭に刻む。\n消す順番を、頭に刻む。'},
{speaker:'静茶', text:'記録は、見られないように。\n記録は、見られないように。'},
{speaker:'', text:'記録を頭に刻みながら、私は次の作業へと向かう。\n記録を頭に刻みながら、私は次の作業へと向かう。'}
]
}
]
},

// 土蔵：古い道具
{
bg: BG.storage,
bgm:'EXPLORE', // 探索・調査
lines:[
{speaker:'',     text:'土蔵の中。\n古い道具が並んでいる。'},
{speaker:'静茶', text:'ここは、使わなくなった物を置く場所です。\nここは、使わなくなった物を置く場所です。'},
{speaker:'私',   text:'たくさんの道具が……。\nたくさんの道具が……。'},
{speaker:'静茶', text:'前任者たちの物も、混ざっています。\n前任者たちの物も、混ざっています。'},
{speaker:'',     text:'棚の奥、白磁の匙が並んでいる。\n向きは、すべて同じ。'},
{speaker:'',     text:'しかし、一つだけ、向きが違う。\nしかし、一つだけ、向きが違う。'}
],
choices:[
{
        label:'向きを揃える\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'向きを揃えました。\n\n向きを揃えました。'},
{speaker:'私', text:'匙を、整然と並べる。\n匙を、整然と並べる。'},
{speaker:'静茶', text:'……次からは、触らないでください。\n……次からは、触らないでください。'},
{speaker:'', text:'道具を整理しながら、私は次の場所へと向かう。\n道具を整理しながら、私は次の場所へと向かう。'}
]
},
{
        label:'向きが違う匙を確認する\n（調査する）',
        delta:{ evid:+1, shadow:+1 },
        after:[
          {speaker:'私', text:'この匙、新しい傷があります。\n\nこの匙、新しい傷があります。'},
{speaker:'私', text:'傷の形を、記録しておく。\n傷の形を、記録しておく。'},
{speaker:'静茶', text:'最近、動いたんです。\n最近、動いたんです。'},
{speaker:'', text:'匙を確認しながら、私は次の場所へと向かう。\n匙を確認しながら、私は次の場所へと向かう。'}
]
},
{
        label:'そのままにして離れる\n（無視する）',
        delta:{},
        after:[
          {speaker:'', text:'土蔵を出る時、後ろで音がした。\n\n土蔵を出る時、後ろで音がした。'},
{speaker:'私', text:'（音が、\n後ろから聞こえた）'},
{speaker:'', text:'振り返ると、匙の向きが変わっていた。\n振り返ると、匙の向きが変わっていた。'}
]
}
]
},

// 夕食の準備：数の確認
{
bg: BG.kitchen,
bgm:'WALTZ_SOFT', // 優雅な雰囲気
lines:[
{speaker:'',     text:'夕食の準備。\n膳を並べる。'},
{speaker:'静茶', text:'箸は、人数分だけ。\n箸は、人数分だけ。'},
{speaker:'私',   text:'五膳分、ですね。\n五膳分、ですね。'},
{speaker:'静茶', text:'……数えてください。\n……数えてください。'},
{speaker:'',     text:'一、\n二、三、四、五……六？'},
{speaker:'',     text:'箸が、一膳多い。\n箸が、一膳多い。'}
],
choices:[
{
        label:'余分な箸を下げる\n（信頼を得る）',
        delta:{ trust:+1 },
        after:[
          {speaker:'私', text:'五膳分にしました。\n\n五膳分にしました。'},
{speaker:'私', text:'余分な一膳を、取り除く。\n余分な一膳を、取り除く。'},
{speaker:'静茶', text:'正解です。\n正解です。'},
{speaker:'', text:'箸を揃えながら、私は次の作業へと向かう。\n箸を揃えながら、私は次の作業へと向かう。'}
]
},
{
        label:'そのままにしておく\n（受け入れる）',
        delta:{ shadow:+1 },
        after:[
          {speaker:'', text:'箸が、静かに動いた。\n\n箸が、静かに動いた。'},
{speaker:'私', text:'（余分な一膳が、\n動いている）'},
{speaker:'静茶', text:'……次からは、数を確認してください。\n……次からは、数を確認してください。'},
{speaker:'', text:'箸を見ながら、私は次の場所へと向かう。\n箸を見ながら、私は次の場所へと向かう。'}
]
},
{
        label:'箸の数を記録する\n（証拠を残す）',
        delta:{ evid:+1 },
        after:[
          {speaker:'私', text:'数を控えます。\n箸の数を、頭に刻む。'},
          {speaker:'私', text:'箸の数を、頭に刻む。\nその数を、記憶に焼き付ける。'},
          {speaker:'静茶', text:'記録は、見られないように。\nその言葉に、警告が含まれている。'},
          {speaker:'', text:'記録を頭に刻みながら、私は次の作業へと向かう。\nその記録が、いつか役に立つかもしれない。'}
        ]
      }
    ]
  }

// ===== 追加ここまで =====
];
