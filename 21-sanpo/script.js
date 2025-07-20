let gameState = {
    currentDay: 1,
    currentLocation: 0,
    heartPoints: 0,
    diaryEntries: [],
    allDiary: [],
    dayLocations: [],
    metCharacters: {},  // キャラクターとの出会い記録
    treasures: {},      // 発見した宝物の記録
    totalTreasures: 0   // 発見した宝物の総数
};

// 宝物データベース
const treasureData = {
    "shinySeed": {
        name: "キラキラの種",
        icon: "🌟",
        description: "公園で見つけた光る種。植えると素敵な花が咲くかも！",
        rarity: "common",
        usable: true,
        effect: "flowerEvent",
        effectDescription: "次の散歩で花のイベントが発生します"
    },
    "oldCoin": {
        name: "古いコイン",
        icon: "🪙",
        description: "商店街で見つけた古いコイン。昔の人の思い出が詰まっています。",
        rarity: "rare",
        usable: true,
        effect: "shopDiscount",
        effectDescription: "次の散歩で特別な商品が買えます"
    },
    "prettyShell": {
        name: "きれいな貝がら",
        icon: "🐚",
        description: "川辺で見つけた美しい貝がら。海の香りがします。",
        rarity: "common",
        usable: false
    },
    "magicStone": {
        name: "不思議な石",
        icon: "💎",
        description: "坂道で見つけた不思議な石。触ると温かくなります。",
        rarity: "epic",
        usable: true,
        effect: "luckyBoost",
        effectDescription: "次の散歩で宝物発見率がアップします"
    },
    "goldenLeaf": {
        name: "金色の葉っぱ",
        icon: "🍃",
        description: "交差点で見つけた金色に光る葉っぱ。とても珍しいです。",
        rarity: "rare",
        usable: false
    },
    "heartCrystal": {
        name: "ハートのクリスタル",
        icon: "💖",
        description: "特別な場所で見つけた心の形のクリスタル。愛の力が宿っています。",
        rarity: "legendary",
        usable: true,
        effect: "heartBoost",
        effectDescription: "次の散歩で心ポイントが2倍になります"
    },
    "musicBox": {
        name: "小さなオルゴール",
        icon: "🎵",
        description: "どこからか聞こえてくる美しいメロディーの正体でした。",
        rarity: "epic",
        usable: true,
        effect: "hiddenCharacter",
        effectDescription: "次の散歩で隠しキャラが登場します"
    },
    "starFragment": {
        name: "星のかけら",
        icon: "⭐",
        description: "夜空から落ちてきた星のかけら。願いを叶えてくれそうです。",
        rarity: "legendary",
        usable: true,
        effect: "starPower",
        effectDescription: "次の散歩で特別な星のイベントが発生します"
    }
};

