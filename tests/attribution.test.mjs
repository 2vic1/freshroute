import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeTag, decodeTag } from '../src/attribution.mjs';

test('encodes the Celo event tag as an ERC-8021 suffix', () => {
  assert.equal(
    encodeTag('celo_85a3a5c339e5'),
    '0x63656c6f5f383561336135633333396535110080218021802180218021802180218021'
  );
});

test('decodes a tag from the end of contract calldata', () => {
  const data = '0xa9059cbb' + encodeTag('celo_85a3a5c339e5').slice(2);
  assert.equal(decodeTag(data), 'celo_85a3a5c339e5');
});

test('rejects malformed calldata', () => {
  assert.equal(decodeTag('0x1234'), null);
  assert.equal(decodeTag('0x63656c6f00'), null);
});
