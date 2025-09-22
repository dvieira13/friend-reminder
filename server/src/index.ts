import express, { Request, Response } from "express";
import cors from "cors";
import friendContactsRouter from "./friendContact";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());
// backend router
app.use("/api/friend-contacts", friendContactsRouter);

// start server only if run directly (not during tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;