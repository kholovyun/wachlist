import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wallet-watchlist-"));
process.env.WALLET_DB_PATH = path.join(tmpDir, "test.db");

const { createApp } = await import("../src/app.js");
const { db } = await import("../src/infrastructure/database.js");

const app = createApp();

const ethAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

beforeAll(() => {
  expect(fs.existsSync(process.env.WALLET_DB_PATH!)).toBe(true);
});

beforeEach(() => {
  db.prepare("DELETE FROM wallets").run();
});

describe("Wallet Watchlist API", () => {
  it("returns health and ready", async () => {
    const health = await request(app).get("/api/health");
    expect(health.status).toBe(200);
    expect(health.body.data.ok).toBe(true);
    expect(health.headers["x-request-id"]).toBeTruthy();

    const ready = await request(app).get("/api/ready");
    expect(ready.status).toBe(200);
    expect(ready.body.data.ready).toBe(true);
  });

  it("creates a wallet and returns assets/activity", async () => {
    const created = await request(app).post("/api/wallets").send({
      address: ethAddress,
      label: "Treasury",
      network: "ethereum",
      notes: "demo",
    });

    expect(created.status).toBe(201);
    expect(created.body.data.label).toBe("Treasury");
    expect(created.body.data.address).toBe(ethAddress.toLowerCase());

    const id = created.body.data.id as string;

    const assets = await request(app).get(`/api/wallets/${id}/assets`);
    expect(assets.status).toBe(200);
    expect(assets.body.data.assets.length).toBeGreaterThan(0);

    const activityA = await request(app).get(`/api/wallets/${id}/activity`);
    const activityB = await request(app).get(`/api/wallets/${id}/activity`);
    expect(activityA.status).toBe(200);
    expect(activityA.body).toEqual(activityB.body);
  });

  it("rejects invalid address with field errors", async () => {
    const res = await request(app).post("/api/wallets").send({
      address: "not-an-address",
      label: "Bad",
      network: "ethereum",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details.fieldErrors.address).toBeTruthy();
  });

  it("rejects duplicate address on same network with 409", async () => {
    await request(app).post("/api/wallets").send({
      address: ethAddress,
      label: "One",
      network: "ethereum",
    });

    const dup = await request(app).post("/api/wallets").send({
      address: "0x742D35CC6634C0532925A3B844BC454E4438F44E",
      label: "Two",
      network: "ethereum",
    });

    expect(dup.status).toBe(409);
  });

  it("allows same address on a different network", async () => {
    await request(app).post("/api/wallets").send({
      address: ethAddress,
      label: "ETH",
      network: "ethereum",
    });

    const poly = await request(app).post("/api/wallets").send({
      address: ethAddress,
      label: "POLY",
      network: "polygon",
    });

    expect(poly.status).toBe(201);
  });

  it("updates and deletes a wallet", async () => {
    const created = await request(app).post("/api/wallets").send({
      address: ethAddress,
      label: "Old",
      network: "ethereum",
    });
    const id = created.body.data.id as string;

    const updated = await request(app)
      .patch(`/api/wallets/${id}`)
      .send({ label: "New", notes: "updated" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.label).toBe("New");

    const deleted = await request(app).delete(`/api/wallets/${id}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app).get(`/api/wallets/${id}`);
    expect(missing.status).toBe(404);
  });

  it("returns JSON 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Not found");
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await request(app)
      .post("/api/wallets")
      .set("Content-Type", "application/json")
      .send("{bad");

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Invalid JSON body");
  });
});
