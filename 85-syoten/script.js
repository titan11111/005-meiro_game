const questions = [
    {opening:"国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。信号所に汽車が止まった。",correct:"雪国",wrong1:"伊豆の踊子",wrong2:"山の音",author:"川端康成",difficulty:"famous"},
    {opening:"吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。",correct:"吾輩は猫である",wrong1:"坊っちゃん",wrong2:"こころ",author:"夏目漱石",difficulty:"famous"},
    {opening:"親譲りの無鉄砲で小供の時から損ばかりしている。",correct:"坊っちゃん",wrong1:"三四郎",wrong2:"門",author:"夏目漱石",difficulty:"student"},
    {opening:"メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。",correct:"走れメロス",wrong1:"人間失格",wrong2:"斜陽",author:"太宰治",difficulty:"student"},
    {opening:"恥の多い生涯を送って来ました。",correct:"人間失格",wrong1:"津軽",wrong2:"ヴィヨンの妻",author:"太宰治",difficulty:"famous"},
    {opening:"道がつづら折りになって、いよいよ天城峠に近づいたと思うころ、雨脚が杉の密林を白く染めながら、すさまじい早さで麓から私を追って来た。",correct:"伊豆の踊子",wrong1:"雪国",wrong2:"古都",author:"川端康成",difficulty:"famous"},
    {opening:"竹取の翁といふものありけり。野山にまじりて竹を取りつつ、よろづのことに使ひけり。",correct:"竹取物語",wrong1:"源氏物語",wrong2:"伊勢物語",author:"作者不詳",difficulty:"nostalgic"},
    {opening:"ある朝、グレゴール・ザムザがなにか気がかりな夢から目をさますと、自分が寝床の中で一匹の巨大な虫に変わっているのを発見した。",correct:"変身",wrong1:"城",wrong2:"審判",author:"カフカ",difficulty:"rare"},
    {opening:"きょう、ママンが死んだ。もしかすると昨日かもしれない。",correct:"異邦人",wrong1:"ペスト",wrong2:"転落",author:"カミュ",difficulty:"rare"},
    {opening:"臆病な自尊心と尊大な羞恥心との二つを持っていた李徴は、ある日の午後、ふと役所の書類の上に自分の書いた詩の一篇を発見して、愕然とした。",correct:"山月記",wrong1:"舞姫",wrong2:"高瀬舟",author:"中島敦",difficulty:"student"},
    {opening:"では皆さんは、そういうふうに川だと考えてよろしいでしょうか。先生は黒板いっぱいに大きな河の字を書きながら言いました。",correct:"銀河鉄道の夜",wrong1:"注文の多い料理店",wrong2:"風の又三郎",author:"宮沢賢治",difficulty:"student"},
    {opening:"二人の若い紳士が山の中を歩いていました。猟に来たのです。",correct:"注文の多い料理店",wrong1:"銀河鉄道の夜",wrong2:"風の又三郎",author:"宮沢賢治",difficulty:"student"},
    {opening:"どっどどどどうど どどうど どどう。風が村のはずれの林を通り、草も木もざわめいた。",correct:"風の又三郎",wrong1:"銀河鉄道の夜",wrong2:"注文の多い料理店",author:"宮沢賢治",difficulty:"famous"},
    {opening:"見返り柳の根かたに、黒い溝がうねうねと流れている。",correct:"たけくらべ",wrong1:"にごりえ",wrong2:"十三夜",author:"樋口一葉",difficulty:"nostalgic"},
    {opening:"武蔵野は秋である。秋は武蔵野である。",correct:"武蔵野",wrong1:"忘れえぬ人々",wrong2:"春の鳥",author:"国木田独歩",difficulty:"nostalgic"},
    {opening:"豊後の国、耶馬溪の奥深く、一人の男が岩を掘っていた。",correct:"恩讐の彼方に",wrong1:"父帰る",wrong2:"忠直卿行状記",author:"菊池寛",difficulty:"student"},
    {opening:"余の病牀は六尺の幅に過ぎぬ。これを宇宙に比すれば塵芥よりも狭し。",correct:"病牀六尺",wrong1:"墨汁一滴",wrong2:"仰臥漫録",author:"正岡子規",difficulty:"maniac"},
    {opening:"はたらけど はたらけど 猶わが生活楽にならざり ぢっと手を見る。",correct:"一握の砂",wrong1:"悲しき玩具",wrong2:"呼子と口笛",author:"石川啄木",difficulty:"famous"},
    {opening:"君死にたまふことなかれ。すめらみことは戦いにおほみづからは出でまさね。",correct:"君死にたまふことなかれ",wrong1:"みだれ髪",wrong2:"舞姫",author:"与謝野晶子",difficulty:"famous"},
    {opening:"これは遠野の郷に伝わる昔話の記録である。",correct:"遠野物語",wrong1:"野草",wrong2:"蝸牛考",author:"柳田國男",difficulty:"rare"},
    {opening:"月日は百代の過客にして、行きかふ年もまた旅人なり。",correct:"奥の細道",wrong1:"野ざらし紀行",wrong2:"笈の小文",author:"松尾芭蕉",difficulty:"famous"},
    {opening:"関八州のうち、安房の国里見家の物語である。",correct:"南総里見八犬伝",wrong1:"椿説弓張月",wrong2:"開巻驚奇俠客伝",author:"曲亭馬琴",difficulty:"nostalgic"},
    {opening:"これは夢か幻か。夜の闇の中、月の光が川面に揺れている。",correct:"雨月物語",wrong1:"春雨物語",wrong2:"今昔物語集",author:"上田秋成",difficulty:"rare"},
    {opening:"山の湯の町で三週間ばかりを過ごした。",correct:"城の崎にて",wrong1:"和解",wrong2:"暗夜行路",author:"志賀直哉",difficulty:"student"},
    {opening:"七月の初め、異常に暑い夕暮れどき、一人の青年が、S横町のアパートから通りへ出て行った。",correct:"罪と罰",wrong1:"カラマーゾフの兄弟",wrong2:"白痴",author:"ドストエフスキー",difficulty:"rare"},
    {opening:"えたいの知れない不吉な塊が私の心を始終圧えつけていた。",correct:"檸檬",wrong1:"城のある町にて",wrong2:"桜の樹の下には",author:"梶井基次郎",difficulty:"maniac"},
    {opening:"朝、食堂でスープを一さじ吸ってお母さまが「あ」と幽かな声をあげた。",correct:"斜陽",wrong1:"パンドラの匣",wrong2:"お伽草紙",author:"太宰治",difficulty:"maniac"},
    {opening:"木曾路はすべて山の中である。",correct:"夜明け前",wrong1:"破戒",wrong2:"若菜集",author:"島崎藤村",difficulty:"maniac"},
    {opening:"私がまだ十歳ばかりの子供の時分、母に連れられて遠い親類の家に行った。",correct:"こころ",wrong1:"坊っちゃん",wrong2:"三四郎",author:"夏目漱石",difficulty:"famous"},
    {opening:"月はどう見ても私には小さな金貨のように見えたが、彼は大きな銀貨だと主張した。",correct:"月と六ペンス",wrong1:"人間の絆",wrong2:"剃刀の刃",author:"サマセット・モーム",difficulty:"rare"},
    {opening:"あたしたちはハンスを駅まで見送りに行った。",correct:"車輪の下",wrong1:"デミアン",wrong2:"春の嵐",author:"ヘッセ",difficulty:"maniac"},
    {opening:"ユダヤの王ヘロデが、ある日その義理の娘サロメに言った。『お前のために何をしてやろうか。』サロメは答えた。『ヨカナーンの首が欲しい。』",correct:"サロメ",wrong1:"ドリアン・グレイの肖像",wrong2:"幸福な王子",author:"オスカー・ワイルド",difficulty:"rare"},
    {opening:"おそろしい十月の末の夜だった。風がその晩はじめて本当に烈しく吹いた。",correct:"屋根裏の散歩者",wrong1:"人間椅子",wrong2:"二銭銅貨",author:"江戸川乱歩",difficulty:"maniac"},
    {opening:"ゴーシュは町の活動写真館で楽団のセロを弾く係でした。",correct:"セロ弾きのゴーシュ",wrong1:"銀河鉄道の夜",wrong2:"注文の多い料理店",author:"宮沢賢治",difficulty:"student"},
    {opening:"ある冬の夕方であった。人通りの少ない路地の奥の小さな家から、琴の音がかすかに聞こえていた。",correct:"にごりえ",wrong1:"たけくらべ",wrong2:"十三夜",author:"樋口一葉",difficulty:"maniac"},
    {opening:"五重塔の高さは三十余丈。江戸市中の塔のうちで最も高い。",correct:"五重塔",wrong1:"風流仏",wrong2:"運命",author:"幸田露伴",difficulty:"rare"},
    {opening:"下宿の二階の八畳の間に、文三は机を前にしていた。",correct:"浮雲",wrong1:"其面影",wrong2:"平凡",author:"二葉亭四迷",difficulty:"maniac"},
    {opening:"その夜、観子が来た。",correct:"蒲団",wrong1:"田舎教師",wrong2:"生",author:"田山花袋",difficulty:"maniac"},
    {opening:"教師は田舎の学校へ赴任してから三年が過ぎた。",correct:"田舎教師",wrong1:"蒲団",wrong2:"生",author:"田山花袋",difficulty:"maniac"},
    {opening:"父と私は十年近く口をきいていなかった。",correct:"和解",wrong1:"城の崎にて",wrong2:"暗夜行路",author:"志賀直哉",difficulty:"student"},
    {opening:"母と子供たちは貧しいながらも静かに暮らしていた。",correct:"父帰る",wrong1:"恩讐の彼方に",wrong2:"忠直卿行状記",author:"菊池寛",difficulty:"nostalgic"},
    {opening:"その女は老いた芸者であった。かつては名の知れた花形であったが、今は狭い裏長屋にひとり暮らしている。朝になると、薄化粧をして鏡の前に座る。",correct:"老妓抄",wrong1:"生々流転",wrong2:"鶴は病みき",author:"岡本かの子",difficulty:"rare"},
    {opening:"病気は思うようにならぬものだ。今日よくても明日は苦しい。明日よくても明後日はわからぬ。そんなことを何度もくり返しながら、私は筆をとっている。",correct:"墨汁一滴",wrong1:"病牀六尺",wrong2:"仰臥漫録",author:"正岡子規",difficulty:"maniac"},
    {opening:"あの人のことを考えると、私はいつも胸が熱くなる。私の心の奥深くに、消えずに残っている人々の顔がある。",correct:"忘れえぬ人々",wrong1:"武蔵野",wrong2:"春の鳥",author:"国木田独歩",difficulty:"maniac"},
    {opening:"山のふもとの小さな村に、一体の古い仏像があった。それは誰が作ったものかもわからず、長い年月を風雨にさらされていた。",correct:"風流仏",wrong1:"五重塔",wrong2:"運命",author:"幸田露伴",difficulty:"rare"},
    {opening:"友がみなわれよりえらく見ゆる日よ 花を買ひ来て 妻としたしむ。",correct:"悲しき玩具",wrong1:"一握の砂",wrong2:"呼子と口笛",author:"石川啄木",difficulty:"maniac"},
    {opening:"浮世風呂は、江戸の町の風俗を写した滑稽本なり。",correct:"浮世風呂",wrong1:"浮世床",wrong2:"東海道中膝栗毛",author:"式亭三馬",difficulty:"nostalgic"},
    {opening:"私はその夜、長い夢を見た。それは過ぎ去った年月が一度に押し寄せてくるような夢であった。目が覚めたとき、私はしばらく身じろぎもせず、ただぼんやりと天井を見つめていた。",correct:"生々流転",wrong1:"老妓抄",wrong2:"鶴は病みき",author:"岡本かの子",difficulty:"rare"},
    {opening:"クリスマスにプレゼントがないなんてつまらないわ、とジョーがソファに寝そべって言った。",correct:"若草物語",wrong1:"秘密の花園",wrong2:"赤毛のアン",author:"ルイーザ・メイ・オルコット",difficulty:"famous"},
    {opening:"世間で広く認められている真理がある。富裕な独身男性は、必ずや妻を求めているに違いないという真理である。",correct:"高慢と偏見",wrong1:"分別と多感",wrong2:"エマ",author:"ジェーン・オースティン",difficulty:"rare"},
    {opening:"その日は散歩ができないほどの寒風と雨で、私たちは家にこもっていた。私は火のそばで本を読んでいたが、リードおばさんが呼ぶ声がした。",correct:"ジェーン・エア",wrong1:"嵐が丘",wrong2:"シャーロット",author:"シャーロット・ブロンテ",difficulty:"rare"},
    {opening:"1801年。私は新しい地主ヒースクリフ氏のもとを訪ねた。彼は孤独を愛する人物のようだ。",correct:"嵐が丘",wrong1:"ジェーン・エア",wrong2:"アグネス・グレイ",author:"エミリー・ブロンテ",difficulty:"rare"},
    {opening:"北極の海で、氷に囲まれた船の中からこの手紙を書いています。奇怪な男を救助しました。",correct:"フランケンシュタイン",wrong1:"吸血鬼ドラキュラ",wrong2:"ジキル博士とハイド氏",author:"メアリー・シェリー",difficulty:"student"},
    {opening:"芳香が満ちるアトリエの中で、キャンバスの前に若い美青年の肖像が立てかけられていた。",correct:"ドリアン・グレイの肖像",wrong1:"サロメ",wrong2:"幸福な王子",author:"オスカー・ワイルド",difficulty:"rare"},
    {opening:"父の宿屋「ベンボー提督亭」に、ある日ひとりの老人が現れた。彼は海の男で、顔には深い傷跡があった。",correct:"宝島",wrong1:"ジキル博士とハイド氏",wrong2:"誘拐されて",author:"スティーヴンソン",difficulty:"student"},
    {opening:"弁護士アターソン氏は、厳格で控えめな男であった。ある夜、友人エンフィールドと歩いていると、奇妙な扉の前で足を止めた。",correct:"ジキル博士とハイド氏",wrong1:"宝島",wrong2:"誘拐されて",author:"スティーヴンソン",difficulty:"student"},
    {opening:"アリスは姉のそばで本を読んでいたが、退屈していた。そこへ白いウサギが通りかかり、懐中時計を取り出した。",correct:"不思議の国のアリス",wrong1:"鏡の国のアリス",wrong2:"スナーク狩り",author:"ルイス・キャロル",difficulty:"famous"},
    {opening:"冬の日、アリスは暖炉の前で猫と遊んでいた。鏡の向こうの世界を想像しながら、つぶやいた。",correct:"鏡の国のアリス",wrong1:"不思議の国のアリス",wrong2:"スナーク狩り",author:"ルイス・キャロル",difficulty:"famous"},
    {opening:"私はガリヴァーという名の医師である。航海の途中、嵐に遭い、漂着したのは見知らぬ小さな国だった。",correct:"ガリヴァー旅行記",wrong1:"ロビンソン・クルーソー",wrong2:"宝島",author:"ジョナサン・スウィフト",difficulty:"student"},
    {opening:"私の名はロビンソン・クルーソー。航海を夢見て家を出たが、嵐に遭い無人島へ漂着した。",correct:"ロビンソン・クルーソー",wrong1:"ガリヴァー旅行記",wrong2:"宝島",author:"ダニエル・デフォー",difficulty:"famous"},
    {opening:"ラ・マンチャのある村に、やせた馬と槍を持った紳士がいた。彼は読んだ騎士物語に心を奪われ、自らをドン・キホーテと名乗った。",correct:"ドン・キホーテ",wrong1:"ラサリーリョ",wrong2:"ドン・ファン",author:"セルバンテス",difficulty:"famous"},
    {opening:"ああ、哲学も、法学も、医学も、神学さえも、すべて学び尽くした。それでもなお、私は無知のままだ。",correct:"ファウスト",wrong1:"若きウェルテルの悩み",wrong2:"ヴィルヘルム・マイスター",author:"ゲーテ",difficulty:"rare"},
    {opening:"五月の日々、私は新しい町にやってきた。空気は清らかで、人々は親切だった。けれども、あの人――ロッテに出会ってから、すべてが変わってしまったのだ。",correct:"若きウェルテルの悩み",wrong1:"ファウスト",wrong2:"親和力",author:"ゲーテ",difficulty:"rare"},
    {opening:"四月の甘い雨が大地を潤し、花々を呼び覚ます頃、巡礼たちは聖トマスの墓を目指して旅に出る。",correct:"カンタベリー物語",wrong1:"デカメロン",wrong2:"神曲",author:"チョーサー",difficulty:"rare"},
    {opening:"1625年春。若きガスコーニュの青年ダルタニャンは、黄色い馬に乗り、パリを目指していた。",correct:"三銃士",wrong1:"モンテ・クリスト伯",wrong2:"王妃マルゴ",author:"デュマ",difficulty:"famous"},
    {opening:"1815年、マルセイユ港。若き船乗りエドモン・ダンテスは幸福の絶頂にあった。婚約者と再会しようとしていたその日、彼は陰謀により裏切られた。",correct:"モンテ・クリスト伯",wrong1:"三銃士",wrong2:"鉄仮面",author:"デュマ",difficulty:"famous"},
    {opening:"一人の男が、銀の皿を盗んだ罪で町を追われていた。その名はジャン・バルジャン。だが司祭は彼を赦した。",correct:"レ・ミゼラブル",wrong1:"ノートル＝ダム・ド・パリ",wrong2:"九十三年",author:"ユーゴー",difficulty:"famous"},
    {opening:"1482年のパリ。聖母大聖堂の鐘が鳴り響く。広場では祭りの群衆が踊り、美女エスメラルダが舞っていた。",correct:"ノートル＝ダム・ド・パリ",wrong1:"レ・ミゼラブル",wrong2:"笑う男",author:"ユーゴー",difficulty:"rare"},
    {opening:"あの晩、パリの空には霧がたちこめ、セーヌ川の灯がぼんやり揺れていた。私は偶然立ち寄った古びた宿で、一人の奇妙な旅人に出会った。",correct:"脂肪の塊",wrong1:"女の一生",wrong2:"ベラミ",author:"モーパッサン",difficulty:"maniac"},
    {opening:"我々がシャルル・ボヴァリーを初めて見たのは、教室に新入生として入ってきたときだった。",correct:"ボヴァリー夫人",wrong1:"感情教育",wrong2:"サランボー",author:"フローベール",difficulty:"rare"},
    {opening:"アレクセイ・カラマーゾフは末の息子であった。父フョードルは放蕩者で、家族を顧みなかった。",correct:"カラマーゾフの兄弟",wrong1:"罪と罰",wrong2:"白痴",author:"ドストエフスキー",difficulty:"rare"},
    {opening:"1805年夏、ロシアの貴族社交界は戦争の噂で騒いでいた。アンナ・パヴロヴナの夜会で、人々はナポレオンについて語り合った。",correct:"戦争と平和",wrong1:"アンナ・カレーニナ",wrong2:"復活",author:"トルストイ",difficulty:"rare"},
    {opening:"すべての幸福な家庭は似ている。不幸な家庭はそれぞれに不幸である。",correct:"アンナ・カレーニナ",wrong1:"戦争と平和",wrong2:"復活",author:"トルストイ",difficulty:"famous"},
    {opening:"イワン・イリイチが死んだという知らせは、官庁の同僚たちに「昇進の可能性」として受け止められた。",correct:"イワン・イリイチの死",wrong1:"クロイツェル・ソナタ",wrong2:"悪魔",author:"トルストイ",difficulty:"rare"},
    {opening:"ある国に三人の兄弟がいた。長男は軍人、次男は商人、末の弟は「イワンのばか」と呼ばれていた。",correct:"イワンのばか",wrong1:"人にはどれほどの土地がいるか",wrong2:"三つの死",author:"トルストイ",difficulty:"student"},
    {opening:"朝、目を覚ますと、コワリョーフ少佐は自分の「鼻」がなくなっていることに気づいた。",correct:"鼻",wrong1:"外套",wrong2:"検察官",author:"ゴーゴリ",difficulty:"student"},
    {opening:"ペテルブルクの寒い冬。下級役人アカーキイ・アカーキエヴィチは、ぼろぼろの外套を着て職場に通っていた。",correct:"外套",wrong1:"鼻",wrong2:"狂人日記",author:"ゴーゴリ",difficulty:"student"},
    {opening:"私はあの奇怪な事件を決して忘れない。霧の町パリで起きた、密室の殺人。",correct:"モルグ街の殺人",wrong1:"黄金虫",wrong2:"黒猫",author:"エドガー・アラン・ポー",difficulty:"rare"},
    {opening:"天竺への旅立ちの前夜、玄奘三蔵は夢の中で光り輝く仏を見た。悟空・八戒・沙悟浄の三人は、師を守る誓いを立てる。",correct:"西遊記",wrong1:"三国志演義",wrong2:"水滸伝",author:"呉承恩",difficulty:"famous"},
    {opening:"時は後漢末期。天下は乱れ、群雄割拠していた。桃園に集った劉備・関羽・張飛の三人は誓いを交わした。",correct:"三国志演義",wrong1:"西遊記",wrong2:"水滸伝",author:"羅貫中",difficulty:"famous"},
    {opening:"運命に抗う108人の豪傑たち。その始まりは、ある寺に封じられた魔性の霊が解き放たれた時だった。",correct:"水滸伝",wrong1:"三国志演義",wrong2:"西遊記",author:"施耐庵",difficulty:"famous"},
    {opening:"王妃の裏切りに絶望した王は、毎晩新しい娘を娶り、翌朝には殺した。ある夜、シェヘラザードが王のもとに進み出る。",correct:"千夜一夜物語",wrong1:"カリラとディムナ",wrong2:"ルバイヤート",author:"作者不詳",difficulty:"rare"},
    {opening:"昔々、賢王が二頭のジャッカルを召し出した。名はカリラとディムナ。彼らは知恵と策略をもって語り合う。",correct:"カリラとディムナ",wrong1:"千夜一夜物語",wrong2:"ルバイヤート",author:"イブン・アル＝ムカッファ",difficulty:"maniac"},
    {opening:"風は砂を運び、時は人を流す。明日のことなど誰にわかるというのか。だからこそ今を楽しめ。",correct:"ルバイヤート",wrong1:"千夜一夜物語",wrong2:"カリラとディムナ",author:"オマル・ハイヤーム",difficulty:"maniac"}
];

