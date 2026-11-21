# FreshRoute

**A self-verifying remittance agent for Celo's local-currency corridors.**

> Quote once. Verify freshness. Settle safely. Refund automatically.

FreshRoute is an autonomous agent that turns a plain-language payment request into a tagged, verifiable USDT → local-stablecoin payout on Celo mainnet. If the FX quote is stale, empty, or expires before execution, the buyer is refunded automatically instead of paying for a bad quote.

## The real job

**Named user:** Ehsan Sorvand, a small business owner paying a Nigerian freelancer for a delivered design job.  
**Job:** Convert 50 USDT into cNGN on Textile FX and pay the freelancer's wallet, with a signed receipt and an automatic refund guarantee.

## Why this is a strong hackathon entry

Most agents quote an FX rate and then trust it. FreshRoute treats the quote itself as a payable, verifiable artifact:

1. Textile FX returns a **firm RFQ** with `expiresAt`, `orderDeadline`, signed orders, and a receipt.
2. FreshRoute publishes a **freshness rule**: the quote must settle before `expiresAt`; `no_quote`, expired, or empty responses are invalid.
3. Predge holds the 0.002 payment in escrow, verifies the rule, signs a verdict, and refunds the buyer automatically on a stale/empty quote.
4. The actual swap is executed on Celo mainnet with an attribution tag.
5. A Self Agent ID proves a real person stands behind the agent, and an Altana session key limits what it can spend and call.

## Track mapping

| Track | How FreshRoute qualifies |
|---|---|
| **Stablecoin Corridors (Textile FX)** | Real USDT → cNGN conversion on Celo mainnet; recipient is outside the team; tagged onchain activity. |
| **Agent Vault Checkouts** | User pays the quote through Agent Vault and x402 without seeing a card or password. |
| **Self Agent ID** | Only agents with a verified Self Agent ID are served and allowed to spend. |
| **Altana Agent Wallets** | Agent acts from a non-custodial Altana wallet under a revocable session key with spend cap, allowlist, and expiry. |

## Flow

```
User request
  -> Self Agent ID check
  -> Textile FX firm RFQ (USDT -> cNGN, expiresAt signed)
  -> Freshness rule + 0.002 escrow via Predge
  -> x402 payment from Altana session-key wallet
  -> Textile swap broadcast with attribution tag
  -> Verdict: settled -> pay freelancer | stale/empty -> auto-refund buyer
  -> Receipt page with tx hash, quote hash, verdict
```

## Repo layout

- `src/server.mjs` — HTTP service: request quote, inspect quote, submit tx hash, read receipt.
- `src/textile.mjs` — Textile RFQ v2 client wrapper.
- `src/freshness.mjs` — quote freshness rule and verdict logic.
- `src/attribution.mjs` — Celo attribution-tag helper.
- `agent-card.json` — ERC-8004 agent metadata draft.
- `demo/index.html` — minimal receipt/payment demo UI.

## Environment

Copy `.env.example` and fill:

- `TEXTILE_API_KEY` — Textile partner key (or use keyless `takerProof`).
- `X402_API_KEY` — Celo x402 facilitator key from x402.celo.org.
- `SELLER_PAY_TO` — seller wallet receiving x402 payments.
- `TAKER_ADDRESS` — Altana agent wallet address.
- `CELO_RPC` — Celo mainnet RPC.
- `ATTRIBUTION_TAG` — repo's Celo attribution tag.
- `AGENT_ID` — ERC-8004 agent id.

## Run

```bash
npm install
npm run dev
```

Demo mode works without keys and returns a synthetic quote so the UI and rule logic can be tested.

## Deadline plan

- **Nov 21–24:** scaffold, ERC-8004 registration, Self Agent ID, Agent Vault wiring.
- **Nov 24:** AskBots review round 1.
- **Nov 25–Dec 1:** Altana session key + Textile mainnet conversion.
- **Dec 1:** Stablecoin Corridors livestream, tag every transaction.
- **Dec 4:** AskBots review round 2.
- **Dec 7:** submit before 09:00 GMT.

## Status

Local scaffold created: ready for keys, agent registration, and mainnet execution.
