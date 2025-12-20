# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 基本方針

- 不明な点は積極的に質問する
- 質問する時は常にAskUserQuestionを使って回答させる
- **選択肢にはそれぞれ、推奨度と理由を提示する**
  - 推奨度は⭐の5段階評価

## プロジェクト概要

Google Apps Script モックビューア - 複数のUIモックを一覧ポータルから選択して表示するWebアプリ。TypeScriptで開発し、Google Apps Scriptにデプロイ。

## ビルド・デプロイコマンド

```bash
cd gas

# TypeScriptビルド + HTMLをdist/にコピー
npm run build

# ビルド後にGASへプッシュ（本番URLは更新されない）
npm run push

# 本番デプロイ（URLを維持したまま更新）★通常はこれを使う
npm run deploy

# 新規デプロイ作成（URLが変わる）
npm run deploy:new

# GASエディタをブラウザで開く
npm run open

# サーバーサイドログを表示
npm run logs
```

**重要:** `npm run push` はGASプロジェクトのコードを更新するだけ。本番URLに反映するには `npm run deploy` が必要。

## アーキテクチャ

### ルーティング

- `src/Code.ts` の `doGet(e)` が全リクエストを処理
- URLパラメータ `?page=<name>` で `html/<name>.html` を表示
- ページが見つからない場合は `index.html` にフォールバック

### 新規モック追加手順

1. `html/<mock_id>.html` を作成
2. `src/Code.ts` の2箇所を編集：
   - `getMockList()` 配列にエントリ追加
   - `getPageTitle()` にタイトルマッピング追加
3. デプロイ: `npm run deploy`

### ナビゲーションパターン

GAS WebアプリはGoogleのiframe内で実行される。必ず絶対URLを使用：

```javascript
// HTMLファイル内 - ベースURLを取得してリンク構築
google.script.run.withSuccessHandler(url => {
  link.href = url + '?page=mock_id';
}).getWebAppUrl();

// リンクにはtarget="_top"が必須（iframeから脱出）
<a href="..." target="_top">
```

### ビルドプロセス (build.mjs)

1. `src/Code.ts` を `dist/Code.js` にコンパイル
2. ES6の `export` キーワードを削除（GAS非互換のため）
3. `html/*.html` と `appsscript.json` を `dist/` にコピー

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `specs/<mock_id>.md` | 各モックの要件定義 |
| `gas/src/Code.ts` | バックエンド: ルーティング、モック登録、URLヘルパー |
| `gas/html/index.html` | モック一覧ポータルページ |
| `gas/html/<mock_id>.html` | 各モックページ（specsと対応） |
| `gas/PROGRESS.md` | デプロイ履歴と解決済み問題 |
| `gas/.clasp.json` | scriptIdと現在のdeploymentId |

## GAS固有の注意点

- アクセス制限: ドメインユーザーのみ（`appsscript.json` → `access: "DOMAIN"`）
- ランタイム: V8 JavaScriptエンジン
- 実行者: デプロイしたユーザーとして実行
- クライアント→サーバー通信: `google.script.run` を使用
