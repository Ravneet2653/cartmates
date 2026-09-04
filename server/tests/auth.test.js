import request from "supertest";
import express from "express";
import authRoutes from "../routes/authRoutes.js";
import { errorHandler, notFound } from "../middleware/errorHandler.js";

// A minimal app with just the auth routes — no need to spin up sockets,
// Gemini, or anything unrelated to what these tests actually check.
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

describe("Auth routes", () => {
  const testUser = { name: "Test User", email: "test@example.com", password: "password123" };

  test("POST /api/auth/signup creates a user and returns a token", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe("user"); // never admin by default
    expect(res.body.user.password).toBeUndefined(); // never returned, hashed or not
  });

  test("POST /api/auth/signup rejects a duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already in use/i);
  });

  test("POST /api/auth/signup ignores a client-supplied role", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...testUser, role: "admin" }); // attempted privilege escalation
    expect(res.body.user.role).toBe("user"); // must be ignored, not honored
  });

  test("POST /api/auth/login succeeds with correct credentials", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login fails with wrong password", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("POST /api/auth/login fails with a nonexistent email — same message as wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
