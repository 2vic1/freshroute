/* Freshness rule: a paid quote is valid only if it is firm, non-empty,
 * and settled before its accept deadline. Anything else triggers refund.
 */
export const RULE = {
  version: '1.0.0',
  description: 'Quote must be firm, non-empty, and settled before expiresAt.',
  refundOn: ['no_quote', 'empty_buy_amount', 'expired', 'missing_signature', 'missing_order'],
  refundAmount: '0.002',
};

export function evaluateFreshness(quoted, now = Date.now()) {
  const d = quoted?.data || {};
  const q = d.quote || {};

  if (d.status === 'no_quote') return { valid: false, reason: 'no_quote', rule: RULE.version };
  if (!q.buyAmount || BigInt(q.buyAmount || '0') === 0n) return { valid: false, reason: 'empty_buy_amount', rule: RULE.version };
  if (!q.signature || q.signature === '0x') return { valid: false, reason: 'missing_signature', rule: RULE.version };
  if (!q.encodedOrder || q.encodedOrder === '0x') return { valid: false, reason: 'missing_order', rule: RULE.version };

  const deadline = Date.parse(q.expiresAt || '');
  if (!Number.isFinite(deadline)) return { valid: false, reason: 'expired', rule: RULE.version };
  if (now >= deadline) return { valid: false, reason: 'expired', rule: RULE.version };

  return {
    valid: true,
    reason: null,
    rule: RULE.version,
    deadline: q.expiresAt,
    msRemaining: deadline - now,
  };
}
