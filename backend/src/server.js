import "dotenv/config";

import app from "./app.js";
import db from "./config/db.js";
import { startReminderScheduler } from "./jobs/deadlineReminder.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await db.query("SELECT 1");
    console.log("Database ready");

    await db.query(`
      ALTER TABLE assignments
      ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS class_invites (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'PENDING',
        invited_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP
      )
    `);

    startReminderScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
