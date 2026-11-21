/* Predge-style escrow verdict payload.
 * FreshRoute publishes the rule; Predge verifies the signed evidence and
 * returns a verdict that settles or refunds the 0.002 payment.
 */
import crypto from 'node:crypto';

export function buildVerdict({ freshness, quote, txHash = null, recipient = null }) {
  const settle = freshness?.valid === true;
  const evidence = {
    rfqId: quote?.rfqId || null,
    expiresAt: quote?.expiresAt || null,
    buyAmount: quote?.buyAmount || null,
    signature: quote?.signature || null,
    txHash,
    recipient,
  };
  return {
    ruleVersion: freshness?.rule || '1.0.0',
    evidenceHash: '0x' + crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex'),
    verdict: settle ? 'settle' : 'refund',
    amount: '0.002',
    reason: settle ? null : freshness?.reason || 'invalid_quote',
    evidence,
  };
}
