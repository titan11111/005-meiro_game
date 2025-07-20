// グローバル変数
let historyData = [];
let isGenerating = false; // 重複実行防止用

// メッセージデータベース（JSON形式）
const messageDatabase = {
    neuroscientist: {
        negative: [
            "脳は変化できる。小さな一歩から始めよう",
            "感情は脳の状態。時間が経てば改善する",
            "深呼吸で前頭葉をリセットしよう",
            "ストレスは適度なら成長の糧になる",
            "睡眠が脳の最高の回復薬になる",
            "運動でセロトニンを増やそう",
            "今の感情は一時的な脳の状態だよ",
            "集中できる小さなことから始めよう",
            "ネガティブ思考も脳のクセ。変えられる",
            "マインドフルネスで脳を整えよう",
            "扁桃体が過活動してるね。落ち着こう",
            "神経可塑性を信じて。脳は必ず変わる",
            "ドーパミン不足かも。好きなことをしよう",
            "前頭前野を鍛える時間にしよう",
            "セロトニンレベルを上げる活動を",
            "脳内物質のバランスを整える時だ",
            "ミラーニューロンを活用して笑顔から",
            "海馬の記憶を書き換える良いチャンス",
            "副交感神経を優位にする時間を作ろう",
            "脳科学的に見れば一時的な状態だ",
            "脳疲労には休息が一番の薬だよ",
            "瞑想で脳波を落ち着かせよう",
            "身体の動きが脳を活性化させる",
            "感情を記録して脳のパターンを理解しよう",
            "嫌な記憶も、脳の中で編集できる",
            "脳の休息は、新たなアイデアを生む",
            "前向きな言葉が脳の回路を強化する",
            "軽い運動で脳の血流を良くしよう",
            "感情のラベリングで脳を整理する",
            "脳のエネルギー源はブドウ糖。しっかり摂ろう",
            "自分の感情を俯瞰するメタ認知を鍛えよう",
            "ポジティブなイメージで脳を騙そう",
            "集中力を高める呼吸法を試してみて",
            "脳は新しい情報で更新される",
            "ストレスホルモンを減らす工夫をしよう",
            "脳の疲れは、身体の疲れから来ることが多い",
            "感情の波を受け入れ、脳の回復を待とう",
            "感謝の気持ちが脳の幸福中枢を刺激する",
            "自然の音や光が脳に良い影響を与える",
            "脳のリズムを整える規則正しい生活を"
        ],
        positive: [
            "良い感情がドーパミンを分泌中",
            "ポジティブ思考が脳回路を強化する",
            "幸せホルモンが活発に分泌されてる",
            "この調子で前頭葉を鍛えていこう",
            "良い状態をキープする習慣を作ろう",
            "脳が喜ぶ活動を続けよう",
            "充実感がニューロンの結合を強化",
            "前向きな神経回路が形成されてる",
            "オキシトシンレベルが上昇中",
            "この感情を記憶に定着させよう",
            "エンドルフィンが最高レベルだね",
            "左脳と右脳のバランスが理想的",
            "神経伝達物質が最適に働いてる",
            "脳の報酬系が活性化してる状態",
            "前頭前野の活動が素晴らしい",
            "創造性をつかさどる領域が活発だ",
            "記憶の定着にベストなタイミング",
            "脳内ネットワークが最高の状態",
            "この快感を脳に刻み込もう",
            "ポジティブな神経パターンを強化中",
            "喜びは脳の最高の栄養剤だよ",
            "達成感が新たな神経結合を促す",
            "脳のパフォーマンスが上がってるね",
            "幸福感は脳の健康のバロメーター",
            "このポジティブなサイクルを維持しよう",
            "脳は喜びを記憶して再現しようとする",
            "集中力が高まり、脳が冴えている",
            "自己肯定感が脳に良い影響を与えている",
            "新たな学びが脳を活性化させている",
            "脳がリラックスして最高の状態だ",
            "この良い感情を五感で感じて脳に深く刻もう",
            "挑戦する意欲が脳を若返らせる",
            "創造性が高まり、新しい発想が生まれやすい状態",
            "脳の疲労回復も早く、集中力が持続する",
            "良い経験が自己効力感を高め、脳に自信を与える",
            "肯定的なセルフトークで脳のポジティブ回路を強化",
            "周囲との良好な関係が脳に幸福感をもたらす",
            "脳の学習機能が向上し、吸収力が高まる",
            "感謝の心が脳のストレスを軽減している",
            "この良い脳の状態を、意識して育てていこう"
        ],
        neutral: [
            "感情を客観視することが第一歩",
            "脳は今この瞬間から変われる",
            "自分の思考パターンを観察しよう",
            "理性と感情のバランスを保とう",
            "脳の可塑性を信じて前進しよう",
            "今日の経験が脳を成長させる",
            "冷静な判断力を大切にしよう",
            "脳科学的に見れば必ず改善可能",
            "メタ認知能力を活用しよう",
            "神経の柔軟性が君の武器だ",
            "前頭葉の司令塔機能を活かそう",
            "情報処理速度を最適化する時",
            "脳のデフォルトモードに気づこう",
            "ワーキングメモリーを効果的に使おう",
            "注意力のコントロールが鍵だ",
            "認知バイアスを意識して修正",
            "脳の学習モードをオンにしよう",
            "神経回路の再編成チャンス",
            "今の状態も脳の貴重なデータ",
            "意識的な脳の使い方を身につけよう",
            "脳は常に新しい情報を求めている",
            "感情は脳のシグナル、何かに気づこう",
            "思考の癖を知ることで、脳をより良く使える",
            "脳を休ませる時間もパフォーマンスに繋がる",
            "集中と拡散のバランスが脳には重要",
            "自分の脳のタイプを知ると対処法が見つかる",
            "脳は好奇心で進化する",
            "未知への挑戦が脳を活性化させる",
            "脳の健康には、多様な刺激が必要",
            "一日の終わりに脳をリセットする習慣を",
            "脳の疲れを感じたら、無理せず休むサイン",
            "新しい趣味や学びが脳に良い刺激を与える",
            "脳はアウトプットすることで定着する",
            "小さな達成感が脳のモチベーションを保つ",
            "脳のストレス耐性を高める方法を探そう",
            "適度な負荷が脳の成長を促す",
            "感情と論理のバランスで最適な判断を",
            "脳のポテンシャルを最大限に引き出そう",
            "自分の脳に感謝し、大切に扱おう",
            "脳はあなたが思っている以上に賢い存在だよ"
        ]
    },
    counselor: {
        negative: [
            "その気持ち、よく分かります",
            "一人じゃないから大丈夫ですよ",
            "ゆっくり休むことも大切です",
            "無理しなくていいのです",
            "あなたは十分頑張っています",
            "今の感情を否定しないでください",
            "そのままのあなたで素敵です",
            "辛い時は立ち止まっていいんです",
            "感情に寄り添ってあげてください",
            "自分に優しくしてあげてくださいね",
            "完璧でなくても大丈夫です",
            "弱さも人間らしさの一部です",
            "今できることから始めましょう",
            "小さな進歩も大きな成長です",
            "自分のペースで歩んでいきましょう",
            "心の声に耳を傾けてあげて",
            "涙も大切な感情の表現です",
            "困った時は助けを求めていいんです",
            "あなたの価値は変わりません",
            "明日はきっと違う風が吹きます",
            "抱え込まずに、話してみるのも良いですよ",
            "心の荷物を少し下ろしてみませんか",
            "自分を責める必要はありません",
            "誰もが完璧ではないのですから",
            "心が疲れている時は、心に栄養をあげましょう",
            "どんな感情もあなたの一部です",
            "焦らず、一つずつ整理していきましょう",
            "あなたの頑張りは、私が一番よく知っています",
            "小さな成功体験を積み重ねてみましょう",
            "心の回復には時間が必要です",
            "今は休息の時かもしれませんね",
            "自分の感情に正直になってみてください",
            "感情はただのサイン。悪いものではありません",
            "あなたは乗り越える力を持っています",
            "自分を大切にする時間を作ってください",
            "否定的な感情も、成長のきっかけになります",
            "心の傷は必ず癒えます",
            "困難な状況でも、希望は必ずあります",
            "あなたの気持ちを尊重します",
            "どんな時も、あなたは一人ではありません"
        ],
        positive: [
            "素晴らしい気持ちですね",
            "その調子で大丈夫ですよ",
            "前向きな気持ちが素敵です",
            "今のあなたは輝いています",
            "ポジティブなエネルギーを感じます",
            "充実している様子が伝わります",
            "とても良いペースですね",
            "あなたらしさが光っています",
            "この喜びを大切にしてください",
            "幸せを感じる心が美しいです",
            "自然体のあなたが一番素敵",
            "内側から溢れる輝きが見えます",
            "この瞬間を心に刻んでください",
            "あなたの笑顔が周りを明るくします",
            "感謝の気持ちが心を豊かにしますね",
            "今の調子で自分を信じて",
            "ポジティブな変化を感じます",
            "あなたの成長を実感しています",
            "この幸せを周りにも分けてあげて",
            "心の平和が表情に現れています",
            "あなたのポジティブな姿勢に感動します",
            "そのエネルギーが周囲にも良い影響を与えています",
            "達成感が自信に繋がっているのが分かります",
            "この喜びを共有できて嬉しいです",
            "あなたの幸福感が伝わってきます",
            "素晴らしい気持ちを長く味わってくださいね",
            "自己肯定感が高まっているのが感じられます",
            "あなたの存在が、周囲を明るくしています",
            "この良い流れを大切にしてください",
            "どんな小さな喜びも、見逃さない心が素晴らしい",
            "あなたの笑顔は周りを癒します",
            "この前向きな気持ちを、次のステップに活かしましょう",
            "困難を乗り越えたからこその喜びですね",
            "心からの笑顔は最高のギフトです",
            "あなたの心が満たされているのが分かります",
            "この達成感は、あなたの努力の証です",
            "良い気分を心ゆくまで楽しんでください",
            "あなたの心の豊かさに触れられました",
            "この感謝の気持ちを忘れずに進みましょう",
            "あなたの幸福が、私の喜びでもあります"
        ],
        neutral: [
            "今の気持ちを大切にしてください",
            "あなたのペースで大丈夫です",
            "どんな感情も意味があります",
            "自分の心に優しくしましょう",
            "どんな気持ちも受け入れてください",
            "あなたの感情はとても大切です",
            "今を感じることが重要ですね",
            "心の声に耳を傾けてください",
            "自分との対話を大切に",
            "内なる声を聞いてあげてください",
            "感情の波は自然なものです",
            "今この瞬間の自分を認めて",
            "心の中を整理する時間ですね",
            "自分らしい答えを見つけましょう",
            "内側の平和を育てていきましょう",
            "心の天気は変わりゆくもの",
            "自分軸をしっかり持って",
            "今の体験も貴重な学びです",
            "心の成長は段階的なものです",
            "あなたなりの歩み方で進んで",
            "どんな感情もあなたの大切な一部です",
            "自分の気持ちをじっくりと見つめてみましょう",
            "心のバランスを整える時間を作ってください",
            "あなたの心の変化に寄り添います",
            "焦らず、自分の心の声に耳を傾ける練習を",
            "自分の感情に気づくことは、大きな一歩です",
            "心の奥底にある声に、そっと耳を傾けてみませんか",
            "感情はあなたに何かを伝えようとしています",
            "落ち着いて、自分の内側と向き合ってみましょう",
            "どんな状態も、あなたの個性です",
            "あなたの心の健康が何よりも大切です",
            "感情の起伏を受け入れ、自分を許してあげて",
            "心の成長には、様々な経験が必要です",
            "自分自身の感情の動きに気づくことが大切です",
            "どんな時も、あなたの心はあなたの味方です",
            "感情に良いも悪いもありません。ただ、そこにあるだけです",
            "あなたのペースで、心の平穏を見つけていきましょう",
            "自分の心に正直に、ありのままを受け入れて",
            "感情のレッスンは、人生を豊かにします",
            "あなたの心が求めるものを、見つけに行きましょう"
        ]
    },
    elder: {
        negative: [
            "嵐の後には必ず晴れがくるものよ",
            "今の痛みが明日の強さになる",
            "逆境こそ人を成長させるのよ",
            "人生山あり谷あり、それが当然",
            "苦労は買ってでもするものよ",
            "辛さも人生の大切な調味料",
            "困難は神様からの試練と贈り物",
            "今を乗り越えれば必ず報われる",
            "涙の数だけ人は優しくなれる",
            "冬があるから春の温かさが分かる",
            "若い時の苦労は宝物よ",
            "人生に無駄な経験なんてないの",
            "今の試練があなたを磨いてる",
            "どんな夜も必ず朝が来る",
            "雨降って地固まるって言うでしょ",
            "人は失敗から多くを学ぶもの",
            "今の我慢が未来の花を咲かせる",
            "辛抱する木に金がなるのよ",
            "人生の谷間も大切な時間",
            "今踏ん張れば後で笑って話せる",
            "壁にぶつかるのは、成長の証だよ",
            "諦めない心が一番の財産さ",
            "人生、塞翁が馬って言うだろ？",
            "どんなに暗いトンネルにも出口はある",
            "悩んだ分だけ、人は深くなるものさ",
            "焦らず、一歩ずつ進めばいい",
            "辛い経験は、後で人に優しくできる力になる",
            "人生は螺旋階段。同じ場所に戻っても、必ず上へ向かってる",
            "大丈夫、いつかこの経験が笑い話になるから",
            "挫折は、次に進むための大切なバネになる",
            "悲しい時は、無理に笑わなくていいんだよ",
            "人生の道は、一本道じゃない。寄り道も大切さ",
            "大変な時こそ、周りを見渡してみな",
            "心の整理整頓も、大切な仕事だよ",
            "失敗を恐れるな。そこから学ぶことがたくさんある",
            "君の頑張りは、誰かが見てくれているよ",
            "人生に無駄なことなんて一つもないんだ",
            "辛い時は、無理せず立ち止まる勇気も必要さ",
            "どんなに小さな光でも、見つけようとするんだ",
            "経験が君を強くする。だから大丈夫だよ"
        ],
        positive: [
            "良い時こそ感謝を忘れずにね",
            "幸せは足元にあるものよ",
            "このままの調子で歩みなさい",
            "充実した時間を大切にして",
            "今の気持ちを心に刻んでおいて",
            "素直な心が一番美しいのよ",
            "人生の良い季節を楽しんで",
            "幸せを周りの人にも分けてね",
            "笑顔は最高の化粧品よ",
            "この喜びを長く味わってね",
            "人生の花が咲いてる時期ね",
            "今のあなたが一番輝いてる",
            "良い時は写真を撮るように記憶して",
            "幸せの種をまき続けなさい",
            "今の調子で人生を謳歌して",
            "心の豊かさが表情に出てるわ",
            "この瞬間を大切に生きなさい",
            "人生の良い風が吹いてるのね",
            "幸せな時間を積み重ねていって",
            "今のあなたを誇りに思うわ",
            "喜びを分かち合うと、もっと大きくなるんだよ",
            "その輝きを忘れないで、大切にしなさい",
            "君の幸せが、周りにも伝わっているね",
            "良い運気は、良い心の持ちようから来るんだ",
            "毎日を楽しみ、感謝して過ごしなさい",
            "この幸福感は、君の努力の賜物だ",
            "満たされた心は、素晴らしいものを作り出す",
            "幸せな思い出は、いくつあってもいいものさ",
            "君の笑顔が、みんなの太陽だよ",
            "人生は、楽しんだもの勝ちだよ",
            "幸せは探すものじゃなくて、気づくものさ",
            "この良い流れに乗って、さらに前へ進みなさい",
            "君のポジティブなエネルギーが、幸運を呼ぶんだ",
            "感謝の心があると、もっと幸せを感じられる",
            "良い縁は、良い気持ちで引き寄せられるんだよ",
            "満ち足りた心は、周りにも優しさを広げる",
            "人生を味わい尽くしなさい",
            "君の喜びが、世界を少しだけ明るくするんだ",
            "幸せな時は、未来の自分への貯金だと思ってごらん",
            "この素晴らしい瞬間を、心ゆくまで堪能しなさい"
        ],
        neutral: [
            "人生は一度きり、楽しまなきゃ損",
            "自分らしく生きることが一番",
            "焦らずゆっくり歩けばいいのよ",
            "今この瞬間が何より宝物",
            "人と比べる必要なんてない",
            "自分の道を信じて進みなさい",
            "経験の一つ一つが人を豊かにする",
            "毎日が新しい発見の連続よ",
            "年を重ねるごとに見えてくるもの",
            "人生の答えは歩きながら見つかる",
            "急がば回れって昔から言うでしょ",
            "人生は長いマラソンのようなもの",
            "今日という日は二度と来ないの",
            "人生の味わいは時間が教えてくれる",
            "自分のペースで歩むのが一番よ",
            "人生の四季を楽しみなさい",
            "今の時間も将来の思い出になる",
            "人生は学びの連続よ",
            "どんな日も意味のある一日",
            "人生の旅路を大切に歩んで",
            "人生に近道はない。遠回りもまた面白い",
            "答えは急に見つかるもんじゃないさ",
            "人生は、常に変化していくものだ",
            "自分の直感を信じてごらん",
            "どんな選択も、君の人生を彩る経験になる",
            "立ち止まって考える時間も大切だよ",
            "人生は予期せぬ出来事の連続さ",
            "どんな時も、自分を信じることだよ",
            "物事は、見方一つで変わるものさ",
            "人生に完璧な道なんてないんだ",
            "今日できることを精一杯やればいい",
            "流れに身を任せる勇気も必要だよ",
            "どんな経験も、君の肥やしになる",
            "一息入れて、周りを見渡してみるのも良いよ",
            "人生は壮大な物語。君が主人公さ",
            "自分の心に正直に生きなさい",
            "人生は、自分だけの道を作り続けること",
            "どんな日も、何か新しい発見があるはず",
            "経験こそが、最高の先生だよ",
            "人生を味わい尽くしなさい"
        ]
    }
};

