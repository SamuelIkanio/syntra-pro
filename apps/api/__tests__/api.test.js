const request = require("supertest");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { createApp } = require("../src/server");
const { getDb, closeDb, resetDb } = require("../src/db");

let app;
let testDbPath;
let authToken;

beforeAll(() => {
  testDbPath = path.join(os.tmpdir(), `syntra-pro-test-${Date.now()}.db`);
  process.env.SYNTRA_DB_PATH = testDbPath;
  resetDb();
  app = createApp();
});

afterAll(() => {
  closeDb();
  try { fs.unlinkSync(testDbPath); } catch {}
  try { fs.unlinkSync(testDbPath + "-wal"); } catch {}
  try { fs.unlinkSync(testDbPath + "-shm"); } catch {}
});

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe("2.0.0-pro");
  });
});

describe("Root endpoint", () => {
  it("returns API info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("SYNTRA Pro API");
    expect(res.body.company).toBe("Triune Dynamic Limited");
  });
});

describe("POST /api/auth/register", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "test@triune.com", password: "securePass123", name: "Test User" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@triune.com");
    expect(res.body.user.name).toBe("Test User");
    authToken = res.body.token;
  });
  it("rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "test@triune.com", password: "anotherPass1", name: "Dup User" });
    expect(res.status).toBe(409);
  });
  it("rejects invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "not-an-email", password: "securePass123", name: "Bad" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
  it("rejects short password", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "short@test.com", password: "abc", name: "Short" });
    expect(res.status).toBe(400);
  });
  it("rejects missing name", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "noname@test.com", password: "securePass123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "test@triune.com", password: "securePass123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@triune.com");
    authToken = res.body.token;
  });
  it("rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "test@triune.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
  it("rejects non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "ghost@test.com", password: "securePass123" });
    expect(res.status).toBe(401);
  });
  it("validates email format", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "", password: "test" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns user info with valid token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@triune.com");
  });
  it("rejects request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
  it("rejects invalid token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalidtoken123");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/logs (authenticated)", () => {
  it("rejects unauthenticated request", async () => {
    const res = await request(app).post("/api/logs").send({ date: "2026-04-20", energy: 7, mood: 8, stress: 3 });
    expect(res.status).toBe(401);
  });
  it("creates a daily log", async () => {
    const res = await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`)
      .send({ date: "2026-04-20", energy: 7, mood: 8, stress: 3, overallScore: 7.5, symptoms: ["fatigue", "headache"], meals: [{ type: "Breakfast", description: "Oatmeal with fruit", healthScore: 4 }, { type: "Lunch", description: "Grilled chicken salad", healthScore: 5 }] });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.date).toBe("2026-04-20");
  });
  it("validates date format", async () => {
    const res = await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "20-04-2026", energy: 5, mood: 5, stress: 5 });
    expect(res.status).toBe(400);
  });
  it("validates energy range", async () => {
    const res = await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-21", energy: 15, mood: 5, stress: 5 });
    expect(res.status).toBe(400);
  });
  it("validates mood range", async () => {
    const res = await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-21", energy: 5, mood: 0, stress: 5 });
    expect(res.status).toBe(400);
  });
  it("upserts on same date", async () => {
    await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-25", energy: 5, mood: 5, stress: 5, symptoms: ["fatigue"], meals: [] });
    const res = await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-25", energy: 9, mood: 9, stress: 1, symptoms: ["headache"], meals: [] });
    expect(res.status).toBe(201);
    const getRes = await request(app).get("/api/logs/2026-04-25").set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body.energy).toBe(9);
    expect(getRes.body.symptoms).toEqual(["headache"]);
  });
});

describe("GET /api/logs (authenticated)", () => {
  it("returns logs for the authenticated user", async () => {
    const res = await request(app).get("/api/logs").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.logs).toBeDefined();
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });
  it("returns enriched log data", async () => {
    const res = await request(app).get("/api/logs").set("Authorization", `Bearer ${authToken}`);
    const log = res.body.logs.find(l => l.date === "2026-04-20");
    expect(log).toBeDefined();
    expect(log.symptoms).toEqual(expect.arrayContaining(["fatigue", "headache"]));
    expect(log.meals.length).toBe(2);
  });
  it("supports pagination", async () => {
    const res = await request(app).get("/api/logs?limit=1&offset=0").set("Authorization", `Bearer ${authToken}`);
    expect(res.body.logs.length).toBe(1);
  });
  it("supports date filtering", async () => {
    await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-18", energy: 6, mood: 6, stress: 4, symptoms: [], meals: [] });
    const res = await request(app).get("/api/logs?from=2026-04-18&to=2026-04-20").set("Authorization", `Bearer ${authToken}`);
    expect(res.body.logs.length).toBe(2);
  });
});

describe("GET /api/logs/:date (authenticated)", () => {
  it("returns a specific log", async () => {
    const res = await request(app).get("/api/logs/2026-04-20").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.date).toBe("2026-04-20");
    expect(res.body.energy).toBe(7);
  });
  it("returns 404 for non-existent date", async () => {
    const res = await request(app).get("/api/logs/2020-01-01").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
  it("validates date param format", async () => {
    const res = await request(app).get("/api/logs/not-a-date").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/logs/:date (authenticated)", () => {
  it("deletes a log", async () => {
    await request(app).post("/api/logs").set("Authorization", `Bearer ${authToken}`).send({ date: "2026-04-10", energy: 5, mood: 5, stress: 5, symptoms: [], meals: [] });
    const res = await request(app).delete("/api/logs/2026-04-10").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Log deleted successfully");
    const getRes = await request(app).get("/api/logs/2026-04-10").set("Authorization", `Bearer ${authToken}`);
    expect(getRes.status).toBe(404);
  });
  it("returns 404 for non-existent log", async () => {
    const res = await request(app).delete("/api/logs/2020-01-01").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

describe("User isolation", () => {
  let user2Token;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "user2@triune.com", password: "securePass456", name: "User Two" });
    user2Token = res.body.token;
    await request(app).post("/api/logs").set("Authorization", `Bearer ${user2Token}`).send({ date: "2026-04-20", energy: 3, mood: 3, stress: 8, symptoms: [], meals: [] });
  });
  it("user2 cannot see user1 logs", async () => {
    const res = await request(app).get("/api/logs").set("Authorization", `Bearer ${user2Token}`);
    expect(res.body.total).toBe(1);
    expect(res.body.logs[0].energy).toBe(3);
  });
  it("user1 cannot see user2 data on same date", async () => {
    const res = await request(app).get("/api/logs/2026-04-20").set("Authorization", `Bearer ${authToken}`);
    expect(res.body.energy).toBe(7);
  });
});
