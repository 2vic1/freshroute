# FreshRoute

**A self-verifying quote-and-settlement agent for Celo corridors.**

> Quote once. Verify freshness. Settle safely. Refund automatically.

FreshRoute is an autonomous agent that turns a plain-language request into a tagged, verifiable CELO → USDT quote and settlement on Celo mainnet. If the quote is stale, empty, or expires before execution, the buyer is refunded automatically instead of paying for a bad quote.

**Live demo:** https://13.140.192.70.nip.io

## The real job

**Named user:** Ehsan Sorvand, a small business owner paying a contractor for a delivered design job.  
**Job:** Convert CELO into USDT on Textile FX and pay the contractor's wallet, with a signed receipt and an automatic refund guarantee.

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
| **Stablecoin Corridors (Textile FX)** | Real CELO → USDT conversion on Celo mainnet; recipient is outside the team; tagged onchain activity. |
| **Agent Vault Checkouts** | User pays the quote through Agent Vault and x402 without seeing a card or password. |
| **Self Agent ID** | Only agents with a verified Self Agent ID are served and allowed to spend. |
| **Altana Agent Wallets** | Agent acts from a non-custodial Altana wallet under a revocable session key with spend cap, allowlist, and expiry. |

## Flow

```
User request
  -> Self Agent ID check
  -> Textile FX firm RFQ (CELO -> USDT, expiresAt signed)
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
- `X402_ENABLED` — `0` during shadow run; `1` only for paid production.
- `X402_API_KEY` — Celo x402 facilitator key from x402.celo.org.
- `SELLER_PAY_TO` — seller wallet receiving x402 payments (defaults to the agent wallet).
- `X402_PRICE_AMOUNT` — `2000` = 0.002 USDC (6 decimals).
- `TAKER_ADDRESS` — Altana agent wallet address.
- `CELO_RPC` — Celo mainnet RPC.
- `ATTRIBUTION_TAG` — repo's Celo attribution tag.
- `AGENT_ID` — ERC-8004 agent id.

## Run

```bash
npm install
npm run build
npm run dev
```

`npm run build` performs a syntax check on the service modules. Demo mode works without keys and returns a synthetic quote so the UI and rule logic can be tested.

## Deadline plan

- **Nov 21–24:** scaffold, ERC-8004 registration, Self Agent ID, Agent Vault wiring.
- **Nov 24:** AskBots review round 1.
- **Nov 25–Dec 1:** Altana session key + Textile mainnet conversion.
- **Dec 1:** Stablecoin Corridors livestream, tag every transaction.
- **Dec 4:** AskBots review round 2.
- **Dec 7:** submit before 09:00 GMT.

## Live pilot endpoint

Live demo: `https://13.140.192.70.nip.io`

- `POST /quote` — issues a guaranteed quote; returns HTTP 402 with USDC payment requirements only when `X402_ENABLED=1`
- `GET /rule.json` — published freshness rule, version `1.0.0`
- `GET /schema.json` — quote response schema
- `GET /receipt?id=...` — stored receipt
- `GET /health` — service health

Quote responses are persisted to disk and survive service restarts.

## What is live vs. demo

- **Live:** HTTP service, freshness rule, receipt persistence, Celo mainnet token addresses, Textile preview pricing, and the public demo URL above.
- **Demo mode:** `/quote` returns a synthetic quote (`signature: "0xdemo"`, `encodedOrder: "0xdemo"`) so the rule and receipt flow can be exercised without keys.
- **Not yet live:** a firm Textile `/rfq/request` requires either a partner API key or a `takerProof` signature from the taker wallet; the public demo does not claim a settled on-chain swap. x402 is implemented but disabled (`X402_ENABLED=0`), and Self Agent ID enforcement is optional in demo mode.

## Status

Public repo: https://github.com/2vic1/freshroute

Enrolled in **Agents Open for Business** on Loops House with `esorvand@gmail.com`.  
Attribution tag: `celo_85a3a5c339e5` — must be in every transaction.

Event wallet bound on Loops: `0x7B9C27d5e826c5a2aAe95431396ceE6Bbc143C1D` (balance ~5.63 CELO).  
ERC-8004 identity: `agentId 10011`, already registered by that wallet; the Loops on-chain check shows **registered**.  
First tagged transaction: `0x4e6c9700e7b206a0e7d4e5d0fce7708ecf21026feffff835618c709dca106c8a` — Loops now shows **ALL SET**.

The x402 paywall is implemented and gated by `X402_ENABLED=0`; it is ready for paid production once the facilitator key is created and `SELLER_PAY_TO` is registered. Textile preview pricing is configured. Remaining blockers: firm Textile quote access (partner key or `takerProof`), Self Agent ID, x402 facilitator key/PayTo registration, and the live CELO → USDT payout to the contractor.