const personas = [
    {name:"主婦",icon:"👩",difficulty:"famous",tag:"有名作品",tagColor:"#ff69b4",image:"images/customer1.png"},
    {name:"学生",icon:"🎒",difficulty:"student",tag:"課題図書",tagColor:"#4169e1",image:"images/customer2.png"},
    {name:"会社員",icon:"💼",difficulty:"rare",tag:"レア",tagColor:"#d4af37",image:"images/customer3.png"},
    {name:"大学生",icon:"📚",difficulty:"student",tag:"課題図書",tagColor:"#4169e1",image:"images/customer4.png"},
    {name:"セレブ",icon:"💎",difficulty:"rare",tag:"レア",tagColor:"#d4af37",image:"images/customer5.png"},
    {name:"おじいちゃん",icon:"👴",difficulty:"nostalgic",tag:"懐かしい",tagColor:"#8b7355",image:"images/customer6.png"},
    {name:"文学青年",icon:"👨‍🎓",difficulty:"maniac",tag:"マニアック",tagColor:"#8b4789",image:"images/customer7.png"}
];

let score = 0, stars = 0, usedQuestions = [], currentQuestion = null, currentPersona = null;

function startGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    score = 0;
    stars = 0;
    usedQuestions = [];
    updateScore();
    showQuestion();
}

