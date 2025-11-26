import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  walletNonceRequestSchema,
  walletAuthSchema,
  linkWalletSchema,
} from "./wallet-auth.dto";
import { walletAuthController } from "./wallet-auth.controller";
import { authMiddleware } from "./auth.middleware";
import type { SuccessResponse } from "../../types";

const walletAuthRouter = new Hono()
  // Generate nonce for wallet authentication
  .post(
    "/nonce",
    zValidator("json", walletNonceRequestSchema),
    walletAuthController.generateNonce.bind(walletAuthController),
  )

  // Authenticate with wallet signature
  .post(
    "/authenticate",
    zValidator("json", walletAuthSchema),
    walletAuthController.authenticateWithWallet.bind(walletAuthController),
  )

  // Get authentication message (for frontend display)
  .get(
    "/message",
    walletAuthController.getAuthMessage.bind(walletAuthController),
  )

  // Link wallet to existing authenticated user
  .post(
    "/link",
    authMiddleware,
    zValidator("json", linkWalletSchema),
    walletAuthController.linkWallet.bind(walletAuthController),
  )

  // Health check
  .get("/health", (c) => {
    const response: SuccessResponse = {
      success: true,
      message: "Wallet auth service is healthy and running",
    };
    return c.json(response);
  });

export default walletAuthRouter;
