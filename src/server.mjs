import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { requestQuote, submitTx, getStatus } from './textile.mjs';
import { evaluateFreshness, RULE } from './freshness.mjs';
import { assertTagged, tag } from './attribution.mjs';
import { verifySelfAgentId } from './self-id.mjs';

const PORT = process.env.PORT || 3000;
const records = new Map();

const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';
const CNGN = '0xF6829D7393dAe24509eb1E52eE8e572e2E271a4f';

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body, null, 2));
}

async function body(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString() || '{}');
}

function hash(obj) {
  return '0x' + crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { ok: true, service: 'freshroute', attributionTag: tag() || null });
  }

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(new URL('../demo/index.html', import.meta.url)));
  }

  if (req.method === 'POST' && url.pathname === '/quote') {
    const selfCheck = verifySelfAgentId(req.headers['x-self-agent-id']);
    if (!selfCheck.ok && process.env.DEMO_MODE !== '1') {
      return json(res, 403, { error: selfCheck.reason });
    }
    const b = await body(req);
    const amount = String(b.amount || '50000000'); // 50 USDT, 6 decimals
    const taker = b.taker || process.env.TAKER_ADDRESS || '0x0000000000000000000000000000000000000000';
    const quoted = await requestQuote({ sellToken: USDT, buyToken: CNGN, sellAmount: amount, taker });
    const freshness = evaluateFreshness(quoted);
    const id = quoted?.data?.rfqId || hash(quoted);
    const receiptHash = hash({ quoted, freshness, rule: RULE });
    records.set(id, { id, quoted, freshness, rule: RULE, receiptHash, txHash: null, verdict: freshness.valid ? 'pending_settlement' : 'refund_due' });
    return json(res, 200, { id, freshness, receiptHash, quote: quoted?.data?.quote || null, demo: !!quoted.demo, verdict: records.get(id).verdict });
  }

  if (req.method === 'POST' && url.pathname === '/submit') {
    const b = await body(req);
    const rec = records.get(b.id);
    if (!rec) return json(res, 404, { error: 'unknown_quote' });
    const submitted = await submitTx(rec.quoted?.data?.rfqId, rec.quoted?.data?.claimToken, b.txHash);
    rec.txHash = b.txHash;
    rec.submitted = submitted;
    return json(res, 200, { ok: true, submitted });
  }

  if (req.method === 'GET' && url.pathname === '/receipt') {
    const rec = records.get(url.searchParams.get('id'));
    if (!rec) return json(res, 404, { error: 'unknown_quote' });
    const status = await getStatus(rec.quoted?.data?.rfqId, rec.quoted?.data?.claimToken);
    const tagCheck = assertTagged(rec.quoted?.data?.transactions?.swap?.data || '');
    return json(res, 200, { ...rec, chainStatus: status, attribution: tagCheck });
  }

  return json(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => console.log(`FreshRoute listening on http://localhost:${PORT}`));
