import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import { verifyMessage } from "viem";
import { db } from "../../db";
import { user, walletNonce, session } from "../../db/schema/auth";
import { generateId } from "../../utils/id";
import jwt from "jsonwebtoken";
import type {
  WalletNonceRequestDto,
  WalletAuthDto,
  LinkWalletDto,
  WalletNonceResponse,
  WalletAuthResponse,
} from "./wallet-auth.dto";
import type { SuccessResponse, ErrorResponse } from "../../types";

export class WalletAuthService {
  // Generate nonce for wallet authentication
  async generateNonce(
    data: WalletNonceRequestDto,
  ): Promise<SuccessResponse<WalletNonceResponse> | ErrorResponse> {
    try {
      const { address } = data;

      // Generate a random nonce
      const nonce = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete any existing unused nonces for this wallet
      await db
        .delete(walletNonce)
        .where(
          and(
            eq(walletNonce.walletAddress, address.toLowerCase()),
            eq(walletNonce.used, false),
          ),
        );

      // Store the new nonce
      await db.insert(walletNonce).values({
        id: generateId(),
        walletAddress: address.toLowerCase(),
        nonce,
        expiresAt,
        used: false,
      });

      // Create the message to be signed by wagmi
      const message = `Welcome to FlowWager!\n\nPlease sign this message to authenticate your wallet.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

      return {
        success: true,
        data: {
          nonce,
          message,
          expiresAt: expiresAt.toISOString(),
        },
        message: "Nonce generated successfully",
      };
    } catch (error) {
      console.error("Generate nonce error:", error);
      return {
        success: false,
        message: "Failed to generate nonce",
      };
    }
  }

  // Verify wallet signature and authenticate user
  async authenticateWithWallet(
    data: WalletAuthDto,
  ): Promise<SuccessResponse<WalletAuthResponse> | ErrorResponse> {
    try {
      const { address, signature, nonce } = data;

      // Verify the nonce exists and is valid
      const [nonceRecord] = await db
        .select()
        .from(walletNonce)
        .where(
          and(
            eq(walletNonce.walletAddress, address.toLowerCase()),
            eq(walletNonce.nonce, nonce),
            eq(walletNonce.used, false),
          ),
        )
        .limit(1);

      if (!nonceRecord) {
        return {
          success: false,
          message: "Invalid or expired nonce",
        };
      }

      if (new Date() > nonceRecord.expiresAt) {
        return {
          success: false,
          message: "Nonce has expired",
        };
      }

      // Reconstruct the exact message that was signed
      const message = `Welcome to FlowWager!\n\nPlease sign this message to authenticate your wallet.\n\nNonce: ${nonce}\nTimestamp: ${nonceRecord.createdAt.toISOString()}`;

      // Verify the signature using viem
      const isValidSignature = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValidSignature) {
        return {
          success: false,
          message: "Invalid signature",
        };
      }

      // Mark nonce as used
      await db
        .update(walletNonce)
        .set({ used: true })
        .where(eq(walletNonce.id, nonceRecord.id));

      // Find or create user
      let [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.walletAddress, address.toLowerCase()))
        .limit(1);

      let isNewUser = false;

      if (!existingUser) {
        // Create new user with wallet address
        const userId = generateId();
        const shortAddress = address.slice(2, 8);
        const username = `user_${shortAddress}`;
        const name = `User ${shortAddress}`;

        await db.insert(user).values({
          id: userId,
          name,
          email: `${address.toLowerCase()}@wallet.local`, // Placeholder email
          password: "", // No password for wallet users
          username,
          walletAddress: address.toLowerCase(),
          emailVerified: true, // Wallet auth bypasses email verification
        });

        [existingUser] = await db
          .select()
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        isNewUser = true;
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        walletAddress: existingUser.walletAddress,
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "1h" },
      );

      const refreshToken = jwt.sign(
        tokenPayload,
        process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
        { expiresIn: "7d" },
      );

      // Store session
      await db.insert(session).values({
        id: generateId(),
        userId: existingUser.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return {
        success: true,
        data: {
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email:
              existingUser.email === `${address.toLowerCase()}@wallet.local`
                ? undefined
                : existingUser.email,
            username: existingUser.username,
            walletAddress: existingUser.walletAddress!,
            image: existingUser.image || undefined,
            emailVerified: existingUser.emailVerified,
          },
          accessToken,
          isNewUser,
        },
        message: isNewUser
          ? "User created and authenticated successfully"
          : "User authenticated successfully",
      };
    } catch (error) {
      console.error("Wallet authentication error:", error);
      return {
        success: false,
        message: "Authentication failed",
      };
    }
  }

  // Link wallet to existing authenticated user
  async linkWallet(
    userId: string,
    data: LinkWalletDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const { address, signature, nonce } = data;

      // Verify the nonce exists and is valid
      const [nonceRecord] = await db
        .select()
        .from(walletNonce)
        .where(
          and(
            eq(walletNonce.walletAddress, address.toLowerCase()),
            eq(walletNonce.nonce, nonce),
            eq(walletNonce.used, false),
          ),
        )
        .limit(1);

      if (!nonceRecord) {
        return {
          success: false,
          message: "Invalid or expired nonce",
        };
      }

      if (new Date() > nonceRecord.expiresAt) {
        return {
          success: false,
          message: "Nonce has expired",
        };
      }

      // Verify the signature
      const message = `Link this wallet to your FlowWager account.\n\nNonce: ${nonce}\nTimestamp: ${nonceRecord.createdAt.toISOString()}`;
      const isValidSignature = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValidSignature) {
        return {
          success: false,
          message: "Invalid signature",
        };
      }

      // Check if wallet is already linked to another account
      const [existingWalletUser] = await db
        .select()
        .from(user)
        .where(eq(user.walletAddress, address.toLowerCase()))
        .limit(1);

      if (existingWalletUser && existingWalletUser.id !== userId) {
        return {
          success: false,
          message: "Wallet is already linked to another account",
        };
      }

      // Mark nonce as used
      await db
        .update(walletNonce)
        .set({ used: true })
        .where(eq(walletNonce.id, nonceRecord.id));

      // Link wallet to user
      await db
        .update(user)
        .set({ walletAddress: address.toLowerCase() })
        .where(eq(user.id, userId));

      return {
        success: true,
        message: "Wallet linked successfully",
      };
    } catch (error) {
      console.error("Link wallet error:", error);
      return {
        success: false,
        message: "Failed to link wallet",
      };
    }
  }
}

export const walletAuthService = new WalletAuthService();