// 感情キーワードのカテゴリ
const emotionKeywords = {
    negative: ['不安', '心配', '悲しい', '辛い', '疲れ', 'ストレス', '落ち込', 'だるい', '眠れない', '憂鬱', 'イライラ', '怒り', '焦り', '孤独', '寂しい', '重い', '暗い', '無気力', '絶望', '混乱'],
    positive: ['嬉しい', '楽しい', '幸せ', '元気', '良い', 'スッキリ', '満足', '充実', '爽快', '安心', '感謝', '希望', '喜び', '最高', '素晴らしい', '輝く', '明るい', '活発', '前向き', '清々しい']
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    updateHistoryCounter();
    setupEventListeners();
    showInitialMessages(); // 初期メッセージ表示を有効化
});

// イベントリスナーの設定
function setupEventListeners() {
    // エンターキーでの送信対応
    const moodInput = document.getElementById('moodInput');
    moodInput.addEventListener('keydown', function(event) {
        // Ctrl+EnterまたはCmd+Enterで送信
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            generateSelfTalk();
        }
    });
    
    // モーダルの外側クリックで閉じる
    const modal = document.getElementById('pdfModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closePdfModal();
            }
        });
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePdfModal();
        }
    });
}

// 初期メッセージを表示
function showInitialMessages() {
    const neuroSpeech = document.getElementById('neuroSpeech');
    const counselorSpeech = document.getElementById('counselorSpeech');
    const elderSpeech = document.getElementById('elderSpeech');
    const initialMessage = document.getElementById('initialMessage'); // 追加
    const charactersArea = document.getElementById('charactersArea'); // 追加

    // ページロード時は初期メッセージのみ表示
    if (initialMessage) initialMessage.style.display = 'block';
    if (charactersArea) charactersArea.style.display = 'none';

    if (neuroSpeech) neuroSpeech.innerHTML = '<p>気分を入力してね<br>脳科学の視点でアドバイスするよ</p>';
    if (counselorSpeech) counselorSpeech.innerHTML = '<p>どんな気持ちも大切<br>一緒に考えてみましょう</p>';
    if (elderSpeech) elderSpeech.innerHTML = '<p>人生経験からお話しするね<br>何でも聞いてちょうだい</p>';
}

