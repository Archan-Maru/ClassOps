import cron from "node-cron";
import db from "../config/db.js";
import { sendDeadlineReminder } from "../email/email.service.js";

const HOURS_BEFORE = 8;

async function checkAndSendReminders() {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const assignments = await db.query(
      `SELECT a.id, a.title, a.deadline, a.class_id, c.title AS class_title
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       WHERE a.deadline BETWEEN $1 AND $2
         AND a.reminder_sent = false`,
      [windowStart.toISOString(), windowEnd.toISOString()]
    );

    if (assignments.rowCount === 0) return;

    for (const assignment of assignments.rows) {
      const students = await db.query(
        `SELECT u.id, u.email, u.username
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         WHERE e.class_id = $1 AND e.role = 'STUDENT'`,
        [assignment.class_id]
      );

      const alreadySubmitted = await db.query(
        `SELECT user_id FROM submissions WHERE assignment_id = $1`,
        [assignment.id]
      );
      const submittedIds = new Set(alreadySubmitted.rows.map((r) => r.user_id));

      let sentCount = 0;
      for (const student of students.rows) {
        if (submittedIds.has(student.id)) continue;

        const sent = await sendDeadlineReminder(
          student.email,
          student.username,
          assignment.title,
          assignment.class_title,
          assignment.deadline
        );
        if (sent) sentCount++;
      }

      await db.query(
        `UPDATE assignments SET reminder_sent = true WHERE id = $1`,
        [assignment.id]
      );

      if (sentCount > 0) {
        console.log(
          `Sent ${sentCount} reminder(s) for "${assignment.title}" (deadline: ${assignment.deadline})`
        );
      }
    }
  } catch (err) {
    console.error("Reminder job error:", err.message);
  }
}

export function startReminderScheduler() {
  // runs every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    checkAndSendReminders();
  });

  // also run once on startup
  checkAndSendReminders();

  console.log("Deadline reminder scheduler started");
}
