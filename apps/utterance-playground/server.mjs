import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { appendApiLog } from './api-log.mjs';
import { estimateCost } from './cost.mjs';

const port = Number(process.env.PORT || 4321);
const origin = `http://localhost:${port}`;
const files = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
const questions = {
  sarcasm: { type: 'noul', instructions: 'message は皮肉を含んでいますか？' },
  intent: { type: 'choice', instructions: 'message の主な意図を一つ選んでください。', criteria: {
    '質問': '情報や説明を求めている', '依頼': '何らかの行動を求めている',
    '感謝': '感謝や称賛を伝えている', '不満': '不満や批判を伝えている', 'その他': '上記に該当しない'
  } }
};
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
createServer(async (req, res) => {
  try {
    if (![ `localhost:${port}`, `127.0.0.1:${port}` ].includes(req.headers.host)) return json(res, 403, { error: '許可されていないホストです。' });
    if (req.method === 'GET' && files[req.url]) {
      const [name, type] = files[req.url];
      const body = await readFile(new URL(`./public/${name}`, import.meta.url));
      res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'none'" });
      return res.end(body);
    }
    if (req.url !== '/api/evaluate' || req.method !== 'POST') return json(res, 404, { error: '見つかりません。' });
    if (req.headers.origin && ![origin, `http://127.0.0.1:${port}`].includes(req.headers.origin)) return json(res, 403, { error: '許可されていないアクセスです。' });
    if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'JSON を送信してください。' });
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 64000) return json(res, 413, { error: '入力が長すぎます。' });
    }
    let input;
    try { input = JSON.parse(body); } catch { return json(res, 400, { error: 'JSON が不正です。' }); }
    if (!input || typeof input.message !== 'string' || !input.message.trim() || input.message.length > 5000) return json(res, 400, { error: '文章は1〜5000文字で入力してください。' });
    if (!process.env.TYPESAFE_API_KEY) return json(res, 503, { error: '.env に TYPESAFE_API_KEY を設定してください。' });
    const request = { model: 'jev-latest', state: { message: input.message }, questions };
    const log = { id: randomUUID(), timestamp: new Date().toISOString(), method: 'POST',
      url: 'https://api.typesafe.ai/v1/systemone', request };
    const start = performance.now();
    let upstream;
    let result;
    try {
      upstream = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(60000)
      });
      log.status = upstream.status;
      const raw = await upstream.text();
      try { result = JSON.parse(raw); } catch { result = raw; }
      log.response = result;
      log.cost = upstream.ok ? estimateCost(result) : null;
    } catch (error) {
      log.error = error.name === 'TimeoutError' ? 'timeout' : 'connection_error';
      throw error;
    } finally {
      log.elapsedMs = Math.round(performance.now() - start);
      try { await appendApiLog(log); } catch {
        console.error('Failed to write logs/api.jsonl');
        return json(res, 500, { error: 'API のローカルログを保存できませんでした。logs ディレクトリの書き込み権限を確認してください。' });
      }
    }
    if (!upstream.ok) return json(res, 502, { error: `TypeSafe API がエラーを返しました（HTTP ${upstream.status}）。キー・利用制限・サービス状況を確認してください。` });
    return json(res, 200, { request, response: result, elapsedMs: log.elapsedMs, cost: log.cost });
  } catch (error) {
    return json(res, 502, { error: error.name === 'TimeoutError' ? '60秒でタイムアウトしました。' : '通信または処理に失敗しました。' });
  }
}).listen(port, '127.0.0.1', () => console.log(`Jev Playground: ${origin}`));
