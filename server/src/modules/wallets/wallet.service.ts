import {
  getMockActivity,
  getMockAssets,
} from "../../infrastructure/mocks/portfolioMock.js";
import { conflict, notFound } from "../../shared/errors/httpErrors.js";
import { walletRepository } from "./wallet.repository.js";
import type { CreateWalletInput, UpdateWalletInput } from "./wallet.validation.js";

export const walletService = {
  list() {
    return walletRepository.findAll();
  },

  getById(id: string) {
    const wallet = walletRepository.findById(id);
    if (!wallet) throw notFound("Wallet not found");
    return wallet;
  },

  create(input: CreateWalletInput) {
    if (walletRepository.findByAddressAndNetwork(input.address, input.network)) {
      throw conflict("A wallet with this address already exists on this network");
    }
    return walletRepository.create(input);
  },

  update(id: string, input: UpdateWalletInput) {
    const current = this.getById(id);

    if (input.label === undefined && input.notes === undefined) {
      return current;
    }

    return walletRepository.update(id, input);
  },

  remove(id: string) {
    this.getById(id);
    walletRepository.delete(id);
  },

  getAssets(id: string) {
    const wallet = this.getById(id);
    const assets = getMockAssets(wallet.address, wallet.network);
    const totalValueUsd = Number(
      assets.reduce((sum, a) => sum + a.valueUsd, 0).toFixed(2)
    );
    return { walletId: id, totalValueUsd, assets };
  },

  getActivity(id: string) {
    const wallet = this.getById(id);
    return {
      walletId: id,
      activity: getMockActivity(wallet.address, wallet.network),
    };
  },
};
