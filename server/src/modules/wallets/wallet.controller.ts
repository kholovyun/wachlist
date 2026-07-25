import type { Request, Response } from "express";
import { walletService } from "./wallet.service.js";
import {
  createWalletSchema,
  updateWalletSchema,
} from "./wallet.validation.js";

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0]! : id!;
}

export const walletController = {
  list(_req: Request, res: Response) {
    res.json({ data: walletService.list() });
  },

  create(req: Request, res: Response) {
    const input = createWalletSchema.parse(req.body);
    const wallet = walletService.create(input);
    res.status(201).json({ data: wallet });
  },

  getById(req: Request, res: Response) {
    res.json({ data: walletService.getById(paramId(req)) });
  },

  update(req: Request, res: Response) {
    const input = updateWalletSchema.parse(req.body);
    const wallet = walletService.update(paramId(req), input);
    res.json({ data: wallet });
  },

  remove(req: Request, res: Response) {
    walletService.remove(paramId(req));
    res.status(204).send();
  },

  getAssets(req: Request, res: Response) {
    res.json({ data: walletService.getAssets(paramId(req)) });
  },

  getActivity(req: Request, res: Response) {
    res.json({ data: walletService.getActivity(paramId(req)) });
  },
};
