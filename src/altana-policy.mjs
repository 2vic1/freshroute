/* Altana non-custodial wallet session policy.
 * The owner grants a capped, short-lived key; the agent can only call
 * allowlisted contracts and only up to the spend cap.
 */
export const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';
export const CNGN = '0xF6829D7393dAe24509eb1E52eE8e572e2E271a4f';

export function createSessionPolicy({ owner, agent, now = Date.now() } = {}) {
  return {
    version: '1.0.0',
    owner: owner || process.env.OWNER_ADDRESS || null,
    agent: agent || process.env.TAKER_ADDRESS || null,
    spendCap: process.env.ALTANA_SPEND_CAP || '60', // USDT, 6-decimal human units
    allowlist: [
      USDT,
      CNGN,
      process.env.TEXTILE_REACTOR || null,
      process.env.X402_FACILITATOR || '0x0000000000000000000000000000000000000000',
    ].filter(Boolean),
    expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    revocable: true,
  };
}

export function validateSessionPolicy(policy, { to, amount, now = Date.now() } = {}) {
  if (!policy || !policy.allowlist.includes(to)) return { ok: false, reason: 'contract_not_allowlisted' };
  if (Date.now() > Date.parse(policy.expiresAt)) return { ok: false, reason: 'session_expired' };
  const cap = BigInt(Math.round(Number(policy.spendCap) * 1e6));
  if (BigInt(amount || '0') > cap) return { ok: false, reason: 'spend_cap_exceeded' };
  return { ok: true };
}
