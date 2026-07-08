import * as submissionsService from "./submissions.service.js";

export async function getUserInfo(req, res, next) {
  try {
    const user = await submissionsService.getUserInfo(req.params.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function submitAssignment(req, res, next) {
  try {
    const result = await submissionsService.submitAssignment(req.params.id, req.user.id, req.body, req.file);
    if (result.type === "GROUP") {
      return res.status(201).json({ submission: result.submission, message: result.message });
    }
    res.status(201).json({ submission: result.submission });
  } catch (err) {
    next(err);
  }
}

export async function getMySubmission(req, res, next) {
  try {
    const submission = await submissionsService.getMySubmission(req.params.id, req.user.id);
    res.status(200).json({ submission });
  } catch (err) {
    next(err);
  }
}

export async function getSubmissions(req, res, next) {
  try {
    const submissions = await submissionsService.getSubmissions(req.params.id, req.user.id);
    res.status(200).json({ submissions });
  } catch (err) {
    next(err);
  }
}

export async function updateSubmission(req, res, next) {
  try {
    const submission = await submissionsService.updateSubmission(req.params.id, req.user.id, req.body, req.file);
    res.status(200).json({ submission });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubmission(req, res, next) {
  try {
    await submissionsService.deleteSubmission(req.params.id, req.user.id);
    res.status(200).json({ message: "Submission deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getSubmissionStatus(req, res, next) {
  try {
    const status = await submissionsService.getSubmissionStatus(req.params.assignmentId, req.user.id);
    res.status(200).json(status);
  } catch (err) {
    next(err);
  }
}

export async function getSubmissionsSorted(req, res, next) {
  try {
    const submissions = await submissionsService.getSubmissionsSorted(req.params.assignmentId, req.user.id, req.query.sortBy || "latest");
    res.status(200).json({ submissions });
  } catch (err) {
    next(err);
  }
}
