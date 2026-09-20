import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateCost } from './cost.mjs';

test('cost charges input only and does not guess unknown model prices', () => {
  assert.equal(estimateCost({ model: 'jev-1.13.0', usage: { input_tokens: 1000000, output_tokens: 500 } }).usd, 0.042);
  assert.equal(estimateCost({ model: 'jev-1.13.0', usage: { input_tokens: 0 } }).usd, 0);
  assert.equal(estimateCost({ model: 'jev-future', usage: { input_tokens: 100 } }), null);
  assert.equal(estimateCost({ model: 'jev-1.13.0' }), null);
});
