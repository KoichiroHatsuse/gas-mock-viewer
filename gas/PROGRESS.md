# GASモックビューア 進捗記録

## 完了した作業

### 1. プロジェクト構成の作成
- TypeScript + tsc ベースのモダン構成
- Clasp によるデプロイ管理

### 2. 作成したファイル
```
gas/
├── .clasp.json          # Clasp設定（scriptId, rootDir: dist）
├── .gitignore
├── README.md            # 使い方・新規モック追加手順
├── PROGRESS.md          # この進捗記録
├── appsscript.json      # GASマニフェスト（DOMAIN限定）
├── build.mjs            # ビルドスクリプト（tsc + ファイルコピー）
├── package.json
├── tsconfig.json
├── src/
│   └── Code.ts          # メインロジック（TypeScript）
├── html/
│   ├── index.html       # モック一覧ポータル
│   ├── pdf_organizer.html  # PDF整理モック（旧 drive_pdf.html）
│   └── test.html        # テスト用ページ
└── dist/                # ビルド出力
```

### 3. デプロイ情報
- **GASプロジェクト:** https://script.google.com/d/1owbg_oNTTTGvf-s7IStzSOUWLEV7DScQ0qXGRmtxe7fbaLMQYd9yg6bW/edit
- **最新デプロイURL (v15):** https://script.google.com/macros/s/AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL/exec
- **テストページ:** 上記URL + `?page=test`
- **PDF整理ツール:** 上記URL + `?page=pdf_organizer`

### 4. 設定
- アクセス権限: `DOMAIN`（会社ドメイン限定）
- リンクに `target="_top"` を追加済み（iframe対策）

---

## 解決した問題

### ページ遷移で白画面になる問題【解決】
- **原因1:** デプロイバージョンが古かった。`clasp push`後に新しいデプロイを作成していなかった。
- **原因2:** 相対URL(`?page=xxx`)を使っていたため、iframe内のURLに遷移してしまっていた。
- **解決方法:**
  1. `npm run build && npx clasp push --force` でコードをプッシュ
  2. `npx clasp deploy --description "説明"` で新しいデプロイを作成
  3. `ScriptApp.getService().getUrl()` で取得した絶対URLを使うように修正
- **補足:**
  - GASではpush後も既存のデプロイは古いバージョンを参照し続ける
  - GAS WebアプリはGoogleのiframe（`googleusercontent.com`）内で実行される
  - ナビゲーションには `getWebAppUrl()` で取得した絶対URLを使う必要がある

---

## 最新デプロイ情報

| バージョン | デプロイID | 説明 |
|-----------|-----------|------|
| v15 (最新) | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Remove duplicate status badge from cards |
| v14 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Categorize mocks by status (検討中/確定/不要) |
| v13 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Show original page numbers after drag & drop reorder |
| v12 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Improve drag & drop UX with visual feedback |
| v11 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Add split/grid layout variants |
| v10 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Add close tab button after save |
| v9 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Add createdAt to mock cards |
| v8 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Remove unused Header.html |
| v7 | AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL | Use absolute URLs for navigation |
| v6 | AKfycbzC5Y-ICbwjLWdQbs7b5qx_ct4mYiTyXdh_Fe7marFErC_K8T3iaCpOTzsPCXy2uN-I | Fix page navigation |
| v5 | AKfycbzYwe6m2oHsV2UnwsFgTEUl9VfxkN-mnoYkC9Uw1COSq7sq8nqI5ANpHQ12SUSNnDW_ | Add test page |

**最新デプロイURL:**
https://script.google.com/macros/s/AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL/exec

---

## コマンドメモ

```bash
# ビルド＆プッシュ
cd c:\data\mock\gas
npm run build && npx clasp push --force

# デプロイ
npx clasp deploy --description "説明"

# GASエディタを開く
npx clasp open

# ログ確認（要GCPプロジェクト設定）
npx clasp logs
```

---

## 2025-12-20 セッション記録

### 完了した作業

1. **要件とモックの整合性確認**
   - specs/pdf_organizer.md と HTML モックを比較
   - 主要機能は実装済み、軽微な差異のみ（許容）

2. **モック一覧のカテゴリ分け（v14, v15）**
   - 検討中 / 確定 / 不要 の3カテゴリで表示
   - 不要なものは薄く表示して下部に配置
   - 重複していたステータスバッジを削除

3. **GitHub リポジトリ作成**
   - https://github.com/KoichiroHatsuse/gas-mock-viewer
   - README.md 追加済み

4. **Backlog スキル作成**
   - 場所: `~/.claude/skills/backlog/SKILL.md`
   - 機能: 課題一覧、課題作成、コメント追加、ステータス更新など

### 保留中（再起動後に確認）

1. **Backlog APIキー設定**
   - ファイル: `~/.claude/settings.json`
   - `"BACKLOG_API_KEY": "ここにAPIキーを入力"` を実際のキーに置き換え
   - APIキー発行: https://iyell.backlog.com/EditApiSettings.action
   - 設定後「Backlogのプロジェクト一覧を見せて」で動作確認

---

## 次にやること

1. Backlog APIキーを設定して動作確認
2. PDF整理ツール（split/grid）のどちらを採用するか決定
3. 新しいモックの追加
