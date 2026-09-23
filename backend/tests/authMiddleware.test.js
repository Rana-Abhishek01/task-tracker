import { beforeAll, describe, expect, test, vi } from "vitest";
import jwt from "jsonwebtoken";
import authMiddleware from "../src/middleware/authMiddleware.js";

describe("Auth Middleware", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  test("should return 401 when authorization header is missing", () => {
    const req = {
      headers: {},
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication token is required",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when token is invalid", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should verify valid token and call next", () => {
    const payload = {
      id: 1,
      email: "test@example.com",
      role: "user",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject(payload);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});