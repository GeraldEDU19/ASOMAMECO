require("dotenv").config();
const mongoose = require("mongoose");
const UserService = require("../services/UserService");

// Helper function to compare values and log expected vs received on mismatch
function assertEqual(received, expected, message) {
  if (received !== expected) {
    console.error(`${message} - Expected: ${expected}, Received: ${received}`);
  }
  expect(received).toBe(expected);
}

let session;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  // Create a new session and start a transaction for each test
  session = await mongoose.startSession();
  session.startTransaction();
});

afterEach(async () => {
  // Rollback the transaction to revert any changes done during the test
  await session.abortTransaction();
  session.endSession();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Service Tests", () => {
  // --- Original Tests ---
  it("Should register a user successfully", async () => {
    const response = await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    assertEqual(response.success, true, "Register user success");
    expect(response.user).toHaveProperty("_id");
    assertEqual(response.user.name, "Gerald Chaves", "User name");
    assertEqual(response.user.email, "gerald@example.com", "User email");
  });

  it("Should not allow duplicate emails", async () => {
    const firstResponse = await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    assertEqual(firstResponse.success, true, "First registration");
    const duplicateResponse = await UserService.register(
      { name: "Duplicate User", email: "gerald@example.com", password: "anotherpassword" },
      session
    );
    assertEqual(duplicateResponse.success, false, "Duplicate email registration");
  });

  it("Should login with valid credentials", async () => {
    await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    const loginResponse = await UserService.login("gerald@example.com", "securepassword", session);
    assertEqual(loginResponse.success, true, "Login success");
    assertEqual(loginResponse.user.email, "gerald@example.com", "Login user email");
  });

  it("Should not login with incorrect password", async () => {
    await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    const loginResponse = await UserService.login("gerald@example.com", "wrongpassword", session);
    assertEqual(loginResponse.success, false, "Login failure with incorrect password");
  });

  it("Should deactivate a user", async () => {
    const registerResponse = await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    assertEqual(registerResponse.success, true, "Registration for deactivation");
    const user = registerResponse.user;
    const deactivateResponse = await UserService.deactivate(user._id, session);
    assertEqual(deactivateResponse.success, true, "Deactivate user success");
    assertEqual(deactivateResponse.user.active, false, "User active status after deactivation");
  });

  it("Should search for users", async () => {
    await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    const searchResponse = await UserService.search({ email: "gerald@example.com" }, session);
    assertEqual(searchResponse.success, true, "Search success");
    assertEqual(searchResponse.users.length, 1, "Search results length");
    assertEqual(searchResponse.users[0].email, "gerald@example.com", "Searched user email");
  });

  it("Should update a user", async () => {
    const registerResponse = await UserService.register(
      { name: "Gerald Chaves", email: "gerald@example.com", password: "securepassword" },
      session
    );
    assertEqual(registerResponse.success, true, "Registration for update");
    const user = registerResponse.user;
    const updateResponse = await UserService.update(user._id, { name: "Updated Name" }, session);
    assertEqual(updateResponse.success, true, "Update user success");
    assertEqual(updateResponse.user.name, "Updated Name", "Updated user name");
  });

  it("Should not update a non-existing user", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const updateResponse = await UserService.update(nonExistingId, { name: "Doesn't exist" }, session);
    assertEqual(updateResponse.success, false, "Non-existing user update failure");
    assertEqual(updateResponse.message, "User not found", "Non-existing user update message");
  });

  // --- Additional Tests ---
  it("Should fail registration when name is missing", async () => {
    const response = await UserService.register(
      { email: "noname@example.com", password: "securepassword" },
      session
    );
    assertEqual(response.success, false, "Registration should fail without name");
  });

  it("Should fail registration when email is missing", async () => {
    const response = await UserService.register(
      { name: "No Email", password: "securepassword" },
      session
    );
    assertEqual(response.success, false, "Registration should fail without email");
  });

  it("Should fail registration when password is missing", async () => {
    const response = await UserService.register(
      { name: "No Password", email: "nopassword@example.com" },
      session
    );
    assertEqual(response.success, false, "Registration should fail without password");
  });

  it("Should fail login for non-existing user", async () => {
    const response = await UserService.login("nonexistent@example.com", "anyPassword", session);
    assertEqual(response.success, false, "Login should fail for non-existing user");
  });

  it("Should search with no matching users", async () => {
    await UserService.register(
      { name: "Existing User", email: "existing@example.com", password: "securepassword" },
      session
    );
    const response = await UserService.search({ email: "nomatch@example.com" }, session);
    assertEqual(response.success, true, "Search should succeed even if no user is found");
    assertEqual(response.users.length, 0, "Search results should be empty when no match exists");
  });

  it("Should update user's email successfully", async () => {
    const regResponse = await UserService.register(
      { name: "User To Update", email: "update@example.com", password: "securepassword" },
      session
    );
    const user = regResponse.user;
    const updateResponse = await UserService.update(user._id, { email: "updated@example.com" }, session);
    assertEqual(updateResponse.success, true, "Update email should succeed");
    assertEqual(updateResponse.user.email, "updated@example.com", "User email should be updated");
  });

  it("Should not deactivate a non-existing user", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const response = await UserService.deactivate(nonExistingId, session);
    assertEqual(response.success, false, "Deactivation should fail for a non-existing user");
    assertEqual(response.message, "User not found", "Proper error message for non-existing user deactivation");
  });

  it("Should handle multiple user registrations and search", async () => {
    await UserService.register(
      { name: "User One", email: "user1@multitest.com", password: "password1" },
      session
    );
    await UserService.register(
      { name: "User Two", email: "user2@multitest.com", password: "password2" },
      session
    );
    await UserService.register(
      { name: "User Three", email: "user3@another.com", password: "password3" },
      session
    );
    const response = await UserService.search({ email: /@multitest\.com$/ }, session);
    assertEqual(response.success, true, "Search for multiple users should succeed");
    assertEqual(response.users.length, 2, "Should find two users with domain multitest.com");
  });

  // --- New Test for Changing Password using a Separate Service ---
  it("Should update user's password successfully using changePassword", async () => {
    const regResponse = await UserService.register(
      { name: "User Password Update", email: "passwordupdate@example.com", password: "oldpassword" },
      session
    );
    const user = regResponse.user;
    // Use changePassword instead of update to properly re-hash the new password
    const changeResponse = await UserService.changePassword(user._id, "newpassword", session);
    assertEqual(changeResponse.success, true, "Change password should succeed");
    // Attempt login with new password should succeed
    const loginNew = await UserService.login("passwordupdate@example.com", "newpassword", session);
    assertEqual(loginNew.success, true, "Login with new password should succeed");
    // Attempt login with old password should fail
    const loginOld = await UserService.login("passwordupdate@example.com", "oldpassword", session);
    assertEqual(loginOld.success, false, "Login with old password should fail");
  });

  it("Should not update user with invalid data", async () => {
    const regResponse = await UserService.register(
      { name: "User Invalid Update", email: "invalidupdate@example.com", password: "securepassword" },
      session
    );
    const user = regResponse.user;
    const updateResponse = await UserService.update(user._id, {}, session);
    assertEqual(updateResponse.success, true, "Update with empty data should succeed");
    assertEqual(updateResponse.user.name, "User Invalid Update", "User name should remain unchanged");
  });
});
