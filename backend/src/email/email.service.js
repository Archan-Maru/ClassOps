import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function sendVerificationEmail(email, username, otpCode) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification Code - ClassOps",
      html: `
        <div style="margin:0;padding:24px;background-color:#f4f6f8;font-family:Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e9ee;">
            <div style="padding:24px 28px;background:linear-gradient(135deg,#0f172a,#1f2937);color:#ffffff;">
              <h1 style="margin:0;font-size:22px;font-weight:600;">ClassOps</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">Email Verification</p>
            </div>
            <div style="padding:28px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Welcome, ${username}!</h2>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">Use the verification code below to confirm your email address.</p>
              <div style="display:inline-block;padding:12px 18px;border-radius:8px;background-color:#f1f5f9;border:1px dashed #cbd5e1;font-size:22px;letter-spacing:6px;font-weight:700;color:#0f172a;">
                ${otpCode}
              </div>
              <p style="margin:16px 0 0;font-size:12px;color:#64748b;">This code will expire in 10 minutes.</p>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">If you did not create this account, you can ignore this email.</p>
            </div>
            <div style="padding:16px 28px;background-color:#f8fafc;font-size:12px;color:#94a3b8;">
              <p style="margin:0;">Need help? Reply to this email and we will get back to you.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log("Verification email sent:", info.response);
    }

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}


export async function sendPasswordResetEmail(
  email,
  username,
  resetToken
) {
  try {
    const resetBaseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetUrl = `${resetBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - ClassOps",
      html: `
        <div style="margin:0;padding:24px;background-color:#f4f6f8;font-family:Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e9ee;">
            <div style="padding:24px 28px;background:linear-gradient(135deg,#0f172a,#1f2937);color:#ffffff;">
              <h1 style="margin:0;font-size:22px;font-weight:600;">ClassOps</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">Password Reset</p>
            </div>
            <div style="padding:28px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h2>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;">Hi ${username}, we received a request to reset your password.</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#334155;">Click the button below to choose a new password.</p>
              <a href="${resetUrl}" style="display:inline-block;background-color:#22c55e;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Reset Password</a>
              <p style="margin:16px 0 0;font-size:12px;color:#64748b;">This link will expire in 1 hour.</p>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">If you did not request this, you can ignore this email.</p>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Having trouble? Copy and paste this link into your browser:</p>
              <p style="margin:4px 0 0;font-size:12px;color:#2563eb;word-break:break-all;">${resetUrl}</p>
            </div>
            <div style="padding:16px 28px;background-color:#f8fafc;font-size:12px;color:#94a3b8;">
              <p style="margin:0;">If this was not you, no further action is needed.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset email sent:", info.response);
    }

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
