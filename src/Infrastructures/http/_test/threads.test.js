const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const { log, error } = require("console");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
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
      // Arrange: Create a user and login to get access token
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

      // Missing `body` in the payload
      const requestPayload = {
        title: "sebuah thread",
      };

      // Action
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
    it("should respond 400 when request payload does not meet data type specification", async () => {
      // Arrange: Create a user and login to get access token
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

      // Invalid data type: `body` should be a string
      const requestPayload = {
        title: "sebuah thread",
        body: 123, // Invalid data type
      };

      // Action
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
    it("should respond 401 when no access token is provided", async () => {
      // Arrange: Prepare the server
      const server = await createServer(container);

      // Payload without access token
      const requestPayload = {
        title: "sebuah thread",
        body: "isi sebuah thread",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        // No Authorization header
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });
  });
});
