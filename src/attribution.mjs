/* Celo ERC-8021 attribution tag helper (Schema 0).
 *
 * Wire layout: [code bytes][len:1][schema:1][marker:16]
 * The suffix is appended to the end of transaction calldata. Textile direct
 * EOA swaps already carry it when includeAttribution is used, so do not
 * append twice.
 */

const CODE_RE = /^[a-z0-9_]{1,32}$/;
const MARKER = '80218021802180218021802180218021';

export function tag() {
  return process.env.ATTRIBUTION_TAG || '';
}

export function encodeTag(code) {
  if (!CODE_RE.test(code || '')) {
    throw new Error(`Invalid attribution code: ${JSON.stringify(code)}`);
  }
  const bytes = Buffer.from(code, 'utf8');
  if (bytes.length > 255) throw new Error('Attribution code too long');
  return `0x${bytes.toString('hex')}${bytes.length.toString(16).padStart(2, '0')}00${MARKER}`;
}

export function decodeTag(data) {
  const raw = String(data || '').replace(/^0x/i, '').toLowerCase();
  if (raw.length < 36 || !raw.endsWith(MARKER)) return null;
  const schema = raw.slice(-34, -32);
  if (schema !== '00') return null;
  const len = parseInt(raw.slice(-36, -34), 16);
  if (!len || len > 255) return null;
  const start = raw.length - 36 - len * 2;
  if (start < 0) return null;
  const code = Buffer.from(raw.slice(start, start + len * 2), 'hex').toString('utf8');
  return CODE_RE.test(code) ? code : null;
}

export function assertTagged(data) {
  const t = tag();
  if (!t) return { tagged: false, warning: 'ATTRIBUTION_TAG not set' };
  const decoded = decodeTag(data);
  if (decoded) return { tagged: decoded === t, code: decoded };
  // Keeps support for callers that pass the plain code instead of calldata.
  return { tagged: String(data || '').toLowerCase().includes(t.toLowerCase()) };
}