const days = [
    {
        day: 1,
        locations: [
            {
                name: "おうち",
                icon: "🏠",
                story: "今日はとても良い天気！<br>街を一周して、いろんな出会いを楽しみましょう。<br>散歩中に素敵な宝物も見つかるかも！<br>さあ、散歩に出発です！",
                choices: [{ text: "散歩を始める", action: "next" }],
                treasures: []
            },
            {
                name: "公園",
                icon: "🌳",
                story: "緑いっぱいの公園に着きました。<br>ベンチに座っているおじいさんと、<br>元気に走り回っている犬がいます。<br>草むらで何かキラキラ光っているのが見えます！",
                choices: [
                    { text: "犬と遊ぶ", action: "playWithDog" },
                    { text: "おじいさんと話す", action: "talkToOldMan" },
                    { text: "キラキラを調べる", action: "searchTreasure", treasure: "shinySeed" }
                ],
                treasures: ["shinySeed"]
            },
            {
                name: "商店街",
                icon: "🏪",
                story: "賑やかな商店街に来ました。<br>おいしそうなにおいが漂っています。<br>パン屋さんと八百屋さんが見えます。<br>古い建物の隙間に何か落ちているようです。",
                choices: [
                    { text: "パン屋さんに行く", action: "visitBakery" },
                    { text: "八百屋さんに行く", action: "visitVeggieStore" },
                    { text: "隙間を調べる", action: "searchTreasure", treasure: "oldCoin" }
                ],
                treasures: ["oldCoin"]
            },
            {
                name: "川辺",
                icon: "🌊",
                story: "静かな川辺に到着しました。<br>釣りをしているおじさんと、<br>水面で泳いでいるカモたちがいます。<br>水辺で美しい貝がらが光っています。",
                choices: [
                    { text: "釣り人と話す", action: "talkToFisher" },
                    { text: "カモを見る", action: "watchDucks" },
                    { text: "貝がらを拾う", action: "searchTreasure", treasure: "prettyShell" }
                ],
                treasures: ["prettyShell"]
            },
            {
                name: "坂道",
                icon: "⛰️",
                story: "ちょっと急な坂道です。<br>少し疲れてきましたが、<br>おばあさんが優しく見守ってくれています。<br>足元に不思議な石が転がっています。",
                choices: [
                    { text: "頑張って登る", action: "climbHill" },
                    { text: "おばあさんと話す", action: "talkToOldWoman" },
                    { text: "石を調べる", action: "searchTreasure", treasure: "magicStone" }
                ],
                treasures: ["magicStone"]
            },
            {
                name: "交差点",
                icon: "🚦",
                story: "大きな交差点に着きました。<br>信号が赤になっています。<br>ルールを守って安全に渡りましょう。<br>街路樹の下に金色の葉っぱが落ちています。",
                choices: [
                    { text: "信号を待つ", action: "waitForSignal" },
                    { text: "左右を確認する", action: "checkBothSides" },
                    { text: "葉っぱを拾う", action: "searchTreasure", treasure: "goldenLeaf" }
                ],
                treasures: ["goldenLeaf"]
            },
            {
                name: "おうち",
                icon: "🏠",
                story: "お疲れさまでした！<br>楽しい散歩から帰ってきました。<br>今日の出会いを振り返ってみましょう。<br>もしかしたら、特別な宝物も見つかるかも？",
                choices: [
                    { text: "日記を見る", action: "showDiary" },
                    { text: "周りを探索する", action: "searchTreasure", treasure: "heartCrystal" }
                ],
                treasures: ["heartCrystal"]
            }
        ]
    }
];

const events = {
    playWithDog: {
        character: "ポチ",
        firstStory: "こんにちは！ぼく、ポチだよ！<br>一緒に遊ぼうよ！<br>しっぽを振って喜んでいます。<br>遊んでいる間に、ポチが何か掘り出しました！",
        repeatStory: "また来てくれたんだね！<br>今日も遊んでくれるの？<br>ポチは大はしゃぎです。<br>今度は違う場所を掘り始めました！",
        heartPoints: 2,
        diary: "🐕 公園で元気な犬のポチと遊びました。とても人なつっこくて可愛かったです。",
        hiddenTreasure: "musicBox"
    },
    talkToOldMan: {
        story: "おじいさんが昔の話をしてくれました。<br>「君のような若い人に会えて嬉しいよ」<br>と言って笑顔を見せてくれました。<br>お話の最後に、特別な物をくれました。",
        heartPoints: 3,
        diary: "👴 公園のおじいさんから素敵な昔話を聞きました。人生の先輩って素晴らしいですね。",
        hiddenTreasure: "starFragment"
    },
    visitBakery: {
        story: "パン屋さんでメロンパンを買いました。<br>お店の人が「いつでも来てね」と<br>笑顔で言ってくれました。",
        heartPoints: 2,
        diary: "🥖 パン屋さんでメロンパンを買いました。焼きたてでとても美味しかったです。"
    },
    visitVeggieStore: {
        story: "八百屋さんで新鮮な野菜を見せてもらいました。<br>「健康が一番だよ」と<br>おじさんが教えてくれました。",
        heartPoints: 2,
        diary: "🥬 八百屋さんで新鮮な野菜を見ました。健康について考える良い機会でした。"
    },
    talkToFisher: {
        story: "釣り人のおじさんが魚の話をしてくれました。<br>「自然と一緒にいると心が落ち着くんだ」<br>と教えてくれました。",
        heartPoints: 3,
        diary: "🎣 川辺の釣り人から自然の大切さを教わりました。静かな時間も必要ですね。"
    },
    watchDucks: {
        story: "カモたちが気持ちよさそうに泳いでいます。<br>親子のカモが一緒に泳ぐ姿を見て<br>心が温かくなりました。",
        heartPoints: 2,
        diary: "🦆 川でカモの親子を見ました。家族って素晴らしいなと思いました。"
    },
    climbHill: {
        story: "頑張って坂道を登りました！<br>上から見る景色はとてもきれいです。<br>努力した分だけ喜びも大きいですね。",
        heartPoints: 3,
        diary: "⛰️ 急な坂道を頑張って登りました。努力すれば素晴らしい景色が待っています。"
    },
    talkToOldWoman: {
        story: "おばあさんが「無理をしないでね」と<br>優しく声をかけてくれました。<br>人の優しさが身に染みます。",
        heartPoints: 3,
        diary: "👵 坂道でおばあさんから優しい言葉をかけてもらいました。人の思いやりって素敵です。"
    },
    waitForSignal: {
        story: "きちんと信号を待って渡りました。<br>ルールを守ることの大切さを<br>改めて感じました。",
        heartPoints: 2,
        diary: "🚦 交差点で信号をしっかり待ちました。ルールを守ることの大切さを再確認しました。"
    },
    checkBothSides: {
        story: "左右をしっかり確認してから渡りました。<br>安全第一！<br>注意深く行動することができました。",
        heartPoints: 2,
        diary: "👀 交差点で左右をしっかり確認しました。安全に気をつけることは大切ですね。"
    },
    searchTreasure: {
        story: "宝物を発見しました！",
        heartPoints: 1,
        diary: "宝物を発見しました。"
    }
};

