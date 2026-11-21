/* Self Agent ID gate.
 * In production, replace the demo check with a call to the Self verification
 * endpoint and compare the returned agent identifier to the allowlist.
 */
const DEMO = process.env.DEMO_MODE === '1';

export function verifySelfAgentId(headerValue) {
  const allowed = (process.env.ALLOWED_SELF_AGENT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (DEMO) return { ok: true, id: headerValue || 'demo-self-id', demo: true };
  if (!headerValue) return { ok: false, reason: 'missing_self_agent_id' };
  if (allowed.length && !allowed.includes(headerValue)) return { ok: false, reason: 'agent_not_allowed' };
  return { ok: true, id: headerValue };
}
