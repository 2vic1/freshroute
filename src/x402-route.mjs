/* x402 seller route config for the FreshRoute quote endpoint.
 * Uses explicit USDT price on Celo mainnet; never use a bare "$0.002" price.
 * Requires X402_API_KEY and SELLER_PAY_TO in .env.
 */
const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';

export function quoteRoute() {
  return {
    'POST /quote': {
      accepts: [
        {
          scheme: 'exact',
          network: 'eip155:42220',
          payTo: process.env.SELLER_PAY_TO,
          price: {
            amount: '2000', // 0.002 USDT, 6 decimals
            asset: USDT,
            extra: { name: 'Tether USD', version: '1' },
          },
        },
      ],
      description: 'FreshRoute guaranteed FX quote with automatic stale-quote refund',
    },
  };
}

export function facilitatorConfig() {
  return {
    url: 'https://api.x402.celo.org',
    createAuthHeaders: async () => {
      const h = { 'X-API-Key': process.env.X402_API_KEY || '' };
      return { verify: h, settle: h, supported: h };
    },
  };
}
