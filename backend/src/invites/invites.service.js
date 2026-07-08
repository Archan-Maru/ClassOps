import { AppError } from "../utils/AppError.js";
import { generateInviteToken } from "../utils/otp.js";
import { sendClassInviteEmail } from "../email/email.service.js";
import * as invitesRepository from "./invites.repository.js";

export async function sendInvites(classId, userId, emails) {
  const enrollment = await invitesRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can send invites");
  }

  const classDetails = await invitesRepository.getClassDetails(classId, userId);
  if (!classDetails) throw new AppError(404, "Class not found");

  const results = [];

  for (const email of emails) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) continue;

    const alreadyEnrolled = await invitesRepository.checkAlreadyEnrolled(classId, trimmed);
    if (alreadyEnrolled) {
      results.push({ email: trimmed, status: "already_enrolled" });
      continue;
    }

    const pendingInvite = await invitesRepository.checkPendingInvite(classId, trimmed);
    if (pendingInvite) {
      results.push({ email: trimmed, status: "already_invited" });
      continue;
    }

    const token = generateInviteToken();
    await invitesRepository.createInvite(classId, trimmed, token, userId);

    const sent = await sendClassInviteEmail(trimmed, classDetails.teacher_name, classDetails.title, token);
    results.push({ email: trimmed, status: sent ? "sent" : "email_failed" });
  }

  return results;
}

export async function getInvites(classId, userId) {
  const enrollment = await invitesRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can view invites");
  }

  return invitesRepository.getInvites(classId);
}

export async function acceptInvite(token, userId) {
  const invite = await invitesRepository.getInviteByToken(token);
  if (!invite) throw new AppError(404, "Invite not found or expired");

  if (invite.status === "ACCEPTED") {
    return { error: true, status: 400, message: "Invite already accepted", classId: invite.class_id };
  }

  const userEmail = await invitesRepository.getUserEmail(userId);
  if (userEmail.toLowerCase() !== invite.email.toLowerCase()) {
    throw new AppError(403, "This invite was sent to a different email address");
  }

  const alreadyEnrolled = await invitesRepository.checkEnrollment(invite.class_id, userId);
  if (alreadyEnrolled) {
    await invitesRepository.updateInviteStatus(invite.id);
    return { message: "Already enrolled", classId: invite.class_id };
  }

  await invitesRepository.createEnrollment(userId, invite.class_id);
  await invitesRepository.updateInviteStatus(invite.id);

  return { message: "Joined class successfully", classId: invite.class_id, classTitle: invite.class_title };
}

export async function getInviteInfo(token) {
  const invite = await invitesRepository.getInviteInfo(token);
  if (!invite) throw new AppError(404, "Invite not found");
  return {
    classTitle: invite.class_title,
    invitedBy: invite.invited_by,
    email: invite.email,
    status: invite.status,
  };
}