// セルフトーク生成メイン関数
function generateSelfTalk() {
    if (isGenerating) return; // 重複実行防止
    
    const moodInput = document.getElementById('moodInput');
    const submitBtn = document.getElementById('submitBtn');
    const mood = moodInput.value.trim();
    
    if (!mood) {
        showAlert('気分を入力してください');
        moodInput.focus();
        return;
    }
    
    // ローディング状態に変更
    isGenerating = true;
    submitBtn.textContent = '生成中...'; // ローディング表示に修正
    submitBtn.disabled = true;
    
    // 初期メッセージを隠す
    const initialMessage = document.getElementById('initialMessage');
    if (initialMessage) initialMessage.style.display = 'none';
    
    // キャラクターエリアを表示
    const charactersArea = document.getElementById('charactersArea');
    if (charactersArea) charactersArea.style.display = 'flex'; // flexに変更
    
    // 少し遅延を加えて生成感を演出
    setTimeout(() => {
        try {
            // 各キャラクターのセルフトークを生成
            const neuroMessage = generateMessage('neuroscientist', mood);
            const counselorMessage = generateMessage('counselor', mood);
            const elderMessage = generateMessage('elder', mood);
            
            // 画面に表示
            displayMessages(neuroMessage, counselorMessage, elderMessage);
            
            // 履歴に保存
            saveToHistory(mood, neuroMessage, counselorMessage, elderMessage);
            
            // 入力フィールドをクリア
            moodInput.value = '';
            
            // 履歴カウンター更新
            updateHistoryCounter();
            
            // 10回ちょうどに達したらモーダル表示
            if (historyData.length === 10) {
                setTimeout(() => showPdfModal(), 1000);
            }
            
        } catch (error) {
            console.error('セルフトーク生成エラー:', error);
            showAlert('エラーが発生しました。もう一度お試しください。');
        } finally {
            // ローディング状態を解除
            isGenerating = false;
            submitBtn.textContent = 'セルフトークを生成';
            submitBtn.disabled = false;
            moodInput.focus();
        }
    }, 800);
}