function startWalk() {
    gameState.currentLocation = 0;
    gameState.heartPoints = 0;
    gameState.diaryEntries = [];
    gameState.dayLocations = days[gameState.currentDay - 1].locations;

    document.getElementById('heart-points').textContent = '0';
    updateTreasureCount();
    updateProgress();
    showLocation();
}

function showLocation() {
    const location = gameState.dayLocations[gameState.currentLocation];
    document.getElementById('location-icon').textContent = location.icon;
    document.getElementById('location-name').textContent = location.name;
    document.getElementById('story-text').innerHTML = location.story;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    location.choices.forEach(choice => {
        // 宝物がすでに発見済みの場合は選択肢を非表示
        if (choice.action === 'searchTreasure' && choice.treasure && gameState.treasures[choice.treasure]) {
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.onclick = () => handleChoice(choice.action, choice.treasure);
        choicesDiv.appendChild(btn);
    });
}

function handleChoice(action, treasure) {
    if (action === 'next') {
        gameState.currentLocation++;
        updateProgress();
        showLocation();
    } else if (action === 'showDiary') {
        showDiary();
    } else if (action === 'searchTreasure') {
        findTreasure(treasure);
    } else if (events[action]) {
        showEvent(action);
    }
}

function findTreasure(treasureId) {
    if (gameState.treasures[treasureId]) {
        return; // すでに発見済み
    }

    const treasure = treasureData[treasureId];
    gameState.treasures[treasureId] = {
        ...treasure,
        foundAt: gameState.dayLocations[gameState.currentLocation].name,
        foundDay: gameState.currentDay
    };

    gameState.totalTreasures++;
    gameState.heartPoints += 2;
    gameState.diaryEntries.push(`✨ ${treasure.name}を発見しました！ ${treasure.description}`);

    // 宝物発見演出
    showTreasurePopup(treasure);

    // UI更新
    document.getElementById('heart-points').textContent = gameState.heartPoints;
    updateTreasureCount();

    // 次の選択肢を表示
    setTimeout(() => {
        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        
        const continueBtn = document.createElement('button');
        continueBtn.className = 'choice-btn';
        continueBtn.textContent = '次へ進む';
        continueBtn.onclick = () => {
            gameState.currentLocation++;
            updateProgress();
            showLocation();
        };
        choicesDiv.appendChild(continueBtn);
    }, 2000);
}

function showTreasurePopup(treasure) {
    const popup = document.getElementById('treasure-popup');
    const icon = document.getElementById('treasure-icon');
    const text = document.getElementById('treasure-text');

    icon.textContent = treasure.icon;
    text.textContent = `${treasure.name}を発見！`;

    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}

function showEvent(eventName) {
    const event = events[eventName];
    const hasMet = gameState.metCharacters[eventName];
    const story = event.repeatStory && hasMet ? event.repeatStory : event.firstStory || event.story;

    gameState.metCharacters[eventName] = true;
    gameState.heartPoints += event.heartPoints;
    gameState.diaryEntries.push(event.diary);

    // 隠し宝物がある場合
    if (event.hiddenTreasure && !gameState.treasures[event.hiddenTreasure]) {
        const treasure = treasureData[event.hiddenTreasure];
        gameState.treasures[event.hiddenTreasure] = {
            ...treasure,
            foundAt: gameState.dayLocations[gameState.currentLocation].name,
            foundDay: gameState.currentDay
        };
        gameState.totalTreasures++;
        gameState.heartPoints += 3; // 隠し宝物はボーナスポイント
        gameState.diaryEntries.push(`🎁 隠し宝物「${treasure.name}」を発見しました！`);
        
        // 隠し宝物発見演出
        setTimeout(() => {
            showTreasurePopup(treasure);
        }, 1000);
    }

    document.getElementById('heart-points').textContent = gameState.heartPoints;
    updateTreasureCount();
    document.getElementById('story-text').innerHTML = story;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    const continueBtn = document.createElement('button');
    continueBtn.className = 'choice-btn';
    continueBtn.textContent = '次へ進む';
    continueBtn.onclick = () => {
        gameState.currentLocation++;
        updateProgress();
        showLocation();
    };
    choicesDiv.appendChild(continueBtn);
}

function updateProgress() {
    const percent = (gameState.currentLocation / (gameState.dayLocations.length - 1)) * 100;
    document.getElementById('progress-fill').style.width = percent + '%';
}

function updateTreasureCount() {
    document.getElementById('treasure-count').textContent = gameState.totalTreasures;
}

function showDiary() {
    document.querySelector('.game-screen').style.display = 'none';
    document.getElementById('diary-screen').style.display = 'block';

    const diaryContent = document.getElementById('diary-content');
    diaryContent.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'diary-entry';
    summary.innerHTML = `
        <strong>📊 ${gameState.currentDay}日目のまとめ</strong><br>
        こころポイント: ${gameState.heartPoints}💖<br>
        発見した宝物: ${gameState.totalTreasures}個🎁<br>
        出会った人・もの: ${gameState.diaryEntries.length}個<br><br>
        <strong>💭 感想</strong><br>
        ${getDiaryMessage()}
    `;
    diaryContent.appendChild(summary);

    gameState.diaryEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'diary-entry';
        div.innerHTML = entry;
        diaryContent.appendChild(div);
    });
}

