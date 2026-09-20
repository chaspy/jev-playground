import { appendFile, mkdir } from 'node:fs/promises';

export async function appendApiLog(entry, {
  directory = new URL('./logs/', import.meta.url),
  apiKey = process.env.TYPESAFE_API_KEY
} = {}) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  let line = JSON.stringify(entry);
  if (apiKey) {
    const encodedKey = JSON.stringify(apiKey).slice(1, -1);
    line = line.replaceAll(encodedKey, '[REDACTED]');
  }
  await appendFile(new URL('api.jsonl', directory), `${line}\n`, { mode: 0o600 });
}
