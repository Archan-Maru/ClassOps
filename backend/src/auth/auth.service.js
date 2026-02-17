import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function generateOtpCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}
