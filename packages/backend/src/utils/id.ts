import { randomBytes } from "crypto";

export function generateId(): string {
  // Generate a random 16-byte ID and convert to hex string
  return randomBytes(16).toString("hex");
}

export function generateShortId(): string {
  // Generate a shorter 8-byte ID for shorter identifiers
  return randomBytes(8).toString("hex");
}
