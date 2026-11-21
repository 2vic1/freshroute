/* Minimal Textile FX RFQ v2 wrapper.
 * Docs: https://fx-docs.textilecredit.com/api/v2/rfq.html
 */
const API = process.env.TEXTILE_API_BASE || 'https://api.textilecredit.com/v2';
const KEY = process.env.TEXTILE_API_KEY || '';
const DEMO = process.env.DEMO_MODE === '1';

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (KEY) h.Authorization = `Bearer ${KEY}`;
  return h;
}

export async function requestQuote({ sellToken, buyToken, sellAmount, taker }) {
  if (DEMO || !KEY) {
    const now = Date.now();
    return {
      data: {
        rfqId: 'rfq_demo_' + now,
        claimToken: 'rfqc_demo_' + now,
        status: 'quoted',
        quote: {
          sellToken,
          buyToken,
          sellAmount,
          buyAmount: String(BigInt(sellAmount) * 15800n / 1000000n),
          feeAmount: '10000',
          takerPays: sellAmount,
          expiresAt: new Date(now + 30000).toISOString(),
          orderDeadline: new Date(now + 40000).toISOString(),
          latestOrderDeadline: new Date(now + 40000).toISOString(),
          reactor: '0x0000000000000000000000000000000000000000',
          signature: '0xdemo',
          encodedOrder: '0xdemo',
        },
        transactions: {
          approval: { to: sellToken, data: '0x', value: '0', chainId: 42220 },
          swap: { to: '0x0000000000000000000000000000000000000000', data: '0x', value: '0', chainId: 42220 },
        },
        routing: { fallbackUsed: false },
      },
      demo: true,
    };
  }

  const body = {
    chainId: 42220,
    sellToken,
    buyToken,
    sellAmount,
    taker,
    includeAttribution: true,
    builderCodes: [process.env.BUILDER_CODE || 'freshroute'],
  };

  const r = await fetch(`${API}/rfq/request`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(75000),
  });
  return r.json();
}

export async function submitTx(rfqId, claimToken, txHash) {
  if (DEMO || !KEY) return { data: { rfqId, status: 'submitted', txHash }, demo: true };
  const r = await fetch(`${API}/rfq/${rfqId}/submit`, {
    method: 'POST',
    headers: headers({ 'X-Rfq-Claim': claimToken }),
    body: JSON.stringify({ txHash }),
  });
  return r.json();
}

export async function getStatus(rfqId, claimToken) {
  if (DEMO || !KEY) return { data: { rfqId, status: 'filled' }, demo: true };
  const r = await fetch(`${API}/rfq/${rfqId}`, {
    headers: headers({ 'X-Rfq-Claim': claimToken }),
  });
  return r.json();
}