// 感情カテゴリを判定
function categorizeEmotion(mood) {
    const lowerMood = mood.toLowerCase();
    
    const hasNegative = emotionKeywords.negative.some(keyword => lowerMood.includes(keyword));
    const hasPositive = emotionKeywords.positive.some(keyword => lowerMood.includes(keyword));
    
    // より精密な判定
    if (hasNegative && hasPositive) {
        // 両方含む場合は、より強い感情を優先 (ここではneutralに倒す)
        return 'neutral';
    } else if (hasNegative) {
        return 'negative';
    } else if (hasPositive) {
        return 'positive';
    } else {
        return 'neutral';
    }
}

// メッセージ生成（統一関数）
function generateMessage(character, mood) {
    const emotionCategory = categorizeEmotion(mood);
    const messages = messageDatabase[character][emotionCategory];
    
    // ランダムに選択（同じメッセージが連続しないように配慮）
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

// メッセージを画面に表示
function displayMessages(neuroMessage, counselorMessage, elderMessage) {
    const neuroSpeech = document.getElementById('neuroSpeech');
    const counselorSpeech = document.getElementById('counselorSpeech');
    const elderSpeech = document.getElementById('elderSpeech');
    
    // アニメーション効果を追加
    const elements = [neuroSpeech, counselorSpeech, elderSpeech];
    elements.forEach(element => {
        if (element) {
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 500);
        }
    });
    
    if (neuroSpeech) neuroSpeech.innerHTML = `<p>${neuroMessage}</p>`;
    if (counselorSpeech) counselorSpeech.innerHTML = `<p>${counselorMessage}</p>`;
    if (elderSpeech) elderSpeech.innerHTML = `<p>${elderMessage}</p>`;
}

