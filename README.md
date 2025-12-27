# GAS Mock Viewer

Google Apps Script (GAS) を使ったUI合意用モック管理システム

## 概要

社内ツール開発のUI検討用モックを管理・共有するためのWebアプリケーション。
Google Workspaceのドメイン内で利用可能。

## 構成

```
gas-mock-viewer/
├── README.md           # このファイル
├── CLAUDE.md           # Claude Code用ガイド
├── gas/                # GASプロジェクト
│   ├── src/            # TypeScriptソース
│   ├── html/           # HTMLモック
│   ├── dist/           # ビルド出力（git管理外）
│   └── PROGRESS.md     # 開発進捗
└── specs/              # 要件定義
    └── pdf_organizer.md
```

## デプロイURL

https://script.google.com/macros/s/AKfycbxtgajv4vQRCdTXc0OdCcRHHOpS2z4gR8CfpsAu1cRIVLCgUdvBjQAOxXdxy6wzsCqL/exec

## 現在のモック

| モック | 状態 | 説明 |
|--------|------|------|
| Googleドライブ期限付きリンク送信 | 検討中 | 案件フォルダからファイルを選択し、期限付き共有リンクをメール送信 |
| PDF整理ツール（2カラム） | 確定 | 左:ページ一覧、右:プレビュー |
| PDF整理ツール（グリッド） | 不要 | ページをグリッド表示 |
| PDF整理ツール（Drive風） | 不要 | 参考用として残存 |

## 開発

```bash
cd gas

# 依存インストール
npm install

# ビルド＆プッシュ
npm run build && npx clasp push --force

# デプロイ（URL維持）
npm run deploy

# 新規デプロイ（新URL発行）
npm run deploy:new
```

## 技術スタック

- Google Apps Script
- TypeScript
- Clasp (CLI for Apps Script)
