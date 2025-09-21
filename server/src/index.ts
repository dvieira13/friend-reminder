import express, { Request, Response } from "express";
import cors from "cors";
import { getRandomNumber, getBallValues } from "./lottery";
import {
  saveSlip,
  loadSlips,
  deleteSlip,
  deleteAllSlips,
  LotterySlip
} from "./utils/lotteryStorage";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

//generates powerball slip
app.get("/api/generate-powerball-slip", async (req: Request, res: Response) => {
  try {
    const ball_values: number[] = getBallValues(69);
    const powerball_value = getRandomNumber(26);

    const slip: Omit<LotterySlip, "is_deleted"> = {
      date_generated: new Date().toISOString(),
      lottery_numbers: ball_values,
      power_ball: powerball_value,
    };
    console.log(slip);
    await saveSlip(slip);
    res.json(slip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate slip" });
  }
});

// Load all slips
app.get("/api/load-powerball-slips", async (req: Request, res: Response) => {
  try {
    const slips = await loadSlips();
    res.json(slips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load slips" });
  }
});

// Delete a slip by index
app.delete("/api/delete-powerball-slip/:index", async (req: Request, res: Response) => {
  try {
    const index = parseInt(req.params.index);
    await deleteSlip(index);
    res.json({ message: `Slip ${index} marked as deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete slip" });
  }
});

// Delete all slips
app.delete("/api/delete-powerball-slips", async (req: Request, res: Response) => {
  try {
    await deleteAllSlips();
    res.json({ message: "All slips deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete slips" });
  }
});

// start server only if run directly (not during tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;