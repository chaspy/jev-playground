import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { appendApiLog } from './api-log.mjs';

test('logs append JSON lines, preserve payloads and redact the API key', async (t) => {
  const path = await mkdtemp(join(tmpdir(), 'jev-log-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  const directory = pathToFileURL(`${path}/`);
  const apiKey = 'test-secret';
  await appendApiLog({ request: { message: '時計どすなあ\n次の行' }, response: { noul: 0.15 } }, { directory, apiKey });
  await appendApiLog({ status: 401, response: `echo ${apiKey}` }, { directory, apiKey });
  const raw = await readFile(join(path, 'api.jsonl'), 'utf8');
  const lines = raw.trim().split('\n').map(JSON.parse);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].request.message, '時計どすなあ\n次の行');
  assert.equal(lines[0].response.noul, 0.15);
  assert.equal(lines[1].response, 'echo [REDACTED]');
  assert.ok(!raw.includes(apiKey));
  assert.equal((await stat(join(path, 'api.jsonl'))).mode & 0o777, 0o600);
});
