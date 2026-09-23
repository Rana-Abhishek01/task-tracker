const request = require("supertest");
const app = require("../src/app");

describe("Task Tracker API", () => {
  test("GET /api/health should return backend health status", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Backend is healthy"
    );
  });

  test("GET / should return API running message", async () => {
    const response = await request(app)
      .get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Task Tracker API is running"
    );
  });
});