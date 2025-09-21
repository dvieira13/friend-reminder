import request from "supertest";
import app from "../src/index";

describe("Powerball API", () => {
  it("should generate a new slip", async () => {
    const res = await request(app).get("/api/generate-powerball-slip");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("lottery_numbers");
    expect(res.body).toHaveProperty("power_ball");
    expect(res.body.lottery_numbers.length).toBe(5);
  });

  it("should load all slips", async () => {
    const res = await request(app).get("/api/load-powerball-slips");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should delete slip at index 0", async () => {
    const res = await request(app).delete("/api/delete-powerball-slip/0");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should delete all slips", async () => {
    const res = await request(app).delete("/api/delete-powerball-slips");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "All slips deleted" });
  });
});
