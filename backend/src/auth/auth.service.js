import { AppError } from "../utils/AppError.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { generateOtpCode } from "../utils/otp.js";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email/email.service.js";
import * as authRepository from "./auth.repository.js";

export async function signup(data) {
  const { email, username, password, role } = data;
  const normalizedRole = role?.toUpperCase();
  
  console.log("Signup attempt:", { email, username, role: normalizedRole });

  const existing = await authRepository.findByEmailOrUsername(email, username);
  console.log("User check result:", { rowCount: existing.length, rows: existing });

  if (existing.length > 0) {
    console.log("User already exists:", existing[0]);
    throw new AppError(409, "User already exists");
  }

  const passwordHash = await hashPassword(password);
  const otpCode = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await authRepository.createUser({
    email, username, passwordHash, role: normalizedRole, otpCode, otpExpiresAt
  });
  console.log("New user created:", user.id);

  let verificationEmailSent = true;
  try {
    await sendVerificationEmail(email, username, otpCode);
  } catch (emailError) {
    verificationEmailSent = false;
    console.error("Failed to send verification email:", emailError);
  }

  return { user, verificationEmailSent };
}

export async function login(identifier, password) {
  const user = await authRepository.findForLogin(identifier);
  if (!user) {
    throw new AppError(401, "User not registered");
  }

  if (!user.is_verified) {
    throw new AppError(403, "Please verify your email first", { email: user.email });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = generateToken({ id: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    }
  };
}

export async function getMe(id) {
  const user = await authRepository.findById(id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
}

export async function verifyEmail(email, otp) {
  const user = await authRepository.findByEmailAndOtp(email, otp);
  if (!user) {
    throw new AppError(400, "Invalid or expired verification code");
  }

  if (user.is_verified) {
    throw new AppError(400, "Email already verified");
  }

  if (new Date() > user.otp_expires_at) {
    throw new AppError(400, "Verification code has expired");
  }

  await authRepository.verifyUser(user.id);
  const token = generateToken({ id: user.id, role: user.role });
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    }
  };
}

export async function resendVerification(email) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.is_verified) {
    throw new AppError(400, "Email is already verified");
  }

  const otpCode = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await authRepository.updateOtp(user.id, otpCode, otpExpiresAt);

  try {
    await sendVerificationEmail(email, user.username, otpCode);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // Explicitly throwing generic 500 without replacing AppError structure
    throw new AppError(500, "Failed to send verification email");
  }
}

export async function forgotPassword(email) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await authRepository.setResetToken(user.id, resetToken, expiresAt);
  await sendPasswordResetEmail(user.email, user.username, resetToken);
}

export async function resetPassword(email, token, newPassword) {
  const user = await authRepository.findByEmailAndResetToken(email, token);
  if (!user) {
    throw new AppError(400, "Invalid or expired token");
  }

  const passwordHash = await hashPassword(newPassword);
  await authRepository.updatePassword(user.id, passwordHash);
}
