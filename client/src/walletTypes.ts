export type Network = "ethereum" | "bitcoin" | "solana" | "polygon";

export type Wallet = {
  id: string;
  address: string;
  label: string;
  network: Network;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Asset = {
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  valueUsd: number;
};

export type AssetsResponse = {
  walletId: string;
  totalValueUsd: number;
  assets: Asset[];
};

export type Activity = {
  id: string;
  type: "receive" | "send" | "swap" | "approve";
  asset: string;
  amount: number;
  counterparty: string;
  timestamp: string;
  status: "confirmed" | "pending";
};

export type ActivityResponse = {
  walletId: string;
  activity: Activity[];
};

export type ApiErrorBody = {
  error: {
    message: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
};
