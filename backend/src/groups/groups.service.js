import { AppError } from "../utils/AppError.js";
import db from "../config/db.js";
import * as groupsRepository from "./groups.repository.js";

export async function createGroup(classId, userId, name) {
  const enrollment = await groupsRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can create groups");
  }
  return groupsRepository.createGroup(classId, name);
}

export async function getAvailableStudents(classId, userId) {
  const enrollment = await groupsRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can view available students");
  }
  return groupsRepository.getAvailableStudents(classId);
}

export async function addMemberToGroup(groupId, teacherId, userIdToAdd) {
  const group = await groupsRepository.getGroupClassId(groupId);
  if (!group) throw new AppError(404, "Group not found");

  const enrollment = await groupsRepository.checkEnrollment(group.class_id, teacherId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can add members");
  }

  const isStudent = await groupsRepository.checkStudentEnrollment(group.class_id, userIdToAdd);
  if (!isStudent) {
    throw new AppError(400, "User is not a student in this class");
  }

  const alreadyInGroup = await groupsRepository.checkAlreadyInGroup(group.class_id, userIdToAdd);
  if (alreadyInGroup) {
    throw new AppError(409, "Student is already in a group");
  }

  await groupsRepository.addMemberToGroup(groupId, userIdToAdd);
}

export async function assignLeader(groupId, userId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await groupsRepository.resetGroupRoles(groupId, client);
    const updated = await groupsRepository.setGroupLeader(groupId, userId, client);
    if (!updated) {
      throw new AppError(404, "User not in group");
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getGroupMembers(groupId, userId) {
  const group = await groupsRepository.getGroupClassId(groupId);
  if (!group) throw new AppError(404, "Group not found");

  const enrollment = await groupsRepository.checkEnrollment(group.class_id, userId);
  if (!enrollment) throw new AppError(403, "Not allowed");

  return groupsRepository.getGroupMembers(groupId);
}

export async function getGroupsInClass(classId, userId) {
  const enrollment = await groupsRepository.checkEnrollment(classId, userId);
  if (!enrollment) throw new AppError(403, "Not allowed");

  return groupsRepository.getGroupsInClass(classId);
}

export async function removeMemberFromGroup(groupId, teacherId, userIdToRemove) {
  const group = await groupsRepository.getGroupClassId(groupId);
  if (!group) throw new AppError(404, "Group not found");

  const enrollment = await groupsRepository.checkEnrollment(group.class_id, teacherId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can remove members");
  }

  const removed = await groupsRepository.removeMemberFromGroup(groupId, userIdToRemove);
  if (!removed) {
    throw new AppError(404, "User not in group");
  }
}
