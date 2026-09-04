// Runs before every test file. Spins up a real, temporary, in-memory
// MongoDB instance — tests never touch your actual Atlas database.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Test files import routes/controllers directly — they never run index.js,
// which is the only place dotenv.config() gets called. Without this, any
// controller that calls jwt.sign() (signup, login) fails with
// "secretOrPrivateKey must have a value" because JWT_SECRET is undefined.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-jest";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  // Clear all data between tests so one test's data can't affect another
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});
