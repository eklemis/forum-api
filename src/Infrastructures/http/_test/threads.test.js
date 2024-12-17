const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterAll(async () => {
    // Close the pool once all tests are completed
    await pool.end();
  });

  afterEach(async () => {
    // Clean up after each test
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should respond 201 and persist thread when request is valid", async () => {
      // Arrange
      const server = await createServer(container);

      // Create a new user
      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const userResponse = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      // Log in to get access token
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Prepare a valid thread payload
      const requestPayload = {
        title: "sebuah thread",
        body: "isi sebuah thread",
      };

      // Action: Send POST /threads request with the access token
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it("should respond 400 when request payload is missing required property", async () => {
      // Arrange
      const server = await createServer(container);
      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      const requestPayload = { title: "sebuah thread" }; // Missing body

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 401 when no access token is provided", async () => {
      const server = await createServer(container);
      const requestPayload = {
        title: "sebuah thread",
        body: "isi sebuah thread",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });
  });

  // New test scenario for adding comments
  describe("when POST /threads/{threadId}/comments", () => {
    it("should respond 201 and persist comment when request is valid", async () => {
      const server = await createServer(container);

      // Arrange: Add user and thread
      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload.username,
          password: userPayload.password,
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Retrieve the user ID dynamically
      const users = await UsersTableTestHelper.findUsersByUsername("dicoding");
      const userId = users[0].id;

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "A valid thread title",
        body: "This is the body of a thread",
        owner: userId,
      });

      const requestPayload = { content: "This is a comment" };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(
        requestPayload.content,
      );
    });
  });
});
