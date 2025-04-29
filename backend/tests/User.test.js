// tests/UserService.test.js

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserService = require("../services/UserService");
const User = require("../models/User");

// Mock the email sender to avoid real emails during tests
jest.mock("../utils/sendEmail", () =>
  jest.fn((to, subject, text) =>
    Promise.resolve({ messageId: "test-message-id", info: "Email sent successfully" })
  )
);

/**
 * Helper to compare and assert
 */
function assertEqual(funcName, data, received, expected, message) {
  if (received !== expected) {
    console.error(`Function: ${funcName}`);
    console.error(`Data: ${JSON.stringify(data, null, 2)}`);
    console.error(message);
    console.error("Expected:", expected);
    console.error("Received:", received);
  } else {
    console.log(`${funcName} – ${message}: Success`);
  }
  expect(received).toBe(expected);
}

let session;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  session = await mongoose.startSession();
  session.startTransaction();
});

afterEach(async () => {
  await session.abortTransaction();
  session.endSession();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Service Tests", () => {
  const baseUser = {
    name: "Gerald Chaves",
    email: "gerald@example.com",
    password: "securepassword"
  };

  it("should register a user successfully", async () => {
    const response = await UserService.register({ ...baseUser }, session);
    assertEqual("register", baseUser, response.success, true, "Register user success");
    expect(response.user).toHaveProperty("_id");
  });

  it("should not allow duplicate emails", async () => {
    await UserService.register({ ...baseUser }, session);
    const dupData = { name: "Duplicate", email: baseUser.email, password: "otherpassword" };
    const response = await UserService.register(dupData, session);
    expect(response.success).toBe(false);
  });

  it("should login with valid credentials", async () => {
    await UserService.register({ ...baseUser }, session);
    const response = await UserService.login(baseUser.email, baseUser.password, session);
    assertEqual("login", baseUser, response.success, true, "Login success");
    expect(response.data).toHaveProperty("token");
  });

  it("should not login with wrong password", async () => {
    await UserService.register({ ...baseUser }, session);
    const response = await UserService.login(baseUser.email, "wrongpassword", session);
    assertEqual("login", baseUser, response.success, false, "Login fails with wrong password");
  });

  it("should fail login for non-existing user", async () => {
    const response = await UserService.login("no@exist.com", "password", session);
    assertEqual("login", {}, response.success, false, "Login fails for non-existent user");
  });

  it("should search for users", async () => {
    await UserService.register({ ...baseUser }, session);
    const response = await UserService.search({ email: baseUser.email }, session);
    assertEqual("search", {}, response.success, true, "Search success");
    expect(response.users.length).toBe(1);
    assertEqual("search", {}, response.users[0].email, baseUser.email, "User email matches");
  });

  it("should update a user successfully", async () => {
    const reg = await UserService.register({ ...baseUser }, session);
    const updateData = { name: "Updated Name" };
    const response = await UserService.update(reg.user._id, updateData, session);
    assertEqual("update", updateData, response.success, true, "Update success");
    expect(response.user.name).toBe("Updated Name");
  });

  it("should deactivate a user", async () => {
    const reg = await UserService.register({ ...baseUser }, session);
    const response = await UserService.deactivate(reg.user._id, session);
    assertEqual("deactivate", {}, response.success, true, "Deactivate success");
    expect(response.user.active).toBe(false);
  });

  it("should fail update for non-existing user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await UserService.update(fakeId, { name: "New" }, session);
    expect(response.success).toBe(false);
  });

  it("should handle password change correctly", async () => {
    const reg = await UserService.register({ ...baseUser }, session);
    const response = await UserService.changePassword(reg.user._id, "newpassword", session);
    assertEqual("changePassword", {}, response.success, true, "Password change success");

    const loginOld = await UserService.login(baseUser.email, baseUser.password, session);
    assertEqual("loginOld", {}, loginOld.success, false, "Old password fails after change");

    const loginNew = await UserService.login(baseUser.email, "newpassword", session);
    assertEqual("loginNew", {}, loginNew.success, true, "New password succeeds");
  });

  it("should validate token successfully", async () => {
    const reg = await UserService.register({ ...baseUser }, session);
    const login = await UserService.login(baseUser.email, baseUser.password, session);

    const result = await UserService.validateToken(login.data.token);
    assertEqual("validateToken", {}, result.success, true, "Token validation success");
    expect(result.data).toHaveProperty("id");
  });

  it("should fail token validation for invalid token", async () => {
    const result = await UserService.validateToken("invalid.token.here");
    assertEqual("validateToken", {}, result.success, false, "Invalid token validation fails");
  });

  describe("Password Recovery Tests", () => {
    it("should request password recovery", async () => {
      const reg = await UserService.register({ ...baseUser }, session);
      const response = await UserService.requestPasswordRecovery(baseUser.email, session);
      assertEqual("requestPasswordRecovery", {}, response.success, true, "Password recovery request success");
    });

    it("should fail password recovery request for unknown email", async () => {
      const response = await UserService.requestPasswordRecovery("unknown@example.com", session);
      assertEqual("requestPasswordRecovery", {}, response.success, false, "Password recovery for unknown email fails");
    });

    it("should reset password with valid token", async () => {
      const reg = await UserService.register({ ...baseUser }, session);
      const login = await UserService.login(baseUser.email, baseUser.password, session);

      const reset = await UserService.resetPassword(login.data.token, "resetpassword", session);
      assertEqual("resetPassword", {}, reset.success, true, "Reset password success");

      const loginNew = await UserService.login(baseUser.email, "resetpassword", session);
      assertEqual("loginNew", {}, loginNew.success, true, "Login with reset password");
    });

    it("should fail reset password with invalid token", async () => {
      const reset = await UserService.resetPassword("invalid.token.here", "password", session);
      assertEqual("resetPassword", {}, reset.success, false, "Reset password with invalid token fails");
    });
  });
});
