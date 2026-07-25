import type { WalletRow } from "../../infrastructure/database.js";
import type { Network } from "./wallet.validation.js";

export type Wallet = {
  id: string;
  address: string;
  label: string;
  network: Network;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export function mapWalletRow(row: WalletRow): Wallet {
  return {
    id: row.id,
    address: row.address,
    label: row.label,
    network: row.network as Network,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