function showQuestion() {
    document.getElementById('customer-speech').style.display = 'none';
    document.getElementById('choices').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    
    currentPersona = personas[Math.floor(Math.random() * personas.length)];
    
    let available = questions.filter((q, i) => !usedQuestions.includes(i) && q.difficulty === currentPersona.difficulty);
    if (available.length === 0) available = questions.filter((q, i) => !usedQuestions.includes(i));
    if (available.length === 0) {
        alert('🎉 全問題制覇おめでとうございます！');
        usedQuestions = [];
        available = questions;
    }
    
    currentQuestion = available[Math.floor(Math.random() * available.length)];
    usedQuestions.push(questions.indexOf(currentQuestion));
    
    const customerImg = document.getElementById('customer-img');
    customerImg.src = currentPersona.image;
    customerImg.style.right = '-150px';
    customerImg.classList.remove('customer-walking');
    
    setTimeout(() => {
        customerImg.classList.add('customer-walking');
    }, 100);
    
    setTimeout(() => {
        document.getElementById('customer-icon').textContent = currentPersona.icon;
        document.getElementById('customer-name').textContent = currentPersona.name;
        document.getElementById('persona-tag').textContent = currentPersona.tag;
        document.getElementById('persona-tag').style.backgroundColor = currentPersona.tagColor;
        document.getElementById('opening-text').textContent = currentQuestion.opening;
        document.getElementById('customer-speech').style.display = 'block';
        speakText();
        
        setTimeout(() => showChoices(), 2000);
    }, 2500);
}

