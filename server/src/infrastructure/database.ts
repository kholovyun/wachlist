import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, "..", "..", "data", "wallets.db");
const dbPath = process.env.WALLET_DB_PATH ?? defaultPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const database = new Database(dbPath);

database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    network TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export type WalletRow = {
  id: string;
  address: string;
  label: string;
  network: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export const db: Database.Database = database;

export function pingDatabase(): void {
  database.prepare("SELECT 1").get();
}

export function closeDatabase(): void {
  database.close();
}
