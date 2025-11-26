import * as z from "zod";

// Schema for requesting a nonce (wagmi compatible)
export const walletNonceRequestSchema = z.object({
  address: z
    .string()
    .min(42)
    .max(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});

// Schema for wallet authentication (wagmi compatible)
export const walletAuthSchema = z.object({
  address: z
    .string()
    .min(42)
    .max(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format"),
  nonce: z.string().min(1, "Nonce is required"),
});

// Schema for linking wallet to existing account
export const linkWalletSchema = z.object({
  address: z
    .string()
    .min(42)
    .max(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format"),
  nonce: z.string().min(1, "Nonce is required"),
});

export type WalletNonceRequestDto = z.infer<typeof walletNonceRequestSchema>;
export type WalletAuthDto = z.infer<typeof walletAuthSchema>;
export type LinkWalletDto = z.infer<typeof linkWalletSchema>;

export interface WalletNonceResponse {
  nonce: string;
  message: string;
  expiresAt: string; // ISO string for frontend compatibility
}

export interface WalletAuthResponse {
  user: {
    id: string;
    name: string;
    email?: string;
    username: string;
    walletAddress: string;
    image?: string;
    emailVerified: boolean;
  };
  accessToken: string;
  isNewUser: boolean;
}

export interface WalletUserProfile {
  id: string;
  name: string;
  username: string;
  walletAddress: string;
  email?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string; // ISO string
}
