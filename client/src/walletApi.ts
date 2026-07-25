import type {
  ActivityResponse,
  ApiErrorBody,
  AssetsResponse,
  Network,
  Wallet,
} from "./walletTypes";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      err?.error?.message ?? `Request failed (${res.status})`,
      err?.error?.details?.fieldErrors
    );
  }

  return (body as { data: T }).data;
}

export function listWallets() {
  return request<Wallet[]>("/api/wallets");
}

export function getWallet(id: string) {
  return request<Wallet>(`/api/wallets/${id}`);
}

export function createWallet(input: {
  address: string;
  label: string;
  network: Network;
  notes?: string;
}) {
  return request<Wallet>("/api/wallets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWallet(
  id: string,
  input: { label?: string; notes?: string }
) {
  return request<Wallet>(`/api/wallets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteWallet(id: string) {
  return request<void>(`/api/wallets/${id}`, { method: "DELETE" });
}

export function getWalletAssets(id: string) {
  return request<AssetsResponse>(`/api/wallets/${id}/assets`);
}

export function getWalletActivity(id: string) {
  return request<ActivityResponse>(`/api/wallets/${id}/activity`);
}
