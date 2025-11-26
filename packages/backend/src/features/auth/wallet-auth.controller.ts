import { Context } from "hono";

import { walletAuthService } from "./wallet-auth.service";
import type {
  WalletNonceRequestDto,
  WalletAuthDto,
  LinkWalletDto,
} from "./wallet-auth.dto";
import type { SuccessResponse, ErrorResponse } from "@/types";

export class WalletAuthController {
  // Generate nonce for wallet authentication
  async generateNonce(c: Context) {
    try {
      const data = (await c.req.json()) as WalletNonceRequestDto;
      const result = await walletAuthService.generateNonce(data);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: result.message,
        };
        return c.json(errorResponse, 400);
      }

      return c.json(result);
    } catch (error) {
      console.error("Generate nonce error:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate nonce",
      };
      return c.json(errorResponse, 400);
    }
  }

  // Authenticate user with wallet signature
  async authenticateWithWallet(c: Context) {
    try {
      const data = (await c.req.json()) as WalletAuthDto;
      const result = await walletAuthService.authenticateWithWallet(data);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: result.message,
        };
        return c.json(errorResponse, 400);
      }

      // Set HTTP-only refresh token cookie if you want
      // c.header("Set-Cookie", `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);

      return c.json(result);
    } catch (error) {
      console.error("Wallet authentication error:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Wallet authentication failed",
      };
      return c.json(errorResponse, 400);
    }
  }

  // Link wallet to existing authenticated user
  async linkWallet(c: Context) {
    try {
      const data = (await c.req.json()) as LinkWalletDto;
      const userId = c.get("user")?.id;

      if (!userId) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: "User not authenticated",
        };
        return c.json(errorResponse, 401);
      }

      const result = await walletAuthService.linkWallet(userId, data);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: result.message,
        };
        return c.json(errorResponse, 400);
      }

      return c.json(result);
    } catch (error) {
      console.error("Link wallet error:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to link wallet",
      };
      return c.json(errorResponse, 400);
    }
  }

  // Get wallet authentication message for display purposes
  async getAuthMessage(c: Context) {
    try {
      const { address, nonce } = c.req.query();

      if (!address || !nonce) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: "Address and nonce are required",
        };
        return c.json(errorResponse, 400);
      }

      const message = `Welcome to FlowWager!\n\nPlease sign this message to authenticate your wallet.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

      const successResponse: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message },
        message: "Authentication message generated successfully",
      };

      return c.json(successResponse);
    } catch (error) {
      console.error("Get auth message error:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate message",
      };
      return c.json(errorResponse, 400);
    }
  }
}

export const walletAuthController = new WalletAuthController();
