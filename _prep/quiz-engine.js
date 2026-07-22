/**
 * quiz-engine.js — 時事ミミック用クイズ抽選エンジン（ゲーム本体から分離）
 *
 * 使い方（後で main.js から接続）:
 *   <script src="./quiz-engine.js"></script>
 *   const q = await QuizEngine.loadAndPick({ difficulty: 2 });
 *   const cmds = QuizEngine.shuffleChoices(q);
 *
 * 既存の小学向け quizData.js とは別系統。
 */
const QuizEngine = (() => {
  const LABELS = ["A", "B", "C", "D"];
  let pack = null;
  const usedIds = [];
  let lastNewsGroup = null;
  let lastCategory = null;

  async function load(url = "./quiz-data.json") {
    const res = await fetch(url);
    if (!res.ok) throw new Error("quiz-data.json を読めませんでした");
    pack = await res.json();
    return pack;
  }

  function setPack(data) {
    pack = data;
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function isActive(q, today = todayISO()) {
    if (!q || q.status !== "active") return false;
    if (q.expiresAt && q.expiresAt < today) return false;
    if (!Array.isArray(q.choices) || q.choices.length !== 4) return false;
    if (!q.choices.includes(q.correctAnswer)) return false;
    return true;
  }

  function activeQuestions() {
    if (!pack || !Array.isArray(pack.questions)) return [];
    return pack.questions.filter((q) => isActive(q));
  }

  /** Fisher–Yates */
  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /**
   * choicesをシャッフルし、ABCD付きコマンド配列を返す。
   * correctIndex固定はしない。正解判定は correctAnswer 文字列比較。
   */
  function shuffleChoices(question) {
    const shuffled = shuffleInPlace([...question.choices]);
    return shuffled.map((text, index) => ({
      label: LABELS[index],
      text,
      isCorrect: text === question.correctAnswer
    }));
  }

  function pickRandom(list) {
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * difficulty別抽選:
   * 1) difficulty一致
   * 2) 使用済み除外（枯渇したらリセット）
   * 3) 直前newsGroup除外（可能なら）
   * 4) 直前category除外（可能なら）
   */
  function pickQuestion({ difficulty, mimicType } = {}) {
    let pool = activeQuestions();

    if (mimicType) {
      pool = pool.filter((q) => q.mimicType === mimicType);
    } else if (difficulty != null) {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }

    if (!pool.length) return null;

    let candidates = pool.filter((q) => !usedIds.includes(q.id));
    if (!candidates.length) {
      usedIds.length = 0;
      candidates = pool.slice();
    }

    let narrowed = candidates.filter((q) => q.newsGroup !== lastNewsGroup);
    if (!narrowed.length) narrowed = candidates;

    let byCat = narrowed.filter((q) => q.category !== lastCategory);
    if (!byCat.length) byCat = narrowed;

    const chosen = pickRandom(byCat);
    if (!chosen) return null;

    usedIds.push(chosen.id);
    lastNewsGroup = chosen.newsGroup || null;
    lastCategory = chosen.category || null;
    return chosen;
  }

  async function loadAndPick(opts) {
    if (!pack) await load();
    return pickQuestion(opts);
  }

  function stats() {
    const all = activeQuestions();
    const byDiff = { 1: 0, 2: 0, 3: 0, 4: 0 };
    all.forEach((q) => {
      if (byDiff[q.difficulty] != null) byDiff[q.difficulty]++;
    });
    return {
      version: pack && pack.quizVersion,
      activeTotal: all.length,
      byDifficulty: byDiff,
      usedCount: usedIds.length
    };
  }

  function resetHistory() {
    usedIds.length = 0;
    lastNewsGroup = null;
    lastCategory = null;
  }

  return {
    load,
    setPack,
    pickQuestion,
    loadAndPick,
    shuffleChoices,
    isActive,
    activeQuestions,
    stats,
    resetHistory
  };
})();

// Node / ブラウザ両用の軽い自己チェック（手動実行用）
if (typeof window === "undefined" && typeof module !== "undefined") {
  module.exports = QuizEngine;
}
