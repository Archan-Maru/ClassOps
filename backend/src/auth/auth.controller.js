import * as authService from "./auth.service.js";

export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({
      message: result.verificationEmailSent
        ? "Verification OTP sent"
        : "Account created, but verification email could not be sent. Please try resend verification.",
      verificationEmailSent: result.verificationEmailSent,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        is_verified: result.user.is_verified,
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login(identifier, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    res.json({
      message: "Email verified successfully",
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    await authService.resendVerification(req.body.email);
    res.json({ message: "Verification email sent successfully" });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "If this email exists, reset link sent" });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body;
    await authService.resetPassword(email, token, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}
