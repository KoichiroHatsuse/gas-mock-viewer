/**
 * モック表示システム - Google Apps Script
 * 複数のHTMLモックをポータルから選択して表示
 */

interface MockInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  createdAt: string;
}

/**
 * Webアプリとしてアクセスされた時のエントリポイント
 */
function doGet(
  e: GoogleAppsScript.Events.DoGet
): GoogleAppsScript.HTML.HtmlOutput {
  const page = e.parameter.page || 'index';

  try {
    const html = HtmlService.createTemplateFromFile(page);
    return html
      .evaluate()
      .setTitle(getPageTitle(page))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    Logger.log(`Page not found: ${page}, Error: ${(err as Error).message}`);
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('モック一覧')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

/**
 * ページタイトルを取得
 */
function getPageTitle(page: string): string {
  const titles: Record<string, string> = {
    index: 'モック一覧',
    pdf_organizer: 'PDF整理ツール（Drive風モック）',
    pdf_organizer_split: 'PDF整理ツール（2カラム版）',
    pdf_organizer_split_v2: 'PDF整理ツール（2カラム版・墨消し対応）',
    pdf_organizer_grid: 'PDF整理ツール（グリッド版）',
    drive_secure_sender: 'Googleドライブ期限付きリンク送信',
  };
  return titles[page] || 'モック';
}

/**
 * HTMLファイルをインクルードするためのヘルパー
 * 使用例: <?!= include('Header') ?>
 */
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 登録されているモック一覧を取得
 * Index.htmlでカード表示用に使用
 */
function getMockList(): MockInfo[] {
  // status: '検討中' | '確定' | '不要'
  // 表示順: 検討中 → 確定 → 不要
  return [
    // === 検討中（レビュー待ち） ===
    {
      id: 'pdf_organizer_split_v2',
      title: 'PDF整理ツール（2カラム・墨消し対応）',
      description: '2カラム版に墨消し機能を追加。ドラッグで範囲選択して黒塗り',
      icon: '■',
      color: '#1a1a1a',
      status: '検討中',
      createdAt: '2025-12-27',
    },
    {
      id: 'drive_secure_sender',
      title: 'Googleドライブ期限付きリンク送信',
      description: '案件フォルダからファイルを選択し、期限付き共有リンクをメール送信',
      icon: '📤',
      color: '#0969da',
      status: '検討中',
      createdAt: '2025-12-25',
    },
    // === 確定 ===
    {
      id: 'pdf_organizer_split',
      title: 'PDF整理ツール（2カラム）',
      description: '左:ページ一覧、右:プレビュー。シンプルで直感的',
      icon: 'PDF',
      color: '#0969da',
      status: '確定',
      createdAt: '2025-12-20',
    },
    // === 不要（参考用に残存） ===
    {
      id: 'pdf_organizer_grid',
      title: 'PDF整理ツール（グリッド）',
      description: 'ページをグリッド表示。全体を一覧できる',
      icon: 'OLD',
      color: '#656d76',
      status: '不要',
      createdAt: '2025-12-20',
    },
    {
      id: 'pdf_organizer',
      title: 'PDF整理ツール（Drive風）',
      description: 'Google Drive風3カラムUI。参考用として残存',
      icon: 'OLD',
      color: '#656d76',
      status: '不要',
      createdAt: '2025-12-20',
    },
  ];
}

/**
 * 現在のWebアプリURLを取得
 */
function getWebAppUrl(): string {
  return ScriptApp.getService().getUrl();
}

// esbuild.config.mjsのfooterでグローバル公開される
