import { z } from "zod";

export const NETWORKS = ["ethereum", "bitcoin", "solana", "polygon"] as const;
export type Network = (typeof NETWORKS)[number];

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum/Polygon address (0x + 40 hex)");

const btcAddress = z
  .string()
  .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, "Invalid Bitcoin address");

const solAddress = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address");

function addressSchemaFor(network: Network) {
  if (network === "ethereum" || network === "polygon") return ethAddress;
  if (network === "bitcoin") return btcAddress;
  return solAddress;
}

function normalizeAddress(address: string, network: Network) {
  if (network === "ethereum" || network === "polygon") {
    return address.toLowerCase();
  }
  return address;
}

export const createWalletSchema = z
  .object({
    address: z.string().trim().min(1, "Address is required"),
    label: z.string().trim().min(1, "Label is required").max(80),
    network: z.enum(NETWORKS),
    notes: z.string().trim().max(500).optional().default(""),
  })
  .superRefine((data, ctx) => {
    const result = addressSchemaFor(data.network).safeParse(data.address);

    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0]?.message ?? "Invalid address",
        path: ["address"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    address: normalizeAddress(data.address, data.network),
  }));

export const updateWalletSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
