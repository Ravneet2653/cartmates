import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import productRoutes from "../routes/productRoutes.js";
import User from "../models/User.js";
import { errorHandler, notFound } from "../middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);
app.use(notFound);
app.use(errorHandler);

const makeToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Product routes", () => {
  test("GET /api/products is public — no token required", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  test("POST /api/products with no token is rejected (401)", async () => {
    const res = await request(app).post("/api/products").send({ name: "Test", price: 100 });
    expect(res.status).toBe(401);
  });

  test("POST /api/products as a regular (non-admin) user is rejected (403)", async () => {
    const user = await User.create({ name: "Regular", email: "regular@test.com", password: "hash", role: "user" });
    const token = makeToken(user._id);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Product", price: 500 });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin/i);
  });

  test("POST /api/products as an admin succeeds (201)", async () => {
    const admin = await User.create({ name: "Admin", email: "admin@test.com", password: "hash", role: "admin" });
    const token = makeToken(admin._id);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Product", price: 500 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Product");
  });

  test("GET /api/products?search= filters by name, case-insensitively", async () => {
    const admin = await User.create({ name: "Admin", email: "admin2@test.com", password: "hash", role: "admin" });
    const token = makeToken(admin._id);
    await request(app).post("/api/products").set("Authorization", `Bearer ${token}`).send({ name: "Denim Jacket", price: 2499 });
    await request(app).post("/api/products").set("Authorization", `Bearer ${token}`).send({ name: "White T-Shirt", price: 599 });

    const res = await request(app).get("/api/products?search=denim");
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe("Denim Jacket");
  });
});
