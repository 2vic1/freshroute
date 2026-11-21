# FreshRoute integration checklist

## 1. GitHub (blocker for registration)
Create a public repo and push this folder. The hackathon requires a public GitHub repo that still resolves at judging.

## 2. ERC-8004
- Connect the operator wallet on Celo mainnet.
- Register the agent with the payload from `src/agent-registration.mjs`.
- Put the resulting agent id in `AGENT_ID` and in `agent-card.json`.

## 3. Self Agent ID
- Create/verify the agent identity at docs.self.xyz.
- Put the accepted identifier in `ALLOWED_SELF_AGENT_IDS`.
- Attach it as `X-Self-Agent-Id` on quote requests in production.

## 4. Textile FX
- Get a partner API key or implement `takerProof` signing.
- Set `TEXTILE_API_KEY`, `TAKER_ADDRESS`, `TEXTILE_REACTOR`.
- Keep `includeAttribution: true` and `builderCodes: ["freshroute"]`.

## 5. x402 on Celo
- Create a mainnet API key at x402.celo.org with the operator wallet (human step).
- Set `X402_API_KEY` and `SELLER_PAY_TO`.
- Price the quote endpoint at 0.002 USDT with explicit asset:
  `USDT 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e`, decimals 6,
  `extra: { name: "Tether USD", version: "1" }`.
- Register the seller PayTo address as required by the hackathon.

## 6. Altana wallet
- Create a non-custodial agent wallet.
- Grant a session key with: spend cap 60 USDT, allowlist `USDT, cNGN, Textile reactor, x402 facilitator`, 24h expiry.
- Set `TAKER_ADDRESS` to that wallet.

## 7. Onchain proof
- Execute at least one tagged Textile conversion USDT → cNGN on Celo mainnet.
- Pay a recipient outside the team.
- Report the tx hash with `/submit`.
- Save the receipt JSON for judging.

## 8. Submission
- Deadline: Dec 7, 09:00 GMT.
- Enter all four tracks; a project can win up to two.
- Follow @Celo and @CeloDevs on X.
