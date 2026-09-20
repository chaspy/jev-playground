// https://docs.typesafe.ai/models — checked 2026-09-20
export function estimateCost(response) {
  const tokens = response?.usage?.input_tokens;
  if (response?.model !== 'jev-1.13.0' || !Number.isInteger(tokens) || tokens < 0) return null;
  return { usd: tokens * 0.042 / 1_000_000, inputUsdPerMillion: 0.042,
    outputUsdPerMillion: 0, checkedAt: '2026-09-20', source: 'https://docs.typesafe.ai/models' };
}
