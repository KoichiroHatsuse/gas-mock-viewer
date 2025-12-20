import { execSync } from 'child_process';
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

// distディレクトリを作成
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

// TypeScriptをコンパイル（tsc使用）
console.log('Compiling TypeScript...');
execSync('npx tsc --outDir dist --declaration false', { stdio: 'inherit' });

// GAS向けにCode.jsを調整（export文を削除）
const codeJs = readFileSync('dist/Code.js', 'utf-8');
const gasCode = codeJs
  .replace(/^export \{[^}]*\};?\s*$/gm, '')  // export {} を削除
  .replace(/^export /gm, '');                 // export キーワードを削除
writeFileSync('dist/Code.js', gasCode);

// HTMLファイルとappsscript.jsonをコピー
cpSync('html', 'dist', { recursive: true });
cpSync('appsscript.json', 'dist/appsscript.json');

console.log('Build completed successfully!');
