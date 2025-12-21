# スプライトアニメーション設定ガイド

## 概要
このゲームでは、スプライトシートから各コマを切り出して歩行アニメーションを表示します。

## スプライトシートの構造

一般的な16-bit RPGの歩行アニメーションは以下のような構造です：

```
[フレーム1] [フレーム2] [フレーム3] [フレーム4]
```

または、複数行の場合：

```
[フレーム1] [フレーム2] [フレーム3] [フレーム4]
[フレーム5] [フレーム6] [フレーム7] [フレーム8]
```

## 設定パラメータ

`index.html` の `Game` クラスのコンストラクタ内で以下のパラメータを調整できます：

```javascript
this.spriteWidth = 32;      // 1フレームの幅（ピクセル）
this.spriteHeight = 32;     // 1フレームの高さ（ピクセル）
this.framesPerRow = 4;      // 1行あたりのフレーム数
this.totalFrames = 4;       // 歩行アニメーションの総フレーム数
this.animationSpeed = 150;  // アニメーション速度（ミリ秒、小さいほど速い）
```

## 設定例

### 例1: 32x32ピクセル、4フレーム横並び
```javascript
this.spriteWidth = 32;
this.spriteHeight = 32;
this.framesPerRow = 4;
this.totalFrames = 4;
```

### 例2: 64x64ピクセル、4フレーム横並び
```javascript
this.spriteWidth = 64;
this.spriteHeight = 64;
this.framesPerRow = 4;
this.totalFrames = 4;
```

### 例3: 32x32ピクセル、8フレーム（2行×4列）
```javascript
this.spriteWidth = 32;
this.spriteHeight = 32;
this.framesPerRow = 4;
this.totalFrames = 8;  // 2行分
```

## 画像ファイル名

デフォルトでは以下のファイル名を読み込みます：
- `Gemini_Generated_Image_gohg6ogohg6ogohg.png`

ファイル名を変更する場合は、`loadSpriteSheet()` メソッド内の以下を変更してください：

```javascript
img.src = 'あなたの画像ファイル名.png';
```

## トラブルシューティング

### アニメーションが表示されない
1. 画像ファイルが正しいパスに存在するか確認
2. ブラウザのコンソールでエラーを確認
3. `spriteWidth` と `spriteHeight` が画像の実際のサイズと一致しているか確認

### アニメーションがずれている
1. `framesPerRow` が正しいか確認
2. `totalFrames` が実際のフレーム数と一致しているか確認
3. スプライトシートの構造が想定通りか確認

### アニメーションが速すぎる/遅すぎる
- `animationSpeed` の値を調整（小さいほど速い、大きいほど遅い）

## 推奨設定

一般的な16-bit RPGスタイルの場合：
- **フレームサイズ**: 32x32 または 64x64
- **フレーム数**: 4フレーム（歩行アニメーション）
- **アニメーション速度**: 100-200ms

## 注意事項

- スプライトシートは横方向にフレームが並んでいることを想定しています
- 各フレームは同じサイズである必要があります
- 画像の読み込みに失敗した場合は、自動的に絵文字（👤）表示にフォールバックします

