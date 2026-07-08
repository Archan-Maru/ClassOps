import { AppError } from "../utils/AppError.js";
import db from "../config/db.js";
import * as classesRepository from "./classes.repository.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export async function createClass(userId, { title, description }) {
  const user = await classesRepository.findUserRole(userId);
  if (!user) {
    throw new AppError(401, "User not found");
  }

  if (user.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can create classes");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const newClass = await classesRepository.createClass(title, description, userId, client);
    await classesRepository.createEnrollment(userId, newClass.id, "TEACHER", client);
    await client.query("COMMIT");
    return newClass;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getMyClasses(userId) {
  return classesRepository.findEnrolledClasses(userId);
}

export async function getClassDetails(classId, userId) {
  const classDetails = await classesRepository.findClassDetails(classId, userId);
  if (!classDetails) {
    throw new AppError(404, "Class not found");
  }
  return classDetails;
}

export async function getClassPeople(classId, userId) {
  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (!enrollment) {
    throw new AppError(403, "Not enrolled in this class");
  }
  return classesRepository.findClassPeople(classId);
}

export async function getClasswork(classId, userId) {
  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (!enrollment) {
    throw new AppError(403, "Not enrolled in this class");
  }
  return classesRepository.findClasswork(classId);
}

export async function addClasswork(classId, userId, { title, description, resource_url }, file) {
  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can add classwork");
  }

  let resourceUrlFinal = resource_url || null;

  if (file) {
    try {
      const uploadRes = await uploadBufferToCloudinary(
        file.buffer,
        file.originalname,
        `classes/${classId}`
      );
      resourceUrlFinal = uploadRes.secure_url || uploadRes.url || resourceUrlFinal;
    } catch (uploadErr) {
      console.error("Cloudinary upload failed:", uploadErr);
    }
  }

  return classesRepository.createClasswork(classId, title, description, resourceUrlFinal, userId);
}

export async function deleteClasswork(classId, classworkId, userId) {
  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (!enrollment || enrollment.role !== "TEACHER") {
    throw new AppError(403, "Only teachers can delete classwork");
  }

  const success = await classesRepository.deleteClasswork(classworkId, classId);
  if (!success) {
    throw new AppError(404, "Classwork not found");
  }
}

export async function joinClass(classId, userId) {
  const classObj = await classesRepository.findClassById(classId);
  if (!classObj) {
    throw new AppError(404, "Class not found");
  }

  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (enrollment) {
    throw new AppError(409, "Already enrolled");
  }

  await classesRepository.createEnrollment(userId, classId, "STUDENT");
}

export async function joinClassByCode(code, userId) {
  const normalizedCode = code.trim().toUpperCase();
  let classId = null;

  if (normalizedCode.startsWith("CLASS-")) {
    const parsed = parseInt(normalizedCode.substring(6), 10);
    if (!isNaN(parsed) && parsed > 0) {
      classId = parsed;
    }
  }

  if (!classId) {
    throw new AppError(400, "Invalid class code format");
  }

  const classObj = await classesRepository.findClassById(classId);
  if (!classObj) {
    throw new AppError(404, "Class not found");
  }

  const enrollment = await classesRepository.checkEnrollment(classId, userId);
  if (enrollment) {
    throw new AppError(409, "Already enrolled in this class");
  }

  await classesRepository.createEnrollment(userId, classId, "STUDENT");
}

export async function unenroll(classId, userId) {
  const isOwner = await classesRepository.isClassOwner(classId, userId);
  if (isOwner) {
    throw new AppError(403, "Class owner cannot unenroll from their own class");
  }

  const success = await classesRepository.deleteEnrollment(userId, classId);
  if (!success) {
    throw new AppError(404, "Enrollment not found");
  }
}
