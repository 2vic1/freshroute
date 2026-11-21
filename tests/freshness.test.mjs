import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFreshness } from '../src/freshness.mjs';

const base = { data: { status: 'quoted', quote: {
  buyAmount: '790000',
  signature: '0xsig',
  encodedOrder: '0xorder',
  expiresAt: new Date(Date.now() + 30000).toISOString(),
} } };

test('fresh quote passes', () => {
  assert.equal(evaluateFreshness(base).valid, true);
});

test('no_quote triggers refund', () => {
  assert.equal(evaluateFreshness({ data: { status: 'no_quote', reason: 'no_makers_online' } }).reason, 'no_quote');
});

test('expired quote triggers refund', () => {
  const q = structuredClone(base);
  q.data.quote.expiresAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(evaluateFreshness(q).reason, 'expired');
});

test('empty buy amount triggers refund', () => {
  const q = structuredClone(base);
  q.data.quote.buyAmount = '0';
  assert.equal(evaluateFreshness(q).reason, 'empty_buy_amount');
});
