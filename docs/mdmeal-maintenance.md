# M-D meal maintenance guide

## 画面遷移
1. ログイン画面
2. 注文トップ
3. 一覧画面
4. 対象日操作
5. 注文確認
6. 注文確定

`src/mdmeal/mdmealBot.ts` はこの遷移を 1 箇所に集約しています。画面構造が変わった場合は bot 本体ではなく `selectors.ts` と `parser.ts` の更新を優先してください。

## 表構造
- 1 行 = 1 日付
- 朝食状態セル
- 夕食状態セル
- 操作ボタン
- 締切/休業/操作不可フラグ

## 状態定義
- `eat`: 申込済み / 喫食
- `skip`: 停止 / 不要
- `unchanged`: 判定不能・不明
- 画面で `holiday`, `deadline`, `closed` のいずれかが見えたら変更不可扱い

## セレクタ修正手順
1. Playwright の trace または devtools で DOM を確認する。
2. `src/mdmeal/selectors.ts` の該当セレクタだけを差し替える。
3. `npm run auth` と `npm run auto -- --date YYYY-MM-DD --dry-run` で検証する。
4. 行が見つからない場合は `rowByDate()` の属性設計を実 DOM に合わせる。

## parser 修正手順
1. ステータス文言の揺れを採取する。
2. `src/mdmeal/parser.ts` の `normalizeStatus()` に文言を追加する。
3. 締切や休業の検出 UI が変わったらフラグセレクタと `editable` 条件を合わせて修正する。
4. 最終判定は常に画面の状態を優先する。

## テスト観点
- すでに `eat` の日に `eat` を指示しても変更しないこと
- 締切済み日は `unchanged` へ丸めること
- 土日が planner で skip になること
- 出張/旅行キーワードで朝夕とも skip になること
- 飲み会/会食キーワードで dinner のみ skip になること
- 3 営業日前ルールが期待通りに動くこと
