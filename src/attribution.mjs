/* Celo ERC-8021 attribution tag helper.
 * Note: Textile direct EOA swaps already carry the tag in swap.data when
 * includeAttribution is used. Do not append twice.
 */
export function tag() {
  return process.env.ATTRIBUTION_TAG || '';
}

export function assertTagged(data) {
  const t = tag();
  if (!t) return { tagged: false, warning: 'ATTRIBUTION_TAG not set' };
  return { tagged: String(data || '').toLowerCase().includes(t.toLowerCase()) };
}
