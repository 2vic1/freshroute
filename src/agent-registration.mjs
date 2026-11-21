/* ERC-8004 agent registration payload draft.
 * Register on Celo mainnet with the agent card hash as metadata.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

export function buildRegistration(cardPath = new URL('../agent-card.json', import.meta.url)) {
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const hash = '0x' + crypto.createHash('sha256').update(JSON.stringify(card)).digest('hex');
  return {
    name: card.name,
    description: card.description,
    network: card.network,
    metadataHash: hash,
    capabilities: card.capabilities,
    services: card.services,
    operator: process.env.OWNER_ADDRESS || null,
    agentWallet: process.env.TAKER_ADDRESS || null,
  };
}
