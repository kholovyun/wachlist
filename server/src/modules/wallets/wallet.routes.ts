import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { walletController } from "./wallet.controller.js";

export const walletRoutes = Router();

walletRoutes.get("/", asyncHandler(walletController.list));
walletRoutes.post("/", asyncHandler(walletController.create));
walletRoutes.get("/:id", asyncHandler(walletController.getById));
walletRoutes.patch("/:id", asyncHandler(walletController.update));
walletRoutes.delete("/:id", asyncHandler(walletController.remove));
walletRoutes.get("/:id/assets", asyncHandler(walletController.getAssets));
walletRoutes.get("/:id/activity", asyncHandler(walletController.getActivity));
