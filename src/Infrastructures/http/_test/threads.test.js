const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
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

  // New test scenario for deleting comments
  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should respond 200 when the comment is successfully deleted", async () => {
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

      // Add a comment
      const addCommentResponse = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const {
        data: { addedComment },
      } = JSON.parse(addCommentResponse.payload);

      // Action: Delete the comment
      const deleteResponse = await server.inject({
        method: "DELETE",
        url: `/threads/thread-123/comments/${addedComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(200);
      expect(deleteResponseJson.status).toEqual("success");
    });
    it("should respond 404 when the comment does not exist", async () => {
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

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      // Action: Attempt to delete a non-existent comment
      const deleteResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/nonexistent-comment`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(404);
      expect(deleteResponseJson.status).toEqual("fail");
      expect(deleteResponseJson.message).toBeDefined();
    });
    it("should respond 403 when the user is not the owner of the comment", async () => {
      const server = await createServer(container);

      // Arrange: Add two users, thread, and comment
      const userPayload1 = {
        username: "user1",
        password: "secret",
        fullname: "User One",
      };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload1,
      });

      const loginResponse1 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload1.username,
          password: userPayload1.password,
        },
      });

      const {
        data: { accessToken: accessToken1 },
      } = JSON.parse(loginResponse1.payload);

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "A comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      const userPayload2 = {
        username: "user2",
        password: "secret",
        fullname: "User Two",
      };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload2,
      });

      const loginResponse2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload2.username,
          password: userPayload2.password,
        },
      });

      const {
        data: { accessToken: accessToken2 },
      } = JSON.parse(loginResponse2.payload);

      // Action: User 2 attempts to delete User 1's comment
      const deleteResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const deleteResponseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(403);
      expect(deleteResponseJson.status).toEqual("fail");
      expect(deleteResponseJson.message).toBeDefined();
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should respond 200 and return thread details when the thread exists", async () => {
      const server = await createServer(container);

      // Arrange: Add user, thread, and comments
      const userPayload = {
        username: "dicodingGetThread",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const postUserResponse = await server.inject({
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

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread title",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "This is a comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action: Retrieve thread details
      const response = await server.inject({
        method: "GET",
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(addedThread.id);
      expect(responseJson.data.thread.title).toEqual("A thread title");
      expect(responseJson.data.thread.body).toEqual("Thread body");
      expect(responseJson.data.thread.username).toEqual("dicodingGetThread");
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toEqual(addedComment.id);
      expect(responseJson.data.thread.comments[0].content).toEqual(
        "This is a comment",
      );
    });

    it("should respond 404 when the thread does not exist", async () => {
      const server = await createServer(container);

      // Action: Retrieve a non-existent thread
      const response = await server.inject({
        method: "GET",
        url: "/threads/nonexistent-thread",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });
  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should respond 201 and persist reply when request is valid", async () => {
      const server = await createServer(container);

      // Arrange: Add user, thread, and comment
      const userPayload = {
        username: "dicodingReplies",
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

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "A comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action: Add a reply
      const requestPayload = { content: "A reply to the comment" };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content,
      );
    });

    it("should respond 400 when request payload is invalid", async () => {
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

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: "A comment" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Send invalid payload
      const invalidPayload = {}; // Missing `content`
      const response = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: invalidPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 404 when the thread or comment does not exist", async () => {
      const server = await createServer(container);

      // Arrange: Add user
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

      // Action: Add a reply to non-existent thread or comment
      const requestPayload = { content: "A reply" };
      const response = await server.inject({
        method: "POST",
        url: `/threads/nonexistent-thread/comments/nonexistent-comment/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 401 when no access token is provided", async () => {
      const server = await createServer(container);

      // Action: Add a reply without a valid token
      const requestPayload = { content: "A reply" };
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-123/comments/comment-123/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });
  });
  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should respond 200 when the reply is successfully deleted", async () => {
      const server = await createServer(container);

      // Arrange
      const userPayload = {
        username: `dicodingDelReply`,
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      // Create user and login
      const postUser = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload,
      });

      const userId = postUser.result.data.addedUser.id;

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

      // Add thread, comment, and reply
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: userId, // Use the correct user ID
        threadId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: "A reply",
        owner: userId, // Use the correct user ID
        commentId,
      });

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should respond 403 when the user is not the owner of the reply", async () => {
      const server = await createServer(container);

      // Arrange
      const userPayload1 = {
        username: `ownerUser`,
        password: "secret",
        fullname: "Owner User",
      };

      const userPayload2 = {
        username: `otherUser`,
        password: "secret",
        fullname: "Other User",
      };

      // Create users and login
      const postUser1 = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload1,
      });
      const ownerId = postUser1.result.data.addedUser.id;

      const postUser2 = await server.inject({
        method: "POST",
        url: "/users",
        payload: userPayload2,
      });
      const otherUserId = postUser2.result.data.addedUser.id;

      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: userPayload2.username,
          password: userPayload2.password,
        },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Add thread, comment, and reply as ownerUser
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner: ownerId,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: ownerId,
        threadId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: "A reply",
        owner: ownerId,
        commentId,
      });

      // Act: otherUser attempts to delete the reply
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 404 when the thread, comment, or reply does not exist", async () => {
      const server = await createServer(container);

      // Arrange
      const userPayload = {
        username: "dicoding404",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      const postUser = await server.inject({
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

      // Act: Attempt to delete a non-existent reply
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/nonexistent-thread/comments/nonexistent-comment/replies/nonexistent-reply",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });
  describe("when PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should respond 200 and toggle the like state", async () => {
      const server = await createServer(container);

      // Arrange: Add user, thread, and comment
      const userPayload = {
        username: "dicodingLikes",
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

      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "A thread",
          body: "Thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: "A comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action: Like the comment
      const likeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const likeResponseJson = JSON.parse(likeResponse.payload);

      // Assert
      expect(likeResponse.statusCode).toEqual(200);
      expect(likeResponseJson.status).toEqual("success");

      // Action: Unlike the comment
      const unlikeResponse = await server.inject({
        method: "PUT",
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const unlikeResponseJson = JSON.parse(unlikeResponse.payload);

      // Assert
      expect(unlikeResponse.statusCode).toEqual(200);
      expect(unlikeResponseJson.status).toEqual("success");
    });

    it("should respond 401 when no access token is provided", async () => {
      const server = await createServer(container);

      // Action: Like a comment without an access token
      const response = await server.inject({
        method: "PUT",
        url: "/threads/thread-123/comments/comment-123/likes",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });

    it("should respond 404 when the thread or comment does not exist", async () => {
      const server = await createServer(container);

      // Arrange: Add user
      const userPayload = {
        username: "dicoding404",
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

      // Action: Attempt to like a non-existent comment
      const response = await server.inject({
        method: "PUT",
        url: "/threads/nonexistent-thread/comments/nonexistent-comment/likes",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
  });
});
