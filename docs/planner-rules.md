# Planner rules

## Google Calendar 正本
このリポジトリでは Google Calendar を予定の正本とし、TimeTree 連携は含めません。予定取得は `src/google/calendarClient.ts`、意思決定は `src/planners/agentPlanner.ts` に分離しています。

## Agent とコードの責務分離
- Agent: 予定テキストと制約を見て `breakfast` / `dinner` の `eat|skip|unchanged` を返す
- コード: 締切・画面上の操作可否・M-D meal 実行・冪等性を担保する
- 最終判定は M-D meal の画面状態を優先する

## ルール詳細
- 朝食は基本 `skip`
- 土日は `breakfast` / `dinner` とも `skip`
- 平日の夕食は基本 `eat`
- `飲み会` `会食` `ディナー` `夕食` `懇親会` `食事` を含む予定があれば `dinner=skip`
- `出張` `帰省` `旅行` `不在` を含む予定があれば両方 `skip`
- 不明な場合は `unchanged`
- `constraints.deadlinePassed=true` または `operationAllowed=false` の場合は両方 `unchanged`

## 優先順位
1. 実画面の締切・休業・操作不可
2. 制約フラグ
3. 不在系キーワード
4. 夕食スキップ系キーワード
5. 平日/休日の基本ルール
6. 曖昧ケースは現状維持またはデフォルト維持

## 曖昧ケース
- 打ち合わせ、通院、外出など食事に直結しない予定は基本ルール維持
- 終日予定でも文言が曖昧なら強制変更しない
- Agent が不確実なら `unchanged` を返す

## TimeTree は別系統
TimeTree との同期や変換ロジックは別リポジトリ/別ワークフローで扱う前提です。
