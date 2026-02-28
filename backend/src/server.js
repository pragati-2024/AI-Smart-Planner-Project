import "dotenv/config";

import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_smart_planner";

async function main() {
  await connectDb(MONGODB_URI);

  const app = createApp();

  app.listen(PORT, () => {
    // Keep log minimal
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
