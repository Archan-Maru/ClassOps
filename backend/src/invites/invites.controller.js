import * as invitesService from "./invites.service.js";

export async function sendInvites(req, res, next) {
  try {
    const results = await invitesService.sendInvites(req.params.classId, req.user.id, req.body.emails);
    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
}

export async function getInvites(req, res, next) {
  try {
    const invites = await invitesService.getInvites(req.params.classId, req.user.id);
    res.status(200).json({ invites });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const result = await invitesService.acceptInvite(req.params.token, req.user.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.message, classId: result.classId });
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getInviteInfo(req, res, next) {
  try {
    const info = await invitesService.getInviteInfo(req.params.token);
    res.status(200).json(info);
  } catch (err) {
    next(err);
  }
}
