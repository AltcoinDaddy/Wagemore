export * from "./auth";

// Re-export specific tables for easier imports
export { user, account, session, otp, verification, walletNonce } from "./auth";
