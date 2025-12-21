* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    font-family: 'Arial', 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
}

/* ===== スタート画面 ===== */
.start-screen {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.start-screen.active {
    display: flex;
}

.start-container {
    text-align: center;
    max-width: 90%;
    animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.start-title {
    font-size: 2.5em;
    color: white;
    font-weight: bold;
    margin-bottom: 20px;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
}

.start-content {
    background: white;
    border-radius: 20px;
    padding: 30px 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.game-icon {
    font-size: 4em;
    margin-bottom: 15px;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.start-content h2 {
    font-size: 1.8em;
    color: #333;
    margin-bottom: 10px;
}

.start-content p {
    font-size: 1em;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.5;
}

.game-description {
    font-size: 1.1em;
    color: #764ba2;
    font-weight: bold;
    margin-top: 15px;
}

.btn-start {
    background: linear-gradient(135deg, #FF6B9D 0%, #FF1654 100%);
    color: white;
    border: none;
    padding: 18px 40px;
    font-size: 1.3em;
    font-weight: bold;
    border-radius: 12px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(255, 22, 84, 0.4);
}

.btn-start:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(255, 22, 84, 0.6);
}

.btn-start:active {
    transform: scale(0.98);
}

.start-info {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 12px;
    color: white;
    font-size: 0.9em;
}

.start-info p {
    margin: 4px 0;
    color: white;
}

/* ===== ゲーム画面 ===== */
.game-screen {
    display: none;
    width: 100vw;
    height: 100vh;
}

.game-screen.active {
    display: flex;
}

.game-container {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* ===== ヘッダー（ステータス） ===== */
.game-header {
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 12px;
    backdrop-filter: blur(10px);
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 10px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    font-size: 0.9em;
    min-width: fit-content;
}

.status-icon {
    font-size: 1.1em;
}

.sound-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s;
}

.sound-btn:hover {
    background: rgba(255, 255, 255, 0.4);
}

/* ===== メイン画面 ===== */
.game-main {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
}

.phase-container {
    display: none;
    flex: 1;
    overflow-y: auto;
}

.phase-container.active {
    display: flex;
    flex-direction: column;
}

.phase-title {
    text-align: center;
    color: white;
    font-size: 1.4em;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.message-display {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    min-height: 30px;
    margin-bottom: 8px;
    text-align: center;
    font-size: 0.9em;
    word-wrap: break-word;
}

/* ===== カード類 ===== */
.seller-card {
    display: flex;
    gap: 10px;
    background: white;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
    align-items: center;
}

.seller-portrait {
    font-size: 2.5em;
    min-width: 60px;
    text-align: center;
}

.seller-info h3 {
    color: #333;
    font-size: 1em;
    margin-bottom: 4px;
}

.seller-story {
    color: #666;
    font-size: 0.85em;
    line-height: 1.3;
}

.item-card {
    background: white;
    border-radius: 10px;
    padding: 15px;
    text-align: center;
    margin-bottom: 10px;
}

.item-emoji {
    font-size: 2.5em;
    margin-bottom: 8px;
}

.item-card h4 {
    color: #333;
    font-size: 0.95em;
    margin-bottom: 6px;
}

.offer-price {
    color: #FF6B6B;
    font-weight: bold;
    font-size: 1em;
}

.customer-card {
    display: flex;
    gap: 10px;
    background: white;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
    align-items: center;
}

.customer-portrait {
    font-size: 2.5em;
    min-width: 60px;
    text-align: center;
}

.customer-info h3 {
    color: #333;
    font-size: 1em;
    margin-bottom: 4px;
}

#customer-need {
    color: #666;
    font-size: 0.85em;
    line-height: 1.3;
}

/* ===== フォーム ===== */
.label-text {
    display: block;
    color: white;
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9em;
}

.radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: white;
    font-size: 0.85em;
    transition: all 0.3s;
}

.radio-label:hover {
    background: rgba(255, 255, 255, 0.3);
}

.radio-label input {
    cursor: pointer;
}

.radio-label span {
    flex: 1;
}

.negotiation-group {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
}

/* ===== ボタン ===== */
.button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
}

.btn {
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.95em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
}

.btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-secondary {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: white;
}

.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-secondary:active {
    transform: translateY(0);
}

.btn-next {
    width: 100%;
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    color: white;
}

.btn-next:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.btn-next:active {
    transform: translateY(0);
}

/* ===== 陳列モード ===== */
.display-mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
}

.display-mode-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid transparent;
    color: white;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8em;
    transition: all 0.3s;
}

