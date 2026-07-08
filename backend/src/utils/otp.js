import crypto from "crypto";

export function generateOtpCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function generateInviteToken() {
  return crypto.randomBytes(24).toString("hex");
}
