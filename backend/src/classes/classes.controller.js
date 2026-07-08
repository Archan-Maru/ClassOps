import * as classesService from "./classes.service.js";

export async function createClass(req, res, next) {
  try {
    const newClass = await classesService.createClass(req.user.id, req.body);
    res.status(201).json({ class: newClass });
  } catch (err) {
    next(err);
  }
}

export async function getMyClasses(req, res, next) {
  try {
    const classes = await classesService.getMyClasses(req.user.id);
    res.status(200).json({ classes });
  } catch (err) {
    next(err);
  }
}

export async function getClassDetails(req, res, next) {
  try {
    const classObj = await classesService.getClassDetails(req.params.id, req.user.id);
    res.status(200).json({ class: classObj });
  } catch (err) {
    next(err);
  }
}

export async function getClassPeople(req, res, next) {
  try {
    const people = await classesService.getClassPeople(req.params.id, req.user.id);
    res.status(200).json({ people });
  } catch (err) {
    next(err);
  }
}

export async function getClasswork(req, res, next) {
  try {
    const classwork = await classesService.getClasswork(req.params.id, req.user.id);
    res.status(200).json({ classwork });
  } catch (err) {
    next(err);
  }
}

export async function addClasswork(req, res, next) {
  try {
    const classwork = await classesService.addClasswork(req.params.id, req.user.id, req.body, req.file);
    res.status(201).json({ classwork });
  } catch (err) {
    next(err);
  }
}

export async function deleteClasswork(req, res, next) {
  try {
    await classesService.deleteClasswork(req.params.id, req.params.classworkId, req.user.id);
    res.status(200).json({ message: "Classwork deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function joinClass(req, res, next) {
  try {
    await classesService.joinClass(req.params.id, req.user.id);
    res.status(201).json({ message: "Joined class successfully" });
  } catch (err) {
    next(err);
  }
}

export async function joinClassByCode(req, res, next) {
  try {
    await classesService.joinClassByCode(req.body.code, req.user.id);
    res.status(201).json({ message: "Joined class successfully" });
  } catch (err) {
    next(err);
  }
}

export async function unenroll(req, res, next) {
  try {
    await classesService.unenroll(req.params.id, req.user.id);
    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (err) {
    next(err);
  }
}