.display-mode-btn.active {
    background: rgba(255, 255, 255, 0.4);
    border-color: white;
}

.display-mode-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* ===== インベントリ・ショップ表示 ===== */
.inventory-display,
.shop-display,
.shop-preview {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    flex: 1;
    overflow-y: auto;
}

.inventory-display h3,
.shop-display h3,
.shop-preview h3 {
    color: white;
    font-size: 0.9em;
    margin-bottom: 8px;
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 6px;
}

.shop-item {
    background: white;
    border-radius: 6px;
    padding: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.shop-item:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.item-emoji {
    font-size: 1.8em;
    margin-bottom: 4px;
}

.item-name {
    font-size: 0.75em;
    color: #333;
    font-weight: bold;
    line-height: 1.2;
}

.item-price {
    font-size: 0.8em;
    color: #FF6B6B;
    font-weight: bold;
    margin-top: 4px;
}

/* ===== 結果表示 ===== */
.result-summary {
    background: white;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
}

.result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
    font-size: 0.9em;
}

.result-item:last-child {
    border-bottom: none;
}

.result-item.highlight {
    background: #FFF9E6;
    border-radius: 6px;
    border-bottom: none;
    font-weight: bold;
}

.result-label {
    color: #333;
    font-weight: bold;
}

.result-value {
    color: #FF6B6B;
    font-weight: bold;
    font-size: 1.1em;
}

.news-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    color: white;
    flex: 1;
    overflow-y: auto;
}

.news-section h3 {
    font-size: 0.9em;
    margin-bottom: 6px;
}

.news-section p {
    font-size: 0.85em;
    line-height: 1.4;
}

/* ===== フッター ===== */
.game-footer {
    background: rgba(0, 0, 0, 0.3);
    padding: 6px;
    text-align: center;
    color: white;
    font-size: 0.8em;
}

.game-footer p {
    margin: 0;
}

/* ===== モーダル ===== */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal.show {
    display: flex;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    max-width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-content h2 {
    color: #333;
    margin-bottom: 12px;
    font-size: 1.3em;
}

.modal-content p {
    color: #666;
    margin-bottom: 10px;
    line-height: 1.4;
}

.clear-stats {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    text-align: left;
}

.clear-stats p {
    margin: 6px 0;
    font-size: 0.9em;
}

.highscore-list {
    max-height: 300px;
    overflow-y: auto;
}

.highscore-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    border-bottom: 1px solid #eee;
    font-size: 0.85em;
}

.highscore-item:last-child {
    border-bottom: none;
}

.highscore-rank {
    font-weight: bold;
    color: #FF6B6B;
    min-width: 30px;
}

.highscore-name {
    flex: 1;
    text-align: left;
    color: #333;
}

.highscore-score {
    color: #4CAF50;
    font-weight: bold;
}

/* ===== スマホ対応 ===== */
@media (max-width: 600px) {
    .start-title {
        font-size: 1.8em;
        margin-bottom: 15px;
    }

    .start-content {
        padding: 20px 15px;
        margin-bottom: 15px;
    }

    .game-icon {
        font-size: 3em;
    }

    .start-content h2 {
        font-size: 1.4em;
    }

    .start-content p {
        font-size: 0.9em;
    }

    .game-description {
        font-size: 1em;
    }

    .btn-start {
        padding: 14px 30px;
        font-size: 1.1em;
    }

    .status-item {
        font-size: 0.8em;
        padding: 4px 8px;
    }

    .phase-title {
        font-size: 1.2em;
        margin-bottom: 8px;
    }

    .seller-card,
    .customer-card {
        padding: 10px;
        gap: 8px;
    }

    .seller-portrait,
    .customer-portrait {
        font-size: 2em;
        min-width: 50px;
    }

    .item-card {
        padding: 10px;
    }

    .item-emoji {
        font-size: 2em;
    }

    .radio-group {
        grid-template-columns: 1fr;
    }

    .display-mode-buttons {
        grid-template-columns: 1fr 1fr;
    }

    .items-grid {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    }

    .btn {
        padding: 10px 12px;
        font-size: 0.9em;
    }

    .message-display {
        font-size: 0.8em;
        min-height: 25px;
        padding: 6px;
    }

    .modal-content {
        padding: 16px;
    }

    .modal-content h2 {
        font-size: 1.1em;
    }
}

/* ===== スクロール時の最適化 ===== */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
