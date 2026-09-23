import { describe, expect, test } from "vitest";

describe("Task Tracker API", () => {
  test("connects successfully to backend health API", async () => {
    const response = await fetch(
      "http://localhost:5000/api/health"
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Backend is healthy");
  });
});