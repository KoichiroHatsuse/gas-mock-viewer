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

interface AICheckResult {
  risk_level: 'low' | 'medium' | 'high';
  categories: string[];
  detected_expressions: string[];
  warning: string;
  alternatives: string[];
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
    chat_ai_checker: 'オペレーター説明AIチェック機構',
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
      id: 'chat_ai_checker',
      title: 'オペレーター説明AIチェック機構',
      description: 'チャット送信前にAIで不適切表現をチェック。言い換え案を提示',
      icon: '🤖',
      color: '#6366f1',
      status: '検討中',
      createdAt: '2026-01-08',
    },
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

/**
 * Gemini APIを使ってメッセージをチェック
 * PropertiesServiceからAPIキーを取得
 */
function checkMessageWithAI(message: string): AICheckResult {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません');
  }

  const prompt = `あなたは住宅ローン審査に関するオペレーターの発言をチェックするAIです。
以下のメッセージを分析し、不適切な表現がないかチェックしてください。

【チェック対象カテゴリ（5つ）】

■ ① 差別・属性主語（最重要・risk_level: high）
検知対象例:
- 「男性の単身者は住宅ローンに通りにくい」
- 「独身の方は厳しいです」
- 「女性の場合は将来を見られます」
- 「若い方だと難しいです」
- 「高齢だとほぼ通りません」
問題点: 属性（性別・年齢・家族構成）を主語にした一般論は差別と受け取られる。
言い換え方向: 主語を「人→銀行の判断軸」に変更。属性を消し、確認ポイント・対策に言及。
言い換え例:
- 「銀行は投資目的ではないかを重視するため、居住実態の説明が重要になります」
- 「審査では将来の住み方や返済計画を丁寧に確認される傾向があります」

■ ② 断定表現（risk_level: medium〜high）
検知対象例:
- 「通りません」「無理です」「ほぼ落ちます」
- 「絶対に厳しいです」「確実に難しいです」
問題点: 銀行審査は最終結果が出るまで確定しない。断定は期待値コントロール失敗につながる。
言い換え方向: 断定→傾向＋条件、結論→プロセス説明。
言い換え例:
- 「金融機関によって評価が分かれます」
- 「この点が審査で見られやすいポイントです」

■ ③ 投資・転用の決めつけ（risk_level: medium〜high）
検知対象例:
- 「投資用だと思われます」
- 「銀行に怪しまれるかもしれません」
- 「転用を疑われます」
問題点: 顧客を疑っている立場に立ってしまい、不信感・感情的対立を生む。
言い換え方向: 疑い→確認事項、主観→審査項目。
言い換え例:
- 「銀行は居住実態の確認を重視します」
- 「ここを明確にできると審査が進めやすくなります」

■ ④ 他行批判（risk_level: medium）
検知対象例:
- 「この銀行は厳しいです」
- 「融通がききません」
- 「銀行ってこうなんですよ」
問題点: 業界全体への不信感を与える。後で同じ銀行を提案しづらくなる。
言い換え方向: 批判→特徴説明、感情→基準説明。
言い換え例:
- 「この銀行は○○を特に重視する特徴があります」
- 「銀行ごとに評価ポイントが異なります」

■ ⑤ 金利・条件の言い切り（risk_level: medium）
検知対象例:
- 「一番いい金利が出ます」
- 「悪い条件になります」
- 「最低水準です」
問題点: 審査結果前の断定は条件変更時にクレーム化する。
言い換え方向: 確定→想定、結果→前提条件。
言い換え例:
- 「現時点ではこの水準が想定されます」
- 「最終的な条件は審査結果次第です」

【判定基準】
- high: ①差別・属性主語 に該当する場合、または②③で特に断定が強い場合
- medium: ②〜⑤に該当する場合
- low: 問題なし

【メッセージ】
${message}

【出力形式】
以下のJSON形式で回答してください。マークダウンのコードブロックは使わず、純粋なJSONのみを出力してください。
{
  "risk_level": "low" または "medium" または "high",
  "categories": ["検知されたカテゴリ名の配列（①差別・属性主語、②断定表現、③投資・転用の決めつけ、④他行批判、⑤金利・条件の言い切り）"],
  "detected_expressions": ["メッセージ内の問題のある表現をそのまま抜粋"],
  "warning": "注意喚起メッセージ（1文、なぜ問題かを簡潔に）",
  "alternatives": ["推奨される言い換え文（最大3件、上記の言い換え方向に従う）"]
}

問題がない場合は risk_level を "low" とし、categories と detected_expressions は空配列、warning は "問題は検知されませんでした"、alternatives も空配列としてください。`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    Logger.log(`Gemini API error: ${responseCode} - ${response.getContentText()}`);
    throw new Error(`API エラー: ${responseCode}`);
  }

  const json = JSON.parse(response.getContentText());
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('APIからの応答が空です');
  }

  // JSONを抽出（マークダウンのコードブロックを除去）
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const result: AICheckResult = JSON.parse(jsonText);
    return result;
  } catch (e) {
    Logger.log(`JSON parse error: ${e}, text: ${jsonText}`);
    throw new Error('APIの応答を解析できませんでした');
  }
}

// esbuild.config.mjsのfooterでグローバル公開される
