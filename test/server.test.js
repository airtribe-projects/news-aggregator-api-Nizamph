const tap = require("tap");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../src/config/db");
const User = require("../src/models/userModel");

const server = supertest(app);
const testRunId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const mockUser = {
  name: `Clark Kent ${testRunId}`,
  email: `clark.${testRunId}@superman.com`,
  password: "Krypt()n8",
  preferences: ["movies", "comics"],
};

let token = "";

tap.before(async () => {
  await connectDB();
  await User.deleteMany({
    $or: [{ email: mockUser.email }, { name: mockUser.name }],
  });
});

// Auth tests

tap.test("POST /users/signup", async (t) => {
  const response = await server.post("/users/signup").send(mockUser);
  t.equal(response.status, 200);
  t.end();
});

tap.test("POST /users/signup with missing email", async (t) => {
  const response = await server.post("/users/signup").send({
    name: mockUser.name,
    password: mockUser.password,
  });
  t.equal(response.status, 400);
  t.end();
});

tap.test("POST /users/login", async (t) => {
  const response = await server.post("/users/login").send({
    email: mockUser.email,
    password: mockUser.password,
  });
  if (response.status !== 200) {
    t.comment(`Login failed response: ${JSON.stringify(response.body)}`);
  }
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "token");
  token = response.body.token;
  t.end();
});

tap.test("POST /users/login with wrong password", async (t) => {
  const response = await server.post("/users/login").send({
    email: mockUser.email,
    password: "wrongpassword",
  });
  t.equal(response.status, 401);
  t.end();
});

// Preferences tests

tap.test("GET /users/preferences", async (t) => {
  const response = await server
    .get("/users/preferences")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "preferences");
  t.same(response.body.preferences, mockUser.preferences);
  t.end();
});

tap.test("GET /users/preferences without token", async (t) => {
  const response = await server.get("/users/preferences");
  t.equal(response.status, 401);
  t.end();
});

tap.test("PUT /users/preferences", async (t) => {
  const response = await server
    .put("/users/preferences")
    .set("Authorization", `Bearer ${token}`)
    .send({
      preferences: ["movies", "comics", "games"],
    });
  t.equal(response.status, 200);
});

tap.test("Check PUT /users/preferences", async (t) => {
  const response = await server
    .get("/users/preferences")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.same(response.body.preferences, ["movies", "comics", "games"]);
  t.end();
});

// News tests

tap.test("GET /news", async (t) => {
  const response = await server
    .get("/news")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  console.log("News response in test:====", response.body);
  t.hasOwnProp(response.body, "news");
  t.end();
});

tap.test("GET /news without token", async (t) => {
  const response = await server.get("/news");
  t.equal(response.status, 401);
  t.end();
});

tap.teardown(async () => {
  await User.deleteMany({
    $or: [{ email: mockUser.email }, { name: mockUser.name }],
  });
  await mongoose.connection.close();
});