// 履歴に保存
function saveToHistory(mood, neuroMessage, counselorMessage, elderMessage) {
    const entry = {
        date: new Date(),
        mood: mood,
        neuro: neuroMessage,
        counselor: counselorMessage,
        elder: elderMessage
    };
    
    historyData.push(entry);
    
    // localStorageに保存（エラーハンドリング付き）
    try {
        localStorage.setItem('selfTalkHistory', JSON.stringify(historyData));
    } catch (e) {
        console.warn('localStorage への保存に失敗しました:', e);
        // ストレージ容量が足りない場合は古いデータを削除
        if (e.name === 'QuotaExceededError') {
            historyData = historyData.slice(-5); // 最新の5件のみ保持
            try {
                localStorage.setItem('selfTalkHistory', JSON.stringify(historyData));
            } catch (e2) {
                console.warn('履歴の削減後も保存に失敗:', e2);
            }
        }
    }
}

// 履歴を読み込み
function loadHistory() {
    try {
        const stored = localStorage.getItem('selfTalkHistory');
        if (stored) {
            historyData = JSON.parse(stored);
            // 日付オブジェクトの復元
            historyData = historyData.map(entry => ({
                ...entry,
                date: new Date(entry.date)
            }));
        }
    } catch (e) {
        console.warn('履歴の読み込みに失敗しました:', e);
        historyData = [];
    }
}

