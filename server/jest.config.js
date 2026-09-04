export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 20000, // mongodb-memory-server's first run downloads a binary — can be slow once, fast after
  transform: {},
};
