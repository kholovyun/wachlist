import { randomUUID } from "node:crypto";
import { db, type WalletRow } from "../../infrastructure/database.js";
import { mapWalletRow, type Wallet } from "./wallet.types.js";
import type { CreateWalletInput, UpdateWalletInput } from "./wallet.validation.js";

export const walletRepository = {
  findAll(): Wallet[] {
    const rows = db
      .prepare("SELECT * FROM wallets ORDER BY created_at DESC")
      .all() as WalletRow[];
    return rows.map(mapWalletRow);
  },

  findById(id: string): Wallet | null {
    const row = db.prepare("SELECT * FROM wallets WHERE id = ?").get(id) as
      | WalletRow
      | undefined;
    return row ? mapWalletRow(row) : null;
  },

  findByAddressAndNetwork(address: string, network: string): Wallet | null {
    const row = db
      .prepare(
        `SELECT * FROM wallets
         WHERE lower(address) = lower(?) AND network = ?`
      )
      .get(address, network) as WalletRow | undefined;
    return row ? mapWalletRow(row) : null;
  },

  create(input: CreateWalletInput): Wallet {
    const now = new Date().toISOString();
    const id = randomUUID();

    db.prepare(
      `INSERT INTO wallets (id, address, label, network, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, input.address, input.label, input.network, input.notes ?? "", now, now);

    return this.findById(id)!;
  },

  update(id: string, input: UpdateWalletInput): Wallet {
    const current = this.findById(id)!;
    const label = input.label ?? current.label;
    const notes = input.notes ?? current.notes;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE wallets SET label = ?, notes = ?, updated_at = ? WHERE id = ?`
    ).run(label, notes, now, id);

    return this.findById(id)!;
  },

  delete(id: string): void {
    db.prepare("DELETE FROM wallets WHERE id = ?").run(id);
  },
};