// 履歴カウンター更新
function updateHistoryCounter() {
    const counter = document.getElementById('historyCount');
    if (!counter) return;
    
    counter.textContent = historyData.length;
    
    // 10回に近づいたら色を変える
    if (historyData.length >= 10) {
        counter.style.color = '#4caf50';
        counter.style.fontWeight = 'bold';
        counter.style.fontSize = '1.2em';
    } else if (historyData.length >= 8) {
        counter.style.color = '#ff6b6b';
        counter.style.fontWeight = 'bold';
    } else if (historyData.length >= 5) {
        counter.style.color = '#ffa726';
    }
}

// PDFモーダル表示
function showPdfModal() {
    const modal = document.getElementById('pdfModal');
    if (modal) {
        modal.style.display = 'block';
        // 体のスクロールを無効化
        document.body.style.overflow = 'hidden';
    }
}

// PDFモーダル閉じる
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    if (modal) {
        modal.style.display = 'none';
        // 体のスクロールを有効化
        document.body.style.overflow = '';
    }
}

// PDF生成
function generatePDF() {
    try {
        // jsPDF の確認
        if (typeof window.jspdf === 'undefined') {
            showAlert('PDFライブラリが読み込まれていません。ページを再読み込みしてください。');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // 日本語フォント設定 (Noto Sans JPを例に。ここではhelveticaのまま)
        // doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
        // doc.setFont("NotoSansJP");
        doc.setFont('helvetica'); // デフォルトのままで表示が崩れる可能性あり
        
        // タイトル
        doc.setFontSize(20);
        doc.text('My Self-Talk Collection', 20, 30);
        
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString('ja-JP')}`, 20, 40);
        doc.text(`Total Entries: ${historyData.length}`, 20, 50);
        
        let yPosition = 70;
        
        // 各履歴エントリを追加
        historyData.forEach((entry, index) => {
            // ページの残りスペースをチェック
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            // エントリ番号と日付
            doc.setFontSize(14);
            doc.text(`${index + 1}. ${entry.date.toLocaleDateString('ja-JP')}`, 20, yPosition);
            yPosition += 8;
            
            // 気分
            doc.setFontSize(12);
            const moodText = `Mood: ${entry.mood}`;
            doc.text(moodText, 25, yPosition);
            yPosition += 8;
            
            // 各キャラクターのメッセージ
            doc.setFontSize(10);
            
            // テキストの長さに応じて改行処理
            const wrapText = (text, maxWidth) => {
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';
                
                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    if (doc.getTextWidth(testLine) > maxWidth) {
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) lines.push(currentLine);
                return lines;
            };
            
            // 脳科学者
            const neuroLines = doc.splitTextToSize(`Neuroscientist: ${entry.neuro}`, 160); // jspdfのsplitTextToSizeを使用
            neuroLines.forEach(line => {
                doc.text(line, 25, yPosition);
                yPosition += 5;
            });
            yPosition += 2;
            
            // カウンセラー
            const counselorLines = doc.splitTextToSize(`Counselor: ${entry.counselor}`, 160);
            counselorLines.forEach(line => {
                doc.text(line, 25, yPosition);
                yPosition += 5;
            });
            yPosition += 2;
            
            // 老婆
            const elderLines = doc.splitTextToSize(`Elder: ${entry.elder}`, 160);
            elderLines.forEach(line => {
                doc.text(line, 25, yPosition);
                yPosition += 5;
            });
            yPosition += 10;
        });
        
        // PDFをダウンロード
        const fileName = `selftalk-collection-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        // モーダルを閉じる
        closePdfModal();
        
        // 成功メッセージ
        showAlert('PDFファイルをダウンロードしました！');
        
    } catch (error) {
        console.error('PDF生成エラー:', error);
        showAlert('PDFの生成に失敗しました。もう一度お試しください。');
    }
}

