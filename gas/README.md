# GAS モックビューア

Google Apps Script 上で複数のHTMLモックを管理・表示するシステム。

## 構成

```
gas/
├── src/
│   └── Code.ts          # メインロジック（TypeScript）
├── html/
│   ├── index.html       # モック一覧ポータル
│   └── pdf_organizer.html  # PDF整理モック
├── dist/                # ビルド出力（clasp push対象）
├── package.json
├── tsconfig.json
├── build.mjs            # ビルドスクリプト
└── appsscript.json      # GASマニフェスト
```

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. GASプロジェクトの作成

```bash
# Googleアカウントでログイン（初回のみ）
npx clasp login

# 新規プロジェクトを作成
npx clasp create --type webapp --title "モックビューア"

# .clasp.json の rootDir を dist に変更
```

`.clasp.json` を編集:
```json
{
  "scriptId": "xxxxx",
  "rootDir": "dist"
}
```

### 3. ビルド＆プッシュ

```bash
npm run push
```

### 4. Webアプリとしてデプロイ

```bash
npm run deploy
```

または、GASエディタ上から「デプロイ」→「新しいデプロイ」で設定。

## npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run build` | TypeScriptをコンパイルしてdistに出力 |
| `npm run push` | ビルド後にGASへプッシュ |
| `npm run deploy` | ビルド→プッシュ→既存デプロイ更新（URLを維持）★通常はこれ |
| `npm run deploy:new` | 新規デプロイ作成（URLが変わる） |
| `npm run open` | GASエディタを開く |
| `npm run logs` | GASのログを表示 |

---

## 新しいモックを追加する方法

### 手順

#### 1. HTMLファイルを作成

`html/` ディレクトリに新しいHTMLファイルを作成します。

```bash
# 例: スプレッドシート連携モック
touch html/spreadsheet_tool.html
```

#### 2. Code.ts にモック情報を登録

`src/Code.ts` の2箇所を編集:

**getMockList() に追加:**

```typescript
function getMockList(): MockInfo[] {
  return [
    {
      id: 'pdf_organizer',
      title: 'PDF整理ツール',
      description: 'Google Drive風UIでPDFのページ結合・回転・削除・並び替えを行うモック',
      icon: 'PDF',
      color: '#d93025',
      status: '完成',
    },
    // ↓ここに追加
    {
      id: 'spreadsheet_tool',        // HTMLファイル名（拡張子なし）
      title: 'スプレッドシート連携',   // カードに表示されるタイトル
      description: 'スプレッドシートとの連携UIモック',
      icon: 'XLS',                   // アイコンテキスト
      color: '#188038',              // アイコン背景色
      status: '作成中',               // ステータスバッジ
    },
  ];
}
```

**getPageTitle() に追加:**

```typescript
function getPageTitle(page: string): string {
  const titles: Record<string, string> = {
    index: 'モック一覧',
    pdf_organizer: 'PDF整理ツール（Drive風モック）',
    spreadsheet_tool: 'スプレッドシート連携（モック）',  // ←追加
  };
  return titles[page] || 'モック';
}
```

#### 4. ビルド＆デプロイ

```bash
npm run push
```

### MockInfo の各プロパティ

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `id` | HTMLファイル名（拡張子なし）。URLパラメータに使用 | `'spreadsheet_tool'` |
| `title` | 一覧画面のカードに表示されるタイトル | `'スプレッドシート連携'` |
| `description` | カードに表示される説明文 | `'スプレッドシートとの連携UIモック'` |
| `icon` | アイコン内のテキスト（2-4文字程度） | `'XLS'`, `'PDF'`, `'DOC'` |
| `color` | アイコンの背景色（HEX） | `'#188038'` |
| `status` | ステータスバッジのテキスト | `'完成'`, `'作成中'`, `'レビュー中'` |

### 推奨アイコンカラー

| 種類 | カラー |
|------|--------|
| PDF | `#d93025` |
| スプレッドシート/Excel | `#188038` |
| ドキュメント/Word | `#1a73e8` |
| スライド/PowerPoint | `#f29900` |
| フォーム | `#673ab7` |

---

## トラブルシューティング

### clasp push でエラーが出る

```bash
# ログイン状態を確認
npx clasp login --status

# 再ログイン
npx clasp login
```

### ビルドエラー

```bash
# node_modules を再インストール
rm -rf node_modules
npm install
```

### デプロイ後にアクセスできない

1. GASエディタを開く: `npm run open`
2. 「デプロイ」→「デプロイを管理」
3. アクセス権限が「ドメイン内のすべてのユーザー」になっているか確認
