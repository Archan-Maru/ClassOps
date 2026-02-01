import "dotenv/config";

import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await db.query("SELECT 1");
    console.log("Database ready");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
