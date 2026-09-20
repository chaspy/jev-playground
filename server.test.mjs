import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('local server validates requests and never serves secrets', async (t) => {
  const port = 14321;
  const server = spawn(process.execPath, ['server.mjs'], {
    env: { ...process.env, PORT: String(port), TYPESAFE_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => server.kill());
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(() => { throw new Error('Server exited before startup'); })
  ]);
  const base = `http://127.0.0.1:${port}`;
  const post = (body, headers = {}) => fetch(`${base}/api/evaluate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body
  });
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Jev Playground/);
  assert.ok(page.headers.get('content-security-policy'));
  for (const path of ['/.env', '/server.mjs', '/.git/config']) {
    assert.equal((await fetch(base + path)).status, 404);
  }
  assert.equal((await post('{')).status, 400);
  assert.equal((await post('null')).status, 400);
  assert.equal((await post('{"message":" "}')).status, 400);
  assert.equal((await post(JSON.stringify({ message: 'a'.repeat(5001) }))).status, 400);
  assert.equal((await post('{}', { Origin: 'https://example.com' })).status, 403);
  assert.equal((await post('{}', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post('{"message":"hello"}')).status, 503);
});