function showChoices() {
    let choices = [currentQuestion.correct, currentQuestion.wrong1, currentQuestion.wrong2].sort(() => Math.random() - 0.5);
    document.getElementById('choices').innerHTML = choices.map(c =>
        `<button class="choice-button" onclick="checkAnswer('${c.replace(/'/g, "\\'")}')">${c}</button>`
    ).join('');
    document.getElementById('choices').style.display = 'flex';
}

function checkAnswer(selected) {
    document.querySelectorAll('.choice-button').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuestion.correct) btn.classList.add('correct');
        else if (btn.textContent === selected && selected !== currentQuestion.correct) btn.classList.add('wrong');
    });
    
    setTimeout(() => {
        if (selected === currentQuestion.correct) {
            score++;
            stars++;
            updateScore();
            if (stars >= 5) {
                document.getElementById('result-text').textContent = `ありがとうございます！\n「${currentQuestion.correct}」ですね。\n\n⭐⭐⭐⭐⭐ 5つ星達成！`;
                document.getElementById('result-screen').style.display = 'block';
                document.getElementById('choices').style.display = 'none';
                document.getElementById('customer-speech').style.display = 'none';
                document.querySelector('#result-screen .main-button').onclick = showClear;
            } else {
                document.getElementById('result-text').textContent = `ありがとうございます！\n「${currentQuestion.correct}」ですね。\nさすがです！`;
                document.getElementById('result-screen').style.display = 'block';
                document.getElementById('choices').style.display = 'none';
                document.getElementById('customer-speech').style.display = 'none';
            }
        } else {
            gameOver();
        }
    }, 1500);
}

function nextQuestion() {
    document.getElementById('result-screen').style.display = 'none';
    showQuestion();
}

function showClear() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('clear-screen').style.display = 'block';
    document.getElementById('clear-score').textContent = score;
}

function continueGame() {
    document.getElementById('clear-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    showQuestion();
}

function gameOver() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'block';
    document.getElementById('final-score').textContent = score;
}

function updateScore() {
    document.getElementById('score').textContent = score;
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        starsHTML += i < stars ? '<span class="star-filled">★</span>' : '<span class="star-empty">☆</span>';
    }
    document.getElementById('stars').innerHTML = starsHTML;
}

function speakText() {
    if ('speechSynthesis' in window && currentQuestion) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(currentQuestion.opening);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}