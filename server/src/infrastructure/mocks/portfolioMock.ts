function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASSET_POOL: Record<string, { symbol: string; name: string; price: number }[]> = {
  ethereum: [
    { symbol: "ETH", name: "Ethereum", price: 3420 },
    { symbol: "USDC", name: "USD Coin", price: 1 },
    { symbol: "UNI", name: "Uniswap", price: 8.4 },
    { symbol: "LINK", name: "Chainlink", price: 14.2 },
  ],
  polygon: [
    { symbol: "MATIC", name: "Polygon", price: 0.52 },
    { symbol: "USDC", name: "USD Coin", price: 1 },
    { symbol: "AAVE", name: "Aave", price: 95 },
  ],
  bitcoin: [
    { symbol: "BTC", name: "Bitcoin", price: 68500 },
    { symbol: "ORDI", name: "ORDI", price: 42 },
  ],
  solana: [
    { symbol: "SOL", name: "Solana", price: 148 },
    { symbol: "JUP", name: "Jupiter", price: 0.85 },
    { symbol: "BONK", name: "Bonk", price: 0.000022 },
  ],
};

const ACTIVITY_TYPES = ["receive", "send", "swap", "approve"] as const;

export type Asset = {
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  valueUsd: number;
};

export type Activity = {
  id: string;
  type: (typeof ACTIVITY_TYPES)[number];
  asset: string;
  amount: number;
  counterparty: string;
  timestamp: string;
  status: "confirmed" | "pending";
};

function assetPoolFor(network: string) {
  return ASSET_POOL[network] ?? ASSET_POOL.ethereum!;
}

export function getMockAssets(address: string, network: string): Asset[] {
  const rand = mulberry32(hashSeed(address + network));
  const pool = assetPoolFor(network);
  const count = 1 + Math.floor(rand() * pool.length);
  return pool.slice(0, count).map((a) => {
    const balance = Number((rand() * (a.symbol === "BTC" ? 2.5 : 120) + 0.01).toFixed(6));
    const valueUsd = Number((balance * a.price).toFixed(2));
    return { symbol: a.symbol, name: a.name, balance, priceUsd: a.price, valueUsd };
  });
}

export function getMockActivity(address: string, network: string): Activity[] {
  const rand = mulberry32(hashSeed(address + ":" + network));
  const pool = assetPoolFor(network);
  const now = Date.now();
  const items: Activity[] = [];
  for (let i = 0; i < 8; i++) {
    const asset = pool[Math.floor(rand() * pool.length)]!;
    const type = ACTIVITY_TYPES[Math.floor(rand() * ACTIVITY_TYPES.length)]!;
    const amount = Number((rand() * 15 + 0.001).toFixed(4));
    const daysAgo = Math.floor(rand() * 45);
    items.push({
      id: `tx-${hashSeed(address)}-${i}`,
      type,
      asset: asset.symbol,
      amount,
      counterparty: `0x${hashSeed(address + i).toString(16).padStart(8, "0")}…${(hashSeed(String(i)) % 0xffff).toString(16)}`,
      timestamp: new Date(now - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString(),
      status: rand() > 0.15 ? "confirmed" : "pending",
    });
  }
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
