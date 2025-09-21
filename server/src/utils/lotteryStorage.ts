import { promises as fs } from "fs";
import path from "path";

export interface LotterySlip {
  date_generated: string;
  lottery_numbers: number[];
  power_ball: number;
  is_deleted: boolean;
}

const FILE_PATH = path.join(__dirname, "../../lotteryNumbers.json");

// Save a new slip
export async function saveSlip(slip: Omit<LotterySlip, "is_deleted">): Promise<void> {
  const newSlip: LotterySlip = { ...slip, is_deleted: false };

  let slips: LotterySlip[] = [];
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    slips = JSON.parse(data) as LotterySlip[];
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  slips.push(newSlip);
  await fs.writeFile(FILE_PATH, JSON.stringify(slips, null, 2), "utf-8");
}

// Load all slips that are not deleted
export async function loadSlips(): Promise<LotterySlip[]> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    const slips: LotterySlip[] = JSON.parse(data);
    return slips.filter(slip => !slip.is_deleted);
  } catch (err: any) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

// Mark a slip as deleted by index
export async function deleteSlip(index: number): Promise<void> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    const slips: LotterySlip[] = JSON.parse(data);

    if (index >= 0 && index < slips.length) {
      slips[index].is_deleted = true;
      await fs.writeFile(FILE_PATH, JSON.stringify(slips, null, 2), "utf-8");
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}

// Delete all slips
export async function deleteAllSlips(): Promise<void> {
  try {
    await fs.unlink(FILE_PATH);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}
