const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyCommentExists function", () => {
    it("should return true when comment exists", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123";
      const owner = "user-123-comment";

      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding-comment",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });

      const commentId = `comment-123`;
      await pool.query({
        text: "INSERT INTO comments (id, thread_id, content, owner) VALUES ($1, $2, $3, $4)",
        values: [commentId, threadId, "A comment", owner],
      });

      // Action
      const exists =
        await commentRepositoryPostgres.verifyCommentExists(commentId);

      // Assert
      expect(exists).toBe(true);
    });

    it("should return false when comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      // Action
      const exists = await commentRepositoryPostgres.verifyCommentExists(
        "nonexistent-comment",
      );

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe("getCommentOwner function", () => {
    it("should return the correct owner when comment exists", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123";
      const owner = "user-123";

      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });

      const commentId = `comment-123`;
      await pool.query({
        text: "INSERT INTO comments (id, thread_id, content, owner) VALUES ($1, $2, $3, $4)",
        values: [commentId, threadId, "A comment", owner],
      });

      // Action
      const commentOwner =
        await commentRepositoryPostgres.getCommentOwner(commentId);

      // Assert
      expect(commentOwner).toBe(owner);
    });

    it("should throw an error when comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.getCommentOwner("nonexistent-comment"),
      ).rejects.toThrowError("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return an empty array when there are no comments for the given thread id", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      const threadId = "thread-123-empty";

      // Act
      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(0);
    });

    it("should return comments with deleted content marked correctly", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123-del";
      const owner = "user-123-del";

      // Arrange: Add user, thread, and a deleted comment
      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicodingDel",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });
      const commentId = "comment-123-del";
      await pool.query({
        text: `
          INSERT INTO comments (id, thread_id, content, owner, is_delete)
          VALUES ($1, $2, $3, $4, $5)
        `,
        values: [commentId, threadId, "A deleted comment", owner, true],
      });

      // Act
      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments).toStrictEqual([
        {
          id: commentId,
          username: "dicodingDel",
          date: expect.any(Date),
          content: "A deleted comment",
          is_delete: true,
        },
      ]);
    });
  });
});