// アラート表示（カスタムアラート風）
function showAlert(message) {
    // よりユーザーフレンドリーなアラート
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        text-align: center;
        min-width: 300px;
    `;
    
    alertDiv.innerHTML = `
        <p style="margin: 0 0 15px 0; font-size: 16px;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        ">OK</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3秒後に自動で消す
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 3000);
}

// 履歴データをリセットする関数（デバッグ用）
function resetHistory() {
    if (confirm('履歴をリセットしますか？この操作は取り消せません。')) {
        historyData = [];
        try {
            localStorage.removeItem('selfTalkHistory');
        } catch (e) {
            console.warn('localStorage のクリアに失敗しました:', e);
        }
        updateHistoryCounter();
        showInitialMessages();
        showAlert('履歴をリセットしました。');
    }
}

// デバッグ用：履歴を手動で追加する関数
function addTestHistory() {
    const testMoods = ['嬉しい', '疲れた', '不安', '充実してる', '眠い', 'ストレス', '楽しい', '心配', '満足', '憂鬱'];
    const testMood = testMoods[Math.floor(Math.random() * testMoods.length)];
    
    const neuroMessage = generateMessage('neuroscientist', testMood);
    const counselorMessage = generateMessage('counselor', testMood);
    const elderMessage = generateMessage('elder', testMood);
    
    saveToHistory(testMood, neuroMessage, counselorMessage, elderMessage);
    updateHistoryCounter();
    
    console.log(`テスト履歴を追加しました: ${testMood} (現在の履歴数: ${historyData.length})`);
}

// エクスポート用（モジュール化する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSelfTalk,
        resetHistory,
        addTestHistory,
        generateMessage,
        categorizeEmotion
    };
}