import { getBallValues } from "../src/lottery";

describe("getBallValues", () => {
  const MAX = 69;

  it("should generate exactly 5 numbers", () => {
    const values = getBallValues(MAX);
    expect(values).toHaveLength(5);
  });

  it("should not contain duplicates", () => {
    const values = getBallValues(MAX);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it("should generate values between 1 and max (inclusive)", () => {
    const values = getBallValues(MAX);
    values.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(MAX);
    });
  });

  it("should return values in ascending order", () => {
    const values = getBallValues(MAX);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it("should produce different sets across multiple runs", () => {
    const run1 = getBallValues(MAX);
    const run2 = getBallValues(MAX);
    // Not guaranteed, but very likely they differ
    expect(run1.join(",")).not.toEqual(run2.join(","));
  });

  it("should still return 5 values when max is 10", () => {
    const values = getBallValues(10);
    expect(values).toHaveLength(5);
    values.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });
  });

  it("should return all numbers from 1 to 5 when max = 5", () => {
    const values = getBallValues(5);
    expect(values).toEqual([1, 2, 3, 4, 5]); // must be the only valid set
  });

  it("should throw an error when max is less than 5", () => {
    expect(() => getBallValues(4)).toThrow();
  });

  it("should always return valid sets across 50 runs", () => {
    for (let i = 0; i < 50; i++) {
      const values = getBallValues(MAX);
      expect(values).toHaveLength(5);
      expect(new Set(values).size).toBe(5); // unique
      values.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(MAX);
      });
    }
  });

  it("should not allow mutation of returned array to affect subsequent calls", () => {
    const first = getBallValues(MAX);
    first.push(999); // mutate
    const second = getBallValues(MAX);
    expect(second).toHaveLength(5);
    expect(second).not.toContain(999);
  });
});
