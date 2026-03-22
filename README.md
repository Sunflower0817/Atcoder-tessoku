# Dormitory-food

Google Calendar を正本として、社員寮の M-D meal サイトに朝食/夕食設定を自動反映するための Node.js + TypeScript + Playwright プロジェクトです。

## アーキテクチャ
1. **Google Calendar 取得層**: `src/google/calendarClient.ts`
2. **Agent 意思決定層**: `src/planners/agentPlanner.ts`
3. **M-D meal 実行層**: `src/mdmeal/mdmealBot.ts`

変化しやすい UI 依存部分は以下に分離しています。
- `src/mdmeal/selectors.ts`
- `src/mdmeal/parser.ts`
- `src/mdmeal/dateUtils.ts`

## セットアップ
```bash
npm install
npx playwright install chromium
cp .env.example .env
```

## env 一覧
`.env.example` を参照してください。主な項目:
- Google Calendar OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`
- M-D meal: `MDMEAL_BASE_URL`, `MDMEAL_LOGIN_URL`, `MDMEAL_ORDER_URL`, `MDMEAL_USERNAME`, `MDMEAL_PASSWORD`, `MDMEAL_STORAGE_STATE`
- Agent: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, `OPENAI_TEMPERATURE`, `PLANNER_MODE`
- バッチ制御: `BATCH_DAYS_AHEAD`, `TZ`

## Playwright 導入
```bash
npx playwright install chromium
```
GitHub Actions でも Chromium を導入します。

## auth 手順
初回ログインで storageState を保存します。
```bash
npm run auth
```
保存先は `MDMEAL_STORAGE_STATE` です。ログインフォームの DOM が変わった場合は `src/mdmeal/selectors.ts` を更新してください。

## CLI 使用方法
### 手動実行
```bash
npm run meal -- --date YYYY-MM-DD --meal breakfast|dinner --action eat|skip
```

### 自動実行
```bash
npm run auto -- --date YYYY-MM-DD
```

### dry-run
```bash
npm run auto -- --date YYYY-MM-DD --dry-run
```

### バッチ実行
```bash
npm run batch
```
`BATCH_DAYS_AHEAD` の日数だけ当日以降を順に処理します。

## GitHub Actions 設定
`.github/workflows/nightly.yml` は **毎日 15:00 UTC = 翌日 00:00 JST** に実行されます。`workflow_dispatch` にも対応しています。

必要な Secrets:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `MDMEAL_BASE_URL`
- `MDMEAL_LOGIN_URL`
- `MDMEAL_ORDER_URL`
- `MDMEAL_USERNAME`
- `MDMEAL_PASSWORD`
- `OPENAI_API_KEY`

任意の Variables:
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`

## 保守ポイント
- M-D meal の DOM 変更時は `src/mdmeal/selectors.ts` と `src/mdmeal/parser.ts` を優先して直す
- 3 営業日前ルールは `src/mdmeal/dateUtils.ts` に閉じ込める
- planner のプロンプトとフォールバックルールは `src/planners/agentPlanner.ts` に集約する
- 最終的な変更可否は常に画面状態を優先する
- `docs/mdmeal-maintenance.md` と `docs/planner-rules.md` を更新して保守知識をコード外にも残す

## 設計メモ
- Agent は JSON のみ返す前提
- `reason` は配列、`confidence` を保持
- dry-run でも planner と parser は通しで動く
- TimeTree 連携はこのリポジトリに含めない

## TODO
- M-D meal 本番 DOM に合わせてセレクタを確定する
- 注文確認画面の実 UI に合わせて confirm/commit を調整する
- 実運用の祝日カレンダーが必要なら `dateUtils.ts` に追加する