function showTreasureCollection() {
    document.getElementById('diary-screen').style.display = 'none';
    document.getElementById('treasure-collection').style.display = 'block';

    const collectionGrid = document.getElementById('collection-grid');
    collectionGrid.innerHTML = '';

    // 全ての宝物を表示（発見済みと未発見）
    Object.keys(treasureData).forEach(treasureId => {
        const treasure = treasureData[treasureId];
        const found = gameState.treasures[treasureId];
        
        const item = document.createElement('div');
        item.className = `treasure-item ${found ? '' : 'undiscovered'}`;
        
        const icon = document.createElement('div');
        icon.className = 'treasure-item-icon';
        icon.textContent = found ? treasure.icon : '❓';
        
        const name = document.createElement('div');
        name.className = 'treasure-item-name';
        name.textContent = found ? treasure.name : '？？？';
        
        const description = document.createElement('div');
        description.className = 'treasure-item-count';
        description.textContent = found ? `発見場所: ${found.foundAt}` : '未発見';
        
        item.appendChild(icon);
        item.appendChild(name);
        item.appendChild(description);
        collectionGrid.appendChild(item);
    });
}

function backToDiary() {
    document.getElementById('treasure-collection').style.display = 'none';
    document.getElementById('diary-screen').style.display = 'block';
}

function getDiaryMessage() {
    const totalScore = gameState.heartPoints + (gameState.totalTreasures * 2);
    
    if (totalScore >= 25) {
        return "今日は本当に素晴らしい散歩でした！たくさんの宝物と出会いがあって、心がとても豊かになりました。君は立派な宝物ハンターです！";
    } else if (totalScore >= 20) {
        return "とても楽しい散歩でした！宝物もたくさん見つけて、いろんな人と出会えて素晴らしい一日でした。";
    } else if (totalScore >= 15) {
        return "楽しい散歩でした。いくつかの宝物と素敵な出会いがあって、心が温かくなりました。";
    } else {
        return "今日も散歩を楽しめました。小さな発見も、大切な宝物になりますね。";
    }
}

function restartGame() {
    gameState = {
        currentDay: 1,
        currentLocation: 0,
        heartPoints: 0,
        diaryEntries: [],
        allDiary: [],
        dayLocations: [],
        metCharacters: {},
        treasures: {},
        totalTreasures: 0
    };

    document.getElementById('heart-points').textContent = '0';
    document.getElementById('treasure-count').textContent = '0';
    document.getElementById('progress-fill').style.width = '0%';

    document.querySelector('.game-screen').style.display = 'block';
    document.getElementById('diary-screen').style.display = 'none';
    document.getElementById('treasure-collection').style.display = 'none';

    startWalk();
}

window.addEventListener('load', () => {
    startWalk();
});