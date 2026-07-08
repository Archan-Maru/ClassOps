import * as groupsService from "./groups.service.js";

export async function createGroup(req, res, next) {
  try {
    const group = await groupsService.createGroup(req.params.id, req.user.id, req.body.name);
    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
}

export async function getAvailableStudents(req, res, next) {
  try {
    const students = await groupsService.getAvailableStudents(req.params.id, req.user.id);
    res.status(200).json({ students });
  } catch (err) {
    next(err);
  }
}

export async function addMemberToGroup(req, res, next) {
  try {
    await groupsService.addMemberToGroup(req.params.id, req.user.id, req.body.user_id);
    res.status(201).json({ message: "Member added to group" });
  } catch (err) {
    next(err);
  }
}

export async function assignLeader(req, res, next) {
  try {
    await groupsService.assignLeader(req.params.id, req.body.user_id);
    res.status(200).json({ message: "Leader assigned" });
  } catch (err) {
    next(err);
  }
}

export async function getGroupMembers(req, res, next) {
  try {
    const members = await groupsService.getGroupMembers(req.params.id, req.user.id);
    res.status(200).json({ members });
  } catch (err) {
    next(err);
  }
}

export async function getGroupsInClass(req, res, next) {
  try {
    const groups = await groupsService.getGroupsInClass(req.params.id, req.user.id);
    res.status(200).json({ groups });
  } catch (err) {
    next(err);
  }
}

export async function removeMemberFromGroup(req, res, next) {
  try {
    await groupsService.removeMemberFromGroup(req.params.groupId, req.user.id, req.params.userId);
    res.status(200).json({ message: "Member removed from group" });
  } catch (err) {
    next(err);
  }
}
